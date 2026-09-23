-- =============================================================================
-- GuardianHub Migration 029 — Data Integrity & RLS Verification Repair
-- =============================================================================
-- Prompt 3 (Supabase Data Integrity & RLS Verification) surfaced two facts:
--
--   (1) public.sop_version_history was a SECURITY DEFINER-equivalent view
--       (security_invoker=false, owned by postgres) while the anon role still
--       held full privileges. Because it ran as the owner (bypassing RLS), an
--       unauthenticated caller could read every tenant's SOP version history
--       (title, file_url, file_name, change_notes, company_id, site_id).
--       Migration 028 claimed "security_invoker=true (verified live)" but the
--       live catalog showed security_invoker=false and anon still granted.
--
--   (2) The REVOKE/GRANT statements in migrations 027 and 028 were never
--       applied to the live instance (the in-environment runner blocks REVOKE),
--       so anon retained EXECUTE on the exposed RPCs below.
--
-- This forward-only migration:
--   * converts sop_version_history to run as invoker so underlying RLS applies,
--   * revokes anon from the billing/SOP views (idempotent), and
--   * re-states the reviewed least-privilege RPC grants (idempotent).
--
-- Apply via the Supabase SQL editor or `supabase db push` — NOT via a runner
-- that blocks REVOKE. REVOKE of a non-existent grant is a no-op.
-- =============================================================================

-- ---------------------------------------------------------------------------
-- 1. Harden sop_version_history (CRITICAL — cross-tenant read fix)
-- ---------------------------------------------------------------------------
ALTER VIEW public.sop_version_history SET (security_invoker = on);

-- ---------------------------------------------------------------------------
-- 2. Remove anonymous access to billing/SOP views (idempotent)
--    Views run as invoker; authenticated access stays scoped by table RLS.
-- ---------------------------------------------------------------------------
REVOKE ALL PRIVILEGES ON TABLE public.sop_version_history FROM anon;
REVOKE ALL PRIVILEGES ON TABLE public.v_billing_mrr_current FROM anon;
REVOKE ALL PRIVILEGES ON TABLE public.v_billing_overdue FROM anon;
REVOKE ALL PRIVILEGES ON TABLE public.v_billing_revenue_monthly FROM anon;
REVOKE ALL PRIVILEGES ON TABLE public.v_billing_tax_monthly FROM anon;

-- ---------------------------------------------------------------------------
-- 3. Guard first-run RPCs (SECURITY DEFINER)
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
-- 4. Other exposed RPCs
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
-- 5. Trigger-only helpers (defense-in-depth)
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