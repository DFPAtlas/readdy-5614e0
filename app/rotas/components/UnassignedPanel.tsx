import { useState } from 'react';
import { Shift } from './ShiftCard';

export default function UnassignedPanel({
  shifts,
  onAssignShift,
  onClickShift,
}: {
  shifts: Shift[];
  onAssignShift: (shiftId: string, targetSiteId: string, targetDate: string) => void;
  onClickShift: (shift: Shift) => void;
}) {
  const [collapsed, setCollapsed] = useState(false);

  if (shifts.length === 0) return null;

  return (
    <div className={`bg-[#151b27] border-l border-gray-800 flex flex-col transition-all ${collapsed ? 'w-14' : 'w-72'}`}>
      <button
        onClick={() => setCollapsed(!collapsed)}
        className="flex items-center gap-2 px-3 py-3 border-b border-gray-800 hover:bg-gray-800/30 transition-colors cursor-pointer"
      >
        <div className="w-5 h-5 flex items-center justify-center text-amber-400">
          <i className="ri-alarm-warning-line"></i>
        </div>
        {!collapsed && (
          <span className="text-sm font-semibold text-white whitespace-nowrap">
            Open shifts ({shifts.length})
          </span>
        )}
        <div className={`w-4 h-4 flex items-center justify-center text-gray-500 ${collapsed ? '' : 'ml-auto'}`}>
          {collapsed ? (
            <i className="ri-arrow-left-s-line"></i>
          ) : (
            <i className="ri-arrow-right-s-line"></i>
          )}
        </div>
      </button>

      {!collapsed && (
        <div className="flex-1 overflow-y-auto p-2 space-y-2">
          {shifts.map((shift) => (
            <div
              key={shift.id}
              onClick={() => onClickShift(shift)}
              className="bg-[#1a1f2e] border border-gray-700 rounded-lg px-3 py-2 cursor-pointer hover:border-amber-500/40 transition-colors"
            >
              <div className="text-xs font-semibold text-white">{shift.site_name || 'Site'}</div>
              <div className="text-[11px] text-gray-400 mt-0.5">
                {new Date(shift.start_time).toLocaleDateString(undefined, { weekday: 'short', day: 'numeric' })} ·{' '}
                {new Date(shift.start_time).toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' })}–
                {new Date(shift.end_time).toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' })}
              </div>
              <div className="text-[11px] text-amber-400 mt-0.5">UNASSIGNED</div>
              <div className="mt-1.5 flex gap-1.5">
                <div className="text-[10px] text-gray-500 bg-gray-800/60 px-1.5 py-0.5 rounded">{shift.shift_type || 'day'}</div>
                <div className="text-[10px] text-gray-500 bg-gray-800/60 px-1.5 py-0.5 rounded">{shift.status || 'scheduled'}</div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}