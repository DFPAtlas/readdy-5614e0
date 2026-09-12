-- =============================================================================
-- GuardianHub Migration 027 — Phase 20A Critical Security Repair
-- =============================================================================
-- Fixes the confirmed cross-tenant write vector in guard_seed_first_run_policies,
-- removes anonymous exposure on billing/SOP views, secures the incident-media
-- storage bucket, and applies least-privilege grants to exposed RPCs.
--
-- NOTE ON APPLICATION: the in-environment SQL runner blocks REVOKE and DROP for
-- data-safety. The function-body hardening, column add, bucket update and storage
-- policies below are applied live. The REVOKE/GRANT blocks (sections 2, 3, 4) must
-- be applied once via the Supabase SQL editor / `supabase db push`, where REVOKE is
-- permitted. They are idempotent (REVOKE of a non-existent grant is a no-op).
-- =============================================================================

-- ---------------------------------------------------------------------------
-- 1. HARDEN guard_seed_first_run_policies (applied live)
--    - Reject unauthenticated callers (auth.uid() IS NULL -> RAISE).
--    - Never trust the submitted p_company_id; derive the caller's company
--      server-side via get_my_company_id().
--    - Require active membership in the target company.
--    - Preserve idempotency (NOT EXISTS guards).
--    - Preserve the original signature/return type and policy content.
-- ---------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.guard_seed_first_run_policies(p_company_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public', 'pg_temp'
AS $$
DECLARE
  v_uid uuid := auth.uid();
  v_company uuid;
BEGIN
  IF v_uid IS NULL THEN
    RAISE EXCEPTION 'guard_seed_first_run_policies requires an authenticated user';
  END IF;

  IF p_company_id IS NULL THEN
    RETURN;
  END IF;

  v_company := public.get_my_company_id();

  IF v_company IS NULL OR v_company <> p_company_id THEN
    RETURN;
  END IF;

  IF NOT EXISTS (
    SELECT 1
    FROM public.users
    WHERE id = v_uid
      AND company_id = p_company_id
      AND (status IS NULL OR status = 'active')
  ) THEN
    RETURN;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM public.workforce_policies
    WHERE company_id = p_company_id AND category = 'Guard First Run' AND title = 'Emergency Guidance'
  ) THEN
    INSERT INTO public.workforce_policies (company_id, title, category, description, version, content_text, is_mandatory, applies_to_roles, status, requires_reacknowledgment_on_update, published_at)
    VALUES (
      p_company_id,
      'Emergency Guidance',
      'Guard First Run',
      'How to respond in a genuine emergency and when to use the SOS button.',
      1,
      'In a life-threatening or immediate emergency, always call the emergency services first (999 in the UK), then activate your GuardianHub SOS button. The SOS button alerts your control room with your current location so a controller can respond. Never rely solely on the app in a life-threatening situation. For non-emergency safety concerns, use normal check-in or incident reporting. This guidance does not replace your organisation''s emergency procedures or training.',
      true,
      ARRAY['Security Officer'],
      'active',
      true,
      now()
    );
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM public.workforce_policies
    WHERE company_id = p_company_id AND category = 'Guard First Run' AND title = 'Location Transparency Notice'
  ) THEN
    INSERT INTO public.workforce_policies (company_id, title, category, description, version, content_text, is_mandatory, applies_to_roles, status, requires_reacknowledgment_on_update, published_at)
    VALUES (
      p_company_id,
      'Location Transparency Notice',
      'Guard First Run',
      'When and why GuardianHub records your location during authorised work.',
      1,
      'GuardianHub records your location only during authorised work periods: from check-in until check-out, unless an emergency mode is clearly activated. Routine location tracking stops after you check out. Location is used to confirm site attendance, support lone-worker safety and enable SOS response. Your location is visible only to authorised operational staff for your company. You will see an on-screen indicator when tracking is active. You can ask your privacy or compliance contact about how your location data is used, stored or deleted.',
      true,
      ARRAY['Security Officer'],
      'active',
      true,
      now()
    );
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM public.workforce_policies
    WHERE company_id = p_company_id AND category = 'Guard First Run' AND title = 'Acceptable Use Policy'
  ) THEN
    INSERT INTO public.workforce_policies (company_id, title, category, description, version, content_text, is_mandatory, applies_to_roles, status, requires_reacknowledgment_on_update, published_at)
    VALUES (
      p_company_id,
      'Acceptable Use Policy',
      'Guard First Run',
      'Your responsibilities when using the GuardianHub app and company devices.',
      1,
      'Use the GuardianHub app and any company device responsibly and only for authorised work purposes. Do not share your login, falsify check-in or patrol records, disable location or safety features, or use the app to send inappropriate content. Protect any confidential client or colleague information you see. Report lost devices, security concerns or suspected misuse promptly. This policy does not replace your employment contract or company policies.',
      true,
      ARRAY['Security Officer'],
      'active',
      true,
      now()
    );
  END IF;
END;
$$;

-- ---------------------------------------------------------------------------
-- 2. LEAST-PRIVILEGE GRANTS — guard first-run RPCs
--    (REQUIRES manual application: the runner blocks REVOKE)
--    guard_seed_first_run_policies / guard_ensure_workforce_profile are internal
--    helpers invoked by the SECURITY DEFINER getter/acknowledge functions (which
--    execute as the function owner), so no client role needs direct EXECUTE.
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
-- 3. LEAST-PRIVILEGE GRANTS — other exposed RPCs
--    (REQUIRES manual application: the runner blocks REVOKE)
-- ---------------------------------------------------------------------------
-- Trigger-only helper; clients never invoke it directly.
REVOKE EXECUTE ON FUNCTION public.generate_incident_number()
  FROM PUBLIC, anon, authenticated, service_role;

-- Used inside RLS policies and edge functions; authenticated + service_role only.
REVOKE EXECUTE ON FUNCTION public.is_platform_staff()
  FROM PUBLIC, anon;

GRANT EXECUTE ON FUNCTION public.is_platform_staff()
  TO authenticated, service_role;

-- Browser/edge-function RPCs; authenticated + service_role only.
REVOKE EXECUTE ON FUNCTION public.sop_daily_queries(uuid, timestamptz)
  FROM PUBLIC, anon;

GRANT EXECUTE ON FUNCTION public.sop_daily_queries(uuid, timestamptz)
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
-- 4. REMOVE ANONYMOUS VIEW ACCESS
--    (REQUIRES manual application: the runner blocks REVOKE)
--    All views remain security_invoker=true; authenticated access is retained
--    and remains scoped by the underlying table RLS.
-- ---------------------------------------------------------------------------
REVOKE ALL PRIVILEGES ON TABLE public.v_billing_mrr_current FROM anon;
REVOKE ALL PRIVILEGES ON TABLE public.v_billing_overdue FROM anon;
REVOKE ALL PRIVILEGES ON TABLE public.v_billing_revenue_monthly FROM anon;
REVOKE ALL PRIVILEGES ON TABLE public.v_billing_tax_monthly FROM anon;
REVOKE ALL PRIVILEGES ON TABLE public.sop_version_history FROM anon;

-- ---------------------------------------------------------------------------
-- 5. SECURE INCIDENT-MEDIA STORAGE (applied live)
-- ---------------------------------------------------------------------------

-- 5a. Persist the storage path so displays can mint short-lived signed URLs.
ALTER TABLE public.incident_media ADD COLUMN IF NOT EXISTS storage_path text;

-- 5b. Make the bucket private and enforce size + MIME limits.
UPDATE storage.buckets
SET public = false,
    file_size_limit = 52428800,
    allowed_mime_types = ARRAY[
      'image/jpeg','image/png','image/webp','image/gif','image/heic','image/heif',
      'video/mp4','video/quicktime','video/webm','video/3gpp'
    ]
WHERE name = 'incident-media';

-- 5c. Tenant-scoped storage policies (path first segment = company_id).
CREATE POLICY incident_media_storage_insert ON storage.objects
FOR INSERT TO authenticated
WITH CHECK (
  bucket_id = 'incident-media'
  AND (storage.foldername(name))[1] = public.get_my_company_id()::text
);

CREATE POLICY incident_media_storage_select ON storage.objects
FOR SELECT TO authenticated
USING (
  bucket_id = 'incident-media'
  AND (
    (storage.foldername(name))[1] = public.get_my_company_id()::text
    OR public.is_super_admin()
    OR public.is_platform_staff()
  )
);

CREATE POLICY incident_media_storage_select_client ON storage.objects
FOR SELECT TO authenticated
USING (
  bucket_id = 'incident-media'
  AND EXISTS (
    SELECT 1
    FROM public.incident_media im
    JOIN public.incidents i ON i.id = im.incident_id
    JOIN public.sites s ON s.id = i.site_id
    JOIN public.client_users cu ON cu.client_id = s.client_id AND cu.user_id = auth.uid()
    WHERE i.client_visible = true
      AND im.client_visible = true
      AND im.filename = (storage.foldername(name))[array_length(storage.foldername(name), 1)]
      AND i.company_id::text = (storage.foldername(name))[1]
  )
);

CREATE POLICY incident_media_storage_update ON storage.objects
FOR UPDATE TO authenticated
USING (
  bucket_id = 'incident-media'
  AND (
    (storage.foldername(name))[1] = public.get_my_company_id()::text
    OR public.is_super_admin()
  )
)
WITH CHECK (
  bucket_id = 'incident-media'
  AND (
    (storage.foldername(name))[1] = public.get_my_company_id()::text
    OR public.is_super_admin()
  )
);

CREATE POLICY incident_media_storage_delete ON storage.objects
FOR DELETE TO authenticated
USING (
  bucket_id = 'incident-media'
  AND (
    (storage.foldername(name))[1] = public.get_my_company_id()::text
    OR public.is_super_admin()
  )
);