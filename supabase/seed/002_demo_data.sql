-- GuardianHub Demo Data Seed
-- DEVELOPMENT ONLY — DO NOT RUN IN PRODUCTION
-- Creates realistic demo company with sites, guards, and sample data

-- WARNING: This seed file is for local development and staging ONLY.
-- It should NEVER be run against the production database.

-- Create demo company
INSERT INTO public.companies (id, name, contact_email, subscription_plan, account_status, onboarding_status, subscription_status)
VALUES (
  '00000000-0000-0000-0000-000000000001',
  'Demo Security Ltd',
  'demo@guardianhub.io',
  'sentinel',
  'active',
  'complete',
  'active'
) ON CONFLICT (id) DO NOTHING;

-- Create demo user (must exist in auth.users first)
-- NOTE: Requires `demo@guardianhub.io` to exist in auth.users
DO $$
DECLARE
  demo_user_id uuid;
BEGIN
  SELECT id INTO demo_user_id FROM auth.users WHERE email = 'demo@guardianhub.io' LIMIT 1;
  IF demo_user_id IS NOT NULL THEN
    INSERT INTO public.users (id, company_id, role, first_name, last_name, email, status)
    VALUES (demo_user_id, '00000000-0000-0000-0000-000000000001', 'company_admin', 'Demo', 'Admin', 'demo@guardianhub.io', 'active')
    ON CONFLICT (id) DO NOTHING;
  END IF;
END $$;

-- See LoadDemoData.tsx for the runtime demo data loader
-- which creates temporary demo data for first-time users