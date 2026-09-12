'use client';

import Link from 'next/link';
import type { GuardOnShift } from '@/lib/useDashboard';

function timeAgo(iso: string): string {
  const diff = Math.floor((Date.now() - new Date(iso).getTime()) / 1000);
  if (diff < 60) return 'Just now';
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return `${Math.floor(diff / 86400)}d ago`;
}

interface Props {
  guardsOnShift: GuardOnShift[];
}

export default function TodayShiftsWidget({ guardsOnShift }: Props) {
  const onTime = guardsOnShift.filter(g => g.status === 'on_time');
  const late = guardsOnShift.filter(g => g.status === 'late' || g.status === 'critical_late');

  return (
    <div className="bg-[#0f172a]/70 backdrop-blur-sm border border-white/10 rounded-xl p-4 h-full flex flex-col">
      <div className="flex items-center gap-2 mb-3">
        <div className="w-5 h-5 flex items-center justify-center text-emerald-400">
          <i className="ri-time-line text-sm"></i>
        </div>
        <h3 className="text-sm font-semibold text-white">Today&apos;s Shifts</h3>
        <div className="ml-auto flex items-center gap-2">
          <span className="text-xs text-emerald-400">{onTime.length} on time</span>
          {late.length > 0 && <span className="text-xs text-red-400">{late.length} late</span>}
        </div>
      </div>

      {guardsOnShift.length === 0 ? (
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <div className="w-8 h-8 rounded-full bg-gray-500/10 flex items-center justify-center mx-auto mb-2">
              <div className="w-4 h-4 flex items-center justify-center text-gray-500">
                <i className="ri-time-line text-sm"></i>
              </div>
            </div>
            <p className="text-xs text-gray-500">No active shifts today</p>
          </div>
        </div>
      ) : (
        <div className="flex-1 space-y-1 overflow-y-auto">
          {guardsOnShift.slice(0, 10).map(g => {
            const isLate = g.status === 'late' || g.status === 'critical_late';
            return (
              <Link key={g.id} href="/guards" className="flex items-center gap-2 p-2 rounded-lg hover:bg-white/5 transition-colors cursor-pointer">
                <span className={`w-2 h-2 rounded-full shrink-0 ${isLate ? 'bg-red-500' : 'bg-emerald-500'}`}></span>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-medium text-white truncate">{g.name}</p>
                  <p className="text-[10px] text-gray-500">{g.site_name}</p>
                </div>
                <span className={`text-[10px] font-medium shrink-0 ${isLate ? 'text-red-400' : 'text-emerald-400'}`}>
                  {g.status === 'critical_late' ? `+${g.late_minutes}m` : g.status === 'late' ? `+${g.late_minutes}m` : 'On time'}
                </span>
              </Link>
            );
          })}
          {guardsOnShift.length > 10 && (
            <p className="text-[10px] text-gray-600 text-center pt-1">+{guardsOnShift.length - 10} more shifts</p>
          )}
        </div>
      )}
    </div>
  );
}