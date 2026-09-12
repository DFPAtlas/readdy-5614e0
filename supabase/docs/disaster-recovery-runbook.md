# Disaster Recovery Runbook — GuardianHub Phase 14

> **Phase 22D update (2026-08-13):** Restore drill attempted. Blocked — no shell, no
> Management API, no second Supabase project available in this environment. Source baseline
> captured. Verified CLI commands from official Supabase documentation are now recorded below
> and in `supabase/docs/phase-22d-recovery-drill.md`. Recovery tooling added:
> - `supabase/scripts/recovery-verify.sql` — post-restore reconciliation
> - `supabase/scripts/storage-migrate.js` — Storage object migration
> - `supabase/scripts/recovery-env-checklist.sh` — safety pre-flight
>
> New High defects: DR-001 (no off-site Storage backup), DR-006 (migration 028 unapplied).
> Medium defects: DR-003 (duplicate cron job), DR-004 (pg_cron secret handling), DR-005
> (config.toml version stale). **Restore gate still BLOCKED — production deployment prohibited.**

> **Verification status: UNVERIFIED.** The restore steps in this runbook have not been executed against a real restore drill. See `supabase/docs/phase-20b-results.md`. Do not treat the recovery procedures below as tested until the Phase 20B drill is completed and recorded.

Each scenario lists: detection, severity, owner, containment, restoration, validation, communication, escalation, and post-incident review. Degraded behaviour is designed so failures do not corrupt data or falsely succeed.

## Safe degraded behaviour (applies everywhere)

- Unavailable map/geocoding must not erase assignment data — degrade to manual/no-GPS capture and mark for review.
- Failed notifications enter the retry queue (`notification_jobs`) and never silently drop.
- A Stripe outage must not silently cancel valid access — billing state is separate from operational state; grace periods apply.
- An n8n outage must not lose the underlying event — `agent_webhook_events` retains the event for replay.
- An SOS event must still be stored when optional providers fail — the incident/OB record is written first; notifications are secondary.
- Guard check-in must show a clear retryable failure instead of false success.

## Scenarios

### 1. Supabase outage
- Detection: health-check `database`/`auth` = unavailable; elevated `ops_error_events`.
- Severity: P1. Owner: Platform Ops.
- Containment: Stop writes from clients, show outage banner (served from CDN, not the failed service).
- Restoration: Follow Supabase status; restore via PITR if corruption.
- Validation: health-check ready = healthy; tenant isolation intact.
- Escalation: Supabase support + internal status page.

### 2. Database corruption
- Detection: constraint errors, failed integrity checks.
- Severity: P1. Owner: Platform Security + Ops.
- Containment: Freeze writes, snapshot before repair.
- Restoration: PITR restore or runbook-guided repair; dry-run reconciliation first.
- Validation: run `data-integrity-checks.sql`; confirm RLS intact.

### 3. Authentication outage
- Detection: health-check `auth` = unavailable; login failures spike.
- Severity: P1. Owner: Platform Ops.
- Containment: Do not disable existing sessions; alert support.
- Restoration: Supabase Auth recovery.
- Validation: successful sign-in + MFA.

### 4. Storage outage
- Detection: health-check `storage` = unavailable; upload failures.
- Severity: P2. Owner: Platform Ops.
- Containment: Queue uploads; evidence capture degrades to local retry.
- Restoration: Supabase Storage recovery.
- Validation: upload/download round-trip.

### 5. Stripe outage
- Detection: webhook failures in `billing_webhook_events`; checkout errors.
- Severity: P2. Owner: Finance.
- Containment: Do not cancel access; keep billing state unchanged; backfill webhooks later.
- Restoration: Stripe recovers; replay missed webhooks (idempotent).

### 6. n8n outage
- Detection: `agent_execution_logs` failures; dead-letter growth.
- Severity: P2. Owner: Platform Ops.
- Containment: Events remain in `agent_webhook_events`.
- Restoration: n8n recovers; queue-processor replays.
- Validation: replay does not duplicate events (dedup index).

### 7. Email/SMS outage
- Detection: `notification_jobs` failed count rises.
- Severity: P2. Owner: Platform Ops.
- Containment: Notifications retry; in-app notifications unaffected.
- Restoration: provider recovers; retry queue drains.

### 8. Maps outage
- Detection: geocoding errors; check-in `gps_unavailable` spike.
- Severity: P3. Owner: Platform Ops.
- Containment: degrade to no-GPS/manual, flag for review — never lose assignment data.
- Restoration: provider recovers.

### 9. Notification outage
- Detection: delivery failures across channels.
- Severity: P2. Owner: Platform Ops.
- Containment: retry queue + in-app fallback.
- Restoration: provider recovers; replay.

### 10. Failed deployment
- Detection: CI red, smoke-test failure.
- Severity: P1/P2. Owner: Engineering lead.
- Containment: rollback to last good `deployment_records.rollback_to`.
- Restoration: fix and redeploy.
- Validation: smoke tests green.

### 11. Suspected data breach
- Detection: `platform_security_events`, audit anomalies.
- Severity: P1. Owner: Platform Security.
- Containment: revoke sessions/keys, isolate, preserve evidence, engage counsel.
- Restoration: root-cause, patch, rotate secrets.
- Escalation: legal + affected tenants (as required).

### 12. Compromised secret
- Detection: secret scan, provider alerts.
- Severity: P1. Owner: Platform Security.
- Containment: rotate immediately (Supabase Dashboard secrets), revoke sessions.
- Restoration: verify no residual use, update code references.
- Validation: health-check providers = healthy with new secret.

### 13. Cross-tenant access incident
- Detection: audit log anomaly, tenant report, security event.
- Severity: P1. Owner: Platform Security.
- Containment: terminate support access, revoke sessions, preserve audit trail, notify.
- Restoration: fix RLS/policy gap, add regression test.
- Validation: cross-tenant security tests pass.

## Communication template

> Severity, summary, current impact, user-facing behaviour, workaround, next update time, owner.

## Escalation path

Platform Ops → Platform Security / Engineering lead → Platform Owner → external provider support.

## Post-incident review

Record timeline, root cause, impact, actions, and follow-ups in the `ops_incidents` table (`post_incident_review` field).

## Verified Restore Commands (Phase 22D — sourced from Supabase official docs)

These commands are sourced from:
https://supabase.com/docs/guides/platform/migrating-within-supabase/backup-restore

Never include credentials in logs. Use environment variables only.
`$SOURCE_DB_URL` = Session pooler connection string for the source project.
`$RECOVERY_DB_URL` = Session pooler connection string for the isolated recovery project.

### Backup (run against source)

```bash
# Roles
supabase db dump --db-url "$SOURCE_DB_URL" -f roles.sql --role-only

# Schema
supabase db dump --db-url "$SOURCE_DB_URL" -f schema.sql

# Data (exclude storage vector indexes)
supabase db dump --db-url "$SOURCE_DB_URL" -f data.sql \
  --use-copy --data-only \
  -x "storage.buckets_vectors" \
  -x "storage.vector_indexes"

# Migration history
supabase db dump --db-url "$SOURCE_DB_URL" -f history_schema.sql \
  --schema supabase_migrations
supabase db dump --db-url "$SOURCE_DB_URL" -f history_data.sql \
  --use-copy --data-only --schema supabase_migrations
```

### Restore (run against recovery project)

```bash
# Roles (see known errors below)
psql --single-transaction --variable ON_ERROR_STOP=1 \
  --file roles.sql --dbname "$RECOVERY_DB_URL"

# Schema + data (session_replication_role=replica disables triggers during import)
psql --single-transaction --variable ON_ERROR_STOP=1 \
  --file schema.sql \
  --command 'SET session_replication_role = replica' \
  --file data.sql \
  --dbname "$RECOVERY_DB_URL"

# Migration history
psql --single-transaction --variable ON_ERROR_STOP=1 \
  --file history_schema.sql \
  --file history_data.sql \
  --dbname "$RECOVERY_DB_URL"
```

### Known harmless errors during restore

| Error | Cause | Resolution |
|-------|-------|------------|
| `permission denied to grant role "postgres"` | `cli_login_postgres` grant | Comment out `GRANT "postgres" TO "cli_login_postgres" ... GRANTED BY "supabase_admin"` in roles.sql |
| `ALTER ... OWNER TO "supabase_admin"` | Supabase-managed ownership | Comment out affected lines in schema.sql |
| `"cli_login_postgres" is a member of role "postgres"` | Cloned role conflict | `DROP ROLE IF EXISTS cli_login_postgres;` then retry |

### Edge Functions

```bash
supabase login
supabase functions deploy --project-ref RECOVERY_PROJECT_REF
# Deploys all functions from supabase/functions/ to recovery project
# Set secrets to safe test values only — never production secrets
```

### Storage objects

```bash
node supabase/scripts/storage-migrate.js
# Requires environment variables — see script header for usage
```

### Post-restore verification

```bash
psql --dbname "$RECOVERY_DB_URL" --file supabase/scripts/recovery-verify.sql
bash supabase/scripts/recovery-env-checklist.sh
```