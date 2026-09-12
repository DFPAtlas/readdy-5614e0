# GuardianHub n8n Workflow Pack — Setup & Activation Guide

Phase 16 delivers 15 production agent workflows plus 6 shared workflows under
`supabase/n8n-workflows/guardianhub/`. The business logic is enforced server-side in
GuardianHub edge functions; these n8n workflows perform external provider actions
(email/SMS/push) and report delivery results back via a signed, replay-protected callback.

## Required credentials (named placeholders — no values are stored in the JSON)

| Credential | Purpose |
|-----------|---------|
| GuardianHub HMAC (Header Auth) | `N8N_GUARDIANHUB_SIGNING_SECRET` used to verify inbound signatures |
| GuardianHub Callback HMAC (Header Auth) | `N8N_CALLBACK_SIGNING_SECRET` used to sign callbacks |
| Resend (or SMTP) | Transactional email for reminder/notification agents |
| SMS provider (e.g. Twilio) | SMS for SOS, check-in, incident and retry agents |
| Push provider (e.g. FCM) | Push notifications |
| Stripe (test mode first) | Subscription reconciliation agent |

## Required environment variables (set in n8n)

| Variable | Value |
|----------|-------|
| `N8N_GUARDIANHUB_SIGNING_SECRET` | Shared HMAC secret (must match Supabase Edge Function secret) |
| `N8N_CALLBACK_SIGNING_SECRET` | Callback HMAC secret (must match `N8N_CALLBACK_SIGNING_SECRET`) |
| `GUARDIANHUB_CALLBACK_URL` | `https://<project-ref>.supabase.co/functions/v1/n8n-callback` |

## Import order

1. Import the 6 shared workflows first (they are referenced by agents).
2. Import the 15 agent workflows.
3. Set each shared `Error Handler` as the Error Workflow on every agent workflow
   (Workflow > Settings > Error Workflow).

## Activation order

1. `shared-signed-event-intake` and `shared-signed-callback` (validate signatures work).
2. `shared-error-handler`, `shared-dead-letter-handler` (validate failure path).
3. `agent-sos-escalation` (critical; test in staging first).
4. Remaining agents one at a time, only after credentials and staging tests pass.
5. Do NOT activate any production workflow until credentials, permissions and staging tests are verified.

## Test procedure

1. In the Agent Operations Console (`/admin/agents/runtime`), run **Test** on an agent
   to dispatch a signed `agent.test` event.
2. Confirm the execution reaches `succeeded` and a row appears in execution logs.
3. Break the `N8N_GUARDIANHUB_SIGNING_SECRET` and confirm the workflow rejects with 401.
4. Replay a callback nonce and confirm 409 (replay rejection).
5. Dispatch the same idempotency key twice and confirm the second returns `duplicated=true`.

## Rollback procedure

1. Pause the agent in the Agent Operations Console (no destructive change).
2. Deactivate the n8n workflow.
3. If a callback already ran, use the dead-letter queue to resolve/replay safely.
4. Roll back the `023` migration only via the Supabase CLI after reviewing the plan.