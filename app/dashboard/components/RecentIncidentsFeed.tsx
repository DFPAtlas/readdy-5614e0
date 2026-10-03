'use client';

import Link from 'next/link';
import type { RecentIncident } from '@/lib/useDashboard';

interface RecentIncidentsFeedProps {
  incidents: RecentIncident[];
}

function severityColor(sev: string): { dot: string; text: string } {
  switch (sev) {
    case 'low': return { dot: 'bg-emerald-500', text: 'text-emerald-400' };
    case 'medium': return { dot: 'bg-amber-500', text: 'text-amber-400' };
    case 'high': return { dot: 'bg-orange-500', text: 'text-orange-400' };
    case 'critical': return { dot: 'bg-red-500', text: 'text-red-400' };
    default: return { dot: 'bg-gray-400', text: 'text-gray-400' };
  }
}

function statusPill(status: string): string {
  switch (status) {
    case 'open': return 'bg-red-500/10 text-red-400 border border-red-500/20';
    case 'reviewing': return 'bg-amber-500/10 text-amber-400 border border-amber-500/20';
    case 'closed': return 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20';
    default: return 'bg-gray-500/10 text-gray-400 border border-white/10';
  }
}

function timeAgo(iso: string): string {
  const diff = Math.floor((Date.now() - new Date(iso).getTime()) / 1000);
  if (diff < 60) return 'Just now';
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return `${Math.floor(diff / 86400)}d ago`;
}

export default function RecentIncidentsFeed({ incidents }: RecentIncidentsFeedProps) {
  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-bold text-white">Recent Incidents</h2>
        <Link href="/incidents" className="text-sm text-blue-400 hover:text-blue-300 font-medium cursor-pointer">
          View all
        </Link>
      </div>

      {incidents.length === 0 ? (
        <div className="bg-[#0f172a]/70 backdrop-blur-sm border border-white/10 shadow-sm rounded-xl p-6 text-center text-gray-500 text-sm">
          No recent incidents.
        </div>
      ) : (
        <div className="bg-[#0f172a]/70 backdrop-blur-sm border border-white/10 shadow-sm rounded-xl overflow-hidden">
          {incidents.map((inc, i) => {
            const s = severityColor(inc.severity);
            return (
              <Link
                key={inc.id}
                href={`/incidents/detail?id=${inc.id}`}
                className={`flex items-center gap-3 px-4 py-3.5 hover:bg-white/5 transition-colors cursor-pointer ${i !== incidents.length - 1 ? 'border-b border-white/5' : ''}`}
              >
                <div className={`w-2.5 h-2.5 rounded-full shrink-0 ${s.dot}`}></div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-200 truncate">
                    {inc.incident_type} — {inc.site_name}
                  </p>
                  <p className={`text-xs ${s.text} mt-0.5`}>
                    {timeAgo(inc.created_at)}
                  </p>
                </div>
                <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${statusPill(inc.status)}`}>
                  {inc.status}
                </span>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}