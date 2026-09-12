import { describe, it, expect } from 'vitest';
import { isTimestampFresh, SeenNonceSet, isDuplicateEvent } from './integrity';

describe('isTimestampFresh (n8n callback replay window)', () => {
  const TOLERANCE = 5 * 60 * 1000;

  it('accepts a timestamp at the boundary', () => {
    expect(isTimestampFresh(1_000_000, 1_000_000 + TOLERANCE, TOLERANCE)).toBe(true);
    expect(isTimestampFresh(1_000_000, 1_000_000, TOLERANCE)).toBe(true);
  });

  it('rejects a stale timestamp', () => {
    expect(isTimestampFresh(1_000_000, 1_000_000 + TOLERANCE + 1, TOLERANCE)).toBe(false);
  });

  it('rejects a future timestamp beyond tolerance', () => {
    expect(isTimestampFresh(1_000_000 + TOLERANCE + 1, 1_000_000, TOLERANCE)).toBe(false);
  });

  it('rejects non-finite input', () => {
    expect(isTimestampFresh(Number.NaN, 1_000_000, TOLERANCE)).toBe(false);
    expect(isTimestampFresh(1_000_000, Number.NaN, TOLERANCE)).toBe(false);
  });
});

describe('SeenNonceSet (n8n nonce replay rejection)', () => {
  it('accepts a nonce the first time', () => {
    const s = new SeenNonceSet();
    expect(s.checkAndAdd('nonce-1')).toBe(true);
  });

  it('rejects a replayed nonce', () => {
    const s = new SeenNonceSet();
    s.checkAndAdd('nonce-1');
    expect(s.checkAndAdd('nonce-1')).toBe(false);
  });

  it('rejects an empty nonce', () => {
    expect(new SeenNonceSet().checkAndAdd('')).toBe(false);
  });
});

describe('isDuplicateEvent (Stripe webhook idempotency)', () => {
  it('returns false for an unseen event id', () => {
    expect(isDuplicateEvent(new Set(['evt_1']), 'evt_2')).toBe(false);
  });

  it('returns true for an already-processed event id', () => {
    expect(isDuplicateEvent(new Set(['evt_1']), 'evt_1')).toBe(true);
  });

  it('treats a missing event id as already-processed (never process)', () => {
    expect(isDuplicateEvent(new Set<string>(), '')).toBe(true);
  });
});