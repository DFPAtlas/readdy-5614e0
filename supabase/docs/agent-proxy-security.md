# Agent Proxy Security — GuardianHub Phase 1B

## Architecture

The GuardianHub Agent Proxy acts as a secure bridge between the frontend and n8n webhook workflows. It replaces direct browser-to-n8n calls.

```
Browser → guardianhub-agent-proxy (JWT auth) → n8n (HMAC signed)
```

## Security Controls

### 1. Authentication
- JWT Bearer token required (`verify_jwt = true`)
- User identity verified via `supabase.auth.getUser()`
- Active status required (`users.status = 'active'`)
- Anon and suspended users are rejected with 401/403

### 2. Agent Validation
- `agent_key` must exist in `agent_registry`
- Agent must be `is_active = true`
- Unknown or inactive agents return 404

### 3. Webhook Path Validation
- Must start with `/`
- Path traversal blocked (`..`, `//`)
- Absolute URLs rejected
- Only allowlisted n8n paths are reachable

### 4. n8n Request Signing
- HMAC-SHA256 signature using `N8N_GUARDIANHUB_SIGNING_SECRET`
- Request includes: `timestamp`, `request_id`, `user_id`, `company_id`, `agent_key`
- Signature header: `X-GH-Signature`
- n8n should verify signature before processing

### 5. Request Limits
- Maximum payload size: 1MB
- Request timeout: 30 seconds
- Aborted requests logged as failures

### 6. Audit Trail
- Every execution logged in `agent_execution_logs`
- Records: agent_key, user_id, company_id, status, timing, error messages
- Failed executions include error context (sanitized)

### 7. Error Handling
- n8n unreachable → 502 "Agent service unavailable"
- n8n returns error → 502 "Agent execution failed"
- No internal URLs, stack traces, or n8n error details returned to browser

## Signature Verification (n8n Side)

n8n workflows should verify incoming requests:

```javascript
const crypto = require('crypto');

function verifySignature(payload, signature, secret) {
  const expected = crypto
    .createHmac('sha256', secret)
    .update(JSON.stringify(payload))
    .digest('hex');
  return crypto.timingSafeEqual(
    Buffer.from(signature),
    Buffer.from(expected)
  );
}

// Verify timestamp is within 5 minutes
const now = Date.now();
const timestamp = parseInt($input.body.timestamp);
if (Math.abs(now - timestamp) > 300000) {
  throw new Error('Stale request');
}

// Verify signature
if (!verifySignature($input.body, $headers['x-gh-signature'], N8N_SIGNING_SECRET)) {
  throw new Error('Invalid signature');
}
```

## Environment Variables

| Variable | Location | Purpose |
|----------|----------|---------|
| N8N_GUARDIANHUB_BASE_URL | Supabase Edge Function secret | n8n instance URL |
| N8N_GUARDIANHUB_SIGNING_SECRET | Supabase Edge Function secret | HMAC signing key |

## Remaining Risks

1. Rate limiting per agent/user not implemented
2. Agent permission matrix not enforced (deferred to agent_registry enhancement)
3. n8n health check / circuit breaker not implemented