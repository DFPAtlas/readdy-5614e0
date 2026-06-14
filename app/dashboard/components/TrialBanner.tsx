'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import Link from 'next/link';

export default function TrialBanner({ companyId }: { companyId: string | null }) {
  const [daysLeft, setDaysLeft] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!companyId) {
      setLoading(false);
      return;
    }

    let cancelled = false;

    async function checkTrial() {
      const { data } = await supabase
        .from('companies')
        .select('subscription_plan, subscription_status, subscription_period_end')
        .eq('id', companyId)
        .maybeSingle();

      if (cancelled) return;

      if (
        data?.subscription_plan === 'sentinel-starter' &&
        data?.subscription_status === 'trialing' &&
        data?.subscription_period_end
      ) {
        const now = new Date();
        const end = new Date(data.subscription_period_end);
        const diff = Math.max(0, Math.ceil((end.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)));
        setDaysLeft(diff);
      }

      setLoading(false);
    }

    checkTrial();

    const interval = setInterval(checkTrial, 1000 * 60 * 30);
    return () => {
      cancelled = true;
      clearInterval(interval);
    };
  }, [companyId]);

  if (loading || daysLeft === null || daysLeft <= 0) return null;

  const isUrgent = daysLeft <= 3;

  return (
    <div
      className={`flex items-center justify-between px-4 lg:px-6 py-2.5 text-sm ${
        isUrgent
          ? 'bg-amber-950/60 border-b border-amber-500/30'
          : 'bg-blue-950/40 border-b border-blue-500/20'
      }`}
    >
      <div className="flex items-center gap-2.5">
        <span className={`w-5 h-5 flex items-center justify-center ${isUrgent ? 'text-amber-400' : 'text-blue-400'}`}>
          <i className={`${isUrgent ? 'ri-timer-flash-line' : 'ri-timer-line'}`}></i>
        </span>
        <span className="text-gray-300">
          {isUrgent ? (
            <>
              Your free trial ends in{' '}
              <span className="text-amber-400 font-bold">{daysLeft} {daysLeft === 1 ? 'day' : 'days'}</span>
            </>
          ) : (
            <>
              <span className="text-blue-400 font-bold">{daysLeft} {daysLeft === 1 ? 'day' : 'days'}</span> remaining on your Sentinel Starter trial
            </>
          )}
        </span>
      </div>
      <Link
        href="/pricing"
        className={`shrink-0 px-4 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer whitespace-nowrap ${
          isUrgent
            ? 'bg-amber-600 hover:bg-amber-500 text-white'
            : 'bg-blue-600 hover:bg-blue-500 text-white'
        }`}
      >
        Upgrade Now
      </Link>
    </div>
  );
}