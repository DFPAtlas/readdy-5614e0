'use client';

import { useState } from 'react';
import { format } from 'date-fns';
import { Shift } from './ShiftCard';
import { useAuth } from '@/lib/auth';
import { supabase } from '@/lib/supabase';

interface DayDrawerProps {
  date: Date | null;
  shifts: Shift[];
  sites: { id: string; site_name: string; risk_level: string | null }[];
  onClose: () => void;
  onClickShift: (shift: Shift) => void;
  onAddShift: (siteId: string, date: string) => void;
}

export default function DayDrawer({
  date,
  shifts,
  sites,
  onClose,
  onClickShift,
  onAddShift,
}: DayDrawerProps) {
  const { companyId } = useAuth();
  const [guards, setGuards] = useState<{ id: string; first_name: string; last_name: string }[]>([]);

  if (!date) return null;

  const dayStr = format(date, 'yyyy-MM-dd');
  const dayShifts = shifts.filter((s) => format(new Date(s.start_time), 'yyyy-MM-dd') === dayStr);
  const groupedBySite: Record<string, Shift[]> = {};
  for (const s of dayShifts) {
    const sid = s.site_id || 'unknown';
    if (!groupedBySite[sid]) groupedBySite[sid] = [];
    groupedBySite[sid].push(s);
  }

  const handleAssign = async (shiftId: string, guardId: string) => {
    await supabase.from('shifts').update({ guard_id: guardId }).eq('id', shiftId);
  };

  return (
    <>
      <div className="fixed inset-0 z-40 bg-black/40" onClick={onClose} />
      <div className="fixed right-0 top-0 bottom-0 z-50 w-full max-w-md bg-[#151b27] border-l border-gray-800 shadow-2xl flex flex-col">
        <div className="px-6 py-4 border-b border-gray-800 flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold text-white">{format(date, 'EEEE, d MMM yyyy')}</h2>
            <p className="text-sm text-gray-400 mt-0.5">{dayShifts.length} shift{dayShifts.length !== 1 ? 's' : ''}</p>
          </div>
          <button onClick={onClose} className="w-8 h-8 flex items-center justify-center text-gray-400 hover:text-white cursor-pointer">
            <div className="w-5 h-5 flex items-center justify-center"><i className="ri-close-line"></i></div>
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-6 py-4 space-y-5">
          {Object.entries(groupedBySite).map(([siteId, siteShifts]) => {
            const site = sites.find((s) => s.id === siteId);
            return (
              <div key={siteId}>
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-4 h-4 flex items-center justify-center text-gray-500">
                    <i className="ri-building-line"></i>
                  </div>
                  <span className="text-sm font-semibold text-white">{site?.site_name || 'Unknown site'}</span>
                  <button
                    onClick={() => onAddShift(siteId, dayStr)}
                    className="ml-auto text-xs text-blue-400 hover:text-blue-300 cursor-pointer flex items-center gap-1"
                  >
                    <div className="w-3 h-3 flex items-center justify-center"><i className="ri-add-line"></i></div>
                    Add
                  </button>
                </div>
                <div className="space-y-2">
                  {siteShifts.map((shift) => {
                    const start = new Date(shift.start_time);
                    const end = new Date(shift.end_time);
                    const guardName = shift.guard_name || 'UNASSIGNED';
                    const isUnassigned = !shift.guard_name;

                    const status = shift.status || 'scheduled';
                    const colorClass =
                      status === 'active'
                        ? 'border-l-emerald-500'
                        : status === 'completed'
                          ? 'border-l-gray-500'
                          : isUnassigned
                            ? 'border-l-amber-500'
                            : status === 'cancelled' || status === 'no_show'
                              ? 'border-l-red-500'
                              : 'border-l-blue-500';

                    return (
                      <div
                        key={shift.id}
                        onClick={() => onClickShift(shift)}
                        className={`bg-[#1a1f2e] border-l-2 ${colorClass} rounded-lg px-3 py-2 cursor-pointer hover:bg-[#252a3a] transition-colors`}
                      >
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-medium text-white tabular-nums">
                            {format(start, 'HH:mm')} – {format(end, 'HH:mm')}
                          </span>
                          <span className="text-[10px] text-gray-500 bg-gray-800/60 px-1.5 py-0.5 rounded uppercase">
                            {shift.shift_type || 'day'}
                          </span>
                          <span className="text-[10px] text-gray-500 bg-gray-800/60 px-1.5 py-0.5 rounded uppercase">
                            {status}
                          </span>
                        </div>
                        <div className={`mt-1 text-sm ${isUnassigned ? 'text-amber-400' : 'text-gray-300'}`}>
                          {guardName}
                        </div>
                        {shift.notes && <div className="text-xs text-gray-500 mt-1 italic">{shift.notes}</div>}
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}

          {dayShifts.length === 0 && (
            <div className="text-center py-12">
              <div className="w-10 h-10 mx-auto flex items-center justify-center text-gray-600 mb-2">
                <i className="ri-calendar-line text-xl"></i>
              </div>
              <p className="text-gray-400 text-sm">No shifts scheduled for this day.</p>
            </div>
          )}
        </div>
      </div>
    </>
  );
}