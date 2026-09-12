'use client';

import { environment, isProduction } from '@/lib/env';

export default function EnvironmentBadge() {
  if (isProduction) return null;

  const label = environment === 'staging' ? 'STAGING' : 'LOCAL DEV';
  const pill = environment === 'staging'
    ? 'bg-amber-500/90 text-amber-950'
    : 'bg-fuchsia-500/90 text-fuchsia-950';

  return (
    <div className="fixed bottom-3 left-3 z-[9998] pointer-events-none">
      <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[11px] font-bold tracking-wide shadow-lg ${pill}`}>
        <span className="w-1.5 h-1.5 rounded-full bg-current animate-pulse" />
        {label}
      </span>
    </div>
  );
}