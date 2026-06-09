'use client';

import Link from 'next/link';
import type { PatrolSummary } from '@/lib/dashboardFetch';

interface PatrolStatusWidgetProps {
  patrols: PatrolSummary[];
  completionPct: number;
  missedCount: number;
}

const statusConfig = {
  complete: { dot: 'bg-emerald-500', text: 'text-emerald-400', label: 'Complete', bar: 'bg-emerald-500' },
  partial: { dot: 'bg-amber-500', text: 'text-amber-400', label: 'Partial', bar: 'bg-amber-500' },
  missed: { dot: 'bg-red-500', text: 'text-red-400', label: 'Missed', bar: 'bg-red-500' },
};

function timeAgo(iso: string | null): string {
  if (!iso) return 'Never';
  const diff = Math.floor((Date.now() - new Date(iso).getTime()) / 1000);
  if (diff < 60) return 'Just now';
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return `${Math.floor(diff / 86400)}d ago`;
}

export default function PatrolStatusWidget({ patrols, completionPct, missedCount }: PatrolStatusWidgetProps) {
  const complete = patrols.filter((p) => p.status === 'complete').length;
  const partial = patrols.filter((p) => p.status === 'partial').length;
  const missed = patrols.filter((p) => p.status === 'missed').length;

  return (
    <div className="bg-[#0f172a]/70 backdrop-blur-sm border border-white/10 shadow-sm rounded-xl overflow-hidden">
      <div className="flex items-center justify-between px-4 pt-4 pb-2">
        <div className="flex items-center gap-2">
          <div className="w-5 h-5 flex items-center justify-center text-blue-400">
            <i className="ri-route-line text-sm"></i>
          </div>
          <h3 className="text-sm font-semibold text-white">Patrol Status</h3>
        </div>
        <Link href="/sites" className="text-xs text-blue-400 hover:text-blue-300 font-medium cursor-pointer">View all</Link>
      </div>

      <div className="px-4 pb-3">
        <div className="flex items-baseline gap-1.5 mb-1">
          <span className={`text-2xl font-bold ${completionPct >= 90 ? 'text-emerald-400' : completionPct >= 75 ? 'text-amber-400' : 'text-red-400'}`}>{completionPct}%</span>
          <span className="text-xs text-gray-500">completion</span>
        </div>
        <div className="w-full h-2 bg-gray-800 rounded-full overflow-hidden mb-2">
          <div
            className={`h-full rounded-full transition-all duration-1000 ${completionPct >= 90 ? 'bg-emerald-500' : completionPct >= 75 ? 'bg-amber-500' : 'bg-red-500'}`}
            style={{ width: `${completionPct}%` }}
          ></div>
        </div>
        <div className="flex gap-3 text-[10px] text-gray-500">
          <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-emerald-500"></span>{complete} complete</span>
          <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-amber-500"></span>{partial} partial</span>
          <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-red-500"></span>{missed} missed</span>
        </div>
      </div>

      <div className="max-h-64 overflow-y-auto">
        {patrols.length === 0 ? (
          <div className="px-4 pb-4 text-center text-xs text-gray-500 py-6">No patrol data available today.</div>
        ) : (
          patrols.map((patrol) => {
            const cfg = statusConfig[patrol.status];
            const pct = patrol.checkpoints_total > 0 ? Math.round((patrol.checkpoints_completed / patrol.checkpoints_total) * 100) : 0;
            return (
              <div key={patrol.site_name} className="px-4 py-2.5 border-t border-white/5">
                <div className="flex items-center justify-between mb-1">
                  <div className="flex items-center gap-2 min-w-0">
                    <span className={`w-2 h-2 rounded-full ${cfg.dot} shrink-0`}></span>
                    <span className="text-sm font-medium text-white truncate">{patrol.site_name}</span>
                  </div>
                  <span className={`text-xs font-medium ${cfg.text} shrink-0`}>{cfg.label}</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="flex-1 h-1.5 bg-gray-800 rounded-full overflow-hidden">
                    <div className={`h-full rounded-full ${cfg.bar} transition-all duration-700`} style={{ width: `${pct}%` }}></div>
                  </div>
                  <span className="text-[10px] text-gray-500 shrink-0">{patrol.checkpoints_completed}/{patrol.checkpoints_total}</span>
                </div>
                {patrol.last_patrol_at && (
                  <p className="text-[10px] text-gray-600 mt-0.5">Last patrol: {timeAgo(patrol.last_patrol_at)}</p>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}