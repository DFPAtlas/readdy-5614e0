'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

interface TrialBannerProps {
  trialEndsAt: string | null;
  companyName: string | null;
}

export default function TrialBanner({ trialEndsAt, companyName }: TrialBannerProps) {
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    const key = 'trial_banner_dismissed';
    const val = localStorage.getItem(key);
    if (val) {
      const dismissedAt = new Date(val);
      const now = new Date();
      const hoursSince = (now.getTime() - dismissedAt.getTime()) / (1000 * 60 * 60);
      if (hoursSince < 24) setDismissed(true);
    }
  }, []);

  const handleDismiss = () => {
    localStorage.setItem('trial_banner_dismissed', new Date().toISOString());
    setDismissed(true);
  };

  if (!trialEndsAt || dismissed) return null;

  const end = new Date(trialEndsAt);
  const now = new Date();
  const diffMs = end.getTime() - now.getTime();
  const daysLeft = Math.ceil(diffMs / (1000 * 60 * 60 * 24));

  if (daysLeft <= 0) {
    return (
      <div className="mb-5 p-4 bg-red-500/10 border border-red-500/30 rounded-lg flex items-start gap-3">
        <div className="w-9 h-9 shrink-0 rounded-lg bg-red-500/20 flex items-center justify-center">
          <i className="ri-time-line text-red-400" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-red-400">
            {companyName ? `${companyName}'s trial has ended` : 'Your trial has ended'}
          </p>
          <p className="text-xs text-red-400/70 mt-0.5">
            Upgrade now to keep full access to all features, sites, and guard data.
          </p>
        </div>
        <Link
          href="/dashboard/settings?tab=billing"
          className="shrink-0 bg-red-600 hover:bg-red-500 text-white text-xs font-medium px-4 py-2 rounded-lg transition-colors whitespace-nowrap cursor-pointer"
        >
          Upgrade Now
        </Link>
        <button
          onClick={handleDismiss}
          className="shrink-0 w-8 h-8 flex items-center justify-center rounded-lg hover:bg-white/5 text-red-400/60 hover:text-red-400 transition-colors cursor-pointer"
        >
          <i className="ri-close-line" />
        </button>
      </div>
    );
  }

  if (daysLeft > 7) return null;

  const urgency = daysLeft <= 3 ? 'high' : daysLeft <= 5 ? 'medium' : 'low';
  const colors = {
    high: { bg: 'bg-red-500/10', border: 'border-red-500/30', icon: 'text-red-400', iconBg: 'bg-red-500/20', text: 'text-red-400', sub: 'text-red-400/70', btn: 'bg-red-600 hover:bg-red-500' },
    medium: { bg: 'bg-amber-500/10', border: 'border-amber-500/30', icon: 'text-amber-400', iconBg: 'bg-amber-500/20', text: 'text-amber-400', sub: 'text-amber-400/70', btn: 'bg-amber-600 hover:bg-amber-500' },
    low: { bg: 'bg-blue-500/10', border: 'border-blue-500/30', icon: 'text-blue-400', iconBg: 'bg-blue-500/20', text: 'text-blue-400', sub: 'text-blue-400/70', btn: 'bg-blue-600 hover:bg-blue-500' },
  }[urgency];

  return (
    <div className={`mb-5 p-4 ${colors.bg} border ${colors.border} rounded-lg flex items-start gap-3`}>
      <div className={`w-9 h-9 shrink-0 rounded-lg ${colors.iconBg} flex items-center justify-center`}>
        <i className={`ri-time-line ${colors.icon}`} />
      </div>
      <div className="flex-1 min-w-0">
        <p className={`text-sm font-medium ${colors.text}`}>
          {companyName ? `${companyName}'s trial ends in ${daysLeft} day${daysLeft === 1 ? '' : 's'}` : `Trial ends in ${daysLeft} day${daysLeft === 1 ? '' : 's'}`}
        </p>
        <p className={`text-xs ${colors.sub} mt-0.5`}>
          Upgrade before your trial expires to keep full access to all features, sites, and guard data.
        </p>
      </div>
      <Link
        href="/dashboard/settings?tab=billing"
        className={`shrink-0 ${colors.btn} text-white text-xs font-medium px-4 py-2 rounded-lg transition-colors whitespace-nowrap cursor-pointer`}
      >
        Upgrade Now
      </Link>
      <button
        onClick={handleDismiss}
        className="shrink-0 w-8 h-8 flex items-center justify-center rounded-lg hover:bg-white/5 text-gray-400 hover:text-gray-300 transition-colors cursor-pointer"
      >
        <i className="ri-close-line" />
      </button>
    </div>
  );
}