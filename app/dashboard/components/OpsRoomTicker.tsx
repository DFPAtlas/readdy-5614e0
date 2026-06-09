'use client';

import type { RecentIncident, DashboardKPIs } from '@/lib/dashboardFetch';

interface OpsRoomTickerProps {
  incidents: RecentIncident[];
  kpis: DashboardKPIs;
}

const severityColor: Record<string, string> = {
  critical: 'text-red-400',
  high: 'text-orange-400',
  medium: 'text-amber-400',
  low: 'text-blue-400',
};

export default function OpsRoomTicker({ incidents, kpis }: OpsRoomTickerProps) {
  const criticalItems = [
    ...(kpis.highCriticalIncidents > 0 ? [`${kpis.highCriticalIncidents} CRITICAL/HIGH incidents open`] : []),
    ...(kpis.lateGuards > 0 ? [`${kpis.lateGuards} guard${kpis.lateGuards > 1 ? 's' : ''} late`] : []),
    ...(kpis.missedPatrols > 0 ? [`${kpis.missedPatrols} missed patrol${kpis.missedPatrols > 1 ? 's' : ''}`] : []),
    ...(kpis.openShifts > 0 ? [`${kpis.openShifts} unfilled shift${kpis.openShifts > 1 ? 's' : ''}`] : []),
    ...(kpis.patrolCompletion < 75 ? [`Patrol completion at ${kpis.patrolCompletion}% — below target`] : []),
    ...(kpis.avgRiskScore > 60 ? [`Average risk score elevated: ${kpis.avgRiskScore}/100`] : []),
  ];

  const incidentItems = incidents
    .filter((i) => i.severity === 'critical' || i.severity === 'high')
    .map((i) => ({
      text: `${i.incident_type} at ${i.site_name}`,
      color: severityColor[i.severity] || 'text-gray-400',
    }));

  const allItems = [
    ...criticalItems.map((t) => ({ text: t, color: 'text-red-400' })),
    ...incidentItems,
    { text: `System operational — ${kpis.activeGuards} guards on shift across all sites`, color: 'text-emerald-400' },
  ];

  if (allItems.length === 0) {
    allItems.push({ text: 'All systems operational — no active alerts', color: 'text-emerald-400' });
  }

  const tickerContent = [...allItems, ...allItems];

  return (
    <div className="h-10 bg-[#0a0e1a] border-t border-white/5 overflow-hidden flex items-center">
      <div className="shrink-0 px-4 py-2 bg-white/5 border-r border-white/10">
        <span className="text-xs font-bold text-gray-400 tracking-wider">ALERTS</span>
      </div>
      <div className="flex-1 overflow-hidden">
        <div className="flex items-center whitespace-nowrap animate-[tickerScroll_40s_linear_infinite]">
          {tickerContent.map((item, i) => (
            <span key={i} className="flex items-center gap-2 px-6">
              <span className="w-1.5 h-1.5 rounded-full bg-gray-700 shrink-0"></span>
              <span className={`text-sm font-medium ${item.color}`}>{item.text}</span>
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}