# Edge Function Authentication Tests — GuardianHub Phase 1B

## Manual API Testing Guide

Run these against your deployed Supabase project. Replace `[project]` with your Supabase project reference.

### Prerequisites

Get a valid JWT token by signing in through the app and capturing the `access_token` from Supabase auth.

### Test 1: Unauthenticated Access Denied

```bash
curl -s -X POST "https://[project].supabase.co/functions/v1/admin-invite-user" \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","role":"guard"}' | jq .
```
Expected: `{"error":"Missing Authorization header"}` (401)

### Test 2: Guard Cannot Invite Users

```bash
curl -s -X POST "https://[project].supabase.co/functions/v1/admin-invite-user" \
  -H "Authorization: Bearer [guard_token]" \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","role":"guard"}' | jq .
```
Expected: `{"error":"Only company admins can invite users"}` (403)

### Test 3: Company Admin Cannot Invite Super Admin

```bash
curl -s -X POST "https://[project].supabase.co/functions/v1/admin-invite-user" \
  -H "Authorization: Bearer [company_admin_token]" \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","role":"super_admin"}' | jq .
```
Expected: `{"error":"Only super_admin can invite super_admin users"}` (403)

### Test 4: has-permission Uses Token Identity

```bash
curl -s -X POST "https://[project].supabase.co/functions/v1/has-permission" \
  -H "Authorization: Bearer [token]" \
  -H "Content-Type: application/json" \
  -d '{"user_id":"00000000-0000-0000-0000-000000000000","company_id":"11111111-1111-1111-1111-111111111111","permission_key":"dashboard"}' | jq .
```
Expected: Returns permission based on token identity, not submitted IDs

### Test 5: Agent Proxy Requires Auth

```bash
curl -s -X POST "https://[project].supabase.co/functions/v1/guardianhub-agent-proxy" \
  -H "Content-Type: application/json" \
  -d '{"agent_key":"test-agent"}' | jq .
```
Expected: `{"error":"Authentication required"}` (401)

### Test 6: SOS Derives Guard Identity

```bash
curl -s -X POST "https://[project].supabase.co/functions/v1/sos-emergency-notify" \
  -H "Authorization: Bearer [guard_token]" \
  -H "Content-Type: application/json" \
  -d '{"company_id":"wrong-company","guard_id":"wrong-guard","guard_name":"Hacker"}' | jq .
```
Expected: Uses the actual guard identity from the token, ignores submitted IDs

### Test 7: Guard Cannot Save API Keys

```bash
curl -s -X POST "https://[project].supabase.co/functions/v1/save-api-key" \
  -H "Authorization: Bearer [guard_token]" \
  -H "Content-Type: application/json" \
  -d '{"provider":"openai","api_key":"sk-test"}' | jq .
```
Expected: `{"error":"Guards and clients cannot manage API keys"}` (403)

### Test 8: Stripe Webhook Signature Verification

```bash
curl -s -X POST "https://[project].supabase.co/functions/v1/stripe-webhook" \
  -H "Content-Type: application/json" \
  -d '{"type":"test"}' | jq .
```
Expected: `{"error":"Missing signature"}` (400)

### Test 9: Operations Copilot Requires Auth

```bash
curl -s -X POST "https://[project].supabase.co/functions/v1/operations-copilot" \
  -H "Content-Type: application/json" \
  -d '{"query":"who is on duty","companyId":"fake","userRole":"super_admin","userId":"fake"}' | jq .
```
Expected: `{"error":"Authentication required"}` (401)