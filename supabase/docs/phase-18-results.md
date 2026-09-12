# GuardianHub Phase 18 — Customer Success, Help Centre, Training & Support

## What was built

### Customer Success Hub — `/dashboard/getting-started`
- Overall setup progress, current stage, required vs recommended actions, milestones, blocked items, implementation contact, go-live readiness.
- Progress is computed from real completion criteria (company profile, privileged admins, team, clients, sites, guards, SIA records, shift templates, notifications, subscription, client portal, integrations, automation rules, training completions). No manually-entered percentages.
- Role-specific welcome for 11 roles (platform operator, administrator, operations manager, controller, supervisor, guard, client admin, client viewer, finance, recruitment) with responsibilities and first actions.
- Resumable and safe; links into the Help Centre and Support.

### Help Centre — `/help` and `/help/[slug]`
- Search, 13 categories, featured guides, audience-aware visibility (public / authenticated / role-specific). Search only returns content the current user is authorised to see.
- Article detail with versioned content, helpful/not-helpful feedback, and contact-support CTA.

### Help article management — `/admin/help`
- Title, slug, summary, category, audience, role visibility, draft/published/archived, content, SEO fields.
- Version history recorded on every save/publish. Plain-text rendering (no unsafe HTML or scripts).

### Training Academy — `/academy`
- 6 platform courses (administrator, operations, guard app, incident/SOS, client portal, finance) with role targeting.
- 2 knowledge checks (SOS scenario-based high-risk, Guard app basics) with multiple choice, multiple response, true/false, pass marks, attempt limits, explanations and persisted attempts.
- Product training is explicitly NOT presented as SIA accreditation.

### Support Centre — `/dashboard/support` and `/dashboard/support/[id]`
- Create ticket (11 categories), urgency (P1-P4), consent, emergency guidance.
- Conversation, attachments, SLA display (first-response / resolution due + breach), close/reopen, satisfaction rating.
- Emergency notice: support tickets are never an emergency channel.

### Support Workspace — `/admin/support-tickets`
- Cross-tenant list, analytics (open, resolved, SLA breached, average satisfaction, top category), assign, status transitions, customer replies and private internal notes, audit events.

### Updates / changelog — `/updates`
- Reads published `platform_announcements` grouped by change type (new feature, improvement, fix, security, maintenance, deprecation, announcement).

## Data model (migration 025)
New tables (all RLS enabled, 13 total):
- `help_categories`, `help_articles`, `help_article_versions`, `help_article_feedback`
- `onboarding_programs`, `onboarding_steps`, `onboarding_progress`, `onboarding_blockers`
- `implementation_projects`, `implementation_tasks`
- `training_assessments`, `training_attempts`
- `support_ticket_events`

Reused (not duplicated): `support_tickets`, `support_ticket_messages`, `support_ticket_attachments`, `support_sla_rules`, `ticket_satisfaction_ratings`, `kb_articles`, `training_modules`, `training_completions`, `platform_announcements`, `announcement_acknowledgments`, `support_access_logs`.

Columns added: `support_tickets.linked_incident_id`, `platform_announcements.change_type`.

Seed: 13 categories, 1 onboarding program + 16 steps, 14 help articles, 6 courses, 2 assessments.

## Honest limits / remaining manual content
- Guard mobile introduction acknowledgements, client portal intro and contextual help on legacy workflows are supported by the reusable `HelpTip` component and the seeded help articles, but full first-run tours across every existing page remain manual.
- The safe Help Assistant rules are documented but no new AI assistant was added (existing SOP assistant remains scoped to SOPs).
- `database.types.ts` is a partial snapshot of the schema; regenerate with `supabase gen types typescript` to include the new tables for strict type checking.
- `npm run build` / `tsc` could not be run in this workspace.

## Verify
```bash
npm run build
npx tsc --noEmit
npx supabase gen types typescript --project-id <id> > lib/database.types.ts
```

## Not done (deliberately)
- No fake support staff, replies, statistics, availability or completion data. All analytics derive from real rows (which are currently empty until customers use the system).
- This phase does NOT mark GuardianHub ready for launch; the complete launch re-audit follows next.