'use client';

import { useState } from 'react';
import { ShiftPatternTemplate, PatternSlot } from '@/lib/useShiftPatternTemplates';

interface Props {
  templates: ShiftPatternTemplate[];
  onSave: (template: Omit<ShiftPatternTemplate, 'id' | 'company_id' | 'created_at' | 'updated_at'>) => void;
  onClose: () => void;
  editingTemplate?: ShiftPatternTemplate | null;
}

const shiftTypeLabel: Record<string, string> = {
  day: 'Day',
  night: 'Night',
  '24h': '24hr',
  event: 'Event',
  patrol: 'Patrol',
};

export default function PatternBuilder({ templates = [], onSave, onClose, editingTemplate = null }: Props) {
  const safeTemplate = editingTemplate && typeof editingTemplate === 'object' ? editingTemplate : null;
  const [name, setName] = useState(safeTemplate?.name || '');
  const [description, setDescription] = useState(safeTemplate?.description || '');
  const [patternType, setPatternType] = useState(safeTemplate?.pattern_type || 'weekly');
  const [cycleLength, setCycleLength] = useState(safeTemplate?.cycle_length || 7);
  const [slots, setSlots] = useState<PatternSlot[]>(
    Array.isArray(safeTemplate?.slots) ? safeTemplate.slots : []
  );
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [dupeCheck, setDupeCheck] = useState(false);

  const nameTaken = (n: string) => {
    if (!Array.isArray(templates)) return false;
    return templates.filter(Boolean).some((t) => {
      const tName = t && typeof t === 'object' ? (t as any).name : '';
      const tId = t && typeof t === 'object' ? (t as any).id : '';
      return (tName || '').trim().toLowerCase() === n.trim().toLowerCase() && tId !== (safeTemplate?.id || '');
    });
  };

  const validate = () => {
    const e: Record<string, string> = {};
    if (!name.trim()) e.name = 'Pattern name is required';
    else if (nameTaken(name)) e.name = 'A pattern with this name already exists';
    if (!Array.isArray(slots) || slots.length === 0) e.slots = 'Add at least one shift slot';
    if (cycleLength < 1 || cycleLength > 28) e.cycle = 'Cycle length must be 1–28 days';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const addSlot = () => {
    setSlots((prev) => [
      ...prev,
      { day_offset: 0, shift_type: 'day', start_time: '08:00', end_time: '20:00', guards_required: 1 },
    ]);
  };

  const updateSlot = (i: number, patch: Partial<PatternSlot>) => {
    setSlots((prev) => prev.map((s, idx) => (idx === i ? { ...s, ...patch } : s)));
  };

  const removeSlot = (i: number) => {
    setSlots((prev) => prev.filter((_, idx) => idx !== i));
  };

  const dupeFromExisting = (raw: unknown) => {
    const t = raw && typeof raw === 'object' ? (raw as ShiftPatternTemplate) : null;
    if (!t) return;
    setName(((t as any).name || '') + ' (Copy)');
    setDescription((t as any).description || '');
    setPatternType((t as any).pattern_type || 'weekly');
    setCycleLength((t as any).cycle_length || 7);
    const rawSlots = (t as any).slots;
    setSlots(Array.isArray(rawSlots) ? rawSlots.map((s: any) => ({ ...s })) : []);
    setDupeCheck(false);
  };

  const handleSubmit = () => {
    if (!validate()) return;
    onSave({
      name: name.trim(),
      description: description.trim() || null,
      pattern_type: patternType,
      cycle_length: cycleLength,
      slots,
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="bg-[#111827] border border-gray-800 rounded-xl w-full max-w-xl max-h-[90vh] overflow-y-auto shadow-2xl">
        <div className="px-5 py-4 border-b border-gray-800 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-white">
            {editingTemplate ? 'Edit Pattern' : 'New Shift Pattern'}
          </h2>
          <button onClick={onClose} className="w-8 h-8 flex items-center justify-center text-gray-400 hover:text-white rounded-lg transition-colors cursor-pointer">
            <div className="w-4 h-4 flex items-center justify-center"><i className="ri-close-line"></i></div>
          </button>
        </div>

        <div className="px-5 py-4 space-y-4">
          {!safeTemplate && Array.isArray(templates) && templates.length > 0 && (
            <div className="bg-gray-800/40 rounded-lg p-3 border border-gray-700/50">
              <div className="flex items-center justify-between">
                <p className="text-xs font-medium text-gray-400">Or duplicate an existing pattern</p>
                <button
                  onClick={() => setDupeCheck(!dupeCheck)}
                  className="text-xs text-blue-400 hover:text-blue-300 cursor-pointer whitespace-nowrap"
                >
                  {dupeCheck ? 'Hide' : 'Show templates'}
                </button>
              </div>
              {dupeCheck && (
                <div className="mt-2 grid grid-cols-2 gap-2">
                  {templates.filter(Boolean).map((raw) => {
                    const t = raw && typeof raw === 'object' ? (raw as ShiftPatternTemplate) : null;
                    if (!t) return null;
                    return (
                      <button
                        key={(t as any).id || Math.random()}
                        onClick={() => dupeFromExisting(t)}
                        className="text-left px-3 py-2 rounded-lg bg-gray-900/60 border border-gray-800 text-xs text-gray-300 hover:border-gray-600 transition-colors cursor-pointer"
                      >
                        <p className="font-medium">{(t as any).name || 'Unnamed'}</p>
                        <p className="text-[10px] text-gray-500 mt-0.5">{Array.isArray((t as any).slots) ? (t as any).slots.length : 0} slots · {(t as any).pattern_type || 'unknown'}</p>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">Pattern Name *</label>
            <input
              value={name}
              onChange={(e) => { setName(e.target.value); setErrors((prev) => ({ ...prev, name: '' })); }}
              placeholder="e.g. 4 On / 4 Off Night"
              className={`w-full bg-gray-800/60 border rounded-lg px-3 py-2 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 ${errors.name ? 'border-red-500/50' : 'border-gray-700'}`}
            />
            {errors?.name && <p className="text-xs text-red-400 mt-1">{errors.name}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">Description</label>
            <input
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Brief explanation of this pattern"
              className="w-full bg-gray-800/60 border border-gray-700 rounded-lg px-3 py-2 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-blue-500"
            />
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
              <input
                type="number"
                min={1}
                max={28}
                value={cycleLength}
                onChange={(e) => { setCycleLength(parseInt(e.target.value) || 1); setErrors((prev) => ({ ...prev, cycle: '' })); }}
                className={`w-full bg-gray-800/60 border rounded-lg px-3 py-2 text-sm text-white text-center focus:outline-none focus:border-blue-500 ${errors.cycle ? 'border-red-500/50' : 'border-gray-700'}`}
              />
              {errors?.cycle && <p className="text-xs text-red-400 mt-1">{errors.cycle}</p>}
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="block text-sm font-medium text-gray-300">Shift Slots</label>
              <button
                onClick={addSlot}
                className="text-xs text-blue-400 hover:text-blue-300 flex items-center gap-1 cursor-pointer whitespace-nowrap"
              >
                <div className="w-3 h-3 flex items-center justify-center"><i className="ri-add-line"></i></div>
                Add Slot
              </button>
            </div>

            {errors?.slots && <p className="text-xs text-red-400 mb-2">{errors.slots}</p>}

            {slots.length === 0 ? (
              <div className="text-center py-6 bg-gray-800/30 rounded-lg border border-gray-800 border-dashed">
                <div className="w-8 h-8 mx-auto mb-2 flex items-center justify-center rounded-lg bg-gray-800/50">
                  <i className="ri-calendar-todo-line text-gray-500 text-sm" />
                </div>
                <p className="text-xs text-gray-500">No slots yet. Add one above.</p>
              </div>
            ) : (
              <div className="space-y-2">
                {slots.map((slot, i) => (
                  <div key={i} className="flex items-center gap-2 bg-gray-900/40 rounded-lg px-3 py-2">
                    <div>
                      <label className="text-[10px] text-gray-500 block mb-0.5">Day</label>
                      <input
                        type="number"
                        min={0}
                        max={cycleLength - 1}
                        value={slot.day_offset}
                        onChange={(e) => updateSlot(i, { day_offset: parseInt(e.target.value) || 0 })}
                        className="w-12 bg-gray-800 border border-gray-700 rounded-md px-1.5 py-1 text-xs text-white text-center focus:outline-none focus:border-blue-500"
                      />
                    </div>

                    <div>
                      <label className="text-[10px] text-gray-500 block mb-0.5">Type</label>
                      <div className="flex items-center gap-0.5 bg-gray-800 rounded-md p-0.5">
                        {(['day', 'night', '24h', 'event', 'patrol'] as const).map((t) => (
                          <button
                            key={t}
                            onClick={() => updateSlot(i, { shift_type: t })}
                            className={`px-2 py-0.5 rounded text-[10px] font-medium capitalize transition-colors cursor-pointer whitespace-nowrap ${
                              slot.shift_type === t ? 'bg-blue-600 text-white' : 'text-gray-400 hover:text-white'
                            }`}
                          >
                            {shiftTypeLabel[t]}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="flex items-center gap-1">
                      <div>
                        <label className="text-[10px] text-gray-500 block mb-0.5">Start</label>
                        <input
                          type="time"
                          value={slot.start_time}
                          onChange={(e) => updateSlot(i, { start_time: e.target.value })}
                          className="w-[68px] bg-gray-800 border border-gray-700 rounded-md px-1.5 py-1 text-xs text-white focus:outline-none focus:border-blue-500"
                        />
                      </div>
                      <span className="text-gray-600 text-[10px] mt-3">→</span>
                      <div>
                        <label className="text-[10px] text-gray-500 block mb-0.5">End</label>
                        <input
                          type="time"
                          value={slot.end_time}
                          onChange={(e) => updateSlot(i, { end_time: e.target.value })}
                          className="w-[68px] bg-gray-800 border border-gray-700 rounded-md px-1.5 py-1 text-xs text-white focus:outline-none focus:border-blue-500"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="text-[10px] text-gray-500 block mb-0.5">Guards</label>
                      <input
                        type="number"
                        min={1}
                        max={20}
                        value={slot.guards_required}
                        onChange={(e) => updateSlot(i, { guards_required: Math.max(1, parseInt(e.target.value) || 1) })}
                        className="w-12 bg-gray-800 border border-gray-700 rounded-md px-1.5 py-1 text-xs text-white text-center focus:outline-none focus:border-blue-500"
                      />
                    </div>

                    <button
                      onClick={() => removeSlot(i)}
                      className="w-7 h-7 ml-auto flex items-center justify-center rounded-md hover:bg-red-500/10 text-gray-500 hover:text-red-400 transition-colors cursor-pointer shrink-0"
                      title="Remove slot"
                    >
                      <div className="w-3 h-3 flex items-center justify-center"><i className="ri-delete-bin-line text-xs"></i></div>
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="px-5 py-4 border-t border-gray-800 flex items-center justify-end gap-3">
          <button onClick={onClose} className="px-4 py-2 rounded-lg text-sm font-medium text-gray-400 hover:text-white transition-colors cursor-pointer whitespace-nowrap">
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            className="inline-flex items-center gap-2 px-5 py-2 rounded-lg text-sm font-medium bg-blue-600 hover:bg-blue-500 text-white transition-colors cursor-pointer whitespace-nowrap"
          >
            {editingTemplate ? 'Update Pattern' : 'Save Pattern'}
          </button>
        </div>
      </div>
    </div>
  );
}