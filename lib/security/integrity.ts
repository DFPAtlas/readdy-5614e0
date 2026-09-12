export function isTimestampFresh(timestampMs: number, nowMs: number, toleranceMs: number): boolean {
  if (!Number.isFinite(timestampMs) || !Number.isFinite(nowMs) || !Number.isFinite(toleranceMs)) {
    return false;
  }
  if (toleranceMs < 0) return false;
  return Math.abs(nowMs - timestampMs) <= toleranceMs;
}

export class SeenNonceSet {
  private seen = new Set<string>();

  checkAndAdd(nonce: string): boolean {
    if (!nonce || nonce.length === 0) return false;
    if (this.seen.has(nonce)) return false;
    this.seen.add(nonce);
    return true;
  }
}

export function isDuplicateEvent(seenEventIds: ReadonlySet<string>, eventId: string): boolean {
  if (!eventId) return true;
  return seenEventIds.has(eventId);
}