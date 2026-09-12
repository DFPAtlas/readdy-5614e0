'use client';

import Link from 'next/link';
import type { LoneWorkerAlert } from '@/lib/useCommandCentreExtended';

function timeAgo(iso: string | null): string {
  if (!iso) return 'Never';
  const diff = Math.floor((Date.now() - new Date(iso).getTime()) / 1000);
  if (diff < 60) return 'Just now';
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return `${Math.floor(diff / 86400)}d ago`;
}

interface Props {
  alerts: LoneWorkerAlert[];
}

export default function LoneWorkerAlertsCard({ alerts }: Props) {
  const triggeredAlarms = alerts.filter(a => a.alarm_triggered);
  const missedCheckins = alerts.filter(a => a.missed_check_ins > 0 && !a.alarm_triggered);
  const okSessions = alerts.filter(a => a.missed_check_ins === 0 && !a.alarm_triggered);

  return (
    <div className="bg-[#0f172a]/70 backdrop-blur-sm border border-white/10 rounded-xl p-4 h-full flex flex-col">
      <div className="flex items-center gap-2 mb-3">
        <div className="w-5 h-5 flex items-center justify-center text-purple-400">
          <i className="ri-radar-line text-sm"></i>
        </div>
        <h3 className="text-sm font-semibold text-white">Lone Worker</h3>
        <div className="ml-auto flex items-center gap-2">
          {triggeredAlarms.length > 0 && (
            <span className="px-1.5 py-0.5 rounded bg-red-500/10 text-red-400 text-[10px] font-semibold">{triggeredAlarms.length} alarm</span>
          )}
          <span className="text-xs text-gray-500">{alerts.length} active</span>
        </div>
      </div>

      {alerts.length === 0 ? (
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <div className="w-8 h-8 rounded-full bg-emerald-500/10 flex items-center justify-center mx-auto mb-2">
              <div className="w-4 h-4 flex items-center justify-center text-emerald-400">
                <i className="ri-check-line text-sm"></i>
              </div>
            </div>
            <p className="text-xs text-gray-500">No active lone worker sessions</p>
          </div>
        </div>
      ) : (
        <div className="flex-1 space-y-1.5 overflow-y-auto">
          {triggeredAlarms.map(a => (
            <Link key={a.id} href="/dashboard/lone-worker" className="flex items-center gap-2 p-2 rounded-lg bg-red-500/10 border border-red-500/20 hover:bg-red-500/15 transition-colors cursor-pointer">
              <span className="relative flex h-2 w-2 shrink-0">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-500 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
              </span>
              <span className="text-xs font-medium text-white truncate flex-1">{a.guard_name}</span>
              <span className="text-[10px] text-red-400 font-semibold shrink-0">ALARM</span>
            </Link>
          ))}
          {missedCheckins.map(a => (
            <Link key={a.id} href="/dashboard/lone-worker" className="flex items-center gap-2 p-2 rounded-lg bg-amber-500/5 border border-amber-500/10 hover:bg-amber-500/10 transition-colors cursor-pointer">
              <span className="w-2 h-2 rounded-full bg-amber-500 shrink-0"></span>
              <span className="text-xs font-medium text-white truncate flex-1">{a.guard_name}</span>
              <span className="text-[10px] text-amber-400 shrink-0">{a.missed_check_ins} missed</span>
            </Link>
          ))}
          {okSessions.slice(0, 3).map(a => (
            <div key={a.id} className="flex items-center gap-2 p-2">
              <span className="w-2 h-2 rounded-full bg-emerald-500 shrink-0"></span>
              <span className="text-xs text-gray-400 truncate flex-1">{a.guard_name}</span>
              <span className="text-[10px] text-gray-600">{timeAgo(a.last_check_in_at)}</span>
            </div>
          ))}
          {alerts.length > 6 && (
            <p className="text-[10px] text-gray-600 text-center pt-1">+{alerts.length - 6} more sessions</p>
          )}
        </div>
      )}
    </div>
  );
}