'use client';

import { format, parseISO } from 'date-fns';
import { Guard, getFullName, getInitials, getSIAStatus, getDaysUntil } from '@/lib/useGuards';
import { Shift } from '@/lib/useShifts';

interface SiteGuardsPanelProps {
  guards: Guard[];
  shifts: Shift[];
  siteName: string;
  periodLabel: string;
}

export default function SiteGuardsPanel({ guards, shifts, siteName, periodLabel }: SiteGuardsPanelProps) {
  const guardShifts = guards.map((guard) => {
    const guardShiftList = shifts.filter((s) => s.guard_id === guard.id);
    const totalHours = guardShiftList.reduce((sum, s) => {
      const start = new Date(s.start_time);
      const end = new Date(s.end_time);
      return sum + (end.getTime() - start.getTime()) / (1000 * 60 * 60);
    }, 0);
    return { guard, shiftCount: guardShiftList.length, totalHours };
  });

  if (guards.length === 0) return null;

  return (
    <div className="bg-[#111827]/60 border border-gray-800 rounded-xl overflow-hidden">
      <div className="px-5 py-4 border-b border-gray-800 flex items-center gap-2">
        <div className="w-5 h-5 flex items-center justify-center text-gray-400">
          <i className="ri-shield-user-line"></i>
        </div>
        <h3 className="text-sm font-semibold text-white">
          Guards at {siteName} <span className="text-gray-500 font-normal">· {periodLabel}</span>
        </h3>
        <span className="ml-auto text-xs text-gray-500">
          {guards.length} guard{guards.length !== 1 ? 's' : ''}
        </span>
      </div>

      <div className="p-5 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {guardShifts.map(({ guard, shiftCount, totalHours }) => {
          const siaStatus = getSIAStatus(guard.sia_expiry);
          const daysLeft = getDaysUntil(guard.sia_expiry);

          return (
            <div
              key={guard.id}
              className="bg-[#1a1f2e] border border-gray-700/50 rounded-xl p-4 hover:border-gray-600 transition-colors"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-blue-600/20 text-blue-400 flex items-center justify-center text-sm font-bold shrink-0">
                  {getInitials(guard)}
                </div>
                <div className="min-w-0">
                  <div className="text-sm font-semibold text-white truncate">{getFullName(guard)}</div>
                  <div className="text-xs text-gray-400">{guard.phone || guard.email || '—'}</div>
                </div>
              </div>

              <div className="mt-3 flex items-center gap-2 flex-wrap">
                <span
                  className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${
                    guard.status === 'active'
                      ? 'bg-emerald-500/10 text-emerald-400'
                      : guard.status === 'on_leave'
                        ? 'bg-amber-500/10 text-amber-400'
                        : 'bg-gray-500/10 text-gray-400'
                  }`}
                >
                  {guard.status || 'unknown'}
                </span>
                {siaStatus === 'expired' && (
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-red-500/10 text-red-400 font-medium">
                    SIA expired
                  </span>
                )}
                {siaStatus === 'expiring_soon' && (
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-400 font-medium">
                    SIA {daysLeft}d
                  </span>
                )}
                {siaStatus === 'valid' && (
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 font-medium">
                    SIA OK
                  </span>
                )}
              </div>

              <div className="mt-3 grid grid-cols-2 gap-2">
                <div className="bg-gray-800/40 rounded-lg px-3 py-2 text-center">
                  <div className="text-lg font-bold text-white">{shiftCount}</div>
                  <div className="text-[10px] text-gray-500 uppercase tracking-wider">shifts</div>
                </div>
                <div className="bg-gray-800/40 rounded-lg px-3 py-2 text-center">
                  <div className="text-lg font-bold text-white">{totalHours.toFixed(1)}</div>
                  <div className="text-[10px] text-gray-500 uppercase tracking-wider">hours</div>
                </div>
              </div>

              {guard.skills && guard.skills.length > 0 && (
                <div className="mt-3 flex flex-wrap gap-1">
                  {guard.skills.slice(0, 3).map((skill) => (
                    <span
                      key={skill}
                      className="text-[10px] bg-gray-800/60 text-gray-400 px-1.5 py-0.5 rounded"
                    >
                      {skill}
                    </span>
                  ))}
                  {guard.skills.length > 3 && (
                    <span className="text-[10px] text-gray-500">+{guard.skills.length - 3}</span>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}