-- GuardianHub Seed Data: System Roles and Permissions
-- Phase 1A — Production-safe, idempotent reference data only
-- NO passwords, NO real user IDs, NO API keys, NO demo companies

-- System Roles (idempotent, uses stable slugs)
INSERT INTO public.roles (name, description, is_system, is_default, company_id)
SELECT v.name, v.description, true, v.is_default, NULL
FROM (VALUES
  ('super_admin', 'Full platform access across all companies', false),
  ('company_admin', 'Company-level admin with full company access', true),
  ('operations_manager', 'Manages day-to-day security operations', false),
  ('site_supervisor', 'Supervises specific site(s)', false),
  ('control_room_operator', 'Command centre / control room operations', false),
  ('guard', 'Standard security guard', true)
) AS v(name, description, is_default)
WHERE NOT EXISTS (
  SELECT 1 FROM public.roles r
  WHERE r.name = v.name AND r.is_system = true AND r.company_id IS NULL
);

-- System Permissions (idempotent, uses stable slugs)
INSERT INTO public.permissions (slug, label, module, description)
SELECT v.slug, v.label, v.module, v.description
FROM (VALUES
  ('dashboard.view', 'View Dashboard', 'dashboard', 'View main dashboard'),
  ('dashboard.manage', 'Manage Dashboard', 'dashboard', 'Customise dashboard widgets'),
  ('sites.view', 'View Sites', 'sites', 'View site list'),
  ('sites.create', 'Create Sites', 'sites', 'Create new sites'),
  ('sites.edit', 'Edit Sites', 'sites', 'Edit site details'),
  ('sites.delete', 'Delete Sites', 'sites', 'Delete sites'),
  ('guards.view', 'View Guards', 'guards', 'View guard list'),
  ('guards.create', 'Create Guards', 'guards', 'Add new guards'),
  ('guards.edit', 'Edit Guards', 'guards', 'Edit guard details'),
  ('guards.delete', 'Delete Guards', 'guards', 'Remove guards'),
  ('rotas.view', 'View Rotas', 'rotas', 'View shift rotas'),
  ('rotas.edit', 'Edit Rotas', 'rotas', 'Edit shift rotas'),
  ('rotas.publish', 'Publish Rotas', 'rotas', 'Publish rota weeks'),
  ('incidents.view', 'View Incidents', 'incidents', 'View incident reports'),
  ('incidents.create', 'Report Incidents', 'incidents', 'Create incident reports'),
  ('incidents.manage', 'Manage Incidents', 'incidents', 'Edit and resolve incidents'),
  ('patrols.view', 'View Patrols', 'patrols', 'View patrol logs'),
  ('patrols.manage', 'Manage Patrols', 'patrols', 'Set up patrol checkpoints'),
  ('evidence.view', 'View Evidence', 'evidence', 'View evidence files'),
  ('evidence.upload', 'Upload Evidence', 'evidence', 'Upload evidence files'),
  ('evidence.manage', 'Manage Evidence', 'evidence', 'Manage evidence vault'),
  ('reports.view', 'View Reports', 'reports', 'View reports'),
  ('reports.create', 'Generate Reports', 'reports', 'Generate reports'),
  ('compliance.view', 'View Compliance', 'compliance', 'View compliance status'),
  ('compliance.manage', 'Manage Compliance', 'compliance', 'Manage compliance settings'),
  ('settings.company', 'Company Settings', 'settings', 'Manage company settings'),
  ('settings.billing', 'Billing Settings', 'settings', 'Manage billing and subscription'),
  ('settings.roles', 'Role Management', 'settings', 'Manage roles and permissions'),
  ('admin.access', 'Admin Panel Access', 'admin', 'Access admin panel'),
  ('sops.view', 'View SOPs', 'sops', 'View standard operating procedures'),
  ('sops.create', 'Create SOPs', 'sops', 'Create new SOPs'),
  ('sops.edit', 'Edit SOPs', 'sops', 'Edit existing SOPs'),
  ('sops.delete', 'Delete SOPs', 'sops', 'Delete SOPs'),
  ('training.view', 'View Training', 'training', 'View training modules'),
  ('training.manage', 'Manage Training', 'training', 'Create and assign training'),
  ('client_portal.access', 'Access Client Portal', 'client_portal', 'Access the client portal'),
  ('ai_assistant.access', 'AI Assistant Access', 'ai_assistant', 'Use AI assistant features'),
  ('occurrence_book.view', 'View OB', 'occurrence_book', 'View occurrence book'),
  ('occurrence_book.create', 'Create OB Entry', 'occurrence_book', 'Create OB entries'),
  ('support.access', 'Support Access', 'support', 'Access support system'),
  ('messages.send', 'Send Messages', 'messages', 'Send messages to clients')
) AS v(slug, label, module, description)
ON CONFLICT (slug) DO NOTHING;

-- Plans (idempotent)
INSERT INTO public.plans (slug, name, description)
SELECT v.slug, v.name, v.description
FROM (VALUES
  ('sentinel-starter', 'GuardianHub Starter', 'Essential features for small security teams'),
  ('sentinel', 'GuardianHub Sentinel', 'Full-featured security operations platform'),
  ('command', 'GuardianHub Command', 'Advanced features for larger operations'),
  ('titan', 'GuardianHub Titan', 'Enterprise-grade with full AI capabilities')
) AS v(slug, name, description)
ON CONFLICT (slug) DO NOTHING;

-- Modules (idempotent)
INSERT INTO public.modules (slug, name, description, is_premium)
SELECT v.slug, v.name, v.description, v.is_premium
FROM (VALUES
  ('dashboard', 'Dashboard', 'Main operations dashboard', false),
  ('sites', 'Sites', 'Site management', false),
  ('guards', 'Guards', 'Guard management', false),
  ('rotas', 'Rotas', 'Shift scheduling', false),
  ('incidents', 'Incidents', 'Incident reporting and management', false),
  ('occurrence_book', 'Occurrence Book', 'Daily occurrence logging', false),
  ('patrols', 'Patrols', 'Patrol checkpoints and monitoring', true),
  ('evidence', 'Evidence Vault', 'Secure evidence storage', true),
  ('reports', 'Reports', 'Report generation', false),
  ('compliance', 'Compliance', 'ACS compliance management', true),
  ('sops', 'SOPs', 'Standard operating procedures', true),
  ('training', 'Training', 'Guard training modules', true),
  ('client_portal', 'Client Portal', 'Client-facing portal', true),
  ('ai_assistant', 'AI Assistant', 'AI-powered operations assistant', true),
  ('support', 'Support', 'Support ticket system', false),
  ('messages', 'Messages', 'Client messaging', false),
  ('lone_worker', 'Lone Worker', 'Lone worker safety monitoring', true),
  ('guard_welfare', 'Guard Welfare', 'Guard wellbeing and welfare', true)
) AS v(slug, name, description, is_premium)
ON CONFLICT (slug) DO NOTHING;

-- Plan Features for Sentinel Starter (connect after plans exist)
DO $$
DECLARE
  starter_id uuid;
  sentinel_id uuid;
  command_id uuid;
  titan_id uuid;
BEGIN
  SELECT id INTO starter_id FROM public.plans WHERE slug = 'sentinel-starter';
  SELECT id INTO sentinel_id FROM public.plans WHERE slug = 'sentinel';
  SELECT id INTO command_id FROM public.plans WHERE slug = 'command';
  SELECT id INTO titan_id FROM public.plans WHERE slug = 'titan';

  -- Starter features
  IF starter_id IS NOT NULL THEN
    INSERT INTO public.plan_features (plan_id, feature_key, label, included)
    SELECT starter_id, v.key, v.label, v.included
    FROM (VALUES
      ('sites_up_to_5', 'Up to 5 Sites', true),
      ('guards_up_to_25', 'Up to 25 Guards', true),
      ('basic_rotas', 'Basic Rota Management', true),
      ('incident_reporting', 'Incident Reporting', true),
      ('daily_occurrence_book', 'Daily Occurrence Book', true),
      ('basic_reports', 'Basic Reports', true),
      ('module_patrols', 'Patrol Checkpoints', false),
      ('module_evidence', 'Evidence Vault', false),
      ('module_compliance', 'ACS Compliance', false),
      ('module_sops', 'SOP Builder', false),
      ('module_training', 'Training Modules', false),
      ('module_client_portal', 'Client Portal', false),
      ('module_ai_assistant', 'AI Assistant', false),
      ('module_lone_worker', 'Lone Worker', false),
      ('module_guard_welfare', 'Guard Welfare', false)
    ) AS v(key, label, included)
    ON CONFLICT (plan_id, feature_key) DO NOTHING;
  END IF;

  -- Sentinel features
  IF sentinel_id IS NOT NULL THEN
    INSERT INTO public.plan_features (plan_id, feature_key, label, included)
    SELECT sentinel_id, v.key, v.label, v.included
    FROM (VALUES
      ('sites_unlimited', 'Unlimited Sites', true),
      ('guards_up_to_100', 'Up to 100 Guards', true),
      ('advanced_rotas', 'Advanced Rota Management', true),
      ('incident_reporting', 'Incident Reporting', true),
      ('daily_occurrence_book', 'Daily Occurrence Book', true),
      ('advanced_reports', 'Advanced Reports', true),
      ('module_patrols', 'Patrol Checkpoints', true),
      ('module_evidence', 'Evidence Vault', true),
      ('module_compliance', 'ACS Compliance', true),
      ('module_client_portal', 'Client Portal', true),
      ('module_lone_worker', 'Lone Worker', true),
      ('module_sops', 'SOP Builder', false),
      ('module_training', 'Training Modules', false),
      ('module_ai_assistant', 'AI Assistant', false),
      ('module_guard_welfare', 'Guard Welfare', false)
    ) AS v(key, label, included)
    ON CONFLICT (plan_id, feature_key) DO NOTHING;
  END IF;

  -- Command features
  IF command_id IS NOT NULL THEN
    INSERT INTO public.plan_features (plan_id, feature_key, label, included)
    SELECT command_id, v.key, v.label, v.included
    FROM (VALUES
      ('sites_unlimited', 'Unlimited Sites', true),
      ('guards_up_to_500', 'Up to 500 Guards', true),
      ('advanced_rotas', 'Advanced Rota Management', true),
      ('incident_reporting', 'Incident Reporting', true),
      ('daily_occurrence_book', 'Daily Occurrence Book', true),
      ('advanced_reports', 'Advanced Reports', true),
      ('module_patrols', 'Patrol Checkpoints', true),
      ('module_evidence', 'Evidence Vault', true),
      ('module_compliance', 'ACS Compliance', true),
      ('module_client_portal', 'Client Portal', true),
      ('module_lone_worker', 'Lone Worker', true),
      ('module_sops', 'SOP Builder', true),
      ('module_training', 'Training Modules', true),
      ('module_ai_assistant', 'AI Assistant', true),
      ('module_guard_welfare', 'Guard Welfare', true)
    ) AS v(key, label, included)
    ON CONFLICT (plan_id, feature_key) DO NOTHING;
  END IF;

  -- Titan features
  IF titan_id IS NOT NULL THEN
    INSERT INTO public.plan_features (plan_id, feature_key, label, included)
    SELECT titan_id, v.key, v.label, v.included
    FROM (VALUES
      ('sites_unlimited', 'Unlimited Sites', true),
      ('guards_unlimited', 'Unlimited Guards', true),
      ('advanced_rotas', 'Advanced Rota Management', true),
      ('incident_reporting', 'Incident Reporting', true),
      ('daily_occurrence_book', 'Daily Occurrence Book', true),
      ('advanced_reports', 'Advanced Reports', true),
      ('module_patrols', 'Patrol Checkpoints', true),
      ('module_evidence', 'Evidence Vault', true),
      ('module_compliance', 'ACS Compliance', true),
      ('module_client_portal', 'Client Portal', true),
      ('module_lone_worker', 'Lone Worker', true),
      ('module_sops', 'SOP Builder', true),
      ('module_training', 'Training Modules', true),
      ('module_ai_assistant', 'AI Assistant', true),
      ('module_guard_welfare', 'Guard Welfare', true),
      ('api_access', 'API Access', true),
      ('white_label', 'White Label', true),
      ('priority_support', 'Priority Support', true),
      ('dedicated_account_manager', 'Dedicated Account Manager', true)
    ) AS v(key, label, included)
    ON CONFLICT (plan_id, feature_key) DO NOTHING;
  END IF;
END $$;