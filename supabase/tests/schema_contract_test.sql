-- GuardianHub Schema Contract Validation Tests
-- Run: supabase db test
-- Or: psql -h localhost -p 54322 -d postgres -U postgres -f supabase/tests/schema_contract_test.sql

-- Test 1: All expected tables exist
DO $$
DECLARE
  expected_tables text[] := ARRAY[
    'companies', 'users', 'clients', 'client_users',
    'roles', 'permissions', 'role_permissions', 'user_roles', 'user_site_access',
    'modules', 'plans', 'plan_features', 'company_enabled_modules',
    'sites', 'guards', 'guard_templates', 'guard_site_assignments',
    'guard_certifications', 'guard_vetting_records', 'guard_wellbeing_checkins',
    'guard_availability', 'guard_time_off', 'guard_performance_scores',
    'site_contacts', 'site_risk_scores', 'site_shift_patterns',
    'site_ai_summaries', 'site_dashboard_configs',
    'site_notices', 'site_notice_reads', 'site_status_tokens',
    'shifts', 'shift_types', 'shift_pattern_templates',
    'shift_cover_offers', 'attendance_logs', 'leave_requests',
    'rota_conflicts', 'rota_published_weeks', 'pattern_applications',
    'ai_rota_suggestions',
    'incidents', 'incident_comments', 'incident_timeline', 'incident_media',
    'occurrence_books',
    'patrol_checkpoints', 'patrol_checkpoint_scans', 'patrol_logs', 'patrol_scans',
    'sop_documents', 'sop_chunks', 'sop_chat_messages',
    'sop_acknowledgements', 'sop_gap_acknowledgments', 'built_sops',
    'training_modules', 'training_completions',
    'compliance_documents', 'document_reviews', 'document_expiry_notifications',
    'acs_assessment_config', 'acs_audit_runs', 'acs_audit_findings',
    'acs_evidence', 'acs_evidence_packs', 'acs_policies', 'acs_policy_acknowledgements',
    'acs_criteria', 'acs_corrective_actions', 'acs_site_compliance', 'acs_staff_compliance',
    'acs_compliance_categories', 'acs_company_documents', 'acs_training_records',
    'evidence_files', 'evidence_access_logs', 'evidence_links', 'evidence_reviews',
    'client_profiles', 'client_sites', 'client_documents', 'client_contacts',
    'client_messages', 'client_report_templates',
    'support_tickets', 'support_ticket_messages', 'support_ticket_attachments',
    'support_ticket_actions', 'support_ticket_ai_checks',
    'support_agent_status', 'support_sla_rules', 'canned_responses',
    'ticket_satisfaction_ratings', 'live_chat_sessions', 'live_chat_messages', 'kb_articles',
    'notifications', 'notification_preferences', 'notification_deliveries',
    'sms_notification_log', 'messages',
    'lone_worker_sessions', 'lone_worker_checkins',
    'billing_invoices', 'billing_payments', 'billing_refunds',
    'billing_disputes', 'billing_subscription_events', 'billing_webhook_events',
    'agent_registry', 'agent_execution_logs', 'agent_webhook_events', 'ai_activity_logs',
    'admin_activity_log', 'admin_notes', 'admin_repair_logs',
    'email_assets', 'form_submissions', 'quotes', 'reports',
    'report_email_log', 'weekly_report_schedule', 'visitor_logs',
    'company_secrets', 'company_ai_providers', 'company_branding_history',
    'company_setup_progress', 'feature_usage', 'webhook_debug_log'
  ];
  missing text[] := '';
  t text;
BEGIN
  FOREACH t IN ARRAY expected_tables LOOP
    IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = t) THEN
      missing := array_append(missing, t);
    END IF;
  END LOOP;

  IF array_length(missing, 1) > 0 THEN
    RAISE WARNING 'MISSING TABLES: %', array_to_string(missing, ', ');
  ELSE
    RAISE NOTICE 'PASS: All 130+ expected tables exist';
  END IF;
END $$;

-- Test 2: All expected views exist
DO $$
DECLARE
  expected_views text[] := ARRAY[
    'active_site_notices', 'site_weekly_guard_cards', 'sop_version_history',
    'v_billing_mrr_current', 'v_billing_revenue_monthly',
    'v_billing_overdue', 'v_billing_tax_monthly'
  ];
  missing text[] := '';
  t text;
BEGIN
  FOREACH t IN ARRAY expected_views LOOP
    IF NOT EXISTS (SELECT 1 FROM information_schema.views WHERE table_schema = 'public' AND table_name = t) THEN
      missing := array_append(missing, t);
    END IF;
  END LOOP;

  IF array_length(missing, 1) > 0 THEN
    RAISE WARNING 'MISSING VIEWS: %', array_to_string(missing, ', ');
  ELSE
    RAISE NOTICE 'PASS: All 7 expected views exist';
  END IF;
END $$;

-- Test 3: Core tenant-owned tables have company_id column
DO $$
DECLARE
  tenant_tables text[] := ARRAY[
    'sites', 'guards', 'shifts', 'incidents', 'occurrence_books',
    'patrol_checkpoints', 'patrol_logs', 'sop_documents', 'sop_chunks',
    'notifications', 'training_modules', 'training_completions',
    'compliance_documents', 'leave_requests', 'guard_site_assignments',
    'ai_activity_logs', 'site_risk_scores', 'reports'
  ];
  missing text[] := '';
  t text;
BEGIN
  FOREACH t IN ARRAY tenant_tables LOOP
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = t) THEN
      IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = t AND column_name = 'company_id') THEN
        missing := array_append(missing, t);
      END IF;
    END IF;
  END LOOP;

  IF array_length(missing, 1) > 0 THEN
    RAISE WARNING 'TABLES MISSING company_id: %', array_to_string(missing, ', ');
  ELSE
    RAISE NOTICE 'PASS: All tenant-owned tables have company_id column';
  END IF;
END $$;

-- Test 4: RLS is enabled on all tables
DO $$
DECLARE
  rls_off text[] := '';
  r record;
BEGIN
  FOR r IN SELECT tablename FROM pg_tables WHERE schemaname = 'public' AND tablename != 'webhook_debug_log' LOOP
    IF NOT EXISTS (
      SELECT 1 FROM pg_tables WHERE schemaname = 'public' AND tablename = r.tablename AND rowsecurity = true
    ) THEN
      rls_off := array_append(rls_off, r.tablename);
    END IF;
  END LOOP;

  IF array_length(rls_off, 1) > 0 THEN
    RAISE WARNING 'TABLES WITH RLS OFF: %', array_to_string(rls_off, ', ');
  ELSE
    RAISE NOTICE 'PASS: RLS enabled on all tables (webhook_debug_log excluded intentionally)';
  END IF;
END $$;

-- Test 5: Key foreign keys are valid
DO $$
DECLARE
  fk_issues text[] := '';
  r record;
BEGIN
  FOR r IN
    SELECT
      tc.table_name,
      kcu.column_name,
      ccu.table_name AS foreign_table_name
    FROM information_schema.table_constraints tc
    JOIN information_schema.key_column_usage kcu ON tc.constraint_name = kcu.constraint_name
    JOIN information_schema.constraint_column_usage ccu ON tc.constraint_name = ccu.constraint_name
    WHERE tc.constraint_type = 'FOREIGN KEY'
      AND tc.table_schema = 'public'
    ORDER BY tc.table_name
  LOOP
    -- Check that referenced table exists
    IF NOT EXISTS (
      SELECT 1 FROM information_schema.tables
      WHERE table_schema = 'public' AND table_name = r.foreign_table_name
    ) THEN
      fk_issues := array_append(fk_issues, format('%s.%s -> %s (table not found)', r.table_name, r.column_name, r.foreign_table_name));
    END IF;
  END LOOP;

  IF array_length(fk_issues, 1) > 0 THEN
    RAISE WARNING 'FOREIGN KEY ISSUES: %', array_to_string(fk_issues, '; ');
  ELSE
    RAISE NOTICE 'PASS: All foreign keys reference existing tables';
  END IF;
END $$;

-- MANUAL VERIFICATION QUERIES (cannot be automated):
-- 1. Verify each RLS policy grants appropriate access (Phase 1B)
-- 2. Verify edge function JWT settings in Supabase dashboard
-- 3. Verify storage bucket privacy settings
-- 4. Verify trigger function definitions match expected behaviour
-- 5. Check for updated_at triggers on frequently updated tables

-- Manual check: List tables without updated_at column
DO $$
BEGIN
  RAISE NOTICE 'Tables without updated_at column (manual review recommended):';
END $$;

SELECT table_name
FROM information_schema.tables t
WHERE table_schema = 'public'
  AND table_type = 'BASE TABLE'
  AND NOT EXISTS (
    SELECT 1 FROM information_schema.columns c
    WHERE c.table_schema = 'public' AND c.table_name = t.table_name AND c.column_name = 'updated_at'
  )
ORDER BY table_name;