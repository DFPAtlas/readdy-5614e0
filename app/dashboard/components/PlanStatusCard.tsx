'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/lib/auth';
import { useEntitlements } from '@/lib/useEntitlements';
import { supabase } from '@/lib/supabase';
import { isTitanOrUnlimited } from '@/lib/featureMap';

export default function PlanStatusCard() {
  const { profile, company } = useAuth();
  const { entitlements, loading: entLoading } = useEntitlements();
  const [usage, setUsage] = useState({ sites: 0, guards: 0, loaded: false });

  useEffect(() => {
    const companyId = profile?.company_id || company?.id;
    if (!companyId) return;
    let cancelled = false;
    async function load() {
      try {
        const [sitesRes, guardsRes] = await Promise.all([
          supabase.from('sites').select('id', { count: 'exact', head: true }).eq('company_id', companyId),
          supabase.from('guards').select('id', { count: 'exact', head: true }).eq('company_id', companyId).eq('status', 'active'),
        ]);
        if (cancelled) return;
        setUsage({ sites: sitesRes.count || 0, guards: guardsRes.count || 0, loaded: true });
      } catch {
        if (!cancelled) setUsage((p) => ({ ...p, loaded: true }));
      }
    }
    load();
    return () => { cancelled = true; };
  }, [profile?.company_id, company?.id]);

  if (!profile || profile.role === 'super_admin' || profile.role === 'guard') return null;

  const planName = entitlements?.planName || company?.subscription_plan || 'Unknown';
  const planSlug = entitlements?.planSlug || 'none';
  const status = company?.subscription_status || 'unknown';

  const isActive = status === 'active' || status === 'trialing';

  const maxSites = entitlements?.maxSites ?? 0;
  const maxGuards = entitlements?.maxGuards ?? 0;

  const sitesUnlimited = isTitanOrUnlimited(maxSites);
  const guardsUnlimited = isTitanOrUnlimited(maxGuards);

  const sitesAtLimit = !sitesUnlimited && usage.sites >= maxSites;
  const guardsAtLimit = !guardsUnlimited && usage.guards >= maxGuards;

  const statusColors: Record<string, string> = {
    active: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
    trialing: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
    past_due: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
    unpaid: 'bg-red-500/10 text-red-400 border-red-500/20',
    canceled: 'bg-gray-500/10 text-gray-400 border-gray-500/20',
    incomplete: 'bg-gray-500/10 text-gray-400 border-gray-500/20',
  };
  const statusColor = statusColors[status] || statusColors.incomplete;
  const statusDot = isActive ? 'bg-emerald-400' : status === 'past_due' ? 'bg-amber-400' : 'bg-red-400';

  return (
    <div className="bg-[#0f172a]/70 backdrop-blur-sm border border-white/10 rounded-xl p-5 mb-5">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center">
            <div className="w-5 h-5 flex items-center justify-center text-blue-400">
              <i className="ri-shield-star-line text-sm"></i>
            </div>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-semibold text-white">{planName}</h3>
              <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium border ${statusColor}`}>
                <span className={`w-1.5 h-1.5 rounded-full ${statusDot}`}></span>
                {status}
              </span>
            </div>
            {entLoading && (
              <p className="text-xs text-gray-500 mt-0.5">Loading plan details...</p>
            )}
          </div>
        </div>
        {isActive && planSlug !== 'titan' && (
          <Link
            href="/pricing"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-blue-600 hover:bg-blue-500 text-white transition-colors cursor-pointer whitespace-nowrap"
          >
            <div className="w-3.5 h-3.5 flex items-center justify-center">
              <i className="ri-arrow-up-line text-[10px]"></i>
            </div>
            Upgrade
          </Link>
        )}
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className={`p-3 rounded-lg ${sitesAtLimit ? 'bg-amber-500/10 border border-amber-500/20' : 'bg-white/5'}`}>
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs text-gray-400">Sites</span>
            <span className={`text-xs font-semibold ${sitesAtLimit ? 'text-amber-400' : 'text-white'}`}>
              {usage.loaded ? usage.sites : '...'}
              {!sitesUnlimited && ` / ${maxSites}`}
              {sitesUnlimited && ' (unlimited)'}
            </span>
          </div>
          {!sitesUnlimited && (
            <div className="w-full h-1.5 bg-white/10 rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full transition-all ${sitesAtLimit ? 'bg-amber-500' : 'bg-blue-500'}`}
                style={{ width: `${Math.min(100, maxSites > 0 ? (usage.sites / maxSites) * 100 : 0)}%` }}
              />
            </div>
          )}
          {sitesAtLimit && (
            <p className="text-[10px] text-amber-400 mt-1.5">Site limit reached — upgrade to add more</p>
          )}
        </div>

        <div className={`p-3 rounded-lg ${guardsAtLimit ? 'bg-amber-500/10 border border-amber-500/20' : 'bg-white/5'}`}>
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs text-gray-400">Guards</span>
            <span className={`text-xs font-semibold ${guardsAtLimit ? 'text-amber-400' : 'text-white'}`}>
              {usage.loaded ? usage.guards : '...'}
              {!guardsUnlimited && ` / ${maxGuards}`}
              {guardsUnlimited && ' (unlimited)'}
            </span>
          </div>
          {!guardsUnlimited && (
            <div className="w-full h-1.5 bg-white/10 rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full transition-all ${guardsAtLimit ? 'bg-amber-500' : 'bg-blue-500'}`}
                style={{ width: `${Math.min(100, maxGuards > 0 ? (usage.guards / maxGuards) * 100 : 0)}%` }}
              />
            </div>
          )}
          {guardsAtLimit && (
            <p className="text-[10px] text-amber-400 mt-1.5">Guard limit reached — upgrade to add more</p>
          )}
        </div>
      </div>

      {!isActive && (
        <div className="mt-3 p-3 bg-red-500/10 border border-red-500/20 rounded-lg">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 flex items-center justify-center text-red-400">
              <i className="ri-error-warning-line text-sm"></i>
            </div>
            <p className="text-xs text-red-300">
              Your subscription is {status}. Some features may be restricted.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}