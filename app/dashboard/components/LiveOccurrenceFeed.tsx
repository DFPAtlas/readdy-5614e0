'use client';

import Link from 'next/link';
import { useState } from 'react';
import type { LiveOccurrence } from '@/lib/useDashboard';
import { useAuth } from '@/lib/auth';
import { useLiveOccurrences } from '@/lib/useLiveOccurrences';

interface LiveOccurrenceFeedProps {
  occurrences: LiveOccurrence[];
}

const typeIcons: Record<string, string> = {
  'Shift Start': 'ri-login-circle-line',
  'Shift End': 'ri-logout-circle-line',
  'Patrol Check': 'ri-route-line',
  Visitor: 'ri-user-line',
  Delivery: 'ri-truck-line',
  Incident: 'ri-alert-line',
  Maintenance: 'ri-tools-line',
  Communication: 'ri-chat-1-line',
  'Health & Safety': 'ri-heart-pulse-line',
  'Lost Property': 'ri-search-line',
  Note: 'ri-sticky-note-line',
  Other: 'ri-more-line',
};

const typeColors: Record<string, string> = {
  'Shift Start': 'bg-blue-100 text-blue-600',
  'Shift End': 'bg-gray-100 text-gray-600',
  'Patrol Check': 'bg-emerald-100 text-emerald-600',
  Visitor: 'bg-indigo-100 text-indigo-600',
  Delivery: 'bg-orange-100 text-orange-600',
  Incident: 'bg-red-100 text-red-600',
  Maintenance: 'bg-amber-100 text-amber-600',
  Communication: 'bg-purple-100 text-purple-600',
  'Health & Safety': 'bg-pink-100 text-pink-600',
  'Lost Property': 'bg-cyan-100 text-cyan-600',
  Note: 'bg-gray-100 text-gray-600',
  Other: 'bg-gray-100 text-gray-500',
};

function timeAgo(iso: string | null): string {
  if (!iso) return 'Just now';
  const diff = Math.floor((Date.now() - new Date(iso).getTime()) / 1000);
  if (diff < 60) return 'Just now';
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return `${Math.floor(diff / 86400)}d ago`;
}

export default function LiveOccurrenceFeed({ occurrences: baseOccurrences }: LiveOccurrenceFeedProps) {
  const { companyId } = useAuth();
  const { occurrences, newIds } = useLiveOccurrences(companyId, baseOccurrences);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const toggleExpand = (id: string) => {
    setExpandedId((prev) => (prev === id ? null : id));
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <h2 className="text-lg font-bold text-white">Live Activity</h2>
          <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 text-xs font-medium">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            Live
          </span>
        </div>
        <Link href="/occurrence-book" className="text-sm text-blue-400 hover:text-blue-300 font-medium cursor-pointer whitespace-nowrap">
          View all
        </Link>
      </div>

      {occurrences.length === 0 ? (
        <div className="bg-[#0f172a]/70 backdrop-blur-sm border border-white/10 shadow-sm rounded-xl p-6 text-center text-gray-500 text-sm">
          No recent activity.
        </div>
      ) : (
        <div className="bg-[#0f172a]/70 backdrop-blur-sm border border-white/10 shadow-sm rounded-xl overflow-hidden">
          {occurrences.slice(0, 8).map((o, i) => {
            const isAnimated = newIds.has(o.id);
            const isExpanded = expandedId === o.id;
            const icon = typeIcons[o.entry_type || ''] || 'ri-more-line';
            const color = typeColors[o.entry_type || ''] || 'bg-gray-500/10 text-gray-400';
            const guardName = o.guard_first_name ? `${o.guard_first_name} ${o.guard_last_name || ''}` : 'Unknown';
            const isLast = i === Math.min(occurrences.length, 8) - 1;

            return (
              <div
                key={o.id}
                className={`transition-all ${!isLast ? 'border-b border-white/5' : ''} ${isAnimated ? 'bg-blue-500/10' : ''}`}
                style={isAnimated ? { animation: 'slideIn 0.6s ease-out' } : undefined}
              >
                <div
                  onClick={() => toggleExpand(o.id)}
                  className="px-4 py-3.5 cursor-pointer hover:bg-white/[0.03] transition-colors"
                >
                  <div className="flex items-start gap-3">
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${color}`}>
                      <div className="w-4 h-4 flex items-center justify-center">
                        <i className={`${icon} text-sm`}></i>
                      </div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-0.5">
                        <span className="text-xs font-medium text-gray-500">{o.site_name}</span>
                        <span className="text-xs text-gray-600">|</span>
                        <span className="text-xs text-gray-500">{guardName}</span>
                      </div>
                      <p className={`text-sm text-gray-300 ${isExpanded ? '' : 'line-clamp-2'}`}>{o.entry}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <p className="text-xs text-gray-500">{timeAgo(o.occurred_at || o.created_at)}</p>
                        <div className="w-4 h-4 flex items-center justify-center text-gray-600">
                          <i className={`text-xs transition-transform ${isExpanded ? 'ri-arrow-up-s-line' : 'ri-arrow-down-s-line'}`}></i>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {isExpanded && o.ai_summary && (
                  <div className="px-4 pb-3.5 -mt-1">
                    <div className="ml-11 bg-blue-500/5 border border-blue-500/10 rounded-lg px-3 py-2.5">
                      <div className="flex items-center gap-1.5 mb-1.5">
                        <div className="w-4 h-4 flex items-center justify-center">
                          <i className="ri-robot-line text-blue-400 text-xs"></i>
                        </div>
                        <span className="text-[10px] font-semibold text-blue-400 uppercase tracking-wide">AI Summary</span>
                      </div>
                      <p className="text-xs text-gray-400 leading-relaxed">{o.ai_summary}</p>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}