'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';

interface PatrolRecord {
  id: string;
  guardName: string;
  startTime: string;
  endTime: string | null;
  status: string;
  checkpointsTotal: number;
  checkpointsCompleted: number;
  missedCheckpoints: number;
  gpsVerified: number;
  outOfRadius: number;
  duration: number | null;
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

function formatDuration(seconds: number | null): string {
  if (!seconds) return '—';
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  if (h > 0) return `${h}h ${m}m`;
  return `${m}m`;
}

export default function SitePatrolOverview({ siteId }: { siteId: string }) {
  const [patrols, setPatrols] = useState<PatrolRecord[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      setLoading(true);
      const { data } = await supabase
        .from('patrol_logs')
        .select('id, status, start_time, end_time, checkpoints_total, checkpoints_completed, missed_checkpoints, gps_verified_count, out_of_radius_count, duration_seconds, guard_id, guards(first_name, last_name)')
        .eq('site_id', siteId)
        .order('start_time', { ascending: false })
        .limit(15);

      setPatrols((data || []).map((p: any) => ({
        id: p.id,
        guardName: p.guards ? `${p.guards.first_name || ''} ${p.guards.last_name || ''}`.trim() || 'Unassigned' : 'Unassigned',
        startTime: p.start_time,
        endTime: p.end_time,
        status: p.status || 'unknown',
        checkpointsTotal: p.checkpoints_total || 0,
        checkpointsCompleted: p.checkpoints_completed || 0,
        missedCheckpoints: p.missed_checkpoints || 0,
        gpsVerified: p.gps_verified_count || 0,
        outOfRadius: p.out_of_radius_count || 0,
        duration: p.duration_seconds || null,
      })));
      setLoading(false);
    }
    load();
  }, [siteId]);

  const statusConfig: Record<string, { color: string; bg: string; label: string; dot: string }> = {
    completed: { color: 'text-emerald-400', bg: 'bg-emerald-500/10', label: 'Completed', dot: 'bg-emerald-500' },
    active: { color: 'text-blue-400', bg: 'bg-blue-500/10', label: 'In Progress', dot: 'bg-blue-500' },
    missed: { color: 'text-red-400', bg: 'bg-red-500/10', label: 'Missed', dot: 'bg-red-500' },
    partial: { color: 'text-amber-400', bg: 'bg-amber-500/10', label: 'Partial', dot: 'bg-amber-500' },
  };

  return (
    <div className="bg-[#0f172a]/70 backdrop-blur-sm border border-white/10 rounded-xl overflow-hidden">
      <div className="px-5 py-4 border-b border-white/10 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center">
            <i className="ri-route-line text-cyan-400 text-sm"></i>
          </div>
          <div>
            <h2 className="text-sm font-semibold text-white">Patrol Overview</h2>
            <p className="text-[11px] text-gray-400">Recent patrol activity</p>
          </div>
        </div>
        <span className="text-xs text-gray-500">{patrols.length} patrols</span>
      </div>

      <div className="overflow-x-auto">
        {loading ? (
          <div className="p-6 space-y-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="flex items-center gap-4 animate-pulse">
                <div className="h-3 bg-white/5 rounded w-20"></div>
                <div className="h-3 bg-white/5 rounded w-16"></div>
                <div className="h-3 bg-white/5 rounded w-24 flex-1"></div>
                <div className="h-3 bg-white/5 rounded w-12"></div>
              </div>
            ))}
          </div>
        ) : patrols.length === 0 ? (
          <div className="p-8 text-center">
            <div className="w-12 h-12 rounded-xl bg-white/5 flex items-center justify-center mx-auto mb-3">
              <i className="ri-route-line text-gray-500 text-lg"></i>
            </div>
            <p className="text-sm text-gray-400 mb-1">No patrols recorded yet</p>
            <p className="text-xs text-gray-500">Patrol data will appear once guards begin their patrols</p>
          </div>
        ) : (
          <table className="w-full">
            <thead>
              <tr className="border-b border-white/5">
                <th className="text-left text-[11px] font-medium text-gray-500 px-5 py-3">Guard</th>
                <th className="text-left text-[11px] font-medium text-gray-500 px-5 py-3">Started</th>
                <th className="text-left text-[11px] font-medium text-gray-500 px-5 py-3">Duration</th>
                <th className="text-left text-[11px] font-medium text-gray-500 px-5 py-3">Checkpoints</th>
                <th className="text-left text-[11px] font-medium text-gray-500 px-5 py-3">GPS</th>
                <th className="text-left text-[11px] font-medium text-gray-500 px-5 py-3">Status</th>
              </tr>
            </thead>
            <tbody>
              {patrols.map((p) => {
                const cfg = statusConfig[p.status] || statusConfig.missed;
                const cpPercent = p.checkpointsTotal > 0
                  ? Math.round((p.checkpointsCompleted / p.checkpointsTotal) * 100)
                  : 0;
                return (
                  <tr key={p.id} className="border-b border-white/5 hover:bg-white/[0.02] transition-colors">
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-2.5">
                        <div className="w-7 h-7 rounded-full bg-blue-500/20 flex items-center justify-center">
                          <span className="text-[10px] font-medium text-blue-400">
                            {p.guardName.split(' ').map((n: string) => n[0]).join('').slice(0, 2) || 'G'}
                          </span>
                        </div>
                        <span className="text-sm text-white">{p.guardName}</span>
                      </div>
                    </td>
                    <td className="px-5 py-3.5 text-sm text-gray-300">{timeAgo(p.startTime)}</td>
                    <td className="px-5 py-3.5 text-sm text-gray-400">{formatDuration(p.duration)}</td>
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-2">
                        <div className="w-16 h-1.5 rounded-full bg-white/10 overflow-hidden">
                          <div
                            className={`h-full rounded-full transition-all ${cpPercent >= 80 ? 'bg-emerald-500' : cpPercent >= 50 ? 'bg-amber-500' : 'bg-red-500'}`}
                            style={{ width: `${cpPercent}%` }}
                          ></div>
                        </div>
                        <span className="text-xs text-gray-400">{p.checkpointsCompleted}/{p.checkpointsTotal}</span>
                      </div>
                    </td>
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-1.5">
                        <span className="text-xs text-emerald-400">{p.gpsVerified}</span>
                        {p.outOfRadius > 0 && (
                          <span className="text-xs text-amber-400">({p.outOfRadius} out)</span>
                        )}
                      </div>
                    </td>
                    <td className="px-5 py-3.5">
                      <span className={`inline-flex items-center gap-1.5 px-2 py-1 rounded-full text-[11px] font-medium ${cfg.bg} ${cfg.color}`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`}></span>
                        {cfg.label}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}