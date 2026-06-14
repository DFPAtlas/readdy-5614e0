'use client';

import { useState } from 'react';
import { useAdminLeaveRequests } from '@/lib/useAdminLeaveRequests';
import { FeatureGate } from '@/lib/useEntitlements';

const STATUS_FILTERS = [
  { value: 'all', label: 'All' },
  { value: 'pending_cover', label: 'Pending Cover' },
  { value: 'approved', label: 'Approved' },
  { value: 'rejected', label: 'Rejected' },
  { value: 'expired', label: 'Expired' },
  { value: 'cancelled', label: 'Cancelled' },
];

const STATUS_BADGES: Record<string, { text: string; class: string }> = {
  pending_cover: { text: 'Pending Cover', class: 'bg-amber-500/10 text-amber-400 border-amber-500/20' },
  approved: { text: 'Approved', class: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' },
  rejected: { text: 'Rejected', class: 'bg-red-500/10 text-red-400 border-red-500/20' },
  expired: { text: 'Expired', class: 'bg-gray-500/10 text-gray-400 border-gray-500/20' },
  cancelled: { text: 'Cancelled', class: 'bg-gray-500/10 text-gray-400 border-gray-500/20' },
};

function formatShiftTime(start: string | null, end: string | null) {
  if (!start || !end) return '—';
  const s = new Date(start);
  const e = new Date(end);
  const dayFmt = new Intl.DateTimeFormat('en-GB', { weekday: 'short', day: 'numeric', month: 'short' });
  const timeFmt = new Intl.DateTimeFormat('en-GB', { hour: '2-digit', minute: '2-digit', hour12: false });
  return `${dayFmt.format(s)} · ${timeFmt.format(s)} — ${timeFmt.format(e)}`;
}

export default function LeaveRequestsAdminPage() {
  const { requests, loading, refetch } = useAdminLeaveRequests();
  const [filter, setFilter] = useState('all');

  const filtered = filter === 'all' ? requests : requests.filter((r) => r.status === filter);

  return (
    <FeatureGate feature="hasLeaveAutomation">
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white">Leave Requests</h1>
          <p className="text-gray-400 text-sm mt-1">Track shift leave requests and cover assignments</p>
        </div>
        <button
          onClick={refetch}
          className="h-9 px-3 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg text-xs font-medium text-gray-400 transition-colors cursor-pointer whitespace-nowrap flex items-center gap-1.5"
        >
          <div className="w-4 h-4 flex items-center justify-center"><i className="ri-refresh-line"></i></div>
          Refresh
        </button>
      </div>

      <div className="flex flex-wrap gap-2">
        {STATUS_FILTERS.map((f) => (
          <button
            key={f.value}
            onClick={() => setFilter(f.value)}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors cursor-pointer whitespace-nowrap ${
              filter === f.value
                ? 'bg-blue-600/15 text-blue-400 border border-blue-500/20'
                : 'bg-gray-800/40 text-gray-400 border border-transparent hover:bg-gray-800 hover:text-gray-300'
            }`}
          >
            {f.label}
            {f.value !== 'all' && (
              <span className="ml-1.5 text-[10px] text-gray-500">
                ({requests.filter((r) => r.status === f.value).length})
              </span>
            )}
          </button>
        ))}
      </div>

      {loading && (
        <div className="flex items-center justify-center py-16">
          <div className="w-8 h-8 border-2 border-blue-500/30 border-t-blue-500 rounded-full animate-spin" />
        </div>
      )}

      {!loading && filtered.length === 0 && (
        <div className="text-center py-20 bg-[#151b27] border border-gray-800 rounded-xl">
          <div className="w-16 h-16 bg-gray-800/50 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <i className="ri-calendar-check-line text-gray-500 text-3xl"></i>
          </div>
          <p className="text-gray-300 font-medium">No leave requests</p>
          <p className="text-gray-500 text-sm mt-1">
            {filter === 'all'
              ? 'Guard leave requests will appear here'
              : `No requests with status "${filter.replace(/_/g, ' ')}"`}
          </p>
        </div>
      )}

      {!loading && filtered.length > 0 && (
        <div className="bg-[#0f172a]/70 backdrop-blur-sm border border-white/10 rounded-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-white/5">
                <tr>
                  <th className="text-left text-xs font-medium text-gray-400 uppercase px-5 py-3">Guard</th>
                  <th className="text-left text-xs font-medium text-gray-400 uppercase px-5 py-3">Site & Shift</th>
                  <th className="text-left text-xs font-medium text-gray-400 uppercase px-5 py-3">Reason</th>
                  <th className="text-left text-xs font-medium text-gray-400 uppercase px-5 py-3">Status</th>
                  <th className="text-left text-xs font-medium text-gray-400 uppercase px-5 py-3">Cover Guard</th>
                  <th className="text-left text-xs font-medium text-gray-400 uppercase px-5 py-3">Blocked Reason</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {filtered.map((req) => {
                  const badge = STATUS_BADGES[req.status] || {
                    text: req.status,
                    class: 'bg-gray-500/10 text-gray-400 border-gray-500/20',
                  };
                  const initials = req.guard_name
                    .split(' ')
                    .map((n) => n[0])
                    .join('')
                    .toUpperCase();

                  return (
                    <tr key={req.id} className="hover:bg-white/5 transition-colors">
                      <td className="px-5 py-3.5">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-full bg-blue-500/10 flex items-center justify-center flex-shrink-0 text-blue-400 text-sm font-semibold">
                            {initials}
                          </div>
                          <span className="text-sm font-medium text-white">{req.guard_name}</span>
                        </div>
                      </td>
                      <td className="px-5 py-3.5">
                        <p className="text-sm text-white">{req.site_name || '—'}</p>
                        <p className="text-xs text-gray-500 mt-0.5">{formatShiftTime(req.shift_start, req.shift_end)}</p>
                      </td>
                      <td className="px-5 py-3.5">
                        <span className="text-sm text-gray-300 capitalize">{req.reason}</span>
                      </td>
                      <td className="px-5 py-3.5">
                        <span className={`text-[11px] px-2 py-1 rounded border font-medium ${badge.class}`}>
                          {badge.text}
                        </span>
                      </td>
                      <td className="px-5 py-3.5">
                        {req.cover_guard_name ? (
                          <span className="text-sm text-emerald-400">{req.cover_guard_name}</span>
                        ) : req.status === 'pending_cover' ? (
                          <span className="text-xs text-amber-400">Searching...</span>
                        ) : (
                          <span className="text-sm text-gray-500">—</span>
                        )}
                      </td>
                      <td className="px-5 py-3.5">
                        {req.blocked_reason ? (
                          <span className="text-sm text-red-400">{req.blocked_reason}</span>
                        ) : (
                          <span className="text-sm text-gray-500">—</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
    </FeatureGate>
  );
}