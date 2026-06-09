'use client';

import { useMemo, useState } from 'react';
import { format, startOfMonth, endOfMonth, startOfWeek, endOfWeek, addDays, isSameDay, isSameMonth } from 'date-fns';
import { DndContext, type DragEndEvent, DragOverlay, useDroppable } from '@dnd-kit/core';
import type { Shift } from '@/lib/useShifts';
import type { ShiftWarning } from '@/app/rotas/hooks/useRotaEngine';
import ShiftCard from './ShiftCard';

interface MonthViewProps {
  currentDate: Date;
  shifts: Shift[];
  sites: { id: string; site_name: string; risk_level: string | null }[];
  onClickDay: (date: Date) => void;
  onAddShift: (siteId: string, date: string) => void;
  onDropGuard: (guardId: string, siteId: string, dateStr: string) => void;
  shiftWarnings: Record<string, ShiftWarning[]>;
}

function DroppableDayCell({
  date,
  children,
  onClick,
}: {
  date: Date;
  children: React.ReactNode;
  onClick: () => void;
}) {
  const { setNodeRef, isOver } = useDroppable({
    id: `month-cell-${format(date, 'yyyy-MM-dd')}`,
    data: { type: 'month-cell', dateStr: format(date, 'yyyy-MM-dd') },
  });

  return (
    <div
      ref={setNodeRef}
      onClick={onClick}
      className={`border-b border-r border-gray-800/50 min-h-[100px] p-2 cursor-pointer hover:bg-gray-800/20 transition-colors relative ${
        isOver ? 'bg-blue-600/10 border-blue-500/20' : ''
      }`}
    >
      {isOver && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-10">
          <span className="text-[10px] font-medium text-blue-400 bg-blue-600/10 px-2 py-0.5 rounded">Drop to add</span>
        </div>
      )}
      {children}
    </div>
  );
}

export default function MonthView({
  currentDate,
  shifts,
  sites,
  onClickDay,
  onAddShift,
  onDropGuard,
  shiftWarnings,
}: MonthViewProps) {
  const [activeDrag, setActiveDrag] = useState<any>(null);

  const weeks = useMemo(() => {
    const monthStart = startOfMonth(currentDate);
    const monthEnd = endOfMonth(currentDate);
    const calStart = startOfWeek(monthStart, { weekStartsOn: 1 });
    const calEnd = endOfWeek(monthEnd, { weekStartsOn: 1 });
    const days: Date[] = [];
    let d = calStart;
    while (d <= calEnd) {
      days.push(d);
      d = addDays(d, 1);
    }
    const w: Date[][] = [];
    for (let i = 0; i < days.length; i += 7) w.push(days.slice(i, i + 7));
    return w;
  }, [currentDate]);

  const shiftByDay = useMemo(() => {
    const map: Record<string, Shift[]> = {};
    for (const s of shifts) {
      const key = format(new Date(s.start_time), 'yyyy-MM-dd');
      if (!map[key]) map[key] = [];
      map[key].push(s);
    }
    for (const key in map) {
      map[key].sort((a, b) => new Date(a.start_time).getTime() - new Date(b.start_time).getTime());
    }
    return map;
  }, [shifts]);

  const dayLabels = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

  const handleDragStart = (event: any) => {
    const { active } = event;
    setActiveDrag(active.data.current);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveDrag(null);

    if (!over) return;
    const overData = over.data.current as { type: string; dateStr: string } | undefined;
    if (!overData || overData.type !== 'month-cell') return;

    const activeData = active.data.current;
    if (activeData?.type === 'guard') {
      onDropGuard(activeData.guardId, sites[0]?.id || '', overData.dateStr);
    }
  };

  return (
    <DndContext onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
      <div className="overflow-x-auto">
        <div className="min-w-[700px]">
          <div className="grid grid-cols-7">
            {dayLabels.map((label) => (
              <div key={label} className="px-2 py-2 text-center text-xs font-semibold text-gray-400 uppercase tracking-wider border-b border-gray-800">
                {label}
              </div>
            ))}
          </div>
          {weeks.map((week, wi) => (
            <div key={wi} className="grid grid-cols-7">
              {week.map((day, di) => {
                const key = format(day, 'yyyy-MM-dd');
                const dayShifts = shiftByDay[key] || [];
                const openCount = dayShifts.filter((s) => !s.guard_name).length;
                const isToday = isSameDay(day, new Date());
                const inMonth = isSameMonth(day, currentDate);
                const warningCount = dayShifts.reduce((acc, s) => acc + (shiftWarnings[s.id]?.filter((w) => w.severity !== 'info').length || 0), 0);

                return (
                  <DroppableDayCell key={di} date={day} onClick={() => onClickDay(day)}>
                    <div className={`text-sm font-semibold mb-1 ${isToday ? 'text-blue-400' : inMonth ? 'text-gray-300' : 'text-gray-600'}`}>
                      {format(day, 'd')}
                    </div>
                    {dayShifts.length > 0 && (
                      <div className="space-y-0.5">
                        {dayShifts.slice(0, 3).map((shift) => (
                          <ShiftCard
                            key={shift.id}
                            shift={shift}
                            warnings={shiftWarnings[shift.id] || []}
                            onClick={() => onClickDay(day)}
                            draggable={false}
                            compact={true}
                          />
                        ))}
                        {dayShifts.length > 3 && (
                          <div className="text-[10px] text-gray-500 pl-1">+{dayShifts.length - 3} more</div>
                        )}
                      </div>
                    )}
                    {/* Summary badges */}
                    <div className="flex flex-wrap gap-1 mt-1">
                      {openCount > 0 && (
                        <span className="text-[9px] text-amber-400 bg-amber-500/10 px-1 rounded">{openCount} open</span>
                      )}
                      {warningCount > 0 && (
                        <span className="text-[9px] text-red-400 bg-red-500/10 px-1 rounded">{warningCount} issue</span>
                      )}
                      {dayShifts.length > 0 && openCount === 0 && warningCount === 0 && (
                        <span className="text-[9px] text-emerald-400 bg-emerald-500/10 px-1 rounded">{dayShifts.length} shifts</span>
                      )}
                    </div>
                  </DroppableDayCell>
                );
              })}
            </div>
          ))}
        </div>
      </div>

      <DragOverlay dropAnimation={null}>
        {activeDrag?.type === 'guard' && (
          <div className="bg-[#1a1f2e] border border-blue-500/40 rounded-lg px-3 py-2 text-xs text-white shadow-2xl opacity-90">
            Drop to schedule
          </div>
        )}
      </DragOverlay>
    </DndContext>
  );
}