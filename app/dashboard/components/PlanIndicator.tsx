'use client';

import Link from 'next/link';
import { useAuth } from '@/lib/auth';

const planBadgeStyles: Record<string, { bg: string; border: string; text: string; dot: string }> = {
  'sentinel-starter': {
    bg: 'bg-gray-800/60',
    border: 'border-gray-600/40',
    text: 'text-gray-300',
    dot: 'bg-gray-400',
  },
  sentinel: {
    bg: 'bg-gray-800/60',
    border: 'border-gray-500/40',
    text: 'text-gray-200',
    dot: 'bg-gray-300',
  },
  command: {
    bg: 'bg-blue-900/40',
    border: 'border-blue-500/30',
    text: 'text-blue-300',
    dot: 'bg-blue-400',
  },
  titan: {
    bg: 'bg-amber-900/40',
    border: 'border-amber-500/30',
    text: 'text-amber-300',
    dot: 'bg-amber-400',
  },
};

const planShortNames: Record<string, string> = {
  'sentinel-starter': 'Starter',
  sentinel: 'Sentinel',
  command: 'Command',
  titan: 'Titan',
};

export default function PlanIndicator() {
  const { profile, company } = useAuth();

  if (!profile || !company) return null;
  if (profile.role === 'super_admin' || profile.role === 'guard' || profile.role === 'client') return null;

  const planSlug = company.subscription_plan || 'unknown';
  const status = company.subscription_status;
  const isActive = status === 'active' || status === 'trialing';

  const styles = planBadgeStyles[planSlug] || planBadgeStyles.sentinel;
  const displayName = company.plan_name || planShortNames[planSlug] || planSlug;

  return (
    <Link
      href="/dashboard/settings"
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full border text-[11px] font-semibold transition-all cursor-pointer whitespace-nowrap hover:brightness-110 ${styles.bg} ${styles.border} ${styles.text}`}
    >
      <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${isActive ? styles.dot : 'bg-red-400'}`} />
      {displayName}
      {!isActive && (
        <span className="text-red-300 ml-0.5">— inactive</span>
      )}
    </Link>
  );
}