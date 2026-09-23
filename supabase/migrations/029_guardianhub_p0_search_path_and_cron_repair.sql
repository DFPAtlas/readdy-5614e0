-- =============================================================================
-- GuardianHub Migration 029 — P0 Search Path and Cron Repair
-- =============================================================================
-- Forward-only follow-up to migration 028.
-- 1. Pins search_path on the two remaining SECURITY DEFINER functions flagged
--    by the Supabase security advisor.
-- 2. Removes duplicate active cron jobs for expire_shift_cover_offers(), while
--    preserving the oldest active registration.
-- 3. Removes direct client execution from trigger-only helpers.
-- =============================================================================

ALTER FUNCTION public.generate_incident_number()
  SET search_path TO public, pg_temp;

ALTER FUNCTION public.is_platform_staff()
  SET search_path TO public, pg_temp;

REVOKE EXECUTE ON FUNCTION public.prevent_subscription_field_tamper()
  FROM PUBLIC, anon, authenticated, service_role;

REVOKE EXECUTE ON FUNCTION public.prevent_subscription_field_update()
  FROM PUBLIC, anon, authenticated, service_role;

REVOKE EXECUTE ON FUNCTION public.set_site_notice_updated_at()
  FROM PUBLIC, anon, authenticated, service_role;

REVOKE EXECUTE ON FUNCTION public.set_updated_at()
  FROM PUBLIC, anon, authenticated, service_role;

REVOKE EXECUTE ON FUNCTION public.tg_billing_set_updated_at()
  FROM PUBLIC, anon, authenticated, service_role;

DO $migration$
DECLARE
  duplicate_job record;
BEGIN
  FOR duplicate_job IN
    SELECT jobid
    FROM cron.job
    WHERE active
      AND regexp_replace(lower(trim(command)), '[;[:space:]]', '', 'g')
          = 'selectexpire_shift_cover_offers()'
      AND jobid <> (
        SELECT min(jobid)
        FROM cron.job
        WHERE active
          AND regexp_replace(lower(trim(command)), '[;[:space:]]', '', 'g')
              = 'selectexpire_shift_cover_offers()'
      )
  LOOP
    PERFORM cron.unschedule(duplicate_job.jobid);
  END LOOP;
END
$migration$;

-- Verification queries:
-- SELECT proname, proconfig FROM pg_proc p
-- JOIN pg_namespace n ON n.oid = p.pronamespace
-- WHERE n.nspname = 'public'
--   AND proname IN ('generate_incident_number', 'is_platform_staff');
--
-- SELECT jobid, schedule, command, active
-- FROM cron.job
-- WHERE command ILIKE '%expire_shift_cover_offers%';
