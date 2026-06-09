'use client';

import Link from 'next/link';
import type { StaffingAlert } from '@/lib/dashboardFetch';

interface StaffingAlertWidgetProps {
  alerts: StaffingAlert[];
  shortageSites: number;
}

const severityConfig = {
  high: { dot: 'bg-red-500', text: 'text-red-400', bg: 'bg-red-500/10', label: 'Urgent' },
  medium: { dot: 'bg-amber-500', text: 'text-amber-400', bg: 'bg-amber-500/10', label: 'Soon' },
  low: { dot: 'bg-blue-500', text: 'text-blue-400', bg: 'bg-blue-500/10', label: 'Upcoming' },
};

function timeUntil(iso: string): string {
  const diff = Math.floor((new Date(iso).getTime() - Date.now()) / (1000 * 60));
  if (diff < 0) return 'Overdue';
  if (diff < 60) return `${diff}m`;
  if (diff < 1440) return `${Math.floor(diff / 60)}h`;
  return `${Math.floor(diff / 1440)}d`;
}

function formatTime(iso: string): string {
  return new Date(iso).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' });
}

export default function StaffingAlertWidget({ alerts, shortageSites }: StaffingAlertWidgetProps) {
  return (
    <div className="bg-[#0f172a]/70 backdrop-blur-sm border border-white/10 shadow-sm rounded-xl overflow-hidden">
      <div className="flex items-center justify-between px-4 pt-4 pb-2">
        <div className="flex items-center gap-2">
          <div className="w-5 h-5 flex items-center justify-center text-amber-400">
            <i className="ri-calendar-schedule-line text-sm"></i>
          </div>
          <h3 className="text-sm font-semibold text-white">Staffing Alerts</h3>
        </div>
        <Link href="/rotas" className="text-xs text-blue-400 hover:text-blue-300 font-medium cursor-pointer">View all</Link>
      </div>

      <div className="flex items-center gap-3 px-4 pb-3">
        <div className="flex items-baseline gap-1.5">
          <span className={`text-2xl font-bold ${shortageSites > 0 ? 'text-amber-400 animate-pulse' : 'text-white'}`}>{alerts.length}</span>
          <span className="text-xs text-gray-500">unfilled shifts</span>
        </div>
        {shortageSites > 0 && (
          <span className="px-2 py-0.5 rounded-full bg-amber-500/10 border border-amber-500/20 text-[10px] font-medium text-amber-400">
            {shortageSites} site{shortageSites > 1 ? 's' : ''} affected
          </span>
        )}
      </div>

      <div className="max-h-64 overflow-y-auto">
        {alerts.length === 0 ? (
          <div className="px-4 pb-4 text-center text-xs text-gray-500 py-6">
            <div className="w-8 h-8 rounded-full bg-emerald-500/10 flex items-center justify-center mx-auto mb-2">
              <div className="w-4 h-4 flex items-center justify-center text-emerald-400">
                <i className="ri-check-line text-sm"></i>
              </div>
            </div>
            All shifts filled for the next 7 days.
          </div>
        ) : (
          alerts.map((alert, i) => {
            const cfg = severityConfig[alert.severity];
            return (
              <div key={`${alert.site_name}-${i}`} className="px-4 py-2.5 border-t border-white/5">
                <div className="flex items-center justify-between mb-1">
                  <div className="flex items-center gap-2 min-w-0">
                    <span className="relative flex h-2 w-2 shrink-0">
                      {alert.severity === 'high' && (
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-500 opacity-75"></span>
                      )}
                      <span className={`relative inline-flex rounded-full h-2 w-2 ${cfg.dot}`}></span>
                    </span>
                    <span className="text-sm font-medium text-white truncate">{alert.site_name}</span>
                  </div>
                  <span className={`px-1.5 py-0.5 rounded text-[10px] font-medium ${cfg.bg} ${cfg.text} shrink-0`}>{cfg.label}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-gray-500">Shift at {formatTime(alert.shift_time)}</span>
                  <span className="text-xs font-medium text-gray-400">In {timeUntil(alert.shift_time)}</span>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}