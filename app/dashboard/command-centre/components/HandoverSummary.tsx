'use client';

import Link from 'next/link';
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

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <h4 className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider">{children}</h4>
  );
}

function Stat({ label, value, valueClass }: { label: string; value: string | number; valueClass?: string }) {
  return (
    <div className="p-3 rounded-lg bg-gray-900/40 border border-gray-800/50">
      <p className="text-[10px] text-gray-500 mb-1">{label}</p>
      <p className={`text-lg font-bold leading-none ${valueClass || 'text-white'}`}>{value}</p>
    </div>
  );
}

function ActionItem({ icon, text, iconClass }: { icon: string; text: string; iconClass: string }) {
  return (
    <div className="flex items-start gap-2">
      <div className={`w-4 h-4 flex items-center justify-center ${iconClass} mt-0.5 shrink-0`}>
        <i className={`${icon} text-xs`}></i>
      </div>
      <p className="text-xs text-gray-300 leading-relaxed">{text}</p>
    </div>
  );
}

export default function HandoverSummary({ kpis, sites, guardsOnShift, missingGuards, recentIncidents, patrolSummary, staffingAlerts }: HandoverSummaryProps) {
  const activeSiteCount = sites.filter(s => s.shift_status === 'active').length;
  const lateGuards = guardsOnShift.filter(g => g.status === 'late' || g.status === 'critical_late');
  const missedPatrols = patrolSummary.filter(p => p.status === 'missed');
  const partialPatrols = patrolSummary.filter(p => p.status === 'partial');
  const criticalHighIncidents = recentIncidents.filter(i => i.severity === 'critical' || i.severity === 'high');

  const patrolExceptions = missedPatrols.length + partialPatrols.length;

  const outstandingActions: { icon: string; text: string; iconClass: string }[] = [
    ...criticalHighIncidents.map(i => ({
      icon: 'ri-alarm-warning-line',
      text: `${i.incident_type} at ${i.site_name} (${i.status})`,
      iconClass: 'text-red-400',
    })),
    ...lateGuards.map(g => ({
      icon: 'ri-time-line',
      text: `Guard ${g.name} is ${g.late_minutes || 0}m late at ${g.site_name}`,
      iconClass: 'text-red-400',
    })),
    ...missingGuards.map(g => ({
      icon: 'ri-user-unfollow-line',
      text: `${g.name} — ${g.reason === 'no_clock_in' ? 'no clock-in' : 'unassigned'} at ${g.site_name}`,
      iconClass: 'text-amber-400',
    })),
    ...missedPatrols.map(p => ({
      icon: 'ri-route-line',
      text: `Missed patrol at ${p.site_name} (${p.checkpoints_completed}/${p.checkpoints_total})`,
      iconClass: 'text-red-400',
    })),
    ...partialPatrols.map(p => ({
      icon: 'ri-route-line',
      text: `Partial patrol at ${p.site_name} (${p.checkpoints_completed}/${p.checkpoints_total})`,
      iconClass: 'text-amber-400',
    })),
    ...staffingAlerts.filter(s => s.severity === 'high').map(s => ({
      icon: 'ri-team-line',
      text: `Understaffed: ${s.site_name} needs ${s.guard_needed} guard`,
      iconClass: 'text-red-400',
    })),
  ];

  return (
    <div className="bg-[#0f172a]/70 backdrop-blur-sm border border-white/10 shadow-sm rounded-xl p-4">
      <div className="flex items-center gap-2 mb-4">
        <div className="w-5 h-5 flex items-center justify-center text-blue-400">
          <i className="ri-clipboard-line text-sm"></i>
        </div>
        <h3 className="text-sm font-semibold text-white">Shift Handover</h3>
        <span className="ml-auto text-[11px] text-gray-500">Command briefing</span>
      </div>

      <div className="space-y-5">
        <div>
          <SectionLabel>Current Shift</SectionLabel>
          <div className="grid grid-cols-2 gap-2 mt-2">
            <Stat label="Sites Operational" value={`${activeSiteCount} / ${sites.length}`} />
            <Stat label="Guards On Duty" value={guardsOnShift.length} />
            <Stat label="Open Incidents" value={kpis.openIncidents} valueClass={kpis.openIncidents > 0 ? 'text-red-400' : undefined} />
            <Stat
              label="Patrol Exceptions"
              value={patrolExceptions}
              valueClass={patrolExceptions > 0 ? 'text-amber-400' : 'text-emerald-400'}
            />
          </div>
        </div>

        <div>
          <SectionLabel>Outstanding Actions</SectionLabel>
          {outstandingActions.length === 0 ? (
            <div className="flex items-center gap-2 mt-2 px-3 py-2.5 rounded-lg bg-emerald-500/5 border border-emerald-500/10">
              <div className="w-4 h-4 flex items-center justify-center text-emerald-400">
                <i className="ri-check-line text-sm"></i>
              </div>
              <p className="text-xs text-emerald-400">No outstanding actions</p>
            </div>
          ) : (
            <div className="space-y-2 mt-2 max-h-56 overflow-y-auto">
              {outstandingActions.slice(0, 8).map((a, i) => (
                <ActionItem key={i} icon={a.icon} text={a.text} iconClass={a.iconClass} />
              ))}
              {outstandingActions.length > 8 && (
                <p className="text-xs text-gray-500 pl-6">+{outstandingActions.length - 8} more actions</p>
              )}
            </div>
          )}
        </div>

        <div>
          <SectionLabel>Next Shift</SectionLabel>
          {kpis.nextOpenShift ? (
            <div className="mt-2 p-3 rounded-lg bg-blue-500/5 border border-blue-500/10">
              <p className="text-sm text-white">
                Next open shift: <span className="font-medium">{kpis.nextOpenShift.site}</span> on{' '}
                <span className="font-medium">{kpis.nextOpenShift.day}</span>
              </p>
              <p className="text-xs text-gray-500 mt-1">
                {kpis.openShifts} shift{kpis.openShifts === 1 ? '' : 's'} need filling in the next 7 days
              </p>
              <Link
                href="/rotas"
                className="inline-flex items-center gap-1 mt-2 text-xs font-medium text-blue-400 hover:text-blue-300 cursor-pointer"
              >
                Open rota
                <div className="w-3.5 h-3.5 flex items-center justify-center">
                  <i className="ri-arrow-right-line"></i>
                </div>
              </Link>
            </div>
          ) : (
            <div className="flex items-center gap-2 mt-2 px-3 py-2.5 rounded-lg bg-white/5 border border-white/10">
              <div className="w-4 h-4 flex items-center justify-center text-gray-500">
                <i className="ri-information-line text-sm"></i>
              </div>
              <p className="text-xs text-gray-400">No upcoming shift coverage data</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}