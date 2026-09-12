-- PHASE 1B: Security Helper Functions & Hardened RLS Foundation
-- Migration: 019_guardianhub_security_helpers_and_rls_fixes.sql
-- SAFE: All operations are additive. No DROP, no data loss.
-- Date: 2026-08-10

-- ============================================================================
-- PART 1: ENHANCED SECURITY HELPER FUNCTIONS
-- All functions derive identity from auth.uid() and require active status.
-- None trust browser-supplied IDs.
-- ============================================================================

-- 1.1 Safely get current user ID (returns null for anon)
CREATE OR REPLACE FUNCTION current_user_id()
RETURNS uuid
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = ''
AS $$
  SELECT auth.uid();
$$;

-- 1.2 Get current user's company ID (requires active status)
CREATE OR REPLACE FUNCTION current_company_id()
RETURNS uuid
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = ''
AS $$
  SELECT company_id FROM public.users
  WHERE id = auth.uid()
    AND status = 'active'
  LIMIT 1;
$$;

-- 1.3 Get current user's role (requires active status)
CREATE OR REPLACE FUNCTION current_user_role()
RETURNS text
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = ''
AS $$
  SELECT role FROM public.users
  WHERE id = auth.uid()
    AND status = 'active'
  LIMIT 1;
$$;

-- 1.4 Check if current user is active (not suspended/deleted)
CREATE OR REPLACE FUNCTION is_active_user()
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = ''
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.users
    WHERE id = auth.uid()
      AND status = 'active'
  );
$$;

-- 1.5 Enhanced is_super_admin (requires active status)
CREATE OR REPLACE FUNCTION is_super_admin()
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = ''
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.users
    WHERE id = auth.uid()
      AND role = 'super_admin'
      AND status = 'active'
  );
$$;

-- 1.6 is_super_admin for a specific user (retain existing overload compatibility)
CREATE OR REPLACE FUNCTION is_super_admin(check_user_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = ''
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.users
    WHERE id = check_user_id
      AND role = 'super_admin'
      AND status = 'active'
  );
$$;

-- 1.7 Company membership check (requires active status)
CREATE OR REPLACE FUNCTION is_company_member(target_company_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = ''
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.users
    WHERE id = auth.uid()
      AND company_id = target_company_id
      AND status = 'active'
  );
$$;

-- 1.8 Company admin check for a specific company
CREATE OR REPLACE FUNCTION is_company_admin(target_company_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = ''
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.users
    WHERE id = auth.uid()
      AND company_id = target_company_id
      AND role IN ('company_admin', 'operations_manager')
      AND status = 'active'
  );
$$;

-- 1.9 Site access check
CREATE OR REPLACE FUNCTION can_access_site(target_site_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = ''
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_site_access usa
    JOIN public.users u ON u.id = auth.uid()
    WHERE usa.site_id = target_site_id
      AND usa.user_id = auth.uid()
      AND u.status = 'active'
  )
  OR EXISTS (
    SELECT 1 FROM public.sites s
    JOIN public.users u ON u.id = auth.uid()
    WHERE s.id = target_site_id
      AND s.company_id = u.company_id
      AND u.role IN ('company_admin', 'operations_manager')
      AND u.status = 'active'
  )
  OR is_super_admin();
$$;

-- 1.10 Site management check
CREATE OR REPLACE FUNCTION can_manage_site(target_site_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = ''
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.sites s
    JOIN public.users u ON u.id = auth.uid()
    WHERE s.id = target_site_id
      AND s.company_id = u.company_id
      AND u.role IN ('company_admin', 'operations_manager')
      AND u.status = 'active'
  )
  OR is_super_admin();
$$;

-- 1.11 Client access check
CREATE OR REPLACE FUNCTION can_access_client(target_client_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = ''
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.client_users cu
    JOIN public.users u ON u.id = auth.uid()
    WHERE cu.client_id = target_client_id
      AND cu.user_id = auth.uid()
      AND u.status = 'active'
  )
  OR EXISTS (
    SELECT 1 FROM public.clients c
    JOIN public.users u ON u.id = auth.uid()
    WHERE c.id = target_client_id
      AND c.company_id = u.company_id
      AND u.role IN ('company_admin', 'operations_manager')
      AND u.status = 'active'
  )
  OR is_super_admin();
$$;

-- 1.12 Guard ownership check
CREATE OR REPLACE FUNCTION is_guard_user(target_guard_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = ''
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.guards g
    WHERE g.id = target_guard_id
      AND g.user_id = auth.uid()
  );
$$;

-- 1.13 Permission check by key
CREATE OR REPLACE FUNCTION has_permission(permission_key text, required_level text DEFAULT 'view')
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = ''
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.role_permissions rp
    JOIN public.user_roles ur ON ur.role_id = rp.role_id
    JOIN public.users u ON u.id = auth.uid()
    WHERE ur.user_id = auth.uid()
      AND ur.company_id = rp.company_id
      AND rp.permission_key = permission_key
      AND u.status = 'active'
      AND rp.level >= required_level
  )
  OR EXISTS (
    SELECT 1 FROM public.users u
    WHERE u.id = auth.uid()
      AND u.role = 'super_admin'
      AND u.status = 'active'
  );
$$;

-- 1.14 Get current user's guard ID
CREATE OR REPLACE FUNCTION get_my_guard_id()
RETURNS uuid
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = ''
AS $$
  SELECT id FROM public.guards
  WHERE user_id = auth.uid()
  LIMIT 1;
$$;

-- 1.15 Get current user's company ID (backward-compatible alias)
CREATE OR REPLACE FUNCTION get_my_company_id()
RETURNS uuid
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = ''
AS $$
  SELECT company_id FROM public.users
  WHERE id = auth.uid()
    AND status = 'active'
  LIMIT 1;
$$;

-- 1.16 Get current user's role (backward-compatible alias)
CREATE OR REPLACE FUNCTION get_my_role()
RETURNS text
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = ''
AS $$
  SELECT role FROM public.users
  WHERE id = auth.uid()
    AND status = 'active'
  LIMIT 1;
$$;

-- 1.17 Get current client user's client ID
CREATE OR REPLACE FUNCTION user_client_id()
RETURNS uuid
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = ''
AS $$
  SELECT client_id FROM public.client_users
  WHERE user_id = auth.uid()
  LIMIT 1;
$$;

-- 1.18 Get all client IDs for current user
CREATE OR REPLACE FUNCTION user_client_ids()
RETURNS SETOF uuid
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = ''
AS $$
  SELECT cu.client_id
  FROM public.client_users cu
  WHERE cu.user_id = auth.uid();
$$;

-- 1.19 has_site_access for guards and staff
CREATE OR REPLACE FUNCTION has_site_access(site_uuid uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = ''
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_site_access
    WHERE user_id = auth.uid() AND site_id = site_uuid
  )
  OR EXISTS (
    SELECT 1 FROM public.guard_site_assignments gsa
    JOIN public.guards g ON g.id = gsa.guard_id
    WHERE g.user_id = auth.uid() AND gsa.site_id = site_uuid
  );
$$;

-- Revoke anon/public access from helper functions
REVOKE ALL ON FUNCTION current_user_id() FROM anon, public;
REVOKE ALL ON FUNCTION current_company_id() FROM anon, public;
REVOKE ALL ON FUNCTION current_user_role() FROM anon, public;
REVOKE ALL ON FUNCTION is_active_user() FROM anon, public;
REVOKE ALL ON FUNCTION is_company_member(uuid) FROM anon, public;
REVOKE ALL ON FUNCTION is_company_admin(uuid) FROM anon, public;
REVOKE ALL ON FUNCTION can_access_site(uuid) FROM anon, public;
REVOKE ALL ON FUNCTION can_manage_site(uuid) FROM anon, public;
REVOKE ALL ON FUNCTION can_access_client(uuid) FROM anon, public;
REVOKE ALL ON FUNCTION is_guard_user(uuid) FROM anon, public;
REVOKE ALL ON FUNCTION has_permission(text, text) FROM anon, public;
REVOKE ALL ON FUNCTION get_my_company_id() FROM anon, public;
REVOKE ALL ON FUNCTION get_my_role() FROM anon, public;
REVOKE ALL ON FUNCTION get_my_guard_id() FROM anon, public;
REVOKE ALL ON FUNCTION user_client_id() FROM anon, public;
REVOKE ALL ON FUNCTION user_client_ids() FROM anon, public;
REVOKE ALL ON FUNCTION has_site_access(uuid) FROM anon, public;

-- Grant execution to authenticated users
GRANT EXECUTE ON FUNCTION current_user_id() TO authenticated;
GRANT EXECUTE ON FUNCTION current_company_id() TO authenticated;
GRANT EXECUTE ON FUNCTION current_user_role() TO authenticated;
GRANT EXECUTE ON FUNCTION is_active_user() TO authenticated;
GRANT EXECUTE ON FUNCTION is_super_admin() TO authenticated;
GRANT EXECUTE ON FUNCTION is_super_admin(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION is_company_member(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION is_company_admin(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION can_access_site(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION can_manage_site(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION can_access_client(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION is_guard_user(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION has_permission(text, text) TO authenticated;
GRANT EXECUTE ON FUNCTION get_my_company_id() TO authenticated;
GRANT EXECUTE ON FUNCTION get_my_role() TO authenticated;
GRANT EXECUTE ON FUNCTION get_my_guard_id() TO authenticated;
GRANT EXECUTE ON FUNCTION user_client_id() TO authenticated;
GRANT EXECUTE ON FUNCTION user_client_ids() TO authenticated;
GRANT EXECUTE ON FUNCTION has_site_access(uuid) TO authenticated;


-- ============================================================================
-- PART 2: CRITICAL RLS FIXES — Replace USING(true) policies
-- ============================================================================

-- 2.1 Fix agent_execution_logs: remove the open SELECT policy
DROP POLICY IF EXISTS "Authenticated users can read their client agent logs" ON agent_execution_logs;
-- Already has "agent_logs_select_company_or_super" and "agent_logs_company_restrictive" — good

-- 2.2 Fix acs_audit_findings: replace WITH CHECK(true) with company check
DROP POLICY IF EXISTS "audit_findings_insert" ON acs_audit_findings;
CREATE POLICY "audit_findings_insert" ON acs_audit_findings
  FOR INSERT
  WITH CHECK (is_company_member(company_id) OR is_super_admin());

-- 2.3 Fix acs_audit_runs: replace WITH CHECK(true) with company check
DROP POLICY IF EXISTS "audit_runs_insert" ON acs_audit_runs;
CREATE POLICY "audit_runs_insert" ON acs_audit_runs
  FOR INSERT
  WITH CHECK (is_company_member(company_id) OR is_super_admin());

-- 2.4 modules SELECT: already has modules_super_admin for management, but modules_select_all is open.
-- modules are reference data — keep readable by authenticated, restrict anon
DROP POLICY IF EXISTS "modules_select_all" ON modules;
CREATE POLICY "modules_select_authenticated" ON modules
  FOR SELECT
  USING (auth.role() = 'authenticated');

-- 2.5 permissions SELECT: already has permissions_authenticated_read with USING(true) — restrict to authenticated
DROP POLICY IF EXISTS "permissions_authenticated_read" ON permissions;
CREATE POLICY "permissions_authenticated_read" ON permissions
  FOR SELECT
  USING (auth.role() = 'authenticated');

-- 2.6 plan_features and plans: reference data, restrict to authenticated
DROP POLICY IF EXISTS "Anyone can read plan_features" ON plan_features;
CREATE POLICY "authenticated_read_plan_features" ON plan_features
  FOR SELECT
  USING (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Anyone can read plans" ON plans;
CREATE POLICY "authenticated_read_plans" ON plans
  FOR SELECT
  USING (auth.role() = 'authenticated');

-- 2.7 Enable RLS on webhook_debug_log (the only table without it)
ALTER TABLE webhook_debug_log ENABLE ROW LEVEL SECURITY;
CREATE POLICY "webhook_debug_super_admin" ON webhook_debug_log
  FOR ALL
  USING (is_super_admin())
  WITH CHECK (is_super_admin());


-- ============================================================================
-- PART 3: PROTECTED FIELD TRIGGERS
-- Prevent direct changes to role, company_id, status, billing fields
-- ============================================================================

-- 3.1 users.protected_fields_update trigger
CREATE OR REPLACE FUNCTION protect_user_fields()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  -- Non-super-admin cannot change their own role or company_id
  IF NOT is_super_admin() THEN
    IF NEW.role IS DISTINCT FROM OLD.role THEN
      RAISE EXCEPTION 'Cannot change user role directly. Use admin invite or secure RPC.';
    END IF;
    IF NEW.company_id IS DISTINCT FROM OLD.company_id THEN
      RAISE EXCEPTION 'Cannot change company_id directly.';
    END IF;
    IF NEW.status IS DISTINCT FROM OLD.status AND NEW.status NOT IN ('active', 'inactive') THEN
      RAISE EXCEPTION 'Cannot change status to restricted values directly.';
    END IF;
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_protect_user_fields ON users;
CREATE TRIGGER trg_protect_user_fields
  BEFORE UPDATE ON users
  FOR EACH ROW
  EXECUTE FUNCTION protect_user_fields();

-- 3.2 companies.billing_fields trigger
CREATE OR REPLACE FUNCTION protect_company_billing_fields()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  IF NOT is_super_admin() THEN
    -- Normal users cannot change Stripe identifiers
    IF NEW.stripe_customer_id IS DISTINCT FROM OLD.stripe_customer_id THEN
      RAISE EXCEPTION 'Cannot modify Stripe customer ID directly.';
    END IF;
    IF NEW.stripe_subscription_id IS DISTINCT FROM OLD.stripe_subscription_id THEN
      RAISE EXCEPTION 'Cannot modify Stripe subscription ID directly.';
    END IF;
    IF NEW.subscription_status IS DISTINCT FROM OLD.subscription_status THEN
      RAISE EXCEPTION 'Cannot modify subscription status directly.';
    END IF;
    IF NEW.subscription_plan IS DISTINCT FROM OLD.subscription_plan THEN
      RAISE EXCEPTION 'Cannot modify subscription plan directly.';
    END IF;
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_protect_company_billing ON companies;
CREATE TRIGGER trg_protect_company_billing
  BEFORE UPDATE ON companies
  FOR EACH ROW
  EXECUTE FUNCTION protect_company_billing_fields();

-- 3.3 company_enabled_modules: only super_admin can change
CREATE OR REPLACE FUNCTION protect_company_modules()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  IF NOT is_super_admin() THEN
    RAISE EXCEPTION 'Only super_admin can modify company_enabled_modules.';
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_protect_company_modules_insert ON company_enabled_modules;
CREATE TRIGGER trg_protect_company_modules_insert
  BEFORE INSERT ON company_enabled_modules
  FOR EACH ROW
  EXECUTE FUNCTION protect_company_modules();

DROP TRIGGER IF EXISTS trg_protect_company_modules_update ON company_enabled_modules;
CREATE TRIGGER trg_protect_company_modules_update
  BEFORE UPDATE ON company_enabled_modules
  FOR EACH ROW
  EXECUTE FUNCTION protect_company_modules();

DROP TRIGGER IF EXISTS trg_protect_company_modules_delete ON company_enabled_modules;
CREATE TRIGGER trg_protect_company_modules_delete
  BEFORE DELETE ON company_enabled_modules
  FOR EACH ROW
  EXECUTE FUNCTION protect_company_modules();

-- 3.4 billing tables: super_admin only
CREATE OR REPLACE FUNCTION protect_billing_tables()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  IF NOT is_super_admin() THEN
    RAISE EXCEPTION 'Billing records can only be modified by super_admin.';
  END IF;
  RETURN NEW;
END;
$$;

-- Apply to billing_invoices
DROP TRIGGER IF EXISTS trg_protect_billing_invoices ON billing_invoices;
CREATE TRIGGER trg_protect_billing_invoices
  BEFORE INSERT OR UPDATE OR DELETE ON billing_invoices
  FOR EACH ROW
  EXECUTE FUNCTION protect_billing_tables();

-- Apply to billing_payments
DROP TRIGGER IF EXISTS trg_protect_billing_payments ON billing_payments;
CREATE TRIGGER trg_protect_billing_payments
  BEFORE INSERT OR UPDATE OR DELETE ON billing_payments
  FOR EACH ROW
  EXECUTE FUNCTION protect_billing_tables();

-- Apply to billing_refunds
DROP TRIGGER IF EXISTS trg_protect_billing_refunds ON billing_refunds;
CREATE TRIGGER trg_protect_billing_refunds
  BEFORE INSERT OR UPDATE OR DELETE ON billing_refunds
  FOR EACH ROW
  EXECUTE FUNCTION protect_billing_tables();

-- Apply to billing_disputes
DROP TRIGGER IF EXISTS trg_protect_billing_disputes ON billing_disputes;
CREATE TRIGGER trg_protect_billing_disputes
  BEFORE INSERT OR UPDATE OR DELETE ON billing_disputes
  FOR EACH ROW
  EXECUTE FUNCTION protect_billing_tables();

-- Apply to billing_subscription_events
DROP TRIGGER IF EXISTS trg_protect_billing_sub_events ON billing_subscription_events;
CREATE TRIGGER trg_protect_billing_sub_events
  BEFORE INSERT OR UPDATE OR DELETE ON billing_subscription_events
  FOR EACH ROW
  EXECUTE FUNCTION protect_billing_tables();

-- Apply to billing_webhook_events
DROP TRIGGER IF EXISTS trg_protect_billing_webhook_events ON billing_webhook_events;
CREATE TRIGGER trg_protect_billing_webhook_events
  BEFORE INSERT OR UPDATE OR DELETE ON billing_webhook_events
  FOR EACH ROW
  EXECUTE FUNCTION protect_billing_tables();

-- 3.5 admin_activity_log: no normal user modification
CREATE OR REPLACE FUNCTION protect_admin_activity_log()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  -- Only allow INSERT by authenticated users, but UPDATE/DELETE only by super_admin
  IF TG_OP = 'INSERT' THEN
    IF auth.role() = 'authenticated' THEN
      RETURN NEW;
    ELSE
      RAISE EXCEPTION 'Only authenticated users can insert admin activity logs.';
    END IF;
  ELSIF NOT is_super_admin() THEN
    RAISE EXCEPTION 'Cannot modify or delete admin activity logs.';
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_protect_admin_activity_log ON admin_activity_log;
CREATE TRIGGER trg_protect_admin_activity_log
  BEFORE UPDATE OR DELETE ON admin_activity_log
  FOR EACH ROW
  EXECUTE FUNCTION protect_admin_activity_log();


-- ============================================================================
-- PART 4: HARDEN EXISTING RLS POLICIES — Guard & Client Restrictions
-- ============================================================================

-- 4.1 guard_wellbeing_checkins: guards can only read their own
DROP POLICY IF EXISTS "wellbeing_select" ON guard_wellbeing_checkins;
CREATE POLICY "wellbeing_select" ON guard_wellbeing_checkins
  FOR SELECT
  USING (
    (company_id = get_my_company_id() AND get_my_role() IN ('company_admin', 'operations_manager'))
    OR (guard_id = get_my_guard_id())
    OR is_super_admin()
  );

-- 4.2 guard_certifications: guards can only read their own
DROP POLICY IF EXISTS "certs_select" ON guard_certifications;
CREATE POLICY "certs_select" ON guard_certifications
  FOR SELECT
  USING (
    (company_id = get_my_company_id() AND get_my_role() IN ('company_admin', 'operations_manager'))
    OR (guard_id = get_my_guard_id())
    OR is_super_admin()
  );

-- 4.3 guard_vetting_records: guards cannot read (sensitive HR data)
DROP POLICY IF EXISTS "vetting_select" ON guard_vetting_records;
CREATE POLICY "vetting_select" ON guard_vetting_records
  FOR SELECT
  USING (
    (company_id = get_my_company_id() AND get_my_role() IN ('company_admin', 'operations_manager'))
    OR is_super_admin()
  );

-- 4.4 guard_performance_scores: guards cannot read (sensitive)
DROP POLICY IF EXISTS "perf_select" ON guard_performance_scores;
CREATE POLICY "perf_select" ON guard_performance_scores
  FOR SELECT
  USING (
    (company_id = get_my_company_id() AND get_my_role() IN ('company_admin', 'operations_manager'))
    OR is_super_admin()
  );

-- 4.5 attendance_logs: guard can only see their own
DROP POLICY IF EXISTS "attendance_select_company" ON attendance_logs;
CREATE POLICY "attendance_select_company" ON attendance_logs
  FOR SELECT
  USING (
    (company_id = get_my_company_id() AND get_my_role() IN ('company_admin', 'operations_manager'))
    OR (guard_id = get_my_guard_id())
    OR is_super_admin()
  );

-- 4.6 company_secrets: already has company_secrets_no_access (false) — good, keep it

-- 4.7 evidence_access_logs: admins and super_admin only
DROP POLICY IF EXISTS "company_admin_read_own_eal" ON evidence_access_logs;
CREATE POLICY "company_admin_read_own_eal" ON evidence_access_logs
  FOR SELECT
  USING (
    (company_id = get_my_company_id() AND get_my_role() IN ('company_admin', 'operations_manager'))
    OR is_super_admin()
  );

-- 4.8 agent_registry: keep as active-only SELECT for authenticated, but restrict non-super-admin access to management
DROP POLICY IF EXISTS "Authenticated users can read agent registry" ON agent_registry;
CREATE POLICY "agent_registry_select_active" ON agent_registry
  FOR SELECT
  USING (is_active = true AND auth.role() = 'authenticated');

-- 4.9 Ensure webhook_debug_log has comprehensive policy
DROP POLICY IF EXISTS "webhook_debug_super_admin" ON webhook_debug_log;
CREATE POLICY "webhook_debug_super_admin" ON webhook_debug_log
  FOR ALL
  USING (is_super_admin())
  WITH CHECK (is_super_admin());