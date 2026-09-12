-- Phase 14 Security Tests
-- Run each block in the Supabase SQL Editor and confirm the EXPECTED result.

-- 1. Every public table must have RLS enabled
SELECT c.relname
FROM pg_class c
JOIN pg_namespace n ON n.oid = c.relnamespace
WHERE n.nspname = 'public' AND c.relkind = 'r' AND NOT c.relrowsecurity
ORDER BY c.relname;
-- EXPECT: 0 rows

-- 2. No SELECT policy without a USING clause (tenant/ownership scoping)
SELECT tablename, policyname
FROM pg_policies
WHERE schemaname = 'public' AND cmd = 'SELECT' AND qual IS NULL;
-- EXPECT: 0 rows

-- 3. No UPDATE policy without a WITH CHECK clause
SELECT tablename, policyname
FROM pg_policies
WHERE schemaname = 'public' AND cmd = 'UPDATE' AND with_check IS NULL;
-- EXPECT: 0 rows

-- 4. New observability tables must gate access through is_platform_staff()
SELECT tablename, policyname, cmd, roles
FROM pg_policies
WHERE schemaname = 'public'
  AND tablename IN ('deployment_records','retention_config','ops_incidents','ops_error_events')
ORDER BY tablename, cmd, policyname;
-- EXPECT: only SELECT/INSERT/UPDATE policies referencing is_platform_staff()

-- 5. ops_error_events must NOT have direct INSERT/UPDATE/DELETE policies
--    (telemetry is ingested only through the report-error edge function using service role)
SELECT tablename, policyname, cmd
FROM pg_policies
WHERE schemaname = 'public' AND tablename = 'ops_error_events' AND cmd IN ('INSERT','UPDATE','DELETE');
-- EXPECT: 0 rows

-- 6. company_secrets must remain blocked for all roles
SELECT tablename, policyname, cmd, qual, with_check
FROM pg_policies
WHERE schemaname = 'public' AND tablename = 'company_secrets';
-- EXPECT: SELECT qual = false; no open INSERT/UPDATE/DELETE

-- 7. Retention config seeded
SELECT count(*) AS retention_categories
FROM public.retention_config;
-- EXPECT: 10

-- 8. Phase 14 indexes present
SELECT indexname
FROM pg_indexes
WHERE schemaname = 'public'
  AND indexname IN (
    'idx_shifts_site_status','idx_attendance_guard_clockin','idx_incidents_status_occurred',
    'idx_billing_webhook_errors','idx_notif_deliveries_status','idx_security_events_severity',
    'idx_support_access_status_expiry','idx_data_requests_export_expiry'
  )
ORDER BY indexname;
-- EXPECT: 8 rows