'use client';

import { useState } from 'react';
import { format } from 'date-fns';
import { useDraggable } from '@dnd-kit/core';
import type { Shift } from '@/lib/useShifts';
import type { ShiftWarning } from '@/app/rotas/hooks/useRotaEngine';

export const SHIFT_TYPE_COLORS: Record<string, { bg: string; border: string; icon: string; label: string }> = {
  day:     { bg: 'bg-sky-500/10',  border: 'border-sky-500/30',  icon: 'ri-sun-line',          label: 'Day' },
  night:   { bg: 'bg-indigo-500/10', border: 'border-indigo-500/30', icon: 'ri-moon-line',         label: 'Night' },
  event:   { bg: 'bg-violet-500/10', border: 'border-violet-500/30', icon: 'ri-calendar-event-line', label: 'Event' },
  patrol:  { bg: 'bg-emerald-500/10', border: 'border-emerald-500/30', icon: 'ri-walk-line',       label: 'Patrol' },
  cover:   { bg: 'bg-amber-500/10', border: 'border-amber-500/30', icon: 'ri-shield-star-line',  label: 'Cover' },
  training:{ bg: 'bg-rose-500/10',  border: 'border-rose-500/30',  icon: 'ri-book-open-line',    label: 'Training' },
};

export const STATUS_COLORS: Record<string, string> = {
  scheduled:  'border-l-blue-500',
  active:     'border-l-emerald-500',
  completed:  'border-l-gray-500',
  unassigned: 'border-l-amber-500',
  cancelled:  'border-l-red-500',
  no_show:    'border-l-red-500',
};

export interface EnhancedShiftCardProps {
  shift: Shift;
  warnings: ShiftWarning[];
  onClick: () => void;
  onRemove?: () => void;
  draggable?: boolean;
  compact?: boolean;
}

export default function ShiftCard({ shift, warnings, onClick, onRemove, draggable = true, compact = false }: EnhancedShiftCardProps) {
  const [hovered, setHovered] = useState(false);
  const start = new Date(shift.start_time);
  const end = new Date(shift.end_time);
  const isOvernight = end.getDate() !== start.getDate() || end.getTime() < start.getTime();

  const startStr = format(start, 'HH:mm');
  const endStr = format(end, 'HH:mm');

  const guardName = shift.guard_name || 'UNASSIGNED';
  const isUnassigned = !shift.guard_name;

  const status = shift.status || 'scheduled';
  const colorClass = STATUS_COLORS[status] || 'border-l-blue-500';

  const type = shift.shift_type || 'day';
  const typeConfig = SHIFT_TYPE_COLORS[type] || SHIFT_TYPE_COLORS.day;

  const criticalWarnings = warnings.filter((w) => w.severity === 'critical');
  const warningWarnings = warnings.filter((w) => w.severity === 'warning');

  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: `shift-${shift.id}`,
    data: { type: 'shift', shift },
    disabled: !draggable,
  });

  const dragStyle = transform
    ? { transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`, zIndex: 100 }
    : {};

  if (isDragging) {
    return (
      <div
        ref={setNodeRef}
        style={dragStyle}
        className={`${typeConfig.bg} border ${typeConfig.border} border-l-2 ${colorClass} rounded-md px-2 py-1 text-xs opacity-60 select-none`}
      >
        <span className="text-gray-400 font-medium">{startStr}–{endStr}</span>
        <span className="text-gray-500 ml-2">{guardName}</span>
      </div>
    );
  }

  if (compact) {
    return (
      <div
        ref={draggable ? setNodeRef : undefined}
        {...(draggable ? attributes : {})}
        {...(draggable ? listeners : {})}
        onClick={(e) => { e.stopPropagation(); onClick(); }}
        className={`${typeConfig.bg} border ${typeConfig.border} border-l-2 ${colorClass} rounded-md px-1.5 py-0.5 text-[10px] cursor-pointer hover:brightness-110 transition-all select-none`}
      >
        <span className="text-gray-300 font-medium tabular-nums">{startStr}</span>
        {!isUnassigned && (
          <span className="text-gray-500 ml-1">{shift.guard_name?.split(' ')[0] || ''}</span>
        )}
        {isUnassigned && (
          <span className="text-amber-400 ml-1">?</span>
        )}
        {criticalWarnings.length > 0 && (
          <span className="text-red-400 ml-1">!</span>
        )}
      </div>
    );
  }

  return (
    <div
      ref={draggable ? setNodeRef : undefined}
      {...(draggable ? attributes : {})}
      {...(draggable ? listeners : {})}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onClick={(e) => { e.stopPropagation(); onClick(); }}
      className={`${typeConfig.bg} border ${typeConfig.border} border-l-2 ${colorClass} rounded-md px-2.5 py-1.5 text-xs cursor-pointer hover:brightness-110 transition-all relative group select-none ${draggable ? '' : ''}`}
    >
      {/* Drag handle indicator */}
      {draggable && hovered && (
        <div className="absolute left-0.5 top-1/2 -translate-y-1/2 w-1 h-4 rounded-full bg-gray-500/40" />
      )}

      <div className="flex items-center gap-1.5">
        <div className={`w-3.5 h-3.5 flex items-center justify-center text-gray-400`}>
          <i className={typeConfig.icon}></i>
        </div>
        <span className="text-gray-300 font-medium tabular-nums whitespace-nowrap">
          {startStr}
          <span className="text-gray-600 mx-0.5">–</span>
          {endStr}
        </span>
        {isOvernight && (
          <span className="text-[10px] bg-amber-500/10 text-amber-400 px-1 rounded ml-auto whitespace-nowrap">+1d</span>
        )}
      </div>

      <div className="flex items-center gap-1 mt-0.5">
        <span className={`font-medium truncate ${isUnassigned ? 'text-amber-400' : 'text-gray-200'}`}>
          {guardName}
        </span>
        {criticalWarnings.length > 0 && (
          <div className="w-4 h-4 flex items-center justify-center text-red-400 shrink-0" title={criticalWarnings.map((w) => w.message).join(', ')}>
            <i className="ri-error-warning-fill text-[11px]"></i>
          </div>
        )}
        {warningWarnings.length > 0 && criticalWarnings.length === 0 && (
          <div className="w-4 h-4 flex items-center justify-center text-amber-400 shrink-0" title={warningWarnings.map((w) => w.message).join(', ')}>
            <i className="ri-alert-line text-[11px]"></i>
          </div>
        )}
      </div>

      {/* Warning badges inline */}
      {warnings.length > 0 && (
        <div className="flex flex-wrap gap-0.5 mt-1">
          {warnings.slice(0, 2).map((w, i) => (
            <span
              key={i}
              className={`text-[9px] px-1 rounded font-medium ${
                w.severity === 'critical'
                  ? 'bg-red-500/15 text-red-400'
                  : w.severity === 'warning'
                    ? 'bg-amber-500/15 text-amber-400'
                    : 'bg-blue-500/15 text-blue-400'
              }`}
            >
              {w.message.length > 20 ? w.message.slice(0, 20) + '...' : w.message}
            </span>
          ))}
          {warnings.length > 2 && (
            <span className="text-[9px] text-gray-500">+{warnings.length - 2}</span>
          )}
        </div>
      )}

      {/* Hover tooltip */}
      <div className="absolute left-0 top-full mt-1 z-50 hidden group-hover:block bg-[#1e2433] border border-gray-700 rounded-lg px-3 py-2 text-xs text-gray-300 shadow-xl w-60">
        <div className="font-semibold text-white mb-1">{shift.site_name || 'Site'}</div>
        <div className="flex items-center gap-2 text-gray-400">
          <div className="w-3.5 h-3.5 flex items-center justify-center"><i className="ri-time-line"></i></div>
          {format(start, 'EEE dd MMM')} {startStr} – {format(end, 'EEE dd MMM')} {endStr}
        </div>
        <div className="flex items-center gap-2 text-gray-400 mt-1">
          <div className="w-3.5 h-3.5 flex items-center justify-center"><i className="ri-shield-user-line"></i></div>
          {guardName}
        </div>
        <div className="flex items-center gap-2 text-gray-400 mt-1">
          <div className="w-3.5 h-3.5 flex items-center justify-center"><i className="ri-file-list-line"></i></div>
          {typeConfig.label} · {status}
        </div>
        {shift.notes && <div className="mt-1 text-gray-500 italic">{shift.notes}</div>}
        {warnings.length > 0 && (
          <div className="mt-2 space-y-0.5">
            {warnings.map((w, i) => (
              <div key={i} className={`text-[11px] flex items-center gap-1 ${w.severity === 'critical' ? 'text-red-400' : w.severity === 'warning' ? 'text-amber-400' : 'text-blue-400'}`}>
                <i className={w.severity === 'critical' ? 'ri-error-warning-fill' : 'ri-alert-line'}></i>
                {w.message}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}