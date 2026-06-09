'use client';

import Link from 'next/link';
import type { GuardOnShift, MissingGuard, StaffingAlert } from '@/lib/useDashboard';
import type { Notification } from '@/lib/useNotifications';
import RequiresDatabaseHook from './RequiresDatabaseHook';

interface GuardWelfarePanelProps {
  guardsOnShift: GuardOnShift[];
  missingGuards: MissingGuard[];
  staffingAlerts: StaffingAlert[];
  notifications: Notification[];
}

function timeAgo(iso: string): string {
  const diff = Math.floor((Date.now() - new Date(iso).getTime()) / 1000);
  if (diff < 60) return 'Just now';
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return `${Math.floor(diff / 86400)}d ago`;
}

export default function GuardWelfarePanel({ guardsOnShift, missingGuards, staffingAlerts, notifications }: GuardWelfarePanelProps) {
  const lateGuards = guardsOnShift.filter(g => g.status === 'late' || g.status === 'critical_late');
  const panicAlerts = notifications.filter(n =>
    n.severity === 'critical' &&
    (n.title.toLowerCase().includes('panic') || n.title.toLowerCase().includes('sos') || n.title.toLowerCase().includes('emergency'))
  );

  return (
    <div className="bg-[#0f172a]/70 backdrop-blur-sm border border-white/10 shadow-sm rounded-xl p-4">
      <div className="flex items-center gap-2 mb-4">
        <div className="w-5 h-5 flex items-center justify-center text-pink-400">
          <i className="ri-heart-pulse-line text-sm"></i>
        </div>
        <h3 className="text-sm font-semibold text-white">Guard Welfare</h3>
      </div>

      <div className="space-y-4">
        <div>
          <h4 className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-2">Late / Missing</h4>
          {lateGuards.length === 0 && missingGuards.length === 0 ? (
            <div className="text-center py-3 text-xs text-gray-500">
              <div className="w-8 h-8 rounded-full bg-emerald-500/10 flex items-center justify-center mx-auto mb-2">
                <div className="w-4 h-4 flex items-center justify-center text-emerald-400">
                  <i className="ri-check-line text-sm"></i>
                </div>
              </div>
              All guards accounted for.
            </div>
          ) : (
            <div className="space-y-2">
              {lateGuards.map(g => (
                <div key={g.id} className="flex items-center gap-3 p-2.5 rounded-lg bg-red-500/5 border border-red-500/10">
                  <span className="relative flex h-2.5 w-2.5 shrink-0">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-500 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-red-500"></span>
                  </span>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-white truncate">{g.name}</p>
                    <p className="text-xs text-gray-500">{g.site_name} — +{g.late_minutes}m late</p>
                  </div>
                  <span className="text-[10px] text-red-400 font-medium">{timeAgo(g.clock_in)}</span>
                </div>
              ))}
              {missingGuards.map(g => (
                <div key={g.id} className="flex items-center gap-3 p-2.5 rounded-lg bg-amber-500/5 border border-amber-500/10">
                  <span className="relative flex h-2.5 w-2.5 shrink-0">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-500 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-amber-500"></span>
                  </span>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-white truncate">{g.name}</p>
                    <p className="text-xs text-gray-500">{g.site_name} — {g.reason === 'no_clock_in' ? 'No clock-in' : 'Unassigned'}</p>
                  </div>
                  <span className="text-[10px] text-amber-400 font-medium">{timeAgo(g.shift_start)}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        <div>
          <h4 className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-2">Panic / SOS Alerts</h4>
          {panicAlerts.length === 0 ? (
            <div className="text-center py-3 text-xs text-gray-500">
              <div className="w-8 h-8 rounded-full bg-emerald-500/10 flex items-center justify-center mx-auto mb-2">
                <div className="w-4 h-4 flex items-center justify-center text-emerald-400">
                  <i className="ri-check-line text-sm"></i>
                </div>
              </div>
              No panic alerts.
            </div>
          ) : (
            <div className="space-y-2">
              {panicAlerts.map(n => (
                <div key={n.id} className="flex items-center gap-3 p-2.5 rounded-lg bg-red-500/10 border border-red-500/20">
                  <div className="w-5 h-5 flex items-center justify-center text-red-400">
                    <i className="ri-alarm-warning-line text-sm"></i>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-white truncate">{n.title}</p>
                    <p className="text-xs text-gray-500">{n.body}</p>
                  </div>
                  <span className="text-[10px] text-red-400 font-medium">{timeAgo(n.created_at)}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        <div>
          <h4 className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-2">Staffing Alerts</h4>
          {staffingAlerts.length === 0 ? (
            <div className="text-center py-3 text-xs text-gray-500">
              <div className="w-8 h-8 rounded-full bg-emerald-500/10 flex items-center justify-center mx-auto mb-2">
                <div className="w-4 h-4 flex items-center justify-center text-emerald-400">
                  <i className="ri-check-line text-sm"></i>
                </div>
              </div>
              All shifts staffed.
            </div>
          ) : (
            <div className="space-y-2">
              {staffingAlerts.slice(0, 4).map(s => (
                <Link key={`${s.site_name}-${s.shift_time}`} href="/rotas" className="flex items-center gap-3 p-2.5 rounded-lg bg-blue-500/5 border border-blue-500/10 hover:bg-blue-500/10 transition-all cursor-pointer">
                  <div className="w-4 h-4 flex items-center justify-center text-blue-400">
                    <i className="ri-team-line text-sm"></i>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-white truncate">{s.site_name}</p>
                    <p className="text-xs text-gray-500">{s.guard_needed} guard needed — {new Date(s.shift_time).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })}</p>
                  </div>
                  <span className={`text-[10px] font-medium px-1.5 py-0.5 rounded ${s.severity === 'high' ? 'bg-red-500/10 text-red-400' : s.severity === 'medium' ? 'bg-amber-500/10 text-amber-400' : 'bg-blue-500/10 text-blue-400'}`}>
                    {s.severity}
                  </span>
                </Link>
              ))}
            </div>
          )}
        </div>

        <RequiresDatabaseHook feature="Lone Worker Checkins" />
      </div>
    </div>
  );
}