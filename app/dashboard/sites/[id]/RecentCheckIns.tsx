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
        .select('id, clock_in, clock_out, guard_id, guards(first_name, last_name)')
        .eq('site_id', siteId)
        .order('clock_in', { ascending: false })
        .limit(6);

      setEntries(data || []);
      setLoading(false);
    }
    load();
  }, [siteId]);

  if (loading) {
    return (
      <div className="bg-slate-600 rounded-lg p-6 text-white mt-6">
        <h2 className="text-lg font-semibold mb-4">Recent Check-ins</h2>
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="flex items-center justify-between">
              <div className="flex-1">
                <div className="text-sm font-medium text-gray-400 animate-pulse">Loading...</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (entries.length === 0) {
    return (
      <div className="bg-slate-600 rounded-lg p-6 text-white mt-6">
        <h2 className="text-lg font-semibold mb-4">Recent Check-ins</h2>
        <p className="text-sm text-gray-400">No recent check-ins for this site.</p>
      </div>
    );
  }

  return (
    <div className="bg-slate-600 rounded-lg p-6 text-white mt-6">
      <h2 className="text-lg font-semibold mb-4">Recent Check-ins</h2>

      <div className="space-y-4">
        {entries.map((entry) => {
          const guardName = entry.guards?.first_name
            ? `${entry.guards.first_name} ${entry.guards.last_name || ''}`
            : 'Unknown';
          const isActive = !entry.clock_out;
          const status = isActive ? 'active' : 'inactive';

          return (
            <div key={entry.id} className="flex items-center justify-between">
              <div className="flex-1">
                <div className="text-sm font-medium text-white">{guardName}</div>
                <div className={`text-xs ${status === 'active' ? 'text-blue-300' : 'text-red-300'}`}>
                  {isActive ? 'On duty' : 'Clocked out'}
                </div>
              </div>
              <div className="text-xs text-gray-300">{timeAgo(entry.clock_in)}</div>
            </div>
          );
        })}
      </div>
    </div>
  );
}