'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';

interface OBEntry {
  id: string;
  entry: string;
  entryType: string | null;
  guardName: string;
  occurredAt: string | null;
  createdAt: string;
  aiSummary: string | null;
  title: string | null;
}

function timeAgo(iso: string) {
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
}

const typeIcons: Record<string, string> = {
  incident: 'ri-error-warning-line',
  observation: 'ri-eye-line',
  patrol: 'ri-route-line',
  handover: 'ri-swap-line',
  check: 'ri-check-double-line',
  visitor: 'ri-user-voice-line',
  maintenance: 'ri-tools-line',
  general: 'ri-book-open-line',
};

const typeColors: Record<string, string> = {
  incident: 'text-red-400 bg-red-500/10',
  observation: 'text-amber-400 bg-amber-500/10',
  patrol: 'text-cyan-400 bg-cyan-500/10',
  handover: 'text-purple-400 bg-purple-500/10',
  check: 'text-emerald-400 bg-emerald-500/10',
  visitor: 'text-blue-400 bg-blue-500/10',
  maintenance: 'text-orange-400 bg-orange-500/10',
  general: 'text-gray-400 bg-gray-500/10',
};

export default function SiteOBFeed({ siteId }: { siteId: string }) {
  const [entries, setEntries] = useState<OBEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      setLoading(true);
      const { data } = await supabase
        .from('occurrence_books')
        .select('id, entry, entry_type, ai_summary, occurred_at, created_at, title, guard_id, guards(first_name, last_name)')
        .eq('site_id', siteId)
        .order('created_at', { ascending: false })
        .limit(15);

      setEntries((data || []).map((o: any) => ({
        id: o.id,
        entry: o.entry,
        entryType: o.entry_type,
        aiSummary: o.ai_summary,
        occurredAt: o.occurred_at,
        createdAt: o.created_at,
        title: o.title,
        guardName: o.guards ? `${o.guards.first_name || ''} ${o.guards.last_name || ''}`.trim() || 'Unknown' : 'Unknown',
      })));
      setLoading(false);
    }
    load();
  }, [siteId]);

  return (
    <div className="bg-[#0f172a]/70 backdrop-blur-sm border border-white/10 rounded-xl overflow-hidden">
      <div className="px-5 py-4 border-b border-white/10 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-violet-500/10 border border-violet-500/20 flex items-center justify-center">
            <i className="ri-book-open-line text-violet-400 text-sm"></i>
          </div>
          <div>
            <h2 className="text-sm font-semibold text-white">Daily Occurrence Book</h2>
            <p className="text-[11px] text-gray-400">Guard entries and observations</p>
          </div>
        </div>
        <span className="text-xs text-gray-500">{entries.length} entries</span>
      </div>

      <div className="p-5">
        {loading ? (
          <div className="space-y-4">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="flex gap-3 animate-pulse">
                <div className="w-9 h-9 rounded-lg bg-white/5 flex-shrink-0"></div>
                <div className="flex-1 space-y-2">
                  <div className="h-3 bg-white/5 rounded w-24"></div>
                  <div className="h-3 bg-white/5 rounded w-full"></div>
                  <div className="h-2 bg-white/5 rounded w-32"></div>
                </div>
              </div>
            ))}
          </div>
        ) : entries.length === 0 ? (
          <div className="text-center py-8">
            <div className="w-12 h-12 rounded-xl bg-white/5 flex items-center justify-center mx-auto mb-3">
              <i className="ri-book-open-line text-gray-500 text-lg"></i>
            </div>
            <p className="text-sm text-gray-400 mb-1">No entries yet</p>
            <p className="text-xs text-gray-500">Guard entries will appear here as they log observations</p>
          </div>
        ) : (
          <div className="space-y-4">
            {entries.map((entry) => {
              const type = entry.entryType || 'general';
              const icon = typeIcons[type] || typeIcons.general;
              const color = typeColors[type] || typeColors.general;

              return (
                <div key={entry.id} className="flex gap-3 group">
                  <div className={`w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0 ${color}`}>
                    <i className={`${icon} text-sm`}></i>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-0.5">
                      {entry.title && (
                        <span className="text-sm font-medium text-white truncate">{entry.title}</span>
                      )}
                      <span className="text-[11px] text-gray-500 capitalize px-1.5 py-0.5 rounded bg-white/5 whitespace-nowrap">
                        {type}
                      </span>
                    </div>
                    <p className="text-sm text-gray-300 line-clamp-2 mb-1">{entry.entry}</p>
                    {entry.aiSummary && (
                      <div className="bg-violet-500/5 border border-violet-500/10 rounded-lg px-2.5 py-1.5 mb-1.5">
                        <div className="flex items-center gap-1.5 mb-0.5">
                          <div className="w-3.5 h-3.5 flex items-center justify-center text-violet-400">
                            <i className="ri-robot-line text-[10px]"></i>
                          </div>
                          <span className="text-[10px] font-medium text-violet-400">AI Summary</span>
                        </div>
                        <p className="text-xs text-gray-400">{entry.aiSummary}</p>
                      </div>
                    )}
                    <div className="flex items-center gap-2 text-[11px] text-gray-500">
                      <span>{entry.guardName}</span>
                      <span>·</span>
                      <span>{timeAgo(entry.createdAt)}</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}