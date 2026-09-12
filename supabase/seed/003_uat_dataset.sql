-- ============================================================================
-- GuardianHub Phase 15: Staging UAT dataset
-- STAGING ONLY. Never run against production.
--
-- Creates two isolated security-company tenants plus realistic clients,
-- sites and guards for role-based UAT.
--
-- IMPORTANT: public.users rows reference auth.users (FK). Auth identities for
-- the 14 role accounts must be created through the Supabase Auth Admin API or
-- the invite flow — they cannot be inserted via raw SQL. See
-- supabase/docs/uat-dataset-guide.md for the account matrix.
--
-- RESET: see the reset block at the end of this file (or run manually).
-- ============================================================================

-- Two tenants
INSERT INTO public.companies (name, contact_email, phone, address, city, postal_code, country, company_size, subscription_plan, subscription_status, account_status, onboarding_status)
SELECT * FROM (VALUES
  ('UAT — Sentinel Security Ltd', 'owner@sentinel-uat.example', '+44 20 7000 1000', '1 UAT Way', 'London', 'E1 1AA', 'United Kingdom', '11-50', 'sentinel', 'active', 'active', 'complete'),
  ('UAT — Apex Guarding Group', 'owner@apex-uat.example', '+44 161 7000 2000', '20 UAT Road', 'Manchester', 'M1 1AB', 'United Kingdom', '51-200', 'command', 'active', 'active', 'complete')
) AS v(name, contact_email, phone, address, city, postal_code, country, company_size, subscription_plan, subscription_status, account_status, onboarding_status)
WHERE NOT EXISTS (SELECT 1 FROM public.companies c WHERE c.name = v.name);

-- Clients (two per tenant)
INSERT INTO public.clients (company_id, name, contact_person, contact_email, contact_phone, status, portal_enabled)
SELECT c.id, v.name, v.person, v.email, v.phone, 'active', true
FROM (VALUES
  ('UAT — Sentinel Security Ltd', 'Riverside Retail Park', 'Priya Shah', 'priya@riverside-uat.example', '+44 20 7000 3000'),
  ('UAT — Sentinel Security Ltd', 'Northgate Distribution', 'Marcus Webb', 'marcus@northgate-uat.example', '+44 20 7000 4000'),
  ('UAT — Apex Guarding Group', 'Cityview Corporate Campus', 'Elena Rossi', 'elena@cityview-uat.example', '+44 161 7000 5000'),
  ('UAT — Apex Guarding Group', 'Harbour Point Construction', 'Daniel Cole', 'daniel@harbour-uat.example', '+44 161 7000 6000')
) AS v(company_name, name, person, email, phone)
JOIN public.companies c ON c.name = v.company_name
WHERE NOT EXISTS (SELECT 1 FROM public.clients cl WHERE cl.name = v.name AND cl.company_id = c.id);

-- Sites (three per tenant)
INSERT INTO public.sites (company_id, site_name, client_name, address, postcode, region, risk_level, status, site_type, check_call_interval)
SELECT c.id, v.site_name, v.client_name, v.address, v.postcode, v.region, v.risk, 'active', v.site_type, 60
FROM (VALUES
  ('UAT — Sentinel Security Ltd', 'Riverside Retail — Main Entrance', 'Riverside Retail Park', 'Riverside Way, London', 'E1 2BB', 'London', 'medium', 'retail'),
  ('UAT — Sentinel Security Ltd', 'Riverside Retail — Loading Bay', 'Riverside Retail Park', 'Riverside Way, London', 'E1 2BB', 'London', 'medium', 'retail'),
  ('UAT — Sentinel Security Ltd', 'Northgate Distribution Hub', 'Northgate Distribution', 'Northgate Industrial Estate', 'E2 3CC', 'London', 'high', 'industrial'),
  ('UAT — Apex Guarding Group', 'Cityview Tower Reception', 'Cityview Corporate Campus', '1 Cityview Square', 'M2 4DD', 'Manchester', 'low', 'corporate'),
  ('UAT — Apex Guarding Group', 'Cityview Car Park', 'Cityview Corporate Campus', '1 Cityview Square', 'M2 4DD', 'Manchester', 'low', 'corporate'),
  ('UAT — Apex Guarding Group', 'Harbour Point Site Compound', 'Harbour Point Construction', 'Harbour Point Quay', 'M3 5EE', 'Manchester', 'high', 'construction')
) AS v(company_name, site_name, client_name, address, postcode, region, risk, site_type)
JOIN public.companies c ON c.name = v.company_name
WHERE NOT EXISTS (SELECT 1 FROM public.sites s WHERE s.site_name = v.site_name AND s.company_id = c.id);

-- Guards (four per tenant) — synthetic data only, no real people
INSERT INTO public.guards (company_id, first_name, last_name, email, phone, sia_licence, sia_expiry, hourly_rate, status, skills)
SELECT c.id, v.first_name, v.last_name, v.email, v.phone, v.sia, (CURRENT_DATE + 365), v.rate, 'active', v.skills
FROM (VALUES
  ('UAT — Sentinel Security Ltd', 'Jordan', 'UAT-Carter', 'jordan.carter@sentinel-uat.example', '+44 7700 000101', 'UAT-SIA-1001', 12.50, ARRAY['door-supervision']),
  ('UAT — Sentinel Security Ltd', 'Sam', 'UAT-Okafor', 'sam.okafor@sentinel-uat.example', '+44 7700 000102', 'UAT-SIA-1002', 12.50, ARRAY['cctv']),
  ('UAT — Sentinel Security Ltd', 'Alex', 'UAT-Bennett', 'alex.bennett@sentinel-uat.example', '+44 7700 000103', 'UAT-SIA-1003', 11.75, ARRAY['first-aid']),
  ('UAT — Sentinel Security Ltd', 'Morgan', 'UAT-Lee', 'morgan.lee@sentinel-uat.example', '+44 7700 000104', 'UAT-SIA-1004', 13.00, ARRAY['door-supervision','first-aid']),
  ('UAT — Apex Guarding Group', 'Taylor', 'UAT-Reid', 'taylor.reid@apex-uat.example', '+44 7700 000201', 'UAT-SIA-2001', 12.75, ARRAY['door-supervision']),
  ('UAT — Apex Guarding Group', 'Casey', 'UAT-Nguyen', 'casey.nguyen@apex-uat.example', '+44 7700 000202', 'UAT-SIA-2002', 12.75, ARRAY['cctv','first-aid']),
  ('UAT — Apex Guarding Group', 'Riley', 'UAT-Hughes', 'riley.hughes@apex-uat.example', '+44 7700 000203', 'UAT-SIA-2003', 11.75, ARRAY['first-aid']),
  ('UAT — Apex Guarding Group', 'Quinn', 'UAT-Foster', 'quinn.foster@apex-uat.example', '+44 7700 000204', 'UAT-SIA-2004', 13.25, ARRAY['door-supervision','cctv','first-aid'])
) AS v(company_name, first_name, last_name, email, phone, sia, rate, skills)
JOIN public.companies c ON c.name = v.company_name
WHERE NOT EXISTS (SELECT 1 FROM public.guards g WHERE g.email = v.email AND g.company_id = c.id);

-- ============================================================================
-- RESET — restores the UAT dataset to a known state (STAGING ONLY)
-- Run this block to wipe and re-run the seed.
-- ============================================================================
-- DELETE FROM public.guards WHERE email LIKE '%@sentinel-uat.example' OR email LIKE '%@apex-uat.example';
-- DELETE FROM public.sites WHERE site_name IN (
--   'Riverside Retail — Main Entrance','Riverside Retail — Loading Bay','Northgate Distribution Hub',
--   'Cityview Tower Reception','Cityview Car Park','Harbour Point Site Compound');
-- DELETE FROM public.clients WHERE name IN (
--   'Riverside Retail Park','Northgate Distribution','Cityview Corporate Campus','Harbour Point Construction');
-- DELETE FROM public.companies WHERE name IN ('UAT — Sentinel Security Ltd','UAT — Apex Guarding Group');