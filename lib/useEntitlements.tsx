'use client';

import { useState, useEffect, useCallback } from 'react';
import { useAuth } from './auth';
import { getCompanyEntitlements, clearEntitlementsCache, PlanEntitlements } from './entitlements';
import Link from 'next/link';

export function useEntitlements() {
  const { companyId: authCompanyId } = useAuth();
  const [entitlements, setEntitlements] = useState<PlanEntitlements | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!authCompanyId) {
      setEntitlements(null);
      setLoading(false);
      return;
    }
    let cancelled = false;
    setLoading(true);
    getCompanyEntitlements(authCompanyId).then((ents) => {
      if (!cancelled) {
        setEntitlements(ents);
        setLoading(false);
      }
    }).catch(() => {
      if (!cancelled) {
        setEntitlements(null);
        setLoading(false);
      }
    });
    return () => { cancelled = true; };
  }, [authCompanyId]);

  const canAccess = useCallback((feature: keyof PlanEntitlements): boolean => {
    if (!entitlements) return false;
    const val = entitlements[feature];
    if (typeof val === 'boolean') return val;
    if (typeof val === 'number') return val > 0;
    return false;
  }, [entitlements]);

  const refresh = useCallback(() => {
    if (!authCompanyId) return;
    clearEntitlementsCache();
    setLoading(true);
    setEntitlements(null);
    getCompanyEntitlements(authCompanyId).then((ents) => {
      setEntitlements(ents);
      setLoading(false);
    }).catch(() => {
      setLoading(false);
    });
  }, [authCompanyId]);

  return { entitlements, loading, canAccess, refresh };
}

interface FeatureGateProps {
  feature: keyof PlanEntitlements;
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

export function FeatureGate({ feature, children, fallback }: FeatureGateProps) {
  const { canAccess, loading } = useEntitlements();

  if (loading) return null;
  if (canAccess(feature)) return <>{children}</>;

  if (fallback) return <>{fallback}</>;

  return (
    <div className="p-8 text-center rounded-xl border border-amber-500/20 bg-amber-500/5">
      <div className="w-12 h-12 flex items-center justify-center rounded-full bg-amber-500/10 border border-amber-500/20 mx-auto mb-3">
        <i className="ri-lock-line text-xl text-amber-400" />
      </div>
      <h3 className="text-gray-900 dark:text-white font-semibold mb-1">Premium Feature</h3>
      <p className="text-gray-500 dark:text-gray-400 text-sm mb-4">This feature requires a Command or Titan plan.</p>
      <Link
        href="/pricing"
        className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-medium bg-blue-600 hover:bg-blue-700 text-white transition-all cursor-pointer whitespace-nowrap"
      >
        <span className="w-4 h-4 flex items-center justify-center">
          <i className="ri-arrow-up-line text-sm" />
        </span>
        Upgrade Plan
      </Link>
    </div>
  );
}