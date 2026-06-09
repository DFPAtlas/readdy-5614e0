'use client';

import { useState } from 'react';
import type { RotaPattern } from '@/lib/useRotaPatterns';
import type { ShiftType } from '@/lib/useShiftTypes';

interface Props {
  pattern: RotaPattern | null;
  shiftTypes: ShiftType[];
  onClose: () => void;
}

export default function PatternPreviewModal({ pattern, shiftTypes, onClose }: Props) {
  if (!pattern) return null;

  const [previewMonth, setPreviewMonth] = useState(new Date());

  const monthName = previewMonth.toLocaleDateString('en-GB', { month: 'long', year: 'numeric' });
  const startOfMonth = new Date(previewMonth.getFullYear(), previewMonth.getMonth(), 1);
  const endOfMonth = new Date(previewMonth.getFullYear(), previewMonth.getMonth() + 1, 0);
  const startDay = startOfMonth.getDay();
  const adjustedStart = startDay === 0 ? 6 : startDay - 1;

  const days: Array<{ day: number; shift: ReturnType<typeof getShiftForDay> }> = [];
  for (let d = 1; d <= endOfMonth.getDate(); d++) {
    days.push({ day: d, shift: getShiftForDay(d, adjustedStart, pattern, previewMonth) });
  }

  const shiftTypeColor = (code: string) => shiftTypes.find((t) => t.code === code)?.color || '#64748B';
  const shiftTypeName = (code: string) => shiftTypes.find((t) => t.code === code)?.name || code;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="bg-[#111827] border border-gray-800 rounded-xl w-full max-w-lg shadow-2xl">
        <div className="px-5 py-4 border-b border-gray-800 flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold text-white">Pattern Preview</h2>
            <p className="text-xs text-gray-500 mt-0.5">{pattern.name} — {pattern.cycle_length}-day cycle</p>
          </div>
          <button onClick={onClose} className="w-8 h-8 flex items-center justify-center text-gray-400 hover:text-white rounded-lg transition-colors cursor-pointer">
            <div className="w-4 h-4 flex items-center justify-center"><i className="ri-close-line"></i></div>
          </button>
        </div>

        <div className="px-5 py-4">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-medium text-white">{monthName}</h3>
            <div className="flex items-center gap-2">
              <button
                onClick={() => {
                  const m = new Date(previewMonth);
                  m.setMonth(m.getMonth() - 1);
                  setPreviewMonth(m);
                }}
                className="w-7 h-7 flex items-center justify-center rounded-lg bg-gray-800 text-gray-400 hover:text-white cursor-pointer"
              >
                <div className="w-4 h-4 flex items-center justify-center"><i className="ri-arrow-left-s-line"></i></div>
              </button>
              <button
                onClick={() => {
                  const m = new Date(previewMonth);
                  m.setMonth(m.getMonth() + 1);
                  setPreviewMonth(m);
                }}
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
            {Array.from({ length: adjustedStart }).map((_, i) => (
              <div key={`pad-${i}`} className="aspect-square" />
            ))}
            {days.map(({ day, shift }) => {
              const isToday = new Date().getDate() === day && new Date().getMonth() === previewMonth.getMonth() && new Date().getFullYear() === previewMonth.getFullYear();
              return (
                <div
                  key={day}
                  className={`aspect-square rounded-lg p-1 flex flex-col items-center justify-center border ${
                    isToday ? 'border-blue-500/50' : 'border-gray-800'
                  } ${shift ? '' : 'bg-gray-800/20'}`}
                  style={shift ? { backgroundColor: `${shiftTypeColor(shift.shift_type)}15`, borderColor: `${shiftTypeColor(shift.shift_type)}30` } : undefined}
                >
                  <span className={`text-xs font-medium ${isToday ? 'text-blue-400' : 'text-gray-400'}`}>{day}</span>
                  {shift && (
                    <>
                      <span className="w-1.5 h-1.5 rounded-full mt-0.5" style={{ backgroundColor: shiftTypeColor(shift.shift_type) }} />
                      <span className="text-[8px] text-gray-500 mt-0.5 truncate max-w-full">{shiftTypeName(shift.shift_type)}</span>
                    </>
                  )}
                </div>
              );
            })}
          </div>

          <div className="flex flex-wrap gap-3 mt-4 pt-3 border-t border-gray-800">
            {shiftTypes.filter((t) => t.is_active).map((t) => (
              <div key={t.id} className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full" style={{ backgroundColor: t.color }} />
                <span className="text-[11px] text-gray-400">{t.name}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="px-5 py-4 border-t border-gray-800 flex justify-end">
          <button onClick={onClose} className="px-4 py-2 rounded-lg text-sm font-medium text-gray-400 hover:text-white transition-colors cursor-pointer whitespace-nowrap">
            Close
          </button>
        </div>
      </div>
    </div>
  );
}

function getShiftForDay(
  dayOfMonth: number,
  startDayOffset: number,
  pattern: RotaPattern,
  monthDate: Date
) {
  const dayIndex = (startDayOffset + dayOfMonth - 1) % pattern.cycle_length;
  return pattern.days.find((d) => d.day_offset === dayIndex) || null;
}