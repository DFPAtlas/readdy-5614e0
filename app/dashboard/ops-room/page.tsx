'use client';

import { useEffect, useState, useCallback, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth';
import { useDashboard } from '@/lib/useDashboard';
import { usePanicMode } from '../components/PanicModeContext';
import Link from 'next/link';
import AITooledOperationsCopilot from '@/app/dashboard/components/AITooledOperationsCopilot';
import OpsRoomTicker from '../components/OpsRoomTicker';
import PanicDim from '../components/PanicDim';
import SpotlightCard from '../components/SpotlightCard';
import type { DashboardKPIs, DashboardSite, RecentIncident, LiveOccurrence, AIAlert, GuardOnShift, MissingGuard, PatrolSummary, StaffingAlert } from '@/lib/dashboardFetch';

const VIEWS = [
  { id: 'overview', label: 'Overview', duration: 30 },
  { id: 'guards-incidents', label: 'Guards & Incidents', duration: 25 },
  { id: 'patrol-risk', label: 'Patrol & Risk', duration: 25 },
  { id: 'ai-live', label: 'AI & Live Feed', duration: 25 },
  { id: 'sites-grid', label: 'Site Grid', duration: 20 },
];

// ... existing configs and helpers stay the same ...

const statusConfig = {
  on_time: { dot: 'bg-emerald-500', label: 'On time', text: 'text-emerald-400' },
  late: { dot: 'bg-amber-500', label: 'Late', text: 'text-amber-400' },
  critical_late: { dot: 'bg-red-500', label: 'Critical', text: 'text-red-400' },
};

const severityConfig: Record<string, { dot: string; border: string; text: string }> = {
  critical: { dot: 'bg-red-500', border: 'border-l-red-500', text: 'text-red-400' },
  high: { dot: 'bg-orange-500', border: 'border-l-orange-500', text: 'text-orange-400' },
  medium: { dot: 'bg-amber-500', border: 'border-l-amber-500', text: 'text-amber-400' },
  low: { dot: 'bg-blue-500', border: 'border-l-blue-500', text: 'text-blue-400' },
};

const patrolConfig = {
  complete: { dot: 'bg-emerald-500', text: 'text-emerald-400', bar: 'bg-emerald-500' },
  partial: { dot: 'bg-amber-500', text: 'text-amber-400', bar: 'bg-amber-500' },
  missed: { dot: 'bg-red-500', text: 'text-red-400', bar: 'bg-red-500' },
};

const riskConfig: Record<string, { color: string; dot: string }> = {
  low: { color: 'text-emerald-400', dot: 'bg-emerald-500' },
  medium: { color: 'text-amber-400', dot: 'bg-amber-500' },
  high: { color: 'text-orange-400', dot: 'bg-orange-500' },
  critical: { color: 'text-red-400', dot: 'bg-red-500' },
};

function timeAgo(iso: string | null): string {
  if (!iso) return 'Just now';
  const diff = Math.floor((Date.now() - new Date(iso).getTime()) / 1000);
  if (diff < 60) return 'Just now';
  if (diff < 3600) return `${Math.floor(diff / 60)}m`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h`;
  return `${Math.floor(diff / 86400)}d`;
}

function timeUntil(iso: string): string {
  const diff = Math.floor((new Date(iso).getTime() - Date.now()) / (1000 * 60));
  if (diff < 0) return 'Overdue';
  if (diff < 60) return `${diff}m`;
  if (diff < 1440) return `${Math.floor(diff / 60)}h`;
  return `${Math.floor(diff / 1440)}d`;
}

function PulsingDot({ color, size = 'sm' }: { color: string; size?: 'sm' | 'md' | 'lg' }) {
  const sizeClass = size === 'lg' ? 'h-4 w-4' : size === 'md' ? 'h-3 w-3' : 'h-3 w-3';
  return (
    <span className={'relative flex ' + sizeClass + ' shrink-0'}>
      <span className={'animate-ping absolute inline-flex h-full w-full rounded-full ' + color + ' opacity-75'}></span>
      <span className={'relative inline-flex rounded-full ' + sizeClass + ' ' + color}></span>
    </span>
  );
}

function StatusBar({ kpis }: { kpis: DashboardKPIs }) {
  const [clock, setClock] = useState(new Date());

  useEffect(() => {
    const t = setInterval(() => setClock(new Date()), 1000);
    return () => clearInterval(t);
  }, []);

  const items = [
    { label: 'ON SHIFT', value: kpis.activeGuards, color: 'text-emerald-400', dot: 'bg-emerald-500' },
    { label: 'LATE', value: kpis.lateGuards, color: kpis.lateGuards > 0 ? 'text-amber-400' : 'text-gray-600', dot: kpis.lateGuards > 0 ? 'bg-amber-500' : 'bg-gray-700' },
    { label: 'MISSING', value: kpis.openShifts, color: kpis.openShifts > 0 ? 'text-red-400' : 'text-gray-600', dot: kpis.openShifts > 0 ? 'bg-red-500' : 'bg-gray-700' },
    { label: 'INCIDENTS', value: kpis.openIncidents, color: kpis.openIncidents > 0 ? 'text-red-400' : 'text-gray-600', dot: kpis.openIncidents > 0 ? 'bg-red-500' : 'bg-gray-700' },
    { label: 'CRITICAL', value: kpis.highCriticalIncidents, color: kpis.highCriticalIncidents > 0 ? 'text-red-500' : 'text-gray-600', dot: kpis.highCriticalIncidents > 0 ? 'bg-red-500' : 'bg-gray-700' },
    { label: 'PATROL %', value: `${kpis.patrolCompletion}%`, color: kpis.patrolCompletion >= 90 ? 'text-emerald-400' : 'text-amber-400', dot: kpis.patrolCompletion >= 90 ? 'bg-emerald-500' : 'bg-amber-500' },
    { label: 'MISSED PATROLS', value: kpis.missedPatrols, color: kpis.missedPatrols > 0 ? 'text-red-400' : 'text-gray-600', dot: kpis.missedPatrols > 0 ? 'bg-red-500' : 'bg-gray-700' },
    { label: 'AVG RISK', value: kpis.avgRiskScore, color: kpis.avgRiskScore <= 30 ? 'text-emerald-400' : kpis.avgRiskScore <= 60 ? 'text-amber-400' : 'text-red-400', dot: kpis.avgRiskScore <= 30 ? 'bg-emerald-500' : kpis.avgRiskScore <= 60 ? 'bg-amber-500' : 'bg-red-500' },
  ];

  return (
    <div className="flex items-center justify-between px-6 py-3 bg-[#0a0e1a] border-b border-white/5">
      <div className="flex items-center gap-8">
        {items.map((item) => (
          <div key={item.label} className="flex items-center gap-2">
            <PulsingDot color={item.dot} />
            <div>
              <div className="text-[10px] text-gray-600 font-semibold tracking-wider">{item.label}</div>
              <div className={`text-lg font-bold ${item.color}`}>{item.value}</div>
            </div>
          </div>
        ))}
      </div>
      <div className="flex items-center gap-4">
        <div className="text-right">
          <div className="text-[10px] text-gray-600 font-semibold tracking-wider">SYSTEM TIME</div>
          <div className="text-lg font-bold text-white font-mono">{clock.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}</div>
        </div>
      </div>
    </div>
  );
}

function OverviewView({ kpis, sites, recentIncidents, liveOccurrences, aiAlerts, guardsOnShift, missingGuards, patrolSummary, staffingAlerts }: {
  kpis: DashboardKPIs;
  sites: DashboardSite[];
  recentIncidents: RecentIncident[];
  liveOccurrences: LiveOccurrence[];
  aiAlerts: AIAlert[];
  guardsOnShift: GuardOnShift[];
  missingGuards: MissingGuard[];
  patrolSummary: PatrolSummary[];
  staffingAlerts: StaffingAlert[];
}) {
  const criticalIncidents = recentIncidents.filter((i) => i.severity === 'critical');

  return (
    <div className="h-full flex flex-col gap-4 px-6 py-4">
      <div className="grid grid-cols-4 gap-4 flex-1 min-h-0">
        {/* Top Left: Guard Status */}
        <PanicDim>
          <div className="bg-[#0f172a]/80 border border-white/10 rounded-xl overflow-hidden flex flex-col h-full">
            <div className="px-4 pt-3 pb-2 flex items-center gap-2">
              <PulsingDot color="bg-emerald-500" />
              <h3 className="text-sm font-bold text-white">Guard Status</h3>
              <span className="ml-auto text-xs text-gray-500">{guardsOnShift.length} on shift</span>
            </div>
            <div className="flex-1 overflow-y-auto px-4 pb-3">
              {guardsOnShift.slice(0, 8).map((g) => {
                const cfg = statusConfig[g.status];
                return (
                  <div key={g.id} className="flex items-center gap-2 py-1.5 border-b border-white/5">
                    <span className={`w-2 h-2 rounded-full ${cfg.dot} shrink-0`}></span>
                    <span className="text-sm text-white truncate flex-1">{g.name}</span>
                    <span className={`text-xs ${cfg.text} shrink-0`}>{cfg.label}</span>
                    {g.late_minutes && <span className="text-xs text-red-400 shrink-0">+{g.late_minutes}m</span>}
                  </div>
                );
              })}
              {missingGuards.length > 0 && (
                <div className="mt-2">
                  <div className="text-xs font-semibold text-red-400 mb-1">{missingGuards.length} Missing</div>
                  {missingGuards.slice(0, 3).map((m) => (
                    <div key={m.id} className="flex items-center gap-2 py-1">
                      <PulsingDot color="bg-red-500" />
                      <span className="text-sm text-white truncate flex-1">{m.name}</span>
                      <span className="text-xs text-gray-500">{m.site_name}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </PanicDim>

        {/* Top Middle: Incidents — Spotlight */}
        <SpotlightCard essential severity={criticalIncidents.length > 0 ? 'critical' : 'high'} className="h-full">
          <div className="bg-[#0f172a]/80 border border-white/10 rounded-xl overflow-hidden flex flex-col h-full">
            <div className="px-4 pt-3 pb-2 flex items-center gap-2">
              <PulsingDot color={kpis.highCriticalIncidents > 0 ? 'bg-red-500' : 'bg-gray-600'} />
              <h3 className="text-sm font-bold text-white">Incidents</h3>
              <span className="ml-auto text-xs text-gray-500">{kpis.openIncidents} open</span>
            </div>
            <div className="flex-1 overflow-y-auto px-4 pb-3">
              {recentIncidents.slice(0, 6).map((inc) => {
                const cfg = severityConfig[inc.severity] || severityConfig.low;
                return (
                  <div key={inc.id} className={`px-2 py-2 border-l-2 ${cfg.border} border-b border-white/5`}>
                    <div className="flex items-center gap-2">
                      <span className={`w-2 h-2 rounded-full ${cfg.dot}`}></span>
                      <span className="text-sm font-medium text-white truncate">{inc.incident_type}</span>
                    </div>
                    <p className="text-xs text-gray-500 truncate mt-0.5">{inc.site_name} — {timeAgo(inc.created_at)}</p>
                  </div>
                );
              })}
            </div>
          </div>
        </SpotlightCard>

        {/* Top Right: Patrol */}
        <PanicDim>
          <div className="bg-[#0f172a]/80 border border-white/10 rounded-xl overflow-hidden flex flex-col h-full">
            <div className="px-4 pt-3 pb-2 flex items-center gap-2">
              <PulsingDot color={kpis.patrolCompletion >= 90 ? 'bg-emerald-500' : kpis.patrolCompletion >= 75 ? 'bg-amber-500' : 'bg-red-500'} />
              <h3 className="text-sm font-bold text-white">Patrol Status</h3>
              <span className="ml-auto text-xs text-gray-500">{kpis.patrolCompletion}%</span>
            </div>
            <div className="flex-1 overflow-y-auto px-4 pb-3">
              {patrolSummary.slice(0, 6).map((p) => {
                const cfg = patrolConfig[p.status];
                const pct = p.checkpoints_total > 0 ? Math.round((p.checkpoints_completed / p.checkpoints_total) * 100) : 0;
                return (
                  <div key={p.site_name} className="py-2 border-b border-white/5">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm text-white truncate">{p.site_name}</span>
                      <span className={`text-xs font-medium ${cfg.text}`}>{p.status}</span>
                    </div>
                    <div className="w-full h-1.5 bg-gray-800 rounded-full overflow-hidden">
                      <div className={`h-full ${cfg.bar}`} style={{ width: `${pct}%` }}></div>
                    </div>
                    <span className="text-[10px] text-gray-600">{p.checkpoints_completed}/{p.checkpoints_total}</span>
                  </div>
                );
              })}
            </div>
          </div>
        </PanicDim>

        {/* Top Far Right: Staffing */}
        <PanicDim>
          <div className="bg-[#0f172a]/80 border border-white/10 rounded-xl overflow-hidden flex flex-col h-full">
            <div className="px-4 pt-3 pb-2 flex items-center gap-2">
              <PulsingDot color={staffingAlerts.some((a) => a.severity === 'high') ? 'bg-red-500' : 'bg-amber-500'} />
              <h3 className="text-sm font-bold text-white">Staffing</h3>
              <span className="ml-auto text-xs text-gray-500">{staffingAlerts.length} open</span>
            </div>
            <div className="flex-1 overflow-y-auto px-4 pb-3">
              {staffingAlerts.slice(0, 6).map((alert, i) => {
                const color = alert.severity === 'high' ? 'text-red-400' : alert.severity === 'medium' ? 'text-amber-400' : 'text-blue-400';
                return (
                  <div key={`${alert.site_name}-${i}`} className="py-2 border-b border-white/5">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-white truncate">{alert.site_name}</span>
                      <span className={`text-xs font-medium ${color}`}>In {timeUntil(alert.shift_time)}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </PanicDim>
      </div>

      {/* Bottom: Live Activity + AI Alerts */}
      <div className="grid grid-cols-3 gap-4 h-48 shrink-0">
        <SpotlightCard essential severity="high" className="h-full">
          <div className="bg-[#0f172a]/80 border border-white/10 rounded-xl overflow-hidden flex flex-col h-full">
            <div className="px-4 pt-3 pb-2 flex items-center gap-2">
              <PulsingDot color="bg-purple-500" />
              <h3 className="text-sm font-bold text-white">AI Insights</h3>
            </div>
            <div className="flex-1 overflow-y-auto px-4 pb-3">
              {aiAlerts.slice(0, 4).map((a) => {
                const detail = a.details?.narrative || a.details?.summary || a.details?.message || a.action_type;
                const color = a.severity === 'critical' ? 'text-red-400' : a.severity === 'high' ? 'text-orange-400' : a.severity === 'medium' ? 'text-amber-400' : 'text-blue-400';
                return (
                  <div key={a.id} className="py-1.5 border-b border-white/5">
                    <span className={`text-xs font-medium ${color}`}>{a.action_type.replace(/_/g, ' ')}</span>
                    <p className="text-xs text-gray-500 truncate">{detail}</p>
                  </div>
                );
              })}
            </div>
          </div>
        </SpotlightCard>

        <PanicDim className="col-span-2 h-full">
          <div className="bg-[#0f172a]/80 border border-white/10 rounded-xl overflow-hidden flex flex-col h-full">
            <div className="px-4 pt-3 pb-2 flex items-center gap-2">
              <PulsingDot color="bg-emerald-500" />
              <h3 className="text-sm font-bold text-white">Live Activity Feed</h3>
            </div>
            <div className="flex-1 overflow-y-auto px-4 pb-3">
              {liveOccurrences.slice(0, 6).map((o) => (
                <div key={o.id} className="py-1.5 border-b border-white/5 flex items-center gap-3">
                  <span className="text-xs text-gray-600 shrink-0 w-16">{timeAgo(o.created_at)}</span>
                  <span className="text-xs text-gray-500 shrink-0 w-24 truncate">{o.site_name}</span>
                  <span className="text-sm text-gray-300 truncate flex-1">{o.entry}</span>
                </div>
              ))}
            </div>
          </div>
        </PanicDim>
      </div>
    </div>
  );
}

// ... GuardsIncidentsView stays the same but with Spotlight on incidents panel ...

function GuardsIncidentsView({ guardsOnShift, missingGuards, recentIncidents, kpis }: {
  guardsOnShift: GuardOnShift[];
  missingGuards: MissingGuard[];
  recentIncidents: RecentIncident[];
  kpis: DashboardKPIs;
}) {
  const criticalIncidents = recentIncidents.filter((i) => i.severity === 'critical' || i.severity === 'high');

  return (
    <div className="h-full flex gap-4 px-6 py-4">
      <PanicDim className="w-1/2">
        <div className="bg-[#0f172a]/80 border border-white/10 rounded-xl overflow-hidden flex flex-col h-full">
          <div className="px-6 pt-4 pb-3 flex items-center gap-3">
            <PulsingDot color="bg-emerald-500" size="md" />
            <h2 className="text-xl font-bold text-white">Guards on Shift</h2>
            <span className="ml-auto text-lg font-bold text-emerald-400">{guardsOnShift.length}</span>
          </div>
          <div className="flex-1 overflow-y-auto px-6 pb-4">
            <div className="grid grid-cols-2 gap-3">
              {guardsOnShift.map((g) => {
                const cfg = statusConfig[g.status];
                return (
                  <div key={g.id} className="bg-white/5 border border-white/10 rounded-lg p-3 flex items-center gap-3">
                    <span className={`w-3 h-3 rounded-full ${cfg.dot} shrink-0`}></span>
                    <div className="flex-1 min-w-0">
                      <div className="text-base font-medium text-white truncate">{g.name}</div>
                      <div className="text-xs text-gray-500 truncate">{g.site_name}</div>
                    </div>
                    <div className="text-right shrink-0">
                      <div className={`text-sm font-semibold ${cfg.text}`}>{cfg.label}</div>
                      {g.late_minutes && <div className="text-xs text-red-400">+{g.late_minutes}m</div>}
                    </div>
                  </div>
                );
              })}
            </div>
            {missingGuards.length > 0 && (
              <div className="mt-4">
                <div className="text-sm font-bold text-red-400 mb-2 flex items-center gap-2">
                  <PulsingDot color="bg-red-500" size="md" />
                  Missing Guards ({missingGuards.length})
                </div>
                <div className="grid grid-cols-2 gap-3">
                  {missingGuards.map((m) => (
                    <div key={m.id} className="bg-red-500/5 border border-red-500/20 rounded-lg p-3 flex items-center gap-3">
                      <PulsingDot color="bg-red-500" />
                      <div className="flex-1 min-w-0">
                        <div className="text-base font-medium text-white truncate">{m.name}</div>
                        <div className="text-xs text-gray-500 truncate">{m.site_name}</div>
                      </div>
                      <span className="text-xs text-red-400 shrink-0">{m.reason === 'no_clock_in' ? 'No clock-in' : 'Unassigned'}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </PanicDim>

      <SpotlightCard essential className="w-1/2" severity={kpis.highCriticalIncidents > 0 ? 'critical' : 'high'}>
        <div className="bg-[#0f172a]/80 border border-white/10 rounded-xl overflow-hidden flex flex-col h-full">
          <div className="px-6 pt-4 pb-3 flex items-center gap-3">
            <PulsingDot color={kpis.highCriticalIncidents > 0 ? 'bg-red-500' : 'bg-gray-600'} size="md" />
            <h2 className="text-xl font-bold text-white">Open Incidents</h2>
            <span className="ml-auto text-lg font-bold text-red-400">{kpis.openIncidents}</span>
          </div>
          <div className="flex-1 overflow-y-auto px-6 pb-4">
            {criticalIncidents.length > 0 && (
              <div className="mb-4">
                <div className="text-sm font-bold text-red-400 mb-2 flex items-center gap-2">
                  <PulsingDot color="bg-red-500" size="md" />
                  Critical / High Priority ({criticalIncidents.length})
                </div>
                <div className="space-y-3">
                  {criticalIncidents.map((inc) => {
                    const cfg = severityConfig[inc.severity];
                    return (
                      <div key={inc.id} className={`bg-white/5 border border-white/10 rounded-lg p-4 border-l-4 ${cfg.border} ${inc.severity === 'critical' ? 'animate-flash-critical' : ''}`}>
                        <div className="flex items-center gap-2 mb-1">
                          <span className={`w-3 h-3 rounded-full ${cfg.dot}`}></span>
                          <span className="text-lg font-bold text-white">{inc.incident_type}</span>
                          <span className={`ml-auto text-sm font-bold ${cfg.text}`}>{inc.severity.toUpperCase()}</span>
                        </div>
                        <p className="text-sm text-gray-400">{inc.site_name} — {timeAgo(inc.created_at)}</p>
                        {inc.description && <p className="text-sm text-gray-500 mt-1 line-clamp-2">{inc.description}</p>}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
            {recentIncidents.filter((i) => i.severity !== 'critical' && i.severity !== 'high').slice(0, 4).map((inc) => {
              const cfg = severityConfig[inc.severity] || severityConfig.low;
              return (
                <div key={inc.id} className={`px-4 py-3 border-l-2 ${cfg.border} border-b border-white/5`}>
                  <div className="flex items-center gap-2">
                    <span className={`w-2 h-2 rounded-full ${cfg.dot}`}></span>
                    <span className="text-base font-medium text-white">{inc.incident_type}</span>
                    <span className="ml-auto text-xs text-gray-500">{timeAgo(inc.created_at)}</span>
                  </div>
                  <p className="text-sm text-gray-500 truncate mt-0.5">{inc.site_name}</p>
                </div>
              );
            })}
          </div>
        </div>
      </SpotlightCard>
    </div>
  );
}

// ... PatrolRiskView, AILiveView, SitesGridView stay the same ...

function PatrolRiskView({ patrolSummary, kpis, sites }: {
  patrolSummary: PatrolSummary[];
  kpis: DashboardKPIs;
  sites: DashboardSite[];
}) {
  return (
    <div className="h-full flex gap-4 px-6 py-4">
      <PanicDim className="w-1/2">
        <div className="bg-[#0f172a]/80 border border-white/10 rounded-xl overflow-hidden flex flex-col h-full">
          <div className="px-6 pt-4 pb-3 flex items-center gap-3">
            <PulsingDot color={kpis.patrolCompletion >= 90 ? 'bg-emerald-500' : 'bg-amber-500'} size="md" />
            <h2 className="text-xl font-bold text-white">Patrol Status</h2>
            <div className="ml-auto text-right">
              <div className={`text-2xl font-bold ${kpis.patrolCompletion >= 90 ? 'text-emerald-400' : 'text-amber-400'}`}>{kpis.patrolCompletion}%</div>
              <div className="text-xs text-gray-500">completion rate</div>
            </div>
          </div>
          <div className="flex-1 overflow-y-auto px-6 pb-4">
            <div className="grid grid-cols-2 gap-3">
              {patrolSummary.map((p) => {
                const cfg = patrolConfig[p.status];
                const pct = p.checkpoints_total > 0 ? Math.round((p.checkpoints_completed / p.checkpoints_total) * 100) : 0;
                return (
                  <div key={p.site_name} className="bg-white/5 border border-white/10 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-base font-medium text-white truncate">{p.site_name}</span>
                      <span className={`text-sm font-bold ${cfg.text}`}>{p.status.toUpperCase()}</span>
                    </div>
                    <div className="w-full h-3 bg-gray-800 rounded-full overflow-hidden mb-1">
                      <div className={`h-full ${cfg.bar} transition-all duration-1000`} style={{ width: `${pct}%` }}></div>
                    </div>
                    <div className="flex justify-between text-xs text-gray-500">
                      <span>{p.checkpoints_completed} / {p.checkpoints_total} checkpoints</span>
                      <span>{pct}%</span>
                    </div>
                    {p.last_patrol_at && (
                      <p className="text-xs text-gray-600 mt-1">Last patrol: {timeAgo(p.last_patrol_at)}</p>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </PanicDim>

      <PanicDim className="w-1/2">
        <div className="bg-[#0f172a]/80 border border-white/10 rounded-xl overflow-hidden flex flex-col h-full">
          <div className="px-6 pt-4 pb-3 flex items-center gap-3">
            <PulsingDot color={kpis.avgRiskScore <= 30 ? 'bg-emerald-500' : kpis.avgRiskScore <= 60 ? 'bg-amber-500' : 'bg-red-500'} size="md" />
            <h2 className="text-xl font-bold text-white">Site Risk Overview</h2>
            <div className="ml-auto text-right">
              <div className={`text-2xl font-bold ${kpis.avgRiskScore <= 30 ? 'text-emerald-400' : kpis.avgRiskScore <= 60 ? 'text-amber-400' : 'text-red-400'}`}>{kpis.avgRiskScore}</div>
              <div className="text-xs text-gray-500">avg score /100</div>
            </div>
          </div>
          <div className="flex-1 overflow-y-auto px-6 pb-4">
            <div className="grid grid-cols-3 gap-3 mb-4">
              {[
                { label: 'Low', count: sites.filter((s) => (s.risk_level || 'low') === 'low').length, color: 'text-emerald-400', bg: 'bg-emerald-500' },
                { label: 'Medium', count: sites.filter((s) => s.risk_level === 'medium').length, color: 'text-amber-400', bg: 'bg-amber-500' },
                { label: 'High/Critical', count: sites.filter((s) => s.risk_level === 'high' || s.risk_level === 'critical').length, color: 'text-red-400', bg: 'bg-red-500' },
              ].map((c) => (
                <div key={c.label} className="bg-white/5 border border-white/10 rounded-lg p-3 text-center">
                  <div className={`text-2xl font-bold ${c.color}`}>{c.count}</div>
                  <div className="text-xs text-gray-500">{c.label}</div>
                </div>
              ))}
            </div>
            <div className="space-y-2">
              {sites.map((site) => {
                const level = (site.risk_level || 'low').toLowerCase();
                const cfg = riskConfig[level] || riskConfig.low;
                return (
                  <div key={site.id} className="flex items-center gap-3 bg-white/5 border border-white/10 rounded-lg p-3">
                    <span className={`w-3 h-3 rounded-full ${cfg.dot} shrink-0`}></span>
                    <span className="text-base text-white truncate flex-1">{site.site_name}</span>
                    <span className={`text-sm font-bold ${cfg.color} shrink-0`}>{level.charAt(0).toUpperCase() + level.slice(1)}</span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </PanicDim>
    </div>
  );
}

function AILiveView({ aiAlerts, liveOccurrences }: {
  aiAlerts: AIAlert[];
  liveOccurrences: LiveOccurrence[];
}) {
  return (
    <div className="h-full flex gap-4 px-6 py-4">
      <SpotlightCard essential className="w-2/5" severity="high">
        <div className="bg-[#0f172a]/80 border border-white/10 rounded-xl overflow-hidden flex flex-col h-full">
          <div className="px-6 pt-4 pb-3 flex items-center gap-3">
            <PulsingDot color="bg-purple-500" size="md" />
            <h2 className="text-xl font-bold text-white">AI Insights</h2>
            <span className="ml-auto text-lg font-bold text-purple-400">{aiAlerts.length}</span>
          </div>
          <div className="flex-1 overflow-y-auto px-6 pb-4">
            <div className="space-y-3">
              {aiAlerts.map((a) => {
                const detail = a.details?.narrative || a.details?.summary || a.details?.message || a.action_type;
                const color = a.severity === 'critical' ? 'text-red-400' : a.severity === 'high' ? 'text-orange-400' : a.severity === 'medium' ? 'text-amber-400' : 'text-blue-400';
                const borderColor = a.severity === 'critical' ? 'border-red-500/30' : a.severity === 'high' ? 'border-orange-500/30' : 'border-white/10';
                return (
                  <div key={a.id} className={`bg-white/5 border ${borderColor} rounded-lg p-4 ${a.severity === 'critical' ? 'animate-flash-critical' : ''}`}>
                    <div className="flex items-center gap-2 mb-1">
                      <span className={`w-2.5 h-2.5 rounded-full ${a.severity === 'critical' ? 'bg-red-500' : a.severity === 'high' ? 'bg-orange-500' : a.severity === 'medium' ? 'bg-amber-500' : 'bg-blue-500'}`}></span>
                      <span className={`text-sm font-bold ${color}`}>{a.action_type.replace(/_/g, ' ')}</span>
                    </div>
                    <p className="text-sm text-gray-400">{detail}</p>
                    <span className="text-xs text-gray-600">{timeAgo(a.created_at)}</span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </SpotlightCard>

      <PanicDim className="w-3/5">
        <div className="bg-[#0f172a]/80 border border-white/10 rounded-xl overflow-hidden flex flex-col h-full">
          <div className="px-6 pt-4 pb-3 flex items-center gap-3">
            <PulsingDot color="bg-emerald-500" size="md" />
            <h2 className="text-xl font-bold text-white">Live Activity Feed</h2>
          </div>
          <div className="flex-1 overflow-y-auto px-6 pb-4">
            <div className="space-y-1">
              {liveOccurrences.map((o) => (
                <div key={o.id} className="flex items-start gap-4 py-2 border-b border-white/5">
                  <div className="text-xs text-gray-600 shrink-0 w-20 pt-0.5">{timeAgo(o.created_at)}</div>
                  <div className="text-xs text-gray-500 shrink-0 w-28 truncate pt-0.5">{o.site_name}</div>
                  <div className="text-sm text-gray-300 flex-1">{o.entry}</div>
                  <div className="text-xs text-gray-600 shrink-0">{o.guard_first_name} {o.guard_last_name || ''}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </PanicDim>
    </div>
  );
}

function SitesGridView({ sites }: { sites: DashboardSite[] }) {
  const siteStatus = (s: DashboardSite) => {
    if (s.critical_incidents > 0) return { dot: 'bg-red-500', label: 'Alert', text: 'text-red-400' };
    if (!s.shift_id) return { dot: 'bg-gray-500', label: 'No shift', text: 'text-gray-500' };
    if (s.patrol_status === 'missed') return { dot: 'bg-red-500', label: 'Missed patrol', text: 'text-red-400' };
    if (s.guard_first_name) return { dot: 'bg-emerald-500', label: 'All clear', text: 'text-emerald-400' };
    return { dot: 'bg-amber-500', label: 'Unassigned', text: 'text-amber-400' };
  };

  return (
    <div className="h-full px-6 py-4">
      <div className="bg-[#0f172a]/80 border border-white/10 rounded-xl h-full overflow-hidden flex flex-col">
        <div className="px-6 pt-4 pb-3 flex items-center gap-3">
          <PulsingDot color="bg-blue-500" size="md" />
          <h2 className="text-xl font-bold text-white">All Sites — {sites.length} total</h2>
        </div>
        <div className="flex-1 overflow-y-auto px-6 pb-4">
          <div className="grid grid-cols-4 gap-3">
            {sites.map((site) => {
              const st = siteStatus(site);
              const level = (site.risk_level || 'low').toLowerCase();
              const rcfg = riskConfig[level] || riskConfig.low;
              return (
                <div key={site.id} className={`bg-white/5 border ${site.critical_incidents > 0 ? 'border-red-500/30 animate-flash-critical' : 'border-white/10'} rounded-lg p-3`}>
                  <div className="flex items-center gap-2 mb-1">
                    <PulsingDot color={st.dot} />
                    <span className="text-base font-medium text-white truncate">{site.site_name}</span>
                  </div>
                  <div className="flex items-center justify-between text-xs">
                    <span className={`${st.text} font-medium`}>{st.label}</span>
                    <span className={`${rcfg.color}`}>Risk: {level}</span>
                  </div>
                  {site.guard_first_name && (
                    <p className="text-xs text-gray-500 mt-1">Guard: {site.guard_first_name} {site.guard_last_name || ''}</p>
                  )}
                  {site.critical_incidents > 0 && (
                    <p className="text-xs text-red-400 font-medium mt-1">{site.critical_incidents} critical incident{site.critical_incidents > 1 ? 's' : ''}</p>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function OpsRoomPage() {
  const { currentUser, profile, isLoading: authLoading } = useAuth();
  const router = useRouter();
  const {
    kpis, sites, recentIncidents, liveOccurrences, aiAlerts,
    guardsOnShift, missingGuards, patrolSummary, staffingAlerts,
    error, lastUpdated, refetch,
  } = useDashboard();

  const { triggerPanicMode, disablePanicMode, panicMode } = usePanicMode();

  const [currentView, setCurrentView] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [showControls, setShowControls] = useState(false);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const progressRef = useRef(0);

  useEffect(() => {
    if (!authLoading) {
      if (!currentUser) {
        router.replace('/login');
      } else if (profile && !['super_admin', 'company_admin', 'operations_manager'].includes(profile.role)) {
        if (profile.role === 'guard') router.replace('/guard');
        else if (profile.role === 'client') router.replace('/client');
      }
    }
  }, [currentUser, profile, authLoading, router]);

  // Auto-rotation
  useEffect(() => {
    if (isPaused || panicMode) return;
    const duration = VIEWS[currentView].duration * 1000;
    progressRef.current = 0;

    const tick = setInterval(() => {
      progressRef.current += 100;
      if (progressRef.current >= duration) {
        setCurrentView((prev) => (prev + 1) % VIEWS.length);
      }
    }, 100);

    timerRef.current = tick;
    return () => clearInterval(tick);
  }, [currentView, isPaused, panicMode]);

  // Keyboard shortcuts
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.code === 'Space') {
        e.preventDefault();
        setIsPaused((p) => !p);
      }
      if (e.code === 'ArrowRight') {
        setCurrentView((prev) => (prev + 1) % VIEWS.length);
      }
      if (e.code === 'ArrowLeft') {
        setCurrentView((prev) => (prev - 1 + VIEWS.length) % VIEWS.length);
      }
      if (e.key === 'f' || e.key === 'F') {
        if (document.fullscreenElement) {
          document.exitFullscreen();
        } else {
          document.documentElement.requestFullscreen();
        }
      }
      if (e.key === 'p' || e.key === 'P') {
        e.preventDefault();
        if (panicMode) {
          disablePanicMode();
        } else if (kpis.highCriticalIncidents > 0 || kpis.openIncidents > 0) {
          triggerPanicMode();
        }
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [panicMode, kpis.highCriticalIncidents, kpis.openIncidents, triggerPanicMode, disablePanicMode]);

  if (authLoading || !currentUser) {
    return (
      <div className="h-screen w-screen bg-[#050812] flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <PulsingDot color="bg-blue-500" size="lg" />
          <p className="text-sm text-gray-500">Loading ops room...</p>
        </div>
      </div>
    );
  }

  const viewProps = {
    kpis, sites, recentIncidents, liveOccurrences, aiAlerts,
    guardsOnShift, missingGuards, patrolSummary, staffingAlerts,
  };

  return (
    <div className="h-screen w-screen flex flex-col bg-[#050812]">
      {/* Header status bar */}
      <StatusBar kpis={kpis} />

      {/* Panic indicator in status bar */}
      {panicMode && (
        <div className="bg-red-950/80 border-b border-red-500/40 px-6 py-1.5 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <PulsingDot color="bg-red-500" />
            <span className="text-xs font-bold text-red-400 uppercase tracking-wider">Panic Mode — Incidents Spotlighted</span>
          </div>
          <button
            onClick={disablePanicMode}
            className="text-xs text-red-300 hover:text-red-200 font-medium cursor-pointer"
          >
            Press P to exit
          </button>
        </div>
      )}

      {/* Main view area */}
      <div className="flex-1 min-h-0">
        {currentView === 0 && <OverviewView {...viewProps} />}
        {currentView === 1 && <GuardsIncidentsView guardsOnShift={guardsOnShift} missingGuards={missingGuards} recentIncidents={recentIncidents} kpis={kpis} />}
        {currentView === 2 && <PatrolRiskView patrolSummary={patrolSummary} kpis={kpis} sites={sites} />}
        {currentView === 3 && <AILiveView aiAlerts={aiAlerts} liveOccurrences={liveOccurrences} />}
        {currentView === 4 && <SitesGridView sites={sites} />}
      </div>

      {/* Bottom ticker */}
      <OpsRoomTicker incidents={recentIncidents} kpis={kpis} />

      {/* View navigation dots + controls */}
      <div
        className="px-6 py-2 bg-[#0a0e1a] border-t border-white/5 flex items-center justify-between"
        onMouseEnter={() => setShowControls(true)}
        onMouseLeave={() => setShowControls(false)}
      >
        <div className="flex items-center gap-2">
          <span className="text-xs text-gray-600 font-semibold tracking-wider">VIEW</span>
          {VIEWS.map((v, i) => (
            <button
              key={v.id}
              onClick={() => setCurrentView(i)}
              className={`px-3 py-1 rounded-full text-xs font-medium transition-all cursor-pointer whitespace-nowrap ${
                i === currentView ? 'bg-white/15 text-white' : 'text-gray-600 hover:text-gray-400'
              }`}
            >
              {v.label}
            </button>
          ))}
          <button
            onClick={() => setIsPaused(!isPaused)}
            className={`ml-2 px-2 py-1 rounded-full text-xs font-medium transition-all cursor-pointer ${isPaused ? 'bg-amber-500/20 text-amber-400' : 'text-gray-600 hover:text-gray-400'}`}
          >
            {isPaused ? 'Paused' : 'Auto'}
          </button>

          {/* Panic mode toggle in ops room footer */}
          {(kpis.highCriticalIncidents > 0 || kpis.openIncidents > 0) && !panicMode && (
            <button
              onClick={triggerPanicMode}
              className="ml-2 px-2 py-1 rounded-full text-xs font-medium transition-all cursor-pointer bg-red-500/10 text-red-400 hover:bg-red-500/20"
            >
              Panic
            </button>
          )}
          {panicMode && (
            <button
              onClick={disablePanicMode}
              className="ml-2 px-2 py-1 rounded-full text-xs font-medium transition-all cursor-pointer bg-red-500/20 text-red-300 hover:bg-red-500/30"
            >
              Exit Panic
            </button>
          )}
        </div>

        <div className={`flex items-center gap-3 transition-opacity ${showControls ? 'opacity-100' : 'opacity-0'}`}>
          <span className="text-xs text-gray-600">Space = pause | ← → = switch | F = fullscreen | P = panic</span>
          <Link href="/dashboard" className="text-xs text-blue-400 hover:text-blue-300 cursor-pointer">
            Exit ops room
          </Link>
          <span className="text-xs text-gray-700">Updated {lastUpdated ? timeAgo(lastUpdated.toISOString()) : 'never'}</span>
        </div>
      </div>

      {error && (
        <div className="absolute top-16 left-1/2 -translate-x-1/2 px-4 py-2 bg-red-500/20 border border-red-500/30 rounded-lg text-sm text-red-400 z-50">
          {error}
        </div>
      )}

      <AITooledOperationsCopilot />

      <style jsx global>{`
        @keyframes slideIn {
          from { opacity: 0; transform: translateY(-12px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes flashCritical {
          0%, 100% { box-shadow: 0 0 0 0 rgba(239, 68, 68, 0); }
          50% { box-shadow: 0 0 30px 6px rgba(239, 68, 68, 0.25); }
        }
        .animate-flash-critical {
          animation: flashCritical 2s ease-in-out infinite;
        }
        @keyframes pulseRedBanner {
          0%, 100% { border-color: rgba(239, 68, 68, 0.6); }
          50% { border-color: rgba(239, 68, 68, 1); }
        }
        .animate-pulse-red-banner {
          animation: pulseRedBanner 1.5s ease-in-out infinite;
        }
        @keyframes panicGlow {
          0%, 100% { border-color: rgba(239, 68, 68, 0.1); }
          50% { border-color: rgba(239, 68, 68, 0.35); }
        }
        .animate-panic-glow {
          animation: panicGlow 2s ease-in-out infinite;
        }
        @keyframes spotlightPulse {
          0%, 100% { box-shadow: 0 0 40px rgba(239, 68, 68, 0.08); }
          50% { box-shadow: 0 0 60px rgba(239, 68, 68, 0.2); }
        }
        .animate-spotlight-pulse {
          animation: spotlightPulse 2.5s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
}