# GuardianHub — Phase 16 Results: Production Agent Runtime & n8n Workflow Pack

## Status: IMPLEMENTED (scaffolds + runtime verified; workflows NOT activated)

The shared runtime, secure gateway, data model, approval centre and operations console
are built and verified against the live database. The n8n workflows are importable
scaffolds that require operator wiring of provider credentials before production activation.

## 1. Shared agent runtime

- Extended `agent_execution_logs` with execution ID, environment, trigger type, triggering
  record, idempotency key, correlation ID, priority, attempt/max-attempt counts, scheduled/
  start/completion timestamps, safe input/output summaries, error code, approval status,
  n8n execution reference, version and owner.
- Idempotency enforced by a unique index on `(agent_key, idempotency_key)`.
- Execution statuses supported: queued, processing, awaiting_approval, approved, rejected,
  succeeded, retrying, failed, dead_lettered, cancelled.

## 2. Data model

Reused `agent_registry`, `agent_execution_logs`, `agent_webhook_events`, `automation_approvals`,
`automation_audit_log` and `notification_jobs`. Added `agent_schedules`, `agent_dead_letters`,
`agent_credentials_status` (secret references only, never values), `agent_health_checks` and
`agent_replay_nonces`. RLS enabled on all, platform-staff managed, tenant-scoped reads.

## 3. Secure n8n gateway

- `n8n-gateway` (JWT, platform-staff aware): HMAC signing, nonce generation, idempotency
  reuse, tenant-ownership validation, allowed agent/environment checks, payload size cap,
  CORS allowlist, exponential-backoff retries, dead-letter on exhaustion.
- `n8n-callback` (public webhook): HMAC verification, timestamp tolerance, atomic nonce
  replay rejection (409 on replay).
- `agent-approval-action` (JWT): server-side approve/reject/request-changes with
  separation-of-duties (self-approval blocked) and expiry enforcement.

## 4. Approval centre & operations console

- `/admin/agents/runtime` — inventory, health, schedule, credentials, enable/disable
  (critical agents require audit reason), pause/resume, run test, replay dead-letter.
- `/admin/agents/approvals` — approve/reject/request-changes.

## 5. n8n workflow pack

15 agent workflows + 6 shared workflows in `supabase/n8n-workflows/guardianhub/`.
Each: signed webhook intake, HMAC verification, agent handler, signed callback. No
credential values, named placeholders only. See `n8n-workflow-pack-guide.md`.

## 6. Security finding fixed

`agent_execution_logs` had a wide-open SELECT policy (`qual = true`) allowing any
authenticated user to read any tenant's execution logs. Tightened to tenant + platform scoping.

## 7. NOT verified (requires operator action)

- n8n workflows not imported/activated; provider credentials not configured (all seeded `not_configured`).
- Cross-tenant/replay/duplicate-event UAT cases require real test JWTs (documented in
  `supabase/tests/phase-16-agent-tests.sql`).
- `npm run build` / `tsc` not run in this workspace.