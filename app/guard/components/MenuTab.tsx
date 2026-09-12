'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/lib/auth';
import { supabase } from '@/lib/supabase';
import Link from 'next/link';

const REASON_OPTIONS = [
  { value: 'holiday', label: 'Holiday', color: 'bg-blue-500/15 text-blue-400 border-blue-500/25' },
  { value: 'sick', label: 'Sick Leave', color: 'bg-red-500/15 text-red-400 border-red-500/25' },
  { value: 'training', label: 'Training', color: 'bg-violet-500/15 text-violet-400 border-violet-500/25' },
  { value: 'other', label: 'Other', color: 'bg-gray-500/15 text-gray-400 border-gray-500/25' },
];

interface TimeOffEntry {
  id: string;
  start_date: string;
  end_date: string;
  reason: string;
  approved: boolean;
}

export default function MenuTab() {
  const { profile, signOut } = useAuth();
  const [guard, setGuard] = useState<any>(null);
  const [timeOff, setTimeOff] = useState<TimeOffEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({ start_date: '', end_date: '', reason: 'holiday' });
  const [submitting, setSubmitting] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'profile' | 'leave'>('profile');

  useEffect(() => {
    if (!profile?.id) return;
    loadGuard();
  }, [profile?.id]);

  const loadGuard = async () => {
    setLoading(true);
    const { data } = await supabase
      .from('guards')
      .select('id, first_name, last_name, email, phone, sia_licence, sia_expiry, status, hourly_rate, skills')
      .eq('user_id', profile!.id)
      .maybeSingle();
    setGuard(data);
    if (data) {
      await loadTimeOff(data.id);
    } else {
      setLoading(false);
    }
  };

  const loadTimeOff = async (guardId: string) => {
    const { data } = await supabase
      .from('guard_time_off')
      .select('id, start_date, end_date, reason, approved, status')
      .eq('guard_id', guardId)
      .order('start_date', { ascending: false });
    setTimeOff(data || []);
    setLoading(false);
  };

  const handleSubmit = async () => {
    if (!guard?.id || !form.start_date || !form.end_date) return;
    if (new Date(form.start_date) > new Date(form.end_date)) {
      setToast('End date must be after start date');
      setTimeout(() => setToast(null), 3000);
      return;
    }
    setSubmitting(true);
    const { error } = await supabase.from('guard_time_off').insert({
      guard_id: guard.id,
      start_date: form.start_date,
      end_date: form.end_date,
      reason: form.reason,
      approved: false,
      status: 'pending',
    });
    if (!error) {
      setToast('Leave request submitted for approval');
      setForm({ start_date: '', end_date: '', reason: 'holiday' });
      loadTimeOff(guard.id);
    } else {
      setToast('Failed to book leave');
    }
    setSubmitting(false);
    setTimeout(() => setToast(null), 3000);
  };

  const handleDelete = async (id: string) => {
    const { error } = await supabase.from('guard_time_off').delete().eq('id', id);
    if (!error && guard) {
      setToast('Leave cancelled');
      loadTimeOff(guard.id);
    } else {
      setToast('Failed to cancel');
    }
    setTimeout(() => setToast(null), 3000);
  };

  const initials = `${guard?.first_name?.[0] || ''}${guard?.last_name?.[0] || ''}`.toUpperCase() || 'G';
  const siaValid = guard?.sia_expiry && new Date(guard.sia_expiry) > new Date();
  const siaDays = guard?.sia_expiry
    ? Math.ceil((new Date(guard.sia_expiry).getTime() - Date.now()) / (1000 * 60 * 60 * 24))
    : null;

  const upcoming = timeOff.filter((t) => new Date(t.end_date) >= new Date());
  const past = timeOff.filter((t) => new Date(t.end_date) < new Date());

  return (
    <div className="flex flex-col min-h-full pb-24">
      {/* Toast */}
      {toast && (
        <div className="px-4 pt-4">
          <div
            className={`rounded-xl px-4 py-3 text-sm font-medium flex items-center gap-2 ${
              toast.includes('Failed') || toast.includes('must be')
                ? 'bg-red-500/10 border border-red-500/20 text-red-400'
                : 'bg-emerald-500/10 border border-emerald-500/20 text-emerald-400'
            }`}
          >
            <div className="w-5 h-5 flex items-center justify-center">
              <i
                className={
                  toast.includes('Failed') || toast.includes('must be') ? 'ri-error-warning-line' : 'ri-check-line'
                }
              ></i>
            </div>
            {toast}
          </div>
        </div>
      )}

      {/* Tabs */}
      <div className="px-4 pt-4 pb-2">
        <div className="bg-[#1a1a1a] border border-white/5 rounded-xl p-1 flex">
          <button
            onClick={() => setActiveTab('profile')}
            className={`flex-1 py-2.5 text-sm font-medium rounded-lg transition-colors cursor-pointer whitespace-nowrap ${
              activeTab === 'profile' ? 'bg-white/10 text-white' : 'text-gray-400 hover:text-white'
            }`}
          >
            Profile
          </button>
          <button
            onClick={() => setActiveTab('leave')}
            className={`flex-1 py-2.5 text-sm font-medium rounded-lg transition-colors cursor-pointer whitespace-nowrap ${
              activeTab === 'leave' ? 'bg-white/10 text-white' : 'text-gray-400 hover:text-white'
            }`}
          >
            Book Leave ({upcoming.length})
          </button>
        </div>
      </div>

      {activeTab === 'profile' && (
        <div className="px-4 py-2 space-y-4">
          {/* Profile Card */}
          <div className="bg-[#1a1a1a] border border-white/5 rounded-2xl p-5">
            <div className="flex items-center gap-4 mb-5">
              <div className="w-16 h-16 rounded-2xl bg-[#3b82f6]/15 flex items-center justify-center text-[#3b82f6] text-xl font-bold">
                {initials}
              </div>
              <div>
                <h2 className="text-lg font-bold text-white">
                  {guard?.first_name || ''} {guard?.last_name || ''}
                </h2>
                <p className="text-sm text-gray-400">{profile?.email}</p>
                <div className="flex items-center gap-2 mt-1.5">
                  <span
                    className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${
                      guard?.status === 'active'
                        ? 'bg-emerald-500/15 text-emerald-400'
                        : 'bg-amber-500/15 text-amber-400'
                    }`}
                  >
                    {guard?.status ? guard.status.charAt(0).toUpperCase() + guard.status.slice(1) : 'Active'}
                  </span>
                  <span className="text-[10px] text-gray-500">
                    {guard?.hourly_rate ? `£${Number(guard.hourly_rate).toFixed(2)}/hr` : ''}
                  </span>
                </div>
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between py-2 border-b border-white/5">
                <span className="text-sm text-gray-400 flex items-center gap-2">
                  <div className="w-4 h-4 flex items-center justify-center">
                    <i className="ri-phone-line text-xs"></i>
                  </div>
                  Phone
                </span>
                <span className="text-sm text-white">{guard?.phone || '—'}</span>
              </div>
              <div className="flex items-center justify-between py-2 border-b border-white/5">
                <span className="text-sm text-gray-400 flex items-center gap-2">
                  <div className="w-4 h-4 flex items-center justify-center">
                    <i className="ri-shield-check-line text-xs"></i>
                  </div>
                  SIA Licence
                </span>
                <span className="text-sm text-white font-mono">
                  {guard?.sia_licence ? `****${guard.sia_licence.slice(-4)}` : '—'}
                </span>
              </div>
              <div className="flex items-center justify-between py-2 border-b border-white/5">
                <span className="text-sm text-gray-400 flex items-center gap-2">
                  <div className="w-4 h-4 flex items-center justify-center">
                    <i className="ri-calendar-check-line text-xs"></i>
                  </div>
                  SIA Expiry
                </span>
                <span
                  className={`text-sm font-medium ${
                    siaValid ? (siaDays != null && siaDays <= 30 ? 'text-amber-400' : 'text-emerald-400') : 'text-red-400'
                  }`}
                >
                  {guard?.sia_expiry || '—'}
                  {siaDays != null && siaDays >= 0 && siaDays <= 30 && ` (${siaDays}d)`}
                </span>
              </div>
              {guard?.skills && guard.skills.length > 0 && (
                <div className="pt-1">
                  <span className="text-sm text-gray-400 flex items-center gap-2 mb-2">
                    <div className="w-4 h-4 flex items-center justify-center">
                      <i className="ri-award-line text-xs"></i>
                    </div>
                    Skills
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {guard.skills.map((skill: string) => (
                      <span
                        key={skill}
                        className="text-[11px] px-2 py-1 rounded-lg bg-white/5 text-gray-300 border border-white/5"
                      >
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Quick Actions */}
          <div className="grid grid-cols-2 gap-3">
            <Link
              href="/guard/notices"
              className="bg-[#1a1a1a] border border-white/5 rounded-xl p-4 flex items-center gap-3 cursor-pointer active:scale-[0.97] transition-transform"
            >
              <div className="w-10 h-10 rounded-xl bg-amber-500/15 flex items-center justify-center">
                <i className="ri-article-line text-amber-400 text-lg"></i>
              </div>
              <div>
                <p className="text-sm font-medium text-white whitespace-nowrap">Site Notices</p>
                <p className="text-[11px] text-gray-500">Important updates</p>
              </div>
            </Link>
            <Link
              href="/guard/reports"
              className="bg-[#1a1a1a] border border-white/5 rounded-xl p-4 flex items-center gap-3 cursor-pointer active:scale-[0.97] transition-transform"
            >
              <div className="w-10 h-10 rounded-xl bg-[#3b82f6]/15 flex items-center justify-center">
                <i className="ri-file-list-line text-[#3b82f6] text-lg"></i>
              </div>
              <div>
                <p className="text-sm font-medium text-white whitespace-nowrap">My Reports</p>
                <p className="text-[11px] text-gray-500">Incident history</p>
              </div>
            </Link>
            <Link
              href="/guard/shifts"
              className="bg-[#1a1a1a] border border-white/5 rounded-xl p-4 flex items-center gap-3 cursor-pointer active:scale-[0.97] transition-transform"
            >
              <div className="w-10 h-10 rounded-xl bg-[#3b82f6]/15 flex items-center justify-center">
                <i className="ri-calendar-event-line text-[#3b82f6] text-lg"></i>
              </div>
              <div>
                <p className="text-sm font-medium text-white whitespace-nowrap">My Shifts</p>
                <p className="text-[11px] text-gray-500">Request leave & view rota</p>
              </div>
            </Link>
            <Link
              href="/guard/cover-offers"
              className="bg-[#1a1a1a] border border-white/5 rounded-xl p-4 flex items-center gap-3 cursor-pointer active:scale-[0.97] transition-transform"
            >
              <div className="w-10 h-10 rounded-xl bg-emerald-500/15 flex items-center justify-center">
                <i className="ri-hand-heart-line text-emerald-400 text-lg"></i>
              </div>
              <div>
                <p className="text-sm font-medium text-white whitespace-nowrap">Cover Offers</p>
                <p className="text-[11px] text-gray-500">Pick up available shifts</p>
              </div>
            </Link>
            <Link
              href="/guard/messages"
              className="bg-[#1a1a1a] border border-white/5 rounded-xl p-4 flex items-center gap-3 cursor-pointer active:scale-[0.97] transition-transform"
            >
              <div className="w-10 h-10 rounded-xl bg-violet-500/15 flex items-center justify-center">
                <i className="ri-chat-3-line text-violet-400 text-lg"></i>
              </div>
              <div>
                <p className="text-sm font-medium text-white whitespace-nowrap">Messages</p>
                <p className="text-[11px] text-gray-500">Control room chat</p>
              </div>
            </Link>
            <Link
              href="/guard/training"
              className="bg-[#1a1a1a] border border-white/5 rounded-xl p-4 flex items-center gap-3 cursor-pointer active:scale-[0.97] transition-transform"
            >
              <div className="w-10 h-10 rounded-xl bg-amber-500/15 flex items-center justify-center">
                <i className="ri-graduation-cap-line text-amber-400 text-lg"></i>
              </div>
              <div>
                <p className="text-sm font-medium text-white whitespace-nowrap">My Training</p>
                <p className="text-[11px] text-gray-500">Certifications & modules</p>
              </div>
            </Link>
          </div>
        </div>
      )}

      {activeTab === 'leave' && (
        <div className="px-4 py-2 space-y-4">
          {/* Book Form */}
          <div className="bg-[#1a1a1a] border border-white/5 rounded-2xl p-5 space-y-4">
            <h3 className="text-base font-semibold text-white flex items-center gap-2">
              <div className="w-5 h-5 flex items-center justify-center">
                <i className="ri-calendar-event-line text-[#3b82f6]"></i>
              </div>
              Request Time Off
            </h3>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs text-gray-400 mb-1.5 block">From</label>
                <input
                  type="date"
                  value={form.start_date}
                  onChange={(e) => setForm({ ...form, start_date: e.target.value })}
                  className="w-full bg-black/40 border border-white/10 rounded-xl px-3 py-2.5 text-sm text-white focus:outline-none focus:border-[#3b82f6]/40 transition-colors"
                />
              </div>
              <div>
                <label className="text-xs text-gray-400 mb-1.5 block">Until</label>
                <input
                  type="date"
                  value={form.end_date}
                  onChange={(e) => setForm({ ...form, end_date: e.target.value })}
                  className="w-full bg-black/40 border border-white/10 rounded-xl px-3 py-2.5 text-sm text-white focus:outline-none focus:border-[#3b82f6]/40 transition-colors"
                />
              </div>
            </div>

            <div>
              <label className="text-xs text-gray-400 mb-1.5 block">Reason</label>
              <div className="grid grid-cols-2 gap-2">
                {REASON_OPTIONS.map((r) => (
                  <button
                    key={r.value}
                    onClick={() => setForm({ ...form, reason: r.value })}
                    className={`py-2.5 px-3 rounded-xl text-xs font-medium border transition-colors cursor-pointer whitespace-nowrap ${
                      form.reason === r.value
                        ? `${r.color}`
                        : 'bg-black/40 text-gray-400 border-white/10 hover:border-white/20'
                    }`}
                  >
                    {r.label}
                  </button>
                ))}
              </div>
            </div>

            <button
              onClick={handleSubmit}
              disabled={submitting || !form.start_date || !form.end_date}
              className="w-full h-14 bg-[#3b82f6] hover:bg-blue-500 disabled:opacity-30 text-white font-semibold rounded-xl transition-all active:scale-[0.98] cursor-pointer flex items-center justify-center gap-2"
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
            <p className="text-[11px] text-gray-500 text-center">Your manager will review and approve your request.</p>
          </div>

          {/* Upcoming Leave */}
          {upcoming.length > 0 && (
            <div>
              <h4 className="text-xs text-gray-400 uppercase tracking-wider mb-3">Upcoming Leave</h4>
              <div className="space-y-2">
                {upcoming.map((entry) => {
                  const reason = REASON_OPTIONS.find((r) => r.value === entry.reason);
                  const isSick = entry.reason === 'sick';
                  const isPending = !entry.approved || entry.status === 'pending';
                  const isRejected = entry.status === 'rejected';
                  return (
                    <div
                      key={entry.id}
                      className={`bg-[#1a1a1a] border rounded-xl p-4 flex items-center justify-between ${
                        isRejected ? 'border-red-500/15 opacity-50' : isPending ? 'border-amber-500/15' : isSick ? 'border-red-500/15' : 'border-white/5'
                      }`}
                    >
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <span
                            className={`text-[10px] px-1.5 py-0.5 rounded border font-medium ${
                              reason?.color || 'bg-gray-500/15 text-gray-400 border-gray-500/25'
                            }`}
                          >
                            {reason?.label || entry.reason}
                          </span>
                          {isPending && (
                            <span className="text-[10px] text-amber-400 bg-amber-500/10 px-1.5 py-0.5 rounded border border-amber-500/15">
                              Pending Approval
                            </span>
                          )}
                          {isRejected && (
                            <span className="text-[10px] text-red-400 bg-red-500/10 px-1.5 py-0.5 rounded border border-red-500/15">
                              Rejected
                            </span>
                          )}
                        </div>
                        <p className="text-sm text-white">
                          {entry.start_date} — {entry.end_date}
                        </p>
                        <p className="text-[11px] text-gray-500 mt-0.5">
                          {Math.ceil(
                            (new Date(entry.end_date).getTime() - new Date(entry.start_date).getTime()) /
                              (1000 * 60 * 60 * 24)
                          ) + 1}{' '}
                          days
                        </p>
                      </div>
                      {isPending && (
                        <button
                          onClick={() => handleDelete(entry.id)}
                          className="w-9 h-9 flex items-center justify-center rounded-lg bg-white/5 text-gray-400 hover:text-red-400 hover:bg-red-500/10 transition-colors cursor-pointer"
                        >
                          <div className="w-4 h-4 flex items-center justify-center">
                            <i className="ri-delete-bin-line text-sm"></i>
                          </div>
                        </button>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Past Leave */}
          {past.length > 0 && (
            <div>
              <h4 className="text-xs text-gray-400 uppercase tracking-wider mb-3">Past Leave</h4>
              <div className="space-y-2">
                {past.slice(0, 5).map((entry) => {
                  const reason = REASON_OPTIONS.find((r) => r.value === entry.reason);
                  const isRejected = entry.status === 'rejected';
                  return (
                    <div key={entry.id} className={`bg-[#1a1a1a] border rounded-xl p-3 ${isRejected ? 'border-red-500/10 opacity-40' : 'border-white/5 opacity-60'}`}>
                      <div className="flex items-center gap-2 mb-1">
                        <span
                          className={`text-[10px] px-1.5 py-0.5 rounded border font-medium ${
                            reason?.color || 'bg-gray-500/15 text-gray-400 border-gray-500/25'
                          }`}
                        >
                          {reason?.label || entry.reason}
                        </span>
                        {isRejected && (
                          <span className="text-[10px] text-red-400">Rejected</span>
                        )}
                      </div>
                      <p className="text-xs text-gray-400">
                        {entry.start_date} — {entry.end_date}
                      </p>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {timeOff.length === 0 && !loading && (
            <div className="text-center py-10">
              <div className="w-14 h-14 bg-white/5 rounded-2xl flex items-center justify-center mx-auto mb-3">
                <i className="ri-calendar-line text-gray-500 text-2xl"></i>
              </div>
              <p className="text-sm text-gray-400">No leave booked yet</p>
              <p className="text-xs text-gray-600 mt-1">Use the form above to request time off</p>
            </div>
          )}
        </div>
      )}

      {/* Sign Out */}
      <div className="px-4 pt-4 pb-6">
        <button
          onClick={async () => {
            await signOut();
          }}
          className="w-full h-14 bg-white/5 hover:bg-white/10 text-red-400 font-medium rounded-xl transition-colors cursor-pointer flex items-center justify-center gap-2"
        >
          <div className="w-5 h-5 flex items-center justify-center">
            <i className="ri-logout-circle-r-line"></i>
          </div>
          Sign Out
        </button>
      </div>
    </div>
  );
}