'use client';

import Link from 'next/link';
import { useState } from 'react';
import type { RecentIncident } from '@/lib/dashboardFetch';

interface IncidentStatusWidgetProps {
  incidents: RecentIncident[];
  totalOpen: number;
  highCritical: number;
}

const severityConfig: Record<string, { dot: string; border: string; bg: string; text: string }> = {
  critical: { dot: 'bg-red-500', border: 'border-l-red-500', bg: 'bg-red-500/10', text: 'text-red-400' },
  high: { dot: 'bg-orange-500', border: 'border-l-orange-500', bg: 'bg-orange-500/10', text: 'text-orange-400' },
  medium: { dot: 'bg-amber-500', border: 'border-l-amber-500', bg: 'bg-amber-500/10', text: 'text-amber-400' },
  low: { dot: 'bg-blue-500', border: 'border-l-blue-500', bg: 'bg-blue-500/10', text: 'text-blue-400' },
};

function timeAgo(iso: string): string {
  const diff = Math.floor((Date.now() - new Date(iso).getTime()) / 1000);
  if (diff < 60) return 'Just now';
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return `${Math.floor(diff / 86400)}d ago`;
}

export default function IncidentStatusWidget({ incidents, totalOpen, highCritical }: IncidentStatusWidgetProps) {
  const [filter, setFilter] = useState<'all' | 'critical' | 'high'>('all');

  const filtered = filter === 'all' ? incidents : incidents.filter((i) => i.severity === filter || (filter === 'high' && i.severity === 'high'));
  const display = filtered.slice(0, 6);

  return (
    <div className="bg-[#0f172a]/70 backdrop-blur-sm border border-white/10 shadow-sm rounded-xl overflow-hidden">
      <div className="flex items-center justify-between px-4 pt-4 pb-2">
        <div className="flex items-center gap-2">
          <div className="w-5 h-5 flex items-center justify-center text-red-400">
            <i className="ri-error-warning-line text-sm"></i>
          </div>
          <h3 className="text-sm font-semibold text-white">Incidents</h3>
        </div>
        <Link href="/incidents?status=open" className="text-xs text-blue-400 hover:text-blue-300 font-medium cursor-pointer">View all</Link>
      </div>

      <div className="flex items-center gap-3 px-4 pb-3">
        <div className="flex items-baseline gap-1.5">
          <span className={`text-2xl font-bold ${highCritical > 0 ? 'text-red-400 animate-pulse' : 'text-white'}`}>{totalOpen}</span>
          <span className="text-xs text-gray-500">open</span>
        </div>
        {highCritical > 0 && (
          <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-red-500/10 border border-red-500/20">
            <span className="relative flex h-2 w-2 shrink-0">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-500 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
            </span>
            <span className="text-[10px] font-semibold text-red-400">{highCritical} critical</span>
          </div>
        )}
      </div>

      <div className="flex px-4 pb-2 gap-1">
        {(['all', 'critical', 'high'] as const).map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-2.5 py-0.5 rounded-full text-[10px] font-medium transition-all cursor-pointer whitespace-nowrap ${filter === f ? 'bg-white/10 text-white' : 'text-gray-500 hover:text-gray-300'}`}
          >
            {f === 'all' ? 'All' : f === 'critical' ? 'Critical' : 'High'}
          </button>
        ))}
      </div>

      <div className="max-h-80 overflow-y-auto">
        {display.length === 0 ? (
          <div className="px-4 pb-4 text-center text-xs text-gray-500 py-6">
            <div className="w-8 h-8 rounded-full bg-emerald-500/10 flex items-center justify-center mx-auto mb-2">
              <div className="w-4 h-4 flex items-center justify-center text-emerald-400">
                <i className="ri-check-line text-sm"></i>
              </div>
            </div>
            No open incidents.
          </div>
        ) : (
          display.map((inc) => {
            const cfg = severityConfig[inc.severity] || severityConfig.low;
            return (
              <Link key={inc.id} href={`/incidents/${inc.id}`} className="block cursor-pointer">
                <div className={`px-4 py-3 border-t border-white/5 border-l-2 ${cfg.border} hover:bg-white/5 transition-all`}>
                  <div className="flex items-center gap-2 mb-1">
                    <span className={`w-2 h-2 rounded-full ${cfg.dot}`}></span>
                    <span className={`text-xs font-medium ${cfg.text}`}>{inc.severity}</span>
                    <span className="text-[10px] text-gray-600">{timeAgo(inc.created_at)}</span>
                  </div>
                  <p className="text-sm font-medium text-white truncate">{inc.incident_type}</p>
                  <p className="text-xs text-gray-500 truncate mt-0.5">{inc.site_name}</p>
                  {inc.description && (
                    <p className="text-xs text-gray-600 line-clamp-1 mt-0.5">{inc.description}</p>
                  )}
                </div>
              </Link>
            );
          })
        )}
      </div>
    </div>
  );
}