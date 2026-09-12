# GuardianHub Phase 7 — N8N Agents, Automation & Human Approval Control

## Architecture Overview

```
Browser → automation-gateway (Edge Function) → n8n Orchestrator → Agent Workflows
                                                      ↓
                                              n8n-callback ← Agent Results
                                                      ↓
                                              Supabase Database
```

**Key Principle**: The browser never communicates directly with n8n. All requests pass through the authenticated `automation-gateway` Edge Function, which verifies the user, resolves their company/role, validates the agent and event type, and signs outbound requests with HMAC.

## Agents

| Agent Key | Name | Category | Risk Level | Requires Approval |
|---|---|---|---|---|
| incident_triage | Incident Triage Agent | safety | medium | false |
| sos_escalation | SOS Escalation Agent | safety | critical | false |
| attendance_exceptions | Attendance Exception Agent | operational | low | false |
| rota_assistance | Rota Assistance Agent | operational | medium | true |
| compliance_monitoring | Compliance Monitoring Agent | compliance | low | false |
| report_generation | Report Generation Agent | reporting | low | true |
| notification_escalation | Notification Escalation Agent | operational | medium | false |
| automation_health | Automation Health Agent | platform | low | false |

## Workflows

10 importable n8n workflow JSON files in `supabase/n8n-workflows/`:

1. `orchestrator.json` — Master router with signature verification, nonce replay protection, agent routing
2. `incident-triage.json` — Classifies incidents, detects missing fields, suggests review
3. `sos-escalation.json` — Deterministic SOS delivery (no AI delay)
4. `attendance-exceptions.json` — Late/missed check-ins, geofence mismatches
5. `rota-assistance.json` — Guard ranking with hard rules before scoring
6. `compliance-monitoring.json` — Licence/cert/training expiry monitoring
7. `report-generation.json` — Draft report generation (all marked draft)
8. `notification-escalation.json` — Quiet hours, deduplication, channel escalation
9. `automation-health.json` — Platform health monitoring
10. `dead-letter-recovery.json` — Manual admin recovery

## Edge Functions

- **automation-gateway** — Authenticates users, validates agent/event, signs requests, handles approval flow
- **n8n-callback** — Receives signed callbacks from n8n, updates run status, processes webhook events
- **queue-processor** — Cron-invoked, processes pending webhook events with retry/backoff/dead-letter

## Database

### New Tables
- `automation_rules` — Per-company agent rules (triggers, conditions, quiet hours)
- `automation_approvals` — Human approval queue for high-risk actions
- `automation_audit_log` — Immutable audit trail

### Extended Tables
- `agent_registry` — Added version, category, risk_level, requires_approval, configuration

## Security Controls

- HMAC-signed requests between gateway and n8n
- Nonce replay protection in orchestrator
- Timestamp expiry (5 min window)
- Allowed event types whitelist
- Company-scoped RLS on all automation tables
- Approval workflow for high-risk agents
- Sensitive field stripping in approval previews
- No secrets in browser bundles

## Manual Configuration Required

1. Set `N8N_GUARDIANHUB_BASE_URL` in Supabase secrets
2. Set `N8N_GUARDIANHUB_SIGNING_SECRET` in Supabase secrets (shared with n8n)
3. Set `N8N_CALLBACK_SIGNING_SECRET` in Supabase secrets (optional, falls back to signing secret)
4. Set `QUEUE_CRON_SECRET` in Supabase secrets
5. Configure Supabase Cron to invoke `queue-processor` every 2 minutes
6. Import n8n workflow JSONs, configure credentials, enable workflows
7. Configure n8n environment variables: `SUPABASE_URL`, `N8N_GUARDIANHUB_SIGNING_SECRET`
8. Register agents in `agent_registry` table with their n8n webhook paths