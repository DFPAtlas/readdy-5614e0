'use client';

import React from 'react';
import { usePanicMode } from './PanicModeContext';

interface SpotlightCardProps {
  children: React.ReactNode;
  className?: string;
  severity?: 'critical' | 'high' | 'medium' | 'low';
}

const glowColors: Record<string, string> = {
  critical: 'ring-red-500/50 shadow-red-500/20',
  high: 'ring-orange-500/50 shadow-orange-500/20',
  medium: 'ring-amber-500/40 shadow-amber-500/15',
  low: 'ring-blue-500/40 shadow-blue-500/15',
};

export default function SpotlightCard({ children, className = '', severity = 'critical' }: SpotlightCardProps) {
  const { panicMode } = usePanicMode();

  if (!panicMode) {
    return <div className={className}>{children}</div>;
  }

  const glow = glowColors[severity] || glowColors.critical;

  return (
    <div
      className={`${className} relative z-50 scale-[1.02] transition-transform duration-500 ring-2 ${glow} shadow-[0_0_40px_rgba(239,68,68,0.15)] animate-spotlight-pulse bg-[#0f172a]/95 backdrop-blur-sm rounded-xl`}
    >
      <div className="absolute -top-2 left-4 px-2 py-0.5 bg-red-500 text-white text-[10px] font-bold uppercase tracking-wider rounded">
        Active Alert
      </div>
      {children}
    </div>
  );
}