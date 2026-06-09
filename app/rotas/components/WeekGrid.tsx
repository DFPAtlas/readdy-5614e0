'use client';

import { useMemo, useState } from 'react';
import { format, startOfWeek, endOfWeek, addDays, isSameDay } from 'date-fns';
import { DndContext, type DragEndEvent, type DragOverEvent, DragOverlay, useDroppable } from '@dnd-kit/core';
import type { Shift } from '@/lib/useShifts';
import type { Guard } from '@/lib/useGuards';
import type { ShiftWarning } from '@/app/rotas/hooks/useRotaEngine';
import ShiftCard, { SHIFT_TYPE_COLORS } from './ShiftCard';
import RiskBadge from '@/app/sites/components/RiskBadge';

interface WeekGridProps {
  weekStart: Date;
  shifts: Shift[];
  sites: { id: string; site_name: string; risk_level: string | null }[];
  guards: Guard[];
  onClickShift: (shift: Shift) => void;
  onAddShift: (siteId: string, date: string) => void;
  onDropGuard: (guardId: string, siteId: string, dateStr: string) => void;
  onDropShift: (shiftId: string, siteId: string, dateStr: string) => void;
  shiftWarnings: Record<string, ShiftWarning[]>;
  guardStats: Record<string, { totalHours: number; overtime: boolean; warning: boolean }>;
}

const dayLabels = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

function DroppableCell({
  siteId,
  dateStr,
  children,
  onClick,
  isDragOver,
}: {
  siteId: string;
  dateStr: string;
  children: React.ReactNode;
  onClick: () => void;
  isDragOver: boolean;
}) {
  const { setNodeRef, isOver } = useDroppable({
    id: `cell-${siteId}-${dateStr}`,
    data: { type: 'cell', siteId, dateStr },
  });

  return (
    <div
      ref={setNodeRef}
      onClick={onClick}
      className={`border-b border-r border-gray-800/50 min-h-[90px] p-1.5 transition-colors cursor-pointer relative ${
        isOver || isDragOver ? 'bg-blue-600/15 border-blue-500/30' : 'hover:bg-gray-800/20'
      }`}
    >
      {(isOver || isDragOver) && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-10">
          <div className="text-[10px] font-medium text-blue-400 bg-blue-600/10 px-2 py-0.5 rounded backdrop-blur-sm">
            Drop to assign
          </div>
        </div>
      )}
      {children}
    </div>
  );
}

export default function WeekGrid({
  weekStart,
  shifts,
  sites,
  guards,
  onClickShift,
  onAddShift,
  onDropGuard,
  onDropShift,
  shiftWarnings,
  guardStats,
}: WeekGridProps) {
  const [activeDrag, setActiveDrag] = useState<{ type: 'guard' | 'shift'; data: any } | null>(null);

  const days = useMemo(() => {
    const s = startOfWeek(weekStart, { weekStartsOn: 1 });
    return Array.from({ length: 7 }, (_, i) => addDays(s, i));
  }, [weekStart]);

  const grouped = useMemo(() => {
    const map: Record<string, Record<string, Shift[]>> = {};
    for (const site of sites) {
      map[site.id] = {};
      for (const day of days) {
        map[site.id][format(day, 'yyyy-MM-dd')] = [];
      }
    }
    for (const shift of shifts) {
      const start = new Date(shift.start_time);
      const key = format(start, 'yyyy-MM-dd');
      if (shift.site_id && map[shift.site_id]) {
        if (!map[shift.site_id][key]) map[shift.site_id][key] = [];
        map[shift.site_id][key].push(shift);
      }
    }
    for (const siteId in map) {
      for (const dateStr in map[siteId]) {
        map[siteId][dateStr].sort((a, b) => new Date(a.start_time).getTime() - new Date(b.start_time).getTime());
      }
    }
    return map;
  }, [shifts, sites, days]);

  const daySummary = useMemo(() => {
    const summary: Record<string, { total: number; unassigned: number; conflicts: number }> = {};
    for (const day of days) {
      const key = format(day, 'yyyy-MM-dd');
      const dayShifts = shifts.filter((s) => s.start_time.startsWith(key));
      summary[key] = {
        total: dayShifts.length,
        unassigned: dayShifts.filter((s) => !s.guard_name).length,
        conflicts: 0,
      };
      for (const s of dayShifts) {
        const ws = shiftWarnings[s.id] || [];
        summary[key].conflicts += ws.filter((w) => w.type === 'conflict').length;
      }
    }
    return summary;
  }, [shifts, days, shiftWarnings]);

  const handleDragStart = (event: any) => {
    const { active } = event;
    const data = active.data.current;
    if (data?.type === 'guard') {
      setActiveDrag({ type: 'guard', data: guards.find((g) => g.id === data.guardId) });
    } else if (data?.type === 'shift') {
      setActiveDrag({ type: 'shift', data: data.shift });
    }
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveDrag(null);

    if (!over) return;
    const overData = over.data.current as { type: string; siteId: string; dateStr: string } | undefined;
    if (!overData || overData.type !== 'cell') return;

    const activeData = active.data.current;
    if (!activeData) return;

    if (activeData.type === 'guard') {
      onDropGuard(activeData.guardId, overData.siteId, overData.dateStr);
    } else if (activeData.type === 'shift') {
      onDropShift(activeData.shift.id, overData.siteId, overData.dateStr);
    }
  };

  return (
    <DndContext onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
      <div className="overflow-x-auto">
        <div className="min-w-[1000px]">
          {/* Day headers + summary */}
          <div className="grid" style={{ gridTemplateColumns: '200px repeat(7, 1fr)' }}>
            <div className="sticky left-0 z-20 bg-[#0b0f19] border-b border-gray-800 px-3 py-2.5 font-semibold text-gray-400 text-xs uppercase tracking-wider">
              Site
            </div>
            {days.map((d, i) => {
              const isToday = isSameDay(d, new Date());
              const key = format(d, 'yyyy-MM-dd');
              const summary = daySummary[key];
              return (
                <div
                  key={i}
                  className={`border-b border-gray-800 px-2 py-2.5 text-center text-xs font-semibold ${
                    isToday ? 'text-blue-400 bg-blue-600/5' : 'text-gray-400'
                  }`}
                >
                  <div>{dayLabels[i]}</div>
                  <div className={`${isToday ? 'text-blue-300' : 'text-gray-500'} mt-0.5 tabular-nums`}>
                    {format(d, 'd MMM')}
                  </div>
                  {summary && (
                    <div className="flex items-center justify-center gap-1 mt-1">
                      {summary.unassigned > 0 && (
                        <span className="text-[10px] text-amber-400 bg-amber-500/10 px-1 rounded">{summary.unassigned} open</span>
                      )}
                      {summary.conflicts > 0 && (
                        <span className="text-[10px] text-red-400 bg-red-500/10 px-1 rounded">{summary.conflicts} conflict</span>
                      )}
                      {summary.unassigned === 0 && summary.conflicts === 0 && summary.total > 0 && (
                        <span className="text-[10px] text-emerald-400 bg-emerald-500/10 px-1 rounded">{summary.total} shifts</span>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Site rows */}
          {sites.map((site) => (
            <div key={site.id} className="grid" style={{ gridTemplateColumns: '200px repeat(7, 1fr)' }}>
              <div className="sticky left-0 z-10 bg-[#0b0f19] border-b border-gray-800 px-3 py-3 flex items-center gap-2">
                <span className="text-sm font-medium text-white truncate">{site.site_name}</span>
                <RiskBadge level={site.risk_level || 'medium'} />
              </div>
              {days.map((d, i) => {
                const dateStr = format(d, 'yyyy-MM-dd');
                const cellShifts = grouped[site.id]?.[dateStr] || [];

                return (
                  <DroppableCell
                    key={i}
                    siteId={site.id}
                    dateStr={dateStr}
                    onClick={() => onAddShift(site.id, dateStr)}
                    isDragOver={false}
                  >
                    {cellShifts.length === 0 && !activeDrag && (
                      <div className="absolute inset-0 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
                        <div className="w-6 h-6 flex items-center justify-center text-gray-600">
                          <i className="ri-add-line"></i>
                        </div>
                      </div>
                    )}
                    <div className="space-y-1.5">
                      {cellShifts.map((shift) => (
                        <ShiftCard
                          key={shift.id}
                          shift={shift}
                          warnings={shiftWarnings[shift.id] || []}
                          onClick={() => onClickShift(shift)}
                          draggable={true}
                          compact={cellShifts.length > 3}
                        />
                      ))}
                    </div>
                  </DroppableCell>
                );
              })}
            </div>
          ))}

          {sites.length === 0 && (
            <div className="text-center py-16">
              <div className="w-12 h-12 mx-auto flex items-center justify-center text-gray-600 mb-3">
                <i className="ri-building-2-line text-2xl"></i>
              </div>
              <p className="text-gray-400 text-sm">No sites yet. Add a site first to schedule shifts.</p>
            </div>
          )}
        </div>
      </div>

      <DragOverlay dropAnimation={null}>
        {activeDrag?.type === 'guard' && activeDrag.data && (
          <div className="bg-[#1a1f2e] border border-blue-500/40 rounded-lg px-3 py-2 text-xs text-white shadow-2xl opacity-90">
            <div className="font-medium">{activeDrag.data.first_name} {activeDrag.data.last_name}</div>
            <div className="text-gray-400 text-[10px]">Drop onto a cell to assign</div>
          </div>
        )}
        {activeDrag?.type === 'shift' && activeDrag.data && (
          <div className="bg-[#1a1f2e] border border-gray-500/40 rounded-md px-2 py-1 text-xs shadow-2xl opacity-90">
            <span className="text-gray-300 font-medium">
              {format(new Date(activeDrag.data.start_time), 'HH:mm')}–{format(new Date(activeDrag.data.end_time), 'HH:mm')}
            </span>
            <span className="text-gray-500 ml-2">{activeDrag.data.guard_name || 'Unassigned'}</span>
          </div>
        )}
      </DragOverlay>
    </DndContext>
  );
}