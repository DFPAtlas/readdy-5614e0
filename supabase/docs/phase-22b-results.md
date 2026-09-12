# GuardianHub — Phase 22B Results: n8n Agent Import, Configuration & Signed Staging E2E

Date: 2026-08-13
Result: FAIL — the critical-agent blocker remains. No workflows were imported, no executions ran,
and no staging credentials exist. This phase was not achievable from the current environment.

---

## 0. Verdict (up front)

This phase could not clear the critical-agent blocker because three things are all missing and none
can be produced from here:

1. **No n8n target is reachable.** There is no shell, no n8n API access, and no staging n8n base URL
   available to this environment. Import and execution are impossible to perform or verify.
2. **No staging credential is configured.** The live `agent_credentials_status` table has 31 rows and
   every single one is `not_configured` — including the `n8n` provider for every agent.
3. **The workflow handlers are non-functional stubs.** Every agent's "Agent Handler" node only builds a
   generic "succeeded" callback. It contains no business logic (SOS escalation, check-in detection,
   notification retry, Stripe reconciliation, or health checks). Importing them successfully would not
   prove the agent does anything.

A genuine defect was found and repaired (a syntax error in every Code node), but that alone cannot make
an agent READY. Nothing here touches production.

---

## 1. n8n environment discovery

| Item | Result |
|---|---|
| n8n version | UNVERIFIED — no instance access |
| Self-hosted / cloud | UNVERIFIED |
| Staging base URL | UNVERIFIED — intentionally not exposed |
| Queue / execution mode | UNVERIFIED |
| Timezone | UNVERIFIED |
| Encryption-key status | UNVERIFIED |
| Database type / worker count | UNVERIFIED |
| Webhook URL | UNVERIFIED |
| Execution retention | UNVERIFIED |
| Credential types | UNVERIFIED (see §3 for live GuardianHub-side status) |

No target instance is available, so all discovery fields remain UNVERIFIED. A written workflow file is
not an imported, running workflow.

---

## 2. Workflow inventory

The files live under `supabase/n8n-workflows/guardianhub/` (note: **not** `n8n/workflows/guardianhub/`
as the phase text assumed).

15 agent workflows + 6 shared workflows = 21 files, all present and all valid JSON. Mapping to the
15 required agents:

| # | Required agent | File | Present |
|---|---|---|---|
| 1 | Shift reminder | agent-shift-reminder.json | yes |
| 2 | Late/missed check-in | agent-late-checkin.json | yes |
| 3 | SOS escalation | agent-sos-escalation.json | yes |
| 4 | Incident notification | agent-incident-notification.json | yes |
| 5 | Compliance expiry | agent-licence-expiry.json | yes |
| 6 | Training renewal | agent-training-renewal.json | yes |
| 7 | Timesheet reminder | agent-timesheet-reminder.json | yes |
| 8 | Invoice reminder | agent-invoice-reminder.json | yes |
| 9 | Subscription reconciliation | agent-subscription-reconciliation.json | yes |
| 10 | Notification retry | agent-notification-retry.json | yes |
| 11 | Failed-event recovery | agent-failed-event-recovery.json | yes |
| 12 | Daily operations summary | agent-daily-summary.json | yes |
| 13 | Data retention | agent-data-retention.json | yes |
| 14 | Data integrity | agent-integrity-reconciliation.json | yes |
| 15 | Platform health | agent-health-monitoring.json | yes |

Shared workflows present: shared-signed-event-intake, shared-signed-callback, shared-error-handler,
shared-dead-letter-handler, shared-health-check, shared-human-approval-resume.

For every file verified: valid JSON, n8n node types (webhook / code / httpRequest / stickyNote /
errorTrigger), no embedded credential values (all use `$env.*`), no production URLs (all use
`$env.GUARDIANHUB_CALLBACK_URL`), and a version string in the workflow name. None carry an explicit
`"active"` field, so they must be imported inactive by the operator.

Imported: **0**. Import cannot be performed here.

---

## 3. Credential matrix (live, non-secret)

`agent_credentials_status` has 31 rows; every row is `not_configured`. Representative (all 15 agents
have the same state for their declared providers):

| Agent | Providers | Status |
|---|---|---|
| sos-escalation | n8n, email, sms | all not_configured |
| late-checkin | n8n, email, sms | all not_configured |
| notification-retry | n8n, email, sms | all not_configured |
| failed-event-recovery | n8n | not_configured |
| subscription-reconciliation | n8n, stripe | all not_configured |
| health-monitoring | n8n | not_configured |
| remaining 9 agents | n8n (+ email/sms where declared) | all not_configured |

No n8n signing secret, callback signing secret, Supabase server credential, Stripe test credential,
email/SMS/push/maps/AI credential is configured for any agent. Credential readiness: **FAIL**.

---

## 4. Defect found and repaired

**Syntax error in every Code node.** Every "Verify HMAC Signature" and "Agent Handler" Code node
contained invalid JavaScript of the form `const x = $json.body || ;` (a binary `||` with no right
operand). This was present in 15 agent workflows and 5 shared workflows (36 occurrences total, in the
verify node and the handler node of each agent). The error-handler workflow had the same defect for
`$json.error` and `$json.lastNodeData`.

Repair: changed each to a valid fallback (`|| ''`). All replacements returned `syntax check passed`.

Fixed files (20): agent-daily-summary, agent-data-retention, agent-failed-event-recovery,
agent-health-monitoring, agent-incident-notification, agent-integrity-reconciliation,
agent-invoice-reminder, agent-late-checkin, agent-licence-expiry, agent-notification-retry,
agent-shift-reminder, agent-sos-escalation, agent-subscription-reconciliation,
agent-timesheet-reminder, agent-training-renewal, shared-signed-event-intake,
shared-dead-letter-handler, shared-health-check, shared-human-approval-resume, shared-error-handler.

Note: `shared-signed-callback.json` was already free of this defect (it reads `$input.first().json`).

This fix removes a hard syntax blocker, but it does **not** make any agent functional or READY (§5).

---

## 5. Defects found but NOT repaired (require an n8n instance / real implementation)

1. **Handlers are stubs.** Every agent's handler only builds a success callback with a generic message
   (e.g. "SOS alerts dispatched and acknowledgement timer started"). No SOS persistence, escalation
   timer, check-in detection, backoff, Stripe call, or health check is implemented in the workflow.
2. **Health check is an explicit scaffold.** `shared-health-check.json` returns `status: "degraded"`
   with message "Health check scaffold — wire provider checks before production". It performs no checks.
3. **Signature-verification misalignment (unverified).** The intake node verifies `$json.body` and
   `$json.headers`, but an n8n webhook node exposes the request body as `$json` (not `$json.body`).
   The gateway signs the full raw body. The exact runtime behaviour cannot be confirmed here, and even
   after the syntax fix the verify path is likely to reject legitimate requests. UNVERIFIED.
4. **Callback signature check is conditional.** In `n8n-callback`, signature verification is wrapped in
   `if (SIGNING_SECRET)`. If the secret env var is missing, unsigned callbacks are accepted.
5. **Callback lacks cross-checks.** `n8n-callback` does not prevent a status regression from completed
   back to processing, does not verify the callback's `agent_key` matches the existing run's agent, and
   does not verify the callback's `company_id` matches the existing run's tenant. One agent could
   complete another agent's execution, and a tenant-mismatched callback is not rejected.
6. **Idempotency is non-atomic.** `agent_execution_logs` has only a primary key on `id`; there is no
   unique constraint on `(agent_key, idempotency_key)`. The gateway performs a pre-execution lookup
   then insert, which is racy under concurrency and is explicitly insufficient per the phase rules.

These are static-review findings; none have been executed or tested.

---

## 6. Secure event / callback gateway review (static)

`supabase/functions/n8n-gateway/index.ts` (outbound GuardianHub → n8n):

- Present: auth required, active-account check, agent lookup, environment gate, disabled-agent gate,
  cross-tenant `company_id` denial, approval gate, outbound HMAC signing, constant-size payload cap,
  bounded retries with backoff, dead-letter persistence, audit logging, sensitive-key redaction.
- Gap: idempotency is non-atomic (§5.6). `is_platform_staff` is called without forwarding the user id
  (relies on the RPC's implicit auth context).

`supabase/functions/n8n-callback/index.ts` (n8n → GuardianHub):

- Present: HMAC verify (via `crypto.subtle.verify`, constant-time), timestamp tolerance, nonce
  uniqueness via `agent_replay_nonces` (primary key on `nonce` = atomic), run lookup, audit logging.
- Gaps: conditional signature check, no status-regression guard, no agent cross-check, no tenant
  cross-check (§5.4–5.5).

None of this has been exercised against a live n8n instance, so signature/replay/tenant results are
UNVERIFIED at runtime.

---

## 7. Live database evidence

| Table | Observed | Meaning |
|---|---|---|
| agent_registry | all 15 required agents present | definitions exist |
| agent_registry.owner_id | null for all 15 | no named owner |
| agent_registry.last_status | null for all 15 | no execution evidence |
| agent_registry.is_active | false for all 6 critical agents | inactive (never activated/tested) |
| agent_credentials_status | 31 rows, all not_configured | no credentials |
| agent_execution_logs | 83 rows | all from legacy agents only |
| agent_execution_logs (legacy) | client_dashboard 11, command_centre 11, compliance 35, guard_welfare 23, super_admin_audit 3 | none are required agents |
| agent_dead_letters | 0 | no dead-letter activity |
| agent_health_checks | 0 | no health checks run |
| agent_schedules | 0 | no schedules |
| agent_replay_nonces | 0 | no callbacks processed |

Critical-agent execution IDs: **none**. No signed staging E2E has occurred.

---

## 8. Agent readiness classification

None can be READY (no import, no execution, no credentials, no owner, and handlers are stubs).
All 15 are **UNVERIFIED**.

| Agent | File | Definition | Imported | Credentials | Execution | Owner | Class |
|---|---|---|---|---|---|---|---|
| shift-reminder | yes | yes | unverified | not_configured | none | none | UNVERIFIED |
| late-checkin | yes | yes | unverified | not_configured | none | none | UNVERIFIED |
| sos-escalation | yes | yes | unverified | not_configured | none | none | UNVERIFIED |
| incident-notification | yes | yes | unverified | not_configured | none | none | UNVERIFIED |
| licence-expiry | yes | yes | unverified | not_configured | none | none | UNVERIFIED |
| training-renewal | yes | yes | unverified | not_configured | none | none | UNVERIFIED |
| timesheet-reminder | yes | yes | unverified | not_configured | none | none | UNVERIFIED |
| invoice-reminder | yes | yes | unverified | not_configured | none | none | UNVERIFIED |
| subscription-reconciliation | yes | yes | unverified | not_configured | none | none | UNVERIFIED |
| notification-retry | yes | yes | unverified | not_configured | none | none | UNVERIFIED |
| failed-event-recovery | yes | yes | unverified | not_configured | none | none | UNVERIFIED |
| daily-summary | yes | yes | unverified | not_configured | none | none | UNVERIFIED |
| data-retention | yes | yes | unverified | not_configured | none | none | UNVERIFIED |
| integrity-reconciliation | yes | yes | unverified | not_configured | none | none | UNVERIFIED |
| health-monitoring | yes | yes | unverified | not_configured | none | none | UNVERIFIED |

The six critical agents (sos-escalation, late-checkin, notification-retry, failed-event-recovery,
subscription-reconciliation, health-monitoring) all remain uncleared.

---

## 9. Acceptance criteria vs result

| Criterion | Result |
|---|---|
| All shared workflows import successfully | UNVERIFIED (not imported) |
| All 15 agents have definitions + workflow IDs | definitions yes; workflow IDs no |
| No workflow JSON contains credentials | PASS (uses `$env.*` only) |
| Browser code contains no n8n secrets | PASS by source review (automated scan unverified) |
| Requests and callbacks are signed | code present; runtime UNVERIFIED |
| Replay protection works | code present (atomic nonce); runtime UNVERIFIED |
| Tenant-isolation tests pass | UNVERIFIED |
| Idempotency prevents duplicate actions | FAIL (non-atomic) |
| Retry and dead-letter handling work | code present; runtime UNVERIFIED |
| Approval controls work | code present; runtime UNVERIFIED |
| Six critical agents complete signed staging E2E | FAIL (none run) |
| SOS survives n8n/provider failure | UNVERIFIED |
| Subscription reconciliation passes in Stripe test mode | UNVERIFIED |
| Platform health reports skipped checks correctly | FAIL (scaffold, checks not implemented) |
| Every critical agent has a named owner | FAIL (all owner_id null) |
| Execution evidence is persisted | FAIL (none for required agents) |
| No critical workflow FAILED or MISSING | FAIL (all six critical UNVERIFIED, handlers stubs) |

---

## 10. Files changed

- 20 workflow JSON files under `supabase/n8n-workflows/guardianhub/` — repaired the `||;` syntax error.
- `supabase/docs/phase-22b-results.md` — this report (new).
- `supabase/docs/phase-21-blocked-launch-report.md` — updated with Phase 22B state.

Database changes: none (no DDL/DML was required or performed).

---

## 11. Remaining launch blockers

Unchanged unless separately proven (carried from prior phases):

- Phase 20B recovery drill — FAIL/BLOCKED.
- Storage-object restore — FAIL.
- Production build — UNVERIFIED (toolchain source repaired, never executed).
- Live least-privilege grants — migration 028 committed but UNAPPLIED.
- Browser route/UAT evidence — UNVERIFIED.
- Stripe E2E / production Stripe config — UNVERIFIED.
- Six release approvals — missing.

New/confirmed this phase:

- n8n staging target unreachable — import/execution UNVERIFIED.
- All agent credentials — not_configured.
- No named owner for any required agent.
- Workflow handlers are stubs (no business logic).
- Callback signature check conditional + missing agent/tenant/status cross-checks.
- Agent idempotency non-atomic (no unique constraint on agent_key + idempotency_key).

---

## 12. Final result

The critical-agent blocker is not cleared. Workflow files and agent definitions exist, and the syntax
error is repaired, but no agent has been imported, executed, credentialed, or assigned an owner, and the
handlers do not implement their required behaviour. Do not deploy or activate production workflows.

PHASE 22B RESULT: FAIL — CRITICAL AGENT BLOCKER REMAINS