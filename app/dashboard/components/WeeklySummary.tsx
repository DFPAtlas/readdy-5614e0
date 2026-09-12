'use client';

import Link from 'next/link';
import type { WeekShift, DashboardKPIs } from '@/lib/dashboardFetch';

interface WeeklySummaryProps {
  weekShifts: WeekShift[];
  kpis: DashboardKPIs;
}

function dayLabel(date: string): string {
  const d = new Date(date + 'T00:00:00');
  if (isNaN(d.getTime())) return date.slice(5);
  return d.toLocaleDateString('en-GB', { weekday: 'short' });
}

export default function WeeklySummary({ weekShifts, kpis }: WeeklySummaryProps) {
  const total = weekShifts.reduce((s, w) => s + w.filled + w.open, 0);
  const filled = weekShifts.reduce((s, w) => s + w.filled, 0);
  const open = weekShifts.reduce((s, w) => s + w.open, 0);
  const coverage = total > 0 ? Math.round((filled / total) * 100) : 0;
  const maxPerDay = Math.max(1, ...weekShifts.map((w) => w.filled + w.open));

  const stats = [
    { label: 'Scheduled shifts', value: total, color: 'text-white' },
    { label: 'Coverage', value: `${coverage}%`, color: coverage >= 90 ? 'text-emerald-400' : coverage >= 70 ? 'text-amber-400' : 'text-red-400' },
    { label: 'Unfilled', value: open, color: open > 0 ? 'text-red-400' : 'text-emerald-400' },
    { label: 'Open incidents', value: kpis.openIncidents, color: kpis.openIncidents > 0 ? 'text-red-400' : 'text-emerald-400' },
    { label: 'Patrol exceptions', value: kpis.missedPatrols, color: kpis.missedPatrols > 0 ? 'text-red-400' : 'text-emerald-400' },
  ];

  return (
    <div className="mt-6">
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-lg font-bold text-white">Weekly Operations</h2>
        <Link href="/reports" className="text-sm text-blue-400 hover:text-blue-300 font-medium cursor-pointer">
          View reports
        </Link>
      </div>

      <div className="bg-[#0f172a]/70 backdrop-blur-sm border border-white/10 rounded-xl p-5">
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4 mb-6">
          {stats.map((s) => (
            <div key={s.label}>
              <div className={`text-2xl font-bold ${s.color}`}>{s.value}</div>
              <div className="text-xs text-gray-500 mt-1">{s.label}</div>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-7 gap-2 items-end" style={{ height: '88px' }}>
          {weekShifts.map((w) => {
            const dayTotal = w.filled + w.open;
            const filledPct = maxPerDay > 0 ? Math.round((w.filled / maxPerDay) * 100) : 0;
            const openPct = maxPerDay > 0 ? Math.round((w.open / maxPerDay) * 100) : 0;
            const isToday = w.date === new Date().toISOString().split('T')[0];
            return (
              <div key={w.date} className="flex flex-col items-center gap-1.5">
                <div className="w-full flex flex-col justify-end rounded overflow-hidden bg-white/[0.03]" style={{ height: '72px' }}>
                  {openPct > 0 && (
                    <div className="w-full bg-red-500/60" style={{ height: `${openPct}%` }} title={`${w.open} unfilled`} />
                  )}
                  {filledPct > 0 && (
                    <div className="w-full bg-emerald-500/60" style={{ height: `${filledPct}%` }} title={`${w.filled} filled`} />
                  )}
                  {dayTotal === 0 && <div className="w-full h-full" />}
                </div>
                <span className={`text-[10px] ${isToday ? 'text-blue-400 font-semibold' : 'text-gray-500'}`}>
                  {dayLabel(w.date)}
                </span>
              </div>
            );
          })}
        </div>

        <div className="flex items-center gap-4 mt-4 text-[11px] text-gray-500">
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-sm bg-emerald-500/60"></span> Filled
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-sm bg-red-500/60"></span> Unfilled
          </span>
        </div>
      </div>
    </div>
  );
}