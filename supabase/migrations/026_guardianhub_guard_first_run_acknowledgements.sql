-- GuardianHub Migration 026: Guard mobile first-run acknowledgements
-- Emergency guidance, location transparency notice and acceptable-use requirements
-- persisted via policy_acknowledgments (worker -> workforce_profiles, policy -> workforce_policies).

-- Idempotency: one acknowledgement row per worker per policy.
CREATE UNIQUE INDEX IF NOT EXISTS policy_ack_worker_policy_uniq
  ON public.policy_acknowledgments (worker_id, policy_id);

CREATE INDEX IF NOT EXISTS policy_ack_company_idx
  ON public.policy_acknowledgments (company_id);

CREATE INDEX IF NOT EXISTS policy_ack_policy_idx
  ON public.policy_acknowledgments (policy_id);

-- Ensure a workforce_profile exists for the authenticated guard and return its id.
CREATE OR REPLACE FUNCTION public.guard_ensure_workforce_profile()
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  v_company_id uuid;
  v_guard_id uuid;
  v_profile_id uuid;
BEGIN
  SELECT company_id INTO v_company_id FROM public.users WHERE id = auth.uid();
  IF v_company_id IS NULL THEN
    RETURN NULL;
  END IF;

  SELECT id INTO v_guard_id FROM public.guards
  WHERE user_id = auth.uid() AND company_id = v_company_id
  LIMIT 1;

  IF v_guard_id IS NULL THEN
    RETURN NULL;
  END IF;

  SELECT id INTO v_profile_id FROM public.workforce_profiles
  WHERE guard_id = v_guard_id
  LIMIT 1;

  IF v_profile_id IS NULL THEN
    INSERT INTO public.workforce_profiles (company_id, guard_id, user_id, engagement_type, employment_status, onboarding_status)
    VALUES (v_company_id, v_guard_id, auth.uid(), 'employee', 'active', 'active')
    RETURNING id INTO v_profile_id;
  END IF;

  RETURN v_profile_id;
END;
$$;

-- Idempotently seed the three guard first-run policies for a company.
CREATE OR REPLACE FUNCTION public.guard_seed_first_run_policies(p_company_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  IF p_company_id IS NULL THEN
    RETURN;
  END IF;

  IF auth.uid() IS NOT NULL AND p_company_id <> public.get_my_company_id() THEN
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

-- Return the guard's first-run policies with their current acknowledgement status.
CREATE OR REPLACE FUNCTION public.guard_get_first_run_acknowledgements()
RETURNS TABLE (
  policy_id uuid,
  title text,
  description text,
  content_text text,
  version integer,
  category text,
  acknowledged boolean,
  acknowledged_at timestamptz
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  v_company_id uuid;
  v_worker_id uuid;
BEGIN
  SELECT company_id INTO v_company_id FROM public.users WHERE id = auth.uid();
  IF v_company_id IS NULL THEN
    RETURN;
  END IF;

  PERFORM public.guard_seed_first_run_policies(v_company_id);
  SELECT public.guard_ensure_workforce_profile() INTO v_worker_id;

  RETURN QUERY
  SELECT
    wp.id,
    wp.title,
    wp.description,
    wp.content_text,
    COALESCE(wp.version, 1)::integer,
    wp.category,
    COALESCE(pa.acknowledged, false),
    pa.acknowledged_at
  FROM public.workforce_policies wp
  LEFT JOIN public.policy_acknowledgments pa
    ON pa.policy_id = wp.id AND pa.worker_id = v_worker_id
  WHERE wp.company_id = v_company_id
    AND wp.category = 'Guard First Run'
    AND wp.status = 'active'
    AND wp.is_mandatory = true
  ORDER BY wp.title;
END;
$$;

-- Acknowledge a single first-run policy for the authenticated guard (idempotent).
CREATE OR REPLACE FUNCTION public.guard_acknowledge_first_run_policy(p_policy_id uuid)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  v_company_id uuid;
  v_worker_id uuid;
  v_policy_company uuid;
  v_policy_version integer;
BEGIN
  SELECT company_id INTO v_company_id FROM public.users WHERE id = auth.uid();
  IF v_company_id IS NULL THEN
    RETURN false;
  END IF;

  SELECT company_id, COALESCE(version, 1)::integer
  INTO v_policy_company, v_policy_version
  FROM public.workforce_policies
  WHERE id = p_policy_id
    AND category = 'Guard First Run'
    AND status = 'active'
    AND is_mandatory = true;

  IF v_policy_company IS NULL OR v_policy_company <> v_company_id THEN
    RETURN false;
  END IF;

  SELECT public.guard_ensure_workforce_profile() INTO v_worker_id;
  IF v_worker_id IS NULL THEN
    RETURN false;
  END IF;

  INSERT INTO public.policy_acknowledgments (company_id, policy_id, policy_version, worker_id, acknowledged, viewed_at, acknowledged_at)
  VALUES (v_company_id, p_policy_id, v_policy_version, v_worker_id, true, now(), now())
  ON CONFLICT (worker_id, policy_id)
  DO UPDATE SET
    acknowledged = true,
    policy_version = EXCLUDED.policy_version,
    viewed_at = now(),
    acknowledged_at = now();

  RETURN true;
END;
$$;

-- Seed helper is internal only (called by the SECURITY DEFINER getter and migrations),
-- never directly by browser clients.
REVOKE EXECUTE ON FUNCTION public.guard_seed_first_run_policies(uuid) FROM anon, authenticated;

-- RLS: guards manage their own acknowledgements; HR/platform staff manage the rest.
CREATE POLICY ack_guard_select ON public.policy_acknowledgments
FOR SELECT USING (
  EXISTS (
    SELECT 1
    FROM public.workforce_profiles wp
    JOIN public.guards g ON g.id = wp.guard_id
    WHERE wp.id = worker_id AND g.user_id = auth.uid()
  )
);

CREATE POLICY ack_guard_insert ON public.policy_acknowledgments
FOR INSERT WITH CHECK (
  company_id = public.get_my_company_id()
  AND EXISTS (
    SELECT 1
    FROM public.workforce_profiles wp
    JOIN public.guards g ON g.id = wp.guard_id
    WHERE wp.id = worker_id AND g.user_id = auth.uid()
  )
);

CREATE POLICY ack_guard_update ON public.policy_acknowledgments
FOR UPDATE USING (
  EXISTS (
    SELECT 1
    FROM public.workforce_profiles wp
    JOIN public.guards g ON g.id = wp.guard_id
    WHERE wp.id = worker_id AND g.user_id = auth.uid()
  )
) WITH CHECK (
  company_id = public.get_my_company_id()
  AND EXISTS (
    SELECT 1
    FROM public.workforce_profiles wp
    JOIN public.guards g ON g.id = wp.guard_id
    WHERE wp.id = worker_id AND g.user_id = auth.uid()
  )
);

CREATE POLICY ack_hr_manage ON public.policy_acknowledgments
FOR ALL USING (
  public.is_super_admin()
  OR public.is_platform_staff()
  OR EXISTS (
    SELECT 1
    FROM public.user_roles ur
    JOIN public.roles r ON r.id = ur.role_id
    WHERE ur.user_id = auth.uid()
      AND ur.company_id = policy_acknowledgments.company_id
      AND r.name IN ('hr_manager', 'hr_director', 'Account Owner')
  )
) WITH CHECK (
  public.is_super_admin()
  OR public.is_platform_staff()
  OR EXISTS (
    SELECT 1
    FROM public.user_roles ur
    JOIN public.roles r ON r.id = ur.role_id
    WHERE ur.user_id = auth.uid()
      AND ur.company_id = policy_acknowledgments.company_id
      AND r.name IN ('hr_manager', 'hr_director', 'Account Owner')
  )
);