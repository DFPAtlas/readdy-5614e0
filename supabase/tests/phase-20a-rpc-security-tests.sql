-- =============================================================================
-- Phase 20A — RPC security tests: guard_seed_first_run_policies
-- =============================================================================
-- Proves the repaired cross-tenant write is closed. Run this in the Supabase
-- SQL editor (which executes as the postgres role, so set_config on
-- request.jwt.claims works and auth.uid() is simulable).
--
-- auth.uid() reads request.jwt.claim.sub / request.jwt.claims, so we simulate a
-- signed-in user by setting request.jwt.claims to {"sub":"<user uuid>"}.
--
-- Every test records workforce_policies row counts before AND after the call,
-- because a returned error alone is not proof — we must confirm no rows moved.
-- =============================================================================

\set ON_ERROR_STOP on

-- ---------------------------------------------------------------------------
-- TEST 1 — Anonymous / unauthenticated call must raise and insert nothing.
-- ---------------------------------------------------------------------------
DO $$
DECLARE
  before_count bigint;
  after_count bigint;
  v_company uuid;
  did_raise boolean := false;
BEGIN
  SELECT company_id INTO v_company FROM public.companies ORDER BY created_at NULLS LAST LIMIT 1;

  PERFORM set_config('request.jwt.claims', '', true);

  SELECT count(*) INTO before_count
  FROM public.workforce_policies WHERE category = 'Guard First Run';

  BEGIN
    PERFORM public.guard_seed_first_run_policies(v_company);
  EXCEPTION WHEN OTHERS THEN
    did_raise := true;
  END;

  SELECT count(*) INTO after_count
  FROM public.workforce_policies WHERE category = 'Guard First Run';

  IF NOT did_raise THEN
    RAISE EXCEPTION 'TEST 1 FAIL: unauthenticated call did not raise';
  END IF;
  IF after_count <> before_count THEN
    RAISE EXCEPTION 'TEST 1 FAIL: unauthenticated call inserted rows (% -> %)', before_count, after_count;
  END IF;

  RAISE NOTICE 'TEST 1 PASS: unauthenticated call rejected, no rows inserted';
END $$;

-- ---------------------------------------------------------------------------
-- TEST 2 — Cross-tenant write denial (Tenant A user cannot seed Tenant B).
-- ---------------------------------------------------------------------------
DO $$
DECLARE
  tenant_a_user uuid;
  tenant_a_company uuid;
  tenant_b_company uuid;
  before_b bigint;
  after_b bigint;
BEGIN
  SELECT u.id, u.company_id INTO tenant_a_user, tenant_a_company
  FROM public.users u
  WHERE u.company_id IS NOT NULL
    AND (u.status IS NULL OR u.status = 'active')
  ORDER BY u.company_id
  LIMIT 1;

  SELECT id INTO tenant_b_company
  FROM public.companies
  WHERE id <> tenant_a_company
  ORDER BY created_at NULLS LAST
  LIMIT 1;

  IF tenant_a_user IS NULL OR tenant_b_company IS NULL THEN
    RAISE NOTICE 'TEST 2 SKIPPED: need at least two tenants';
    RETURN;
  END IF;

  PERFORM set_config('request.jwt.claims', format('{"sub":"%s","role":"authenticated"}', tenant_a_user), true);

  SELECT count(*) INTO before_b
  FROM public.workforce_policies
  WHERE company_id = tenant_b_company AND category = 'Guard First Run';

  PERFORM public.guard_seed_first_run_policies(tenant_b_company);

  SELECT count(*) INTO after_b
  FROM public.workforce_policies
  WHERE company_id = tenant_b_company AND category = 'Guard First Run';

  IF after_b <> before_b THEN
    RAISE EXCEPTION 'TEST 2 FAIL: cross-tenant write detected (% -> %)', before_b, after_b;
  END IF;

  RAISE NOTICE 'TEST 2 PASS: Tenant A cannot seed Tenant B (target rows unchanged: %)', after_b;
END $$;

-- ---------------------------------------------------------------------------
-- TEST 3 — Authorised active user can seed their own company (3 policies).
-- ---------------------------------------------------------------------------
DO $$
DECLARE
  v_user uuid;
  v_company uuid;
  before_count bigint;
  after_count bigint;
BEGIN
  SELECT u.id, u.company_id INTO v_user, v_company
  FROM public.users u
  WHERE u.company_id IS NOT NULL
    AND (u.status IS NULL OR u.status = 'active')
  ORDER BY u.company_id
  LIMIT 1;

  IF v_user IS NULL THEN
    RAISE NOTICE 'TEST 3 SKIPPED: no active user found';
    RETURN;
  END IF;

  PERFORM set_config('request.jwt.claims', format('{"sub":"%s","role":"authenticated"}', v_user), true);

  SELECT count(*) INTO before_count
  FROM public.workforce_policies
  WHERE company_id = v_company AND category = 'Guard First Run';

  PERFORM public.guard_seed_first_run_policies(v_company);

  SELECT count(*) INTO after_count
  FROM public.workforce_policies
  WHERE company_id = v_company AND category = 'Guard First Run';

  IF after_count <> before_count + 3 THEN
    RAISE EXCEPTION 'TEST 3 FAIL: expected +3 rows, got % -> %', before_count, after_count;
  END IF;

  RAISE NOTICE 'TEST 3 PASS: authorised user seeded own company (% -> % rows)', before_count, after_count;
END $$;

-- ---------------------------------------------------------------------------
-- TEST 4 — Idempotency: repeating the valid call creates no duplicates.
-- ---------------------------------------------------------------------------
DO $$
DECLARE
  v_user uuid;
  v_company uuid;
  before_count bigint;
  after_count bigint;
BEGIN
  SELECT u.id, u.company_id INTO v_user, v_company
  FROM public.users u
  WHERE u.company_id IS NOT NULL
    AND (u.status IS NULL OR u.status = 'active')
  ORDER BY u.company_id
  LIMIT 1;

  IF v_user IS NULL THEN
    RAISE NOTICE 'TEST 4 SKIPPED: no active user found';
    RETURN;
  END IF;

  PERFORM set_config('request.jwt.claims', format('{"sub":"%s","role":"authenticated"}', v_user), true);

  SELECT count(*) INTO before_count
  FROM public.workforce_policies
  WHERE company_id = v_company AND category = 'Guard First Run';

  PERFORM public.guard_seed_first_run_policies(v_company);
  PERFORM public.guard_seed_first_run_policies(v_company);

  SELECT count(*) INTO after_count
  FROM public.workforce_policies
  WHERE company_id = v_company AND category = 'Guard First Run';

  IF after_count <> before_count THEN
    RAISE EXCEPTION 'TEST 4 FAIL: duplicates created (% -> %)', before_count, after_count;
  END IF;

  RAISE NOTICE 'TEST 4 PASS: repeated seeding is idempotent (rows unchanged: %)', after_count;
END $$;

-- ---------------------------------------------------------------------------
-- TEST 5 — Suspended member cannot seed policies.
-- (Runs only if a suspended user exists in the dataset; otherwise skips.)
-- ---------------------------------------------------------------------------
DO $$
DECLARE
  v_user uuid;
  v_company uuid;
  before_count bigint;
  after_count bigint;
BEGIN
  SELECT u.id, u.company_id INTO v_user, v_company
  FROM public.users u
  WHERE u.company_id IS NOT NULL AND u.status = 'suspended'
  ORDER BY u.company_id
  LIMIT 1;

  IF v_user IS NULL THEN
    RAISE NOTICE 'TEST 5 SKIPPED: no suspended user in dataset (no-op is safe)';
    RETURN;
  END IF;

  PERFORM set_config('request.jwt.claims', format('{"sub":"%s","role":"authenticated"}', v_user), true);

  SELECT count(*) INTO before_count
  FROM public.workforce_policies
  WHERE company_id = v_company AND category = 'Guard First Run';

  PERFORM public.guard_seed_first_run_policies(v_company);

  SELECT count(*) INTO after_count
  FROM public.workforce_policies
  WHERE company_id = v_company AND category = 'Guard First Run';

  IF after_count <> before_count THEN
    RAISE EXCEPTION 'TEST 5 FAIL: suspended member seeded policies (% -> %)', before_count, after_count;
  END IF;

  RAISE NOTICE 'TEST 5 PASS: suspended member cannot seed policies';
END $$;

-- ---------------------------------------------------------------------------
-- TEST 6 — Null company id is a safe no-op (does not raise, inserts nothing).
-- ---------------------------------------------------------------------------
DO $$
DECLARE
  before_count bigint;
  after_count bigint;
BEGIN
  PERFORM set_config('request.jwt.claims', format('{"sub":"%s","role":"authenticated"}',
    (SELECT id FROM public.users WHERE company_id IS NOT NULL ORDER BY company_id LIMIT 1)), true);

  SELECT count(*) INTO before_count
  FROM public.workforce_policies WHERE category = 'Guard First Run';

  PERFORM public.guard_seed_first_run_policies(NULL);

  SELECT count(*) INTO after_count
  FROM public.workforce_policies WHERE category = 'Guard First Run';

  IF after_count <> before_count THEN
    RAISE EXCEPTION 'TEST 6 FAIL: null company id changed rows';
  END IF;

  RAISE NOTICE 'TEST 6 PASS: null company id is a safe no-op';
END $$;

RAISE NOTICE 'Phase 20A RPC security tests complete.';