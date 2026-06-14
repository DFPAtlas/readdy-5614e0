# GuardianHub Production Deployment Guide

## Overview
GuardianHub is a Next.js static-export application. All server-side logic runs through Supabase Edge Functions. There is no Node.js server at runtime.

## Environment Variables

### Frontend (.env)
NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY are the only env vars needed in browser. Never add secret keys here.

### Supabase Edge Function Secrets
Set in Supabase dashboard (Project Settings > Edge Functions > Secrets):
- STRIPE_SECRET_KEY
- SUPABASE_SERVICE_ROLE_KEY
- OPENAI_API_KEY (optional, for AI features)

All Stripe, OpenAI, and admin-level operations happen inside Edge Functions only.

## Build and Deploy

Commands:
- npm install
- npm run type-check
- npm run lint
- npm run build

The build produces a static /out directory via output: "export".

Deploy /out to any static host (Vercel, Netlify, Cloudflare Pages, Nginx, etc).

## Key Architecture Notes

### Server-Side Code (DO NOT import in browser)
- lib/billing/stripe.ts - requires STRIPE_SECRET_KEY
- lib/billing/supabase-admin.ts - requires SUPABASE_SERVICE_ROLE_KEY
- lib/billing/backfill.ts - CLI tool for data migration
- lib/billing/sync.ts - server-only sync utilities

These files are safe because nothing in the browser codebase imports them.

### Stripe
- All Stripe operations go through Supabase Edge Functions
- Stripe secret key lives ONLY in Supabase Edge Function secrets
- Public price IDs in lib/stripeConfig.ts
- Webhook: https://your-project.supabase.co/functions/v1/stripe-webhook

### Database
- All tables have Row Level Security enabled
- RLS enforces company-scoped multi-tenancy
- Never disable RLS or use service_role key in browser code

## Known Limitations
1. Static export: No SSR, no API routes, no middleware
2. Two guard dashboards: /guard (production mobile-first) and /guard-dashboard (desktop mock data)
3. Stripe Price IDs must be configured in Supabase Edge Function secrets

## Auth
- Supabase Auth with JWT sessions
- 5 user roles with role-based routing via AuthProvider
- Route protection via AuthGate component