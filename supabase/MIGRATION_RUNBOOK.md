# GuardianHub Migration Runbook

## Prerequisites

- Supabase CLI installed: `npm install -g supabase`
- Docker running (for local Supabase)
- Access to the Supabase project dashboard

---

## 1. Starting Local Supabase

```bash
cd supabase
supabase start
```

This starts all local Supabase services (Postgres, Auth, Storage, Edge Functions) on ports 54321-54324.

---

## 2. Applying Migrations Locally

```bash
supabase db reset          # Full reset: drop everything, re-run all migrations
supabase db push           # Push local migrations to linked remote (BE CAREFUL)
supabase migration up      # Apply pending migrations only
```

For first-time setup:

```bash
supabase db reset          # Creates clean local DB from migrations
```

---

## 3. Running Database Tests

```bash
# Schema contract tests
psql -h localhost -p 54322 -d postgres -U postgres -f supabase/tests/schema_contract_test.sql

# Storage contract tests
psql -h localhost -p 54322 -d postgres -U postgres -f supabase/tests/storage_contract_test.sql

# RPC contract tests
psql -h localhost -p 54322 -d postgres -U postgres -f supabase/tests/rpc_contract_test.sql
```

---

## 4. Generating Database Types

```bash
supabase gen types typescript --local > lib/database.types.ts
```

Or for the linked remote:

```bash
supabase gen types typescript --linked > lib/database.types.ts
```

---

## 5. Creating a Backup Before Production Migration

### Option A: Via Supabase Dashboard
Go to Supabase Dashboard → Database → Backups → Create Backup

### Option B: Via pg_dump (if direct access)
```bash
pg_dump -h {host} -p 5432 -d postgres -U postgres --schema=public --no-owner > guardianhub_backup_$(date +%Y%m%d_%H%M%S).sql
```

### Option C: Via Supabase CLI
```bash
supabase db dump --linked -f guardianhub_backup.sql
```

---

## 6. Performing a Dry Run

1. Start local Supabase: `supabase start`
2. Apply all migrations: `supabase db reset`
3. Run all tests
4. Verify all tests pass
5. Compare local schema with remote: note any differences

---

## 7. Applying Production Migrations

**CRITICAL: Always backup first (Step 5).**

```bash
# Link to remote project (one-time)
supabase link --project-ref {your-project-ref}

# Push migrations
supabase db push

# Verify
supabase db remote commit  # Fetches remote schema state
```

---

## 8. Verifying Migration Success

After each migration push:

1. Run schema contract tests against remote (adjust connection string)
2. Verify key queries work (sites, guards, shifts, incidents)
3. Check Supabase dashboard → Database → Migrations (all green)
4. Monitor edge function logs for errors
5. Check application functionality on staging

---

## 9. Roll Forward After Failure

If a migration fails:

1. **DO NOT** manually modify the production database
2. Check the migration error in Supabase dashboard
3. For idempotent migrations (all Phase 1A migrations are idempotent):
   - Fix the migration file
   - Push again (idempotent = safe to re-run)
4. For non-idempotent migrations (future phases):
   - Create a repair migration
   - Push the repair migration
   - Document the failure and resolution

---

## 10. Changes Requiring Manual Approval

Before pushing to production:

- [ ] Backup created (Step 5)
- [ ] Dry run passed locally (Step 6)
- [ ] Migration review by team member
- [ ] Staging deployment verified
- [ ] RLS policy changes reviewed (Phase 1B items)
- [ ] Storage bucket privacy changes reviewed
- [ ] Edge function JWT settings verified
- [ ] No destructive statements (DROP, TRUNCATE) in migration
- [ ] idempotent checks present (CREATE IF NOT EXISTS, DO blocks)

---

## 11. Storage Bucket Setup

Buckets must be created via Supabase dashboard or Management API:

1. Go to Supabase Dashboard → Storage
2. Create missing buckets: `guard-photos`, `sop-documents`
3. Set privacy: `guard-photos` = public, `sop-documents` = private
4. Add bucket policies for authenticated users
5. Verify file size limits and allowed MIME types

See: `supabase/migrations/017_guardianhub_storage_buckets.sql` for full specs.

---

## 12. Edge Function Deployment

Edge functions are deployed via Readdy/Supabase dashboard. 

See: `supabase/config.toml` for intended JWT verification settings.

Full edge function security audit deferred to Phase 1B.

---

## 13. Emergency Rollback

If a migration causes issues:

1. Restore from backup (Step 5)
2. OR: Check out the previous working migration version
3. Investigate root cause before retrying
4. Never manually patch production without creating a migration for it