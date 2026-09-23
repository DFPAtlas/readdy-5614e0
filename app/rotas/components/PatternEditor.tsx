'use client';

import { useState, useEffect, useCallback } from 'react';
import { format, startOfMonth, endOfMonth, addDays, getDay } from 'date-fns';
import { useShiftPatternTemplates, type PatternSlot, type ShiftPatternTemplate } from '@/lib/useShiftPatternTemplates';
import { useAuth } from '@/lib/auth';

interface Props {
  template: ShiftPatternTemplate | null;
  onSave: () => void;
  onClose: () => void;
}

const SHIFT_TYPES: { code: PatternSlot['shift_type']; label: string; color: string; defaultStart: string; defaultEnd: string }[] = [
  { code: 'day', label: 'Day', color: '#F59E0B', defaultStart: '08:00', defaultEnd: '20:00' },
  { code: 'night', label: 'Night', color: '#6366F1', defaultStart: '20:00', defaultEnd: '08:00' },
  { code: '24h', label: '24hr', color: '#8B5CF6', defaultStart: '00:00', defaultEnd: '23:59' },
  { code: 'event', label: 'Event', color: '#10B981', defaultStart: '08:00', defaultEnd: '18:00' },
  { code: 'patrol', label: 'Patrol', color: '#06B6D4', defaultStart: '18:00', defaultEnd: '06:00' },
];

const CYCLE_PRESETS = [1, 4, 7, 8, 14, 21, 28];

function emptySlot(dayNum: number, type: PatternSlot['shift_type']): PatternSlot {
  const t = SHIFT_TYPES.find((s) => s.code === type) || SHIFT_TYPES[0];
  return {
    day: dayNum,
    day_offset: dayNum - 1,
    label: `${t.label} Shift`,
    start_time: t.defaultStart,
    end_time: t.defaultEnd,
    guards_required: 1,
    shift_type: type,
    is_rest_day: false,
  };
}

function restSlot(dayNum: number): PatternSlot {
  return {
    day: dayNum,
    day_offset: dayNum - 1,
    label: 'Rest Day',
    start_time: '00:00',
    end_time: '00:00',
    guards_required: 0,
    shift_type: 'day',
    is_rest_day: true,
  };
}

export default function PatternEditor({ template, onSave, onClose }: Props) {
  const { create, update, canEdit } = useShiftPatternTemplates();
  const { role } = useAuth();
  const isEditing = !!template;
  const [name, setName] = useState(template?.name || '');
  const [description, setDescription] = useState(template?.description || '');
  const [patternType, setPatternType] = useState(template?.pattern_type || 'weekly');
  const [cycleLength, setCycleLength] = useState(template?.cycle_length || 7);
  const [slots, setSlots] = useState<PatternSlot[]>(template?.slots || []);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [draggedType, setDraggedType] = useState<string | null>(null);
  const [previewMonth, setPreviewMonth] = useState(new Date());
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  useEffect(() => {
    if (template) {
      setName(template.name);
      setDescription(template.description || '');
      setPatternType(template.pattern_type || 'weekly');
      setCycleLength(template.cycle_length || 7);
      setSlots(template.slots.map((s) => ({ ...s })));
    }
  }, [template?.id]);

  const handleDragStart = useCallback((code: string) => {
    setDraggedType(code);
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
  }, []);

  const handleDrop = useCallback((e: React.DragEvent, dayNum: number, type: 'shift' | 'rest') => {
    e.preventDefault();
    const code = draggedType;
    if (!code && type === 'shift') return;

    setSlots((prev) => {
      const filtered = prev.filter((s) => s.day !== dayNum);
      if (type === 'rest') {
        return [...filtered, restSlot(dayNum)];
      }
      return [...filtered, emptySlot(dayNum, code as PatternSlot['shift_type'])];
    });
    setDraggedType(null);
  }, [draggedType]);

  const updateSlot = (dayNum: number, patch: Partial<PatternSlot>) => {
    setSlots((prev) => prev.map((s) => (s.day === dayNum ? { ...s, ...patch } : s)));
  };

  const removeSlot = (dayNum: number) => {
    setSlots((prev) => prev.filter((s) => s.day !== dayNum));
  };

  const getSlot = (dayNum: number) => slots.find((s) => s.day === dayNum);

  const validate = () => {
    const e: Record<string, string> = {};
    if (!name.trim()) e.name = 'Pattern name is required';
    if (cycleLength < 1 || cycleLength > 28) e.cycle = 'Cycle length must be 1–28 days';
    const activeSlots = slots.filter((s) => !s.is_rest_day);
    if (activeSlots.length === 0) e.slots = 'Add at least one shift slot';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSave = async () => {
    if (!validate()) return;
    if (!canEdit) {
      setSaveError('Permission denied: only admins can save patterns');
      return;
    }
    setSaving(true);
    setSaveError(null);

    const payload: Omit<ShiftPatternTemplate, 'id' | 'company_id' | 'created_at' | 'updated_at'> = {
      name: name.trim(),
      description: description.trim() || null,
      pattern_type: patternType,
      cycle_length: cycleLength,
      slots: slots.map((s) => ({ ...s })),
    };

    if (isEditing && template) {
      const { error } = await update(template.id, payload);
      if (error) {
        setSaveError(error.message);
      } else {
        onSave();
      }
    } else {
      const { error } = await create(payload);
      if (error) {
        setSaveError(error.message);
      } else {
        onSave();
      }
    }
    setSaving(false);
  };

  const handleCycleChange = (len: number) => {
    setCycleLength(len);
    setSlots((prev) => prev.filter((s) => s.day != null && s.day <= len));
    setErrors((prev) => ({ ...prev, cycle: '' }));
  };

  const monthDays = (() => {
    const start = startOfMonth(previewMonth);
    const end = endOfMonth(previewMonth);
    const arr: Array<{ date: Date; shift: PatternSlot | null }> = [];
    for (let d = new Date(start); d <= end; d = addDays(d, 1)) {
      const weekday = getDay(d);
      const normalizedDay = weekday === 0 ? 7 : weekday;
      const cycleDay = ((normalizedDay - 1) % cycleLength) + 1;
      const shift = slots.find((s) => s.day === cycleDay) || null;
      arr.push({ date: new Date(d), shift });
    }
    return arr;
  })();

  const shiftTypeColor = (code: string) => SHIFT_TYPES.find((t) => t.code === code)?.color || '#64748B';

  const cycleDayNumbers = Array.from({ length: cycleLength }, (_, i) => i + 1);
  const weekdayLabels = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="bg-[#111827] border border-gray-800 rounded-xl w-full max-w-5xl max-h-[92vh] overflow-hidden shadow-2xl flex flex-col">
        <div className="px-5 py-4 border-b border-gray-800 flex items-center justify-between shrink-0">
          <div>
            <h2 className="text-lg font-semibold text-white">
              {isEditing ? 'Edit Pattern' : 'New Shift Pattern'}
            </h2>
            <p className="text-xs text-gray-500 mt-0.5">
              Drag shift types onto days to build your pattern
            </p>
          </div>
          <button onClick={onClose} className="w-8 h-8 flex items-center justify-center text-gray-400 hover:text-white rounded-lg transition-colors cursor-pointer">
            <div className="w-4 h-4 flex items-center justify-center"><i className="ri-close-line"></i></div>
          </button>
        </div>

        <div className="flex-1 overflow-y-auto flex flex-col lg:flex-row">
          <div className="w-full lg:w-60 border-b lg:border-b-0 lg:border-r border-gray-800 p-4 shrink-0">
            <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">Shift Types</h3>
            <div className="space-y-2">
              {SHIFT_TYPES.map((type) => (
                <div
                  key={type.code}
                  draggable
                  onDragStart={() => handleDragStart(type.code)}
                  className="flex items-center gap-2.5 px-3 py-2.5 rounded-lg bg-gray-800/50 border border-gray-700/50 hover:border-gray-600 cursor-grab active:cursor-grabbing transition-colors select-none"
                >
                  <span className="w-3 h-3 rounded-full shrink-0" style={{ backgroundColor: type.color }} />
                  <div className="min-w-0">
                    <p className="text-xs font-medium text-white">{type.label}</p>
                    <p className="text-[10px] text-gray-500">{type.defaultStart}–{type.defaultEnd}</p>
                  </div>
                </div>
              ))}
              <div
                draggable
                onDragStart={() => handleDragStart('rest')}
                className="flex items-center gap-2.5 px-3 py-2.5 rounded-lg bg-gray-800/30 border border-gray-700/50 hover:border-gray-600 cursor-grab active:cursor-grabbing transition-colors select-none mt-2"
              >
                <span className="w-3 h-3 rounded-full shrink-0 bg-gray-600" />
                <div className="min-w-0">
                  <p className="text-xs font-medium text-gray-400">Rest Day</p>
                  <p className="text-[10px] text-gray-600">No shift assigned</p>
                </div>
              </div>
            </div>

            <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3 mt-6">Quick Fill</h3>
            <div className="space-y-1.5">
              <button
                onClick={() => {
                  const filled = Array.from({ length: cycleLength }, (_, i) => i + 1).map((d) =>
                    emptySlot(d, 'day')
                  );
                  setSlots(filled);
                }}
                className="w-full text-left px-3 py-2 rounded-lg bg-gray-800/30 border border-gray-800 hover:border-gray-600 text-xs text-gray-300 hover:text-white transition-colors cursor-pointer"
              >
                <p className="font-medium">All Day Shifts</p>
                <p className="text-[10px] text-gray-500 mt-0.5">{cycleLength} day shifts</p>
              </button>
              <button
                onClick={() => {
                  const filled = Array.from({ length: cycleLength }, (_, i) => i + 1).map((d) =>
                    d <= Math.floor(cycleLength / 2)
                      ? emptySlot(d, 'day')
                      : restSlot(d)
                  );
                  setSlots(filled);
                }}
                className="w-full text-left px-3 py-2 rounded-lg bg-gray-800/30 border border-gray-800 hover:border-gray-600 text-xs text-gray-300 hover:text-white transition-colors cursor-pointer"
              >
                <p className="font-medium">Half On / Half Off</p>
                <p className="text-[10px] text-gray-500 mt-0.5">First half days, rest second half</p>
              </button>
              <button
                onClick={() => setSlots([])}
                className="w-full text-left px-3 py-2 rounded-lg bg-gray-800/30 border border-gray-800 hover:border-red-500/30 text-xs text-gray-400 hover:text-red-400 transition-colors cursor-pointer"
              >
                <p className="font-medium">Clear All</p>
              </button>
            </div>
          </div>

          <div className="flex-1 p-5 space-y-5 overflow-y-auto">
            {saveError && (
              <div className="bg-red-500/10 border border-red-500/20 text-red-400 text-sm px-4 py-2.5 rounded-lg flex items-center gap-2">
                <div className="w-4 h-4 flex items-center justify-center"><i className="ri-error-warning-line"></i></div>
                {saveError}
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">Pattern Name *</label>
                <input
                  value={name}
                  onChange={(e) => { setName(e.target.value); setErrors((prev) => ({ ...prev, name: '' })); }}
                  placeholder="e.g. 4 On / 4 Off Day"
                  className={`w-full bg-gray-800/60 border rounded-lg px-3 py-2 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 ${errors.name ? 'border-red-500/50' : 'border-gray-700'}`}
                />
                {errors.name && <p className="text-xs text-red-400 mt-1">{errors.name}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">Description</label>
                <input
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Brief description"
                  className="w-full bg-gray-800/60 border border-gray-700 rounded-lg px-3 py-2 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-blue-500"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">Pattern Type</label>
                <div className="flex items-center gap-1 bg-gray-800 rounded-lg p-1">
                  {['weekly', 'rotational', 'single'].map((t) => (
                    <button
                      key={t}
                      onClick={() => setPatternType(t)}
                      className={`px-3 py-1.5 rounded-md text-xs font-medium capitalize transition-colors cursor-pointer whitespace-nowrap ${
                        patternType === t ? 'bg-blue-600 text-white' : 'text-gray-400 hover:text-white'
                      }`}
                    >
                      {t}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">Cycle Length (days)</label>
                <div className="flex items-center gap-2 flex-wrap">
                  {CYCLE_PRESETS.map((len) => (
                    <button
                      key={len}
                      onClick={() => handleCycleChange(len)}
                      className={`px-2.5 py-1 rounded-md text-xs font-medium transition-colors cursor-pointer whitespace-nowrap ${
                        cycleLength === len ? 'bg-blue-600 text-white' : 'bg-gray-800 text-gray-400 hover:text-white border border-gray-700'
                      }`}
                    >
                      {len}d
                    </button>
                  ))}
                  <input
                    type="number"
                    min={1}
                    max={28}
                    value={cycleLength}
                    onChange={(e) => handleCycleChange(Math.max(1, Math.min(28, parseInt(e.target.value) || 1)))}
                    className="w-14 bg-gray-800/60 border border-gray-700 rounded-lg px-2 py-1 text-xs text-white text-center focus:outline-none focus:border-blue-500"
                  />
                </div>
                {errors.cycle && <p className="text-xs text-red-400 mt-1">{errors.cycle}</p>}
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-3">
                <label className="block text-sm font-medium text-gray-300">Pattern Builder</label>
                <span className="text-xs text-gray-500">
                  {slots.filter((s) => !s.is_rest_day).length} shifts · {slots.filter((s) => s.is_rest_day).length} rest across {cycleLength} days
                </span>
              </div>

              {errors.slots && <p className="text-xs text-red-400 mb-2">{errors.slots}</p>}

              <div className="grid grid-cols-7 gap-2">
                {cycleDayNumbers.map((dayNum) => {
                  const slot = getSlot(dayNum);
                  const weekday = weekdayLabels[(dayNum - 1) % 7];

                  if (!slot) {
                    return (
                      <div
                        key={dayNum}
                        onDragOver={handleDragOver}
                        onDrop={(e) => handleDrop(e, dayNum, 'shift')}
                        className="bg-gray-800/30 border-2 border-dashed border-gray-700 rounded-xl p-3 min-h-[110px] flex flex-col items-center justify-center transition-colors hover:border-gray-500 cursor-pointer"
                      >
                        <span className="text-[10px] text-gray-500 uppercase font-medium">{weekday}</span>
                        <span className="text-xl font-bold text-gray-700 mt-1">{dayNum}</span>
                        <span className="text-[10px] text-gray-600 mt-0.5">Drop here</span>
                      </div>
                    );
                  }

                  const isRest = slot.is_rest_day;
                  const color = isRest ? '#4B5563' : shiftTypeColor(slot.shift_type);

                  return (
                    <div
                      key={dayNum}
                      onDragOver={handleDragOver}
                      onDrop={(e) => handleDrop(e, dayNum, 'shift')}
                      className="rounded-xl border border-gray-700 p-3 min-h-[110px] flex flex-col transition-colors hover:border-gray-500"
                      style={{ backgroundColor: `${color}10` }}
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] text-gray-500 uppercase font-medium">{weekday}</span>
                        <button
                          onClick={() => removeSlot(dayNum)}
                          className="w-5 h-5 flex items-center justify-center text-gray-500 hover:text-red-400 rounded transition-colors cursor-pointer"
                        >
                          <div className="w-3 h-3 flex items-center justify-center"><i className="ri-close-line text-xs"></i></div>
                        </button>
                      </div>
                      <span className="text-xl font-bold text-white mt-0.5">{dayNum}</span>

                      {isRest ? (
                        <div className="mt-auto pt-2">
                          <div className="flex items-center gap-1.5">
                            <span className="w-2 h-2 rounded-full shrink-0 bg-gray-500" />
                            <span className="text-xs font-medium text-gray-400">Rest Day</span>
                          </div>
                        </div>
                      ) : (
                        <div className="mt-auto pt-2 space-y-1">
                          <div className="flex items-center gap-1.5">
                            <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: color }} />
                            <span className="text-xs font-medium text-white truncate">{slot.label || `${slot.shift_type} Shift`}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <input
                              type="time"
                              value={slot.start_time}
                              onChange={(e) => updateSlot(dayNum, { start_time: e.target.value })}
                              className="w-[60px] bg-gray-900/50 border border-gray-700 rounded px-1 py-0.5 text-[10px] text-gray-300 focus:outline-none focus:border-blue-500"
                            />
                            <span className="text-gray-600 text-[10px]">→</span>
                            <input
                              type="time"
                              value={slot.end_time}
                              onChange={(e) => updateSlot(dayNum, { end_time: e.target.value })}
                              className="w-[60px] bg-gray-900/50 border border-gray-700 rounded px-1 py-0.5 text-[10px] text-gray-300 focus:outline-none focus:border-blue-500"
                            />
                          </div>
                          <div className="flex items-center gap-1">
                            <span className="text-[10px] text-gray-500">Guards:</span>
                            <button
                              onClick={() => updateSlot(dayNum, { guards_required: Math.max(1, (slot.guards_required || 1) - 1) })}
                              className="w-4 h-4 flex items-center justify-center rounded bg-gray-700 text-gray-400 hover:text-white cursor-pointer"
                            >
                              <div className="w-3 h-3 flex items-center justify-center"><i className="ri-subtract-line text-[8px]"></i></div>
                            </button>
                            <span className="text-[10px] text-white w-3 text-center">{slot.guards_required}</span>
                            <button
                              onClick={() => updateSlot(dayNum, { guards_required: (slot.guards_required || 1) + 1 })}
                              className="w-4 h-4 flex items-center justify-center rounded bg-gray-700 text-gray-400 hover:text-white cursor-pointer"
                            >
                              <div className="w-3 h-3 flex items-center justify-center"><i className="ri-add-line text-[8px]"></i></div>
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-3">
                <label className="block text-sm font-medium text-gray-300">Month Preview</label>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setPreviewMonth((m) => addDays(m, -30))}
                    className="w-7 h-7 flex items-center justify-center rounded-lg bg-gray-800 text-gray-400 hover:text-white cursor-pointer"
                  >
                    <div className="w-4 h-4 flex items-center justify-center"><i className="ri-arrow-left-s-line"></i></div>
                  </button>
                  <span className="text-xs text-white font-medium w-24 text-center">{format(previewMonth, 'MMMM yyyy')}</span>
                  <button
                    onClick={() => setPreviewMonth((m) => addDays(m, 30))}
                    className="w-7 h-7 flex items-center justify-center rounded-lg bg-gray-800 text-gray-400 hover:text-white cursor-pointer"
                  >
                    <div className="w-4 h-4 flex items-center justify-center"><i className="ri-arrow-right-s-line"></i></div>
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-7 gap-1">
                {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((d) => (
                  <div key={d} className="text-center text-[10px] text-gray-500 uppercase font-medium py-1">{d}</div>
                ))}
                {monthDays.map(({ date, shift }, i) => {
                  const isToday = format(new Date(), 'yyyy-MM-dd') === format(date, 'yyyy-MM-dd');
                  const isRest = shift?.is_rest_day;
                  const color = isRest ? '#4B5563' : (shift ? shiftTypeColor(shift.shift_type) : undefined);
                  return (
                    <div
                      key={i}
                      className={`aspect-square rounded-lg p-1 flex flex-col items-center justify-center border ${isToday ? 'border-blue-500/50' : 'border-gray-800'} ${shift ? '' : 'bg-gray-800/20'}`}
                      style={shift && !isRest ? { backgroundColor: `${color}15`, borderColor: `${color}30` } : undefined}
                    >
                      <span className={`text-xs font-medium ${isToday ? 'text-blue-400' : 'text-gray-400'}`}>{date.getDate()}</span>
                      {shift && !isRest && (
                        <span className="w-1.5 h-1.5 rounded-full mt-0.5" style={{ backgroundColor: color }} />
                      )}
                    </div>
                  );
                })}
              </div>

              <div className="flex flex-wrap gap-3 mt-3">
                {SHIFT_TYPES.map((t) => (
                  <div key={t.code} className="flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full" style={{ backgroundColor: t.color }} />
                    <span className="text-[11px] text-gray-400">{t.label}</span>
                  </div>
                ))}
                <div className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-gray-600" />
                  <span className="text-[11px] text-gray-500">Rest</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="px-5 py-4 border-t border-gray-800 flex items-center justify-between shrink-0">
          <p className="text-xs text-gray-500">
            {slots.filter((s) => !s.is_rest_day).length} shifts · {cycleLength}-day cycle
          </p>
          <div className="flex items-center gap-3">
            <button onClick={onClose} className="px-4 py-2 rounded-lg text-sm font-medium text-gray-400 hover:text-white transition-colors cursor-pointer whitespace-nowrap">
              Cancel
            </button>
            {!canEdit && (
              <span className="text-xs text-amber-400 bg-amber-500/10 px-3 py-2 rounded-lg">
                View only — admin access required to edit
              </span>
            )}
            <button
              onClick={handleSave}
              disabled={saving || !canEdit}
              className="inline-flex items-center gap-2 px-5 py-2 rounded-lg text-sm font-medium bg-blue-600 hover:bg-blue-500 text-white transition-colors disabled:opacity-50 cursor-pointer whitespace-nowrap"
            >
              {saving && <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />}
              <div className="w-4 h-4 flex items-center justify-center"><i className="ri-save-line"></i></div>
              {isEditing ? 'Update Pattern' : 'Save Pattern'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}