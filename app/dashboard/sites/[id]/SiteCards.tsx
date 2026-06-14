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
        statusColor: l.status === 'active' ? 'bg-yellow-500' : l.status === 'completed' ? 'bg-green-500' : 'bg-red-500',
        completed: l.checkpoints_completed || 0,
        total: l.checkpoints_total || 0,
      })));
      setLoading(false);
    }
    load();
  }, [siteId]);

  if (loading) {
    return (
      <div className="grid grid-cols-2 gap-4">
        {[1, 2].map((i) => (
          <div key={i} className="bg-slate-600 rounded-lg p-4 text-white animate-pulse">
            <div className="h-4 bg-slate-500 rounded w-24 mb-3"></div>
            <div className="space-y-2">
              <div className="h-3 bg-slate-500 rounded w-full"></div>
              <div className="h-3 bg-slate-500 rounded w-2/3"></div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (patrolStats.length === 0) {
    return (
      <div className="bg-slate-600 rounded-lg p-6 text-white text-center">
        <i className="ri-route-line text-gray-400 text-3xl mb-3 block"></i>
        <p className="text-sm text-gray-400">No patrol logs yet for this site.</p>
        <p className="text-xs text-gray-500 mt-1">Patrol data will appear here once guards begin patrols.</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 gap-4">
      {patrolStats.map((p) => (
        <div key={p.id} className="bg-slate-600 rounded-lg p-4 text-white">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-semibold text-white">{siteData?.site_name || 'Site'}</h3>
            <div className={`w-3 h-3 rounded-full ${p.statusColor}`}></div>
          </div>

          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-300">Guard:</span>
              <span className="text-white">{p.guardName}</span>
            </div>

            <div className="flex justify-between">
              <span className="text-gray-300">Status:</span>
              <span className={
                p.status === 'Completed' ? 'text-green-400' :
                p.status === 'In Progress' ? 'text-yellow-400' :
                'text-red-400'
              }>{p.status}</span>
            </div>

            <div className="flex justify-between">
              <span className="text-gray-300">Checkpoints:</span>
              <span className="text-white">{p.completed}/{p.total}</span>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}