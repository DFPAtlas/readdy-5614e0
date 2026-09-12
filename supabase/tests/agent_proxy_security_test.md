# Agent Proxy Security Tests — GuardianHub Phase 1B

## Manual API Testing Guide

### Prerequisites

Get a valid JWT token for an authenticated user.

### Test 1: No Auth → 401

```bash
curl -s -X POST "https://[project].supabase.co/functions/v1/guardianhub-agent-proxy" \
  -H "Content-Type: application/json" \
  -d '{"agent_key":"test"}' | jq .
```
Expected: `{"error":"Authentication required"}` (401)

### Test 2: Invalid Agent → 404

```bash
curl -s -X POST "https://[project].supabase.co/functions/v1/guardianhub-agent-proxy" \
  -H "Authorization: Bearer [token]" \
  -H "Content-Type: application/json" \
  -d '{"agent_key":"nonexistent-agent-xyz"}' | jq .
```
Expected: `{"error":"Agent \"nonexistent-agent-xyz\" not found or inactive"}` (404)

### Test 3: Missing agent_key → 400

```bash
curl -s -X POST "https://[project].supabase.co/functions/v1/guardianhub-agent-proxy" \
  -H "Authorization: Bearer [token]" \
  -H "Content-Type: application/json" \
  -d '{"payload":{"test":true}}' | jq .
```
Expected: `{"error":"agent_key is required"}` (400)

### Test 4: Oversized Payload → 413

```bash
LARGE_PAYLOAD=$(python3 -c "print('x' * 2000000)")
curl -s -X POST "https://[project].supabase.co/functions/v1/guardianhub-agent-proxy" \
  -H "Authorization: Bearer [token]" \
  -H "Content-Type: application/json" \
  -d "{\"agent_key\":\"test\",\"payload\":{\"data\":\"$LARGE_PAYLOAD\"}}" | jq .
```
Expected: `{"error":"Payload too large"}` (413)

### Test 5: Internal URLs Not Leaked on Error

When an agent execution fails, the response should NOT contain:
- n8n webhook URL
- Internal Supabase URL
- Stack traces
- Raw n8n error details

### Test 6: Execution Logs Created

After a successful agent execution, verify in Supabase:
```sql
SELECT * FROM agent_execution_logs ORDER BY created_at DESC LIMIT 5;
```
Expected: Log entry with user_id, company_id, agent_key, status, timing

### Test 7: Cross-Company Agent Access (Security Check)

A user from Company A should not be able to trigger an agent that belongs to Company B.
This is enforced through agent_registry policies and company context from the JWT.