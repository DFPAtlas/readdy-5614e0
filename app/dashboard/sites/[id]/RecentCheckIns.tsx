'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';

function timeAgo(iso: string) {
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins} min${mins > 1 ? 's' : ''} ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
}

export default function RecentCheckIns({ siteId }: { siteId: string }) {
  const [entries, setEntries] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      setLoading(true);
      const { data } = await supabase
        .from('attendance_logs')
        .select('id, clock_in, clock_out, guard_id, guards(first_name, last_name), shifts!inner(site_id)')
        .eq('shifts.site_id', siteId)
        .order('clock_in', { ascending: false })
        .limit(6);

      setEntries(data || []);
      setLoading(false);
    }
    load();
  }, [siteId]);

  return (
    <div className="bg-[#0f172a]/70 backdrop-blur-sm border border-white/10 rounded-xl overflow-hidden">
      <div className="px-5 py-4 border-b border-white/10 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center">
            <i className="ri-login-box-line text-emerald-400 text-sm"></i>
          </div>
          <div>
            <h2 className="text-sm font-semibold text-white">Recent Check-Ins</h2>
            <p className="text-[11px] text-gray-400">Guard arrivals and departures</p>
          </div>
        </div>
        {!loading && entries.length > 0 && (
          <span className="text-xs text-gray-500">{entries.length} recent</span>
        )}
      </div>

      <div className="p-5">
        {loading ? (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex items-center gap-3 animate-pulse">
                <div className="w-9 h-9 rounded-full bg-white/5 flex-shrink-0"></div>
                <div className="flex-1 space-y-1.5">
                  <div className="h-3 bg-white/5 rounded w-28"></div>
                  <div className="h-2 bg-white/5 rounded w-16"></div>
                </div>
              </div>
            ))}
          </div>
        ) : entries.length === 0 ? (
          <div className="text-center py-6">
            <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center mx-auto mb-2">
              <i className="ri-login-box-line text-gray-500"></i>
            </div>
            <p className="text-sm text-gray-400">No recent check-ins for this site</p>
          </div>
        ) : (
          <div className="space-y-1">
            {entries.map((entry) => {
              const guardName = entry.guards?.first_name
                ? `${entry.guards.first_name} ${entry.guards.last_name || ''}`.trim()
                : 'Unknown';
              const initials = `${(entry.guards?.first_name || '')[0]}${(entry.guards?.last_name || '')[0]}` || 'G';
              const isActive = !entry.clock_out;

              return (
                <div key={entry.id} className="flex items-center gap-3 p-2.5 rounded-lg hover:bg-white/[0.03] transition-colors">
                  <div className={`w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0 ${isActive ? 'bg-emerald-500/20 text-emerald-400' : 'bg-white/5 text-gray-400'}`}>
                    <span className="text-xs font-medium">{initials}</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-white truncate">{guardName}</p>
                    <div className="flex items-center gap-1.5 mt-0.5">
                      <span className={`w-1.5 h-1.5 rounded-full ${isActive ? 'bg-emerald-500' : 'bg-gray-500'}`}></span>
                      <span className={`text-[11px] ${isActive ? 'text-emerald-400' : 'text-gray-500'}`}>
                        {isActive ? 'On duty' : 'Clocked out'}
                      </span>
                    </div>
                  </div>
                  <span className="text-xs text-gray-500 flex-shrink-0">{timeAgo(entry.clock_in)}</span>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}