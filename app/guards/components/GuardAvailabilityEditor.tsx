import { useState } from 'react';
import { useGuardAvailability } from '@/lib/useGuardAvailability';

const DAY_LABELS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const SLOT_LABELS = ['Morning', 'Afternoon', 'Night'];
const SLOT_COLORS = ['bg-emerald-500/15 text-emerald-400 border-emerald-500/25', 'bg-amber-500/15 text-amber-400 border-amber-500/25', 'bg-indigo-500/15 text-indigo-400 border-indigo-500/25'];

export default function GuardAvailabilityEditor({ guardId }: { guardId: string }) {
  const { slots, days, getSlotState, toggleSlot, loading } = useGuardAvailability(guardId);
  const [saving, setSaving] = useState<{day:number;slot:number}|null>(null);

  const handleToggle = async (day: number, slotIndex: number) => {
    const current = getSlotState(day, slotIndex);
    setSaving({ day, slot: slotIndex });
    await toggleSlot(day, slotIndex, !current);
    setSaving(null);
  };

  return (
    <div className="space-y-3">
      {loading && (
        <div className="flex items-center gap-2 text-sm text-gray-500">
          <div className="w-4 h-4 border-2 border-gray-600/30 border-t-gray-500 rounded-full animate-spin"></div>
          Loading availability...
        </div>
      )}

      <div className="bg-gray-800/40 border border-gray-800 rounded-xl overflow-hidden">
        <div className="grid grid-cols-8 border-b border-gray-800">
          <div className="px-2 py-2 text-[10px] text-gray-500 font-medium uppercase tracking-wider"></div>
          {days.map((d) => (
            <div key={d} className="px-2 py-2 text-center text-[10px] text-gray-500 font-medium uppercase tracking-wider">{d}</div>
          ))}
        </div>
        {slots.map((slot, slotIdx) => (
          <div key={slotIdx} className="grid grid-cols-8 border-b border-gray-800/50 last:border-b-0">
            <div className="px-2 py-2.5 flex flex-col justify-center">
              <span className="text-[10px] text-gray-400 font-medium">{SLOT_LABELS[slotIdx]}</span>
              <span className="text-[9px] text-gray-600">{slot.start}–{slot.end}</span>
            </div>
            {days.map((_, dayIdx) => {
              const available = getSlotState(dayIdx, slotIdx);
              const isSaving = saving?.day === dayIdx && saving?.slot === slotIdx;
              return (
                <div key={dayIdx} className="p-1">
                  <button
                    onClick={() => handleToggle(dayIdx, slotIdx)}
                    disabled={isSaving}
                    className={`w-full h-8 rounded-md text-[10px] font-medium transition-all border cursor-pointer flex items-center justify-center ${
                      available
                        ? `${SLOT_COLORS[slotIdx]}`
                        : 'bg-gray-800/60 text-gray-600 border-gray-700/50 hover:border-gray-600'
                    } ${isSaving ? 'opacity-50' : ''}`}
                  >
                    {isSaving ? (
                      <div className="w-3 h-3 border border-gray-500/30 border-t-gray-400 rounded-full animate-spin"></div>
                    ) : available ? (
                      <div className="w-3 h-3 flex items-center justify-center"><i className="ri-check-line text-[10px]"></i></div>
                    ) : (
                      <div className="w-3 h-3 flex items-center justify-center"><i className="ri-close-line text-[10px]"></i></div>
                    )}
                  </button>
                </div>
              );
            })}
          </div>
        ))}
      </div>

      <div className="flex items-center gap-4 text-[10px] text-gray-500">
        <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-sm bg-emerald-500/20 border border-emerald-500/30"></span> Available</span>
        <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-sm bg-gray-800/60 border border-gray-700"></span> Unavailable</span>
      </div>
    </div>
  );
}