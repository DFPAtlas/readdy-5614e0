-- GuardianHub Phase 15: Release Control, UAT and Go/No-Go data model
-- All tables are platform-staff-only via is_platform_staff().

-- Release versions (lifecycle: draft, ready_for_testing, testing, blocked,
-- awaiting_approval, approved, deploying, released, rolled_back, cancelled)
CREATE TABLE IF NOT EXISTS public.release_versions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  version text NOT NULL UNIQUE,
  environment text NOT NULL DEFAULT 'staging',
  owner_id uuid,
  status text NOT NULL DEFAULT 'draft',
  release_notes text,
  target_release_date date,
  is_current boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Launch checklist groups
CREATE TABLE IF NOT EXISTS public.release_checklists (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  category text,
  description text,
  display_order integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Launch checklist items (blocker flag drives automatic NO-GO)
CREATE TABLE IF NOT EXISTS public.release_checklist_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  checklist_id uuid REFERENCES public.release_checklists(id) ON DELETE CASCADE,
  key text UNIQUE,
  title text NOT NULL,
  owner_id uuid,
  status text NOT NULL DEFAULT 'not_started',
  evidence text,
  verification_date timestamptz,
  notes text,
  is_blocker boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Test suites (category drives weighted readiness score)
CREATE TABLE IF NOT EXISTS public.release_test_suites (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug text UNIQUE,
  name text NOT NULL,
  role text,
  component text,
  category text NOT NULL,
  description text,
  display_order integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Test cases within a suite
CREATE TABLE IF NOT EXISTS public.release_test_cases (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  suite_id uuid REFERENCES public.release_test_suites(id) ON DELETE CASCADE,
  name text NOT NULL,
  role text,
  component text,
  steps text,
  expected_result text,
  display_order integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Test runs
CREATE TABLE IF NOT EXISTS public.release_test_runs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  version_id uuid REFERENCES public.release_versions(id) ON DELETE CASCADE,
  name text NOT NULL,
  environment text NOT NULL DEFAULT 'staging',
  status text NOT NULL DEFAULT 'not_run',
  tester_id uuid,
  started_at timestamptz,
  completed_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Test results (not_run, running, passed, failed, blocked, skipped, not_applicable)
CREATE TABLE IF NOT EXISTS public.release_test_results (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  run_id uuid REFERENCES public.release_test_runs(id) ON DELETE CASCADE,
  case_id uuid REFERENCES public.release_test_cases(id) ON DELETE CASCADE,
  version_id uuid REFERENCES public.release_versions(id) ON DELETE CASCADE,
  result text NOT NULL DEFAULT 'not_run',
  tester_id uuid,
  environment text NOT NULL DEFAULT 'staging',
  notes text,
  screenshot_ref text,
  correlation_id text,
  related_defect_id uuid,
  browser_device text,
  is_automated boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Defects
CREATE TABLE IF NOT EXISTS public.release_defects (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  reference text UNIQUE,
  title text NOT NULL,
  description text,
  severity text NOT NULL DEFAULT 'medium',
  affected_role text,
  affected_tenant text,
  environment text NOT NULL DEFAULT 'staging',
  steps_to_reproduce text,
  expected_result text,
  actual_result text,
  evidence text,
  owner_id uuid,
  status text NOT NULL DEFAULT 'open',
  linked_test_case_id uuid REFERENCES public.release_test_cases(id) ON DELETE SET NULL,
  fix_version text,
  retest_result text,
  is_tenant_data_leak boolean NOT NULL DEFAULT false,
  accepted_risk_approver_id uuid,
  accepted_risk_reason text,
  created_at timestamptz NOT NULL DEFAULT now(),
  resolved_at timestamptz
);

-- Approvals (area: product, engineering, security, operations, finance, compliance)
CREATE TABLE IF NOT EXISTS public.release_approvals (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  version_id uuid REFERENCES public.release_versions(id) ON DELETE CASCADE,
  area text NOT NULL,
  approver_id uuid,
  decision text NOT NULL DEFAULT 'pending',
  conditions text,
  evidence_reviewed text,
  decided_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (version_id, area)
);

-- Evidence references (no secrets or raw sensitive payloads)
CREATE TABLE IF NOT EXISTS public.release_evidence (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  version_id uuid REFERENCES public.release_versions(id) ON DELETE CASCADE,
  type text,
  title text NOT NULL,
  reference text NOT NULL,
  notes text,
  uploaded_by uuid,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Deployments
CREATE TABLE IF NOT EXISTS public.release_deployments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  version_id uuid REFERENCES public.release_versions(id) ON DELETE CASCADE,
  environment text NOT NULL DEFAULT 'production',
  commit_sha text,
  deployed_by uuid,
  status text NOT NULL DEFAULT 'in_progress',
  backup_confirmed boolean NOT NULL DEFAULT false,
  migration_reviewed boolean NOT NULL DEFAULT false,
  maintenance_window boolean NOT NULL DEFAULT false,
  started_at timestamptz,
  completed_at timestamptz,
  smoke_test_result text,
  monitoring_confirmed boolean NOT NULL DEFAULT false,
  rollback_decision text,
  notes text,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Rollbacks
CREATE TABLE IF NOT EXISTS public.release_rollbacks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  version_id uuid REFERENCES public.release_versions(id) ON DELETE CASCADE,
  deployment_id uuid REFERENCES public.release_deployments(id) ON DELETE SET NULL,
  trigger text,
  authoriser_id uuid,
  rollback_version text,
  db_recovery_approach text,
  external_changes text,
  validation_results text,
  user_communication text,
  incident_ref text,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Audit events
CREATE TABLE IF NOT EXISTS public.release_audit_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  version_id uuid REFERENCES public.release_versions(id) ON DELETE CASCADE,
  actor_id uuid,
  action text NOT NULL,
  resource_type text,
  resource_id text,
  previous_state jsonb,
  new_state jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Agent readiness register
CREATE TABLE IF NOT EXISTS public.release_agent_readiness (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  agent_key text UNIQUE,
  name text NOT NULL,
  purpose text,
  trigger_type text,
  schedule text,
  input_source text,
  output_action text,
  human_approval_required boolean NOT NULL DEFAULT false,
  credentials_configured boolean NOT NULL DEFAULT false,
  last_success timestamptz,
  last_failed timestamptz,
  retry_status text NOT NULL DEFAULT 'none',
  owner_id uuid,
  enabled_environment text NOT NULL DEFAULT 'staging',
  readiness_status text NOT NULL DEFAULT 'not_started',
  required_in_production boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Post-launch watch metrics
CREATE TABLE IF NOT EXISTS public.release_launch_metrics (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  version_id uuid REFERENCES public.release_versions(id) ON DELETE CASCADE,
  metric_key text NOT NULL,
  metric_name text NOT NULL,
  owner_id uuid,
  watch_window text NOT NULL,
  escalation_threshold text,
  current_value numeric,
  status text NOT NULL DEFAULT 'not_started',
  notes text,
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (version_id, metric_key, watch_window)
);

-- Final recorded decisions
CREATE TABLE IF NOT EXISTS public.release_decisions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  version_id uuid REFERENCES public.release_versions(id) ON DELETE CASCADE,
  decision text NOT NULL,
  readiness_percentage numeric,
  decided_by uuid,
  conditions text,
  reasons jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_release_defects_severity_status ON public.release_defects (severity, status);
CREATE INDEX IF NOT EXISTS idx_release_test_results_case ON public.release_test_results (case_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_release_test_results_result ON public.release_test_results (result);
CREATE INDEX IF NOT EXISTS idx_release_test_cases_suite ON public.release_test_cases (suite_id, display_order);
ALTER TABLE public.release_test_cases ADD CONSTRAINT release_test_cases_suite_name_unique UNIQUE (suite_id, name);
CREATE INDEX IF NOT EXISTS idx_release_approvals_version ON public.release_approvals (version_id, area);
CREATE INDEX IF NOT EXISTS idx_release_checklist_items_group ON public.release_checklist_items (checklist_id, is_blocker, status);
CREATE INDEX IF NOT EXISTS idx_release_launch_metrics_version ON public.release_launch_metrics (version_id, watch_window);

-- Row Level Security (platform staff only)
ALTER TABLE public.release_versions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.release_checklists ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.release_checklist_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.release_test_suites ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.release_test_cases ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.release_test_runs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.release_test_results ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.release_defects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.release_approvals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.release_evidence ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.release_deployments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.release_rollbacks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.release_audit_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.release_agent_readiness ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.release_launch_metrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.release_decisions ENABLE ROW LEVEL SECURITY;

DO $$
DECLARE t text;
BEGIN
  FOREACH t IN ARRAY ARRAY[
    'release_versions','release_checklists','release_checklist_items',
    'release_test_suites','release_test_cases','release_test_runs',
    'release_test_results','release_defects','release_approvals',
    'release_evidence','release_deployments','release_rollbacks',
    'release_audit_events','release_agent_readiness',
    'release_launch_metrics','release_decisions'
  ] LOOP
    EXECUTE format('CREATE POLICY %I ON public.%I FOR SELECT USING (public.is_platform_staff())', 'p_' || t || '_read', t);
    EXECUTE format('CREATE POLICY %I ON public.%I FOR INSERT WITH CHECK (public.is_platform_staff())', 'p_' || t || '_insert', t);
    EXECUTE format('CREATE POLICY %I ON public.%I FOR UPDATE USING (public.is_platform_staff()) WITH CHECK (public.is_platform_staff())', 'p_' || t || '_update', t);
    EXECUTE format('CREATE POLICY %I ON public.%I FOR DELETE USING (public.is_platform_staff())', 'p_' || t || '_delete', t);
  END LOOP;
END $$;

-- Seed: default release version
INSERT INTO public.release_versions (version, environment, status, is_current, release_notes, target_release_date)
VALUES ('v1.0.0', 'staging', 'ready_for_testing', true, 'Initial production release candidate for GuardianHub.', CURRENT_DATE + 30)
ON CONFLICT (version) DO NOTHING;

-- Seed: approval areas for current version
INSERT INTO public.release_approvals (version_id, area)
SELECT v.id, a.area
FROM public.release_versions v,
LATERAL (VALUES ('product'), ('engineering'), ('security'), ('operations'), ('finance'), ('compliance')) AS a(area)
WHERE v.is_current = true
ON CONFLICT (version_id, area) DO NOTHING;

-- Seed: launch checklist groups
INSERT INTO public.release_checklists (name, category, description, display_order) VALUES
  ('Domain & Infrastructure', 'infrastructure', 'Domain, DNS, HTTPS and environment configuration', 1),
  ('Security', 'security', 'RLS, storage, auth and secret controls', 2),
  ('Payments', 'payments', 'Stripe live configuration and webhooks', 3),
  ('Automation', 'automation', 'n8n workflows and scheduled jobs', 4),
  ('Monitoring', 'monitoring', 'Observability, alerting and status', 5),
  ('Data & Recovery', 'recovery', 'Backups, restore drill and rollback', 6),
  ('Legal & Compliance', 'legal', 'Privacy, terms and cookie controls', 7),
  ('Support', 'support', 'Support contact and email templates', 8),
  ('Delivery', 'delivery', 'Migrations, CI/CD and admin accounts', 9)
ON CONFLICT DO NOTHING;

-- Seed: launch checklist items
INSERT INTO public.release_checklist_items (checklist_id, key, title, is_blocker, status)
SELECT g.id, i.key, i.title, i.blocker, 'not_started'
FROM (
  VALUES
    ('Domain & Infrastructure', 'domain-dns', 'Domain and DNS configured', false),
    ('Domain & Infrastructure', 'https', 'HTTPS enforced on all routes', false),
    ('Domain & Infrastructure', 'prod-env-vars', 'Production environment variables validated', false),
    ('Domain & Infrastructure', 'supabase-prod', 'Supabase production project configured', false),
    ('Security', 'rls-policies', 'RLS policies applied to all tables', true),
    ('Security', 'storage-policies', 'Storage policies protect tenant files', true),
    ('Security', 'auth-redirects', 'Auth redirect URLs allowlisted', false),
    ('Security', 'rate-limits', 'Rate limits on sensitive endpoints', true),
    ('Security', 'mfa-privileged', 'MFA enforced for privileged operators', true),
    ('Security', 'secret-scan', 'Secret scan returns no findings', true),
    ('Payments', 'stripe-live', 'Stripe live-mode configuration complete', true),
    ('Payments', 'stripe-webhook', 'Stripe webhook endpoint verified', true),
    ('Automation', 'n8n-prod', 'n8n production workflows deployed', false),
    ('Automation', 'scheduled-jobs', 'Scheduled jobs registered', false),
    ('Monitoring', 'monitoring', 'Monitoring connected', false),
    ('Monitoring', 'alerts', 'Alert rules configured', false),
    ('Monitoring', 'status-page', 'Status page available', false),
    ('Data & Recovery', 'backups', 'Production backups configured', true),
    ('Data & Recovery', 'restore-test', 'Backup and restore drill passed', true),
    ('Data & Recovery', 'rollback-procedure', 'Rollback procedure documented and tested', true),
    ('Legal & Compliance', 'privacy-pages', 'Privacy pages published', false),
    ('Legal & Compliance', 'terms', 'Terms published', false),
    ('Legal & Compliance', 'cookie-controls', 'Cookie consent controls working', false),
    ('Support', 'support-contact', 'Support contact configured', false),
    ('Support', 'email-templates', 'Email templates configured', false),
    ('Delivery', 'db-migrations', 'Database migrations reviewed', true),
    ('Delivery', 'provider-creds', 'Provider credentials configured', true),
    ('Delivery', 'ci-cd', 'CI/CD pipeline green', false),
    ('Delivery', 'admin-accounts', 'Admin accounts provisioned', false),
    ('Delivery', 'production-build', 'Production build passes', true)
) AS i(group_name, key, title, blocker)
JOIN public.release_checklists g ON g.name = i.group_name
ON CONFLICT (key) DO NOTHING;

-- Seed: agent readiness register
INSERT INTO public.release_agent_readiness
  (agent_key, name, purpose, trigger_type, schedule, input_source, output_action, human_approval_required, required_in_production, readiness_status, credentials_configured)
VALUES
  ('shift-reminder', 'Shift reminder agent', 'Remind guards of upcoming shifts', 'schedule', 'Daily', 'shifts', 'Notification to guard', false, true, 'not_started', false),
  ('late-checkin', 'Late/missed check-in agent', 'Detect missed check-ins and alert controller', 'event', 'On check-in window close', 'attendance_logs', 'Alert to controller', false, true, 'not_started', false),
  ('sos-escalation', 'SOS escalation agent', 'Escalate SOS events to configured contacts', 'event', 'On SOS activation', 'lone_worker_sessions', 'Critical alert and escalation', false, true, 'not_started', false),
  ('incident-notification', 'Incident notification agent', 'Notify controller on new incidents', 'event', 'On incident creation', 'incidents', 'Alert to controller', false, true, 'not_started', false),
  ('licence-expiry', 'Licence/document expiry agent', 'Warn of expiring SIA licences and documents', 'schedule', 'Daily', 'guards', 'Expiry notification', false, true, 'not_started', false),
  ('training-renewal', 'Training renewal agent', 'Warn of expiring training', 'schedule', 'Daily', 'training_completions', 'Renewal notification', false, true, 'not_started', false),
  ('timesheet-reminder', 'Timesheet reminder agent', 'Remind guards to submit timesheets', 'schedule', 'Weekly', 'attendance_logs', 'Notification to guard', false, true, 'not_started', false),
  ('invoice-reminder', 'Invoice reminder agent', 'Remind clients of outstanding invoices', 'schedule', 'Weekly', 'client_invoices', 'Invoice reminder', false, true, 'not_started', false),
  ('subscription-reconciliation', 'Subscription reconciliation agent', 'Reconcile Stripe subscription state', 'schedule', 'Daily', 'billing_subscription_events', 'Entitlement correction', false, true, 'not_started', false),
  ('notification-retry', 'Notification retry agent', 'Retry failed notification deliveries', 'schedule', 'Continuous', 'notification_jobs', 'Retry delivery', false, true, 'not_started', false),
  ('failed-event-recovery', 'Failed-event recovery agent', 'Recover dead-lettered events', 'schedule', 'Continuous', 'agent_webhook_events', 'Manual replay queue', true, true, 'not_started', false),
  ('daily-summary', 'Daily operations summary agent', 'Summarise daily operations', 'schedule', 'Daily', 'operations data', 'Summary report', false, false, 'not_started', false),
  ('data-retention', 'Data retention agent', 'Apply retention and deletion rules', 'schedule', 'Daily', 'retention_config', 'Deletion dry-run/apply', true, true, 'not_started', false),
  ('integrity-reconciliation', 'Integrity/reconciliation agent', 'Detect orphaned and duplicate records', 'schedule', 'Daily', 'database', 'Integrity report', false, true, 'not_started', false),
  ('health-monitoring', 'Health monitoring agent', 'Monitor provider and service health', 'schedule', 'Continuous', 'health-check', 'Degraded-state alert', false, true, 'not_started', false)
ON CONFLICT (agent_key) DO NOTHING;

-- ============================================================================
-- Seed: test suites and cases
-- ============================================================================

INSERT INTO public.release_test_suites (slug, name, role, component, category, description, display_order) VALUES
  ('platform-superadmin', 'Platform Superadmin UAT', 'platform_superadmin', 'platform', 'security', 'Platform administration, tenant and release controls', 1),
  ('company-owner', 'Security Company Owner/Admin UAT', 'company_admin', 'core', 'core_operations', 'Company, client, site, guard and billing administration', 2),
  ('operations-manager', 'Operations Manager/Controller UAT', 'operations_manager', 'operations', 'core_operations', 'Live operations, scheduling and incident control', 3),
  ('supervisor', 'Supervisor UAT', 'supervisor', 'operations', 'core_operations', 'Assigned sites, guard status and incident review', 4),
  ('guard', 'Guard Mobile UAT', 'guard', 'guard_mobile', 'guard_safety', 'Mobile guard workflows under field conditions', 5),
  ('client-user', 'Client User UAT', 'client_admin', 'client', 'core_operations', 'Client portal access and visibility controls', 6),
  ('finance-user', 'Finance User UAT', 'finance', 'finance', 'payments', 'Timesheets, invoicing and reconciliation', 7),
  ('recruitment-user', 'Recruitment User UAT', 'recruitment', 'recruitment', 'core_operations', 'Applications, vetting and SIA workflows', 8),
  ('tenant-isolation', 'Tenant Isolation Suite', 'platform', 'isolation', 'tenant_isolation', 'Cross-tenant access attempts must be denied', 9),
  ('supabase-security', 'Supabase Integration', 'platform', 'auth', 'security', 'Auth, RLS, storage, realtime and migrations', 10),
  ('stripe-integration', 'Stripe Integration', 'platform', 'payments', 'payments', 'Checkout, webhooks and entitlement changes', 11),
  ('n8n-agents', 'n8n and Agents Integration', 'platform', 'automation', 'reliability', 'Workflow signing, retries and dead-letter handling', 12),
  ('communication-providers', 'Communication Providers', 'platform', 'notifications', 'reliability', 'Email, SMS and push delivery', 13),
  ('journey-a', 'Journey A: New Security Company', 'company_admin', 'journey', 'core_operations', 'End-to-end registration to first shift', 14),
  ('journey-b', 'Journey B: Guard Deployment', 'guard', 'journey', 'core_operations', 'End-to-end shift to timesheet approval', 15),
  ('journey-c', 'Journey C: Incident', 'guard', 'journey', 'core_operations', 'End-to-end incident to report', 16),
  ('journey-d', 'Journey D: SOS', 'guard', 'sos', 'guard_safety', 'SOS activation to resolution including provider outages', 17),
  ('journey-e', 'Journey E: Billing', 'finance', 'journey', 'payments', 'Subscription to cancellation (test mode)', 18),
  ('journey-f', 'Journey F: Recruitment', 'recruitment', 'journey', 'core_operations', 'Application to assignment eligibility', 19),
  ('journey-g', 'Journey G: Client Delivery', 'client_admin', 'journey', 'core_operations', 'Contract to invoice visibility', 20),
  ('device-accessibility', 'Device and Accessibility', 'platform', 'ux', 'ux', 'Browser, viewport and accessibility checks', 21)
ON CONFLICT (slug) DO NOTHING;

INSERT INTO public.release_test_cases (suite_id, name, role, component, steps, expected_result, display_order)
SELECT s.id, c.name, c.role, c.component, c.steps, c.expected, c.ord
FROM (
  VALUES
    ('platform-superadmin', 'Access platform dashboard', 'platform_superadmin', 'platform', 'Sign in with superadmin credentials; open /admin', 'Dashboard renders all platform modules', 1),
    ('platform-superadmin', 'Create tenant', 'platform_superadmin', 'platform', 'Create a new security company tenant', 'Tenant created with isolated data', 2),
    ('platform-superadmin', 'Suspend tenant', 'platform_superadmin', 'platform', 'Suspend an active tenant', 'Tenant access revoked and marked suspended', 3),
    ('platform-superadmin', 'Restore tenant', 'platform_superadmin', 'platform', 'Restore a suspended tenant', 'Tenant access reinstated, data intact', 4),
    ('platform-superadmin', 'Subscription controls', 'platform_superadmin', 'platform', 'Change a tenant subscription plan', 'Entitlements update correctly', 5),
    ('platform-superadmin', 'Support access', 'platform_superadmin', 'platform', 'Open support access to a tenant', 'Authorised support can view tenant, audit logged', 6),
    ('platform-superadmin', 'Feature flags', 'platform_superadmin', 'platform', 'Toggle a feature flag', 'Flag applies or revokes correctly, history recorded', 7),
    ('platform-superadmin', 'Operations dashboard', 'platform_superadmin', 'platform', 'Open /admin/operations', 'Real telemetry and provider health shown', 8),
    ('platform-superadmin', 'Release control', 'platform_superadmin', 'platform', 'Open /admin/release-control', 'Release data renders, gated correctly', 9),
    ('platform-superadmin', 'Audit records', 'platform_superadmin', 'platform', 'Review platform audit log', 'Actions recorded with actor and state', 10),
    ('platform-superadmin', 'No tenant impersonation', 'platform_superadmin', 'platform', 'Attempt to act as another tenant', 'No cross-tenant impersonation path exists', 11),

    ('company-owner', 'Company onboarding', 'company_admin', 'core', 'Complete onboarding wizard', 'Company profile and settings saved', 1),
    ('company-owner', 'Team invitations', 'company_admin', 'core', 'Invite a team member', 'Invite sent, role assigned on accept', 2),
    ('company-owner', 'Roles and permissions', 'company_admin', 'core', 'Configure a custom role', 'Permissions apply to assigned users', 3),
    ('company-owner', 'Client management', 'company_admin', 'core', 'Create and edit a client', 'Client saved and visible', 4),
    ('company-owner', 'Site management', 'company_admin', 'core', 'Create a site under a client', 'Site saved with requirements', 5),
    ('company-owner', 'Contract setup', 'company_admin', 'core', 'Create a service contract', 'Contract stored with billing terms', 6),
    ('company-owner', 'Guard management', 'company_admin', 'core', 'Add a guard with SIA details', 'Guard profile saved', 7),
    ('company-owner', 'Scheduling', 'company_admin', 'core', 'Build a weekly rota', 'Rota published, shifts created', 8),
    ('company-owner', 'Reports', 'company_admin', 'core', 'Generate a report', 'Report renders correct data', 9),
    ('company-owner', 'Billing', 'company_admin', 'core', 'View invoices and payments', 'Billing data correct', 10),
    ('company-owner', 'Company settings', 'company_admin', 'core', 'Edit company settings', 'Settings persist', 11),
    ('company-owner', 'Data export', 'company_admin', 'core', 'Export company data', 'Export file generated and downloadable', 12),

    ('operations-manager', 'Live operations dashboard', 'operations_manager', 'operations', 'Open command centre', 'Live status visible', 1),
    ('operations-manager', 'Shift scheduling', 'operations_manager', 'operations', 'Create a shift', 'Shift saved', 2),
    ('operations-manager', 'Guard assignment', 'operations_manager', 'operations', 'Assign guard to shift', 'Assignment saved, guard notified', 3),
    ('operations-manager', 'Conflict detection', 'operations_manager', 'operations', 'Create overlapping shift', 'Conflict flagged', 4),
    ('operations-manager', 'Check-in monitoring', 'operations_manager', 'operations', 'Monitor check-ins', 'Check-in status visible in real time', 5),
    ('operations-manager', 'Late shift alert', 'operations_manager', 'operations', 'Guard misses check-in', 'Late or missed alert raised', 6),
    ('operations-manager', 'Incident management', 'operations_manager', 'operations', 'Open incident queue', 'Incidents listed with severity', 7),
    ('operations-manager', 'SOS acknowledgement', 'operations_manager', 'operations', 'Acknowledge an SOS', 'Acknowledgement recorded, escalation updates', 8),
    ('operations-manager', 'Escalation', 'operations_manager', 'operations', 'Escalate an incident', 'Escalation path executes', 9),
    ('operations-manager', 'Shift handover', 'operations_manager', 'operations', 'Record handover', 'Handover notes saved', 10),
    ('operations-manager', 'Real-time updates', 'operations_manager', 'operations', 'Receive realtime event', 'UI updates without refresh', 11),

    ('supervisor', 'Assigned sites', 'supervisor', 'operations', 'View assigned sites only', 'Only assigned sites visible', 1),
    ('supervisor', 'Assigned teams', 'supervisor', 'operations', 'View assigned guards', 'Only team guards visible', 2),
    ('supervisor', 'Guard status', 'supervisor', 'operations', 'View guard status', 'Statuses accurate', 3),
    ('supervisor', 'Check calls', 'supervisor', 'operations', 'Perform a check call', 'Check call logged', 4),
    ('supervisor', 'Incident review', 'supervisor', 'operations', 'Review incident', 'Incident details visible', 5),
    ('supervisor', 'Escalation', 'supervisor', 'operations', 'Escalate incident', 'Escalation executes', 6),
    ('supervisor', 'No finance access', 'supervisor', 'operations', 'Attempt to open finance', 'Access denied', 7),
    ('supervisor', 'No platform settings', 'supervisor', 'operations', 'Attempt platform settings', 'Access denied', 8),

    ('guard', 'Login', 'guard', 'guard_mobile', 'Sign in on mobile', 'Guard dashboard loads', 1),
    ('guard', 'Profile', 'guard', 'guard_mobile', 'View profile', 'Profile renders', 2),
    ('guard', 'Shift list', 'guard', 'guard_mobile', 'View shifts', 'Upcoming shifts listed', 3),
    ('guard', 'Shift details', 'guard', 'guard_mobile', 'Open a shift', 'Shift details render', 4),
    ('guard', 'Check-in', 'guard', 'guard_mobile', 'Check in at site', 'Check-in recorded with time and location', 5),
    ('guard', 'Location denied', 'guard', 'guard_mobile', 'Deny location permission', 'Graceful fallback, no crash', 6),
    ('guard', 'Location granted', 'guard', 'guard_mobile', 'Grant location', 'Accurate location captured', 7),
    ('guard', 'Geofence rejection', 'guard', 'guard_mobile', 'Check in outside geofence', 'Rejection with clear message', 8),
    ('guard', 'Check-out', 'guard', 'guard_mobile', 'Check out', 'Check-out recorded', 9),
    ('guard', 'Breaks', 'guard', 'guard_mobile', 'Start and end break', 'Break times recorded', 10),
    ('guard', 'Patrol checkpoints', 'guard', 'guard_mobile', 'Scan checkpoint', 'Patrol progress logged', 11),
    ('guard', 'Incident reporting', 'guard', 'guard_mobile', 'Report incident', 'Incident created with details', 12),
    ('guard', 'Evidence upload', 'guard', 'guard_mobile', 'Attach photo', 'Evidence attached', 13),
    ('guard', 'SOS activation', 'guard', 'sos', 'Activate SOS', 'SOS event created and escalated', 14),
    ('guard', 'Timesheet submission', 'guard', 'guard_mobile', 'Submit timesheet', 'Timesheet submitted for approval', 15),
    ('guard', 'Notifications', 'guard', 'guard_mobile', 'Receive notification', 'Push received', 16),
    ('guard', 'Offline behaviour', 'guard', 'guard_mobile', 'Go offline', 'Offline queue, syncs on reconnect', 17),

    ('client-user', 'Client dashboard', 'client_admin', 'client', 'Sign in as client', 'Client dashboard loads', 1),
    ('client-user', 'Authorised sites only', 'client_admin', 'client', 'View sites', 'Only authorised sites visible', 2),
    ('client-user', 'Shift visibility', 'client_admin', 'client', 'View scheduled shifts', 'Only own site shifts visible', 3),
    ('client-user', 'Incident visibility', 'client_admin', 'client', 'View incidents', 'Only permitted incidents visible', 4),
    ('client-user', 'Reports', 'client_admin', 'client', 'View service report', 'Report renders', 5),
    ('client-user', 'Contract documents', 'client_admin', 'client', 'View contracts', 'Only own contract docs visible', 6),
    ('client-user', 'Invoice visibility', 'client_admin', 'client', 'View invoices where permitted', 'Permitted invoices visible', 7),
    ('client-user', 'Support requests', 'client_admin', 'client', 'Raise support request', 'Request created', 8),
    ('client-user', 'No guard data', 'client_admin', 'client', 'Attempt to view guard data', 'Access denied', 9),
    ('client-user', 'No other client data', 'client_admin', 'client', 'Attempt other client data', 'Access denied', 10),

    ('finance-user', 'Timesheet approval', 'finance', 'finance', 'Approve timesheet', 'Approval recorded', 1),
    ('finance-user', 'Invoice creation', 'finance', 'finance', 'Create invoice', 'Invoice generated from timesheets', 2),
    ('finance-user', 'Payment reconciliation', 'finance', 'finance', 'Reconcile payment', 'Payment matched to invoice', 3),
    ('finance-user', 'Credit notes', 'finance', 'finance', 'Issue credit note', 'Credit note created', 4),
    ('finance-user', 'Exports', 'finance', 'finance', 'Export financial data', 'CSV or PDF generated', 5),
    ('finance-user', 'No operational access', 'finance', 'finance', 'Attempt ops data', 'Access denied', 6),
    ('finance-user', 'No platform access', 'finance', 'finance', 'Attempt platform settings', 'Access denied', 7),

    ('recruitment-user', 'Applications', 'recruitment', 'recruitment', 'View applications', 'Applications listed', 1),
    ('recruitment-user', 'Vetting', 'recruitment', 'recruitment', 'Progress vetting', 'Vetting status updates', 2),
    ('recruitment-user', 'SIA checks', 'recruitment', 'recruitment', 'Record SIA check', 'SIA result saved', 3),
    ('recruitment-user', 'Document review', 'recruitment', 'recruitment', 'Review document', 'Document marked reviewed', 4),
    ('recruitment-user', 'Training', 'recruitment', 'recruitment', 'Assign training', 'Training assigned', 5),
    ('recruitment-user', 'Candidate progression', 'recruitment', 'recruitment', 'Move stage', 'Stage history recorded', 6),
    ('recruitment-user', 'Expiry alerts', 'recruitment', 'recruitment', 'View expiry alerts', 'Alerts shown', 7),
    ('recruitment-user', 'No finance access', 'recruitment', 'recruitment', 'Attempt finance', 'Access denied', 8),
    ('recruitment-user', 'No platform access', 'recruitment', 'recruitment', 'Attempt platform', 'Access denied', 9),

    ('tenant-isolation', 'Read other tenant', 'platform', 'isolation', 'SELECT another tenant row', 'Denied', 1),
    ('tenant-isolation', 'Insert other tenant', 'platform', 'isolation', 'INSERT with foreign company_id', 'Denied', 2),
    ('tenant-isolation', 'Update other tenant', 'platform', 'isolation', 'UPDATE foreign row', 'Denied', 3),
    ('tenant-isolation', 'Delete other tenant', 'platform', 'isolation', 'DELETE foreign row', 'Denied', 4),
    ('tenant-isolation', 'Guess identifiers', 'platform', 'isolation', 'Probe random UUIDs', 'Denied, no data leak', 5),
    ('tenant-isolation', 'Storage cross-access', 'platform', 'isolation', 'Fetch other tenant file', 'Denied', 6),
    ('tenant-isolation', 'Realtime cross-subscribe', 'platform', 'isolation', 'Subscribe foreign channel', 'No events delivered', 7),
    ('tenant-isolation', 'Edge function foreign IDs', 'platform', 'isolation', 'Call with foreign ID', 'Denied or validated', 8),
    ('tenant-isolation', 'Copied URL report access', 'platform', 'isolation', 'Open copied report URL', 'Denied', 9),
    ('tenant-isolation', 'Client scope escape', 'platform', 'isolation', 'Access outside assigned client', 'Denied', 10),
    ('tenant-isolation', 'Tamper tenant or role', 'platform', 'isolation', 'Modify tenant or role via request', 'Rejected server-side', 11),
    ('tenant-isolation', 'Anonymous state', 'platform', 'isolation', 'Access as anonymous', 'Denied', 12),
    ('tenant-isolation', 'Suspended state', 'platform', 'isolation', 'Access as suspended', 'Denied', 13),
    ('tenant-isolation', 'Expired session', 'platform', 'isolation', 'Access with expired session', 'Denied', 14),

    ('supabase-security', 'Auth signup and signin', 'platform', 'auth', 'Exercise auth flows', 'Correct session issued', 1),
    ('supabase-security', 'Session expiry', 'platform', 'auth', 'Wait for session expiry', 'Session revoked', 2),
    ('supabase-security', 'RLS enforcement', 'platform', 'security', 'Verify RLS', 'Policies enforced', 3),
    ('supabase-security', 'Database functions', 'platform', 'security', 'Call secured RPC', 'Correct authorisation', 4),
    ('supabase-security', 'Edge functions', 'platform', 'security', 'Invoke function', 'JWT verified and scoped', 5),
    ('supabase-security', 'Storage policies', 'platform', 'security', 'Access storage', 'Policies enforce ownership', 6),
    ('supabase-security', 'Realtime', 'platform', 'security', 'Subscribe', 'Authorised channels only', 7),
    ('supabase-security', 'Migrations', 'platform', 'security', 'Apply migration', 'Idempotent, no data loss', 8),
    ('supabase-security', 'Security Advisor', 'platform', 'security', 'Run advisor', 'Findings reviewed, none critical', 9),
    ('supabase-security', 'Performance Advisor', 'platform', 'security', 'Run advisor', 'Findings reviewed', 10),

    ('stripe-integration', 'Checkout creation', 'platform', 'payments', 'Create checkout session', 'Session URL returned', 1),
    ('stripe-integration', 'Valid signed webhook', 'platform', 'payments', 'Send signed event', 'Event processed', 2),
    ('stripe-integration', 'Invalid signature rejection', 'platform', 'payments', 'Send bad signature', 'Rejected', 3),
    ('stripe-integration', 'Duplicate webhook', 'platform', 'payments', 'Replay event', 'Idempotent, no double processing', 4),
    ('stripe-integration', 'Delayed webhook', 'platform', 'payments', 'Delay event', 'Correct state after processing', 5),
    ('stripe-integration', 'Failed payment', 'platform', 'payments', 'Simulate failure', 'Correct failure state', 6),
    ('stripe-integration', 'Cancellation', 'platform', 'payments', 'Cancel subscription', 'Access changes', 7),
    ('stripe-integration', 'Entitlement change', 'platform', 'payments', 'Downgrade plan', 'Entitlements update', 8),
    ('stripe-integration', 'Test/live separation', 'platform', 'payments', 'Verify mode', 'Test mode isolated from live', 9),

    ('n8n-agents', 'Signed request', 'platform', 'automation', 'Send signed webhook', 'Workflow runs', 1),
    ('n8n-agents', 'Invalid signature rejection', 'platform', 'automation', 'Send bad signature', 'Rejected', 2),
    ('n8n-agents', 'Workflow success', 'platform', 'automation', 'Trigger workflow', 'Completes correctly', 3),
    ('n8n-agents', 'Workflow timeout', 'platform', 'automation', 'Simulate timeout', 'Timeout handled with retry', 4),
    ('n8n-agents', 'Retry', 'platform', 'automation', 'Force failure then retry', 'Retries with backoff', 5),
    ('n8n-agents', 'Duplicate event', 'platform', 'automation', 'Replay event', 'No duplicate side effect', 6),
    ('n8n-agents', 'Dead-letter', 'platform', 'automation', 'Exhaust retries', 'Moves to dead-letter', 7),
    ('n8n-agents', 'Manual replay', 'platform', 'automation', 'Replay dead-letter', 'Runs once, idempotent', 8),
    ('n8n-agents', 'Human approval', 'platform', 'automation', 'Require approval', 'Waits for approval', 9),
    ('n8n-agents', 'No browser secret', 'platform', 'automation', 'Inspect browser', 'n8n secret not exposed', 10),

    ('communication-providers', 'Email success', 'platform', 'notifications', 'Send email', 'Delivered', 1),
    ('communication-providers', 'Email failure', 'platform', 'notifications', 'Force failure', 'Retry or failure logged', 2),
    ('communication-providers', 'SMS success', 'platform', 'notifications', 'Send SMS', 'Delivered', 3),
    ('communication-providers', 'SMS failure', 'platform', 'notifications', 'Force failure', 'Logged with retry', 4),
    ('communication-providers', 'Push success', 'platform', 'notifications', 'Send push', 'Delivered', 5),
    ('communication-providers', 'Push failure', 'platform', 'notifications', 'Force failure', 'Logged', 6),
    ('communication-providers', 'Invalid destination', 'platform', 'notifications', 'Send to invalid', 'Rejected gracefully', 7),
    ('communication-providers', 'Rate limit', 'platform', 'notifications', 'Exceed rate', 'Throttled', 8),
    ('communication-providers', 'Retry', 'platform', 'notifications', 'Retry failed', 'Backoff retry', 9),
    ('communication-providers', 'Delivery status', 'platform', 'notifications', 'Check status', 'Status updated', 10),
    ('communication-providers', 'Template rendering', 'platform', 'notifications', 'Render template', 'Correct output', 11),

    ('journey-a', 'Landing to registration', 'company_admin', 'journey', 'Visit landing and register', 'Account created', 1),
    ('journey-a', 'Email verification', 'company_admin', 'journey', 'Verify email', 'Account verified', 2),
    ('journey-a', 'Onboarding', 'company_admin', 'journey', 'Complete onboarding', 'Company profile saved', 3),
    ('journey-a', 'Company creation', 'company_admin', 'journey', 'Create company', 'Company created', 4),
    ('journey-a', 'Subscription', 'company_admin', 'journey', 'Select plan', 'Plan attached', 5),
    ('journey-a', 'First client', 'company_admin', 'journey', 'Create client', 'Client saved', 6),
    ('journey-a', 'First site', 'company_admin', 'journey', 'Create site', 'Site saved', 7),
    ('journey-a', 'First guard', 'company_admin', 'journey', 'Add guard', 'Guard saved', 8),
    ('journey-a', 'First shift', 'company_admin', 'journey', 'Create shift', 'Shift saved', 9),

    ('journey-b', 'Create shift', 'guard', 'journey', 'Create shift', 'Saved', 1),
    ('journey-b', 'Assign guard', 'guard', 'journey', 'Assign guard', 'Assigned', 2),
    ('journey-b', 'Notify guard', 'guard', 'journey', 'Notification sent', 'Guard notified', 3),
    ('journey-b', 'Guard accepts', 'guard', 'journey', 'Accept shift', 'Accepted', 4),
    ('journey-b', 'Check-in', 'guard', 'journey', 'Check in', 'Recorded', 5),
    ('journey-b', 'Patrol', 'guard', 'journey', 'Complete patrol', 'Logged', 6),
    ('journey-b', 'Check-out', 'guard', 'journey', 'Check out', 'Recorded', 7),
    ('journey-b', 'Timesheet', 'guard', 'journey', 'Submit timesheet', 'Submitted', 8),
    ('journey-b', 'Approval', 'guard', 'journey', 'Approve timesheet', 'Approved', 9),

    ('journey-c', 'Guard creates incident', 'guard', 'journey', 'Create incident', 'Incident saved', 1),
    ('journey-c', 'Add evidence', 'guard', 'journey', 'Attach evidence', 'Evidence linked', 2),
    ('journey-c', 'Controller alert', 'guard', 'journey', 'Controller notified', 'Alert received', 3),
    ('journey-c', 'Supervisor review', 'guard', 'journey', 'Review incident', 'Reviewed', 4),
    ('journey-c', 'Client update', 'guard', 'journey', 'Notify client', 'Permitted update sent', 5),
    ('journey-c', 'Report generated', 'guard', 'journey', 'Generate report', 'Report correct', 6),
    ('journey-c', 'Audit history', 'guard', 'journey', 'Review audit', 'Full history retained', 7),

    ('journey-d', 'Guard activates SOS', 'guard', 'sos', 'Activate SOS', 'Event stored', 1),
    ('journey-d', 'Event stored', 'guard', 'sos', 'Verify persistence', 'SOS event persisted', 2),
    ('journey-d', 'Controller critical alert', 'guard', 'sos', 'Controller notified', 'Critical alert received', 3),
    ('journey-d', 'Acknowledgement', 'guard', 'sos', 'Acknowledge', 'Recorded', 4),
    ('journey-d', 'Escalation', 'guard', 'sos', 'Escalate', 'Escalation executes', 5),
    ('journey-d', 'Resolution', 'guard', 'sos', 'Resolve', 'Resolved', 6),
    ('journey-d', 'Post-event record', 'guard', 'sos', 'Review record', 'Full record retained', 7),
    ('journey-d', 'SMS unavailable', 'guard', 'sos', 'SOS without SMS', 'Event stored, alternative used', 8),
    ('journey-d', 'Email unavailable', 'guard', 'sos', 'SOS without email', 'Event stored', 9),
    ('journey-d', 'Maps unavailable', 'guard', 'sos', 'SOS without maps', 'Event stored', 10),
    ('journey-d', 'n8n unavailable', 'guard', 'sos', 'SOS without n8n', 'Event stored, degraded safe', 11),

    ('journey-e', 'Subscription selection', 'finance', 'journey', 'Select plan', 'Plan chosen', 1),
    ('journey-e', 'Stripe Checkout', 'finance', 'journey', 'Enter checkout', 'Checkout session', 2),
    ('journey-e', 'Signed webhook', 'finance', 'journey', 'Webhook received', 'Processed', 3),
    ('journey-e', 'Entitlement update', 'finance', 'journey', 'Entitlement applied', 'Access granted', 4),
    ('journey-e', 'Invoice and payment state', 'finance', 'journey', 'Verify state', 'Correct', 5),
    ('journey-e', 'Cancellation', 'finance', 'journey', 'Cancel', 'Access revoked', 6),
    ('journey-e', 'Access change', 'finance', 'journey', 'Verify change', 'Correct', 7),

    ('journey-f', 'Application', 'recruitment', 'journey', 'Submit application', 'Saved', 1),
    ('journey-f', 'Vetting', 'recruitment', 'journey', 'Progress vetting', 'Status updates', 2),
    ('journey-f', 'Document upload', 'recruitment', 'journey', 'Upload document', 'Stored', 3),
    ('journey-f', 'SIA verification', 'recruitment', 'journey', 'Verify SIA', 'Verified', 4),
    ('journey-f', 'Approval', 'recruitment', 'journey', 'Approve', 'Approved', 5),
    ('journey-f', 'Guard profile', 'recruitment', 'journey', 'Create guard', 'Profile created', 6),
    ('journey-f', 'Assignment eligibility', 'recruitment', 'journey', 'Check eligibility', 'Eligible or blocked correctly', 7),

    ('journey-g', 'Contract', 'client_admin', 'journey', 'Create contract', 'Saved', 1),
    ('journey-g', 'Site setup', 'client_admin', 'journey', 'Configure site', 'Setup complete', 2),
    ('journey-g', 'Scheduled coverage', 'client_admin', 'journey', 'Schedule shifts', 'Coverage scheduled', 3),
    ('journey-g', 'Incident and report access', 'client_admin', 'journey', 'Client views', 'Access correct', 4),
    ('journey-g', 'Service report', 'client_admin', 'journey', 'Generate report', 'Report correct', 5),
    ('journey-g', 'Invoice visibility', 'client_admin', 'journey', 'View invoice', 'Visible as permitted', 6),

    ('device-accessibility', 'Chrome desktop', 'platform', 'ux', 'Test page', 'Renders correctly', 1),
    ('device-accessibility', 'Edge desktop', 'platform', 'ux', 'Test page', 'Renders correctly', 2),
    ('device-accessibility', 'Firefox desktop', 'platform', 'ux', 'Test page', 'Renders correctly', 3),
    ('device-accessibility', 'Safari', 'platform', 'ux', 'Test page where available', 'Renders correctly', 4),
    ('device-accessibility', 'Android viewport', 'platform', 'ux', 'Mobile viewport', 'Responsive', 5),
    ('device-accessibility', 'iPhone viewport', 'platform', 'ux', 'Mobile viewport', 'Responsive', 6),
    ('device-accessibility', 'Tablet viewport', 'platform', 'ux', 'Tablet', 'Responsive', 7),
    ('device-accessibility', 'Keyboard navigation', 'platform', 'ux', 'Tab through', 'Focus visible and works', 8),
    ('device-accessibility', 'Visible focus', 'platform', 'ux', 'Check focus', 'Focus ring visible', 9),
    ('device-accessibility', 'Form labels', 'platform', 'ux', 'Check forms', 'Labels present', 10),
    ('device-accessibility', 'Error announcements', 'platform', 'ux', 'Trigger error', 'Announced', 11),
    ('device-accessibility', 'Colour contrast', 'platform', 'ux', 'Check contrast', 'Meets minimum', 12),
    ('device-accessibility', 'Zoom 200 percent', 'platform', 'ux', 'Zoom', 'Layout usable', 13),
    ('device-accessibility', 'Reduced motion', 'platform', 'ux', 'Enable reduced motion', 'Motion reduced', 14),
    ('device-accessibility', 'Responsive tables', 'platform', 'ux', 'Narrow viewport', 'Tables usable', 15),
    ('device-accessibility', 'Dialog focus trap', 'platform', 'ux', 'Open dialog', 'Focus trapped', 16),
    ('device-accessibility', 'Screen reader status', 'platform', 'ux', 'Use screen reader', 'Status announced', 17),
    ('device-accessibility', 'Touch targets', 'platform', 'ux', 'Tap targets', 'Adequate size', 18),
    ('device-accessibility', 'Loading state', 'platform', 'ux', 'Load page', 'Skeleton shown', 19),
    ('device-accessibility', 'Empty state', 'platform', 'ux', 'Empty data', 'Empty state shown', 20),
    ('device-accessibility', 'Error state', 'platform', 'ux', 'Trigger error', 'Error state shown', 21)
) AS c(suite_slug, name, role, component, steps, expected, ord)
JOIN public.release_test_suites s ON s.slug = c.suite_slug
ON CONFLICT DO NOTHING;

-- ============================================================================
-- Seed: post-launch watch metrics (13 metrics x 5 windows)
-- ============================================================================

INSERT INTO public.release_launch_metrics (version_id, metric_key, metric_name, watch_window, status)
SELECT v.id, m.key, m.name, w.win, 'not_started'
FROM public.release_versions v
CROSS JOIN (VALUES
  ('signups', 'Sign-ups'),
  ('onboarding_completion', 'Onboarding completion'),
  ('login_failures', 'Login failures'),
  ('checkin_failures', 'Guard check-in failures'),
  ('sos_events', 'SOS events'),
  ('incident_failures', 'Incident failures'),
  ('payment_failures', 'Payment failures'),
  ('webhook_backlog', 'Webhook backlog'),
  ('agent_failures', 'Agent failures'),
  ('notification_failures', 'Notification failures'),
  ('error_rate', 'Error rate'),
  ('performance', 'Performance'),
  ('support_requests', 'Support requests')
) AS m(key, name)
CROSS JOIN (VALUES ('1h'), ('24h'), ('72h'), ('7d'), ('30d')) AS w(win)
WHERE v.is_current = true
ON CONFLICT (version_id, metric_key, watch_window) DO NOTHING;