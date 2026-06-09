'use client';

import Link from 'next/link';
import { useEffect, useRef, useState } from 'react';
import type { LiveOccurrence } from '@/lib/useDashboard';

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

export default function LiveOccurrenceFeed({ occurrences }: LiveOccurrenceFeedProps) {
  const [animatedIds, setAnimatedIds] = useState<Set<string>>(new Set());
  const prevCountRef = useRef(occurrences.length);

  useEffect(() => {
    if (occurrences.length > prevCountRef.current) {
      const newIds = occurrences.slice(0, occurrences.length - prevCountRef.current).map((o) => o.id);
      setAnimatedIds(new Set(newIds));
      const timer = setTimeout(() => setAnimatedIds(new Set()), 1500);
      prevCountRef.current = occurrences.length;
      return () => clearTimeout(timer);
    }
    prevCountRef.current = occurrences.length;
  }, [occurrences]);

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
        <Link href="/occurrence-book" className="text-sm text-blue-400 hover:text-blue-300 font-medium cursor-pointer">
          View all
        </Link>
      </div>

      {occurrences.length === 0 ? (
        <div className="bg-[#0f172a]/70 backdrop-blur-sm border border-white/10 shadow-sm rounded-xl p-6 text-center text-gray-500 text-sm">
          No recent activity.
        </div>
      ) : (
        <div className="bg-[#0f172a]/70 backdrop-blur-sm border border-white/10 shadow-sm rounded-xl overflow-hidden">
          {occurrences.map((o, i) => {
            const isAnimated = animatedIds.has(o.id);
            const icon = typeIcons[o.entry_type || ''] || 'ri-more-line';
            const color = typeColors[o.entry_type || ''] || 'bg-gray-500/10 text-gray-400';
            const guardName = o.guard_first_name ? `${o.guard_first_name} ${o.guard_last_name || ''}` : 'Unknown';

            return (
              <div
                key={o.id}
                className={`px-4 py-3.5 transition-all ${i !== occurrences.length - 1 ? 'border-b border-white/5' : ''} ${isAnimated ? 'bg-blue-500/10' : ''}`}
                style={isAnimated ? { animation: 'slideIn 0.6s ease-out' } : undefined}
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
                    <p className="text-sm text-gray-300 line-clamp-2">{o.entry}</p>
                    <p className="text-xs text-gray-500 mt-1">{timeAgo(o.occurred_at || o.created_at)}</p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}