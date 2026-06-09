'use client';

import Link from 'next/link';
import { useState, useEffect, useRef } from 'react';
import type { GuardOnShift, MissingGuard } from '@/lib/dashboardFetch';

interface GuardStatusWidgetProps {
  guardsOnShift: GuardOnShift[];
  missingGuards: MissingGuard[];
  totalActive: number;
}

const statusConfig = {
  on_time: { dot: 'bg-emerald-500', label: 'On time', text: 'text-emerald-400', bg: 'bg-emerald-500/10' },
  late: { dot: 'bg-amber-500', label: 'Late', text: 'text-amber-400', bg: 'bg-amber-500/10' },
  critical_late: { dot: 'bg-red-500', label: 'Critical late', text: 'text-red-400', bg: 'bg-red-500/10' },
};

function timeAgo(iso: string): string {
  const diff = Math.floor((Date.now() - new Date(iso).getTime()) / 1000);
  if (diff < 60) return 'Just now';
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  return `${Math.floor(diff / 3600)}h ago`;
}

function formatShiftTime(iso: string): string {
  return new Date(iso).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' });
}

export default function GuardStatusWidget({ guardsOnShift, missingGuards, totalActive }: GuardStatusWidgetProps) {
  const [tab, setTab] = useState<'active' | 'missing'>('active');
  const [animatedIds, setAnimatedIds] = useState<Set<string>>(new Set());
  const prevCountRef = useRef(guardsOnShift.length);

  useEffect(() => {
    if (guardsOnShift.length > prevCountRef.current) {
      const newIds = guardsOnShift.slice(0, guardsOnShift.length - prevCountRef.current).map((g) => g.id);
      setAnimatedIds(new Set(newIds));
      const timer = setTimeout(() => setAnimatedIds(new Set()), 2000);
      prevCountRef.current = guardsOnShift.length;
      return () => clearTimeout(timer);
    }
    prevCountRef.current = guardsOnShift.length;
  }, [guardsOnShift]);

  const lateCount = guardsOnShift.filter((g) => g.status === 'late' || g.status === 'critical_late').length;

  return (
    <div className="bg-[#0f172a]/70 backdrop-blur-sm border border-white/10 shadow-sm rounded-xl overflow-hidden">
      <div className="flex items-center justify-between px-4 pt-4 pb-2">
        <div className="flex items-center gap-2">
          <div className="w-5 h-5 flex items-center justify-center text-emerald-400">
            <i className="ri-shield-user-line text-sm"></i>
          </div>
          <h3 className="text-sm font-semibold text-white">Guard Status</h3>
        </div>
        <Link href="/guards" className="text-xs text-blue-400 hover:text-blue-300 font-medium cursor-pointer">View all</Link>
      </div>

      <div className="flex px-4 pb-3 gap-1">
        <button
          onClick={() => setTab('active')}
          className={`px-3 py-1 rounded-full text-xs font-medium transition-all cursor-pointer whitespace-nowrap ${tab === 'active' ? 'bg-white/10 text-white' : 'text-gray-500 hover:text-gray-300'}`}
        >
          On Shift ({totalActive})
        </button>
        <button
          onClick={() => setTab('missing')}
          className={`px-3 py-1 rounded-full text-xs font-medium transition-all cursor-pointer whitespace-nowrap relative ${tab === 'missing' ? 'bg-white/10 text-white' : 'text-gray-500 hover:text-gray-300'}`}
        >
          Missing / Late ({missingGuards.length + lateCount})
          {(missingGuards.length + lateCount) > 0 && (
            <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-red-500 text-[9px] text-white flex items-center justify-center font-bold">{(missingGuards.length + lateCount) > 9 ? '9+' : missingGuards.length + lateCount}</span>
          )}
        </button>
      </div>

      <div className="max-h-80 overflow-y-auto">
        {tab === 'active' ? (
          guardsOnShift.length === 0 ? (
            <div className="px-4 pb-4 text-center text-xs text-gray-500 py-6">No guards currently on shift.</div>
          ) : (
            guardsOnShift.map((guard) => {
              const cfg = statusConfig[guard.status];
              const isAnimated = animatedIds.has(guard.id);
              return (
                <div
                  key={guard.id}
                  className={`px-4 py-2.5 border-t border-white/5 flex items-center gap-3 transition-all ${isAnimated ? 'bg-emerald-500/5' : ''}`}
                  style={isAnimated ? { animation: 'slideIn 0.8s ease-out' } : undefined}
                >
                  <span className="relative flex h-2.5 w-2.5 shrink-0">
                    {guard.status === 'late' && (
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-500 opacity-75"></span>
                    )}
                    {guard.status === 'critical_late' && (
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-500 opacity-75"></span>
                    )}
                    <span className={`relative inline-flex rounded-full h-2.5 w-2.5 ${cfg.dot}`}></span>
                  </span>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium text-white truncate">{guard.name}</span>
                      <span className={`px-1.5 py-0.5 rounded text-[10px] font-medium ${cfg.bg} ${cfg.text} shrink-0`}>{cfg.label}</span>
                    </div>
                    <p className="text-xs text-gray-500 truncate">{guard.site_name}</p>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="text-xs text-gray-400">{timeAgo(guard.clock_in)}</p>
                    {guard.late_minutes && guard.late_minutes > 0 && (
                      <p className="text-[10px] text-red-400 font-medium">+{guard.late_minutes}m late</p>
                    )}
                  </div>
                </div>
              );
            })
          )
        ) : (
          missingGuards.length === 0 && lateCount === 0 ? (
            <div className="px-4 pb-4 text-center text-xs text-gray-500 py-6">
              <div className="w-8 h-8 rounded-full bg-emerald-500/10 flex items-center justify-center mx-auto mb-2">
                <div className="w-4 h-4 flex items-center justify-center text-emerald-400">
                  <i className="ri-check-line text-sm"></i>
                </div>
              </div>
              All guards accounted for.
            </div>
          ) : (
            <div>
              {guardsOnShift.filter((g) => g.status === 'late' || g.status === 'critical_late').map((guard) => {
                const cfg = statusConfig[guard.status];
                return (
                  <div key={`late-${guard.id}`} className="px-4 py-2.5 border-t border-white/5 flex items-center gap-3">
                    <span className="relative flex h-2.5 w-2.5 shrink-0">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-500 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-red-500"></span>
                    </span>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium text-white truncate">{guard.name}</span>
                        <span className={`px-1.5 py-0.5 rounded text-[10px] font-medium ${cfg.bg} ${cfg.text} shrink-0`}>{cfg.label}</span>
                      </div>
                      <p className="text-xs text-gray-500 truncate">{guard.site_name}</p>
                    </div>
                    <div className="text-right shrink-0">
                      <p className="text-[10px] text-red-400 font-medium">+{guard.late_minutes}m late</p>
                    </div>
                  </div>
                );
              })}
              {missingGuards.map((mg) => (
                <div key={mg.id} className="px-4 py-2.5 border-t border-white/5 flex items-center gap-3">
                  <span className="relative flex h-2.5 w-2.5 shrink-0">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-500 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-red-500"></span>
                  </span>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium text-white truncate">{mg.name}</span>
                      <span className="px-1.5 py-0.5 rounded text-[10px] font-medium bg-red-500/10 text-red-400 shrink-0">
                        {mg.reason === 'no_clock_in' ? 'No clock-in' : 'Unassigned'}
                      </span>
                    </div>
                    <p className="text-xs text-gray-500 truncate">{mg.site_name}</p>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="text-[10px] text-gray-500">Shift: {formatShiftTime(mg.shift_start)}</p>
                  </div>
                </div>
              ))}
            </div>
          )
        )}
      </div>
    </div>
  );
}