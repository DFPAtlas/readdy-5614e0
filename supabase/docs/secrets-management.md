# Secrets Management — GuardianHub Phase 1B

## Secret Storage

All secrets must be stored in Supabase Edge Function secrets (via Supabase Dashboard), never in:
- Frontend code
- Environment variables (.env.local)
- Database tables (except company_secrets with RLS blocking)
- Git repository
- Client-side state

## Secret Inventory

| Secret | Location | Access Pattern | Rotation |
|--------|----------|---------------|----------|
| SUPABASE_URL | Edge Function env | All functions | N/A |
| SUPABASE_ANON_KEY | Edge Function env | JWT verification | Manual |
| SUPABASE_SERVICE_ROLE_KEY | Edge Function env | Server-only operations | Manual |
| STRIPE_SECRET_KEY | Edge Function secret | stripe-webhook only | 90 days |
| STRIPE_WEBHOOK_SECRET | Edge Function secret | stripe-webhook only | On key rotation |
| RESEND_API_KEY | Edge Function secret | Email functions | 90 days |
| RESEND_FROM_DOMAIN | Edge Function secret | Email functions | N/A |
| OPENAI_API_KEY | Edge Function secret | AI functions | 90 days |
| N8N_GUARDIANHUB_BASE_URL | Edge Function secret | agent-proxy only | N/A |
| N8N_GUARDIANHUB_SIGNING_SECRET | Edge Function secret | agent-proxy only | 90 days |
| SCHEDULER_SECRET | Edge Function secret | Scheduler functions | 90 days |
| OPENAI_API_KEY (per-company) | company_secrets table | RLS blocked, Edge Function only | User-managed |
| ANTHROPIC_API_KEY (per-company) | company_secrets table | RLS blocked, Edge Function only | User-managed |
| GOOGLE_API_KEY (per-company) | company_secrets table | RLS blocked, Edge Function only | User-managed |

## Protection Rules

1. **Never expose in frontend**: No `NEXT_PUBLIC_` prefix for secrets
2. **company_secrets RLS**: `company_secrets_no_access` policy blocks all direct access
3. **Key masking**: API key endpoints return only `key_last_four` and verification status
4. **Audit logging**: Key save events logged in `admin_activity_log`
5. **No logging**: Secrets never appear in console.log, error messages, or response bodies

## Removed in Phase 1B

- `NEXT_PUBLIC_N8N_GUARDIANHUB_BASE_URL` — removed from browser access
- Browser-supplied `user_id`, `company_id`, `role` — now derived from JWT
- Wildcard CORS — replaced with origin allowlist