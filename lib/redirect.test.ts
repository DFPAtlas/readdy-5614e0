import { describe, it, expect } from 'vitest';
import { isSafeRedirect, resolveRedirect, getRoleHome } from './redirect';

describe('isSafeRedirect (open-redirect protection)', () => {
  it('allows a simple internal path', () => {
    expect(isSafeRedirect('/dashboard', 'company_admin')).toBe(true);
  });

  it('rejects external http(s) URLs', () => {
    expect(isSafeRedirect('https://evil.com', 'company_admin')).toBe(false);
    expect(isSafeRedirect('http://evil.com', 'company_admin')).toBe(false);
  });

  it('rejects protocol-relative URLs', () => {
    expect(isSafeRedirect('//evil.com', 'company_admin')).toBe(false);
  });

  it('rejects javascript/data/vbscript URLs', () => {
    expect(isSafeRedirect('javascript:alert(1)', 'company_admin')).toBe(false);
    expect(isSafeRedirect('data:text/html,x', 'company_admin')).toBe(false);
    expect(isSafeRedirect('vbscript:msgbox', 'company_admin')).toBe(false);
  });

  it('rejects encoded external URLs', () => {
    expect(isSafeRedirect('https%3A%2F%2Fevil.com', 'company_admin')).toBe(false);
  });

  it('rejects unsafe auth routes', () => {
    expect(isSafeRedirect('/auth/callback', 'company_admin')).toBe(false);
    expect(isSafeRedirect('/admin', 'company_admin')).toBe(false);
  });
});

describe('resolveRedirect', () => {
  it('returns a safe next param', () => {
    expect(resolveRedirect('/dashboard/sites', 'company_admin')).toBe('/dashboard/sites');
  });

  it('falls back to the role home for unsafe destinations', () => {
    expect(resolveRedirect('https://evil.com', 'company_admin')).toBe(getRoleHome('company_admin'));
  });

  it('falls back to role home when no destination is provided', () => {
    expect(resolveRedirect(null, 'guard')).toBe(getRoleHome('guard'));
  });
});