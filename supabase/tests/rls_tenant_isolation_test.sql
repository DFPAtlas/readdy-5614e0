-- ============================================================================
-- PHASE 1B: RLS Tenant Isolation Tests
-- Run these manually against the Supabase SQL editor
-- These are verification queries, not automated tests.
-- ============================================================================

-- TEST 1: Verify all public tables have RLS enabled
SELECT tablename, rowsecurity
FROM pg_tables
WHERE schemaname = 'public'
  AND rowsecurity = false
ORDER BY tablename;
-- EXPECTED: Only webhook_debug_log (now fixed in migration 019)

-- TEST 2: Verify no table has wide-open SELECT policy (USING true)
SELECT tablename, policyname, cmd, qual
FROM pg_policies
WHERE schemaname = 'public'
  AND cmd = 'SELECT'
  AND qual = 'true'
ORDER BY tablename;
-- EXPECTED: No results (all fixed in Phase 1B)

-- TEST 3: Verify security helper functions exist
SELECT proname FROM pg_proc
WHERE pronamespace = 'public'::regnamespace
  AND proname IN (
    'current_user_id', 'current_company_id', 'current_user_role',
    'is_active_user', 'is_super_admin', 'is_company_member',
    'is_company_admin', 'can_access_site', 'can_manage_site',
    'can_access_client', 'is_guard_user', 'has_permission',
    'get_my_company_id', 'get_my_role', 'get_my_guard_id',
    'user_client_id', 'user_client_ids', 'has_site_access'
  )
ORDER BY proname;
-- EXPECTED: All 18 functions listed

-- TEST 4: Verify protected field triggers exist
SELECT tgname, tgrelid::regclass
FROM pg_trigger
WHERE tgname LIKE 'trg_protect_%'
ORDER BY tgname;
-- EXPECTED: trg_protect_user_fields, trg_protect_company_billing, 
--           trg_protect_company_modules_insert/update/delete,
--           trg_protect_billing_* on all billing tables,
--           trg_protect_admin_activity_log

-- TEST 5: Company-owned tables must have company_id column
-- (Manual check — spot-check a few critical tables)
SELECT column_name FROM information_schema.columns
WHERE table_name = 'incidents' AND column_name = 'company_id';
SELECT column_name FROM information_schema.columns
WHERE table_name = 'shifts' AND column_name = 'company_id';
SELECT column_name FROM information_schema.columns
WHERE table_name = 'patrol_logs' AND column_name = 'company_id';
SELECT column_name FROM information_schema.columns
WHERE table_name = 'guards' AND column_name = 'company_id';
SELECT column_name FROM information_schema.columns
WHERE table_name = 'sites' AND column_name = 'company_id';
-- EXPECTED: company_id exists in all

-- TEST 6: users table has status field
SELECT column_name, data_type
FROM information_schema.columns
WHERE table_name = 'users' AND column_name = 'status';
-- EXPECTED: text type, exists

-- TEST 7: Verify RPC functions exist and are secured
SELECT proname, prosecdef
FROM pg_proc
WHERE pronamespace = 'public'::regnamespace
  AND proname IN (
    'accept_shift_cover_offer', 'decline_shift_cover_offer',
    'is_super_admin', 'match_sop_chunks',
    'request_shift_leave', 'sop_daily_queries'
  )
ORDER BY proname;
-- EXPECTED: All 6 RPCs exist

-- TEST 8: Verify billing tables are super_admin only (via RLS policy)
SELECT tablename, policyname, cmd, qual
FROM pg_policies
WHERE schemaname = 'public'
  AND tablename LIKE 'billing_%'
ORDER BY tablename, cmd;
-- EXPECTED: All billing policies require is_super_admin()

-- TEST 9: Verify company_secrets is inaccessible to normal users
SELECT tablename, policyname, qual
FROM pg_policies
WHERE schemaname = 'public'
  AND tablename = 'company_secrets';
-- EXPECTED: company_secrets_no_access policy with USING (false)

-- TEST 10: Verify webhook_debug_log now has RLS
SELECT tablename, rowsecurity
FROM pg_tables
WHERE schemaname = 'public' AND tablename = 'webhook_debug_log';
-- EXPECTED: rowsecurity = true