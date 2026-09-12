# Environment Configuration Matrix — GuardianHub Phase 14

## Environments

| Environment | NEXT_PUBLIC_APP_ENV | Purpose | Data |
|-------------|---------------------|---------|------|
| Local development | `local` (or unset) | Individual developer machines | Synthetic/fixture only |
| Staging | `staging` | Pre-production testing, restore drills, load tests | Production-like synthetic dataset |
| Production | `production` | Live customer data | Real tenant data |

## Variable Categories

### Public browser variables (safe to ship, prefix `NEXT_PUBLIC_`)
| Variable | Category | Required | Notes |
|----------|----------|----------|-------|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase | Always | Project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase | Always | Publishable anon key (not secret) |
| `NEXT_PUBLIC_APP_ENV` | Environment | Recommended | Drives the staging badge |
| `NEXT_PUBLIC_SITE_URL` | Environment | Staging/Production | Canonical origin |
| `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY` | Maps | Optional | Browser-restricted key |

### Server-only secrets (Edge Function secrets via Supabase Dashboard — NEVER `NEXT_PUBLIC_*`)
| Secret | Category | Purpose |
|--------|----------|---------|
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase | Server-side privileged operations |
| `STRIPE_SECRET_KEY` | Stripe | Checkout/portal/reconciliation |
| `STRIPE_WEBHOOK_SECRET` | Stripe | Webhook signature verification |
| `N8N_GUARDIANHUB_BASE_URL` | n8n | Automation webhook base URL |
| `N8N_GUARDIANHUB_SIGNING_SECRET` | n8n | Webhook payload signing |
| `RESEND_API_KEY` | Email | Transactional email |
| `RESEND_FROM_DOMAIN` | Email | From address domain |
| `SMS_PROVIDER_KEY` / `TWILIO_ACCOUNT_SID` | SMS | SMS delivery |
| `GOOGLE_MAPS_API_KEY` (server) | Maps | Geocoding (if server-side) |
| `QUEUE_CRON_SECRET` | Operations | Queue processor auth |
| `RETENTION_CRON_SECRET` | Operations | Retention runner auth |
| `SCHEDULER_SECRET` | Operations | Scheduled jobs |

## Rules

- Server-only values must never be prefixed `NEXT_PUBLIC_` or `VITE_`.
- `SUPABASE_SERVICE_ROLE_KEY` must never appear in browser bundles, public env, or logs.
- Staging must use a separate Supabase/Stripe/n8n/Resend configuration to prevent accidental production writes or real notifications.
- A visible non-production badge is rendered automatically by `components/EnvironmentBadge.tsx` when `NEXT_PUBLIC_APP_ENV` is not `production`.

## Environment health report

`lib/env.ts` exports `getPublicEnvHealth()` which validates required public variables and returns presence-only flags (never values). Server-side dependency status is reported by the `health-check` edge function (safe states only: healthy/degraded/unavailable/not_configured).

## Promotion (staging → production)

1. Review the staging environment health report and CI gate results.
2. Promote reviewed database migrations (`supabase/migrations/`) to production via the Supabase CLI or Dashboard.
3. Copy Edge Function secrets into production (Supabase Dashboard → Edge Functions → Secrets), using production provider keys.
4. Set `NEXT_PUBLIC_APP_ENV=production` and `NEXT_PUBLIC_SITE_URL` to the canonical domain.
5. Record the deployment in `deployment_records` (commit SHA, version, environment).
6. Run smoke tests: sign-in, health-check ready mode, one Stripe test webhook, one guard check-in.