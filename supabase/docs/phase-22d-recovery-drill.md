# GuardianHub — Phase 22D Recovery Drill Report

Date: 2026-08-13
Phase: 22D — Real Backup, Restore and Disaster-Recovery Drill

---

## 1. Executive Verdict

**FAIL — RECOVERY CAPABILITY NOT PROVEN; PRODUCTION DEPLOYMENT PROHIBITED**

No restore was performed. No isolated recovery project was created. No Storage objects exist to
restore. No RPO/RTO measurements were taken. Every step that requires a shell, the Supabase
Dashboard, the Supabase CLI, or a second Supabase project is BLOCKED in this environment. The
blockers are documented in full below with exact external commands for an operator to complete
the drill.

What was accomplished:
- Live source baseline captured from the connected staging project (verified SQL queries).
- All 12 Storage buckets confirmed empty — Storage object recovery is moot but the absence
  of any configured off-site backup is a new defect (DR-001).
- Corrective tooling added to the repository:
  - `supabase/scripts/storage-migrate.js` — Supabase-official Storage migration script.
  - `supabase/scripts/recovery-verify.sql` — post-restore reconciliation queries.
  - `supabase/scripts/recovery-env-checklist.sh` — recovery project safety pre-flight.
- Existing runbooks updated with verified CLI commands (sourced from official Supabase docs).

Nothing touched the production project. No backup or restore operation was claimed as complete.

---

## 2. Source Project Baseline (Live — 2026-08-13)

Queries run against the connected SaaS Supabase project. Project reference is redacted.

| Item | Value | Source |
|------|-------|--------|
| Postgres version | 17.6 | `current_setting('server_version')` |
| Database size | 103 MB | `pg_database_size` |
| Tables | 322 | `information_schema.tables` |
| Views | 10 | `information_schema.views` |
| Functions | 272 | `pg_proc` |
| Triggers | 19 | `pg_trigger` |
| RLS policies | 758 | `pg_policy` |
| Sequences | 6 | `pg_class` |
| Auth users | 5 | `auth.users` |
| Storage buckets | 12 | `storage.buckets` |
| Storage objects | 0 | `storage.objects` |
| Storage bytes | 0 | `storage.objects.metadata.size` |
| pg_cron jobs | 4 | `cron.job` |
| Migration head | 20260629214244 | `supabase_migrations.schema_migrations` |
| WAL archiving | Active — 9936 WAL files archived, 0 failed, last archived 2026-08-13 19:03:09 UTC | `pg_stat_archiver` (Phase 20B) |
| Extensions | pg_cron 1.6.4, pg_net 0.20.0, pg_stat_statements 1.11, pgcrypto 1.3, plpgsql 1.0, supabase_vault 0.3.1, uuid-ossp 1.1, vector 0.8.0 | `pg_extension` |
| PITR enabled | UNVERIFIED (Dashboard only; WAL archiving mechanism is active) | Dashboard |
| Backup retention | UNVERIFIED (Dashboard only) | Dashboard |
| Supabase plan tier | UNVERIFIED (consistent with Pro or higher based on features) | Dashboard |

### Storage bucket inventory

| Bucket | Public | File size limit | Objects | Status |
|--------|--------|-----------------|---------|--------|
| acs-evidence | Private | None | 0 | Empty |
| client-documents | Private | 50 MB | 0 | Empty |
| company-logos | Public | 5 MB | 0 | Empty |
| compliance-documents | Private | None | 0 | Empty |
| email-assets | Public | 5 MB | 0 | Empty |
| evidence | Private | None | 0 | Empty |
| guard-documents | Private | None | 0 | Empty |
| incident-media | Private | 50 MB | 0 | Empty |
| reports | Private | None | 0 | Empty |
| site-images | Private | None | 0 | Empty |
| support-attachments | Private | 5 MB | 0 | Empty |
| user-image | Private | None | 0 | Empty |

All 12 buckets are empty. No physical Storage object recovery is required for the current
state. However, the absence of an off-site Storage backup configuration is a High defect
(DR-001) because it means physical objects uploaded in future would not be recoverable from a
database restore.

### Scheduled jobs (pg_cron)

| Job ID | Name | Schedule |
|--------|------|----------|
| 1 | weekly-site-reports | 0 6 * * 1 (Monday 06:00 UTC) |
| 2 | expire-shift-cover-offers | */5 * * * * |
| 3 | expire_shift_cover_offers | */5 * * * * |
| 5 | lone-worker-escalation-check | */2 * * * * |

Known issues (carried from Phase 20B):
- Jobs 2 and 3 are duplicates. One must be removed.
- Job 5 hardcodes the project URL and reads a service-role key from `app.service_role_key`.
  This secret handling pattern should be migrated to Supabase Vault.

### config.toml drift

`supabase/config.toml` declares `[db] major_version = 15`. Live database is Postgres 17.6.
Local config is stale and must not be treated as the source of truth.

---

## 3. Recovery Markers (Pre-Drill — Template)

Recovery markers must be created by the operator at drill time. They are not pre-populated
because no drill was executed.

**Required pre-restore markers (create just before the chosen recovery point):**

```sql
-- Tenant A marker
INSERT INTO companies (name, created_at)
VALUES ('_DRILL_MARKER_TENANT_A_20260813', now())
RETURNING id, created_at;

-- Tenant B marker
INSERT INTO companies (name, created_at)
VALUES ('_DRILL_MARKER_TENANT_B_20260813', now())
RETURNING id, created_at;
```

Record the returned IDs and timestamps. Upload a small synthetic file (e.g. 16-byte random
data) to `incident-media` bucket once it contains real objects, record its path and SHA-256
checksum.

**Required post-restore-point marker (create after the chosen recovery point):**

```sql
INSERT INTO companies (name, created_at)
VALUES ('_DRILL_MARKER_POST_RESTORE_20260813', now())
RETURNING id, created_at;
```

Verify this row is absent after restoration — confirming the correct recovery boundary.

---

## 4. Recovery Method Selected

**Option B — Manual logical recovery via Supabase CLI.**

Rationale: CLI backup/restore is the operator-controllable method that does not require
Supabase support intervention and works with the project's connected SaaS Supabase plan.
The "Restore to a New Project" Dashboard feature (Option A) is also available and may be
faster — the operator should confirm which is supported on the current plan.

Commands sourced from: https://supabase.com/docs/guides/platform/migrating-within-supabase/backup-restore

---

## 5. Recovery Timeline (Blocked — Not Executed)

| Step | Status | Reason |
|------|--------|--------|
| Pre-drill baseline captured | PASS | Live SQL queries executed |
| Recovery project created | BLOCKED | Requires Supabase Dashboard or Management API |
| Recovery markers created | BLOCKED | No shell / no target project |
| Backup taken | BLOCKED | Requires CLI (`supabase db dump`) |
| Database restored | BLOCKED | Requires shell + psql + recovery project |
| Storage restored | NOT APPLICABLE | All buckets empty |
| RLS/tenant isolation tested | BLOCKED | Requires recovery project + two authenticated sessions |
| Auth validated | BLOCKED | Requires recovery project |
| Application built/started | BLOCKED | Requires shell |
| RPO measured | BLOCKED | No restore executed |
| RTO measured | BLOCKED | No restore executed |
| Rollback exercise | BLOCKED | No restore to roll back |

---

## 6. Exact External Commands Required

All commands must be run by an operator with CLI access, not in this environment. Credentials
must not appear in logs. `$SOURCE_DB_URL` and `$RECOVERY_DB_URL` are Session pooler
connection strings with password substituted.

### Step 1 — Confirm PITR and backup availability (Dashboard)

```
Supabase Dashboard → project → Database → Backups
→ Confirm daily snapshots enabled
→ Confirm PITR enabled (requires Pro tier or higher)
→ Record earliest and latest recovery points
→ Record backup retention window
```

### Step 2 — Create the isolated recovery project (Dashboard)

```
Supabase Dashboard → New Project
  Name:     guardianhub-recovery-20260813
  Region:   Same region as source project
  
AFTER CREATION — apply safety controls immediately:
  - Do NOT configure production custom domain
  - Do NOT add live Stripe keys (use test mode only)
  - Do NOT add production email/SMS credentials
  - Do NOT add production n8n credentials
  - Disable all cron jobs after restore (re-enable only after testing)
  - Label/tag as RECOVERY-TEST-ONLY
```

### Step 3 — Record source migration history for preservation

```bash
supabase db dump \
  --db-url "$SOURCE_DB_URL" \
  -f history_schema.sql \
  --schema supabase_migrations

supabase db dump \
  --db-url "$SOURCE_DB_URL" \
  -f history_data.sql \
  --use-copy --data-only \
  --schema supabase_migrations
```

### Step 4 — Take the logical backup

```bash
supabase db dump --db-url "$SOURCE_DB_URL" \
  -f roles.sql --role-only

supabase db dump --db-url "$SOURCE_DB_URL" \
  -f schema.sql

supabase db dump --db-url "$SOURCE_DB_URL" \
  -f data.sql \
  --use-copy --data-only \
  -x "storage.buckets_vectors" \
  -x "storage.vector_indexes"
```

Record: start time, end time, file sizes. Do not include connection string in logs.

### Step 5 — Configure the recovery project extensions

```
Supabase Dashboard → recovery project → Database → Extensions
→ Enable: pg_cron, pg_net, vector, pgcrypto, uuid-ossp
→ Enable: Database Webhooks (if used)
```

### Step 6 — Restore into the recovery project

```bash
# Restore roles (expected errors on supabase_admin lines — see note below)
psql \
  --single-transaction \
  --variable ON_ERROR_STOP=1 \
  --file roles.sql \
  --dbname "$RECOVERY_DB_URL"

# NOTE: If "permission denied to grant role postgres" error occurs on cli_login_postgres:
#   Open roles.sql and comment out the line:
#   GRANT "postgres" TO "cli_login_postgres" WITH INHERIT FALSE GRANTED BY "supabase_admin";

# Restore schema and data
psql \
  --single-transaction \
  --variable ON_ERROR_STOP=1 \
  --file schema.sql \
  --command 'SET session_replication_role = replica' \
  --file data.sql \
  --dbname "$RECOVERY_DB_URL"

# NOTE: If "ALTER ... OWNER TO supabase_admin" errors occur, comment out those lines in schema.sql

# Restore migration history
psql \
  --single-transaction \
  --variable ON_ERROR_STOP=1 \
  --file history_schema.sql \
  --file history_data.sql \
  --dbname "$RECOVERY_DB_URL"
```

Record: start time, end time, exit code, error count, warning count.

### Step 7 — Classify all restore errors

For every error or warning record:
- Statement
- Error code / message
- Classification: expected-harmless | corrected-and-retested | unresolved-blocker

Unresolved blockers halt the drill.

### Step 8 — Run post-restore verification SQL

```bash
psql --dbname "$RECOVERY_DB_URL" \
  --file supabase/scripts/recovery-verify.sql
```

### Step 9 — Enable Realtime publications (if used)

```
Dashboard → recovery project → Database → Publications
→ Re-enable tables that used Realtime in source project
```

### Step 10 — Disable all cron jobs in recovery project

```sql
-- Run in recovery project SQL editor
UPDATE cron.job SET active = false;
```

### Step 11 — Apply migration 028 (least-privilege grants)

```bash
psql --dbname "$RECOVERY_DB_URL" \
  --file supabase/migrations/028_guardianhub_phase22a_grant_repair.sql
```

### Step 12 — Deploy Edge Functions to recovery project

```bash
supabase login
supabase functions deploy --project-ref RECOVERY_PROJECT_REF
```

Set environment secrets in recovery project to safe test/dummy values only. No production
secrets in recovery project.

### Step 13 — Storage object migration (if objects exist at drill time)

```bash
node supabase/scripts/storage-migrate.js
```

The script requires `OLD_PROJECT_URL`, `OLD_PROJECT_SERVICE_KEY`, `NEW_PROJECT_URL`,
`NEW_PROJECT_SERVICE_KEY` in its environment. Do not commit these values. After migration,
verify checksums per the procedure in section 9.

### Step 14 — Tenant isolation and RPC security tests

```bash
psql --dbname "$RECOVERY_DB_URL" \
  --file supabase/tests/phase-20a-rpc-security-tests.sql

psql --dbname "$RECOVERY_DB_URL" \
  --file supabase/tests/rls_tenant_isolation_test.sql

psql --dbname "$RECOVERY_DB_URL" \
  --file supabase/tests/phase-15-tenant-isolation.sql
```

Additionally, test through two genuine authenticated browser sessions (not service_role):
- Tenant A can read its own records
- Tenant A cannot read Tenant B records
- Unauthenticated access is denied

### Step 15 — Application smoke test

```bash
# In recovery-env-configured workspace
npm ci
npm run typecheck
npm run lint
npm run test:run
npm run build
```

Run Playwright smoke test against recovery project URL:
```bash
NEXT_PUBLIC_SUPABASE_URL=https://RECOVERY_REF.supabase.co \
NEXT_PUBLIC_SUPABASE_ANON_KEY=RECOVERY_ANON_KEY \
npm run test:e2e
```

### Step 16 — Measure RPO and RTO

```
Recovery start time: (timestamp when incident declared / drill started)
Newest confirmed recovered data timestamp: (MAX created_at from a high-frequency table)
Observed RPO = recovery start time − newest recovered data timestamp

Critical recovery point: (timestamp when DB available + auth working + isolation verified + Storage objects available + build passes)
Observed RTO = recovery start time − critical recovery point
```

### Step 17 — Recovery project cleanup

After evidence is collected and stored:
```
Supabase Dashboard → recovery project → Settings → Danger Zone → Delete project
```
Owner must confirm cleanup. Cleanup date must be recorded.

---

## 7. Database Reconciliation (Blocked)

Per the acceptance gate, reconciliation requires a completed restore. A reconciliation
query template is provided in `supabase/scripts/recovery-verify.sql`.

At minimum, verify these counts match between source and recovery:

| Table | Source count | Recovery count | Match | Notes |
|-------|-------------|----------------|-------|-------|
| companies | TBD | TBD | TBD | |
| users | TBD | TBD | TBD | |
| guards | TBD | TBD | TBD | |
| clients | TBD | TBD | TBD | |
| sites | TBD | TBD | TBD | |
| shifts | TBD | TBD | TBD | |
| incidents | TBD | TBD | TBD | |
| auth.users | 5 | TBD | TBD | |
| billing_webhook_events | TBD | TBD | TBD | |
| agent_execution_logs | TBD | TBD | TBD | |

Also verify:
- Pre-restore recovery markers present ✗ (not executed)
- Post-restore-point marker absent ✗ (not executed)
- Migration head matches ✗ (not executed)
- All 758 RLS policies present ✗ (not executed)
- All 4 pg_cron jobs present (then disabled) ✗ (not executed)

---

## 8. Auth Validation (Blocked)

Requires recovery project. Expected state at drill time:

- 5 Auth users exist in source
- All profiles link to auth.users via foreign key
- No password resets should be sent to real users during drill
- Session strategy after restore: forced reauthentication required for all users
  (Supabase JWT secrets differ between projects)
- Auth redirect URLs must be set to safe/test destinations in recovery project

---

## 9. Storage Object / Checksum Results (Not Applicable — All Buckets Empty)

All 12 Storage buckets contain zero objects as of 2026-08-13. There are no physical files
to restore or checksum-verify in the current state.

**Critical finding:** No off-site Storage backup target is configured. When objects are
uploaded in future, they will not be independently recoverable from a database backup.
See Defect DR-001.

For future drills when objects exist, the verification procedure is:

```bash
# Before drill: record SHA-256 of each critical object
sha256sum <downloaded_file> > checksums.txt

# After restore: re-download and compare
sha256sum <re-downloaded_file>
diff checksums.txt <(sha256sum <re-downloaded_file>)
```

Required checks per object:
- Object physically exists in recovery bucket
- Byte size matches
- SHA-256 checksum matches
- MIME type matches
- Path matches (tenant-scoped: {company_id}/...)
- Authorized user can access (signed URL works)
- Unauthorized user is denied
- Public/private bucket setting is correct

---

## 10. RLS and Tenant Isolation Results (Blocked)

Static verification (live, from this environment):
- RLS enabled: all 322 public tables (verified in Phase 22C)
- Policies: 758 across all tables (verified this phase)
- Views: all 7 public views use `security_invoker = true` (verified in Phase 22C)

Runtime verification (BLOCKED — requires recovery project + browser sessions):
- Cross-tenant read denial ✗
- Cross-tenant write denial ✗
- Unauthenticated denial ✗
- `guard_seed_first_run_policies` anon denial ✗
- `guard_seed_first_run_policies` cross-tenant denial ✗
- Migration 028 REVOKE grants applied and tested ✗

---

## 11. Application Smoke Test Results (Blocked)

Requires shell + recovery project URL. See section 6, Steps 15+.

Static facts that hold regardless:
- Production build script is present (`npm run build`)
- All Edge Function source is in repository (`supabase/functions/`)
- Playwright test harness script added (`npm run test:e2e`) per Phase 22C

---

## 12. Non-Database Service Recovery

| Component | Source | Recovery method | Status |
|-----------|--------|-----------------|--------|
| Edge Function source | `supabase/functions/` (repository) | `supabase functions deploy --project-ref RECOVERY_REF` | Repository source VERIFIED; deploy BLOCKED (no shell) |
| Edge Function secrets | Supabase Dashboard → project secrets | Manual re-entry in recovery project (safe test values) | BLOCKED (requires Dashboard access) |
| n8n workflow exports | `supabase/n8n-workflows/guardianhub/` (repository) | Manual import via n8n UI | Source VERIFIED; import BLOCKED (no n8n access) |
| n8n credentials | Not in repository (by design) | Manual re-entry in recovery n8n instance | BLOCKED |
| pg_cron jobs | Restored via database dump | Disable all after restore; re-enable after testing | BLOCKED |
| Stripe webhook endpoint | Configured in Stripe Dashboard | Re-register recovery endpoint URL in Stripe test mode | BLOCKED; must use test mode only |
| Email/SMS provider | Configured as secrets | Set to safe test destinations in recovery project | BLOCKED |
| Monitoring/alerting | Not configured | N/A | NOT APPLICABLE |
| DNS/custom domain | Not configured | Do NOT point domain at recovery project | NOT APPLICABLE |
| CI/CD | `.github/workflows/ci.yml` (repository) | Workflow present in source; adapt for recovery ref | UNVERIFIED (ci.yml environment-protected) |

---

## 13. Target vs Observed RPO / RTO

Targets from `backup-and-recovery-plan.md` (proposed, not yet approved by platform owner):

| Objective | Target | Observed | Status |
|-----------|--------|----------|--------|
| Database RPO | 5 minutes | NOT MEASURED | BLOCKED |
| Database RTO | 4 hours | NOT MEASURED | BLOCKED |
| Storage-object RPO | 24 hours | NOT APPLICABLE (no objects) | N/A |
| Storage-object RTO | 8 hours | NOT APPLICABLE (no objects) | N/A |
| Application RTO | 6 hours | NOT MEASURED | BLOCKED |
| SOS/incident tolerance | Zero-loss | NOT TESTED | BLOCKED |

Note: targets remain PROPOSED and have not received platform-owner approval.

---

## 14. Failure and Rollback Exercise (Blocked)

A controlled failure was not simulated because no restore was executed. The following
failure scenarios must be tested at the real drill:

| Scenario | How to simulate | Expected operator response |
|----------|----------------|---------------------------|
| Missing Storage archive | Attempt object restore with no source backup | Runbook: document failure, escalate, do not activate recovery project |
| Incorrect environment config | Set wrong ANON_KEY in recovery env | Runbook: app fails health check; correct secrets; retest |
| Unavailable integration secret | Leave Stripe secret blank in recovery project | Runbook: billing features fail gracefully; document missing secret |
| Failed migration-dependent function | Apply database without migration 028 | Runbook: anon RPC tests fail; apply migration; retest |

For each failure:
1. Detect: Health check / smoke test / SQL test fails.
2. Stop: Do not activate recovery project for traffic.
3. Preserve: Save logs, screenshots, SQL output.
4. Correct: Apply fix to recovery project.
5. Retry: Re-run the specific test.
6. Escalate: If not correctable, escalate to Platform Ops/Engineering lead.

---

## 15. Defect Register

| ID | Severity | Area | Evidence | Root Cause | Action | Owner | Retest |
|----|---------|------|----------|------------|--------|-------|--------|
| DR-001 | High | Storage backup | All 12 buckets empty; no off-site backup target configured | `storage-backup-strategy.md` states BLOCKED; no backup service provisioned | Provision an approved off-site Storage backup target (e.g. S3/GCS private bucket); implement daily export Edge Function for critical private buckets | Platform owner | After backup service provisioned |
| DR-002 | High | Recovery drill | No isolated recovery project exists | No shell/Management API in this environment | Platform operator to create `guardianhub-recovery-20260813` and run commands from section 6 | Platform owner / Operations | After drill executed |
| DR-003 | Medium | pg_cron | Duplicate `expire-shift-cover-offers` jobs (IDs 2 and 3) | Duplicate migration or manual creation | Remove one via: `SELECT cron.unschedule(3);` in Supabase SQL editor | Engineering | After removal |
| DR-004 | Medium | pg_cron | Job 5 reads service-role key from `app.service_role_key` custom setting | Key stored as DB setting instead of Vault secret | Migrate to Vault: store key in `vault.secrets`, update job to read via `vault.decrypted_secrets` | Engineering | After migration |
| DR-005 | Medium | config | `supabase/config.toml` declares `major_version = 15`; live DB is 17.6 | Config not updated after Postgres upgrade | Update `[db] major_version = 17` in `supabase/config.toml` | Engineering | After update |
| DR-006 | High | Grants | Migration 028 (REVOKE least-privilege) unapplied; 14 custom functions still PUBLIC+anon EXECUTE | REVOKE blocked in this SQL runner | Apply migration 028 via Supabase SQL editor (section 6, step 11) | Security | After application |

---

## 16. Remaining Blockers

1. **No real restore executed** — the only items cleared are static verification facts (baseline
   captured, runbook updated, corrective tooling added). The restore-drill gate remains open.

2. **Storage backup not configured** — DR-001. No off-site backup target exists for the private
   critical buckets listed in `storage-backup-strategy.md`.

3. **PITR and backup plan confirmation** — plan tier, PITR enablement, retention window, and
   earliest/latest recovery points are all UNVERIFIED (Dashboard-only).

4. **Migration 028 unapplied** — least-privilege REVOKE grants not yet live. Blocks tenant
   isolation and security gate.

5. **RPO/RTO unmeasured** — targets are proposed only; no measurements taken.

6. **All runtime checks BLOCKED** — tenant isolation, auth validation, Storage checksums,
   application smoke tests, and rollback exercise all require an isolated recovery project
   and shell access.

---

## 17. Evidence Locations

| Evidence type | Location | Status |
|--------------|----------|--------|
| Live baseline SQL results | This document, section 2 | PRESENT |
| Restore commands | This document, section 6 | PRESENT (not executed) |
| Post-restore verification SQL | `supabase/scripts/recovery-verify.sql` | PRESENT (not executed) |
| Storage migration script | `supabase/scripts/storage-migrate.js` | PRESENT (not executed) |
| Recovery env checklist | `supabase/scripts/recovery-env-checklist.sh` | PRESENT (not executed) |
| Recovery project identity | TBD (not created) | MISSING |
| Restore logs | TBD (not executed) | MISSING |
| Checksum manifest | TBD (no objects exist) | NOT APPLICABLE |
| Tenant-isolation test output | TBD (not executed) | MISSING |
| RPO/RTO measurements | TBD (not executed) | MISSING |
| Application smoke test output | TBD (not executed) | MISSING |
| Approver sign-off | TBD (not executed) | MISSING |

All actual recovery evidence must be stored in a private, access-controlled location.
Do not commit logs containing credentials, JWTs or customer data to the repository.

---

## 18. Recovery Project Cleanup

The recovery project `guardianhub-recovery-20260813` (or whichever name is used) must be
deleted after the drill evidence is collected and approved.

```
Owner: Platform owner / Operations
Required by: 7 days after drill completion
Action: Supabase Dashboard → recovery project → Settings → Danger Zone → Delete project
Confirmation: Record cleanup date and confirming operator in this document
```

---

PHASE 22D RESULT: FAIL — RECOVERY CAPABILITY NOT PROVEN; PRODUCTION DEPLOYMENT PROHIBITED

## Remaining blockers with owner, required evidence and next action

| Blocker | Owner | Evidence Required | Next Action |
|---------|-------|------------------|-------------|
| 1. No restore drill executed | Platform owner / Operations | Recovery project ref, restore exit codes, baseline vs recovery count comparison, RPO/RTO measurements, tenant-isolation test output, application build pass | Run commands in section 6 using Supabase CLI + Dashboard; schedule with a qualified operator |
| 2. Storage backup not configured (DR-001) | Platform owner | Backup service provisioned, export schedule active, sample object checksum test passed | Provision off-site backup target; implement export Edge Function per `storage-backup-strategy.md` |
| 3. PITR / backup plan unconfirmed | Platform owner | Dashboard screenshot showing PITR enabled, retention window, earliest/latest recovery points | Check Dashboard → Database → Backups; confirm plan tier |
| 4. Migration 028 unapplied (DR-006) | Security | SQL confirmation of REVOKE grants live; anon EXECUTE test fails on target functions | Apply `supabase/migrations/028_guardianhub_phase22a_grant_repair.sql` via Supabase SQL editor |
| 5. Duplicate pg_cron job (DR-003) | Engineering | `SELECT * FROM cron.job` showing single `expire-shift-cover-offers` entry | `SELECT cron.unschedule(3);` in Supabase SQL editor |
| 6. pg_cron job 5 secret handling (DR-004) | Engineering | Job 5 reading key from Vault instead of `app.service_role_key` | Migrate to `vault.secrets` |
| 7. All other Phase 21 blockers | Various | See `phase-21-blocked-launch-report.md` | See prior phase reports |