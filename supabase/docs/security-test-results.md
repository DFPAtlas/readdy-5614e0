# Security Test Results — GuardianHub Phase 1B

## Test Execution Summary

Tests are manual SQL verification queries located in `supabase/tests/`. Run them in the Supabase SQL Editor.

## Test Files

| Test File | Tests | Status |
|-----------|-------|--------|
| rls_tenant_isolation_test.sql | 10 tests | Ready to run |
| role_escalation_test.sql | 9 tests | Ready to run |
| storage_security_test.sql | 4 tests | Ready to run |
| edge_function_auth_test.md | Manual API tests | See below |
| agent_proxy_security_test.md | Manual API tests | See below |

## RLS Tenant Isolation Tests

1. All tables have RLS enabled — EXPECT: 0 tables without RLS
2. No wide-open SELECT policies — EXPECT: 0 results
3. Security helper functions exist — EXPECT: 18 functions
4. Protected field triggers — EXPECT: 11+ triggers
5. Company-owned tables have company_id — EXPECT: Present
6. users has status field — EXPECT: Present
7. RPC functions exist — EXPECT: 6 functions
8. Billing tables super_admin only — EXPECT: is_super_admin() in all policies
9. company_secrets inaccessible — EXPECT: false policy
10. webhook_debug_log has RLS — EXPECT: rowsecurity = true

## Role Escalation Tests

1. Super_admin INSERT blocked — EXPECT: RESTRICTIVE policy
2. Super_admin UPDATE blocked — EXPECT: RESTRICTIVE policy
3. Companies UPDATE admin-only — EXPECT: company_id check
4. Billing tables super_admin — EXPECT: is_super_admin() policies
5. admin_activity_log protected — EXPECT: super_admin policy
6. company_enabled_modules super_admin — EXPECT: is_super_admin()
7. Guard certifications restricted — EXPECT: guard sees own
8. Guard vetting hidden from guards — EXPECT: admin only
9. Guard performance hidden from guards — EXPECT: admin only

## Edge Function Auth (Manual API Tests)

Use curl or Postman to verify:

```bash
# TEST: Unauthenticated access should fail
curl -X POST https://[project]/functions/v1/admin-invite-user \
  -H "Content-Type: application/json" \
  -d '{"email":"test@test.com","role":"guard"}'
# EXPECT: 401 "Authentication required"

# TEST: Guard should not invite users
curl -X POST https://[project]/functions/v1/admin-invite-user \
  -H "Authorization: Bearer [guard_token]" \
  -H "Content-Type: application/json" \
  -d '{"email":"test@test.com","role":"guard"}'
# EXPECT: 403

# TEST: Non-super-admin cannot invite super_admin
curl -X POST https://[project]/functions/v1/admin-invite-user \
  -H "Authorization: Bearer [company_admin_token]" \
  -H "Content-Type: application/json" \
  -d '{"email":"test@test.com","role":"super_admin"}'
# EXPECT: 403

# TEST: has-permission no longer accepts browser-supplied user_id
curl -X POST https://[project]/functions/v1/has-permission \
  -H "Authorization: Bearer [token]" \
  -H "Content-Type: application/json" \
  -d '{"user_id":"malicious-uuid","company_id":"other-company","permission_key":"dashboard"}'
# EXPECT: Ignores submitted IDs, uses token identity

# TEST: Agent proxy requires auth
curl -X POST https://[project]/functions/v1/guardianhub-agent-proxy \
  -H "Content-Type: application/json" \
  -d '{"agent_key":"test"}'
# EXPECT: 401
```

## Agent Proxy Security Tests

1. Unauthenticated request → 401
2. Invalid agent_key → 404
3. Inactive agent → 404
4. Path traversal in webhook_path → 400
5. Absolute URL in webhook_path → 400
6. Oversized payload → 413
7. n8n timeout → 502
8. Internal URLs not leaked → Check response body

## Vulnerabilities Fixed (Phase 1B)

| Vulnerability | Severity | Fix |
|--------------|----------|-----|
| admin-invite-user: No auth | Critical | JWT auth + role check |
| has-permission: Trusts browser IDs | Critical | Derives from JWT |
| ops-copilot: Trusts browser IDs | Critical | Derives from JWT |
| sos-emergency: Trusts browser IDs | Critical | Derives guard from JWT |
| agent-proxy: No auth | Critical | JWT auth + n8n signing |
| acs-audit: No auth | High | JWT auth + company check |
| ai-sick-cover: No auth | High | JWT auth + company check |
| compliance-expiry: No auth | High | JWT auth + scheduler secret |
| Wildcard CORS on all functions | High | Origin allowlist |
| acs_audit_findings: WITH CHECK(true) | High | Company membership check |
| acs_audit_runs: WITH CHECK(true) | High | Company membership check |
| agent_execution_logs: USING(true) | High | Policy removed |
| No active status check in helpers | Medium | Added to all helpers |
| Guard HR data visible to guards | Medium | Restricted to admins |
| webhook_debug_log: No RLS | Medium | RLS enabled |

## Deferred Risks

| Risk | Reason | Phase |
|------|--------|-------|
| Rate limiting not implemented | Requires infrastructure | Phase 2 |
| ops-signup bot protection | Needs CAPTCHA integration | Phase 2 |
| Full storage policy audit | 50+ storage policies to review | Phase 2 |
| Scheduled function secret rotation | Needs secrets manager | Phase 2 |
| Penetration testing | Requires external testing | Phase 2 |
| Next.js frontend n8n references | Code audit needed | Phase 2 |