# GuardianHub Schema Gap Report — Phase 1A

Generated: 2026-08-10

---

## Executive Summary

The GuardianHub production database is comprehensive. 134 tables exist, 135/135 (99.3%) have RLS enabled, all 6 target RPCs are present and functional, and the core tenancy model is intact. However, the database has zero migration history, no supabase/config.toml, and two missing storage buckets. Several privacy mismatches need resolution.

**Overall Status: YELLOW — Viable with documented gaps**

---

## Gap 1: Missing Storage Buckets (P0)

| Bucket | Impact | Fix |
|---|---|---|
| guard-photos | AddGuardModal and CreateTemplateModal fail on photo upload | Create bucket via Supabase dashboard. Set public, image/* only, 5MB max |
| sop-documents | SOP document operations fail (useSOPDocuments, useSOPLibrary) | Create bucket via Supabase dashboard. Set private, PDF/DOC only, 25MB max |

---

## Gap 2: Storage Privacy Mismatches (P1)

| Bucket | Issue | Risk | Fix |
|---|---|---|---|
| incident-media | Currently PUBLIC | Sensitive incident photos publicly accessible | Switch to private, use signed URLs consistently |
| compliance-documents | Private bucket, but code uses getPublicUrl | Broken file links for compliance documents | Either make public OR update all code to createSignedUrl |

---

## Gap 3: Missing Migrations (P0)

**Zero migration files existed before Phase 1A.** No way to reproduce the database from scratch.

Phase 1A created:
- `supabase/migrations/001_guardianhub_extensions_and_helpers.sql`
- `supabase/migrations/002_guardianhub_core_tenancy.sql`
- `supabase/migrations/003_guardianhub_users_roles_permissions.sql`
- `supabase/migrations/017_guardianhub_storage_buckets.sql`
- `supabase/migrations/018_guardianhub_indexes_constraints_triggers.sql`

**Remaining migrations 004-016 are INTENTIONAL placeholders.** Tables in those domains already exist in production. Complete DDL recovery requires extracting the full CREATE TABLE statements from the production database (Phase 1B task).

---

## Gap 4: Missing supabase/config.toml (P0)

No `supabase/config.toml` existed before Phase 1A. Created with intended configuration.

**Critical: Edge function JWT verification status is UNKNOWN** — none were configured through config.toml. Must be verified in Phase 1B before any function is considered secure.

---

## Gap 5: webhook_debug_log Has No RLS (P2)

Only table in the database without RLS. Should be protected or have a documented justification.

---

## Gap 6: Incomplete Migration DDL (P1)

Migrations 004-016 document the schema categories but do not contain full CREATE TABLE statements for tables that already exist. Complete DDL recovery requires:

Option A: `pg_dump --schema-only --no-owner` on production (if access available)
Option B: Manual column-by-column recovery by inspecting information_schema
Option C: Supabase dashboard → Database → Schema visualizer export

---

## Gap 7: RLS Policy Content Not Audited (Phase 1B)

While 134/135 tables have RLS ON, the actual policy SQL has not been reviewed for:
- Cross-company data isolation
- Proper auth.uid() checks
- Least-privilege access for each role
- No policy recursion
- No permission escalation vectors

---

## Gap 8: No Database Types Generated

The `lib/database.types.ts` file does not exist. Running `supabase gen types` would produce it but requires a clean migration-based schema first.

---

## Phase 1B Prerequisites

Before Phase 1B can begin, the following must be completed:

1. [ ] guard-photos bucket created
2. [ ] sop-documents bucket created
3. [ ] incident-media switched to private (after code audit)
4. [ ] compliance-documents privacy fix (bucket or code)
5. [ ] Edge function JWT settings verified in Supabase dashboard
6. [ ] Full DDL extraction for migrations 004-016
7. [ ] Database types generated

---

## Phase 1B Scope (Preview)

1. Complete DDL recovery for all 134 tables
2. RLS policy audit and hardening
3. Edge function JWT verification
4. Storage bucket policy hardening
5. Cross-company isolation verification
6. Service-role key usage audit
7. Trigger function security review
8. Database types generation