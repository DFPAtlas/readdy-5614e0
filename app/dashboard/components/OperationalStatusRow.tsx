'use client';

import Link from 'next/link';
import type { DashboardKPIs, DashboardSite, AIAlert, PatrolSummary, WeekShift, MissingGuard } from '@/lib/dashboardFetch';

type Level = 'healthy' | 'warning' | 'critical' | 'info';

const levelStyles: Record<Level, { dot: string; text: string; border: string }> = {
  healthy: { dot: 'bg-emerald-500', text: 'text-emerald-400', border: 'border-emerald-500/30' },
  warning: { dot: 'bg-amber-500', text: 'text-amber-400', border: 'border-amber-500/30' },
  critical: { dot: 'bg-red-500', text: 'text-red-400', border: 'border-red-500/30' },
  info: { dot: 'bg-blue-500', text: 'text-blue-400', border: 'border-blue-500/30' },
};

interface OperationalStatusRowProps {
  kpis: DashboardKPIs;
  sites: DashboardSite[];
  aiAlerts: AIAlert[];
  patrolSummary: PatrolSummary[];
  weekShifts: WeekShift[];
  missingGuards: MissingGuard[];
}

interface StatusCard {
  label: string;
  value: string | number;
  sub: string;
  level: Level;
  icon: string;
  href: string;
}

export default function OperationalStatusRow({
  kpis, sites, aiAlerts, patrolSummary, weekShifts, missingGuards,
}: OperationalStatusRowProps) {
  const totalSites = sites.length;
  const operationalSites = sites.filter(
    (s) => s.booked_on_count > 0 || s.shift_status === 'active' || (!!s.guard_first_name && !!s.shift_id)
  ).length;
  const warningSites = sites.filter(
    (s) => s.critical_incidents > 0 || s.patrol_status === 'missed' || s.welfare_status === 'red' || s.welfare_status === 'amber'
  ).length;

  const onDuty = kpis.activeGuards;
  const guardIssues = kpis.lateGuards + missingGuards.length;

  const openIncidents = kpis.openIncidents;
  const criticalIncidents = kpis.highCriticalIncidents;

  const patrolCompletion = kpis.patrolCompletion;
  const patrolExceptions = kpis.missedPatrols + patrolSummary.filter((p) => p.status !== 'complete').length;

  const aiCount = aiAlerts.length;
  const aiAttention = aiAlerts.filter((a) => a.severity === 'high' || a.severity === 'critical').length;

  const todayKey = new Date().toISOString().split('T')[0];
  const today = weekShifts.find((w) => w.date === todayKey);
  const totalToday = today ? today.filled + today.open : 0;
  const unfilledToday = today ? today.open : 0;

  const cards: StatusCard[] = [
    {
      label: 'Sites Online',
      value: operationalSites,
      sub: `${totalSites} total${warningSites > 0 ? ` · ${warningSites} attention` : ''}`,
      level: warningSites > 0 ? 'critical' : operationalSites < totalSites ? 'warning' : 'healthy',
      icon: 'ri-building-line',
      href: '/sites',
    },
    {
      label: 'Guards On Duty',
      value: onDuty,
      sub: guardIssues > 0 ? `${guardIssues} late/missing` : 'All present',
      level: missingGuards.length > 0 ? 'critical' : guardIssues > 0 ? 'warning' : 'healthy',
      icon: 'ri-shield-user-line',
      href: '/guards',
    },
    {
      label: 'Active Incidents',
      value: openIncidents,
      sub: criticalIncidents > 0 ? `${criticalIncidents} critical/high` : 'No critical',
      level: criticalIncidents > 0 ? 'critical' : openIncidents > 0 ? 'warning' : 'healthy',
      icon: 'ri-alarm-warning-line',
      href: '/incidents',
    },
    {
      label: 'Patrol Status',
      value: `${patrolCompletion}%`,
      sub: patrolExceptions > 0 ? `${patrolExceptions} overdue/missed` : 'On schedule',
      level: patrolExceptions > 0 ? 'critical' : patrolCompletion < 90 ? 'warning' : 'healthy',
      icon: 'ri-route-line',
      href: '/dashboard/patrol-monitoring',
    },
    {
      label: 'AI / Automation',
      value: aiCount,
      sub: aiAttention > 0 ? `${aiAttention} need attention` : 'No alerts',
      level: aiAttention > 0 ? 'warning' : aiCount > 0 ? 'info' : 'healthy',
      icon: 'ri-robot-2-line',
      href: '/dashboard/ai-automation',
    },
    {
      label: "Today's Shifts",
      value: totalToday,
      sub: unfilledToday > 0 ? `${unfilledToday} unfilled` : 'Fully staffed',
      level: unfilledToday > 0 ? 'warning' : totalToday > 0 ? 'healthy' : 'info',
      icon: 'ri-calendar-event-line',
      href: '/rotas',
    },
  ];

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-6 gap-3">
      {cards.map((card) => {
        const st = levelStyles[card.level];
        return (
          <Link key={card.label} href={card.href} className="block cursor-pointer group">
            <div className={`bg-[#0f172a]/70 backdrop-blur-sm border border-white/10 hover:border-white/20 rounded-xl p-3.5 h-full transition-all ${card.level !== 'healthy' ? st.border : ''}`}>
              <div className="flex items-center justify-between mb-3">
                <div className="w-7 h-7 rounded-md bg-white/5 flex items-center justify-center">
                  <div className="w-4 h-4 flex items-center justify-center">
                    <i className={`${card.icon} text-sm ${st.text}`}></i>
                  </div>
                </div>
                <span className={`w-2 h-2 rounded-full ${st.dot}`}></span>
              </div>
              <div className="text-2xl font-bold text-white leading-none">{card.value}</div>
              <div className="text-[11px] font-semibold uppercase tracking-wide text-gray-500 mt-2 truncate">{card.label}</div>
              <div className={`text-xs mt-1 truncate ${card.level === 'healthy' ? 'text-gray-500' : st.text}`}>{card.sub}</div>
            </div>
          </Link>
        );
      })}
    </div>
  );
}