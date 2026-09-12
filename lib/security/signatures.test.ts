import { describe, it, expect } from 'vitest';
import {
  hmacSha256Hex,
  verifyHmacHex,
  buildStripeSignature,
  verifyStripeSignature,
  parseStripeSignature,
} from './signatures';

const SECRET = 'whsec_test_secret';

describe('HMAC-SHA256 signature verification (agent proxy / n8n callback scheme)', () => {
  const payload = JSON.stringify({ agent_key: 'shift-reminder', company_id: 'abc-123' });
  const sig = hmacSha256Hex(payload, SECRET);

  it('accepts a valid signature', () => {
    expect(verifyHmacHex(payload, sig, SECRET)).toBe(true);
  });

  it('rejects a tampered payload', () => {
    expect(verifyHmacHex(`${payload}x`, sig, SECRET)).toBe(false);
  });

  it('rejects a wrong secret', () => {
    expect(verifyHmacHex(payload, sig, 'wrong-secret')).toBe(false);
  });

  it('rejects a non-hex signature', () => {
    expect(verifyHmacHex(payload, 'not-hex!!', SECRET)).toBe(false);
  });

  it('rejects a wrong-length signature', () => {
    expect(verifyHmacHex(payload, 'deadbeef', SECRET)).toBe(false);
  });
});

describe('Stripe webhook signature verification', () => {
  const body = JSON.stringify({ id: 'evt_123', type: 'invoice.paid' });
  const ts = '1699999999';
  const header = buildStripeSignature(body, ts, SECRET);

  it('builds a parseable t,v1 header', () => {
    const parsed = parseStripeSignature(header);
    expect(parsed?.timestamp).toBe(ts);
    expect(parsed?.signature).toBeTruthy();
  });

  it('accepts a valid signature', () => {
    expect(verifyStripeSignature(body, header, SECRET)).toBe(true);
  });

  it('rejects a tampered body', () => {
    expect(verifyStripeSignature(`${body}x`, header, SECRET)).toBe(false);
  });

  it('rejects a wrong secret', () => {
    expect(verifyStripeSignature(body, header, 'other-secret')).toBe(false);
  });

  it('rejects a missing or malformed header', () => {
    expect(verifyStripeSignature(body, '', SECRET)).toBe(false);
    expect(verifyStripeSignature(body, 'garbage', SECRET)).toBe(false);
  });
});