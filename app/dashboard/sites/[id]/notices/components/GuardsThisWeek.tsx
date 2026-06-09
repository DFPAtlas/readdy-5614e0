'use client';

import { useGuardsThisWeek } from '@/lib/useSiteNotices';

interface GuardsThisWeekProps {
  siteId: string;
}

const STATUS_LABELS: Record<string, { label: string; color: string; bg: string }> = {
  confirmed: { label: 'Confirmed', color: 'text-emerald-400', bg: 'bg-emerald-500/10 border-emerald-500/20' },
  scheduled: { label: 'Booked On', color: 'text-blue-400', bg: 'bg-blue-500/10 border-blue-500/20' },
  absent: { label: 'Absent', color: 'text-red-400', bg: 'bg-red-500/10 border-red-500/20' },
  pending: { label: 'Pending', color: 'text-amber-400', bg: 'bg-amber-500/10 border-amber-500/20' },
  completed: { label: 'Completed', color: 'text-gray-400', bg: 'bg-gray-500/10 border-gray-500/20' },
};

export default function GuardsThisWeek({ siteId }: GuardsThisWeekProps) {
  const { guards, loading } = useGuardsThisWeek(siteId);

  if (loading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="bg-[#0f172a]/70 border border-white/10 rounded-xl p-4 animate-pulse">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-full bg-white/5" />
              <div className="flex-1 space-y-2">
                <div className="h-3.5 bg-white/5 rounded w-24" />
                <div className="h-2.5 bg-white/5 rounded w-16" />
              </div>
            </div>
            <div className="space-y-1.5">
              <div className="h-2.5 bg-white/5 rounded w-full" />
              <div className="h-2.5 bg-white/5 rounded w-3/4" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (guards.length === 0) {
    return (
      <div className="bg-[#0f172a]/70 border border-white/10 rounded-xl p-8 text-center">
        <div className="w-12 h-12 flex items-center justify-center bg-white/5 rounded-full mx-auto mb-3">
          <i className="ri-user-line text-gray-400 text-xl"></i>
        </div>
        <p className="text-sm text-gray-400 font-medium">No guards scheduled this week</p>
        <p className="text-xs text-gray-500 mt-1">Shifts will appear here once they&apos;re assigned.</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
      {guards.map((guard) => {
        const nextShift = guard.shifts[0];
        const shiftDate = nextShift ? new Date(nextShift.start_time) : null;
        const status = nextShift?.status || 'scheduled';
        const statusInfo = STATUS_LABELS[status] || STATUS_LABELS.scheduled;

        return (
          <div key={guard.id} className="bg-[#0f172a]/70 backdrop-blur-sm border border-white/10 rounded-xl p-4 hover:border-white/15 transition-colors">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500/20 to-blue-500/5 border border-blue-500/20 flex items-center justify-center text-blue-400 text-sm font-bold flex-shrink-0">
                {guard.initials}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-white truncate">{guard.name}</p>
                <p className="text-xs text-gray-400 truncate">{guard.skills?.slice(0, 2).join(', ') || 'Security Officer'}</p>
              </div>
            </div>

            {nextShift && (
              <div className="space-y-2">
                <div className="flex items-center gap-1.5 text-xs text-gray-400">
                  <div className="w-3.5 h-3.5 flex items-center justify-center"><i className="ri-calendar-line"></i></div>
                  {shiftDate?.toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric', month: 'short' })}
                </div>
                <div className="flex items-center gap-1.5 text-xs text-gray-400">
                  <div className="w-3.5 h-3.5 flex items-center justify-center"><i className="ri-time-line"></i></div>
                  {new Date(nextShift.start_time).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })} — {new Date(nextShift.end_time).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })}
                </div>
              </div>
            )}

            <div className="mt-3 pt-2.5 border-t border-white/5 flex items-center justify-between">
              <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium border ${statusInfo.bg} ${statusInfo.color}`}>
                {statusInfo.label}
              </span>
              <span className="text-[10px] text-gray-500">
                {guard.shifts.length} shift{guard.shifts.length !== 1 ? 's' : ''}
              </span>
            </div>
          </div>
        );
      })}
    </div>
  );
}