'use client';

import Link from 'next/link';
import type { PendingLeaveRequest } from '@/lib/useCommandCentreExtended';

function timeAgo(iso: string): string {
  const diff = Math.floor((Date.now() - new Date(iso).getTime()) / 1000);
  if (diff < 60) return 'Just now';
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return `${Math.floor(diff / 86400)}d ago`;
}

function formatDateRange(start: string, end: string): string {
  const s = new Date(start);
  const e = new Date(end);
  const opts: Intl.DateTimeFormatOptions = { day: 'numeric', month: 'short' };
  if (s.getTime() === e.getTime()) return s.toLocaleDateString('en-GB', opts);
  return `${s.toLocaleDateString('en-GB', opts)} - ${e.toLocaleDateString('en-GB', opts)}`;
}

interface Props {
  requests: PendingLeaveRequest[];
}

export default function PendingLeaveCard({ requests }: Props) {
  return (
    <div className="bg-[#0f172a]/70 backdrop-blur-sm border border-white/10 rounded-xl p-4 h-full flex flex-col">
      <div className="flex items-center gap-2 mb-3">
        <div className="w-5 h-5 flex items-center justify-center text-amber-400">
          <i className="ri-calendar-close-line text-sm"></i>
        </div>
        <h3 className="text-sm font-semibold text-white">Pending Leave</h3>
        {requests.length > 0 && (
          <span className="ml-auto px-1.5 py-0.5 rounded bg-amber-500/10 text-amber-400 text-[10px] font-semibold">{requests.length} pending</span>
        )}
      </div>

      {requests.length === 0 ? (
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <div className="w-8 h-8 rounded-full bg-emerald-500/10 flex items-center justify-center mx-auto mb-2">
              <div className="w-4 h-4 flex items-center justify-center text-emerald-400">
                <i className="ri-check-line text-sm"></i>
              </div>
            </div>
            <p className="text-xs text-gray-500">No pending leave requests</p>
          </div>
        </div>
      ) : (
        <div className="flex-1 space-y-1 overflow-y-auto">
          {requests.slice(0, 6).map(r => (
            <Link key={r.id} href="/dashboard/leave-requests" className="flex items-center gap-2 p-2 rounded-lg hover:bg-white/5 transition-colors cursor-pointer">
              <span className="w-2 h-2 rounded-full bg-amber-500 shrink-0"></span>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-medium text-white truncate">{r.guard_name}</p>
                <p className="text-[10px] text-gray-500">{formatDateRange(r.start_time, r.end_time)} · {r.reason}</p>
              </div>
              <span className="text-[10px] text-gray-600 shrink-0">{timeAgo(r.created_at)}</span>
            </Link>
          ))}
          {requests.length > 6 && (
            <p className="text-[10px] text-gray-600 text-center pt-1">+{requests.length - 6} more requests</p>
          )}
        </div>
      )}
    </div>
  );
}