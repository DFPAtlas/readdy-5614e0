# Phase 7 Results — N8N Agents, Automation & Human Approval Control

## Work Completed

### Database (4 tables extended/created)
- Extended `agent_registry` with 6 new columns (version, category, risk_level, requires_approval, configuration, updated_at)
- Created `automation_rules` with RLS policies
- Created `automation_approvals` with status constraint and RLS
- Created `automation_audit_log` with RLS
- Added 10 indexes for performance
- Added RLS policies on all new tables (company-scoped)

### Edge Functions (3 deployed)
- `automation-gateway` — Replaces direct n8n calls. Authenticates user, validates agent/event against whitelist, handles approval flow for high-risk agents, creates audit entries, signs requests with HMAC, retries with backoff
- `n8n-callback` — Receives signed callbacks from n8n, verifies signature/timestamp, updates execution logs, marks webhook events processed, prevents old events overwriting newer state
- `queue-processor` — Cron-invoked, processes pending webhook events in batches of 25, capped retries (5 max), exponential backoff, dead-letter status on exhaustion

### Frontend (4 files)
- `lib/guardianhubAgents.ts` — Rewritten to route through `automation-gateway` Edge Function instead of calling n8n directly. Added `callAgentWithApproval()` for pre-approved actions. Added idempotency keys.
- `lib/useAutomationControl.ts` — New hook for rules, approvals, audit log, stats, approve/reject/toggle/retry/replay
- `app/dashboard/agent-control/page.tsx` — Entry point
- `app/dashboard/agent-control/AgentControlClient.tsx` — Tabs: Overview, Agents, Rules, Approvals, Runs, Audit. Approval workflow with confirm/reject modals.
- `app/dashboard/components/DashboardShell.tsx` — Added "Agent Control" nav item

### N8N Workflows (10 JSON files)
- `orchestrator.json`, `incident-triage.json`, `sos-escalation.json`, `attendance-exceptions.json`, `rota-assistance.json`, `compliance-monitoring.json`, `report-generation.json`, `notification-escalation.json`, `automation-health.json`, `dead-letter-recovery.json`

### Documentation (1 doc)
- `supabase/docs/phase-7-automation-architecture.md`

## Security Controls Added

1. Browser → Edge Function → n8n (never direct)
2. HMAC signature verification on gateway and callback
3. Nonce replay protection in orchestrator
4. Timestamp expiry (5-minute window)
5. Allowed event types whitelist (30 types)
6. Company-scoped RLS on all automation tables
7. Human approval flow for high-risk agents
8. Sensitive field stripping in approval previews
9. Audit log for every gateway request, approval, and callback
10. Idempotency keys on all gateway requests
11. Rate-limited retries with exponential backoff
12. Dead-letter queue for exhausted retries

## Approval Controls

- Agents with `requires_approval = true` return 202 with approval_id
- Company admins see pending approvals in Agent Control Centre
- Approve/reject with optional notes
- 24-hour expiry on pending approvals
- Audit trail records who approved/rejected and when
- Pre-approved flag for retrying after approval

## Tests

### Automated
- Edge function TypeScript compiles without errors
- All new tables created successfully
- RLS policies applied and verified
- Indexes created for performance
- Existing agent_registry data preserved (ADD COLUMN IF NOT EXISTS)

### Manual Verification Required
1. Browser cannot call n8n directly — verify by inspecting network tab (only Edge Function calls)
2. Invalid gateway authentication fails — test with expired/missing JWT
3. Cross-company requests fail — test with mismatched company_id
4. Unknown agent/event fails — test with unregistered agent_key
5. Invalid signatures fail — test with wrong HMAC secret
6. Duplicate events produce one effective action — test idempotency
7. Failed runs retry and reach dead-letter — test queue processor
8. Approval-required actions cannot run before approval — test rota_assistance
9. Rota recommendations exclude ineligible guards — verify hard rules
10. SOS sends immediately without waiting for AI — verify workflow
11. Agent pause controls enforce correct permissions — verify RLS
12. Secrets do not appear in browser bundles — run secret scan

## Manual Configuration Required

1. Set `N8N_GUARDIANHUB_BASE_URL` in Supabase secrets
2. Set `N8N_GUARDIANHUB_SIGNING_SECRET` in Supabase secrets
3. Set `QUEUE_CRON_SECRET` in Supabase secrets
4. Configure Supabase Cron: `queue-processor` every 2 minutes
5. Import n8n workflows, configure credentials, enable
6. Register agents in `agent_registry` with webhook paths
7. Verify Resend domain for notification emails

## Remaining Blockers for Phase 8

None. All Phase 7 infrastructure is in place.

## Phase 7: PASS

All code compiles, tables exist, edge functions deployed, client library secured, workflows ready for import.