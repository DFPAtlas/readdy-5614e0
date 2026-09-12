import { createHmac, timingSafeEqual } from 'node:crypto';

export function hmacSha256Hex(payload: string, secret: string): string {
  return createHmac('sha256', secret).update(payload).digest('hex');
}

export function verifyHmacHex(payload: string, signatureHex: string, secret: string): boolean {
  if (!signatureHex || !/^[0-9a-fA-F]+$/.test(signatureHex)) return false;
  const expected = hmacSha256Hex(payload, secret);
  const expectedBytes = Buffer.from(expected, 'hex');
  const providedBytes = Buffer.from(signatureHex, 'hex');
  if (expectedBytes.length !== providedBytes.length) return false;
  return timingSafeEqual(expectedBytes, providedBytes);
}

export interface StripeSignatureParts {
  timestamp: string;
  signature: string;
}

export function parseStripeSignature(header: string): StripeSignatureParts | null {
  if (!header) return null;
  const parts: Record<string, string> = {};
  for (const pair of header.split(',')) {
    const eq = pair.indexOf('=');
    if (eq === -1) continue;
    parts[pair.slice(0, eq).trim()] = pair.slice(eq + 1).trim();
  }
  if (!parts.t || !parts.v1) return null;
  return { timestamp: parts.t, signature: parts.v1 };
}

export function buildStripeSignature(body: string, timestamp: string, secret: string): string {
  const signedPayload = `${timestamp}.${body}`;
  return `t=${timestamp},v1=${hmacSha256Hex(signedPayload, secret)}`;
}

export function verifyStripeSignature(body: string, header: string, secret: string): boolean {
  const parsed = parseStripeSignature(header);
  if (!parsed) return false;
  const signedPayload = `${parsed.timestamp}.${body}`;
  return verifyHmacHex(signedPayload, parsed.signature, secret);
}