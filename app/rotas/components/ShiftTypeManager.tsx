'use client';

import { useState } from 'react';
import type { ShiftType } from '@/lib/useShiftTypes';

interface Props {
  shiftTypes: ShiftType[];
  onCreate: (type: Partial<ShiftType>) => void;
  onUpdate: (id: string, type: Partial<ShiftType>) => void;
  onRemove: (id: string) => void;
  onClose: () => void;
}

const PRESET_COLORS = [
  '#F59E0B', '#6366F1', '#10B981', '#EC4899', '#EF4444',
  '#8B5CF6', '#06B6D4', '#F97316', '#84CC16', '#64748B',
  '#D946EF', '#14B8A6', '#FB923C', '#A855F7', '#E11D48',
];

export default function ShiftTypeManager({ shiftTypes, onCreate, onUpdate, onRemove, onClose }: Props) {
  const [editing, setEditing] = useState<ShiftType | null>(null);
  const [name, setName] = useState('');
  const [code, setCode] = useState('');
  const [startTime, setStartTime] = useState('08:00');
  const [endTime, setEndTime] = useState('16:00');
  const [color, setColor] = useState(PRESET_COLORS[0]);
  const [isPaid, setIsPaid] = useState(true);
  const [breakDuration, setBreakDuration] = useState(30);
  const [notes, setNotes] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>();

  const resetForm = () => {
    setName('');
    setCode('');
    setStartTime('08:00');
    setEndTime('16:00');
    setColor(PRESET_COLORS[0]);
    setIsPaid(true);
    setBreakDuration(30);
    setNotes('');
    setEditing(null);
    setErrors({});
  };

  const startEdit = (type: ShiftType) => {
    setEditing(type);
    setName(type.name);
    setCode(type.code);
    setStartTime(type.start_time || '08:00');
    setEndTime(type.end_time || '16:00');
    setColor(type.color);
    setIsPaid(type.is_paid);
    setBreakDuration(type.break_duration_minutes);
    setNotes(type.notes || '');
  };

  const validate = () => {
    const e: Record<string, string> = {};
    if (!name.trim()) e.name = 'Name is required';
    if (!code.trim()) e.code = 'Code is required';
    else if (!editing && shiftTypes.some((t) => t.code === code.trim())) e.code = 'Code already exists';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSave = () => {
    if (!validate()) return;
    if (editing) {
      onUpdate(editing.id, {
        name: name.trim(),
        code: code.trim(),
        start_time: startTime || null,
        end_time: endTime || null,
        color,
        is_paid: isPaid,
        break_duration_minutes: breakDuration,
        notes: notes.trim() || null,
      });
      resetForm();
    } else {
      onCreate({
        name: name.trim(),
        code: code.trim(),
        start_time: startTime || null,
        end_time: endTime || null,
        color,
        is_paid: isPaid,
        break_duration_minutes: breakDuration,
        notes: notes.trim() || null,
      });
      resetForm();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="bg-[#111827] border border-gray-800 rounded-xl w-full max-w-xl max-h-[90vh] overflow-hidden shadow-2xl flex flex-col">
        <div className="px-5 py-4 border-b border-gray-800 flex items-center justify-between shrink-0">
          <div>
            <h2 className="text-lg font-semibold text-white">Shift Type Manager</h2>
            <p className="text-xs text-gray-500 mt-0.5">Create and manage shift blocks for your patterns</p>
          </div>
          <button onClick={onClose} className="w-8 h-8 flex items-center justify-center text-gray-400 hover:text-white rounded-lg transition-colors cursor-pointer">
            <div className="w-4 h-4 flex items-center justify-center"><i className="ri-close-line"></i></div>
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-5 space-y-4">
          {/* Existing types list */}
          <div>
            <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Current Shift Types</h3>
            <div className="space-y-1.5">
              {shiftTypes.filter((t) => t.is_active).map((type) => (
                <div
                  key={type.id}
                  className="flex items-center gap-3 px-3 py-2.5 rounded-lg bg-gray-800/40 border border-gray-800 hover:border-gray-700 transition-colors"
                >
                  <span className="w-3 h-3 rounded-full shrink-0" style={{ backgroundColor: type.color }} />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-white">{type.name}</p>
                    <p className="text-[10px] text-gray-500">
                      {type.code} · {type.start_time && type.end_time ? `${type.start_time}–${type.end_time}` : 'No fixed hours'} · {type.is_paid ? 'Paid' : 'Unpaid'} · {type.break_duration_minutes}min break
                    </p>
                  </div>
                  <button
                    onClick={() => startEdit(type)}
                    className="w-7 h-7 flex items-center justify-center rounded-md text-gray-500 hover:text-white hover:bg-gray-800 transition-colors cursor-pointer"
                  >
                    <div className="w-3.5 h-3.5 flex items-center justify-center"><i className="ri-pencil-line text-xs"></i></div>
                  </button>
                  <button
                    onClick={() => onRemove(type.id)}
                    className="w-7 h-7 flex items-center justify-center rounded-md text-gray-500 hover:text-red-400 hover:bg-red-500/10 transition-colors cursor-pointer"
                  >
                    <div className="w-3.5 h-3.5 flex items-center justify-center"><i className="ri-delete-bin-line text-xs"></i></div>
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Create/Edit form */}
          <div className="border-t border-gray-800 pt-4">
            <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">
              {editing ? 'Edit Shift Type' : 'New Shift Type'}
            </h3>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-gray-300 mb-1">Name *</label>
                <input
                  value={name}
                  onChange={(e) => { setName(e.target.value); setErrors((prev) => ({ ...prev, name: '' })); }}
                  placeholder="e.g. Evening Shift"
                  className={`w-full bg-gray-800/60 border rounded-lg px-3 py-2 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 ${errors?.name ? 'border-red-500/50' : 'border-gray-700'}`}
                />
                {errors?.name && <p className="text-xs text-red-400 mt-0.5">{errors.name}</p>}
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-300 mb-1">Code *</label>
                <input
                  value={code}
                  onChange={(e) => { setCode(e.target.value.toLowerCase().replace(/\s+/g, '_')); setErrors((prev) => ({ ...prev, code: '' })); }}
                  placeholder="evening_shift"
                  className={`w-full bg-gray-800/60 border rounded-lg px-3 py-2 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 ${errors?.code ? 'border-red-500/50' : 'border-gray-700'}`}
                />
                {errors?.code && <p className="text-xs text-red-400 mt-0.5">{errors.code}</p>}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 mt-3">
              <div>
                <label className="block text-xs font-medium text-gray-300 mb-1">Start Time</label>
                <input
                  type="time"
                  value={startTime}
                  onChange={(e) => setStartTime(e.target.value)}
                  className="w-full bg-gray-800/60 border border-gray-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-300 mb-1">End Time</label>
                <input
                  type="time"
                  value={endTime}
                  onChange={(e) => setEndTime(e.target.value)}
                  className="w-full bg-gray-800/60 border border-gray-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-blue-500"
                />
              </div>
            </div>

            <div className="mt-3">
              <label className="block text-xs font-medium text-gray-300 mb-1">Colour</label>
              <div className="flex items-center gap-2 flex-wrap">
                {PRESET_COLORS.map((c) => (
                  <button
                    key={c}
                    onClick={() => setColor(c)}
                    className={`w-7 h-7 rounded-full border-2 transition-all cursor-pointer ${color === c ? 'border-white scale-110' : 'border-transparent hover:scale-105'}`}
                    style={{ backgroundColor: c }}
                  />
                ))}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 mt-3">
              <div>
                <label className="block text-xs font-medium text-gray-300 mb-1">Break (minutes)</label>
                <input
                  type="number"
                  min={0}
                  max={120}
                  value={breakDuration}
                  onChange={(e) => setBreakDuration(Math.max(0, parseInt(e.target.value) || 0))}
                  className="w-full bg-gray-800/60 border border-gray-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-blue-500"
                />
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setIsPaid(!isPaid)}
                  className={`w-5 h-5 rounded border flex items-center justify-center transition-colors shrink-0 cursor-pointer ${isPaid ? 'bg-blue-500 border-blue-500' : 'border-gray-600'}`}
                >
                  {isPaid && <i className="ri-check-line text-white text-xs"></i>}
                </button>
                <span className="text-sm text-white">Paid shift</span>
              </div>
            </div>

            <div className="mt-3">
              <label className="block text-xs font-medium text-gray-300 mb-1">Notes</label>
              <input
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Optional description"
                className="w-full bg-gray-800/60 border border-gray-700 rounded-lg px-3 py-2 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-blue-500"
              />
            </div>
          </div>
        </div>

        <div className="px-5 py-4 border-t border-gray-800 flex items-center justify-end gap-3 shrink-0">
          {editing && (
            <button onClick={resetForm} className="px-4 py-2 rounded-lg text-sm font-medium text-gray-400 hover:text-white transition-colors cursor-pointer whitespace-nowrap">
              Cancel Edit
            </button>
          )}
          <button onClick={onClose} className="px-4 py-2 rounded-lg text-sm font-medium text-gray-400 hover:text-white transition-colors cursor-pointer whitespace-nowrap">
            Close
          </button>
          <button
            onClick={handleSave}
            className="inline-flex items-center gap-2 px-5 py-2 rounded-lg text-sm font-medium bg-blue-600 hover:bg-blue-500 text-white transition-colors cursor-pointer whitespace-nowrap"
          >
            <div className="w-4 h-4 flex items-center justify-center"><i className="ri-save-line"></i></div>
            {editing ? 'Update' : 'Create'} Shift Type
          </button>
        </div>
      </div>
    </div>
  );
}