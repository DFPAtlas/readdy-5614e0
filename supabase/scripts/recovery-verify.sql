-- GuardianHub — Post-Restore Verification Queries
-- Run against the RECOVERY PROJECT only, never production.
-- Phase 22D — 2026-08-13

-- ============================================================
-- 1. Basic schema integrity
-- ============================================================

SELECT
  'tables'    AS object_type,
  count(*)    AS count
FROM information_schema.tables
WHERE table_schema NOT IN ('pg_catalog','information_schema')

UNION ALL

SELECT
  'views',
  count(*)
FROM information_schema.views
WHERE table_schema NOT IN ('pg_catalog','information_schema')

UNION ALL

SELECT
  'functions',
  count(*)
FROM pg_proc p
JOIN pg_namespace n ON n.oid = p.pronamespace
WHERE n.nspname NOT IN ('pg_catalog','information_schema')

UNION ALL

SELECT
  'triggers',
  count(*)
FROM pg_trigger
WHERE NOT tgisinternal

UNION ALL

SELECT
  'rls_policies',
  count(*)
FROM pg_policy;

-- ============================================================
-- 2. RLS enabled on all public tables
-- ============================================================

SELECT
  relname AS table_name,
  relrowsecurity AS rls_enabled
FROM pg_class c
JOIN pg_namespace n ON n.oid = c.relnamespace
WHERE n.nspname = 'public'
  AND c.relkind = 'r'
  AND NOT relrowsecurity
ORDER BY relname;
-- Expected: zero rows returned

-- ============================================================
-- 3. Critical table row counts (compare with source baseline)
-- ============================================================

SELECT 'companies'        AS tbl, count(*) FROM companies
UNION ALL
SELECT 'users',                    count(*) FROM users
UNION ALL
SELECT 'guards',                   count(*) FROM guards
UNION ALL
SELECT 'clients',                  count(*) FROM clients
UNION ALL
SELECT 'sites',                    count(*) FROM sites
UNION ALL
SELECT 'shifts',                   count(*) FROM shifts
UNION ALL
SELECT 'incidents',                count(*) FROM incidents
UNION ALL
SELECT 'guard_site_assignments',   count(*) FROM guard_site_assignments
UNION ALL
SELECT 'attendance_logs',          count(*) FROM attendance_logs
UNION ALL
SELECT 'billing_webhook_events',   count(*) FROM billing_webhook_events
UNION ALL
SELECT 'agent_execution_logs',     count(*) FROM agent_execution_logs
UNION ALL
SELECT 'sop_documents',            count(*) FROM sop_documents
UNION ALL
SELECT 'notifications',            count(*) FROM notifications
UNION ALL
SELECT 'plans',                    count(*) FROM plans
ORDER BY tbl;

-- ============================================================
-- 4. Auth user count
-- ============================================================

SELECT count(*) AS auth_users FROM auth.users;

-- ============================================================
-- 5. Pre-restore recovery markers present
-- ============================================================

SELECT id, name, created_at
FROM companies
WHERE name LIKE '_DRILL_MARKER_%'
ORDER BY name;
-- Expected: _DRILL_MARKER_TENANT_A and _DRILL_MARKER_TENANT_B present
-- Expected: _DRILL_MARKER_POST_RESTORE absent (if restore point was before it was created)

-- ============================================================
-- 6. Migration history
-- ============================================================

SELECT version
FROM supabase_migrations.schema_migrations
ORDER BY version DESC
LIMIT 10;
-- Expected: most recent version matches source baseline head

-- ============================================================
-- 7. pg_cron jobs present (will be disabled)
-- ============================================================

SELECT jobid, jobname, schedule, active
FROM cron.job
ORDER BY jobid;
-- Expected: 4 jobs present, all active=false (they must have been disabled after restore)

-- ============================================================
-- 8. Extensions present
-- ============================================================

SELECT extname, extversion
FROM pg_extension
ORDER BY extname;
-- Expected: pg_cron, pg_net, pg_stat_statements, pgcrypto, plpgsql, supabase_vault, uuid-ossp, vector

-- ============================================================
-- 9. SECURITY DEFINER function grant check
-- (after migration 028 has been applied)
-- Expected: no row should show PUBLIC or anon EXECUTE
-- ============================================================

SELECT
  n.nspname                         AS schema,
  p.proname                         AS function_name,
  pg_get_function_identity_arguments(p.oid) AS args,
  CASE p.prosecdef WHEN true THEN 'SECURITY DEFINER' ELSE 'SECURITY INVOKER' END AS security_mode,
  array_to_string(p.proacl::text[], ', ') AS acl
FROM pg_proc p
JOIN pg_namespace n ON n.oid = p.pronamespace
WHERE n.nspname = 'public'
  AND (p.prosecdef
    OR p.proacl::text[] && ARRAY['=X', 'anonymous=X']
    OR array_to_string(p.proacl::text[], ',') LIKE '%=X%'
  )
ORDER BY p.proname;
-- After migration 028: guard_seed_first_run_policies and other SECURITY DEFINER
-- functions should NOT show PUBLIC (=X) or anon execute.

-- ============================================================
-- 10. anon SELECT on sensitive views
-- ============================================================

SELECT
  schemaname,
  tablename,
  array_to_string(privilege_type::text[], ', ') AS privileges,
  grantee
FROM information_schema.role_table_grants
WHERE grantee IN ('anon', 'public')
  AND tablename IN (
    'v_billing_revenue_monthly',
    'v_billing_mrr_current',
    'v_billing_overdue',
    'v_billing_tax_monthly',
    'sop_version_history'
  );
-- After migration 028: zero rows expected for anon/public SELECT on these views

-- ============================================================
-- 11. Storage bucket integrity
-- ============================================================

SELECT
  b.name,
  b.public,
  b.file_size_limit,
  count(o.id) AS objects
FROM storage.buckets b
LEFT JOIN storage.objects o ON o.bucket_id = b.id
GROUP BY b.name, b.public, b.file_size_limit
ORDER BY b.name;
-- Expected: 12 buckets, public/private settings match source baseline

-- ============================================================
-- 12. Stripe webhook idempotency constraint
-- ============================================================

SELECT
  conname,
  contype,
  conrelid::regclass AS table_name
FROM pg_constraint
WHERE conrelid = 'billing_webhook_events'::regclass
  AND contype = 'u';
-- Expected: UNIQUE constraint on stripe_event_id present