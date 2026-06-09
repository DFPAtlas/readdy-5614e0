'use client';

import { useState, useMemo } from 'react';
import { format, startOfMonth, endOfMonth, startOfWeek, endOfWeek, addDays, isSameMonth, isSameDay, addMonths, subMonths } from 'date-fns';
import { useGuardAvailability, addTimeOff, deleteTimeOff, setGuardAvailability, type GuardTimeOff, type GuardAvailability } from '@/lib/useGuardAvailability';
import { useGuards, type Guard } from '@/lib/useGuards';
import Toast from '@/app/sites/components/Toast';
import Link from 'next/link';

const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
const REASON_OPTIONS = [
  { label: 'Annual Leave', value: 'Annual Leave', color: 'text-blue-400 bg-blue-500/10' },
  { label: 'Sick Leave', value: 'Sick Leave', color: 'text-red-400 bg-red-500/10' },
  { label: 'Training', value: 'Training', color: 'text-violet-400 bg-violet-500/10' },
  { label: 'Unpaid Leave', value: 'Unpaid Leave', color: 'text-amber-400 bg-amber-500/10' },
  { label: 'Emergency', value: 'Emergency', color: 'text-rose-400 bg-rose-500/10' },
  { label: 'Other', value: 'Other', color: 'text-gray-400 bg-gray-500/10' },
];

export default function GuardAvailabilityPage() {
  const { guards, loading: guardsLoading } = useGuards();
  const { timeOff, availability, refetch, guards: availGuards, loading, allTimeOff } = useGuardAvailability();
  const [selectedGuard, setSelectedGuard] = useState<string | null>(null);
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [toast, setToast] = useState<string | null>(null);

  const [timeOffOpen, setTimeOffOpen] = useState(false);
  const [timeOffStart, setTimeOffStart] = useState('');
  const [timeOffEnd, setTimeOffEnd] = useState('');
  const [timeOffReason, setTimeOffReason] = useState('Annual Leave');
  const [savingTimeOff, setSavingTimeOff] = useState(false);

  const [editAvailability, setEditAvailability] = useState(false);
  const [availabilityDraft, setAvailabilityDraft] = useState<Record<number, { start: string; end: string; available: boolean }>>();

  const activeGuards = guards.filter((g) => g.status === 'active');

  const guard = activeGuards.find((g) => g.id === selectedGuard);

  const guardTimeOff = useMemo(() => {
    if (!selectedGuard) return [];
    return allTimeOff.filter((t) => t.guard_id === selectedGuard);
  }, [allTimeOff, selectedGuard]);

  const guardAvail = useMemo(() => {
    if (!selectedGuard) return [];
    return availability.filter((a) => a.guard_id === selectedGuard);
  }, [availability, selectedGuard]);

  const openAddTimeOff = () => {
    if (!selectedGuard) return;
    setTimeOffStart(format(new Date(), 'yyyy-MM-dd'));
    setTimeOffEnd(format(new Date(), 'yyyy-MM-dd'));
    setTimeOffReason('Annual Leave');
    setTimeOffOpen(true);
  };

  const handleSaveTimeOff = async () => {
    if (!selectedGuard || !timeOffStart || !timeOffEnd) return;
    setSavingTimeOff(true);
    const { error } = await addTimeOff(selectedGuard, timeOffStart, timeOffEnd, timeOffReason);
    if (!error) {
      setToast('Leave added');
      refetch();
      setTimeOffOpen(false);
    } else {
      setToast('Failed to add leave');
    }
    setSavingTimeOff(false);
  };

  const handleDeleteTimeOff = async (id: string) => {
    const { error } = await deleteTimeOff(id);
    if (!error) {
      setToast('Leave removed');
      refetch();
    } else {
      setToast('Failed to remove leave');
    }
  };

  const openAvailabilityEditor = () => {
    if (!selectedGuard) return;
    const draft: Record<number, { start: string; end: string; available: boolean }> = {};
    for (let i = 0; i < 7; i++) {
      const a = guardAvail.find((g) => g.day_of_week === i);
      if (a) {
        draft[i] = { start: a.start_time, end: a.end_time, available: a.is_available };
      } else {
        draft[i] = { start: '00:00', end: '23:59', available: true };
      }
    }
    setAvailabilityDraft(draft);
    setEditAvailability(true);
  };

  const handleSaveAvailability = async () => {
    if (!selectedGuard) return;
    const patterns = Object.entries(availabilityDraft).map(([day, d]) => ({
      day_of_week: parseInt(day),
      start_time: d.start,
      end_time: d.end,
      is_available: d.available,
    }));
    const { error } = await setGuardAvailability(selectedGuard, patterns);
    if (!error) {
      setToast('Availability updated');
      refetch();
      setEditAvailability(false);
    } else {
      setToast('Failed to update availability');
    }
  };

  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);
  const calStart = startOfWeek(monthStart, { weekStartsOn: 1 });
  const calEnd = endOfWeek(monthEnd, { weekStartsOn: 1 });

  const weeks: Date[][] = [];
  let d = calStart;
  while (d <= calEnd) {
    const week: Date[] = [];
    for (let i = 0; i < 7; i++) {
      week.push(d);
      d = addDays(d, 1);
    }
    weeks.push(week);
  }

  const getDayStatus = (date: Date, gId: string) => {
    const dateStr = format(date, 'yyyy-MM-dd');
    const off = timeOff.find((t) => t.guard_id === gId && t.start_date <= dateStr && t.end_date >= dateStr);
    if (off) return { type: 'leave', label: off.reason };
    const avail = availability.filter((a) => a.guard_id === gId);
    if (avail.length > 0) {
      const day = date.getDay();
      const weekDay = day === 0 ? 6 : day - 1;
      const pattern = avail.find((a) => a.day_of_week === weekDay);
      if (pattern && !pattern.is_available) {
        return { type: 'unavailable', label: 'Unavailable' };
      }
    }
    return null;
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Guard Availability</h1>
        <p className="text-gray-400 text-sm mt-1">Manage leave, recurring availability, and time-off records.</p>
      </div>

      {loading && (
        <div className="flex items-center justify-center py-12">
          <div className="w-8 h-8 border-2 border-blue-500/30 border-t-blue-500 rounded-full animate-spin" />
        </div>
      )}

      {/* Guard selector */}
      <div className="flex items-center gap-2 flex-wrap">
        {activeGuards.map((g) => {
          const isSelected = selectedGuard === g.id;
          const initials = `${(g.first_name || '')[0]}${(g.last_name || '')[0]}`.toUpperCase();
          const offCount = timeOff.filter((t) => t.guard_id === g.id).length;
          return (
            <button
              key={g.id}
              onClick={() => setSelectedGuard(g.id)}
              className={`inline-flex items-center gap-2 px-3 py-2 rounded-lg border text-sm font-medium cursor-pointer transition-all whitespace-nowrap ${
                isSelected
                  ? 'bg-blue-600/15 border-blue-500/30 text-blue-300'
                  : 'bg-gray-800/60 border-gray-700 text-gray-300 hover:text-white hover:border-gray-600'
              }`}
            >
              <div className="w-6 h-6 rounded-full bg-gray-700 flex items-center justify-center text-[10px] font-bold text-gray-300"
              >
                {initials}
              </div>
              <span>{g.first_name} {g.last_name}</span>
              {offCount > 0 && (
                <span className="text-[10px] bg-red-500/15 text-red-400 px-1.5 py-0.5 rounded">
                  {offCount} off
                </span>
              )}
            </button>
          );
        })}
      </div>

      {selectedGuard && guard && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Calendar */}
          <div className="bg-[#151b27] border border-gray-800 rounded-xl overflow-hidden">
            <div className="flex items-center justify-between px-5 py-3 border-b border-gray-800">
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setCurrentMonth((m) => subMonths(m, 1))}
                  className="w-8 h-8 flex items-center justify-center text-gray-400 hover:text-white rounded-lg hover:bg-gray-800/50 cursor-pointer"
                >
                  <i className="ri-arrow-left-s-line" />
                </button>
                <span className="text-sm font-semibold text-white w-32 text-center">
                  {format(currentMonth, 'MMMM yyyy')}
                </span>
                <button
                  onClick={() => setCurrentMonth((m) => addMonths(m, 1))}
                  className="w-8 h-8 flex items-center justify-center text-gray-400 hover:text-white rounded-lg hover:bg-gray-800/50 cursor-pointer"
                >
                  <i className="ri-arrow-right-s-line" />
                </button>
              </div>
              <button
                onClick={openAddTimeOff}
                className="inline-flex items-center gap-2 px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white text-xs font-medium rounded-lg transition-colors cursor-pointer whitespace-nowrap"
              >
                <i className="ri-add-line" />
                Add Leave
              </button>
            </div>

            <div className="grid grid-cols-7">
              {DAYS.map((day) => (
                <div key={day} className="px-1 py-2 text-center text-[11px] font-semibold text-gray-500 uppercase border-b border-gray-800"
                >
                  {day}
                </div>
              ))}
            </div>
            {weeks.map((week, wi) => (
              <div key={wi} className="grid grid-cols-7">
                {week.map((day, di) => {
                  const status = getDayStatus(day, selectedGuard);
                  const inMonth = isSameMonth(day, currentMonth);
                  const isToday = isSameDay(day, new Date());
                  const reasonConfig = REASON_OPTIONS.find((r) => r.value === status?.label) || REASON_OPTIONS[5];

                  return (
                    <div
                      key={di}
                      className={`border-b border-r border-gray-800/50 min-h-[80px] p-1.5 ${
                        !inMonth ? 'bg-gray-900/30' : ''
                      } ${isToday ? 'bg-blue-600/5' : ''}`}
                    >
                      <div className={`text-xs font-semibold ${isToday ? 'text-blue-400' : inMonth ? 'text-gray-400' : 'text-gray-600'}`}
                      >
                        {format(day, 'd')}
                      </div>
                      {status && (
                        <div className={`mt-1 text-[9px] font-medium px-1.5 py-0.5 rounded ${reasonConfig.color}`}
                        >
                          {status.label}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            ))}
          </div>

          {/* Side panel: Upcoming Leave + Weekly Availability */}
          <div className="space-y-4">
            {/* Upcoming Leave */}
            <div className="bg-[#151b27] border border-gray-800 rounded-xl p-5">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-semibold text-white flex items-center gap-2">
                  <i className="ri-calendar-close-line text-red-400" />
                  Upcoming Leave
                </h3>
                <div className="flex items-center gap-2">
                  <Link
                    href="/ops/guards/leave-approval"
                    className="text-xs text-blue-400 hover:text-blue-300 transition-colors whitespace-nowrap"
                  >
                    Review all
                  </Link>
                  <span className="text-xs text-gray-500">{guardTimeOff.length} record{guardTimeOff.length !== 1 ? 's' : ''}</span>
                </div>
              </div>

              {guardTimeOff.length === 0 && (
                <div className="text-center py-6">
                  <p className="text-gray-500 text-sm">No upcoming leave</p>
                </div>
              )}

              <div className="space-y-2">
                {guardTimeOff.map((t) => {
                  const reasonConfig = REASON_OPTIONS.find((r) => r.value === t.reason) || REASON_OPTIONS[5];
                  const start = new Date(t.start_date);
                  const end = new Date(t.end_date);
                  const days = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1;
                  const isPending = t.status === 'pending';
                  const isRejected = t.status === 'rejected';

                  return (
                    <div key={t.id} className={`flex items-center gap-3 rounded-lg px-3 py-2.5 group ${isPending ? 'bg-amber-500/5 border border-amber-500/15' : isRejected ? 'bg-red-500/5 border border-red-500/10 opacity-50' : 'bg-gray-800/40'}`}>
                      <div className={`w-2 h-2 rounded-full ${reasonConfig.color.split(' ')[0].replace('text-', 'bg-')}`} />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-medium text-white">{t.reason}</span>
                          {isPending && (
                            <span className="text-[10px] text-amber-400 bg-amber-500/10 px-1.5 py-0.5 rounded">Pending</span>
                          )}
                          {isRejected && (
                            <span className="text-[10px] text-red-400 bg-red-500/10 px-1.5 py-0.5 rounded">Rejected</span>
                          )}
                          <span className="text-[10px] text-gray-500">{days} day{days > 1 ? 's' : ''}</span>
                        </div>
                        <div className="text-[11px] text-gray-500 mt-0.5">
                          {format(start, 'EEE d MMM')} — {format(end, 'EEE d MMM yyyy')}
                        </div>
                      </div>
                      <button
                        onClick={() => handleDeleteTimeOff(t.id)}
                        className="w-6 h-6 flex items-center justify-center text-gray-500 hover:text-red-400 rounded transition-colors opacity-0 group-hover:opacity-100 cursor-pointer"
                      >
                        <i className="ri-delete-bin-line text-xs" />
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Weekly Availability */}
            <div className="bg-[#151b27] border border-gray-800 rounded-xl p-5">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-semibold text-white flex items-center gap-2">
                  <i className="ri-calendar-check-line text-emerald-400" />
                  Weekly Availability
                </h3>
                <button
                  onClick={openAvailabilityEditor}
                  className="text-xs text-blue-400 hover:text-blue-300 transition-colors cursor-pointer whitespace-nowrap"
                >
                  Edit
                </button>
              </div>

              <div className="space-y-1.5">
                {DAYS.map((day, i) => {
                  const a = guardAvail.find((g) => g.day_of_week === i);
                  const available = a ? a.is_available : true;
                  return (
                    <div key={day} className="flex items-center justify-between py-1.5 px-2 rounded hover:bg-gray-800/20 transition-colors"
                    >
                      <span className="text-xs text-gray-300 font-medium w-12">{day}</span>
                      <span className={`text-xs ${available ? 'text-emerald-400' : 'text-red-400'}`}
                      >
                        {available ? 'Available' : 'Unavailable'}
                      </span>
                      {a && available && (
                        <span className="text-[11px] text-gray-500 tabular-nums"
                        >
                          {a.start_time}–{a.end_time}
                        </span>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Summary stats */}
            <div className="bg-[#151b27] border border-gray-800 rounded-xl p-5">
              <h3 className="text-sm font-semibold text-white mb-3">Summary</h3>
              <div className="grid grid-cols-3 gap-3">
                <div className="bg-gray-800/40 rounded-lg p-3 text-center">
                  <div className="text-lg font-bold text-white">{guardTimeOff.length}</div>
                  <div className="text-[10px] text-gray-500 mt-0.5">Leave records</div>
                </div>
                <div className="bg-gray-800/40 rounded-lg p-3 text-center">
                  <div className="text-lg font-bold text-white">
                    {guardAvail.filter((a) => !a.is_available).length}
                  </div>
                  <div className="text-[10px] text-gray-500 mt-0.5">Unavailable days</div>
                </div>
                <div className="bg-gray-800/40 rounded-lg p-3 text-center">
                  <div className="text-lg font-bold text-emerald-400">
                    {7 - guardAvail.filter((a) => !a.is_available).length}
                  </div>
                  <div className="text-[10px] text-gray-500 mt-0.5">Available days</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {!selectedGuard && activeGuards.length > 0 && (
        <div className="text-center py-16">
          <div className="w-12 h-12 mx-auto flex items-center justify-center text-gray-600 mb-3"
          >
            <i className="ri-shield-user-line text-2xl" />
          </div>
          <p className="text-gray-400 text-sm">Select a guard to view and manage their availability.</p>
        </div>
      )}

      {activeGuards.length === 0 && !guardsLoading && (
        <div className="text-center py-16">
          <div className="w-12 h-12 mx-auto flex items-center justify-center text-gray-600 mb-3"
          >
            <i className="ri-shield-user-line text-2xl" />
          </div>
          <p className="text-gray-400 text-sm">No active guards yet. Add guards first.</p>
        </div>
      )}

      {/* Add Leave Modal */}
      {timeOffOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4"
        >
          <div className="absolute inset-0 bg-black/60" onClick={() => setTimeOffOpen(false)} />
          <div className="relative bg-[#151b27] border border-gray-800 rounded-xl shadow-2xl w-full max-w-md"
          >
            <div className="px-6 py-4 border-b border-gray-800 flex items-center justify-between"
            >
              <h2 className="text-lg font-semibold text-white">Add Leave</h2>
              <button onClick={() => setTimeOffOpen(false)} className="w-8 h-8 flex items-center justify-center text-gray-400 hover:text-white cursor-pointer"
              >
                <i className="ri-close-line" />
              </button>
            </div>
            <div className="px-6 py-5 space-y-4"
            >
              <div className="flex items-center gap-3 mb-2"
              >
                <div className="w-8 h-8 rounded-full bg-gray-700 flex items-center justify-center text-xs font-bold text-gray-300"
                >
                  {`${guard?.first_name?.[0] || ''}${guard?.last_name?.[0] || ''}`.toUpperCase()}
                </div>
                <span className="text-sm text-white font-medium"
                >
                  {guard?.first_name} {guard?.last_name}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-4"
              >
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-1"
                  >Start Date</label>
                  <input
                    type="date"
                    value={timeOffStart}
                    onChange={(e) => setTimeOffStart(e.target.value)}
                    className="w-full bg-gray-800/60 border border-gray-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-1"
                  >End Date</label>
                  <input
                    type="date"
                    value={timeOffEnd}
                    onChange={(e) => setTimeOffEnd(e.target.value)}
                    min={timeOffStart}
                    className="w-full bg-gray-800/60 border border-gray-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1"
                >Reason</label>
                <div className="flex flex-wrap gap-1.5"
                >
                  {REASON_OPTIONS.map((r) => (
                    <button
                      key={r.value}
                      onClick={() => setTimeOffReason(r.value)}
                      className={`px-2.5 py-1.5 rounded-lg text-xs font-medium border cursor-pointer whitespace-nowrap transition-all ${
                        timeOffReason === r.value
                          ? `${r.color} border-current`
                          : 'bg-gray-800/60 text-gray-400 border-gray-700 hover:text-gray-300'
                      }`}
                    >
                      {r.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
            <div className="px-6 py-4 border-t border-gray-800 flex items-center justify-end gap-3"
            >
              <button
                onClick={() => setTimeOffOpen(false)}
                className="px-4 py-2 rounded-lg text-sm font-medium text-gray-400 hover:text-white transition-colors cursor-pointer whitespace-nowrap"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveTimeOff}
                disabled={savingTimeOff || !timeOffStart || !timeOffEnd}
                className="inline-flex items-center gap-2 px-5 py-2 rounded-lg text-sm font-medium bg-blue-600 hover:bg-blue-500 text-white disabled:opacity-50 cursor-pointer whitespace-nowrap"
              >
                {savingTimeOff && <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />}
                Save Leave
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Availability Modal */}
      {editAvailability && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4"
        >
          <div className="absolute inset-0 bg-black/60" onClick={() => setEditAvailability(false)} />
          <div className="relative bg-[#151b27] border border-gray-800 rounded-xl shadow-2xl w-full max-w-lg"
          >
            <div className="px-6 py-4 border-b border-gray-800 flex items-center justify-between"
            >
              <h2 className="text-lg font-semibold text-white">Edit Weekly Availability</h2>
              <button onClick={() => setEditAvailability(false)} className="w-8 h-8 flex items-center justify-center text-gray-400 hover:text-white cursor-pointer"
              >
                <i className="ri-close-line" />
              </button>
            </div>
            <div className="px-6 py-5 space-y-3"
            >
              {DAYS.map((day, i) => {
                const draft = availabilityDraft[i] || { start: '00:00', end: '23:59', available: true };
                return (
                  <div key={day} className="flex items-center gap-3"
                  >
                    <div className="w-10 text-xs font-medium text-gray-300"
                    >
                      {day}
                    </div>
                    <button
                      onClick={() => setAvailabilityDraft((prev) => ({
                        ...prev,
                        [i]: { ...prev[i], available: !prev[i]?.available },
                      }))}
                      className={`px-3 py-1.5 rounded-lg text-xs font-medium border cursor-pointer transition-all whitespace-nowrap ${
                        draft.available
                          ? 'bg-emerald-600/15 text-emerald-400 border-emerald-500/25'
                          : 'bg-red-500/10 text-red-400 border-red-500/20'
                      }`}
                    >
                      {draft.available ? 'Available' : 'Unavailable'}
                    </button>
                    {draft.available && (
                      <>
                        <input
                          type="time"
                          value={draft.start}
                          onChange={(e) => setAvailabilityDraft((prev) => ({
                            ...prev,
                            [i]: { ...prev[i], start: e.target.value },
                          }))}
                          className="w-24 bg-gray-800/60 border border-gray-700 rounded-lg px-2 py-1.5 text-xs text-white focus:outline-none focus:border-blue-500"
                        />
                        <span className="text-gray-500 text-xs"
                        >–</span>
                        <input
                          type="time"
                          value={draft.end}
                          onChange={(e) => setAvailabilityDraft((prev) => ({
                            ...prev,
                            [i]: { ...prev[i], end: e.target.value },
                          }))}
                          className="w-24 bg-gray-800/60 border border-gray-700 rounded-lg px-2 py-1.5 text-xs text-white focus:outline-none focus:border-blue-500"
                        />
                      </>
                    )}
                  </div>
                );
              })}
            </div>
            <div className="px-6 py-4 border-t border-gray-800 flex items-center justify-end gap-3"
            >
              <button
                onClick={() => setEditAvailability(false)}
                className="px-4 py-2 rounded-lg text-sm font-medium text-gray-400 hover:text-white transition-colors cursor-pointer whitespace-nowrap"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveAvailability}
                className="inline-flex items-center gap-2 px-5 py-2 rounded-lg text-sm font-medium bg-blue-600 hover:bg-blue-500 text-white cursor-pointer whitespace-nowrap"
              >
                Save Availability
              </button>
            </div>
          </div>
        </div>
      )}

      {toast && <Toast message={toast} onDismiss={() => setToast(null)} />}
    </div>
  );
}