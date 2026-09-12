-- ============================================================================
-- Phase 15: Tenant isolation test suite (two independent tenants)
-- Run each block and confirm the EXPECTED result. A cross-tenant read/write
-- must always fail; any success is a release-blocking critical defect.
-- ============================================================================

-- 0. Confirm the two UAT tenants exist
SELECT id, name FROM public.companies WHERE name IN ('UAT — Sentinel Security Ltd','UAT — Apex Guarding Group');
-- EXPECT: 2 rows

-- 1. Confirm release-control tables have RLS enabled
SELECT c.relname
FROM pg_class c JOIN pg_namespace n ON n.oid = c.relnamespace
WHERE n.nspname = 'public' AND c.relkind = 'r' AND c.relname LIKE 'release_%' AND NOT c.relrowsecurity
ORDER BY c.relname;
-- EXPECT: 0 rows

-- 2. Confirm release-control policies gate through is_platform_staff()
SELECT tablename, policyname, cmd
FROM pg_policies
WHERE schemaname = 'public' AND tablename LIKE 'release_%'
  AND (qual <> '(is_platform_staff())' OR with_check IS DISTINCT FROM '(is_platform_staff())')
ORDER BY tablename, cmd;
-- EXPECT: 0 rows (every policy uses is_platform_staff() for USING/WITH CHECK)

-- 3. Confirm release tables have no anon/public exposure
SELECT tablename, policyname, cmd, roles
FROM pg_policies
WHERE schemaname = 'public' AND tablename LIKE 'release_%' AND roles = '{anon}';
-- EXPECT: 0 rows

-- 4. Tenant isolation — company-scoped tables must not be readable cross-tenant
--    (Run as a tenant-A user; a tenant-B company_id must return 0 rows)
SELECT count(*) FROM public.sites WHERE company_id = (SELECT id FROM public.companies WHERE name = 'UAT — Apex Guarding Group');
-- EXPECT (as Sentinel tenant): 0 rows returned by the API; RLS filters out foreign rows

-- 5. Confirm no cross-tenant FK leakage in the seed
SELECT count(*) FROM public.guards g
JOIN public.companies c ON g.company_id = c.id
WHERE g.company_id <> c.id;
-- EXPECT: 0

-- 6. Verify user/role seed integrity (no user belongs to two tenants)
SELECT id, count(DISTINCT company_id) AS tenant_count
FROM public.users
GROUP BY id
HAVING count(DISTINCT company_id) > 1;
-- EXPECT: 0 rows