'use client';

import { useState } from 'react';
import { addDays, format } from 'date-fns';
import { ShiftPatternTemplate, generateShiftsFromPattern } from '@/lib/useShiftPatternTemplates';
import { useAuth } from '@/lib/auth';
import { supabase } from '@/lib/supabase';
import {
  isGuardOnLeave,
  isGuardPendingLeave,
  isGuardAvailable,
  getGuardWeeklyHours,
  OVERTIME_THRESHOLD,
  WARNING_THRESHOLD,
  type GuardAvailability,
  type GuardTimeOff,
} from '@/lib/useGuardAvailability';

interface Props {
  templates: ShiftPatternTemplate[];
  sites: { id: string; site_name: string }[];
  onDone: () => void;
}

function normalizeDay(d: number): number {
  if (d >= 1 && d <= 7) return d - 1;
  if (d >= 0 && d <= 6) return d;
  return 0;
}

function getWeekStart(d: Date): Date {
  const day = d.getDay();
  const diff = day === 0 ? -6 : 1 - day;
  const monday = new Date(d);
  monday.setDate(d.getDate() + diff);
  monday.setHours(0, 0, 0, 0);
  return monday;
}

function shiftHours(s: { start_time: string; end_time: string }): number {
  const st = new Date(s.start_time);
  const en = new Date(s.end_time);
  return (en.getTime() - st.getTime()) / (1000 * 60 * 60);
}

function checkPreviewConflicts(
  preview: Array<{ start_time: string; end_time: string; guard_id: string | null; shift_type: string }>,
  guardId: string,
  existingShifts: Array<{ id: string; guard_id: string | null; start_time: string; end_time: string; site_name?: string | null }>,
  availability: GuardAvailability[],
  approvedTimeOff: GuardTimeOff[],
  pendingTimeOff: GuardTimeOff[]
): Record<number, string[]> {
  const warnings: Record<number, string[]> = {};

  for (let i = 0; i < preview.length; i++) {
    const shift = preview[i];
    if (!shift.guard_id) continue;

    const ws: string[] = [];
    const sStart = new Date(shift.start_time);
    const sEnd = new Date(shift.end_time);
    const dateStr = shift.start_time.slice(0, 10);
    const startTime = shift.start_time.slice(11, 16);
    const endTime = shift.end_time.slice(11, 16);

    for (const es of existingShifts) {
      const eStart = new Date(es.start_time);
      const eEnd = new Date(es.end_time);
      if (sStart < eEnd && sEnd > eStart) {
        const timeRange = `${es.start_time.slice(11, 16)}–${es.end_time.slice(11, 16)}`;
        ws.push(`Overlaps with shift at ${es.site_name || 'another site'} (${timeRange})`);
      }
    }

    for (let j = 0; j < preview.length; j++) {
      if (i === j) continue;
      const other = preview[j];
      if (other.guard_id !== guardId) continue;
      const oStart = new Date(other.start_time);
      const oEnd = new Date(other.end_time);
      if (sStart < oEnd && sEnd > oStart) {
        ws.push(`Overlaps with another preview shift on ${format(new Date(other.start_time), 'EEE d MMM')}`);
      }
    }

    const leave = isGuardOnLeave(guardId, dateStr, approvedTimeOff);
    if (leave) ws.push(`On ${leave.reason || 'approved leave'}`);

    const pLeave = isGuardPendingLeave(guardId, dateStr, pendingTimeOff);
    if (pLeave) ws.push(`Pending leave request (${pLeave.reason || 'leave'})`);

    const avail = isGuardAvailable(guardId, sStart, startTime, endTime, availability);
    if (!avail) ws.push('Outside availability window');

    const weekStart = getWeekStart(sStart);
    const existingHours = getGuardWeeklyHours(guardId, existingShifts, weekStart);
    const previewHoursInWeek = preview
      .filter((p, idx) => idx !== i && p.guard_id === guardId && getWeekStart(new Date(p.start_time)).getTime() === weekStart.getTime())
      .reduce((sum, p) => sum + shiftHours(p), 0);
    const thisHours = shiftHours(shift);
    const totalHours = existingHours + previewHoursInWeek + thisHours;
    if (totalHours > OVERTIME_THRESHOLD) {
      ws.push(`${totalHours.toFixed(1)}h this week — exceeds 48h limit`);
    } else if (totalHours > WARNING_THRESHOLD) {
      ws.push(`${totalHours.toFixed(1)}h this week — approaching 48h limit`);
    }

    if (ws.length > 0) warnings[i] = ws;
  }

  return warnings;
}

export default function ShiftBuilder({ templates, sites, onDone }: Props) {
  const { companyId } = useAuth();
  const [templateId, setTemplateId] = useState('');
  const [siteId, setSiteId] = useState('');
  const [startDate, setStartDate] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [weekCount, setWeekCount] = useState(1);
  const [guardId, setGuardId] = useState('');
  const [guards, setGuards] = useState<{ id: string; first_name: string; last_name: string }[]>([]);
  const [preview, setPreview] = useState<ReturnType<typeof generateShiftsFromPattern>>([]);
  const [creating, setCreating] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
  const [guardPickerOpen, setGuardPickerOpen] = useState(false);
  const [sitePickerOpen, setSitePickerOpen] = useState(false);
  const [templatePickerOpen, setTemplatePickerOpen] = useState(false);
  const [showGuardOption, setShowGuardOption] = useState(false);
  const [shiftConflicts, setShiftConflicts] = useState<Record<number, string[]>>();
  const [conflictDataLoading, setConflictDataLoading] = useState(false);

  const selectedTemplate = templates.find((t) => t.id === templateId);
  const selectedSite = sites.find((s) => s.id === siteId);

  const loadGuards = async () => {
    if (!companyId || guards.length > 0) return;
    const { data } = await supabase
      .from('guards')
      .select('id, first_name, last_name')
      .eq('company_id', companyId)
      .eq('status', 'active')
      .order('first_name');
    setGuards(data || []);
  };

  const loadConflictData = async (gid: string, generated: typeof preview) => {
    if (!companyId) return;
    const firstDate = new Date(startDate + 'T00:00:00');
    const lastDate = addDays(firstDate, weekCount * 7 + 1);
    const from = format(firstDate, 'yyyy-MM-dd');
    const to = format(lastDate, 'yyyy-MM-dd');

    const [{ data: shiftsData }, { data: availData }, { data: offData }, { data: allOffData }] = await Promise.all([
      supabase
        .from('shifts')
        .select('id, guard_id, start_time, end_time, site_name')
        .eq('guard_id', gid)
        .gte('start_time', from + 'T00:00:00')
        .lte('start_time', to + 'T23:59:59'),
      supabase
        .from('guard_availability')
        .select('guard_id, day_of_week, start_time, end_time, is_available')
        .eq('guard_id', gid),
      supabase
        .from('guard_time_off')
        .select('id, guard_id, start_date, end_date, reason, approved, status')
        .eq('guard_id', gid)
        .eq('approved', true)
        .gte('end_date', from),
      supabase
        .from('guard_time_off')
        .select('id, guard_id, start_date, end_date, reason, approved, status')
        .eq('guard_id', gid)
        .eq('status', 'pending')
        .gte('end_date', from),
    ]);

    const conflicts = checkPreviewConflicts(
      generated,
      gid,
      (shiftsData || []).map((s: any) => ({ ...s, guard_id: s.guard_id ?? null })),
      (availData || []).map((a: any) => ({
        guard_id: a.guard_id,
        day_of_week: normalizeDay(a.day_of_week),
        start_time: a.start_time?.slice(0, 5) || '00:00',
        end_time: a.end_time?.slice(0, 5) || '23:59',
        is_available: a.is_available ?? true,
      })),
      (offData || []).map((t: any) => ({
        id: t.id,
        guard_id: t.guard_id,
        start_date: t.start_date,
        end_date: t.end_date,
        reason: t.reason || 'Time off',
        approved: t.approved ?? true,
        status: t.status || 'approved',
      })),
      (allOffData || []).map((t: any) => ({
        id: t.id,
        guard_id: t.guard_id,
        start_date: t.start_date,
        end_date: t.end_date,
        reason: t.reason || 'Time off',
        approved: t.approved ?? false,
        status: t.status || 'pending',
      }))
    );
    setShiftConflicts(conflicts);
  };

  const handlePreview = async () => {
    if (!selectedTemplate || !siteId || !companyId) return;
    const generated = generateShiftsFromPattern(selectedTemplate, siteId, companyId, startDate, weekCount, guardId || null);
    setPreview(generated);
    if (guardId) {
      setConflictDataLoading(true);
      await loadConflictData(guardId, generated);
      setConflictDataLoading(false);
    } else {
      setShiftConflicts({});
    }
  };

  const handleCreate = async () => {
    if (!selectedTemplate || !siteId || !companyId || preview.length === 0) return;
    setCreating(true);
    const { error } = await supabase.from('shifts').insert(preview);
    if (!error) {
      setToast(`Created ${preview.length} shifts`);
      setPreview([]);
      setShiftConflicts({});
      setGuardId('');
      setWeekCount(1);
      onDone();
      setTimeout(() => setToast(null), 3000);
    } else {
      setToast('Failed to create shifts');
      setTimeout(() => setToast(null), 3000);
    }
    setCreating(false);
  };

  const totalHours = preview.reduce((sum, p) => {
    const s = new Date(p.start_time);
    const e = new Date(p.end_time);
    return sum + (e.getTime() - s.getTime()) / (1000 * 60 * 60);
  }, 0);

  const groupedByDate = preview.reduce<Record<string, Array<{ shift: typeof preview[0]; index: number }>>>((acc, s, i) => {
    const d = s.start_time.slice(0, 10);
    acc[d] = acc[d] || [];
    acc[d].push({ shift: s, index: i });
    return acc;
  }, {});

  const selectedGuard = guards.find((g) => g.id === guardId);

  const hasCriticalConflicts = Object.values(shiftConflicts).some((list) =>
    list.some((w) => w.includes('Overlaps') || w.includes('approved leave'))
  );
  const conflictCount = Object.keys(shiftConflicts).length;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="bg-[#111827] border border-gray-800 rounded-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl">
        <div className="px-5 py-4 border-b border-gray-800 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-white">Build Shifts from Pattern</h2>
          <button onClick={onDone} className="w-8 h-8 flex items-center justify-center text-gray-400 hover:text-white rounded-lg transition-colors cursor-pointer">
            <div className="w-4 h-4 flex items-center justify-center"><i className="ri-close-line"></i></div>
          </button>
        </div>

        <div className="px-5 py-4 space-y-4">
          {toast && (
            <div className={`text-sm px-4 py-2.5 rounded-lg flex items-center gap-2 ${toast.includes('Created') ? 'bg-emerald-500/10 border border-emerald-500/20 text-emerald-400' : 'bg-red-500/10 border border-red-500/20 text-red-400'}`}>
              <div className="w-4 h-4 flex items-center justify-center"><i className={toast.includes('Created') ? 'ri-check-line' : 'ri-error-warning-line'}></i></div>
              {toast}
            </div>
          )}

          <div className="relative">
            <label className="block text-sm font-medium text-gray-300 mb-1">Pattern *</label>
            <button
              onClick={() => setTemplatePickerOpen(!templatePickerOpen)}
              className="w-full text-left bg-gray-800/60 border border-gray-700 rounded-lg px-3 py-2.5 text-sm text-white focus:outline-none flex items-center justify-between gap-2"
            >
              <span className={selectedTemplate ? 'text-white' : 'text-gray-500'}>
                {selectedTemplate ? selectedTemplate.name : 'Choose a pattern...'}
              </span>
              <div className="w-4 h-4 flex items-center justify-center shrink-0">
                <i className={`ri-arrow-down-s-line text-gray-500 transition-transform ${templatePickerOpen ? 'rotate-180' : ''}`} />
              </div>
            </button>
            {templatePickerOpen && (
              <div className="absolute z-20 mt-1 w-full bg-[#1f2937] border border-gray-700 rounded-lg shadow-lg max-h-56 overflow-y-auto">
                {templates.map((t) => (
                  <button
                    key={t.id}
                    onClick={() => { setTemplateId(t.id); setTemplatePickerOpen(false); setPreview([]); setShiftConflicts({}); }}
                    className={`w-full text-left px-3 py-2 text-sm hover:bg-gray-800/50 transition-colors cursor-pointer flex flex-col ${templateId === t.id ? 'bg-blue-600/15 text-blue-300' : 'text-gray-300'}`}
                  >
                    <span className="font-medium">{t.name}</span>
                    <span className="text-xs text-gray-500">{t.slots.length} slots · {t.pattern_type} · {t.cycle_length || t.slots.length} days</span>
                  </button>
                ))}
                {templates.length === 0 && (
                  <p className="px-3 py-2 text-xs text-gray-500">No templates yet. Create one first.</p>
                )}
              </div>
            )}
          </div>

          <div className="relative">
            <label className="block text-sm font-medium text-gray-300 mb-1">Site *</label>
            <button
              onClick={() => setSitePickerOpen(!sitePickerOpen)}
              className="w-full text-left bg-gray-800/60 border border-gray-700 rounded-lg px-3 py-2.5 text-sm text-white focus:outline-none flex items-center justify-between gap-2"
            >
              <span className={selectedSite ? 'text-white' : 'text-gray-500'}>
                {selectedSite ? selectedSite.site_name : 'Select site...'}
              </span>
              <div className="w-4 h-4 flex items-center justify-center shrink-0">
                <i className={`ri-arrow-down-s-line text-gray-500 transition-transform ${sitePickerOpen ? 'rotate-180' : ''}`} />
              </div>
            </button>
            {sitePickerOpen && (
              <div className="absolute z-20 mt-1 w-full bg-[#1f2937] border border-gray-700 rounded-lg shadow-lg max-h-56 overflow-y-auto">
                {sites.map((s) => (
                  <button
                    key={s.id}
                    onClick={() => { setSiteId(s.id); setSitePickerOpen(false); }}
                    className={`w-full text-left px-3 py-2 text-sm hover:bg-gray-800/50 transition-colors cursor-pointer ${siteId === s.id ? 'bg-blue-600/15 text-blue-300' : 'text-gray-300'}`}
                  >
                    {s.site_name}
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">Start Date *</label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => { setStartDate(e.target.value); setPreview([]); setShiftConflicts({}); }}
                className="w-full bg-gray-800/60 border border-gray-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">Repeat for (weeks)</label>
              <input
                type="number"
                min={1}
                max={12}
                value={weekCount}
                onChange={(e) => { setWeekCount(Math.max(1, Math.min(12, parseInt(e.target.value) || 1))); setPreview([]); setShiftConflicts({}); }}
                className="w-full bg-gray-800/60 border border-gray-700 rounded-lg px-3 py-2 text-sm text-white text-center focus:outline-none focus:border-blue-500"
              />
            </div>
          </div>

          <div>
            <button
              onClick={() => { setShowGuardOption(!showGuardOption); if (!showGuardOption) loadGuards(); }}
              className="text-xs text-gray-400 hover:text-white transition-colors flex items-center gap-1.5 cursor-pointer whitespace-nowrap"
            >
              <div className={`w-3 h-3 rounded border flex items-center justify-center transition-colors ${showGuardOption ? 'bg-blue-500 border-blue-500' : 'border-gray-600'}`}>
                {showGuardOption && <i className="ri-check-line text-white text-[8px]"></i>}
              </div>
              Pre-assign a guard to all shifts (optional)
            </button>

            {showGuardOption && (
              <div className="relative mt-2">
                <button
                  onClick={() => setGuardPickerOpen(!guardPickerOpen)}
                  className="w-full text-left bg-gray-800/60 border border-gray-700 rounded-lg px-3 py-2.5 text-sm text-white focus:outline-none flex items-center justify-between gap-2"
                >
                  <span className={selectedGuard ? 'text-white' : 'text-gray-500'}>
                    {selectedGuard ? `${selectedGuard.first_name} ${selectedGuard.last_name}` : 'Select guard...'}
                  </span>
                  <div className="w-4 h-4 flex items-center justify-center shrink-0">
                    <i className={`ri-arrow-down-s-line text-gray-500 transition-transform ${guardPickerOpen ? 'rotate-180' : ''}`} />
                  </div>
                </button>
                {guardPickerOpen && (
                  <div className="absolute z-20 mt-1 w-full bg-[#1f2937] border border-gray-700 rounded-lg shadow-lg max-h-56 overflow-y-auto">
                    <button
                      onClick={() => { setGuardId(''); setGuardPickerOpen(false); setPreview([]); setShiftConflicts({}); }}
                      className="w-full text-left px-3 py-2 text-sm text-gray-400 hover:bg-gray-800/50 transition-colors cursor-pointer"
                    >
                      — Leave unassigned
                    </button>
                    {guards.map((g) => (
                      <button
                        key={g.id}
                        onClick={() => { setGuardId(g.id); setGuardPickerOpen(false); setPreview([]); setShiftConflicts({}); }}
                        className={`w-full text-left px-3 py-2 text-sm hover:bg-gray-800/50 transition-colors cursor-pointer ${guardId === g.id ? 'bg-blue-600/15 text-blue-300' : 'text-gray-300'}`}
                      >
                        {g.first_name} {g.last_name}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>

          {selectedTemplate && (
            <div>
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-sm font-medium text-white">Preview</h3>
                <button
                  onClick={handlePreview}
                  className="text-xs text-blue-400 hover:text-blue-300 cursor-pointer whitespace-nowrap"
                >
                  Refresh preview
                </button>
              </div>

              {preview.length === 0 ? (
                <div className="text-center py-6 bg-gray-800/30 rounded-lg border border-gray-800 border-dashed">
                  <p className="text-xs text-gray-500">Click Refresh preview to see what will be created</p>
                </div>
              ) : (
                <div className="space-y-1">
                  <div className="flex items-center justify-between text-xs text-gray-500 mb-1 px-1">
                    <span>{preview.length} shifts · {Math.round(totalHours)} total hours</span>
                    <span className="flex items-center gap-2">
                      {conflictCount > 0 && (
                        <span className="text-amber-400 font-medium">{conflictCount} conflict{conflictCount > 1 ? 's' : ''}</span>
                      )}
                      {conflictDataLoading && <span className="text-gray-600">Checking...</span>}
                      <span>{Object.keys(groupedByDate).length} days</span>
                    </span>
                  </div>
                  <div className="bg-[#111827]/60 border border-gray-800 rounded-xl overflow-hidden max-h-64 overflow-y-auto">
                    {Object.entries(groupedByDate).map(([date, shifts]) => (
                      <div key={date} className="px-3 py-2 border-b border-gray-800 last:border-0">
                        <p className="text-[11px] font-semibold text-gray-400 uppercase mb-1">
                          {format(new Date(date + 'T00:00:00'), 'EEE d MMM')}
                        </p>
                        <div className="space-y-1">
                          {shifts.map(({ shift: s, index: globalIndex }) => {
                            const conflicts = shiftConflicts[globalIndex];
                            return (
                              <div key={globalIndex} className="flex items-start gap-2 text-xs">
                                <span className={`w-1.5 h-1.5 rounded-full mt-1 shrink-0 ${s.shift_type === 'day' ? 'bg-amber-400' : s.shift_type === 'night' ? 'bg-indigo-400' : 'bg-emerald-400'}`} />
                                <div className="flex-1 min-w-0">
                                  <div className="flex items-center gap-2">
                                    <span className="text-gray-300 font-mono">
                                      {s.start_time.slice(11, 16)}–{s.end_time.slice(11, 16)}
                                    </span>
                                    <span className="text-gray-500 capitalize">{s.shift_type}</span>
                                    {s.guard_id && (
                                      <span className="text-emerald-400 text-[10px] ml-auto">Pre-assigned</span>
                                    )}
                                    {conflicts && (
                                      <div className="w-4 h-4 flex items-center justify-center text-amber-400 shrink-0" title={conflicts.join('\n')}>
                                        <i className="ri-error-warning-line"></i>
                                      </div>
                                    )}
                                  </div>
                                  {conflicts && (
                                    <div className="mt-0.5 space-y-0.5">
                                      {conflicts.map((w, wi) => (
                                        <p key={wi} className="text-[10px] text-amber-400 leading-tight">
                                          <span className="text-amber-500">•</span> {w}
                                        </p>
                                      ))}
                                    </div>
                                  )}
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        <div className="px-5 py-4 border-t border-gray-800 flex items-center justify-between">
          <p className="text-xs text-gray-500">
            {preview.length > 0
              ? hasCriticalConflicts
                ? `${preview.length} shifts — fix critical conflicts first`
                : `${preview.length} shifts ready to create`
              : 'Select a pattern and site to preview'}
          </p>
          <div className="flex items-center gap-2">
            <button onClick={onDone} className="px-4 py-2 rounded-lg text-sm font-medium text-gray-400 hover:text-white transition-colors cursor-pointer whitespace-nowrap">
              Cancel
            </button>
            <button
              onClick={handleCreate}
              disabled={creating || preview.length === 0 || hasCriticalConflicts}
              className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors disabled:opacity-50 cursor-pointer whitespace-nowrap"
            >
              {creating && <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />}
              {creating ? 'Creating...' : `Create ${preview.length || ''} Shifts`}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}