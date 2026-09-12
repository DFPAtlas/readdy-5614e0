-- GuardianHub Phase 14: Observability, retention config, ops incidents, performance indexes

-- Performance indexes (verified access patterns)
CREATE INDEX IF NOT EXISTS idx_shifts_site_status ON public.shifts (site_id, status);
CREATE INDEX IF NOT EXISTS idx_shifts_start_time ON public.shifts (start_time DESC);
CREATE INDEX IF NOT EXISTS idx_attendance_guard_clockin ON public.attendance_logs (guard_id, clock_in DESC);
CREATE INDEX IF NOT EXISTS idx_attendance_shift ON public.attendance_logs (shift_id);
CREATE INDEX IF NOT EXISTS idx_incidents_site ON public.incidents (site_id);
CREATE INDEX IF NOT EXISTS idx_incidents_status_occurred ON public.incidents (company_id, status, occurred_at DESC);
CREATE INDEX IF NOT EXISTS idx_incidents_guard ON public.incidents (guard_id);
CREATE INDEX IF NOT EXISTS idx_billing_webhook_received ON public.billing_webhook_events (received_at DESC);
CREATE INDEX IF NOT EXISTS idx_billing_webhook_errors ON public.billing_webhook_events (error) WHERE error IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_notif_deliveries_notification ON public.notification_deliveries (notification_id);
CREATE INDEX IF NOT EXISTS idx_notif_deliveries_status ON public.notification_deliveries (status);
CREATE INDEX IF NOT EXISTS idx_notifications_company ON public.notifications (company_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_security_events_severity ON public.platform_security_events (severity, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_security_events_confirmed ON public.platform_security_events (is_confirmed_incident) WHERE is_confirmed_incident = true;
CREATE INDEX IF NOT EXISTS idx_support_access_status_expiry ON public.support_access_logs (status, expires_at);
CREATE INDEX IF NOT EXISTS idx_data_requests_export_expiry ON public.data_requests (export_expires_at) WHERE export_expires_at IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_data_requests_deadline ON public.data_requests (statutory_deadline) WHERE statutory_deadline IS NOT NULL;

-- Deployment records (CI/CD audit)
CREATE TABLE IF NOT EXISTS public.deployment_records (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  environment text NOT NULL,
  commit_sha text,
  version text,
  deployed_by uuid,
  deployed_at timestamptz NOT NULL DEFAULT now(),
  status text NOT NULL DEFAULT 'deployed',
  rollback_to text,
  notes text,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Configurable retention periods (legal review required before finalising values)
CREATE TABLE IF NOT EXISTS public.retention_config (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  record_category text NOT NULL UNIQUE,
  retention_days integer NOT NULL DEFAULT 365,
  is_enabled boolean NOT NULL DEFAULT true,
  legal_review_required boolean NOT NULL DEFAULT true,
  notes text,
  updated_by uuid,
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Infrastructure / provider incidents (runbook-backed)
CREATE TABLE IF NOT EXISTS public.ops_incidents (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  severity text NOT NULL DEFAULT 'P3',
  status text NOT NULL DEFAULT 'investigating',
  title text NOT NULL,
  description text,
  provider text,
  correlation_id text,
  owner_id uuid,
  runbook_ref text,
  started_at timestamptz NOT NULL DEFAULT now(),
  resolved_at timestamptz,
  post_incident_review text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Sanitised frontend/edge error telemetry (ingested by report-error function)
CREATE TABLE IF NOT EXISTS public.ops_error_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  environment text,
  severity text NOT NULL DEFAULT 'P3',
  source text,
  event text,
  message text,
  correlation_id text,
  stack text,
  context jsonb,
  user_id uuid,
  company_id uuid,
  ip text,
  user_agent text,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Seed retention defaults (operational guidance only, not legal advice)
INSERT INTO public.retention_config (record_category, retention_days, is_enabled, legal_review_required, notes) VALUES
  ('audit_logs', 2555, true, true, 'Platform audit logs'),
  ('exact_location_history', 180, true, true, 'GPS check-in and patrol scan coordinates'),
  ('incident_evidence', 2190, true, true, 'Incident media and evidence files'),
  ('vetting_documents', 2555, true, true, 'SIA, identity and RTW checks'),
  ('application_records', 365, true, true, 'Recruitment applications'),
  ('notification_logs', 365, true, false, 'Notification deliveries'),
  ('automation_payloads', 90, true, false, 'Agent execution request/response payloads'),
  ('export_files', 7, true, false, 'Temporary data exports'),
  ('temporary_uploads', 30, true, false, 'Unassociated temporary uploads'),
  ('support_attachments', 730, true, true, 'Support case attachments')
ON CONFLICT (record_category) DO NOTHING;

-- Row Level Security
ALTER TABLE public.deployment_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.retention_config ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ops_incidents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ops_error_events ENABLE ROW LEVEL SECURITY;

CREATE POLICY deployment_records_read ON public.deployment_records FOR SELECT USING (public.is_platform_staff());
CREATE POLICY deployment_records_insert ON public.deployment_records FOR INSERT WITH CHECK (public.is_platform_staff());
CREATE POLICY deployment_records_update ON public.deployment_records FOR UPDATE USING (public.is_platform_staff()) WITH CHECK (public.is_platform_staff());

CREATE POLICY retention_config_read ON public.retention_config FOR SELECT USING (public.is_platform_staff());
CREATE POLICY retention_config_insert ON public.retention_config FOR INSERT WITH CHECK (public.is_platform_staff());
CREATE POLICY retention_config_update ON public.retention_config FOR UPDATE USING (public.is_platform_staff()) WITH CHECK (public.is_platform_staff());

CREATE POLICY ops_incidents_read ON public.ops_incidents FOR SELECT USING (public.is_platform_staff());
CREATE POLICY ops_incidents_insert ON public.ops_incidents FOR INSERT WITH CHECK (public.is_platform_staff());
CREATE POLICY ops_incidents_update ON public.ops_incidents FOR UPDATE USING (public.is_platform_staff()) WITH CHECK (public.is_platform_staff());

CREATE POLICY ops_error_events_read ON public.ops_error_events FOR SELECT USING (public.is_platform_staff());