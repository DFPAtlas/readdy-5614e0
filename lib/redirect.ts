'use client';

import type { UserRole } from '@/lib/types';

const ROLE_HOME: Record<UserRole, string> = {
  super_admin: '/admin',
  company_admin: '/dashboard',
  operations_manager: '/dashboard',
  guard: '/guard',
  client: '/client',
};

const ROLE_LOGIN: Record<UserRole, string> = {
  super_admin: '/login',
  company_admin: '/login',
  operations_manager: '/login',
  guard: '/login/guard',
  client: '/login/client',
};

const BLOCKED_REDIRECT_PREFIXES = [
  'https:',
  'http:',
  '//',
  'javascript:',
  'data:',
  'vbscript:',
];

const UNSAFE_REDIRECT_ROUTES = [
  '/auth/callback',
  '/setup-super-admin',
  '/admin',
  '/super-admin',
];

export function getRoleHome(role: UserRole | null): string {
  if (!role) return '/login';
  return ROLE_HOME[role] || '/login';
}

export function getRoleLogin(role: UserRole | null): string {
  if (!role) return '/login';
  return ROLE_LOGIN[role] || '/login';
}

export function isInternalRoute(path: string): boolean {
  return path.startsWith('/') && !path.startsWith('//');
}

export function isSafeRedirect(destination: string, role: UserRole | null): boolean {
  if (!destination || typeof destination !== 'string') return false;

  const trimmed = destination.trim().toLowerCase();

  for (const prefix of BLOCKED_REDIRECT_PREFIXES) {
    if (trimmed.startsWith(prefix)) return false;
  }

  if (!isInternalRoute(trimmed)) return false;

  let decoded = trimmed;
  try {
    decoded = decodeURIComponent(trimmed);
    if (decoded !== trimmed) {
      for (const prefix of BLOCKED_REDIRECT_PREFIXES) {
        if (decoded.toLowerCase().startsWith(prefix)) return false;
      }
    }
  } catch {
    return false;
  }

  for (const unsafe of UNSAFE_REDIRECT_ROUTES) {
    if (trimmed === unsafe || trimmed.startsWith(unsafe + '/') || trimmed.startsWith(unsafe + '?')) {
      return false;
    }
  }

  return true;
}

export function resolveRedirect(
  nextParam: string | null | undefined,
  role: UserRole | null,
  fallback?: string
): string {
  if (nextParam && isSafeRedirect(nextParam, role)) {
    return nextParam;
  }
  if (fallback && isSafeRedirect(fallback, role)) {
    return fallback;
  }
  return getRoleHome(role);
}

export function getOnboardingRoute(
  role: UserRole | null,
  onboardingStatus: string | null | undefined
): string | null {
  if (role === 'super_admin') return null;
  if (role === 'guard') return null;
  if (role === 'client') return null;
  if (onboardingStatus && onboardingStatus !== 'completed') {
    return '/dashboard/setup-wizard';
  }
  return null;
}