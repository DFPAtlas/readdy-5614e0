-- Phase 15: Release control data-model and seed verification
-- Run each block and confirm the EXPECTED result.

-- 1. Release data model tables exist (16 tables)
SELECT table_name FROM information_schema.tables
WHERE table_schema = 'public' AND table_name LIKE 'release_%'
ORDER BY table_name;
-- EXPECT: 16 tables

-- 2. Seed counts
SELECT
  (SELECT count(*) FROM public.release_versions) AS versions,
  (SELECT count(*) FROM public.release_approvals) AS approvals,
  (SELECT count(*) FROM public.release_checklists) AS checklist_groups,
  (SELECT count(*) FROM public.release_checklist_items) AS checklist_items,
  (SELECT count(*) FROM public.release_agent_readiness) AS agents,
  (SELECT count(*) FROM public.release_test_suites) AS suites,
  (SELECT count(*) FROM public.release_test_cases) AS cases,
  (SELECT count(*) FROM public.release_launch_metrics) AS launch_metrics;
-- EXPECT: versions=1, approvals=6, checklist_groups=9, checklist_items=30,
--         agents=15, suites=21, cases=216, launch_metrics=65

-- 3. Blocker checklist items are present
SELECT key, is_blocker FROM public.release_checklist_items WHERE is_blocker = true ORDER BY key;
-- EXPECT: 11 blocker items including production-build, restore-test, rollback-procedure, rls-policies

-- 4. Required production agents are present
SELECT count(*) AS required_agents FROM public.release_agent_readiness WHERE required_in_production = true;
-- EXPECT: 13 (all except daily-summary)

-- 5. SOS and auth test cases carry the correct component marker for the decision engine
SELECT count(*) AS sos_cases FROM public.release_test_cases WHERE component = 'sos';
SELECT count(*) AS auth_cases FROM public.release_test_cases WHERE component = 'auth';
-- EXPECT: sos_cases=11, auth_cases=2

-- 6. Tenant-isolation suite cases exist
SELECT count(*) FROM public.release_test_cases tc
JOIN public.release_test_suites ts ON ts.id = tc.suite_id
WHERE ts.category = 'tenant_isolation';
-- EXPECT: 14

-- 7. Decision engine requires no fake passing results on first run
SELECT count(*) FROM public.release_test_results;
-- EXPECT: 0 (no manufactured evidence)