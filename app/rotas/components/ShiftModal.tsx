import { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { useAuth } from '@/lib/auth';
import { phaseOneSupabase as supabase } from '@/lib/phaseOneSupabase';
import { useGuardAvailability, isGuardOnLeave, isGuardAvailable, getGuardWeeklyHours, OVERTIME_THRESHOLD } from '@/lib/useGuardAvailability';
import type { Shift, ShiftForm } from '@/lib/useShifts';

function guardDisplayName(g: { first_name: string | null; last_name: string | null }): string {
  const name = [g.first_name, g.last_name].filter(Boolean).join(' ').trim();
  return name || 'Unnamed guard';
}

interface ShiftModalProps {
  editingShift: Shift | null;
  initialSiteId?: string | null;
  initialDate?: string;
  allShifts: Shift[];
  onSave: (payload: ShiftForm) => void;
  onClose: () => void;
  onDelete?: () => void;
  saving: boolean;
  fullPage?: boolean;
  saveError?: string | null;
}

export default function ShiftModal({
  editingShift,
  initialSiteId,
  initialDate,
  allShifts,
  onSave,
  onClose,
  onDelete,
  saving,
  fullPage = false,
  saveError,
}: ShiftModalProps) {
  const { companyId } = useAuth();
  const { availability, timeOff } = useGuardAvailability();
  const [sites, setSites] = useState<{ id: string; site_name: string }[]>([]);
  const [guards, setGuards] = useState<{ id: string; first_name: string | null; last_name: string | null }[]>([]);

  const [siteId, setSiteId] = useState(initialSiteId || '');
  const [guardId, setGuardId] = useState('');
  const [date, setDate] = useState(initialDate || format(new Date(), 'yyyy-MM-dd'));
  const [startTime, setStartTime] = useState('18:00');
  const [endTime, setEndTime] = useState('06:00');
  const [shiftType, setShiftType] = useState('night');
  const [status, setStatus] = useState('scheduled');
  const [notes, setNotes] = useState('');
  const [checkingConflicts, setCheckingConflicts] = useState(false);
  const [conflict, setConflict] = useState<string | null>(null);
  const [warnings, setWarnings] = useState<string[]>([]);
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (!companyId) return;
    supabase.from('sites').select('id, site_name').eq('company_id', companyId).order('site_name').then(({ data }) => {
      if (data) setSites(data);
    });
    supabase.from('guards').select('id, first_name, last_name').eq('company_id', companyId).eq('status', 'active').order('first_name').then(({ data }) => {
      if (data) setGuards(data);
    });
  }, [companyId]);

  useEffect(() => {
    if (editingShift) {
      const start = new Date(editingShift.start_time);
      const end = new Date(editingShift.end_time);
      setSiteId(editingShift.site_id || '');
      setGuardId(editingShift.guard_id || '');
      setDate(format(start, 'yyyy-MM-dd'));
      setStartTime(format(start, 'HH:mm'));
      setEndTime(format(end, 'HH:mm'));
      setShiftType(editingShift.shift_type || 'night');
      setStatus(editingShift.status || 'scheduled');
      setNotes(editingShift.notes || '');
    }
  }, [editingShift]);

  // Live warnings check
  useEffect(() => {
    setWarnings([]);
    if (!guardId || !date || !startTime || !endTime) return;

    const newWarnings: string[] = [];

    // Leave check
    const leave = isGuardOnLeave(guardId, date, timeOff);
    if (leave) {
      newWarnings.push(`Guard is on ${leave.reason} (${leave.start_date} to ${leave.end_date})`);
    }

    // Availability check
    const startDate = new Date(`${date}T${startTime}`);
    const availOk = isGuardAvailable(guardId, startDate, startTime, endTime, availability);
    if (!availOk) {
      newWarnings.push('Shift falls outside guard availability window');
    }

    // Overtime check
    const weekStart = startOfWeek(startDate, { weekStartsOn: 1 });
    const currentHours = getGuardWeeklyHours(guardId, allShifts.filter(s => s.id !== editingShift?.id && s.status !== 'cancelled'), weekStart);
    const finish = new Date(`${date}T${endTime}`);
    if (finish <= startDate) finish.setDate(finish.getDate() + 1);
    const shiftHours = (finish.getTime() - startDate.getTime()) / (1000 * 60 * 60);
    const totalHours = currentHours + shiftHours;
    if (totalHours > OVERTIME_THRESHOLD) {
      newWarnings.push(`Guard would work ${totalHours.toFixed(1)}h this week (limit: ${OVERTIME_THRESHOLD}h)`);
    }

    setWarnings(newWarnings);
  }, [guardId, date, startTime, endTime, availability, timeOff, allShifts]);

  function startOfWeek(date: Date, options?: { weekStartsOn?: number }): Date {
    const d = new Date(date);
    const day = d.getDay();
    const diff = (day + 7 - (options?.weekStartsOn ?? 0)) % 7;
    d.setDate(d.getDate() - diff);
    d.setHours(0, 0, 0, 0);
    return d;
  }

  const validate = (): boolean => {
    const e: Record<string, string> = {};
    if (!siteId) e.siteId = 'Site is required';
    if (!date) e.date = 'Date is required';
    if (!startTime) e.startTime = 'Start time is required';
    if (!endTime) e.endTime = 'End time is required';
    if (!shiftType) e.shiftType = 'Shift type is required';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const checkConflicts = async (): Promise<string | null> => {
    if (!companyId) return 'Your session has expired.';
    if (!guardId || !date || !startTime || !endTime) return null;
    const startDate = new Date(`${date}T${startTime}`);
    let endDate = new Date(`${date}T${endTime}`);
    if (endDate <= startDate) endDate.setDate(endDate.getDate() + 1);

    let query = supabase
      .from('shifts')
      .select('id, site_id, start_time, end_time')
      .eq('guard_id', guardId)
      .eq('company_id', companyId)
      .neq('status', 'cancelled')
      .lt('start_time', endDate.toISOString())
      .gt('end_time', startDate.toISOString())
      .limit(1);
    if (editingShift?.id) query = query.neq('id', editingShift.id);
    const { data, error } = await query;
    if (error) return 'Could not verify guard availability. Please retry.';

    if (data && data.length > 0) {
      const conflictShift = data[0];
      const conflictSite = sites.find((s) => s.id === conflictShift.site_id);
      const siteName = conflictSite?.site_name || 'another site';
      const s = new Date(conflictShift.start_time);
      const e = new Date(conflictShift.end_time);
      const bookedGuard = guards.find((g) => g.id === guardId);
      const guardName = bookedGuard ? guardDisplayName(bookedGuard) : 'Guard';
      return `${guardName} is already booked ${format(s, 'HH:mm')}-${format(e, 'HH:mm')} at ${siteName}`;
    }
    return null;
  };

  const handleSave = async () => {
    if (saving || checkingConflicts) return;
    setConflict(null);
    if (!validate()) return;
    if (guardId) {
      setCheckingConflicts(true);
      try { const c = await checkConflicts(); if (c) { setConflict(c); return; } }
      catch { setConflict('Could not verify guard availability. Please retry.'); return; }
      finally { setCheckingConflicts(false); }
    }
    onSave({
      site_id: siteId,
      guard_id: guardId || null,
      date,
      start_time: startTime,
      end_time: endTime,
      shift_type: shiftType,
      status,
      notes,
    });
  };

  const startDt = new Date(`${date}T${startTime}`);
  let endDt = new Date(`${date}T${endTime}`);
  if (endDt <= startDt) endDt.setDate(endDt.getDate() + 1);
  const overnight = endDt.getDate() !== startDt.getDate();

  return (
    <div className={fullPage ? "max-w-4xl mx-auto" : "fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"}>
      <div className={`bg-[#151b27] border border-gray-800 rounded-xl w-full shadow-2xl ${fullPage ? "" : "max-w-lg max-h-[90vh] overflow-y-auto"}`}>
        <div className="px-6 py-4 border-b border-gray-800 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-white">{editingShift ? 'Edit Shift' : 'Add Shift'}</h2>
          <button onClick={onClose} className="w-8 h-8 flex items-center justify-center text-gray-400 hover:text-white cursor-pointer">
            <i className="ri-close-line"></i>
          </button>
        </div>

        <div className="px-6 py-5 space-y-4">
          {saveError && <p role="alert" className="text-red-400">{saveError}</p>}
          {/* Warnings */}
          {warnings.length > 0 && (
            <div className="space-y-1.5">
              {warnings.map((w, i) => (
                <div key={i} className="bg-amber-500/10 border border-amber-500/20 text-amber-400 text-sm px-4 py-2 rounded-lg flex items-center gap-2">
                  <div className="w-4 h-4 flex items-center justify-center"><i className="ri-alert-line"></i></div>
                  {w}
                </div>
              ))}
            </div>
          )}

          {conflict && (
            <div className="bg-red-500/10 border border-red-500/20 text-red-400 text-sm px-4 py-2.5 rounded-lg flex items-center gap-2">
              <div className="w-4 h-4 flex items-center justify-center"><i className="ri-error-warning-line"></i></div>
              {conflict}
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-400 mb-1">Site <span className="text-red-400">*</span></label>
            <select
              value={siteId}
              onChange={(e) => setSiteId(e.target.value)}
              className="w-full bg-gray-800/60 border border-gray-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-blue-500 cursor-pointer"
            >
              <option value="" disabled>Select site...</option>
              {sites.map((s) => <option key={s.id} value={s.id}>{s.site_name}</option>)}
            </select>
            {errors.siteId && <p className="text-red-400 text-xs mt-1">{errors.siteId}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-400 mb-1">Guard (leave blank for open shift)</label>
            <select
              value={guardId}
              onChange={(e) => setGuardId(e.target.value)}
              className="w-full bg-gray-800/60 border border-gray-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-blue-500 cursor-pointer"
            >
              <option value="">Open shift</option>
              {guards.map((g) => <option key={g.id} value={g.id}>{guardDisplayName(g)}</option>)}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-400 mb-1">Date <span className="text-red-400">*</span></label>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full bg-gray-800/60 border border-gray-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-blue-500"
            />
            {errors.date && <p className="text-red-400 text-xs mt-1">{errors.date}</p>}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-1">Start <span className="text-red-400">*</span></label>
              <input
                type="time"
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
                className="w-full bg-gray-800/60 border border-gray-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-blue-500"
              />
              {errors.startTime && <p className="text-red-400 text-xs mt-1">{errors.startTime}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-1">End <span className="text-red-400">*</span></label>
              <input
                type="time"
                value={endTime}
                onChange={(e) => setEndTime(e.target.value)}
                className="w-full bg-gray-800/60 border border-gray-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-blue-500"
              />
              {errors.endTime && <p className="text-red-400 text-xs mt-1">{errors.endTime}</p>}
            </div>
          </div>

          {overnight && (
            <div className="bg-amber-500/10 border border-amber-500/20 text-amber-400 text-xs px-3 py-1.5 rounded-lg inline-flex items-center gap-1.5">
              <div className="w-3.5 h-3.5 flex items-center justify-center"><i className="ri-moon-line"></i></div>
              Overnight shift
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-1">Type <span className="text-red-400">*</span></label>
              <select
                value={shiftType}
                onChange={(e) => setShiftType(e.target.value)}
                className="w-full bg-gray-800/60 border border-gray-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-blue-500 cursor-pointer"
              >
                <option value="day">Day</option>
                <option value="night">Night</option>
                <option value="event">Event</option>
                <option value="patrol">Patrol</option>
              </select>
              {errors.shiftType && <p className="text-red-400 text-xs mt-1">{errors.shiftType}</p>}
            </div>
            {editingShift && (
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1">Status</label>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value)}
                  className="w-full bg-gray-800/60 border border-gray-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-blue-500 cursor-pointer"
                >
                  <option value="scheduled">Scheduled</option>
                  <option value="active">Active</option>
                  <option value="completed">Completed</option>
                  <option value="cancelled">Cancelled</option>
                  <option value="no_show">No-Show</option>
                </select>
              </div>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-400 mb-1">Notes</label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={3}
              maxLength={500}
              className="w-full bg-gray-800/60 border border-gray-700 rounded-lg px-3 py-2 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 resize-none"
              placeholder="Optional notes..."
            />
            <div className="text-right text-xs text-gray-500 mt-1">{notes.length}/500</div>
          </div>
        </div>

        <div className="px-6 py-4 border-t border-gray-800 flex items-center justify-end gap-3">
          {editingShift && onDelete && (
            <button
              onClick={onDelete}
              className="px-4 py-2 rounded-lg text-sm font-medium text-red-400 border border-red-500/30 hover:bg-red-500/10 transition-colors cursor-pointer whitespace-nowrap mr-auto"
            >
              Delete
            </button>
          )}
          <button onClick={onClose} className="px-4 py-2 rounded-lg text-sm font-medium text-gray-400 hover:text-white transition-colors cursor-pointer whitespace-nowrap">
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={saving || checkingConflicts}
            className="inline-flex items-center gap-2 px-5 py-2 rounded-lg text-sm font-medium bg-blue-600 hover:bg-blue-500 text-white disabled:opacity-50 disabled:cursor-not-allowed transition-colors cursor-pointer whitespace-nowrap"
          >
            {saving && <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>}
            Save
          </button>
        </div>
      </div>
    </div>
  );
}