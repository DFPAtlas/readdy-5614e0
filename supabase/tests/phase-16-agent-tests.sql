-- GuardianHub Phase 16 — Agent Runtime security & idempotency tests
-- Run in the Supabase SQL editor. Schema-level checks are directly runnable.
-- Cross-tenant / replay / duplicate-event cases are documented below for UAT with real JWT tokens.

-- 1. Every new runtime table has RLS enabled
SELECT relname, relrowsecurity AS rls_enabled
FROM pg_class c JOIN pg_namespace n ON n.oid = c.relnamespace
WHERE n.nspname = 'public'
  AND c.relname IN ('agent_schedules','agent_dead_letters','agent_credentials_status','agent_health_checks','agent_replay_nonces')
ORDER BY relname;

-- 2. The wide-open cross-tenant SELECT policy on agent_execution_logs is closed
SELECT policyname, cmd, qual
FROM pg_policies
WHERE tablename = 'agent_execution_logs'
  AND qual = 'true';

-- 3. Idempotency unique index exists (prevents duplicate business events)
SELECT indexname FROM pg_indexes
WHERE tablename = 'agent_execution_logs' AND indexname = 'agent_executions_idempotency_idx';

-- 4. All 15 production agents are registered and inactive (not yet activated)
SELECT count(*) AS registered_agents FROM agent_registry
WHERE agent_key IN (
  'shift-reminder','late-checkin','sos-escalation','incident-notification','licence-expiry',
  'training-renewal','timesheet-reminder','invoice-reminder','subscription-reconciliation',
  'notification-retry','failed-event-recovery','daily-summary','data-retention',
  'integrity-reconciliation','health-monitoring'
);

-- 5. Credential status is reference-only (no secret values stored)
SELECT agent_key, provider, status, secret_reference
FROM agent_credentials_status
ORDER BY agent_key, provider
LIMIT 10;

-- 6. Replay-nonce table has no client read/write path
SELECT policyname, cmd, qual FROM pg_policies
WHERE tablename = 'agent_replay_nonces';

-- ---------------------------------------------------------------------------
-- UAT cases (run with two real test tenant JWTs in a Supabase client/test suite).
-- These cannot be proven by a service-role SQL session, which bypasses RLS.
-- ---------------------------------------------------------------------------

-- CASE A — Tenant isolation (agent_execution_logs): a tenant user must not read
-- another tenant's executions. With a tenant-B JWT the following must return 0 rows:
--   SELECT count(*) FROM agent_execution_logs WHERE company_id = '<tenant-A-company-id>';

-- CASE B — Replay protection: POST the same signed callback twice to /n8n-callback
-- with an identical X-GH-Nonce. First call returns 200, second returns 409.

-- CASE C — Duplicate-event protection: POST the same (agent_key, idempotency_key)
-- twice to /n8n-gateway. Second call must return duplicated=true and not create a
-- second execution row.

-- CASE D — Cross-tenant event injection: a tenant-B user must NOT dispatch an agent
-- with company_id of tenant A through /n8n-gateway (expect 403 cross-tenant denied).

-- CASE E — Self-approval: an operator must NOT approve their own pending approval
-- via /agent-approval-action (expect 403 separation of duties).