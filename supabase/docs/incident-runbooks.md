# Incident Runbooks — GuardianHub Operational Readiness

Purpose: concise, executable runbooks for the operational scenarios not covered by
`failure-and-fallback-runbook.md` (SOS/lone-worker/patrol/book-on/offline/realtime) or
`disaster-recovery-runbook.md` (backup/restore CLI). These have **not been executed** — a written
runbook is not proof of execution. Commands contain no embedded secrets; substitute connection
strings/secrets from the protected store. Escalation contacts are by role (see the contact register),
not personal details.

Escalation roles: Primary/Secondary on-call, Security, Database/Supabase, Billing/Stripe, Customer
comms, Business authority.

---

## RB-01 Application outage

- **Trigger:** homepage/`/login` unresponsive or 5xx rate above critical threshold.
- **Containment:** confirm scope (single region? DNS? CDN?); do NOT redeploy blindly.
- **Diagnostics:** `GET /health-check`; CDN/hosting status page; check DNS resolution and TLS cert.
- **Recovery:** redeploy last-known-good build; scale/replace instances; fail over to staging only as
  read-only last resort (never for writes).
- **Rollback:** revert to previous build SHA via CI/CD; keep previous artifact.
- **Escalate:** Secondary on-call → Business authority if >30 min.
- **Evidence:** uptime logs, error traces, redeploy timestamps.
- **Customer comms:** status page update if >15 min; draft only if SEV-1.
- **Success:** `/login` returns 200, p95 back within threshold.
- **Closure:** incident timeline complete, PIR if SEV-1.

## RB-02 Failed deployment

- **Trigger:** build/CI red, smoke tests fail after deploy, or runtime errors spike post-release.
- **Containment:** freeze further deploys; stop promotion.
- **Diagnostics:** CI logs, `npm run verify` output, diff against previous SHA.
- **Recovery:** identify failing step (typecheck/lint/test/build); fix or revert.
- **Rollback:** deploy previous healthy SHA (rollback target in `deployment_records`).
- **Escalate:** Engineering lead.
- **Evidence:** CI logs, commit diffs, rollback record.
- **Customer comms:** none unless user-visible regression.
- **Success:** previous version live, smoke tests green.
- **Closure:** root cause recorded; defect logged.

## RB-03 Database outage

- **Trigger:** connection failures, `health-check` DB path failing, query timeouts.
- **Containment:** stop writes from app if safe; do not run destructive commands.
- **Diagnostics:** Supabase status page, connection pool exhaustion, slow-query log, `pg_stat_activity`.
- **Recovery:** restart idle connections, kill long-running locks (read-only), wait for platform
  recovery if provider-side.
- **Rollback:** restore from most recent backup only if data corruption confirmed (see RB-14).
- **Escalate:** Database/Supabase escalation.
- **Evidence:** connection metrics, query plans, platform incident ID.
- **Customer comms:** status page if >15 min.
- **Success:** read/write queries succeed, connection count normal.
- **Closure:** record root cause; review query/index if slow.

## RB-04 Auth outage

- **Trigger:** login success rate below threshold, mass logout, `Auth` errors.
- **Containment:** confirm whether isolated (single user) or systemic.
- **Diagnostics:** Supabase Auth status, redirect URL config, JWT secret health, rate-limit hit.
- **Recovery:** verify redirect URLs, clear accidental rate limit, re-establish provider.
- **Rollback:** revert any recent Auth/middleware change.
- **Escalate:** Security if credentials/JWT suspicious; Database escalation for schema.
- **Evidence:** auth failure logs (no passwords/tokens), config snapshot.
- **Customer comms:** if prolonged, inform users login is degraded.
- **Success:** login success rate back within threshold.
- **Closure:** record cause; check session-recovery strategy (forced reauth if secrets rotated).

## RB-05 Storage outage

- **Trigger:** object upload/download failures, signed-URL errors, bucket access denied.
- **Containment:** confirm bucket policy vs provider outage; do not change bucket privacy casually.
- **Diagnostics:** bucket privacy, RLS policies, size/MIME limits, signed-URL expiry.
- **Recovery:** correct policy/limit; restore bucket setting if drift detected.
- **Rollback:** revert any recent storage policy change.
- **Escalate:** Security (unexpected public exposure), Database escalation.
- **Evidence:** storage error logs, policy snapshot, checksum if files involved.
- **Customer comms:** if evidence/media inaccessible during an active incident.
- **Success:** sample upload/download + signed URL works; unauthorized denied.
- **Closure:** confirm public/private settings correct on all 12 buckets.

## RB-06 Cross-tenant exposure (SEV-1)

- **Trigger:** tenant sentinel alert, suspicious RPC, or report of data from another tenant.
- **Containment:** **freeze deployments immediately**; disable affected function/endpoint; preserve
  evidence (queries, logs, affected rows).
- **Diagnostics:** RLS policy state, `relforcerowsecurity`, grant drift, recent migration, audit log.
- **Recovery:** re-apply RLS/grant fix (e.g. migration 028); verify with two authenticated tenants.
- **Rollback:** revert the offending migration/function change.
- **Escalate:** Security + Business authority immediately; consider regulatory notification.
- **Evidence:** full audit trail, policy diff, affected-row sample (redacted).
- **Customer comms:** mandatory; assess breach notification obligations.
- **Success:** cross-tenant read/write denied at runtime for both tenants and anon.
- **Closure:** mandatory PIR; defect + corrective action recorded.

## RB-07 Leaked secret (SEV-1)

- **Trigger:** secret-scan hit, report of credential in logs/repo/client bundle.
- **Containment:** rotate the secret immediately; revoke affected token/key; disable compromised
  credential.
- **Diagnostics:** locate exposure point (repo, bundle, log); confirm no active abuse.
- **Recovery:** rotate all affected credentials; update config/secrets store; redeploy.
- **Rollback:** n/a (rotation is forward); revoke old value.
- **Escalate:** Security + Business authority; Database escalation for DB credentials.
- **Evidence:** exposure location, rotation timestamps, access review.
- **Customer comms:** if customer data at risk, follow breach procedure.
- **Success:** old secret invalid, new secret live, no residual exposure.
- **Closure:** PIR; add/adjust gitleaks allowlist + redaction rules.

## RB-08 Stripe webhook outage

- **Trigger:** `billing_webhook_events` age exceeds threshold, webhook 4xx/5xx, invalid-signature spike.
- **Containment:** confirm endpoint reachable; do NOT replay events before dedup check.
- **Diagnostics:** signing secret config, event `type`/id, `stripe_event_id` unique dedup, Stripe
  dashboard webhook status.
- **Recovery:** fix secret/config; use Stripe "resend" for missed events (idempotent).
- **Rollback:** revert any webhook-handler change.
- **Escalate:** Billing/Stripe escalation; Finance for customer impact.
- **Evidence:** webhook logs (redact PII), event IDs, dedup state.
- **Customer comms:** if subscriptions affected.
- **Success:** events processed, no duplicates, entitlement state correct.
- **Closure:** confirm out-of-order final-state handling (Phase 22C UNVERIFIED).

## RB-09 Incorrect subscription entitlement

- **Trigger:** entitlement mismatch alert, user locked out or over-provisioned.
- **Containment:** do not manually edit `plans`/subscription rows directly; identify affected tenants.
- **Diagnostics:** reconcile `billing_subscription_events` vs entitlement, check webhook processing.
- **Recovery:** run reconciliation; fix via webhook replay or approved manual correction.
- **Rollback:** revert any entitlement/plan change.
- **Escalate:** Billing/Stripe escalation; Customer comms for affected users.
- **Evidence:** reconciliation output, affected tenants (redacted), correction record.
- **Customer comms:** notify affected customers of restoration.
- **Success:** entitlement matches subscription for affected tenants.
- **Closure:** record reconciliation defect; monitor for recurrence.

## RB-10 Failed n8n critical agent

- **Trigger:** `agent_execution_logs` shows failed critical agent, DLQ backlog, or `agent_health_checks`
  degraded.
- **Containment:** confirm agent disabled/errored; do NOT let SOS/notification silently drop.
- **Diagnostics:** n8n execution history, handler logic (stub risk), credential status
  (`agent_credentials_status`), dead-letter queue.
- **Recovery:** repair workflow/handler, restore credential, re-trigger; process DLQ.
- **Rollback:** revert workflow to last-known-good export.
- **Escalate:** Operations; Security if callback/signing involved.
- **Evidence:** execution logs, DLQ contents (redacted), workflow diff.
- **Customer comms:** if a critical notification (e.g. SOS) was affected, manual escalation.
- **Success:** critical agent runs, callback verified, no unprocessed backlog.
- **Closure:** confirm handler is real logic (not stub) — Phase 22B blocker.

## RB-11 Email/SMS provider outage

- **Trigger:** `send-notification-email`/SMS failures, provider status page degraded.
- **Containment:** do NOT disable SOS; ensure incident still persists and is visible for manual
  escalation.
- **Diagnostics:** provider status, credential validity, from-domain verification (Resend domain
  unverified), rate limits.
- **Recovery:** fall back to in-app notifications (command centre/guard panel); re-send after recovery.
- **Rollback:** n/a (provider-side); switch to backup provider if configured.
- **Escalate:** Operations; Security if delivery data exposed.
- **Evidence:** send logs (no message bodies/PII), provider incident ID.
- **Customer comms:** if notifications materially delayed.
- **Success:** delivery success rate restored; no lost SOS visibility.
- **Closure:** verify Resend domain + `RESEND_FROM_DOMAIN` configured.

## RB-12 SOS processing failure

- **Trigger:** SOS sent but no incident/OB entry, `sos-emergency-notify` error, persist-before-notify
  broken.
- **Containment:** verify incident persisted; if not, create manually; **do not delete SOS events**.
- **Diagnostics:** edge function logs, incident/OB tables, notification delivery.
- **Recovery:** ensure incident + OB exist; re-run notification; confirm command-centre visibility.
- **Rollback:** revert any SOS handler change.
- **Escalate:** Security + Operations; Business authority for unresolved SOS.
- **Evidence:** SOS timeline, incident ID, notification delivery state.
- **Customer comms:** immediate for real emergencies; manual escalation path.
- **Success:** incident visible, notifications delivered, guard confirmed.
- **Closure:** verify zero-loss ordering at runtime (Phase 22C UNVERIFIED).

## RB-13 Backup failure

- **Trigger:** backup freshness threshold exceeded, backup job error, WAL archiving failure.
- **Containment:** do NOT proceed with schema/migration changes until backups recover.
- **Diagnostics:** backup schedule, PITR status, WAL archiver (`pg_stat_archiver`), retention.
- **Recovery:** re-enable/repair backup; confirm next successful snapshot; fix Storage export
  (DR-001 — currently no off-site Storage backup).
- **Rollback:** n/a; restore point is now last-known-good.
- **Escalate:** Database/Supabase escalation; Platform owner.
- **Evidence:** backup job logs, freshness timestamps, WAL stats.
- **Customer comms:** none unless data-at-risk disclosure required.
- **Success:** next backup completes; freshness within threshold; Storage export configured.
- **Closure:** close DR-001 (Storage backup) — currently open High.

## RB-14 Restore invocation

- **Trigger:** approved decision to restore (data corruption, destructive incident).
- **Containment:** freeze writes; confirm restore point; do NOT restore over production.
- **Diagnostics:** confirm target recovery point, RPO/RTO targets, migration head.
- **Recovery:** follow `disaster-recovery-runbook.md` sections — logical dump/restore or PITR into an
  isolated recovery project first, verify, then promote.
- **Rollback:** the restore itself; keep pre-restore backup.
- **Escalate:** Database/Supabase escalation; Business authority to approve.
- **Evidence:** restore logs, reconciliation counts, RPO/RTO measurements, checksums.
- **Customer comms:** mandatory if data loss customer-visible.
- **Success:** data reconciled, tenant isolation verified, app builds, Storage checksums match.
- **Closure:** record measured RPO/RTO; Phase 22D drill remains unexecuted.

## RB-15 DNS/TLS failure

- **Trigger:** domain unreachable, cert expiry warning, TLS handshake failures.
- **Containment:** confirm scope (DNS propagation, registrar, CDN, cert).
- **Diagnostics:** DNS resolution (`dig`), cert validity/chain, CDN config, registrar status.
- **Recovery:** renew cert, fix DNS record, repoint correctly; do NOT point domain at recovery project.
- **Rollback:** revert any recent DNS/CDN change.
- **Escalate:** Operations; Business authority if prolonged.
- **Evidence:** DNS/TLS check output, change history, cert dates.
- **Customer comms:** status page if >15 min.
- **Success:** domain resolves, cert valid, no TLS errors.
- **Closure:** schedule cert auto-renewal + expiry alerting (currently none).

---

## Common escalation note

All runbooks escalate to **roles**, not named individuals; private contact details live only in the
protected contact register. No runbook has been executed or exercised in a drill.