import { describe, it, expect } from 'vitest';
import { checkAccountAccess, isAccessDenied, getStatusMessage } from './accountStatus';

describe('checkAccountAccess (tenant account status authorisation)', () => {
  it('denies suspended users', () => {
    const r = checkAccountAccess('suspended', 'active');
    expect(r.allowed).toBe(false);
    expect(r.redirectTo).toContain('suspended');
  });

  it('denies removed users', () => {
    const r = checkAccountAccess('removed', 'active');
    expect(r.allowed).toBe(false);
    expect(r.redirectTo).toContain('removed');
  });

  it('denies users with no status', () => {
    expect(checkAccountAccess(null, 'active').allowed).toBe(false);
  });

  it('allows active users on an active company', () => {
    expect(checkAccountAccess('active', 'active').allowed).toBe(true);
  });

  it('allows active users on trial / past_due companies', () => {
    expect(checkAccountAccess('active', 'trial').allowed).toBe(true);
    expect(checkAccountAccess('active', 'past_due').allowed).toBe(true);
  });

  it('denies active users on a suspended company', () => {
    expect(checkAccountAccess('active', 'suspended').allowed).toBe(false);
  });
});

describe('isAccessDenied', () => {
  it('flags suspended and removed statuses', () => {
    expect(isAccessDenied('suspended')).toBe(true);
    expect(isAccessDenied('removed')).toBe(true);
    expect(isAccessDenied('active')).toBe(false);
  });
});

describe('getStatusMessage', () => {
  it('returns a human message for suspended accounts', () => {
    expect(getStatusMessage('suspended')).toContain('suspended');
  });
});