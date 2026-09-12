-- =============================================================================
-- GuardianHub Migration 028 — Phase 22A Least-Privilege Grant Repair
-- =============================================================================
-- Migration 027 hardened the function bodies (applied live) but its REVOKE/GRANT
-- statements were never applied to staging because the in-environment SQL runner
-- rejects REVOKE. Live catalog inspection confirmed the following functions still
-- carry PUBLIC + anon EXECUTE, and the billing/SOP-history views still grant anon:
--
--   guard_seed_first_run_policies, guard_ensure_workforce_profile,
--   guard_get_first_run_acknowledgements, guard_acknowledge_first_run_policy,
--   generate_incident_number, is_platform_staff, sop_daily_queries,
--   match_sop_chunks (x2), plus trigger helpers.
--
--   v_billing_mrr_current, v_billing_overdue, v_billing_revenue_monthly,
--   v_billing_tax_monthly, sop_version_history (anon SELECT/ALL).
--
-- This migration applies the exact reviewed least-privilege changes. It is
-- idempotent (REVOKE of a non-existent grant is a no-op). Apply via the Supabase
-- SQL editor or `supabase db push` — NOT via a runner that blocks REVOKE.
-- =============================================================================

-- ---------------------------------------------------------------------------
-- 1. Guard first-run RPCs (SECURITY DEFINER)
--    seed/ensure are internal helpers invoked by the SECURITY DEFINER getter and
--    acknowledge functions (which execute as the function owner), so no client
--    role needs direct EXECUTE.
-- ---------------------------------------------------------------------------
REVOKE EXECUTE ON FUNCTION public.guard_seed_first_run_policies(uuid)
  FROM PUBLIC, anon, authenticated, service_role;

REVOKE EXECUTE ON FUNCTION public.guard_ensure_workforce_profile()
  FROM PUBLIC, anon, authenticated, service_role;

REVOKE EXECUTE ON FUNCTION public.guard_get_first_run_acknowledgements()
  FROM PUBLIC, anon, service_role;

REVOKE EXECUTE ON FUNCTION public.guard_acknowledge_first_run_policy(uuid)
  FROM PUBLIC, anon, service_role;

GRANT EXECUTE ON FUNCTION public.guard_get_first_run_acknowledgements()
  TO authenticated;

GRANT EXECUTE ON FUNCTION public.guard_acknowledge_first_run_policy(uuid)
  TO authenticated;

-- ---------------------------------------------------------------------------
-- 2. Other exposed RPCs
-- ---------------------------------------------------------------------------
-- Trigger-only helper; clients never invoke it directly.
REVOKE EXECUTE ON FUNCTION public.generate_incident_number()
  FROM PUBLIC, anon, authenticated, service_role;

-- Platform-admin helper used inside RLS policies and edge functions.
REVOKE EXECUTE ON FUNCTION public.is_platform_staff()
  FROM PUBLIC, anon;

GRANT EXECUTE ON FUNCTION public.is_platform_staff()
  TO authenticated, service_role;

-- Browser/edge-function RPCs; authenticated + service_role only.
REVOKE EXECUTE ON FUNCTION public.sop_daily_queries(uuid, timestamp with time zone)
  FROM PUBLIC, anon;

GRANT EXECUTE ON FUNCTION public.sop_daily_queries(uuid, timestamp with time zone)
  TO authenticated, service_role;

REVOKE EXECUTE ON FUNCTION public.match_sop_chunks(vector, double precision, integer, uuid)
  FROM PUBLIC, anon;

REVOKE EXECUTE ON FUNCTION public.match_sop_chunks(vector, uuid, uuid, double precision, integer)
  FROM PUBLIC, anon;

GRANT EXECUTE ON FUNCTION public.match_sop_chunks(vector, double precision, integer, uuid)
  TO authenticated, service_role;

GRANT EXECUTE ON FUNCTION public.match_sop_chunks(vector, uuid, uuid, double precision, integer)
  TO authenticated, service_role;

-- ---------------------------------------------------------------------------
-- 3. Trigger-only helpers (defense-in-depth)
--    Triggers fire regardless of the caller's EXECUTE grant; direct client
--    invocation is never required, so remove PUBLIC + anon access.
-- ---------------------------------------------------------------------------
REVOKE EXECUTE ON FUNCTION public.prevent_subscription_field_tamper()
  FROM PUBLIC, anon;

REVOKE EXECUTE ON FUNCTION public.prevent_subscription_field_update()
  FROM PUBLIC, anon;

REVOKE EXECUTE ON FUNCTION public.set_site_notice_updated_at()
  FROM PUBLIC, anon;

REVOKE EXECUTE ON FUNCTION public.set_updated_at()
  FROM PUBLIC, anon;

REVOKE EXECUTE ON FUNCTION public.tg_billing_set_updated_at()
  FROM PUBLIC, anon;

-- ---------------------------------------------------------------------------
-- 4. Remove anonymous view access
--    Views remain security_invoker=true (verified live); authenticated access is
--    retained and stays scoped by the underlying table RLS.
-- ---------------------------------------------------------------------------
REVOKE ALL PRIVILEGES ON TABLE public.v_billing_mrr_current FROM anon;
REVOKE ALL PRIVILEGES ON TABLE public.v_billing_overdue FROM anon;
REVOKE ALL PRIVILEGES ON TABLE public.v_billing_revenue_monthly FROM anon;
REVOKE ALL PRIVILEGES ON TABLE public.v_billing_tax_monthly FROM anon;
REVOKE ALL PRIVILEGES ON TABLE public.sop_version_history FROM anon;