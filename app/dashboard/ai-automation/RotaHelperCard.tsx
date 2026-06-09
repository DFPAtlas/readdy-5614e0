'use client';

import { useEffect, useMemo } from 'react';
import Link from 'next/link';
import { useAuth } from '@/lib/auth';
import { startOfWeek, endOfWeek } from 'date-fns';
import { useAIRotaActivity } from '@/lib/useAIRotaActivity';

export default function RotaHelperCard() {
  const { companyId } = useAuth();
  const weekStart = useMemo(() => startOfWeek(new Date(), { weekStartsOn: 1 }), []);
  const weekEnd = useMemo(() => endOfWeek(new Date(), { weekStartsOn: 1 }), []);
  const { stats, fetchStats } = useAIRotaActivity();

  useEffect(() => {
    if (!companyId) return;
    fetchStats(companyId, weekStart, weekEnd);
  }, [companyId, weekStart, weekEnd, fetchStats]);

  const {
    openShifts,
    conflicts,
    overtimeWarnings,
    sickCoverSuggestions,
    pendingSuggestions,
    actionsThisWeek,
    loading,
  } = stats;

  const status: 'Active' | 'Needs Review' | 'Disabled' =
    openShifts > 0 || conflicts > 0 || pendingSuggestions > 0 ? 'Needs Review' : 'Active';

  const statusColor =
    status === 'Active'
      ? 'bg-emerald-500/15 text-emerald-400 border-emerald-500/25'
      : 'bg-amber-500/15 text-amber-400 border-amber-500/25';

  const badgeCount = openShifts + conflicts + pendingSuggestions;
  const badgeColor = conflicts > 0 || sickCoverSuggestions > 0 ? 'bg-red-500/20 text-red-400' : 'bg-amber-500/20 text-amber-400';

  const metrics = [
    { label: 'Open Shifts', value: openShifts, icon: 'ri-calendar-todo-line', color: openShifts > 0 ? 'text-amber-400' : 'text-gray-400' },
    { label: 'Rota Conflicts', value: conflicts, icon: 'ri-error-warning-line', color: conflicts > 0 ? 'text-red-400' : 'text-gray-400' },
    { label: 'Overtime Warnings', value: overtimeWarnings, icon: 'ri-time-line', color: overtimeWarnings > 0 ? 'text-orange-400' : 'text-gray-400' },
    { label: 'Sick Cover Suggestions', value: sickCoverSuggestions, icon: 'ri-first-aid-kit-line', color: sickCoverSuggestions > 0 ? 'text-blue-400' : 'text-gray-400' },
    { label: 'Draft AI Suggestions', value: pendingSuggestions, icon: 'ri-bard-line', color: pendingSuggestions > 0 ? 'text-violet-400' : 'text-gray-400' },
    { label: 'Actions This Week', value: actionsThisWeek, icon: 'ri-bar-chart-line', color: actionsThisWeek > 0 ? 'text-cyan-400' : 'text-gray-400' },
  ];

  return (
    <div className="bg-[#111827] border border-gray-800 rounded-xl p-5 flex flex-col gap-4 hover:border-violet-500/30 transition-colors">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-violet-500/15 flex items-center justify-center flex-shrink-0">
            <div className="w-6 h-6 flex items-center justify-center text-violet-400">
              <i className="ri-calendar-event-line text-lg"></i>
            </div>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs text-gray-500 font-medium uppercase tracking-wider">Module 6</span>
              {badgeCount > 0 && (
                <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${badgeColor}`}>
                  {badgeCount}
                </span>
              )}
            </div>
            <h3 className="text-base font-semibold text-white leading-tight">AI Rota Helper</h3>
          </div>
        </div>
        <span className={`text-[11px] font-medium px-2 py-1 rounded-full border whitespace-nowrap ${statusColor}`}>
          {status}
        </span>
      </div>

      <p className="text-xs text-gray-500 leading-relaxed">
        Intelligent rota scheduling — auto-fills open shifts, detects conflicts, manages sick cover, and balances overtime across your guard team.
      </p>

      <div className="grid grid-cols-1 gap-2">
        {metrics.map((m) => (
          <div key={m.label} className="flex items-center justify-between py-1.5 border-b border-gray-800/60 last:border-0">
            <div className="flex items-center gap-2">
              <div className={`w-4 h-4 flex items-center justify-center ${m.color}`}>
                <i className={`${m.icon} text-xs`}></i>
              </div>
              <span className="text-xs text-gray-400">{m.label}</span>
            </div>
            <span className={`text-sm font-semibold ${m.color}`}>
              {loading && m.value === 0 ? (
                <span className="inline-block w-3 h-3 border border-gray-600 border-t-gray-300 rounded-full animate-spin"></span>
              ) : (
                m.value
              )}
            </span>
          </div>
        ))}
      </div>

      <div className="flex items-center gap-2 pt-1">
        <Link
          href="/rotas"
          className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-violet-600 hover:bg-violet-500 text-white text-sm font-medium transition-colors cursor-pointer whitespace-nowrap"
        >
          <div className="w-4 h-4 flex items-center justify-center">
            <i className="ri-calendar-event-line text-sm"></i>
          </div>
          Open Rota Module
        </Link>
        <Link
          href="/rotas"
          className="px-3 py-2.5 rounded-lg border border-gray-700 text-gray-400 hover:text-white hover:border-gray-600 text-sm transition-colors cursor-pointer whitespace-nowrap"
          title="AI Tools"
        >
          <div className="w-4 h-4 flex items-center justify-center">
            <i className="ri-bard-line text-sm"></i>
          </div>
        </Link>
      </div>
    </div>
  );
}