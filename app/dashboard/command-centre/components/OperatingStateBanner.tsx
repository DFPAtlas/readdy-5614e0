'use client';

import type { DashboardKPIs, GuardOnShift, MissingGuard, StaffingAlert } from '@/lib/dashboardFetch';

interface OperatingStateBannerProps {
  kpis: DashboardKPIs;
  guardsOnShift: GuardOnShift[];
  missingGuards: MissingGuard[];
  staffingAlerts: StaffingAlert[];
  highRiskSiteCount: number;
  loneWorkerAlarmCount: number;
  lastUpdated: Date | null;
}

type OperatingState = 'normal' | 'attention' | 'critical';

const STATE_CONFIG: Record<OperatingState, { label: string; dot: string; text: string; border: string; bg: string }> = {
  normal: {
    label: 'NORMAL OPERATIONS',
    dot: 'bg-emerald-500',
    text: 'text-emerald-400',
    border: 'border-emerald-500/20',
    bg: 'bg-emerald-500/5',
  },
  attention: {
    label: 'ATTENTION REQUIRED',
    dot: 'bg-amber-500',
    text: 'text-amber-400',
    border: 'border-amber-500/20',
    bg: 'bg-amber-500/5',
  },
  critical: {
    label: 'CRITICAL OPERATIONS',
    dot: 'bg-red-500',
    text: 'text-red-400',
    border: 'border-red-500/25',
    bg: 'bg-red-500/5',
  },
};

function formatRefreshTime(d: Date | null): string {
  if (!d) return 'Never refreshed';
  const diff = Math.floor((Date.now() - d.getTime()) / 1000);
  if (diff < 60) return 'just now';
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  return `${Math.floor(diff / 3600)}h ago`;
}

export default function OperatingStateBanner({ kpis, guardsOnShift, missingGuards, staffingAlerts, highRiskSiteCount, loneWorkerAlarmCount, lastUpdated }: OperatingStateBannerProps) {
  const lateGuardCount = guardsOnShift.filter(g => g.status === 'late' || g.status === 'critical_late').length;
  const criticalStaffing = staffingAlerts.filter(s => s.severity === 'high').length;

  const isCritical = kpis.highCriticalIncidents > 0 || loneWorkerAlarmCount > 0;
  const needsAttention =
    kpis.openIncidents > 0 ||
    lateGuardCount > 0 ||
    missingGuards.length > 0 ||
    kpis.missedPatrols > 0 ||
    highRiskSiteCount > 0 ||
    criticalStaffing > 0;

  const state: OperatingState = isCritical ? 'critical' : needsAttention ? 'attention' : 'normal';
  const config = STATE_CONFIG[state];

  const reasons: string[] = [];
  if (kpis.highCriticalIncidents > 0) reasons.push(`${kpis.highCriticalIncidents} critical incident${kpis.highCriticalIncidents > 1 ? 's' : ''}`);
  if (loneWorkerAlarmCount > 0) reasons.push(`${loneWorkerAlarmCount} lone-worker alarm${loneWorkerAlarmCount > 1 ? 's' : ''}`);
  if (kpis.openIncidents > 0) reasons.push(`${kpis.openIncidents} open incident${kpis.openIncidents > 1 ? 's' : ''}`);
  if (lateGuardCount > 0) reasons.push(`${lateGuardCount} guard${lateGuardCount > 1 ? 's' : ''} late`);
  if (missingGuards.length > 0) reasons.push(`${missingGuards.length} missing`);
  if (kpis.missedPatrols > 0) reasons.push(`${kpis.missedPatrols} missed patrol${kpis.missedPatrols > 1 ? 's' : ''}`);
  if (highRiskSiteCount > 0) reasons.push(`${highRiskSiteCount} high-risk site${highRiskSiteCount > 1 ? 's' : ''}`);
  if (criticalStaffing > 0) reasons.push(`${criticalStaffing} critical staffing gap${criticalStaffing > 1 ? 's' : ''}`);

  return (
    <div className={`flex items-center gap-3 px-4 py-3 rounded-xl border ${config.border} ${config.bg}`}>
      <span className="relative flex h-2.5 w-2.5 shrink-0">
        <span className={`animate-ping absolute inline-flex h-full w-full rounded-full ${config.dot} opacity-60`}></span>
        <span className={`relative inline-flex rounded-full h-2.5 w-2.5 ${config.dot}`}></span>
      </span>
      <div className="flex items-center gap-2 min-w-0">
        <span className={`text-sm font-bold tracking-wide ${config.text} whitespace-nowrap`}>{config.label}</span>
        {reasons.length > 0 && (
          <span className="text-xs text-gray-400 truncate">
            — {reasons.slice(0, 3).join(', ')}{reasons.length > 3 ? ` +${reasons.length - 3} more` : ''}
          </span>
        )}
      </div>
      <span className="ml-auto text-[11px] text-gray-500 whitespace-nowrap shrink-0">
        Updated {formatRefreshTime(lastUpdated)}
      </span>
    </div>
  );
}