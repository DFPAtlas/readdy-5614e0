-- GuardianHub Migration 002: Core Tenancy
-- Phase 1A Baseline Recovery
-- All statements are idempotent (CREATE IF NOT EXISTS / ADD COLUMN IF NOT EXISTS)

-- companies table
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'companies') THEN
    CREATE TABLE public.companies (
      id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
      name text NOT NULL,
      logo_url text,
      subscription_plan text DEFAULT 'sentinel',
      contact_email text,
      phone text,
      address text,
      created_at timestamptz DEFAULT now(),
      updated_at timestamptz DEFAULT now(),
      brand_color text DEFAULT '#3b82f6',
      company_size text,
      stripe_customer_id text UNIQUE,
      stripe_subscription_id text,
      subscription_status text,
      subscription_billing text,
      subscription_period_end timestamptz,
      subscription_cancel_at timestamptz,
      created_by uuid REFERENCES auth.users(id),
      account_status text DEFAULT 'pending_setup',
      onboarding_status text DEFAULT 'incomplete',
      trial_ends_at timestamptz,
      suspended_at timestamptz,
      cancelled_at timestamptz,
      archived_at timestamptz,
      plan_name text DEFAULT 'sentinel',
      brand_color_secondary text,
      brand_font text DEFAULT 'inter',
      favicon_url text,
      portal_domain text,
      portal_welcome_message text,
      portal_footer_text text,
      report_header_html text,
      report_footer_html text,
      email_from_name text,
      email_reply_to text,
      branding_updated_at timestamptz,
      city text,
      postal_code text,
      country text,
      vat_number text
    );
  ELSE
    RAISE NOTICE 'companies table already exists — verify columns match code expectations';
  END IF;
END $$;

-- users table
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'users') THEN
    CREATE TABLE public.users (
      id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
      company_id uuid REFERENCES public.companies(id),
      role text NOT NULL DEFAULT 'guard',
      first_name text,
      last_name text,
      email text,
      phone text,
      status text DEFAULT 'active',
      created_at timestamptz DEFAULT now()
    );
  ELSE
    RAISE NOTICE 'users table already exists — verify columns match code expectations';
  END IF;
END $$;

-- Add company_id index if not exists
CREATE INDEX IF NOT EXISTS idx_companies_account_status ON public.companies(account_status);
CREATE INDEX IF NOT EXISTS idx_companies_subscription_status ON public.companies(subscription_status);
CREATE INDEX IF NOT EXISTS idx_users_company_id ON public.users(company_id);
CREATE INDEX IF NOT EXISTS idx_users_role ON public.users(role);

-- RLS on companies (ensure enabled)
ALTER TABLE public.companies ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

-- RLS policies are intentionally NOT recreated here.
-- Existing policies may have been tuned. Policy audit deferred to Phase 1B.
DO $$
BEGIN
  RAISE NOTICE 'RLS policies audit for companies and users deferred to Phase 1B.';
END $$;