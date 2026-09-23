'use client';

import { useMemo, useState } from 'react';
import {
  useGuardAvailability,
  setGuardAvailability,
  type GuardAvailability,
} from '@/lib/useGuardAvailability';

const DAY_LABELS: string[] = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const SLOT_COLORS: string[] = [
  'bg-emerald-500/15 text-emerald-400 border-emerald-500/25',
  'bg-amber-500/15 text-amber-400 border-amber-500/25',
  'bg-indigo-500/15 text-indigo-400 border-indigo-500/25',
];

interface SlotDefinition {
  label: string;
  start: string;
  end: string;
}

const SLOT_DEFINITIONS: SlotDefinition[] = [
  { label: 'Morning', start: '06:00', end: '14:00' },
  { label: 'Afternoon', start: '14:00', end: '22:00' },
  { label: 'Night', start: '00:00', end: '06:00' },
];

function slotAvailable(records: GuardAvailability[], day: number, slot: SlotDefinition): boolean {
  return records.some(
    (r) => r.day_of_week === day && r.is_available && r.start_time <= slot.start && r.end_time >= slot.end
  );
}

export default function GuardAvailabilityEditor({ guardId }: { guardId: string }) {
  const { availability, guards, loading, refetch } = useGuardAvailability();
  const [saving, setSaving] = useState<{ day: number; slot: number } | null>(null);
  const [error, setError] = useState<string | null>(null);

  const guardRecords = useMemo(
    () => availability.filter((r) => r.guard_id === guardId),
    [availability, guardId]
  );

  const guardName = useMemo(() => {
    const guard = guards.find((item) => item.id === guardId);
    if (!guard) return 'Unassigned guard';
    const parts = [guard.first_name, guard.last_name].filter(
      (p): p is string => typeof p === 'string' && p.trim().length > 0
    );
    return parts.length > 0 ? parts.join(' ') : 'Unnamed guard';
  }, [guards, guardId]);

  const handleToggle = async (day: number, slotIndex: number): Promise<void> => {
    const slot = SLOT_DEFINITIONS[slotIndex];
    const currentlyAvailable = slotAvailable(guardRecords, day, slot);
    setSaving({ day, slot: slotIndex });
    setError(null);

    const base = guardRecords.map((r) => ({
      day_of_week: r.day_of_week,
      start_time: r.start_time,
      end_time: r.end_time,
      is_available: r.is_available,
    }));

    const next = currentlyAvailable
      ? base.filter(
          (r) => !(r.day_of_week === day && r.is_available && r.start_time <= slot.start && r.end_time >= slot.end)
        )
      : [...base, { day_of_week: day, start_time: slot.start, end_time: slot.end, is_available: true }];

    const { error: saveError } = await setGuardAvailability(guardId, next);
    if (saveError) {
      setError('Could not save availability. Please try again.');
    } else {
      await refetch();
    }
    setSaving(null);
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-sm text-gray-300">
          <div className="w-5 h-5 flex items-center justify-center">
            <i className="ri-calendar-schedule-line text-gray-400"></i>
          </div>
          <span className="font-medium">{guardName}</span>
        </div>
        {!loading && guardRecords.length === 0 && (
          <span className="text-[10px] text-gray-500">No availability set — tap a slot to add</span>
        )}
      </div>

      {loading && (
        <div className="flex items-center gap-2 text-sm text-gray-500">
          <div className="w-4 h-4 border-2 border-gray-600/30 border-t-gray-500 rounded-full animate-spin"></div>
          Loading availability...
        </div>
      )}

      {error && (
        <div className="text-xs text-red-400 bg-red-500/10 border border-red-500/20 rounded-lg px-3 py-2">
          {error}
        </div>
      )}

      <div className="bg-gray-800/40 border border-gray-800 rounded-xl overflow-hidden">
        <div className="grid grid-cols-8 border-b border-gray-800">
          <div className="px-2 py-2 text-[10px] text-gray-500 font-medium uppercase tracking-wider"></div>
          {DAY_LABELS.map((label: string) => (
            <div
              key={label}
              className="px-2 py-2 text-center text-[10px] text-gray-500 font-medium uppercase tracking-wider"
            >
              {label}
            </div>
          ))}
        </div>
        {SLOT_DEFINITIONS.map((slot: SlotDefinition, slotIdx: number) => (
          <div key={slot.label} className="grid grid-cols-8 border-b border-gray-800/50 last:border-b-0">
            <div className="px-2 py-2.5 flex flex-col justify-center">
              <span className="text-[10px] text-gray-400 font-medium">{slot.label}</span>
              <span className="text-[9px] text-gray-600">
                {slot.start}–{slot.end}
              </span>
            </div>
            {DAY_LABELS.map((_dayLabel: string, dayIdx: number) => {
              const available = slotAvailable(guardRecords, dayIdx, slot);
              const isSaving = saving?.day === dayIdx && saving?.slot === slotIdx;
              return (
                <div key={`${slot.label}-${dayIdx}`} className="p-1">
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
                      <div className="w-3 h-3 flex items-center justify-center">
                        <i className="ri-check-line text-[10px]"></i>
                      </div>
                    ) : (
                      <div className="w-3 h-3 flex items-center justify-center">
                        <i className="ri-close-line text-[10px]"></i>
                      </div>
                    )}
                  </button>
                </div>
              );
            })}
          </div>
        ))}
      </div>

      <div className="flex items-center gap-4 text-[10px] text-gray-500">
        <span className="flex items-center gap-1">
          <span className="w-2 h-2 rounded-sm bg-emerald-500/20 border border-emerald-500/30"></span> Available
        </span>
        <span className="flex items-center gap-1">
          <span className="w-2 h-2 rounded-sm bg-gray-800/60 border border-gray-700"></span> Unavailable
        </span>
      </div>
    </div>
  );
}