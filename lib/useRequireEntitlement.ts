'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from './auth';
import { useEntitlements } from './useEntitlements';
import type { PlanEntitlements } from './entitlements';

export function useRequireEntitlement(feature: keyof PlanEntitlements) {
  const { profile, isLoading: authLoading } = useAuth();
  const { canAccess, loading: entLoading } = useEntitlements();
  const router = useRouter();
  const [redirected, setRedirected] = useState(false);

  const isSuperAdmin = profile?.role === 'super_admin';
  const allowed = isSuperAdmin || canAccess(feature);
  const loading = authLoading || entLoading;

  useEffect(() => {
    if (loading || redirected) return;
    if (!authLoading && !profile) {
      setRedirected(true);
      router.push('/login');
      return;
    }
    if (!isSuperAdmin && !canAccess(feature)) {
      setRedirected(true);
      router.push('/pricing');
    }
  }, [loading, isSuperAdmin, canAccess, feature, profile, authLoading, router, redirected]);

  return { allowed, loading, redirecting: redirected };
}