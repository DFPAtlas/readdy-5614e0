'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useGuardAuth } from '@/lib/useGuardAuth';
import { useGuardLeaveRequests } from '@/lib/useGuardLeaveRequests';
import GuardTopBar from '../components/GuardTopBar';
import GuardBottomNav from '../components/GuardBottomNav';

const REASON_OPTIONS = [
  { value: 'holiday', label: 'Holiday' },
  { value: 'sick', label: 'Sick Leave' },
  { value: 'training', label: 'Training' },
  { value: 'other', label: 'Other' },
];

const RESPONSE_OPTIONS = [
  { value: 60, label: '1 hour' },
  { value: 120, label: '2 hours' },
  { value: 240, label: '4 hours' },
  { value: 480, label: '8 hours' },
];

function formatShiftTime(start: string, end: string) {
  const s = new Date(start);
  const e = new Date(end);
  const sameDay = s.toDateString() === e.toDateString();
  const dayFmt = new Intl.DateTimeFormat('en-GB', { weekday: 'short', day: 'numeric', month: 'short' });
  const timeFmt = new Intl.DateTimeFormat('en-GB', { hour: '2-digit', minute: '2-digit', hour12: false });
  if (sameDay) {
    return `${dayFmt.format(s)} · ${timeFmt.format(s)} — ${timeFmt.format(e)}`;
  }
  return `${dayFmt.format(s)} ${timeFmt.format(s)} — ${dayFmt.format(e)} ${timeFmt.format(e)}`;
}

function statusBadge(status: string) {
  if (status === 'pending_cover') return { text: 'Pending Cover', class: 'bg-amber-500/15 text-amber-400 border-amber-500/20' };
  if (status === 'approved') return { text: 'Approved', class: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/20' };
  if (status === 'rejected') return { text: 'Rejected', class: 'bg-red-500/15 text-red-400 border-red-500/20' };
  if (status === 'expired') return { text: 'Expired', class: 'bg-gray-500/15 text-gray-400 border-gray-500/20' };
  if (status === 'cancelled') return { text: 'Cancelled', class: 'bg-gray-500/15 text-gray-400 border-gray-500/20' };
  return { text: status, class: 'bg-gray-500/15 text-gray-400 border-gray-500/20' };
}

export default function GuardShiftsPage() {
  const g = useGuardAuth();
  const router = useRouter();
  const { futureShifts, leaveRequests, loading, submitting, requestLeave, refetch } = useGuardLeaveRequests(
    g.currentUser?.id || null,
    g.companyId
  );

  const [modalOpen, setModalOpen] = useState(false);
  const [selectedShift, setSelectedShift] = useState<string | null>(null);
  const [reason, setReason] = useState('holiday');
  const [notes, setNotes] = useState('');
  const [responseMinutes, setResponseMinutes] = useState(120);
  const [toast, setToast] = useState<string | null>(null);
  const [toastType, setToastType] = useState<'success' | 'error'>('success');

  const openModal = (shiftId: string) => {
    setSelectedShift(shiftId);
    setReason('holiday');
    setNotes('');
    setResponseMinutes(120);
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    setSelectedShift(null);
    setNotes('');
  };

  const handleSubmit = async () => {
    if (!selectedShift) return;
    const { data, error } = await requestLeave(selectedShift, reason, notes, responseMinutes);
    closeModal();

    if (error) {
      setToastType('error');
      setToast('Failed to submit leave request. Try again.');
    } else {
      const result = data as any;
      if (result?.ok === false || result?.status === 'rejected') {
        setToastType('error');
        setToast(`Leave cannot be approved automatically: ${result?.reason || result?.blocked_reason || 'Unknown reason'}`);
      } else {
        setToastType('success');
        setToast('Leave request submitted. Available guards have been asked to cover this shift.');
      }
    }
    setTimeout(() => setToast(null), 6000);
  };

  const now = Date.now();
  const upcomingShifts = futureShifts.filter((s) => new Date(s.start_time).getTime() > now);
  const pastShifts = futureShifts.filter((s) => new Date(s.end_time).getTime() <= now);

  if (g.loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <i className="ri-loader-4-line animate-spin text-[#3b82f6] text-2xl"></i>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white flex flex-col">
      <GuardTopBar siteName="My Shifts" />
      <main className="flex-1 pt-14 pb-[72px] overflow-y-auto max-w-lg mx-auto w-full">
        {toast && (
          <div className="px-4 pt-4">
            <div
              className={`rounded-xl px-4 py-3 text-sm font-medium flex items-center gap-2 border ${
                toastType === 'error'
                  ? 'bg-red-500/10 border-red-500/20 text-red-400'
                  : 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400'
              }`}
            >
              <div className="w-5 h-5 flex items-center justify-center">
                <i className={toastType === 'error' ? 'ri-error-warning-line' : 'ri-check-line'}></i>
              </div>
              {toast}
            </div>
          </div>
        )}

        <div className="px-4 pt-4 pb-2">
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <div className="w-5 h-5 flex items-center justify-center">
              <i className="ri-calendar-event-line text-[#3b82f6]"></i>
            </div>
            Upcoming Shifts
          </h2>
          <p className="text-xs text-gray-500 mt-1">
            Request leave on shifts you cannot work
          </p>
        </div>

        {loading ? (
          <div className="px-4 py-8 flex items-center justify-center">
            <i className="ri-loader-4-line animate-spin text-[#3b82f6] text-2xl"></i>
          </div>
        ) : upcomingShifts.length === 0 ? (
          <div className="px-4 py-8 text-center">
            <div className="w-14 h-14 bg-white/5 rounded-2xl flex items-center justify-center mx-auto mb-3">
              <i className="ri-calendar-line text-gray-500 text-2xl"></i>
            </div>
            <p className="text-sm text-gray-400">No upcoming shifts</p>
            <p className="text-xs text-gray-600 mt-1">Your rota is clear for now</p>
          </div>
        ) : (
          <div className="px-4 space-y-3">
            {upcomingShifts.map((shift) => {
              const isCompleted = shift.status === 'completed';
              const isCancelled = shift.status === 'cancelled';
              const hasLeave = shift.hasLeaveRequest;
              const leaveBadge = hasLeave ? statusBadge(shift.leaveRequestStatus || '') : null;
              const canRequest = !isCompleted && !isCancelled && !hasLeave;

              return (
                <div
                  key={shift.id}
                  className={`bg-[#1a1a1a] border rounded-2xl p-4 ${
                    isCancelled
                      ? 'border-white/5 opacity-40'
                      : hasLeave && leaveBadge
                      ? `border-${leaveBadge.text === 'Pending Cover' ? 'amber' : leaveBadge.text === 'Approved' ? 'emerald' : leaveBadge.text === 'Rejected' ? 'red' : 'gray'}-500/15`
                      : 'border-white/5'
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-semibold text-white truncate">
                        {shift.site_name || 'Unknown Site'}
                      </p>
                      <p className="text-xs text-gray-400 mt-1">
                        {formatShiftTime(shift.start_time, shift.end_time)}
                      </p>
                      <div className="flex items-center gap-2 mt-2">
                        {hasLeave && leaveBadge && (
                          <span
                            className={`text-[10px] px-2 py-0.5 rounded border font-medium ${leaveBadge.class}`}
                          >
                            {leaveBadge.text}
                          </span>
                        )}
                        {isCancelled && (
                          <span className="text-[10px] px-2 py-0.5 rounded border font-medium bg-gray-500/15 text-gray-400 border-gray-500/20">
                            Cancelled
                          </span>
                        )}
                        {isCompleted && (
                          <span className="text-[10px] px-2 py-0.5 rounded border font-medium bg-gray-500/15 text-gray-400 border-gray-500/20">
                            Completed
                          </span>
                        )}
                      </div>
                    </div>
                    {canRequest && (
                      <button
                        onClick={() => openModal(shift.id)}
                        className="flex-shrink-0 h-9 px-3 bg-[#3b82f6]/15 hover:bg-[#3b82f6]/25 border border-[#3b82f6]/20 rounded-xl text-xs font-medium text-[#3b82f6] transition-colors cursor-pointer whitespace-nowrap flex items-center gap-1.5"
                      >
                        <div className="w-4 h-4 flex items-center justify-center">
                          <i className="ri-calendar-close-line"></i>
                        </div>
                        Request Leave
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {leaveRequests.length > 0 && (
          <div className="px-4 pt-6 pb-2">
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <div className="w-5 h-5 flex items-center justify-center">
                <i className="ri-history-line text-gray-400"></i>
              </div>
              Leave History
            </h2>
          </div>
        )}

        {leaveRequests.length > 0 && (
          <div className="px-4 space-y-2 pb-4">
            {leaveRequests.map((req) => {
              const badge = statusBadge(req.status);
              return (
                <div key={req.id} className="bg-[#1a1a1a] border border-white/5 rounded-xl p-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-white">
                      {req.site_name || 'Unknown Site'}
                    </span>
                    <span className={`text-[10px] px-2 py-0.5 rounded border font-medium ${badge.class}`}>
                      {badge.text}
                    </span>
                  </div>
                  <p className="text-xs text-gray-400 mt-1 capitalize">{req.reason}</p>
                  {req.blocked_reason && (
                    <p className="text-[11px] text-red-400 mt-1">{req.blocked_reason}</p>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </main>

      <GuardBottomNav />

      {modalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 flex items-end justify-center">
          <div className="bg-[#1a1a1a] border border-white/10 rounded-t-3xl w-full max-w-lg mx-auto p-6 animate-in slide-in-from-bottom duration-200">
            <div className="w-12 h-1 bg-white/20 rounded-full mx-auto mb-6" />
            <h3 className="text-lg font-bold text-white mb-1">Request Leave</h3>
            <p className="text-xs text-gray-400 mb-5">
              Other guards will be asked to cover this shift
            </p>

            <div className="space-y-4">
              <div>
                <label className="text-xs text-gray-400 mb-2 block">Reason</label>
                <div className="grid grid-cols-2 gap-2">
                  {REASON_OPTIONS.map((r) => (
                    <button
                      key={r.value}
                      onClick={() => setReason(r.value)}
                      className={`py-2.5 px-3 rounded-xl text-xs font-medium border transition-colors cursor-pointer whitespace-nowrap ${
                        reason === r.value
                          ? 'bg-[#3b82f6]/15 text-[#3b82f6] border-[#3b82f6]/25'
                          : 'bg-black/40 text-gray-400 border-white/10 hover:border-white/20'
                      }`}
                    >
                      {r.label}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-xs text-gray-400 mb-2 block">Notes</label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Any additional details..."
                  maxLength={500}
                  rows={3}
                  className="w-full bg-black/40 border border-white/10 rounded-xl px-3 py-2.5 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-[#3b82f6]/40 transition-colors resize-none"
                />
                <p className="text-[10px] text-gray-600 mt-1 text-right">{notes.length}/500</p>
              </div>

              <div>
                <label className="text-xs text-gray-400 mb-2 block">Response Time</label>
                <div className="grid grid-cols-4 gap-2">
                  {RESPONSE_OPTIONS.map((opt) => (
                    <button
                      key={opt.value}
                      onClick={() => setResponseMinutes(opt.value)}
                      className={`py-2.5 px-2 rounded-xl text-xs font-medium border transition-colors cursor-pointer whitespace-nowrap ${
                        responseMinutes === opt.value
                          ? 'bg-[#3b82f6]/15 text-[#3b82f6] border-[#3b82f6]/25'
                          : 'bg-black/40 text-gray-400 border-white/10 hover:border-white/20'
                      }`}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
                <p className="text-[11px] text-gray-500 mt-1.5">
                  Guards have this long to respond before the offer expires
                </p>
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  onClick={closeModal}
                  className="flex-1 h-14 bg-white/5 hover:bg-white/10 text-gray-400 font-medium rounded-xl cursor-pointer transition-colors whitespace-nowrap"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSubmit}
                  disabled={submitting}
                  className="flex-1 h-14 bg-[#3b82f6] hover:bg-blue-500 disabled:opacity-40 text-white font-semibold rounded-xl transition-all active:scale-[0.98] cursor-pointer flex items-center justify-center gap-2 whitespace-nowrap"
                >
                  {submitting ? (
                    <i className="ri-loader-4-line animate-spin text-lg"></i>
                  ) : (
                    <>
                      <div className="w-5 h-5 flex items-center justify-center">
                        <i className="ri-send-plane-line"></i>
                      </div>
                      Submit Request
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}