'use client';

import { useMemo } from 'react';
import type { ShiftWarning } from '@/app/rotas/hooks/useRotaEngine';

interface RotaWarningBarProps {
  counts: {
    unassigned: number;
    conflicts: number;
    overtime: number;
    leave: number;
    unavailable: number;
    pending_leave?: number;
  };
  criticalCount: number;
  onFilterClick?: (type: string | null) => void;
  activeFilter: string | null;
}

export default function RotaWarningBar({ counts, criticalCount, onFilterClick, activeFilter }: RotaWarningBarProps) {
  const items = useMemo(() => {
    const list = [];
    if (counts.unassigned > 0) {
      list.push({ key: 'unassigned', label: 'Unassigned', count: counts.unassigned, color: 'text-amber-400 bg-amber-500/10 border-amber-500/20', icon: 'ri-user-unfollow-line' });
    }
    if (counts.conflicts > 0) {
      list.push({ key: 'conflict', label: 'Conflicts', count: counts.conflicts, color: 'text-red-400 bg-red-500/10 border-red-500/20', icon: 'ri-error-warning-line' });
    }
    if (counts.overtime > 0) {
      list.push({ key: 'overtime', label: 'Overtime', count: counts.overtime, color: 'text-orange-400 bg-orange-500/10 border-orange-500/20', icon: 'ri-time-line' });
    }
    if (counts.pending_leave && counts.pending_leave > 0) {
      list.push({ key: 'pending_leave', label: 'Pending Leave', count: counts.pending_leave, color: 'text-amber-400 bg-amber-500/10 border-amber-500/20', icon: 'ri-calendar-close-line' });
    }
    if (counts.unavailable > 0) {
      list.push({ key: 'unavailable', label: 'Unavailable', count: counts.unavailable, color: 'text-gray-400 bg-gray-700/40 border-gray-600/30', icon: 'ri-forbid-line' });
    }
    return list;
  }, [counts]);

  if (items.length === 0) {
    return (
      <div className="flex items-center gap-2 px-4 py-2.5 bg-emerald-500/10 border border-emerald-500/20 rounded-lg">
        <div className="w-4 h-4 flex items-center justify-center text-emerald-400">
          <i className="ri-check-double-line"></i>
        </div>
        <span className="text-sm text-emerald-400 font-medium">All clear — no issues detected</span>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2 flex-wrap">
      {items.map((item) => (
        <button
          key={item.key}
          onClick={() => onFilterClick?.(activeFilter === item.key ? null : item.key)}
          className={`inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border text-xs font-medium cursor-pointer whitespace-nowrap transition-all ${
            activeFilter === item.key
              ? item.color.replace('border-', 'border-2 ')
              : item.color + ' hover:brightness-125'
          }`}
        >
          <div className="w-3.5 h-3.5 flex items-center justify-center">
            <i className={item.icon}></i>
          </div>
          <span>{item.label}</span>
          <span className="font-bold">{item.count}</span>
        </button>
      ))}
      {criticalCount > 0 && (
        <div className="ml-auto flex items-center gap-1.5 text-xs text-red-400">
          <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></div>
          {criticalCount} critical issue{criticalCount > 1 ? 's' : ''} need attention
        </div>
      )}
    </div>
  );
}