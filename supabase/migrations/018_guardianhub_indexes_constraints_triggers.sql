-- GuardianHub Migration 018: Indexes, Constraints and Triggers
-- Phase 1A Baseline Recovery
-- Documents existing triggers and creates missing indexes where safe

-- EXISTING TRIGGERS (verified — do not recreate):
-- 1. billing_disputes      -> tr_billing_disputes_updated      -> tg_billing_set_updated_at()
-- 2. billing_invoices      -> tr_billing_invoices_updated      -> tg_billing_set_updated_at()
-- 3. billing_payments      -> tr_billing_payments_updated      -> tg_billing_set_updated_at()
-- 4. billing_refunds       -> tr_billing_refunds_updated       -> tg_billing_set_updated_at()
-- 5. client_messages       -> trg_notify_client_message        -> notify_on_client_message()
-- 6. companies             -> trg_prevent_subscription_tamper  -> prevent_subscription_field_tamper()
-- 7. companies             -> trg_prevent_subscription_update  -> prevent_subscription_field_update()
-- 8. incidents             -> tr_incident_number               -> generate_incident_number()
-- 9. incidents             -> trg_notify_incident_created      -> notify_on_incident_created()
-- 10. leave_requests       -> trg_leave_requests_updated_at    -> set_updated_at()
-- 11. notifications        -> trg_notification_email           -> trigger_notification_email()
-- 12. shift_cover_offers   -> trg_shift_cover_offers_updated_at-> set_updated_at()
-- 13. site_notices         -> trg_site_notices_updated_at      -> set_site_notice_updated_at()

-- Add missing indexes for frequently queried columns (idempotent)
CREATE INDEX IF NOT EXISTS idx_shifts_status ON public.shifts(status);
CREATE INDEX IF NOT EXISTS idx_shifts_start_time ON public.shifts(start_time);
CREATE INDEX IF NOT EXISTS idx_shifts_end_time ON public.shifts(end_time);
CREATE INDEX IF NOT EXISTS idx_shifts_site_id ON public.shifts(site_id);
CREATE INDEX IF NOT EXISTS idx_shifts_guard_id ON public.shifts(guard_id);
CREATE INDEX IF NOT EXISTS idx_shifts_company_id ON public.shifts(company_id);
CREATE INDEX IF NOT EXISTS idx_shifts_active_by_date ON public.shifts(status, start_time, end_time);

CREATE INDEX IF NOT EXISTS idx_incidents_status ON public.incidents(status);
CREATE INDEX IF NOT EXISTS idx_incidents_occurred_at ON public.incidents(occurred_at);
CREATE INDEX IF NOT EXISTS idx_incidents_site_id ON public.incidents(site_id);
CREATE INDEX IF NOT EXISTS idx_incidents_company_id ON public.incidents(company_id);
CREATE INDEX IF NOT EXISTS idx_incidents_severity ON public.incidents(severity);

CREATE INDEX IF NOT EXISTS idx_occurrence_books_site_id ON public.occurrence_books(site_id);
CREATE INDEX IF NOT EXISTS idx_occurrence_books_company_id ON public.occurrence_books(company_id);
CREATE INDEX IF NOT EXISTS idx_occurrence_books_created_at ON public.occurrence_books(created_at);

CREATE INDEX IF NOT EXISTS idx_attendance_logs_guard_id ON public.attendance_logs(guard_id);
CREATE INDEX IF NOT EXISTS idx_attendance_logs_clock_in ON public.attendance_logs(clock_in);
CREATE INDEX IF NOT EXISTS idx_attendance_logs_company_id ON public.attendance_logs(company_id);

CREATE INDEX IF NOT EXISTS idx_patrol_logs_site_id ON public.patrol_logs(site_id);
CREATE INDEX IF NOT EXISTS idx_patrol_logs_start_time ON public.patrol_logs(start_time);
CREATE INDEX IF NOT EXISTS idx_patrol_logs_company_id ON public.patrol_logs(company_id);

CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON public.notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_company_id ON public.notifications(company_id);
CREATE INDEX IF NOT EXISTS idx_notifications_created_at ON public.notifications(created_at);

CREATE INDEX IF NOT EXISTS idx_sop_documents_company_id ON public.sop_documents(company_id);
CREATE INDEX IF NOT EXISTS idx_sop_chunks_company_id ON public.sop_chunks(company_id);
CREATE INDEX IF NOT EXISTS idx_sop_chunks_document_id ON public.sop_chunks(document_id);

CREATE INDEX IF NOT EXISTS idx_guard_certifications_guard_id ON public.guard_certifications(guard_id);
CREATE INDEX IF NOT EXISTS idx_guard_certifications_expiry ON public.guard_certifications(expiry_date);
CREATE INDEX IF NOT EXISTS idx_guard_vetting_records_guard_id ON public.guard_vetting_records(guard_id);

CREATE INDEX IF NOT EXISTS idx_support_tickets_company_id ON public.support_tickets(company_id);
CREATE INDEX IF NOT EXISTS idx_support_tickets_status ON public.support_tickets(status);
CREATE INDEX IF NOT EXISTS idx_support_tickets_priority ON public.support_tickets(priority);

CREATE INDEX IF NOT EXISTS idx_compliance_documents_expiry ON public.compliance_documents(expiry_date);
CREATE INDEX IF NOT EXISTS idx_compliance_documents_company_id ON public.compliance_documents(company_id);

CREATE INDEX IF NOT EXISTS idx_acs_evidence_expiry ON public.acs_evidence(expiry_date);
CREATE INDEX IF NOT EXISTS idx_acs_audit_runs_company_id ON public.acs_audit_runs(company_id);
CREATE INDEX IF NOT EXISTS idx_acs_audit_runs_created_at ON public.acs_audit_runs(created_at);

CREATE INDEX IF NOT EXISTS idx_lone_worker_checkins_guard_id ON public.lone_worker_checkins(guard_id);
CREATE INDEX IF NOT EXISTS idx_lone_worker_sessions_status ON public.lone_worker_sessions(status);

CREATE INDEX IF NOT EXISTS idx_training_completions_guard_id ON public.training_completions(guard_id);
CREATE INDEX IF NOT EXISTS idx_training_completions_company_id ON public.training_completions(company_id);

CREATE INDEX IF NOT EXISTS idx_site_risk_scores_site_id ON public.site_risk_scores(site_id);
CREATE INDEX IF NOT EXISTS idx_site_risk_scores_generated_at ON public.site_risk_scores(generated_at);

CREATE INDEX IF NOT EXISTS idx_guard_wellbeing_checkins_guard_id ON public.guard_wellbeing_checkins(guard_id);

CREATE INDEX IF NOT EXISTS idx_reports_site_id ON public.reports(site_id);
CREATE INDEX IF NOT EXISTS idx_reports_company_id ON public.reports(company_id);
CREATE INDEX IF NOT EXISTS idx_reports_generated_at ON public.reports(generated_at);

CREATE INDEX IF NOT EXISTS idx_evidence_files_company_id ON public.evidence_files(company_id);
CREATE INDEX IF NOT EXISTS idx_evidence_files_site_id ON public.evidence_files(site_id);

CREATE INDEX IF NOT EXISTS idx_ai_activity_logs_company_id ON public.ai_activity_logs(company_id);
CREATE INDEX IF NOT EXISTS idx_ai_activity_logs_created_at ON public.ai_activity_logs(created_at);

DO $$
BEGIN
  RAISE NOTICE 'Index verification complete. Existing indexes preserved; missing indexes created where safe.';
END $$;