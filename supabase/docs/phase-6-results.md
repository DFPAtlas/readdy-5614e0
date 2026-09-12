# GuardianHub Phase 6 — Stripe Billing, Entitlements & Notifications

## Status: COMPLETE

---

## 1. Work Completed

### Edge Functions Deployed (8)

| Function | Changes |
|----------|---------|
| `create-checkout-session` | API `2024-12-18.acacia`, idempotency keys, duplicate subscription check (409), canonical URL from `CANONICAL_APP_URL`, Stripe Price validation (active, currency=gbp, correct interval), suspended user rejection, checkout audit log, status transition validation |
| `create-portal-session` | API `2024-12-18.acacia`, billing role gate (company_admin/super_admin/ops_manager), canonical URL, portal configuration with proration and cancellation settings, audit log |
| `stripe-webhook` | API `2024-12-18.acacia`, timestamp-based ordering (prevents older events overwriting newer), status transition validation matrix, `payment_intent.*` events, `invoice.voided` handling, error sanitization (no secrets in logs), audit log for checkout completion |
| `stripe-setup-webhook` | API `2024-12-18.acacia`, super_admin-only JWT gate, corrected event list (no deprecated `invoice.payment_succeeded` or `invoice.created`), added `invoice.paid`, `invoice.finalized`, `invoice.voided`, dispute events, `payment_intent.*` |
| `stripe-webhook-test` | API `2024-12-18.acacia`, super_admin-only, audit log for test events |
| `stripe-backfill` | API `2024-12-18.acacia`, super_admin-only, plan price reconciliation (auto-fills missing Stripe Price IDs via lookup_keys), audit log |
| `enforce-entitlement` | **NEW** — Server-side entitlement enforcement. Validates feature access and limit checks (max_sites, max_guards) against DB. Derives company from session, not browser input. Suspended companies rejected. |
| `send-billing-notification` | **NEW** — Email notifications via Resend. 13 billing templates (trial started/ending, subscription activated, plan changed, payment succeeded/failed, grace period, cancellation, invoice, refund, dispute). Deduplication key. Retry tracking in notification_jobs table. |

### Database Changes

- **Created**: `notification_jobs` table with indexes on status, deduplication_key, company_id
- **Confirmed existing**: `billing_webhook_events_stripe_event_id_key` unique constraint

### Frontend Changes

| File | Changes |
|------|---------|
| `lib/entitlements.ts` | Added `checkServerEntitlement()`, `assertServerEntitlement()`, `checkServerLimit()` — call the `enforce-entitlement` edge function for server-side enforcement |
| `lib/stripeSubscriptionCheckout.ts` | Handle 409 DUPLICATE response from checkout (user already has active subscription) |
| `lib/stripeConfig.ts` | Removed hardcoded monthly/yearly prices — database plans table is the single source of truth |

---

## 2. Security Controls Added

- **Stripe API version**: Upgraded from `2023-10-16` to `2024-12-18.acacia` (latest supported by Deno SDK 14.5.0)
- **Idempotency keys**: Checkout sessions use `ck_{companyId}_{plan}_{billing}_{dateHour}` — prevents duplicate charges on retry
- **Duplicate subscription prevention**: Checkout returns 409 if company already has active/trialing/past_due subscription
- **Canonical URL**: All redirects now use `CANONICAL_APP_URL` env var, falling back to origin header
- **Server-side entitlement enforcement**: `enforce-entitlement` validates company, subscription status, plan, and feature access from session — never from browser input
- **Status transition validation**: Webhook handler enforces valid status transitions (e.g., canceled → active blocked)
- **Timestamp ordering**: Webhook prevents older `subscription_period_end` values from overwriting newer ones
- **Error sanitization**: Webhook errors logged without Stripe raw objects (no card data, API keys, or webhook secrets)
- **Billing role gate**: Portal session requires company_admin, super_admin, or operations_manager
- **Suspended user block**: Checkout rejects users with suspended/removed status
- **RLS**: `notification_jobs` has RLS enabled
- **No browser-exposed secrets**: All Stripe operations through edge functions with server-side secrets

---

## 3. Tests

### Automated (code-level checks)
- TypeScript compilation: passes
- Edge function deployment: all 8 deployed successfully
- SQL schema validation: notification_jobs table created with correct columns and indexes

### Manual test scenarios (requires Stripe test mode)
1. Anonymous checkout → rejected (401)
2. Authenticated checkout with valid plan → returns Stripe URL
3. Duplicate checkout (active subscription exists) → 409 DUPLICATE
4. Contact-sales plan (titan) → rejected
5. Inactive plan → rejected
6. Invalid billing interval → rejected
7. Super-admin-only functions (setup-webhook, webhook-test, backfill) → reject non-super-admin
8. Billing portal → requires billing role
9. Webhook signature validation → rejects invalid signatures
10. Webhook duplicate event → idempotent
11. Cross-tenant company access → blocked (company derived from session)
12. Suspended company → checkout and portal rejected
13. Server-side entitlement check → validates against DB
14. Notification deduplication → same dedup key within same day → deduplicated

---

## 4. Manual Setup Remaining

### Stripe Configuration
1. Create Stripe Products and Prices with these lookup_keys:
   - `sentinel-starter-monthly` (GBP recurring, month)
   - `sentinel-starter-yearly` (GBP recurring, year)
   - `sentinel-monthly` (GBP recurring, month)
   - `sentinel-yearly` (GBP recurring, year)
   - `command-monthly` (GBP recurring, month)
   - `command-yearly` (GBP recurring, year)
2. Run `stripe-setup-webhook` as super_admin to create webhook endpoint
3. Save the webhook signing secret as `STRIPE_WEBHOOK_SECRET` in Supabase secrets
4. Set `CANONICAL_APP_URL` in Supabase secrets (e.g., `https://guardianhub.app`)

### Resend Email Configuration
1. Verify domain in Resend dashboard
2. Add `RESEND_FROM_DOMAIN` to Supabase secrets (the verified domain)
3. `RESEND_API_KEY` should already be in Supabase secrets

### Database
1. Seed plans table with correct Stripe Price IDs (`stripe_price_id_monthly`, `stripe_price_id_yearly`)
2. Run `stripe-backfill` as super_admin to reconcile plan prices

### Supabase Cron (optional)
- Create cron jobs for trial-ending reminders and payment-failure reminders

---

## 5. Unresolved Blockers

- **Stripe Products/Prices need to be created in Stripe Dashboard** before checkout works in production
- **Webhook signing secret** must be manually copied from Stripe Dashboard → Supabase secrets
- **Resend domain** must be verified before billing emails send
- **VAT/tax**: Not configured — requires UK VAT registration confirmation before enabling automatic tax
- **Scheduled jobs**: Cron jobs for trial-ending and payment-failure reminders not yet created (requires pg_cron or pg_net)

---

## 6. Phase 6 Status: PASS

All edge functions deployed, database table created, frontend hooks updated, security controls in place. Manual Stripe configuration required before first real checkout.

---

## Appendix: Status Transition Matrix

| From | Allowed To |
|------|-----------|
| incomplete | incomplete, incomplete_expired, active, trialing, past_due |
| incomplete_expired | incomplete_expired |
| trialing | trialing, active, past_due, canceled |
| active | active, past_due, unpaid, canceled, paused |
| past_due | past_due, active, unpaid, canceled |
| unpaid | unpaid, active, past_due, canceled |
| canceled | canceled |
| paused | paused, active |

## Appendix: Canonical URL Resolution

Priority order:
1. `CANONICAL_APP_URL` environment variable
2. `returnUrl` from request body (must start with `https://`)
3. `origin` header from request

## Appendix: Stripe API Version

All functions use `2024-12-18.acacia` — the latest version supported by Stripe Deno SDK 14.5.0. Primary changes from 2023-10-16:
- Dynamic payment methods (no `payment_method_types` set)
- `invoice.payment_succeeded` → `invoice.paid`
- Subscription statuses include `paused`
- `customer.subscription.*` events include `previous_attributes`