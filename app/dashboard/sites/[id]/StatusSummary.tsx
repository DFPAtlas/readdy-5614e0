'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';

export default function StatusSummary({ siteId }: { siteId: string }) {
  const [metrics, setMetrics] = useState({ incidents: 0, openIncidents: 0, activeGuards: 0, completedPatrols: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      setLoading(true);
      const today = new Date().toISOString();

      const [incidentsRes, patrolsRes, shiftsRes] = await Promise.all([
        supabase.from('incidents').select('id, status').eq('site_id', siteId),
        supabase.from('patrol_logs').select('id, status').eq('site_id', siteId).gte('start_time', new Date(Date.now() - 7 * 86400000).toISOString()),
        supabase.from('shifts').select('id, guard_id').eq('site_id', siteId).gte('start_time', today).lte('start_time', new Date(Date.now() + 86400000).toISOString()),
      ]);

      const totalIncidents = (incidentsRes.data || []).length;
      const openIncidents = (incidentsRes.data || []).filter((i: any) => i.status === 'open').length;
      const totalPatrols = (patrolsRes.data || []).length;
      const completedPatrols = (patrolsRes.data || []).filter((p: any) => p.status === 'completed').length;
      const activeGuards = new Set((shiftsRes.data || []).map((s: any) => s.guard_id).filter(Boolean)).size;

      setMetrics({ incidents: totalIncidents, openIncidents, activeGuards: activeGuards || 0, completedPatrols });
      setLoading(false);
    }
    load();
  }, [siteId]);

  if (loading) {
    return (
      <div className="bg-slate-600 rounded-lg p-6 text-white">
        <h2 className="text-lg font-semibold mb-6">Status Summary</h2>
        <div className="space-y-6">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="text-center">
              <div className="text-4xl font-bold text-gray-400 mb-2 animate-pulse">—</div>
              <div className="text-sm text-gray-300">Loading...</div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-slate-600 rounded-lg p-6 text-white">
      <h2 className="text-lg font-semibold mb-6">Status Summary</h2>

      <div className="space-y-6">
        <div className="text-center">
          <div className="text-4xl font-bold text-green-400 mb-2">{metrics.completedPatrols}</div>
          <div className="text-sm text-gray-300">PATROLS COMPLETED</div>
        </div>

        <div className="text-center">
          <div className="text-4xl font-bold text-red-400 mb-2">{metrics.openIncidents}</div>
          <div className="text-sm text-gray-300">OPEN INCIDENTS</div>
        </div>

        <div className="text-center">
          <div className="text-4xl font-bold text-yellow-400 mb-2">{metrics.incidents}</div>
          <div className="text-sm text-gray-300">TOTAL INCIDENTS</div>
        </div>

        <div className="text-center">
          <div className="text-4xl font-bold text-blue-400 mb-2">{metrics.activeGuards}</div>
          <div className="text-sm text-gray-300">GUARDS TODAY</div>
        </div>
      </div>
    </div>
  );
}