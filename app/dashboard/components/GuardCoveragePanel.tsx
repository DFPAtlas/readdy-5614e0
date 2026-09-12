'use client';

import Link from 'next/link';
import type { GuardOnShift, MissingGuard } from '@/lib/dashboardFetch';

interface GuardCoveragePanelProps {
  guardsOnShift: GuardOnShift[];
  missingGuards: MissingGuard[];
}

function statusLabel(s: GuardOnShift['status']): { text: string; cls: string } {
  switch (s) {
    case 'on_time': return { text: 'On time', cls: 'text-emerald-400' };
    case 'late': return { text: 'Late', cls: 'text-amber-400' };
    case 'critical_late': return { text: 'Critical late', cls: 'text-red-400' };
    default: return { text: 'On time', cls: 'text-emerald-400' };
  }
}

function formatTime(iso: string): string {
  const d = new Date(iso);
  if (isNaN(d.getTime())) return '';
  return d.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' });
}

export default function GuardCoveragePanel({ guardsOnShift, missingGuards }: GuardCoveragePanelProps) {
  const onShift = guardsOnShift.length;

  return (
    <div>
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-sm font-bold text-white flex items-center gap-2">
          <span className="w-5 h-5 flex items-center justify-center text-emerald-400">
            <i className="ri-shield-user-line"></i>
          </span>
          Guard Coverage
        </h2>
        <Link href="/guards" className="text-xs text-blue-400 hover:text-blue-300 font-medium cursor-pointer">
          View all
        </Link>
      </div>

      <div className="bg-[#0f172a]/70 border border-white/10 rounded-xl overflow-hidden">
        <div className="flex items-center justify-between px-3.5 py-2.5 border-b border-white/5 bg-white/[0.02]">
          <span className="text-xs text-gray-500">On shift now</span>
          <span className="text-sm font-bold text-emerald-400">{onShift}</span>
        </div>

        {onShift === 0 ? (
          <div className="px-3.5 py-5 text-center text-gray-500 text-sm">No guards on shift.</div>
        ) : (
          <div className="divide-y divide-white/5">
            {guardsOnShift.slice(0, 6).map((g) => {
              const st = statusLabel(g.status);
              return (
                <div key={g.id} className="flex items-center gap-3 px-3.5 py-2.5">
                  <div className="w-7 h-7 rounded-full bg-emerald-500/10 flex items-center justify-center shrink-0">
                    <span className="text-xs font-semibold text-emerald-400">
                      {(g.name || '?').charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-gray-200 truncate">{g.name}</p>
                    <p className="text-xs text-gray-500 truncate">{g.site_name}</p>
                  </div>
                  <span className={`text-xs font-medium shrink-0 ${st.cls}`}>{st.text}</span>
                </div>
              );
            })}
          </div>
        )}

        {missingGuards.length > 0 && (
          <div className="border-t border-white/5">
            <div className="flex items-center justify-between px-3.5 py-2.5 border-b border-white/5 bg-white/[0.02]">
              <span className="text-xs text-gray-500">Late / missing</span>
              <span className="text-sm font-bold text-red-400">{missingGuards.length}</span>
            </div>
            <div className="divide-y divide-white/5">
              {missingGuards.slice(0, 5).map((m) => (
                <div key={m.id} className="flex items-center gap-3 px-3.5 py-2.5">
                  <div className="w-7 h-7 rounded-full bg-red-500/10 flex items-center justify-center shrink-0">
                    <span className="text-xs font-semibold text-red-400">
                      {(m.name || '?').charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-gray-200 truncate">{m.name}</p>
                    <p className="text-xs text-gray-500 truncate">{m.site_name}</p>
                  </div>
                  <span className="text-xs text-red-400 shrink-0">
                    {m.reason === 'no_guard_assigned' ? 'Unassigned' : 'No clock-in'}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}