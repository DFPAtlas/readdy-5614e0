'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';

export default function SiteCards({ siteId }: { siteId: string }) {
  const [siteData, setSiteData] = useState<any>(null);
  const [patrolStats, setPatrolStats] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      setLoading(true);

      const { data: site } = await supabase
        .from('sites')
        .select('*')
        .eq('id', siteId)
        .maybeSingle();

      const { data: logs } = await supabase
        .from('patrol_logs')
        .select('id, status, start_time, end_time, checkpoints_total, checkpoints_completed, guard_id, guards(first_name, last_name)')
        .eq('site_id', siteId)
        .order('start_time', { ascending: false })
        .limit(6);

      setSiteData(site);
      setPatrolStats((logs || []).map((l: any) => ({
        id: l.id,
        guardName: l.guards ? `${l.guards.first_name || ''} ${l.guards.last_name || ''}`.trim() || 'Unassigned' : 'Unassigned',
        status: l.status === 'active' ? 'In Progress' : l.status === 'completed' ? 'Completed' : l.status === 'missed' ? 'Missed' : l.status || 'Unknown',
        statusColor: l.status === 'active' ? 'bg-blue-500' : l.status === 'completed' ? 'bg-emerald-500' : 'bg-red-500',
        completed: l.checkpoints_completed || 0,
        total: l.checkpoints_total || 0,
      })));
      setLoading(false);
    }
    load();
  }, [siteId]);

  return (
    <div className="bg-[#0f172a]/70 backdrop-blur-sm border border-white/10 rounded-xl overflow-hidden">
      <div className="px-5 py-4 border-b border-white/10 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center">
            <i className="ri-route-line text-cyan-400 text-sm"></i>
          </div>
          <div>
            <h2 className="text-sm font-semibold text-white">Site Overview</h2>
            <p className="text-[11px] text-gray-400">Recent patrol activity</p>
          </div>
        </div>
        {!loading && patrolStats.length > 0 && (
          <span className="text-xs text-gray-500">{patrolStats.length} patrols</span>
        )}
      </div>

      <div className="p-5">
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {[1, 2].map((i) => (
              <div key={i} className="bg-white/[0.03] border border-white/5 rounded-lg p-4 animate-pulse">
                <div className="h-4 bg-white/5 rounded w-24 mb-3"></div>
                <div className="space-y-2">
                  <div className="h-3 bg-white/5 rounded w-full"></div>
                  <div className="h-3 bg-white/5 rounded w-2/3"></div>
                </div>
              </div>
            ))}
          </div>
        ) : patrolStats.length === 0 ? (
          <div className="text-center py-8">
            <div className="w-12 h-12 rounded-xl bg-white/5 flex items-center justify-center mx-auto mb-3">
              <i className="ri-route-line text-gray-500 text-lg"></i>
            </div>
            <p className="text-sm text-gray-400 mb-1">No patrol logs yet for this site</p>
            <p className="text-xs text-gray-500">Patrol data will appear here once guards begin patrols</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {patrolStats.map((p) => (
              <div key={p.id} className="bg-white/[0.03] border border-white/5 rounded-lg p-4">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-semibold text-sm text-white truncate">{siteData?.site_name || 'Site'}</h3>
                  <span className={`w-2.5 h-2.5 rounded-full flex-shrink-0 ${p.statusColor}`}></span>
                </div>

                <div className="space-y-2 text-sm">
                  <div className="flex justify-between gap-3">
                    <span className="text-gray-400">Guard</span>
                    <span className="text-white truncate">{p.guardName}</span>
                  </div>
                  <div className="flex justify-between gap-3">
                    <span className="text-gray-400">Status</span>
                    <span className={
                      p.status === 'Completed' ? 'text-emerald-400' :
                      p.status === 'In Progress' ? 'text-blue-400' :
                      'text-red-400'
                    }>{p.status}</span>
                  </div>
                  <div className="flex justify-between gap-3">
                    <span className="text-gray-400">Checkpoints</span>
                    <span className="text-white">{p.completed}/{p.total}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}