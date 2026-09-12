# Phase 20B Results — Verified Backup, Restore & Disaster-Recovery Drill

## Headline result: BLOCKED

The Phase 20B restore drill could not be executed in this workspace. A real database restore, Storage-object restore and measured RPO/RTO require capabilities that are not available here: Supabase Management API access, the Supabase CLI, a shell, and a dedicated recovery project. No restore was performed, and none is claimed.

This phase therefore does **not** resolve the Phase 19 hard blocker #2 ("no verified backup/restore process"). The blocker remains.

What follows is the verified evidence that *is* reachable, the honest classification of everything else, and the exact manual steps an operator must run to complete the drill.

---

## 1. Backup position inventory (evidence-based)

Source of truth: live connected SaaS Supabase database (read-only queries only). Project reference is redacted; it appears in a pg_cron job definition but is not reproduced here.

| Fact | Value | Classification |
|------|-------|----------------|
| Production project ref | Present (redacted) | VERIFIED present; production vs staging designation NOT CONFIRMED |
| Staging project ref | None | NOT CONFIGURED |
| Recovery-test project ref | None | NOT CONFIGURED |
| Supabase plan | Unknown | UNVERIFIED (Dashboard only). Features present (pg_cron, vault, vector, logical WAL + archiving) are consistent with Pro tier or above, but tier is not confirmed |
| Postgres version | 17.6 | VERIFIED |
| Database size | 103 MB | VERIFIED |
| Storage usage | 12 buckets configured | Bucket inventory VERIFIED; object count UNVERIFIED (query returned 0 rows — either empty or RLS-filtered; cannot distinguish from here) |
| Backup type | Continuous WAL archiving | VERIFIED active (see below) |
| Scheduled snapshots | Unknown | UNVERIFIED (Dashboard only) |
| Available backup dates | Unknown | UNVERIFIED (Dashboard only) |
| Backup retention | Unknown | UNVERIFIED (Dashboard only) |
| PITR enabled/disabled | Unknown | UNVERIFIED (Dashboard only). The WAL archiving mechanism it depends on is VERIFIED active |
| Earliest recovery point | Unknown | UNVERIFIED (Dashboard only) |
| Latest recovery point | Unknown | UNVERIFIED (Dashboard only) |
| Read replicas | None | VERIFIED (pg_stat_replication empty) |
| Replication slots | None | VERIFIED (pg_replication_slots empty) |
| Custom database roles | Standard Supabase roles only | VERIFIED (no application-specific custom roles beyond Supabase-managed roles) |
| Database extensions | 8 | VERIFIED (pg_cron 1.6.4, pg_net 0.20.0, pg_stat_statements 1.11, pgcrypto 1.3, plpgsql 1.0, supabase_vault 0.3.1, uuid-ossp 1.1, vector 0.8.0) |
| Scheduled jobs | 4 pg_cron jobs | VERIFIED (see findings) |
| External integrations | Stripe connected; Resend key present but domain not verified; n8n workflow files present | Stripe/Resend status REPORTED from platform status; n8n runtime UNVERIFIED |

### WAL archiving (the PITR mechanism) — VERIFIED

```
archived_count      = 9936
last_archived_wal   = 00000002000000ED00000042
last_archived_time  = 2026-08-13 19:03:09 UTC
failed_count        = 0
```

Continuous WAL archiving is live and healthy as of the audit time. This is the necessary mechanism for Point-in-Time Recovery and is a genuine, positive signal — but it is not by itself proof that PITR is enabled, nor what the retention window is. Those remain Dashboard facts.

### Scheduled jobs — VERIFIED, with findings

- `jobid 1` — weekly report scheduler (Mon 06:00 UTC).
- `jobid 2` and `jobid 3` — **duplicate** `expire_shift_cover_offers()` (identical command, runs every 5 min). Flagged for cleanup.
- `jobid 5` — lone-worker escalation every 2 min; hardcodes the project URL and reads a service-role key from a custom `app.service_role_key` setting. Redacted here; flagged as a pre-existing secret-handling concern (out of scope for 20B, but noted for review).

### Drift finding

`supabase/config.toml` declares `[db] major_version = 15`, but the live database is **Postgres 17.6**. The local config is stale relative to the live environment. Not a launch blocker by itself, but it means local config should not be treated as the source of truth for the live project.

---

## 2. Recovery objectives — PROPOSED, PENDING APPROVAL

These are proposed targets, not approved commitments. They require platform-owner sign-off before being treated as agreed objectives.

| Objective | Proposed value | Owner (proposed) | Approval | Measurement |
|-----------|----------------|------------------|----------|-------------|
| Database RPO | 5 minutes (PITR) | Platform owner | PENDING | Restore-to-point delta in drill |
| Database RTO | 4 hours | Platform owner | PENDING | Restore-request → DB-available |
| Storage-object RPO | 24 hours | Platform owner | PENDING | Off-site export lag |
| Storage-object RTO | 8 hours | Platform owner | PENDING | Restore-request → object-validated |
| Application recovery time | 6 hours | Platform owner | PENDING | DB-available → smoke-tests green |
| Critical SOS/incident tolerance | Zero-loss on SOS (already persisted-first); ≤ 15 min | Platform owner | PENDING | SOS row present after restore |
| Max acceptable tenant downtime | 8 hours | Platform owner | PENDING | Outage start → service restored |

Business justification: SOS and incident evidence are safety- and compliance-critical and must tolerate the smallest practical data-loss window; routine rota/notification data tolerates a longer window.

Review date: to be set on approval.

---

## 3. Why the drill is blocked (explicit)

The acceptance criteria require a *real* restore into an *isolated recovery project* with *measured timings*. That requires one or more of:

- Supabase Management API access (project create, PITR restore, clone),
- the Supabase CLI (`db dump` / `db restore`),
- a shell environment,
- a dedicated recovery project that is provably not production.

None of these are available in this workspace. The SQL execution tool here is limited to DDL/DML and explicitly blocks destructive operations; it cannot dump, restore, clone, or create projects. Per the phase's own safety rules ("Stop and report BLOCKED if required permissions, plan features or environments are unavailable"), the correct outcome is to report BLOCKED rather than simulate a result.

No action was taken against the production project. No synthetic data was written to it. No backup or restore operation was attempted or claimed.

---

## 4. Recovery test dataset manifest — TEMPLATE (not executed)

Required by section 3. This manifest template is provided so an operator can populate it when running the drill in an isolated staging project. It is not a claim that the dataset exists.

| Table | Record ID | Tenant ID | Expected key value(s) | Expected relationship | Created (UTC) | Validation value |
|-------|-----------|-----------|------------------------|-----------------------|---------------|------------------|
| companies | TBD | — | TBD | — | TBD | — |
| users | TBD | TBD | role=company_admin | company_id | TBD | — |
| users | TBD | TBD | role=guard | company_id | TBD | — |
| clients | TBD | TBD | name | company_id | TBD | — |
| sites | TBD | TBD | name | client_id | TBD | — |
| guards | TBD | TBD | sia status | company_id | TBD | — |
| sia_licences | TBD | TBD | number/expiry | guard_id | TBD | — |
| shifts | TBD | TBD | future + completed | site_id | TBD | — |
| guard_site_assignments | TBD | TBD | guard→site | guard_id, site_id | TBD | — |
| attendance_logs | TBD | TBD | check_in/check_out | shift_id | TBD | — |
| timesheets / finance_work_records | TBD | TBD | status | shift/guard | TBD | — |
| incidents | TBD | TBD | severity | site_id | TBD | — |
| incidents (SOS) | TBD | TBD | is_sos=true | site_id | TBD | — |
| notifications | TBD | TBD | channel/status | incident_id | TBD | — |
| agent_execution_logs | TBD | TBD | agent/status | tenant | TBD | — |
| billing_* (entitlement) | TBD | TBD | plan/status | company_id | TBD | — |
| support_tickets | TBD | TBD | status | company_id | TBD | — |
| admin_activity_log / audit | TBD | TBD | action | tenant | TBD | — |
| storage.objects (private) | TBD | TBD | bucket/path | company_id | TBD | checksum |

Do not record secrets or unnecessary personal data. Use synthetic values only.

---

## 5. External reconciliation order — RECOMMENDED (not tested)

A database restore rewinds external-reference state. The recommended reconciliation sequence after any real restore (to be validated in the drill, using Stripe test mode and read-only comparisons):

1. Freeze writes; confirm the recovery project cannot reach production Stripe/n8n/email (test mode / suppressed).
2. Reconcile Stripe: compare `billing_webhook_events.processed_event_ids` against Stripe events; replay only missing events using the idempotent webhook handler (signature + unique event-id dedup already in place).
3. Reconcile n8n: confirm `agent_webhook_events` + `agent_replay_nonces` prevent replay of already-processed events.
4. Reconcile notifications: `notification_deliveries` dedup prevents duplicate sends on replay.
5. Reconcile scheduled jobs: confirm pg_cron jobs are present and that no re-entrant job double-fires (note the existing duplicate `expire_shift_cover_offers`).
6. Verify SOS events are never altered/closed by reconciliation (SOS is persisted-first; no AI can close/downgrade it — already enforced).

This order is a plan. It has not been executed against a restored database.

---

## 6. Exact manual steps required to complete the drill

To be run by an operator with Supabase Dashboard + CLI access. None of these were executed here and none are verified against an installed CLI version.

1. Confirm the plan tier supports PITR (Pro or higher) in Dashboard → Billing.
2. Dashboard → Database → Backups: confirm daily snapshots are enabled and PITR is on; record retention window and earliest/latest recovery points.
3. Create a dedicated recovery project (or staging) — never the production project. Set a visible `RECOVERY TEST` label and confirm it cannot send real customer notifications, is in Stripe test mode, and has n8n/email/SMS suppressed.
4. Populate the recovery dataset in the recovery project using the manifest in section 4.
5. Capture the exact recovery point (UTC).
6. Perform the database restore (Dashboard → Backups → Restore, or `supabase db restore`); record requested/started/available timestamps.
7. Validate against the manifest (pre-recovery present, post-recovery absent, FKs/constraints/indexes/triggers/functions/RLS intact).
8. Run tenant-isolation and Phase 20A RPC security tests (`supabase/tests/phase-20a-rpc-security-tests.sql`) against the restored database.
9. Test authentication per role; identify any custom-role passwords/secrets that must be reset after restore.
10. Prove the Storage metadata-vs-object gap; restore one synthetic critical object from the off-site archive (section below) and validate checksum + signed access.
11. Run external reconciliation in test mode.
12. Store all evidence in a private, access-controlled bucket; obtain two-person approval.

---

## 7. Acceptance criteria vs actual

| Criterion | Status |
|-----------|--------|
| Backup source + recovery point verified | NOT DONE (UNVERIFIED) |
| Real database restore in isolated env | BLOCKED |
| Actual restore duration recorded | NOT DONE |
| Pre/post recovery data behaviour validated | NOT DONE |
| Relationships/constraints valid after restore | NOT DONE |
| RLS + tenant isolation intact after restore | NOT DONE |
| Phase 20A RPC repair still active after restore | NOT DONE |
| Auth works with documented recovery reqs | NOT DONE |
| Core records readable + writable after restore | NOT DONE |
| Storage metadata-vs-object gap demonstrated | NOT DONE |
| Critical synthetic Storage object restored + validated | BLOCKED |
| DB and Storage recovery documented separately | DB: plan only; Storage: strategy written (see `storage-backup-strategy.md`) |
| External reconciliation tested | NOT DONE (order documented) |
| Actual RPO/RTO measured | NOT DONE |
| Evidence stored privately | NOT DONE (no evidence produced) |
| Recovery owner review + approval | NOT DONE |
| No production/customer data endangered | VERIFIED (no action taken) |

---

## 8. Evidence record — TEMPLATE (to be filled at drill time)

```
Drill ID:                TBD
Date:                    TBD
Environment:             TBD (recovery project, not production)
Participants:            TBD
Backup identifier:       TBD
Recovery point (UTC):    TBD
Database result:         TBD
Storage result:          TBD
RLS result:              TBD
Auth result:             TBD
Core workflow result:    TBD
Reconciliation result:   TBD
Actual RPO:              TBD
Actual DB RTO:           TBD
Actual app RTO:          TBD
Actual Storage RTO:      TBD
Failures:                TBD
Corrective actions:      TBD
Evidence refs:           TBD
Approver (separate role):TBD
Final result:            TBD
```

---

## 9. Findings and remaining configuration

**Not launch blockers for 20B scope, but flagged:**
- Duplicate `expire_shift_cover_offers` pg_cron jobs (jobs 2 and 3).
- A pg_cron job hardcodes the project URL and reads a service-role key from a custom `app.service_role_key` setting — recommend moving to Supabase Vault secrets.
- `supabase/config.toml` Postgres major version is stale (15 vs live 17.6).

**Remaining manual/provider configuration to actually pass 20B:**
- Confirm plan tier + enable PITR + scheduled backups (Dashboard).
- Provision an isolated recovery project.
- Configure an approved off-site object backup for critical Storage buckets (see `storage-backup-strategy.md`).
- Run the full drill per section 6.

---

## 10. Hard blocker #2 status

**NOT RESOLVED.** No real restore has been executed; the process remains documented-but-unverified. This phase reports BLOCKED and does not change the overall launch verdict.