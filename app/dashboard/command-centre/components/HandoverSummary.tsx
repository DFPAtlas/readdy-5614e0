'use client';

import type { DashboardKPIs, DashboardSite, GuardOnShift, MissingGuard, RecentIncident, PatrolSummary, LiveOccurrence, StaffingAlert } from '@/lib/useDashboard';

interface HandoverSummaryProps {
  kpis: DashboardKPIs;
  sites: DashboardSite[];
  guardsOnShift: GuardOnShift[];
  missingGuards: MissingGuard[];
  recentIncidents: RecentIncident[];
  patrolSummary: PatrolSummary[];
  liveOccurrences: LiveOccurrence[];
  staffingAlerts: StaffingAlert[];
}

function timeAgo(iso: string): string {
  const diff = Math.floor((Date.now() - new Date(iso).getTime()) / 1000);
  if (diff < 60) return 'Just now';
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return `${Math.floor(diff / 86400)}d ago`;
}

export default function HandoverSummary({ kpis, sites, guardsOnShift, missingGuards, recentIncidents, patrolSummary, liveOccurrences, staffingAlerts }: HandoverSummaryProps) {
  const now = new Date();
  const activeSiteCount = sites.filter(s => s.shift_status === 'active').length;
  const lateGuards = guardsOnShift.filter(g => g.status === 'late' || g.status === 'critical_late');
  const missedPatrols = patrolSummary.filter(p => p.status === 'missed');
  const partialPatrols = patrolSummary.filter(p => p.status === 'partial');
  const recentActivity = liveOccurrences.slice(0, 5);
  const criticalHighIncidents = recentIncidents.filter(i => i.severity === 'critical' || i.severity === 'high');

  const issues = [
    ...criticalHighIncidents.map(i => `Critical incident: ${i.incident_type} at ${i.site_name}`),
    ...lateGuards.map(g => `Guard ${g.name} is ${g.late_minutes}m late at ${g.site_name}`),
    ...missingGuards.map(g => `${g.name} — ${g.reason === 'no_clock_in' ? 'No clock-in' : 'Unassigned'} at ${g.site_name}`),
    ...missedPatrols.map(p => `Missed patrol at ${p.site_name} (${p.checkpoints_completed}/${p.checkpoints_total} checkpoints)`),
    ...partialPatrols.map(p => `Partial patrol at ${p.site_name} (${p.checkpoints_completed}/${p.checkpoints_total} checkpoints)`),
    ...staffingAlerts.map(s => `Understaffed: ${s.site_name} needs ${s.guard_needed} guard at ${new Date(s.shift_time).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })}`),
  ];

  return (
    <div className="bg-[#0f172a]/70 backdrop-blur-sm border border-white/10 shadow-sm rounded-xl p-4">
      <div className="flex items-center gap-2 mb-4">
        <div className="w-5 h-5 flex items-center justify-center text-blue-400">
          <i className="ri-clipboard-line text-sm"></i>
        </div>
        <h3 className="text-sm font-semibold text-white">Handover Summary</h3>
      </div>

      <div className="space-y-4">
        <div className="p-3 rounded-lg bg-gray-900/40 border border-gray-800/50">
          <p className="text-xs text-gray-500 mb-1">Generated</p>
          <p className="text-sm font-medium text-white">{now.toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })} at {now.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })}</p>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="p-3 rounded-lg bg-gray-900/40 border border-gray-800/50">
            <p className="text-xs text-gray-500 mb-1">Active Sites</p>
            <p className="text-lg font-bold text-white">{activeSiteCount} <span className="text-xs font-normal text-gray-500">/ {sites.length}</span></p>
          </div>
          <div className="p-3 rounded-lg bg-gray-900/40 border border-gray-800/50">
            <p className="text-xs text-gray-500 mb-1">Guards On Duty</p>
            <p className="text-lg font-bold text-white">{guardsOnShift.length}</p>
          </div>
          <div className="p-3 rounded-lg bg-gray-900/40 border border-gray-800/50">
            <p className="text-xs text-gray-500 mb-1">Open Incidents</p>
            <p className={`text-lg font-bold ${kpis.openIncidents > 0 ? 'text-red-400' : 'text-white'}`}>{kpis.openIncidents}</p>
          </div>
          <div className="p-3 rounded-lg bg-gray-900/40 border border-gray-800/50">
            <p className="text-xs text-gray-500 mb-1">Patrol Completion</p>
            <p className={`text-lg font-bold ${kpis.patrolCompletion >= 90 ? 'text-emerald-400' : kpis.patrolCompletion >= 75 ? 'text-amber-400' : 'text-red-400'}`}>{kpis.patrolCompletion}%</p>
          </div>
        </div>

        {issues.length > 0 && (
          <div>
            <h4 className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-2">Issues Requiring Attention</h4>
            <div className="space-y-2">
              {issues.slice(0, 8).map((issue, i) => (
                <div key={i} className="flex items-start gap-2">
                  <div className="w-4 h-4 flex items-center justify-center text-red-400 mt-0.5">
                    <i className="ri-error-warning-line text-xs"></i>
                  </div>
                  <p className="text-xs text-gray-300 leading-relaxed">{issue}</p>
                </div>
              ))}
              {issues.length > 8 && (
                <p className="text-xs text-gray-500 pl-6">+{issues.length - 8} more issues</p>
              )}
            </div>
          </div>
        )}

        {recentActivity.length > 0 && (
          <div>
            <h4 className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-2">Recent Activity</h4>
            <div className="space-y-2">
              {recentActivity.map(o => (
                <div key={o.id} className="flex items-center gap-2">
                  <div className="w-4 h-4 flex items-center justify-center text-gray-500">
                    <i className="ri-arrow-right-s-line text-xs"></i>
                  </div>
                  <p className="text-xs text-gray-400 line-clamp-1">{o.entry_type || 'Entry'} at {o.site_name} — {timeAgo(o.created_at)}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {kpis.nextOpenShift && (
          <div className="p-3 rounded-lg bg-blue-500/5 border border-blue-500/10">
            <h4 className="text-xs font-medium text-blue-400 uppercase tracking-wider mb-1">Upcoming</h4>
            <p className="text-sm text-white">Next open shift: <span className="font-medium">{kpis.nextOpenShift.site}</span> on <span className="font-medium">{kpis.nextOpenShift.day}</span></p>
            <p className="text-xs text-gray-500 mt-1">{kpis.openShifts} shifts need filling in next 7 days</p>
          </div>
        )}
      </div>
    </div>
  );
}