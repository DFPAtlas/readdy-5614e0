'use client';

import { useState } from 'react';
import { format, differenceInCalendarDays } from 'date-fns';
import { usePendingLeave } from '@/lib/usePendingLeave';

const REASON_COLORS: Record<string, string> = {
  holiday: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
  sick: 'bg-red-500/10 text-red-400 border-red-500/20',
  training: 'bg-violet-500/10 text-violet-400 border-violet-500/20',
  Annual: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
  'Annual Leave': 'bg-blue-500/10 text-blue-400 border-blue-500/20',
  'Sick Leave': 'bg-red-500/10 text-red-400 border-red-500/20',
  Other: 'bg-gray-500/10 text-gray-400 border-gray-500/20',
};

export default function LeaveApprovalPage() {
  const { pending, history, loading, actionLoading, approve, reject, refetch } = usePendingLeave();
  const [activeTab, setActiveTab] = useState<'pending' | 'history'>('pending');
  const [toast, setToast] = useState<string | null>(null);

  const handleApprove = async (id: string, name: string) => {
    const { error } = await approve(id);
    if (!error) {
      setToast(`Approved ${name}'s leave request`);
    } else {
      setToast('Failed to approve request');
    }
    setTimeout(() => setToast(null), 3000);
  };

  const handleReject = async (id: string, name: string) => {
    const { error } = await reject(id);
    if (!error) {
      setToast(`Rejected ${name}'s leave request`);
    } else {
      setToast('Failed to reject request');
    }
    setTimeout(() => setToast(null), 3000);
  };

  const rows = activeTab === 'pending' ? pending : history;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Leave Requests</h1>
          <p className="text-gray-400 text-sm mt-1">
            Review and approve guard time-off requests before they go live.
          </p>
        </div>
        {pending.length > 0 && (
          <div className="px-3 py-1.5 bg-amber-500/10 border border-amber-500/20 rounded-lg">
            <span className="text-sm text-amber-400 font-medium">
              {pending.length} pending
            </span>
          </div>
        )}
      </div>

      {/* Toast */}
      {toast && (
        <div
          className={`rounded-xl px-4 py-3 text-sm font-medium flex items-center gap-2 border ${
            toast.includes('Failed')
              ? 'bg-red-500/10 border-red-500/20 text-red-400'
              : 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400'
          }`}
        >
          <div className="w-5 h-5 flex items-center justify-center">
            <i
              className={
                toast.includes('Failed') ? 'ri-error-warning-line' : 'ri-check-line'
              }
            ></i>
          </div>
          {toast}
        </div>
      )}

      {/* Tabs */}
      <div className="bg-[#151b27] border border-gray-800 rounded-xl p-1 inline-flex">
        <button
          onClick={() => setActiveTab('pending')}
          className={`px-5 py-2 rounded-lg text-sm font-medium transition-colors cursor-pointer whitespace-nowrap ${
            activeTab === 'pending'
              ? 'bg-blue-600/15 text-blue-400'
              : 'text-gray-400 hover:text-white'
          }`}
        >
          Pending ({pending.length})
        </button>
        <button
          onClick={() => setActiveTab('history')}
          className={`px-5 py-2 rounded-lg text-sm font-medium transition-colors cursor-pointer whitespace-nowrap ${
            activeTab === 'history'
              ? 'bg-blue-600/15 text-blue-400'
              : 'text-gray-400 hover:text-white'
          }`}
        >
          History ({history.length})
        </button>
      </div>

      {/* Loading */}
      {loading && (
        <div className="flex items-center justify-center py-16">
          <div className="w-8 h-8 border-2 border-blue-500/30 border-t-blue-500 rounded-full animate-spin" />
        </div>
      )}

      {/* Empty */}
      {!loading && rows.length === 0 && (
        <div className="text-center py-20 bg-[#151b27] border border-gray-800 rounded-xl">
          <div className="w-16 h-16 bg-gray-800/50 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <i className="ri-calendar-check-line text-gray-500 text-3xl"></i>
          </div>
          <p className="text-gray-300 font-medium">
            {activeTab === 'pending'
              ? 'No pending leave requests'
              : 'No leave request history yet'}
          </p>
          <p className="text-gray-500 text-sm mt-1">
            {activeTab === 'pending'
              ? 'All caught up. New guard requests will appear here.'
              : 'Approved and rejected requests will be shown here.'}
          </p>
        </div>
      )}

      {/* List */}
      {!loading && rows.length > 0 && (
        <div className="space-y-3">
          {rows.map((r) => {
            const days =
              differenceInCalendarDays(new Date(r.end_date), new Date(r.start_date)) + 1;
            const badgeStyle =
              REASON_COLORS[r.reason] ||
              'bg-gray-500/10 text-gray-400 border-gray-500/20';
            const isPending = r.status === 'pending';
            const isApproved = r.status === 'approved';
            const initials = `${(r.first_name || '')[0]}${(r.last_name || '')[0]}`.toUpperCase();

            return (
              <div
                key={r.id}
                className={`bg-[#151b27] border rounded-xl p-5 flex flex-col sm:flex-row sm:items-center gap-4 ${
                  isPending
                    ? 'border-amber-500/15'
                    : isApproved
                    ? 'border-emerald-500/10'
                    : 'border-red-500/10'
                }`}
              >
                <div className="flex items-center gap-4 flex-1 min-w-0">
                  <div className="w-12 h-12 rounded-xl bg-gray-800 flex items-center justify-center text-sm font-bold text-gray-300 flex-shrink-0">
                    {initials}
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="text-sm font-semibold text-white">
                        {r.first_name} {r.last_name}
                      </p>
                      <span
                        className={`text-[10px] px-2 py-0.5 rounded border font-medium ${badgeStyle}`}
                      >
                        {r.reason}
                      </span>
                      {isPending && (
                        <span className="text-[10px] text-amber-400 bg-amber-500/10 px-1.5 py-0.5 rounded border border-amber-500/15">
                          Pending
                        </span>
                      )}
                      {isApproved && (
                        <span className="text-[10px] text-emerald-400 bg-emerald-500/10 px-1.5 py-0.5 rounded border border-emerald-500/15">
                          Approved
                        </span>
                      )}
                      {!isPending && !isApproved && (
                        <span className="text-[10px] text-red-400 bg-red-500/10 px-1.5 py-0.5 rounded border border-red-500/15">
                          Rejected
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-3 mt-1 text-[11px] text-gray-400">
                      <span className="flex items-center gap-1">
                        <i className="ri-calendar-line"></i>
                        {format(new Date(r.start_date), 'EEE d MMM')} —{' '}
                        {format(new Date(r.end_date), 'EEE d MMM yyyy')}
                      </span>
                      <span className="text-gray-600">·</span>
                      <span>
                        {days} day{days > 1 ? 's' : ''}
                      </span>
                      <span className="text-gray-600">·</span>
                      <span>Requested {format(new Date(r.created_at), 'd MMM')}</span>
                    </div>
                  </div>
                </div>

                {isPending && (
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <button
                      onClick={() => handleReject(r.id, `${r.first_name} ${r.last_name}`)}
                      disabled={actionLoading === r.id}
                      className="px-4 py-2 rounded-lg text-sm font-medium text-gray-300 hover:text-red-400 bg-gray-800/60 hover:bg-red-500/10 border border-gray-700 hover:border-red-500/20 transition-all disabled:opacity-50 cursor-pointer whitespace-nowrap"
                    >
                      {actionLoading === r.id ? (
                        <div className="w-4 h-4 border-2 border-gray-600/30 border-t-gray-500 rounded-full animate-spin mx-auto" />
                      ) : (
                        'Reject'
                      )}
                    </button>
                    <button
                      onClick={() => handleApprove(r.id, `${r.first_name} ${r.last_name}`)}
                      disabled={actionLoading === r.id}
                      className="px-4 py-2 rounded-lg text-sm font-medium bg-blue-600 hover:bg-blue-500 text-white transition-colors disabled:opacity-50 cursor-pointer whitespace-nowrap"
                    >
                      {actionLoading === r.id ? (
                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin mx-auto" />
                      ) : (
                        'Approve'
                      )}
                    </button>
                  </div>
                )}

                {!isPending && (
                  <div className="flex items-center gap-2 flex-shrink-0 text-sm text-gray-400">
                    <div className="w-5 h-5 flex items-center justify-center">
                      <i
                        className={
                          isApproved
                            ? 'ri-check-double-line text-emerald-400'
                            : 'ri-close-circle-line text-red-400'
                        }
                      ></i>
                    </div>
                    <span className={isApproved ? 'text-emerald-400' : 'text-red-400'}>
                      {isApproved ? 'Approved' : 'Rejected'}
                    </span>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}