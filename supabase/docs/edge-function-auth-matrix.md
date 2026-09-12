# Edge Function Authentication Matrix — GuardianHub Phase 1B

## Summary

All privileged Edge Functions now require JWT authentication (`verify_jwt = true`). Identity, role, and company context are derived from the verified JWT token, never from browser-supplied parameters.

## Authentication Methods

| Method | Functions | Verification |
|--------|-----------|-------------|
| JWT Bearer Token | All authenticated functions | `supabase.auth.getUser(token)` |
| Stripe Signature | stripe-webhook | `stripe.webhooks.constructEvent()` |
| Scheduler Secret | compliance-expiry-check (scheduled mode) | `x-scheduler-secret` header |
| Hardcoded Token | create-demo-admin | Protected dev-only token |

## Function-Level Matrix

| Function | Auth Method | Required Role | verify_jwt | CORS |
|----------|------------|---------------|------------|------|
| admin-invite-user | JWT | company_admin+ | true | Origin allowlist |
| has-permission | JWT | Any authenticated | true | Origin allowlist |
| guardianhub-agent-proxy | JWT | Any authenticated | true | Origin allowlist |
| operations-copilot | JWT | company_admin+ | true | Origin allowlist |
| sos-emergency-notify | JWT | guard (verified) | true | Origin allowlist |
| save-api-key | JWT | company_admin+ | true | Origin allowlist |
| ai-sick-cover | JWT | company_admin+ | true | Origin allowlist |
| compliance-expiry-check | JWT/Scheduler | company_admin+ or secret | true | Origin allowlist |
| acs-audit | JWT | company_admin+ | true | Origin allowlist |
| stripe-webhook | Stripe sig | N/A (webhook) | false | Minimal |
| ops-signup | Public | N/A (signup) | false | Origin allowlist |
| send-notification-email | JWT (internal) | Internal only | true | Minimal |
| send-welcome-email | JWT (internal) | Internal only | true | Minimal |

## Security Changes Applied (Phase 1B)

1. **Browser-supplied authority eliminated**: No function trusts `user_id`, `company_id`, or `role` from the request body
2. **Identity from JWT**: All identity derives from `auth.uid()` via verified token
3. **Active status check**: All functions verify `users.status = 'active'`
4. **Role-based guards**: `requireSuperAdmin()`, `requireCompanyAdmin()`, `requireGuardOwnership()`
5. **CORS hardened**: Wildcard `*` replaced with origin allowlist
6. **n8n boundary secured**: HMAC-signed requests with timestamps and request IDs
7. **Audit logging**: Admin actions logged with actor context
8. **Error sanitization**: No stack traces, secrets, or internal URLs in responses

## Remaining Risks (Deferred to Phase 2)

1. Rate limiting not yet implemented on most functions
2. ops-signup needs bot protection (CAPTCHA)
3. Storage bucket policies not fully audited
4. Scheduled function secrets need rotation mechanism
5. Full penetration testing recommended