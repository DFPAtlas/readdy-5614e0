-- GuardianHub Phase 16 — Production Agent Runtime & n8n Workflow Pack
-- Extends existing agent tables (agent_registry, agent_execution_logs, agent_webhook_events,
-- automation_approvals, automation_audit_log, notification_jobs) instead of duplicating them.
-- Adds the scheduling, dead-letter, credential-status, health-check and replay-nonce tables.

-- 1. Extend agent_execution_logs with the full shared-runtime lifecycle
ALTER TABLE public.agent_execution_logs
  ADD COLUMN IF NOT EXISTS environment text,
  ADD COLUMN IF NOT EXISTS trigger_type text,
  ADD COLUMN IF NOT EXISTS triggering_record_id uuid,
  ADD COLUMN IF NOT EXISTS idempotency_key text,
  ADD COLUMN IF NOT EXISTS correlation_id text,
  ADD COLUMN IF NOT EXISTS priority text NOT NULL DEFAULT 'normal',
  ADD COLUMN IF NOT EXISTS attempt_count integer NOT NULL DEFAULT 1,
  ADD COLUMN IF NOT EXISTS max_attempts integer NOT NULL DEFAULT 5,
  ADD COLUMN IF NOT EXISTS scheduled_at timestamptz,
  ADD COLUMN IF NOT EXISTS error_code text,
  ADD COLUMN IF NOT EXISTS approval_status text,
  ADD COLUMN IF NOT EXISTS n8n_execution_ref text,
  ADD COLUMN IF NOT EXISTS safe_input_summary jsonb,
  ADD COLUMN IF NOT EXISTS safe_output_summary jsonb,
  ADD COLUMN IF NOT EXISTS version text,
  ADD COLUMN IF NOT EXISTS owner_id uuid;

-- 2. Extend agent_registry with runtime control fields
ALTER TABLE public.agent_registry
  ADD COLUMN IF NOT EXISTS owner_id uuid,
  ADD COLUMN IF NOT EXISTS schedule text,
  ADD COLUMN IF NOT EXISTS enabled_environment text,
  ADD COLUMN IF NOT EXISTS paused boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS last_run_at timestamptz,
  ADD COLUMN IF NOT EXISTS last_status text;

-- 3. Extend automation_approvals with risk / decision metadata
ALTER TABLE public.automation_approvals
  ADD COLUMN IF NOT EXISTS risk_level text,
  ADD COLUMN IF NOT EXISTS reason text,
  ADD COLUMN IF NOT EXISTS expected_effect jsonb,
  ADD COLUMN IF NOT EXISTS decided_by uuid,
  ADD COLUMN IF NOT EXISTS decided_at timestamptz;

-- 4. New tables (no duplicates of existing agent tables)
CREATE TABLE IF NOT EXISTS public.agent_schedules (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  agent_key text NOT NULL,
  company_id uuid,
  cron_expression text,
  next_run_at timestamptz,
  enabled boolean NOT NULL DEFAULT true,
  paused boolean NOT NULL DEFAULT false,
  environment text NOT NULL DEFAULT 'staging',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.agent_dead_letters (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  agent_key text NOT NULL,
  company_id uuid,
  execution_id uuid,
  event_type text,
  safe_payload jsonb,
  error_code text,
  error_message text,
  attempt_count integer NOT NULL DEFAULT 0,
  status text NOT NULL DEFAULT 'dead_lettered',
  resolved_by uuid,
  resolved_at timestamptz,
  resolution text,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.agent_credentials_status (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  agent_key text NOT NULL,
  provider text NOT NULL,
  status text NOT NULL DEFAULT 'not_configured',
  secret_reference text,
  environment text NOT NULL DEFAULT 'staging',
  last_checked_at timestamptz,
  note text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (agent_key, provider, environment)
);

CREATE TABLE IF NOT EXISTS public.agent_health_checks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  agent_key text,
  check_type text NOT NULL,
  status text NOT NULL,
  safe_details jsonb,
  environment text NOT NULL DEFAULT 'staging',
  checked_at timestamptz NOT NULL DEFAULT now()
);

-- Nonce store for replay protection of signed requests/callbacks
CREATE TABLE IF NOT EXISTS public.agent_replay_nonces (
  nonce text PRIMARY KEY,
  used_at timestamptz NOT NULL DEFAULT now(),
  expires_at timestamptz NOT NULL
);

-- 5. Indexes (agent, tenant, status, priority, scheduled time, idempotency key)
CREATE UNIQUE INDEX IF NOT EXISTS agent_executions_idempotency_idx
  ON public.agent_execution_logs (agent_key, idempotency_key)
  WHERE idempotency_key IS NOT NULL;

CREATE INDEX IF NOT EXISTS agent_executions_agent_status_idx
  ON public.agent_execution_logs (agent_key, status);
CREATE INDEX IF NOT EXISTS agent_executions_company_idx
  ON public.agent_execution_logs (company_id);
CREATE INDEX IF NOT EXISTS agent_executions_scheduled_idx
  ON public.agent_execution_logs (scheduled_at);
CREATE INDEX IF NOT EXISTS agent_executions_priority_idx
  ON public.agent_execution_logs (priority);
CREATE INDEX IF NOT EXISTS agent_executions_correlation_idx
  ON public.agent_execution_logs (correlation_id);
CREATE INDEX IF NOT EXISTS agent_dead_letters_agent_status_idx
  ON public.agent_dead_letters (agent_key, status);
CREATE INDEX IF NOT EXISTS agent_schedules_agent_idx
  ON public.agent_schedules (agent_key, enabled);
CREATE INDEX IF NOT EXISTS agent_schedules_next_run_idx
  ON public.agent_schedules (next_run_at);
CREATE INDEX IF NOT EXISTS agent_health_checks_agent_idx
  ON public.agent_health_checks (agent_key, checked_at DESC);
CREATE INDEX IF NOT EXISTS agent_credentials_status_agent_idx
  ON public.agent_credentials_status (agent_key, provider);

-- 6. RLS on new tables
ALTER TABLE public.agent_schedules ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.agent_dead_letters ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.agent_credentials_status ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.agent_health_checks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.agent_replay_nonces ENABLE ROW LEVEL SECURITY;

-- agent_schedules: platform staff full, tenant read own
DROP POLICY IF EXISTS "agent_schedules_platform_manage" ON public.agent_schedules;
CREATE POLICY "agent_schedules_platform_manage" ON public.agent_schedules
  FOR ALL TO authenticated
  USING (is_platform_staff() OR is_super_admin())
  WITH CHECK (is_platform_staff() OR is_super_admin());
DROP POLICY IF EXISTS "agent_schedules_tenant_read" ON public.agent_schedules;
CREATE POLICY "agent_schedules_tenant_read" ON public.agent_schedules
  FOR SELECT TO authenticated
  USING (company_id = get_my_company_id());

-- agent_dead_letters: platform staff full, tenant read own
DROP POLICY IF EXISTS "agent_dead_letters_platform_manage" ON public.agent_dead_letters;
CREATE POLICY "agent_dead_letters_platform_manage" ON public.agent_dead_letters
  FOR ALL TO authenticated
  USING (is_platform_staff() OR is_super_admin())
  WITH CHECK (is_platform_staff() OR is_super_admin());
DROP POLICY IF EXISTS "agent_dead_letters_tenant_read" ON public.agent_dead_letters;
CREATE POLICY "agent_dead_letters_tenant_read" ON public.agent_dead_letters
  FOR SELECT TO authenticated
  USING (company_id = get_my_company_id());

-- agent_credentials_status: platform staff only (infrastructure state)
DROP POLICY IF EXISTS "agent_credentials_status_platform" ON public.agent_credentials_status;
CREATE POLICY "agent_credentials_status_platform" ON public.agent_credentials_status
  FOR ALL TO authenticated
  USING (is_platform_staff() OR is_super_admin())
  WITH CHECK (is_platform_staff() OR is_super_admin());

-- agent_health_checks: platform staff only
DROP POLICY IF EXISTS "agent_health_checks_platform" ON public.agent_health_checks;
CREATE POLICY "agent_health_checks_platform" ON public.agent_health_checks
  FOR ALL TO authenticated
  USING (is_platform_staff() OR is_super_admin())
  WITH CHECK (is_platform_staff() OR is_super_admin());

-- agent_replay_nonces: no client access (service-role only)
DROP POLICY IF EXISTS "agent_replay_nonces_no_client" ON public.agent_replay_nonces;
CREATE POLICY "agent_replay_nonces_no_client" ON public.agent_replay_nonces
  FOR ALL TO authenticated
  USING (false);

-- 7. Close the wide-open cross-tenant SELECT policy on agent_execution_logs
ALTER POLICY "Authenticated users can read their client agent logs" ON public.agent_execution_logs
  TO authenticated
  USING (company_id = get_my_company_id() OR is_super_admin() OR is_platform_staff() OR user_id = auth.uid());

-- Platform staff full read on executions (existing tenant policies already cover tenant read)
DROP POLICY IF EXISTS "agent_executions_platform_staff_read" ON public.agent_execution_logs;
CREATE POLICY "agent_executions_platform_staff_read" ON public.agent_execution_logs
  FOR SELECT TO authenticated
  USING (is_platform_staff() OR is_super_admin());

-- Platform staff manage the agent registry (see inactive + paused agents)
DROP POLICY IF EXISTS "agent_registry_platform_manage" ON public.agent_registry;
CREATE POLICY "agent_registry_platform_manage" ON public.agent_registry
  FOR ALL TO authenticated
  USING (is_platform_staff() OR is_super_admin())
  WITH CHECK (is_platform_staff() OR is_super_admin());