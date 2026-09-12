-- GuardianHub Phase 18: Customer success, help centre, training academy and support operations
-- Reuses existing support_tickets/support_messages/kb_articles/training_modules/announcements where safe.

-- ---------------------------------------------------------------------------
-- HELP CENTRE
-- ---------------------------------------------------------------------------
create table if not exists public.help_categories (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  name text not null,
  description text,
  icon text,
  sort_order int not null default 0,
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);

create table if not exists public.help_articles (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  title text not null,
  summary text,
  category_id uuid references public.help_categories(id) on delete set null,
  category_slug text,
  audience text not null default 'public',
  roles text[],
  product_areas text[],
  content text not null,
  product_version text,
  author_id uuid references public.users(id),
  reviewer_id uuid references public.users(id),
  status text not null default 'draft',
  is_featured boolean not null default false,
  seo_title text,
  seo_description text,
  effective_date date,
  review_date date,
  published_at timestamptz,
  published_by uuid references public.users(id),
  view_count int not null default 0,
  helpful_count int not null default 0,
  not_helpful_count int not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.help_article_versions (
  id uuid primary key default gen_random_uuid(),
  article_id uuid not null references public.help_articles(id) on delete cascade,
  version int not null,
  title text not null,
  summary text,
  content text not null,
  changed_by uuid references public.users(id),
  change_summary text,
  created_at timestamptz not null default now()
);

create table if not exists public.help_article_feedback (
  id uuid primary key default gen_random_uuid(),
  article_id uuid not null references public.help_articles(id) on delete cascade,
  user_id uuid references public.users(id),
  helpful boolean not null,
  comment text,
  created_at timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- ONBOARDING
-- ---------------------------------------------------------------------------
create table if not exists public.onboarding_programs (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique,
  description text,
  target_roles text[],
  version text not null default '1.0',
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);

create table if not exists public.onboarding_steps (
  id uuid primary key default gen_random_uuid(),
  program_id uuid not null references public.onboarding_programs(id) on delete cascade,
  step_order int not null,
  title text not null,
  description text,
  feature_key text not null,
  is_required boolean not null default true,
  role_visibility text[],
  help_article_slug text,
  created_at timestamptz not null default now()
);

create table if not exists public.onboarding_progress (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null references public.companies(id) on delete cascade,
  program_id uuid not null references public.onboarding_programs(id) on delete cascade,
  step_id uuid not null references public.onboarding_steps(id) on delete cascade,
  status text not null default 'not_started',
  evidence jsonb,
  completed_at timestamptz,
  updated_at timestamptz not null default now(),
  unique (company_id, step_id)
);

create table if not exists public.onboarding_blockers (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null references public.companies(id) on delete cascade,
  step_id uuid references public.onboarding_steps(id) on delete set null,
  blocker_type text not null,
  title text not null,
  description text,
  severity text not null default 'warning',
  resolved boolean not null default false,
  resolved_at timestamptz,
  created_at timestamptz not null default now()
);

create table if not exists public.implementation_projects (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null references public.companies(id) on delete cascade,
  name text not null default 'Implementation',
  status text not null default 'active',
  assigned_contact text,
  go_live_target date,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.implementation_tasks (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.implementation_projects(id) on delete cascade,
  company_id uuid not null references public.companies(id) on delete cascade,
  title text not null,
  status text not null default 'open',
  owner_role text,
  due_date date,
  completed_at timestamptz,
  created_at timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- TRAINING ACADEMY (knowledge checks + attempts; courses reuse training_modules)
-- ---------------------------------------------------------------------------
create table if not exists public.training_assessments (
  id uuid primary key default gen_random_uuid(),
  module_id uuid references public.training_modules(id) on delete cascade,
  company_id uuid references public.companies(id) on delete cascade,
  title text not null,
  pass_mark int not null default 75,
  max_attempts int not null default 3,
  is_high_risk boolean not null default false,
  questions jsonb,
  question_version int not null default 1,
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);

create table if not exists public.training_attempts (
  id uuid primary key default gen_random_uuid(),
  assessment_id uuid not null references public.training_assessments(id) on delete cascade,
  completion_id uuid references public.training_completions(id) on delete cascade,
  user_id uuid references public.users(id),
  company_id uuid references public.companies(id) on delete cascade,
  attempt_number int not null default 1,
  score int,
  passed boolean,
  answers jsonb,
  started_at timestamptz not null default now(),
  submitted_at timestamptz,
  created_at timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- SUPPORT AUDIT + LINKING
-- ---------------------------------------------------------------------------
create table if not exists public.support_ticket_events (
  id uuid primary key default gen_random_uuid(),
  ticket_id uuid not null references public.support_tickets(id) on delete cascade,
  actor_id uuid references public.users(id),
  action text not null,
  previous_status text,
  new_status text,
  metadata jsonb,
  created_at timestamptz not null default now()
);

alter table public.support_tickets add column if not exists linked_incident_id uuid;
alter table public.platform_announcements add column if not exists change_type text not null default 'announcement';

-- ---------------------------------------------------------------------------
-- INDEXES
-- ---------------------------------------------------------------------------
create index if not exists idx_help_articles_slug on public.help_articles(slug);
create index if not exists idx_help_articles_status_audience on public.help_articles(status, audience);
create index if not exists idx_help_versions_article on public.help_article_versions(article_id);
create index if not exists idx_help_feedback_article on public.help_article_feedback(article_id);
create index if not exists idx_onboarding_progress_company on public.onboarding_progress(company_id);
create index if not exists idx_onboarding_blockers_company on public.onboarding_blockers(company_id, resolved);
create index if not exists idx_impl_projects_company on public.implementation_projects(company_id);
create index if not exists idx_impl_tasks_company on public.implementation_tasks(company_id, status);
create index if not exists idx_training_assessments_module on public.training_assessments(module_id);
create index if not exists idx_training_attempts_assessment on public.training_attempts(assessment_id);
create index if not exists idx_training_attempts_company on public.training_attempts(company_id);
create index if not exists idx_ticket_events_ticket on public.support_ticket_events(ticket_id);

-- ---------------------------------------------------------------------------
-- ROW LEVEL SECURITY
-- ---------------------------------------------------------------------------
alter table public.help_categories enable row level security;
alter table public.help_articles enable row level security;
alter table public.help_article_versions enable row level security;
alter table public.help_article_feedback enable row level security;
alter table public.onboarding_programs enable row level security;
alter table public.onboarding_steps enable row level security;
alter table public.onboarding_progress enable row level security;
alter table public.onboarding_blockers enable row level security;
alter table public.implementation_projects enable row level security;
alter table public.implementation_tasks enable row level security;
alter table public.training_assessments enable row level security;
alter table public.training_attempts enable row level security;
alter table public.support_ticket_events enable row level security;

-- help_categories
create policy "categories_public_read" on public.help_categories for select using (is_active = true);
create policy "categories_staff_all" on public.help_categories for all using (is_platform_staff()) with check (is_platform_staff());

-- help_articles
create policy "articles_published_read" on public.help_articles for select
  using (status = 'published' and (audience = 'public' or auth.role() = 'authenticated'));
create policy "articles_staff_all" on public.help_articles for all
  using (is_platform_staff()) with check (is_platform_staff());

-- help_article_versions
create policy "versions_staff_read" on public.help_article_versions for select using (is_platform_staff());
create policy "versions_staff_write" on public.help_article_versions for all using (is_platform_staff()) with check (is_platform_staff());

-- help_article_feedback
create policy "feedback_any_authenticated_insert" on public.help_article_feedback for insert
  with check (auth.role() = 'authenticated');
create policy "feedback_staff_read" on public.help_article_feedback for select using (is_platform_staff());

-- onboarding_programs / steps
create policy "programs_auth_read" on public.onboarding_programs for select using (auth.role() = 'authenticated');
create policy "programs_staff_all" on public.onboarding_programs for all using (is_platform_staff()) with check (is_platform_staff());
create policy "steps_auth_read" on public.onboarding_steps for select using (auth.role() = 'authenticated');
create policy "steps_staff_all" on public.onboarding_steps for all using (is_platform_staff()) with check (is_platform_staff());

-- onboarding_progress
create policy "progress_tenant_select" on public.onboarding_progress for select using (company_id = get_my_company_id() or is_platform_staff());
create policy "progress_tenant_insert" on public.onboarding_progress for insert with check (company_id = get_my_company_id() or is_platform_staff());
create policy "progress_tenant_update" on public.onboarding_progress for update using (company_id = get_my_company_id() or is_platform_staff());

-- onboarding_blockers
create policy "blockers_tenant_select" on public.onboarding_blockers for select using (company_id = get_my_company_id() or is_platform_staff());
create policy "blockers_tenant_insert" on public.onboarding_blockers for insert with check (company_id = get_my_company_id() or is_platform_staff());
create policy "blockers_tenant_update" on public.onboarding_blockers for update using (company_id = get_my_company_id() or is_platform_staff());

-- implementation_projects
create policy "projects_tenant_select" on public.implementation_projects for select using (company_id = get_my_company_id() or is_platform_staff());
create policy "projects_tenant_insert" on public.implementation_projects for insert with check (company_id = get_my_company_id() or is_platform_staff());
create policy "projects_tenant_update" on public.implementation_projects for update using (company_id = get_my_company_id() or is_platform_staff());

-- implementation_tasks
create policy "tasks_tenant_select" on public.implementation_tasks for select using (company_id = get_my_company_id() or is_platform_staff());
create policy "tasks_tenant_insert" on public.implementation_tasks for insert with check (company_id = get_my_company_id() or is_platform_staff());
create policy "tasks_tenant_update" on public.implementation_tasks for update using (company_id = get_my_company_id() or is_platform_staff());

-- training_assessments (shared/company)
create policy "assessments_read" on public.training_assessments for select
  using (company_id is null or company_id = get_my_company_id() or is_platform_staff());
create policy "assessments_staff_all" on public.training_assessments for all
  using (is_platform_staff()) with check (is_platform_staff());

-- training_attempts
create policy "attempts_read" on public.training_attempts for select
  using (company_id = get_my_company_id() or user_id = auth.uid() or is_platform_staff());
create policy "attempts_insert" on public.training_attempts for insert
  with check (company_id = get_my_company_id() or is_platform_staff());
create policy "attempts_update" on public.training_attempts for update
  using (user_id = auth.uid() or is_platform_staff());

-- support_ticket_events (audit)
create policy "ticket_events_read" on public.support_ticket_events for select
  using (exists (
    select 1 from public.support_tickets t
    where t.id = support_ticket_events.ticket_id
      and (t.company_id = get_my_company_id() or is_platform_staff())
  ));
create policy "ticket_events_insert" on public.support_ticket_events for insert
  with check (auth.role() = 'authenticated');