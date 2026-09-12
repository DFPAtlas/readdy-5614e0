-- GuardianHub Phase 17: UK GDPR / SIA compliance & trust centre data model
-- Reuses: data_requests (DSAR cases), retention_rules, legal_holds, sia_licences,
--         guard_vetting_records, screening_requirements, screening_items.
-- Extends: sia_licences (assignment eligibility + verification method).

-- ---------------------------------------------------------------------------
-- Platform reference: compliance frameworks
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.compliance_frameworks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug text UNIQUE NOT NULL,
  name text NOT NULL,
  framework_type text NOT NULL DEFAULT 'regulation',
  description text,
  version_label text,
  status text NOT NULL DEFAULT 'under_review',
  is_published boolean NOT NULL DEFAULT false,
  review_due_at timestamptz,
  reviewed_at timestamptz,
  owner_id uuid,
  notes text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- ---------------------------------------------------------------------------
-- Tenant compliance evidence (private storage references)
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.compliance_evidence (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id uuid NOT NULL,
  evidence_type text NOT NULL,
  title text NOT NULL,
  reference_code text,
  storage_path text,
  review_status text NOT NULL DEFAULT 'pending_review',
  reviewed_by uuid,
  reviewed_at timestamptz,
  notes text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- ---------------------------------------------------------------------------
-- Version-controlled legal / policy documents
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.policy_documents (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug text NOT NULL,
  title text NOT NULL,
  category text NOT NULL DEFAULT 'legal',
  version text NOT NULL DEFAULT '0.1.0',
  status text NOT NULL DEFAULT 'draft',
  is_published boolean NOT NULL DEFAULT false,
  effective_date date,
  reviewed_date date,
  review_due_date date,
  owner_id uuid,
  change_summary text,
  body text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_policy_documents_slug ON public.policy_documents (slug);

CREATE TABLE IF NOT EXISTS public.policy_acceptances (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id uuid NOT NULL,
  policy_id uuid NOT NULL REFERENCES public.policy_documents (id) ON DELETE CASCADE,
  version_accepted text,
  accepted_by uuid,
  accepted_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_policy_acceptances_company ON public.policy_acceptances (company_id);
CREATE INDEX IF NOT EXISTS idx_policy_acceptances_policy ON public.policy_acceptances (policy_id);

-- ---------------------------------------------------------------------------
-- Records of processing activities (controller / processor responsibility matrix)
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.processing_activities (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id uuid,
  slug text,
  name text NOT NULL,
  purpose text,
  data_subjects text,
  personal_data_categories text,
  sensitive_data_category text,
  lawful_basis text,
  article9_condition text,
  criminal_offence_condition text,
  recipients text,
  transfers text,
  retention_period text,
  security_controls text,
  controller_role text NOT NULL DEFAULT 'controller',
  processor_role text,
  joint_controller_note text,
  data_location text,
  owner_id uuid,
  status text NOT NULL DEFAULT 'legal_review',
  review_date date,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_processing_activities_company ON public.processing_activities (company_id);

CREATE TABLE IF NOT EXISTS public.lawful_basis_records (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id uuid,
  processing_activity_id uuid REFERENCES public.processing_activities (id) ON DELETE SET NULL,
  basis_type text NOT NULL,
  purpose text,
  necessity_assessment text,
  legitimate_interest_assessment jsonb,
  decision_owner_id uuid,
  decision_notes text,
  recorded_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_lawful_basis_company ON public.lawful_basis_records (company_id);

-- ---------------------------------------------------------------------------
-- DPIA assessments
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.dpia_assessments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id uuid,
  is_template boolean NOT NULL DEFAULT false,
  title text NOT NULL,
  processing_description text,
  purpose_benefits text,
  necessity_proportionality text,
  data_sources text,
  data_flow text,
  individuals_affected text,
  sensitive_data text,
  systematic_monitoring boolean NOT NULL DEFAULT false,
  automated_decisions boolean NOT NULL DEFAULT false,
  international_transfers boolean NOT NULL DEFAULT false,
  threats text,
  likelihood text,
  impact text,
  existing_controls text,
  additional_controls text,
  residual_risk text NOT NULL DEFAULT 'unassessed',
  consultation text,
  dpo_advice text,
  escalation_recorded boolean NOT NULL DEFAULT false,
  approval_status text NOT NULL DEFAULT 'draft',
  reviewed_by uuid,
  review_date date,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_dpia_company ON public.dpia_assessments (company_id);

-- ---------------------------------------------------------------------------
-- Data subject request timeline events (case lives in data_requests)
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.data_subject_request_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  request_id uuid NOT NULL REFERENCES public.data_requests (id) ON DELETE CASCADE,
  event_type text NOT NULL,
  description text,
  actor_id uuid,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_dsr_events_request ON public.data_subject_request_events (request_id);

-- ---------------------------------------------------------------------------
-- Personal data breach management
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.data_breach_cases (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id uuid NOT NULL,
  reference text,
  discovery_time timestamptz,
  awareness_time timestamptz,
  description text,
  data_affected text,
  subjects_affected text,
  approx_volume integer,
  cia_impact text,
  containment text,
  risk_to_individuals text,
  reportability_assessment text NOT NULL DEFAULT 'unassessed',
  regulator_notification_deadline timestamptz,
  individual_notification_decision text,
  processor_notifications text,
  actions_taken text,
  evidence text,
  final_review text,
  status text NOT NULL DEFAULT 'open',
  owner_id uuid,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_breach_cases_company ON public.data_breach_cases (company_id);

CREATE TABLE IF NOT EXISTS public.data_breach_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  breach_case_id uuid NOT NULL REFERENCES public.data_breach_cases (id) ON DELETE CASCADE,
  event_type text NOT NULL,
  description text,
  actor_id uuid,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_breach_events_case ON public.data_breach_events (breach_case_id);

-- ---------------------------------------------------------------------------
-- Subprocessors and international transfers
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.subprocessors (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  provider_name text NOT NULL,
  service text,
  data_processed text,
  processing_location text,
  transfer_countries text,
  contract_status text NOT NULL DEFAULT 'under_review',
  security_review_status text NOT NULL DEFAULT 'not_reviewed',
  transfer_mechanism text,
  transfer_risk_assessment text,
  effective_date date,
  customer_notification_date date,
  replacement_date date,
  is_published boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.data_transfer_records (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  subprocessor_id uuid REFERENCES public.subprocessors (id) ON DELETE SET NULL,
  data_categories text,
  transfer_mechanism text,
  risk_assessment text,
  status text NOT NULL DEFAULT 'under_review',
  review_date date,
  owner_id uuid,
  notes text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- ---------------------------------------------------------------------------
-- Data processing agreements (tenant)
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.data_processing_agreements (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id uuid NOT NULL,
  counterparty_name text NOT NULL,
  agreement_type text NOT NULL DEFAULT 'dpa',
  status text NOT NULL DEFAULT 'draft',
  effective_date date,
  review_date date,
  document_ref text,
  signed_storage_path text,
  owner_id uuid,
  notes text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_dpa_company ON public.data_processing_agreements (company_id);

-- ---------------------------------------------------------------------------
-- Location tracking compliance (tenant, one config per company typically)
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.location_tracking_configs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id uuid NOT NULL UNIQUE,
  purpose text,
  lawful_basis text,
  tracked_subjects text,
  tracking_start text,
  tracking_stop text,
  background_tracking_enabled boolean NOT NULL DEFAULT false,
  precision_required text,
  retention_days integer,
  viewer_roles text,
  emergency_rules text,
  worker_notice_version text,
  dpia_status text NOT NULL DEFAULT 'not_started',
  contact_name text,
  is_active boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- ---------------------------------------------------------------------------
-- AI and automation transparency register
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.ai_automation_register (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  system_name text NOT NULL,
  purpose text,
  data_used text,
  model_provider text,
  decision_type text,
  human_involvement text,
  impact_on_individuals text,
  explanation_available boolean NOT NULL DEFAULT false,
  dpia_status text,
  bias_testing text,
  approval_status text NOT NULL DEFAULT 'not_approved',
  last_review date,
  is_published boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- ---------------------------------------------------------------------------
-- Company-level ACS (Approved Contractor Scheme) records — tenant
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.company_acs_records (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id uuid NOT NULL,
  acs_status text NOT NULL DEFAULT 'not_held',
  approved_activities text[],
  approval_reference text,
  effective_date date,
  expiry_date date,
  annual_assessment_date date,
  conditions text,
  evidence_ref text,
  assessor text,
  renewal_notes text,
  display_authorised boolean NOT NULL DEFAULT false,
  authorised_by uuid,
  authorised_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_company_acs_company ON public.company_acs_records (company_id);

-- ---------------------------------------------------------------------------
-- Compliance review tasks (platform)
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.compliance_review_tasks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  category text NOT NULL DEFAULT 'legal_review',
  description text,
  assignee_id uuid,
  due_date date,
  priority text NOT NULL DEFAULT 'medium',
  status text NOT NULL DEFAULT 'open',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- ---------------------------------------------------------------------------
-- Extend SIA licences for assignment eligibility
-- ---------------------------------------------------------------------------
ALTER TABLE public.sia_licences
  ADD COLUMN IF NOT EXISTS watchlist_status text,
  ADD COLUMN IF NOT EXISTS assignment_eligibility text NOT NULL DEFAULT 'review',
  ADD COLUMN IF NOT EXISTS verification_method text,
  ADD COLUMN IF NOT EXISTS review_notes text;

-- ---------------------------------------------------------------------------
-- RLS — platform-only tables
-- ---------------------------------------------------------------------------
ALTER TABLE public.compliance_review_tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.data_transfer_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.data_subject_request_events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "crt_staff_read" ON public.compliance_review_tasks FOR SELECT USING (is_platform_staff());
CREATE POLICY "crt_staff_write" ON public.compliance_review_tasks FOR INSERT WITH CHECK (is_platform_staff());
CREATE POLICY "crt_staff_update" ON public.compliance_review_tasks FOR UPDATE USING (is_platform_staff()) WITH CHECK (is_platform_staff());
CREATE POLICY "crt_staff_delete" ON public.compliance_review_tasks FOR DELETE USING (is_platform_staff());

CREATE POLICY "dtr_staff_read" ON public.data_transfer_records FOR SELECT USING (is_platform_staff());
CREATE POLICY "dtr_staff_write" ON public.data_transfer_records FOR INSERT WITH CHECK (is_platform_staff());
CREATE POLICY "dtr_staff_update" ON public.data_transfer_records FOR UPDATE USING (is_platform_staff()) WITH CHECK (is_platform_staff());
CREATE POLICY "dtr_staff_delete" ON public.data_transfer_records FOR DELETE USING (is_platform_staff());

CREATE POLICY "dsre_staff_read" ON public.data_subject_request_events FOR SELECT USING (is_platform_staff());
CREATE POLICY "dsre_staff_write" ON public.data_subject_request_events FOR INSERT WITH CHECK (is_platform_staff());
CREATE POLICY "dsre_staff_update" ON public.data_subject_request_events FOR UPDATE USING (is_platform_staff()) WITH CHECK (is_platform_staff());
CREATE POLICY "dsre_staff_delete" ON public.data_subject_request_events FOR DELETE USING (is_platform_staff());

-- ---------------------------------------------------------------------------
-- RLS — published transparency tables (public read when published, staff manage)
-- ---------------------------------------------------------------------------
ALTER TABLE public.compliance_frameworks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subprocessors ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.policy_documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_automation_register ENABLE ROW LEVEL SECURITY;

CREATE POLICY "cf_read" ON public.compliance_frameworks FOR SELECT USING (is_published = true OR is_platform_staff());
CREATE POLICY "cf_insert" ON public.compliance_frameworks FOR INSERT WITH CHECK (is_platform_staff());
CREATE POLICY "cf_update" ON public.compliance_frameworks FOR UPDATE USING (is_platform_staff()) WITH CHECK (is_platform_staff());
CREATE POLICY "cf_delete" ON public.compliance_frameworks FOR DELETE USING (is_platform_staff());

CREATE POLICY "sub_read" ON public.subprocessors FOR SELECT USING (is_published = true OR is_platform_staff());
CREATE POLICY "sub_insert" ON public.subprocessors FOR INSERT WITH CHECK (is_platform_staff());
CREATE POLICY "sub_update" ON public.subprocessors FOR UPDATE USING (is_platform_staff()) WITH CHECK (is_platform_staff());
CREATE POLICY "sub_delete" ON public.subprocessors FOR DELETE USING (is_platform_staff());

CREATE POLICY "pd_read" ON public.policy_documents FOR SELECT USING (is_published = true OR is_platform_staff());
CREATE POLICY "pd_insert" ON public.policy_documents FOR INSERT WITH CHECK (is_platform_staff());
CREATE POLICY "pd_update" ON public.policy_documents FOR UPDATE USING (is_platform_staff()) WITH CHECK (is_platform_staff());
CREATE POLICY "pd_delete" ON public.policy_documents FOR DELETE USING (is_platform_staff());

CREATE POLICY "air_read" ON public.ai_automation_register FOR SELECT USING (is_published = true OR is_platform_staff());
CREATE POLICY "air_insert" ON public.ai_automation_register FOR INSERT WITH CHECK (is_platform_staff());
CREATE POLICY "air_update" ON public.ai_automation_register FOR UPDATE USING (is_platform_staff()) WITH CHECK (is_platform_staff());
CREATE POLICY "air_delete" ON public.ai_automation_register FOR DELETE USING (is_platform_staff());

-- ---------------------------------------------------------------------------
-- RLS — tenant-scoped tables
-- ---------------------------------------------------------------------------
ALTER TABLE public.compliance_evidence ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.policy_acceptances ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.processing_activities ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lawful_basis_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.dpia_assessments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.data_breach_cases ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.data_breach_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.data_processing_agreements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.location_tracking_configs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.company_acs_records ENABLE ROW LEVEL SECURITY;

-- compliance_evidence
CREATE POLICY "ce_select" ON public.compliance_evidence FOR SELECT USING (company_id = get_my_company_id() OR is_platform_staff());
CREATE POLICY "ce_insert" ON public.compliance_evidence FOR INSERT WITH CHECK (company_id = get_my_company_id() OR is_platform_staff());
CREATE POLICY "ce_update" ON public.compliance_evidence FOR UPDATE USING (company_id = get_my_company_id() OR is_platform_staff()) WITH CHECK (company_id = get_my_company_id() OR is_platform_staff());
CREATE POLICY "ce_delete" ON public.compliance_evidence FOR DELETE USING (company_id = get_my_company_id() OR is_platform_staff());

-- policy_acceptances
CREATE POLICY "pa_select" ON public.policy_acceptances FOR SELECT USING (company_id = get_my_company_id() OR is_platform_staff());
CREATE POLICY "pa_insert" ON public.policy_acceptances FOR INSERT WITH CHECK (company_id = get_my_company_id() OR is_platform_staff());
CREATE POLICY "pa_update" ON public.policy_acceptances FOR UPDATE USING (company_id = get_my_company_id() OR is_platform_staff()) WITH CHECK (company_id = get_my_company_id() OR is_platform_staff());
CREATE POLICY "pa_delete" ON public.policy_acceptances FOR DELETE USING (company_id = get_my_company_id() OR is_platform_staff());

-- processing_activities (company_id nullable = platform reference, visible to all authenticated)
CREATE POLICY "proc_select" ON public.processing_activities FOR SELECT USING (company_id IS NULL OR company_id = get_my_company_id() OR is_platform_staff());
CREATE POLICY "proc_insert" ON public.processing_activities FOR INSERT WITH CHECK (company_id = get_my_company_id() OR is_platform_staff());
CREATE POLICY "proc_update" ON public.processing_activities FOR UPDATE USING (company_id = get_my_company_id() OR is_platform_staff()) WITH CHECK (company_id = get_my_company_id() OR is_platform_staff());
CREATE POLICY "proc_delete" ON public.processing_activities FOR DELETE USING (company_id = get_my_company_id() OR is_platform_staff());

-- lawful_basis_records
CREATE POLICY "lbr_select" ON public.lawful_basis_records FOR SELECT USING (company_id IS NULL OR company_id = get_my_company_id() OR is_platform_staff());
CREATE POLICY "lbr_insert" ON public.lawful_basis_records FOR INSERT WITH CHECK (company_id = get_my_company_id() OR is_platform_staff());
CREATE POLICY "lbr_update" ON public.lawful_basis_records FOR UPDATE USING (company_id = get_my_company_id() OR is_platform_staff()) WITH CHECK (company_id = get_my_company_id() OR is_platform_staff());
CREATE POLICY "lbr_delete" ON public.lawful_basis_records FOR DELETE USING (company_id = get_my_company_id() OR is_platform_staff());

-- dpia_assessments (templates visible to all authenticated)
CREATE POLICY "dpia_select" ON public.dpia_assessments FOR SELECT USING (is_template = true OR company_id = get_my_company_id() OR is_platform_staff());
CREATE POLICY "dpia_insert" ON public.dpia_assessments FOR INSERT WITH CHECK (company_id = get_my_company_id() OR is_platform_staff());
CREATE POLICY "dpia_update" ON public.dpia_assessments FOR UPDATE USING (company_id = get_my_company_id() OR is_platform_staff()) WITH CHECK (company_id = get_my_company_id() OR is_platform_staff());
CREATE POLICY "dpia_delete" ON public.dpia_assessments FOR DELETE USING (company_id = get_my_company_id() OR is_platform_staff());

-- data_breach_cases
CREATE POLICY "dbc_select" ON public.data_breach_cases FOR SELECT USING (company_id = get_my_company_id() OR is_platform_staff());
CREATE POLICY "dbc_insert" ON public.data_breach_cases FOR INSERT WITH CHECK (company_id = get_my_company_id() OR is_platform_staff());
CREATE POLICY "dbc_update" ON public.data_breach_cases FOR UPDATE USING (company_id = get_my_company_id() OR is_platform_staff()) WITH CHECK (company_id = get_my_company_id() OR is_platform_staff());
CREATE POLICY "dbc_delete" ON public.data_breach_cases FOR DELETE USING (company_id = get_my_company_id() OR is_platform_staff());

-- data_breach_events
CREATE POLICY "dbe_select" ON public.data_breach_events FOR SELECT USING (EXISTS (SELECT 1 FROM public.data_breach_cases c WHERE c.id = breach_case_id AND (c.company_id = get_my_company_id() OR is_platform_staff())));
CREATE POLICY "dbe_insert" ON public.data_breach_events FOR INSERT WITH CHECK (EXISTS (SELECT 1 FROM public.data_breach_cases c WHERE c.id = breach_case_id AND (c.company_id = get_my_company_id() OR is_platform_staff())));
CREATE POLICY "dbe_update" ON public.data_breach_events FOR UPDATE USING (EXISTS (SELECT 1 FROM public.data_breach_cases c WHERE c.id = breach_case_id AND (c.company_id = get_my_company_id() OR is_platform_staff()))) WITH CHECK (EXISTS (SELECT 1 FROM public.data_breach_cases c WHERE c.id = breach_case_id AND (c.company_id = get_my_company_id() OR is_platform_staff())));
CREATE POLICY "dbe_delete" ON public.data_breach_events FOR DELETE USING (EXISTS (SELECT 1 FROM public.data_breach_cases c WHERE c.id = breach_case_id AND (c.company_id = get_my_company_id() OR is_platform_staff())));

-- data_processing_agreements
CREATE POLICY "dpa_select" ON public.data_processing_agreements FOR SELECT USING (company_id = get_my_company_id() OR is_platform_staff());
CREATE POLICY "dpa_insert" ON public.data_processing_agreements FOR INSERT WITH CHECK (company_id = get_my_company_id() OR is_platform_staff());
CREATE POLICY "dpa_update" ON public.data_processing_agreements FOR UPDATE USING (company_id = get_my_company_id() OR is_platform_staff()) WITH CHECK (company_id = get_my_company_id() OR is_platform_staff());
CREATE POLICY "dpa_delete" ON public.data_processing_agreements FOR DELETE USING (company_id = get_my_company_id() OR is_platform_staff());

-- location_tracking_configs
CREATE POLICY "ltc_select" ON public.location_tracking_configs FOR SELECT USING (company_id = get_my_company_id() OR is_platform_staff());
CREATE POLICY "ltc_insert" ON public.location_tracking_configs FOR INSERT WITH CHECK (company_id = get_my_company_id() OR is_platform_staff());
CREATE POLICY "ltc_update" ON public.location_tracking_configs FOR UPDATE USING (company_id = get_my_company_id() OR is_platform_staff()) WITH CHECK (company_id = get_my_company_id() OR is_platform_staff());
CREATE POLICY "ltc_delete" ON public.location_tracking_configs FOR DELETE USING (company_id = get_my_company_id() OR is_platform_staff());

-- company_acs_records
CREATE POLICY "acs_select" ON public.company_acs_records FOR SELECT USING (company_id = get_my_company_id() OR is_platform_staff());
CREATE POLICY "acs_insert" ON public.company_acs_records FOR INSERT WITH CHECK (company_id = get_my_company_id() OR is_platform_staff());
CREATE POLICY "acs_update" ON public.company_acs_records FOR UPDATE USING (company_id = get_my_company_id() OR is_platform_staff()) WITH CHECK (company_id = get_my_company_id() OR is_platform_staff());
CREATE POLICY "acs_delete" ON public.company_acs_records FOR DELETE USING (company_id = get_my_company_id() OR is_platform_staff());