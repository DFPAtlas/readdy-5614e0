-- ============================================================================
-- PHASE 1B: Role Escalation Prevention Tests
-- Manual verification queries
-- ============================================================================

-- TEST 1: Verify RESTRICTIVE policy blocks super_admin role insertion by non-super-admin
SELECT tablename, policyname, cmd, permissive, with_check
FROM pg_policies
WHERE schemaname = 'public'
  AND tablename = 'users'
  AND cmd = 'INSERT'
  AND policyname LIKE '%super_admin%'
ORDER BY policyname;
-- EXPECTED: block_super_admin_insert RESTRICTIVE policy prevents super_admin role

-- TEST 2: Verify RESTRICTIVE policy blocks super_admin role update
SELECT tablename, policyname, cmd, permissive, with_check
FROM pg_policies
WHERE schemaname = 'public'
  AND tablename = 'users'
  AND cmd = 'UPDATE'
  AND policyname LIKE '%super_admin%'
ORDER BY policyname;
-- EXPECTED: block_super_admin_role_update RESTRICTIVE policy

-- TEST 3: Verify companies UPDATE policy prevents non-admin changes
SELECT tablename, policyname, cmd, qual, with_check
FROM pg_policies
WHERE schemaname = 'public'
  AND tablename = 'companies'
  AND cmd = 'UPDATE';
-- EXPECTED: companies_company_admin_update with company_id check

-- TEST 4: Verify billing tables have super_admin-only policies
SELECT tablename, count(*) as policy_count
FROM pg_policies
WHERE schemaname = 'public'
  AND tablename LIKE 'billing_%'
  AND qual LIKE '%is_super_admin%'
GROUP BY tablename
ORDER BY tablename;
-- EXPECTED: Each billing table has at least one super_admin policy

-- TEST 5: Verify admin_activity_log cannot be modified by normal users
SELECT tablename, policyname, cmd
FROM pg_policies
WHERE schemaname = 'public'
  AND tablename = 'admin_activity_log';
-- EXPECTED: admin_activity_super_all policy

-- TEST 6: Verify company_enabled_modules is super_admin only
SELECT tablename, policyname, cmd, qual
FROM pg_policies
WHERE schemaname = 'public'
  AND tablename = 'company_enabled_modules';
-- EXPECTED: company_modules_super_all with is_super_admin()

-- TEST 7: Verify guard_certifications guards can only read own
SELECT tablename, policyname, cmd, qual
FROM pg_policies
WHERE schemaname = 'public'
  AND tablename = 'guard_certifications'
  AND cmd = 'SELECT';
-- EXPECTED: certs_select restricts guard access

-- TEST 8: Verify guard_vetting_records guards cannot read
SELECT tablename, policyname, cmd, qual
FROM pg_policies
WHERE schemaname = 'public'
  AND tablename = 'guard_vetting_records'
  AND cmd = 'SELECT';
-- EXPECTED: vetting_select only for company_admin and super_admin

-- TEST 9: Verify guard_performance_scores guards cannot read
SELECT tablename, policyname, cmd, qual
FROM pg_policies
WHERE schemaname = 'public'
  AND tablename = 'guard_performance_scores'
  AND cmd = 'SELECT';
-- EXPECTED: perf_select only for company_admin and super_admin