# GuardianHub Payments Setup

Developer guide for Stripe billing configuration in this project.

## Frontend Public Environment Variables

These are exposed to the browser and used by the frontend checkout hook:

- `NEXT_PUBLIC_SUPABASE_URL` — Supabase project URL (e.g. `https://kbefthyqlfrwixmkcqhu.supabase.co`)
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` — Supabase anon/public API key

Note: This project uses `NEXT_PUBLIC_*` prefixes. If your project uses Vite, use `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` instead.

## Supabase Edge Function Secrets

Set these in the Supabase dashboard under Edge Functions → Secrets. They are **never** sent to the browser.

- `STRIPE_SECRET_KEY` — Your Stripe secret key (starts with `sk_live_` or `sk_test_`)
- `STRIPE_WEBHOOK_SECRET` — Stripe webhook signing secret (starts with `whsec_`)

## Active Stripe Products & Prices (Sandbox)

### Guardian-Hub Starter
- Product ID: `prod_UnIYbD4pZSOCNB`
- Monthly Price: `price_1TnhxWLcsXgF5wPQ4UZbPMno`
- Amount: £49/month

### Guardian-Hub Sentinel
- Product ID: `prod_UUCPIhPTHsRoF2`
- Monthly Price: `price_1TVE11LcsXgF5wPQONu0hOke`
- Amount: £99/month

### Guardian-Hub Command
- Product ID: `prod_UUCbr2wshFKtGv`
- Monthly Price: `price_1TVECGLcsXgF5wPQoo9FuK3v`
- Amount: £399/month

### Guardian-Hub Titan
- Product ID: `prod_UnIZSYOzZGpKVj`
- No Stripe price (Contact Sales only)

## Webhook URL

Register this endpoint in your Stripe Dashboard under Developer → Webhooks:

```
https://kbefthyqlfrwixmkcqhu.supabase.co/functions/v1/stripe-webhook
```

Events to send:
- `checkout.session.completed`
- `invoice.payment_succeeded`
- `invoice.payment_failed`
- `customer.subscription.updated`
- `customer.subscription.deleted`

## Important Security Rules

- **Never** put `STRIPE_SECRET_KEY` in frontend code.
- **Never** put `STRIPE_WEBHOOK_SECRET` in frontend code.
- **Never** put `SUPABASE_SERVICE_ROLE_KEY` in frontend code.
- Always call `create-checkout-session` and `create-portal-session` with the **logged-in user's** `access_token` as the `Authorization: Bearer` header.
- Do **not** use the Supabase anon key as a bearer token for authenticated billing operations.