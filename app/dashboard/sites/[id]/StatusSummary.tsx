'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';

export default function StatusSummary({ siteId }: { siteId: string }) {
  const [metrics, setMetrics] = useState({
    incidents: 0, openIncidents: 0, activeGuards: 0,
    completedPatrols: 0, gpsVerifiedScans: 0, outsideRadiusScans: 0, noGpsScans: 0,
    assignedGuards: 0, patrolConfigured: false,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      setLoading(true);
      const today = new Date().toISOString();

      const [incidentsRes, patrolsRes, shiftsRes, scansRes, assignmentsRes, checkpointsRes] = await Promise.all([
        supabase.from('incidents').select('id, status').eq('site_id', siteId),
        supabase.from('patrol_logs').select('id, status').eq('site_id', siteId).gte('start_time', new Date(Date.now() - 7 * 86400000).toISOString()),
        supabase.from('shifts').select('id, guard_id').eq('site_id', siteId).gte('start_time', today).lte('start_time', new Date(Date.now() + 86400000).toISOString()),
        supabase.from('patrol_scans').select('id, gps_status, gps_verified').eq('site_id', siteId).gte('scanned_at', new Date(Date.now() - 7 * 86400000).toISOString()),
        supabase.from('guard_site_assignments').select('id').eq('site_id', siteId).eq('is_blocked', false),
        supabase.from('patrol_checkpoints').select('id').eq('site_id', siteId).eq('is_active', true),
      ]);

      const totalIncidents = (incidentsRes.data || []).length;
      const openIncidents = (incidentsRes.data || []).filter((i: any) => i.status === 'open').length;
      const completedPatrols = (patrolsRes.data || []).filter((p: any) => p.status === 'completed').length;
      const activeGuards = new Set((shiftsRes.data || []).map((s: any) => s.guard_id).filter(Boolean)).size;
      const allScans = scansRes.data || [];
      const gpsVerifiedScans = allScans.filter((s: any) => s.gps_verified).length;
      const outsideRadiusScans = allScans.filter((s: any) => s.gps_status === 'outside_radius').length;
      const noGpsScans = allScans.filter((s: any) => s.gps_status === 'gps_unavailable' || s.gps_status === 'gps_permission_denied').length;
      const assignedGuards = assignmentsRes.count || 0;
      const patrolConfigured = (checkpointsRes.data || []).length > 0;

      setMetrics({ incidents: totalIncidents, openIncidents, activeGuards: activeGuards || 0, completedPatrols, gpsVerifiedScans, outsideRadiusScans, noGpsScans, assignedGuards, patrolConfigured });
      setLoading(false);
    }
    load();
  }, [siteId]);

  const tiles = [
    { label: 'Patrols', value: metrics.completedPatrols, color: 'text-emerald-400', icon: 'ri-route-line' },
    { label: 'GPS Verified', value: metrics.gpsVerifiedScans, color: 'text-emerald-400', icon: 'ri-map-pin-line' },
    { label: 'Outside Radius', value: metrics.outsideRadiusScans, color: 'text-amber-400', icon: 'ri-alert-line' },
    { label: 'No GPS', value: metrics.noGpsScans, color: 'text-red-400', icon: 'ri-gps-line' },
    { label: 'Open Incidents', value: metrics.openIncidents, color: 'text-red-400', icon: 'ri-error-warning-line' },
    { label: 'Total Incidents', value: metrics.incidents, color: 'text-amber-400', icon: 'ri-alert-line' },
    { label: 'Guards Today', value: metrics.activeGuards, color: 'text-blue-400', icon: 'ri-shield-user-line' },
  ];

  return (
    <div className="bg-[#0f172a]/70 backdrop-blur-sm border border-white/10 rounded-xl overflow-hidden">
      <div className="px-5 py-4 border-b border-white/10 flex items-center gap-2.5">
        <div className="w-8 h-8 rounded-lg bg-blue-500/10 border border-blue-500/20 flex items-center justify-center">
          <i className="ri-bar-chart-2-line text-blue-400 text-sm"></i>
        </div>
        <div>
          <h2 className="text-sm font-semibold text-white">Status Summary</h2>
          <p className="text-[11px] text-gray-400">Operational overview</p>
        </div>
      </div>

      <div className="p-4">
        {loading ? (
          <div className="grid grid-cols-2 gap-2.5">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="bg-white/[0.03] border border-white/5 rounded-lg p-3 animate-pulse">
                <div className="h-3 bg-white/5 rounded w-16 mb-2"></div>
                <div className="h-5 bg-white/5 rounded w-10"></div>
              </div>
            ))}
          </div>
        ) : (
          <>
            <div className="grid grid-cols-2 gap-2.5">
              {tiles.map((t) => (
                <div key={t.label} className="bg-white/[0.03] border border-white/5 rounded-lg p-3">
                  <div className="flex items-center gap-1.5 mb-1.5">
                    <div className="w-4 h-4 flex items-center justify-center">
                      <i className={`${t.icon} ${t.color} text-xs`}></i>
                    </div>
                    <span className="text-[10px] text-gray-400 uppercase tracking-wide truncate">{t.label}</span>
                  </div>
                  <div className={`text-xl font-bold ${t.color}`}>{t.value}</div>
                </div>
              ))}
            </div>
            <div className="mt-3 pt-3 border-t border-white/5 space-y-2.5">
              <div className="flex items-center justify-between">
                <span className="text-xs text-gray-400">Assigned Guards</span>
                <span className={`text-xs font-semibold ${metrics.assignedGuards > 0 ? 'text-blue-400' : 'text-gray-500'}`}>
                  {metrics.assignedGuards}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs text-gray-400">Patrol Route</span>
                <span className={`text-xs font-semibold flex items-center gap-1.5 ${metrics.patrolConfigured ? 'text-emerald-400' : 'text-gray-500'}`}>
                  <span className={`w-2 h-2 rounded-full ${metrics.patrolConfigured ? 'bg-emerald-500' : 'bg-gray-500'}`}></span>
                  {metrics.patrolConfigured ? 'Configured' : 'Not Configured'}
                </span>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}