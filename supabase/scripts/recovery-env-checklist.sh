#!/usr/bin/env bash
# GuardianHub — Recovery Project Safety Pre-Flight Checklist
# Phase 22D recovery tooling
#
# Run this against a recovery project BEFORE enabling any traffic or integrations.
# Pass the recovery project's connection details via environment variables only.
# Never commit credentials.
#
# Usage:
#   RECOVERY_DB_URL="postgresql://postgres.[REF]:[PASS]@aws-0-us-east-1.pooler.supabase.com:5432/postgres" \
#   bash supabase/scripts/recovery-env-checklist.sh

set -euo pipefail

echo "========================================"
echo " GuardianHub Recovery Safety Checklist"
echo " $(date -u '+%Y-%m-%d %H:%M:%S UTC')"
echo "========================================"
echo ""

if [ -z "${RECOVERY_DB_URL:-}" ]; then
  echo "ERROR: RECOVERY_DB_URL is not set."
  echo "       Pass the recovery project SESSION POOLER connection string."
  echo "       Never commit credentials to the repository."
  exit 1
fi

PASS=0
FAIL=0

check() {
  local description="$1"
  local result="$2"
  if [ "$result" = "PASS" ]; then
    echo "  [PASS] $description"
    PASS=$((PASS + 1))
  else
    echo "  [FAIL] $description — $result"
    FAIL=$((FAIL + 1))
  fi
}

echo "--- Cron jobs disabled ---"
ACTIVE_CRON=$(psql "$RECOVERY_DB_URL" -t -c "SELECT count(*) FROM cron.job WHERE active = true;" 2>/dev/null | tr -d ' ')
if [ "$ACTIVE_CRON" = "0" ]; then
  check "All pg_cron jobs disabled" "PASS"
else
  check "All pg_cron jobs disabled" "FAIL: $ACTIVE_CRON jobs still active — run: UPDATE cron.job SET active = false;"
fi

echo ""
echo "--- Security definer function grants ---"
EXPOSED_FUNCS=$(psql "$RECOVERY_DB_URL" -t -c "
  SELECT count(*) FROM pg_proc p
  JOIN pg_namespace n ON n.oid = p.pronamespace
  WHERE n.nspname = 'public'
    AND p.prosecdef
    AND (array_to_string(p.proacl::text[], ',') LIKE '%=X%'
      OR p.proacl IS NULL);
" 2>/dev/null | tr -d ' ')
if [ "$EXPOSED_FUNCS" = "0" ]; then
  check "No SECURITY DEFINER functions with PUBLIC/anon EXECUTE" "PASS"
else
  check "No SECURITY DEFINER functions with PUBLIC/anon EXECUTE" "FAIL: $EXPOSED_FUNCS exposed — apply migration 028"
fi

echo ""
echo "--- RLS enabled ---"
TABLES_WITHOUT_RLS=$(psql "$RECOVERY_DB_URL" -t -c "
  SELECT count(*) FROM pg_class c
  JOIN pg_namespace n ON n.oid = c.relnamespace
  WHERE n.nspname = 'public' AND c.relkind = 'r' AND NOT c.relrowsecurity;
" 2>/dev/null | tr -d ' ')
if [ "$TABLES_WITHOUT_RLS" = "0" ]; then
  check "RLS enabled on all public tables" "PASS"
else
  check "RLS enabled on all public tables" "FAIL: $TABLES_WITHOUT_RLS tables missing RLS"
fi

echo ""
echo "--- Recovery markers ---"
PRE_MARKERS=$(psql "$RECOVERY_DB_URL" -t -c "
  SELECT count(*) FROM companies WHERE name LIKE '_DRILL_MARKER_TENANT_%';
" 2>/dev/null | tr -d ' ')
POST_MARKER=$(psql "$RECOVERY_DB_URL" -t -c "
  SELECT count(*) FROM companies WHERE name = '_DRILL_MARKER_POST_RESTORE_20260813';
" 2>/dev/null | tr -d ' ')

if [ "$PRE_MARKERS" = "2" ]; then
  check "Pre-restore recovery markers present (Tenant A + B)" "PASS"
else
  check "Pre-restore recovery markers present" "FAIL: found $PRE_MARKERS (expected 2)"
fi

if [ "$POST_MARKER" = "0" ]; then
  check "Post-restore-point marker absent (correct recovery boundary)" "PASS"
else
  check "Post-restore-point marker absent" "FAIL: post-restore marker found — recovery boundary may be wrong"
fi

echo ""
echo "--- Auth users ---"
AUTH_USERS=$(psql "$RECOVERY_DB_URL" -t -c "SELECT count(*) FROM auth.users;" 2>/dev/null | tr -d ' ')
check "Auth users restored (expected 5 for current source)" "$([ "$AUTH_USERS" = "5" ] && echo PASS || echo "FAIL: found $AUTH_USERS, expected 5")"

echo ""
echo "========================================"
echo " Results: $PASS passed, $FAIL failed"
echo "========================================"

if [ $FAIL -gt 0 ]; then
  echo ""
  echo "DO NOT activate this recovery project until all checks pass."
  exit 1
else
  echo ""
  echo "All checks passed. Proceed with application smoke test."
  echo "Remember: verify Storage checksums, Stripe test mode, and n8n before enabling traffic."
  exit 0
fi