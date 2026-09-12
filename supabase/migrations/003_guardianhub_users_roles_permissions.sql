-- GuardianHub Migration 003: Users, Roles, Permissions
-- Phase 1A Baseline Recovery
-- All statements idempotent

-- clients table
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'clients') THEN
    CREATE TABLE public.clients (
      id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
      company_id uuid REFERENCES public.companies(id),
      name text,
      client_name text,
      contact_email text,
      contact_person text,
      contact_phone text,
      address text,
      created_at timestamptz DEFAULT now(),
      updated_at timestamptz DEFAULT now()
    );
  END IF;
END $$;

-- client_users table
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'client_users') THEN
    CREATE TABLE public.client_users (
      id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
      client_id uuid REFERENCES public.clients(id),
      user_id uuid REFERENCES auth.users(id),
      company_id uuid REFERENCES public.companies(id),
      role text DEFAULT 'viewer',
      created_at timestamptz DEFAULT now()
    );
  END IF;
END $$;

-- roles table
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'roles') THEN
    CREATE TABLE public.roles (
      id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
      company_id uuid REFERENCES public.companies(id),
      name text NOT NULL,
      description text,
      is_system boolean DEFAULT false,
      is_default boolean DEFAULT false,
      created_at timestamptz DEFAULT now(),
      updated_at timestamptz DEFAULT now()
    );
  END IF;
END $$;

-- permissions table
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'permissions') THEN
    CREATE TABLE public.permissions (
      id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
      slug text UNIQUE NOT NULL,
      label text NOT NULL,
      module text,
      description text,
      created_at timestamptz DEFAULT now()
    );
  END IF;
END $$;

-- role_permissions table
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'role_permissions') THEN
    CREATE TABLE public.role_permissions (
      id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
      role_id uuid REFERENCES public.roles(id) ON DELETE CASCADE,
      permission_id uuid REFERENCES public.permissions(id) ON DELETE CASCADE,
      created_at timestamptz DEFAULT now(),
      UNIQUE(role_id, permission_id)
    );
  END IF;
END $$;

-- user_roles table
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'user_roles') THEN
    CREATE TABLE public.user_roles (
      id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
      user_id uuid REFERENCES public.users(id) ON DELETE CASCADE,
      role_id uuid REFERENCES public.roles(id) ON DELETE CASCADE,
      company_id uuid REFERENCES public.companies(id),
      is_primary boolean DEFAULT false,
      created_at timestamptz DEFAULT now(),
      UNIQUE(user_id, role_id)
    );
  END IF;
END $$;

-- user_site_access table
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'user_site_access') THEN
    CREATE TABLE public.user_site_access (
      id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
      user_id uuid REFERENCES public.users(id) ON DELETE CASCADE,
      site_id uuid REFERENCES public.sites(id) ON DELETE CASCADE,
      company_id uuid REFERENCES public.companies(id),
      access_level text DEFAULT 'view',
      created_at timestamptz DEFAULT now(),
      UNIQUE(user_id, site_id)
    );
  END IF;
END $$;

-- modules table
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'modules') THEN
    CREATE TABLE public.modules (
      id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
      slug text UNIQUE NOT NULL,
      name text NOT NULL,
      description text,
      is_premium boolean DEFAULT false,
      created_at timestamptz DEFAULT now()
    );
  END IF;
END $$;

-- plans table
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'plans') THEN
    CREATE TABLE public.plans (
      id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
      slug text UNIQUE NOT NULL,
      name text NOT NULL,
      description text,
      stripe_price_id_monthly text,
      stripe_price_id_yearly text,
      created_at timestamptz DEFAULT now()
    );
  END IF;
END $$;

-- plan_features table
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'plan_features') THEN
    CREATE TABLE public.plan_features (
      id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
      plan_id uuid REFERENCES public.plans(id) ON DELETE CASCADE,
      feature_key text NOT NULL,
      label text,
      included boolean DEFAULT true,
      created_at timestamptz DEFAULT now(),
      UNIQUE(plan_id, feature_key)
    );
  END IF;
END $$;

-- company_enabled_modules table
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'company_enabled_modules') THEN
    CREATE TABLE public.company_enabled_modules (
      id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
      company_id uuid REFERENCES public.companies(id) ON DELETE CASCADE,
      module_id uuid REFERENCES public.modules(id),
      enabled boolean DEFAULT true,
      enabled_at timestamptz DEFAULT now(),
      created_at timestamptz DEFAULT now(),
      UNIQUE(company_id, module_id)
    );
  END IF;
END $$;

-- Indexes
CREATE INDEX IF NOT EXISTS idx_clients_company_id ON public.clients(company_id);
CREATE INDEX IF NOT EXISTS idx_client_users_client_id ON public.client_users(client_id);
CREATE INDEX IF NOT EXISTS idx_roles_company_id ON public.roles(company_id);
CREATE INDEX IF NOT EXISTS idx_permissions_module ON public.permissions(module);
CREATE INDEX IF NOT EXISTS idx_role_permissions_role_id ON public.role_permissions(role_id);
CREATE INDEX IF NOT EXISTS idx_role_permissions_permission_id ON public.role_permissions(permission_id);
CREATE INDEX IF NOT EXISTS idx_user_roles_user_id ON public.user_roles(user_id);
CREATE INDEX IF NOT EXISTS idx_user_roles_company_id ON public.user_roles(company_id);
CREATE INDEX IF NOT EXISTS idx_user_site_access_user_id ON public.user_site_access(user_id);
CREATE INDEX IF NOT EXISTS idx_user_site_access_site_id ON public.user_site_access(site_id);
CREATE INDEX IF NOT EXISTS idx_plan_features_plan_id ON public.plan_features(plan_id);
CREATE INDEX IF NOT EXISTS idx_company_enabled_modules_company_id ON public.company_enabled_modules(company_id);

-- Enable RLS
ALTER TABLE public.clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.client_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.permissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.role_permissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_site_access ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.modules ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.plan_features ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.company_enabled_modules ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
  RAISE NOTICE 'Seed data for system roles and permissions is in supabase/seed/001_system_roles.sql';
END $$;