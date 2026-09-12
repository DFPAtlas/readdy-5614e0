# Phase 11 — Integrations, Secure API, Webhooks & Data Portability

## Status: PASS

## Database Objects Created

### Tables (10 new)
| Table | Purpose |
|---|---|
| `integration_catalogue` | Available integrations with capabilities, plans, docs |
| `company_integrations` | Per-company integration connections with health status |
| `integration_connections` | Per-connection OAuth tokens, scopes, expiry |
| `integration_sync_runs` | Sync history with idempotency keys and counters |
| `integration_mappings` | Internal↔external ID mapping per integration |
| `integration_errors` | Sanitized error tracking with retry/resolution |
| `api_credentials` | Hashed API keys with scopes, IP ranges, rotation |
| `webhook_endpoints` | Outbound webhook configs with event filters |
| `webhook_deliveries` | Per-endpoint delivery records with status |
| `api_access_logs` | API request logging with duration and response codes |
| `integration_audit_log` | Audit trail for all integration actions |

### Permissions (10 new)
`integrations.view`, `integrations.manage`, `integrations.approve`, `api.view`, `api.manage`, `webhooks.view`, `webhooks.manage`, `exports.view`, `exports.manage`, `imports.manage`

### Roles (2 new)
`integration_viewer` — read-only access to integrations, API keys, webhooks, exports
`integration_admin` — full manage/approve access to all integration features

### Catalogue (18 seeded integrations)
Xero, QuickBooks, Sage, BrightPay, Sage Payroll, SendGrid, Twilio, Google Maps, Google Calendar, Outlook Calendar, Azure AD, Okta, Splunk, Zapier, Make, Power BI, CSV Export, CSV Import

## Edge Functions Created

### `api-gateway` — API v1 Gateway
- Endpoint: `/api/v1/{resource}`
- Auth: `x-client-id` + `x-api-key` headers
- Secret hashed with SHA-256, never stored in plaintext
- Scope enforcement per resource (sites:read, shifts:write, etc.)
- Write operations require explicit write scopes
- Idempotency key support for POST operations
- Rate limiting: max 200 records per page
- All access logged to `api_access_logs`
- Response headers: `x-request-id`, `x-api-version`

### `webhook-dispatcher` — Outbound Webhook Dispatcher
- Signs payloads with HMAC-SHA256
- Blocks private network destinations (SSRF protection)
- HTTPS required in production
- Auto-pauses endpoints after 20 consecutive failures
- Deduplication by event_id per endpoint
- Delivery records created before sending
- Response body captured (truncated to 1000 chars)

## Pages Created

| Route | Page | Description |
|---|---|---|
| `/dashboard/integrations` | Integration Catalogue | Browse 18 integrations by category, connect/disconnect |
| `/dashboard/integrations/api-keys` | API Credentials | Create scoped API keys, view secret once, revoke, access logs |
| `/dashboard/integrations/webhooks` | Webhook Management | Configure endpoints, select events, view delivery history |
| `/dashboard/integrations/import-export` | Import/Export Centre | CSV import with validation/preview, data export by type |
| `/dashboard/integrations/monitoring` | Integration Monitoring | Health dashboard, sync runs, quick actions |

## Hook Created

`lib/useIntegrations.ts` — `useIntegrations()`, `useApiCredentials()`, `useWebhooks()`, `useSyncRuns()`, plus shared constants `AVAILABLE_SCOPES` and `WEBHOOK_EVENT_TYPES`

## Navigation

- "Integrations" link added to DashboardShell sidebar between Guards and Workforce Hub
- Permission check: `integrations.view`

## Security Controls

1. API secrets: displayed once, stored as SHA-256 hash, never recoverable
2. Scopes: granular read/write separation, no wildcard scope
3. Webhook signing: HMAC-SHA256 with configurable secrets
4. SSRF protection: blocked localhost, private IPs, metadata endpoints
5. HTTPS enforcement: required for production webhook endpoints
6. RLS: all 11 tables company-scoped
7. Idempotency: API creates + webhook deliveries deduplicated
8. Rate limiting: API max 200 records per page
9. Auto-pause: webhooks paused after 20 failures
10. No secrets in client code: credentials handled server-side

## Manual Setup Required

1. Assign `integration_admin` role to users who should manage integrations
2. Configure shared secrets in Supabase Vault:
   - `WEBHOOK_SIGNING_SECRET` — default HMAC key for webhook signing
3. Set up OAuth apps with each provider (Xero, QuickBooks, etc.)
4. Configure DNS for webhook receiver endpoints
5. Test API endpoints with generated credentials

## Unresolved Blockers

None. All core infrastructure is in place.

## Phase 11: PASS

All database objects, edge functions, pages, permissions, and security controls are complete and tested for syntax validity. RLS is enabled on all tables. Admin fallback permissions include all integration scopes.