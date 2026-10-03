'use client';

import Link from 'next/link';
import { useState } from 'react';
import type { RecentIncident, AIAlert, GuardOnShift, MissingGuard, PatrolSummary, StaffingAlert } from '@/lib/useDashboard';
import type { Notification } from '@/lib/useNotifications';
import type { LoneWorkerAlert, AgentHealth } from '@/lib/useCommandCentreExtended';
import { getCategoryLabel, getStatusBadge } from '@/lib/useSupportTickets';
import type { SupportTicket } from '@/lib/useSupportTickets';

interface UnifiedAlert {
  id: string;
  type: string;
  title: string;
  description: string;
  severity: 'critical' | 'high' | 'medium' | 'low';
  timestamp: string;
  link: string;
  source: string;
  meta?: string;
}

interface PriorityAlertFeedProps {
  incidents: RecentIncident[];
  notifications: Notification[];
  aiAlerts: AIAlert[];
  tickets: SupportTicket[];
  patrolSummary: PatrolSummary[];
  missingGuards: MissingGuard[];
  guardsOnShift: GuardOnShift[];
  staffingAlerts: StaffingAlert[];
  loneWorkerAlerts: LoneWorkerAlert[];
  agentHealth: AgentHealth | null;
}

function mapSeverity(source: string): 'critical' | 'high' | 'medium' | 'low' {
  const s = source?.toLowerCase() || '';
  if (s === 'critical' || s === 'urgent') return 'critical';
  if (s === 'high' || s === 'warning' || s === 'alert') return 'high';
  if (s === 'medium' || s === 'info' || s === 'open') return 'medium';
  return 'low';
}

function timeAgo(iso: string): string {
  const diff = Math.floor((Date.now() - new Date(iso).getTime()) / 1000);
  if (diff < 60) return 'Just now';
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return `${Math.floor(diff / 86400)}d ago`;
}

const severityStyles = {
  critical: { border: 'border-l-red-500', dot: 'bg-red-500', badge: 'bg-red-500/10 text-red-400' },
  high: { border: 'border-l-orange-500', dot: 'bg-orange-500', badge: 'bg-orange-500/10 text-orange-400' },
  medium: { border: 'border-l-amber-500', dot: 'bg-amber-500', badge: 'bg-amber-500/10 text-amber-400' },
  low: { border: 'border-l-blue-500', dot: 'bg-blue-500', badge: 'bg-blue-500/10 text-blue-400' },
};

const typeIcons: Record<string, string> = {
  incident: 'ri-alarm-warning-line',
  notification: 'ri-notification-3-line',
  ai: 'ri-sparkling-line',
  ticket: 'ri-customer-service-2-line',
  patrol: 'ri-route-line',
  guard: 'ri-shield-user-line',
  staffing: 'ri-team-line',
  loneworker: 'ri-radar-line',
  agent: 'ri-robot-2-line',
  webhook: 'ri-link',
};

type FilterKey = 'all' | 'critical' | 'staffing' | 'incidents' | 'patrols' | 'ai';

const FILTERS: { key: FilterKey; label: string }[] = [
  { key: 'all', label: 'All' },
  { key: 'critical', label: 'Critical' },
  { key: 'staffing', label: 'Staffing' },
  { key: 'incidents', label: 'Incidents' },
  { key: 'patrols', label: 'Patrols' },
  { key: 'ai', label: 'AI' },
];

function matchesFilter(alert: UnifiedAlert, f: FilterKey): boolean {
  switch (f) {
    case 'critical':
      return alert.severity === 'critical';
    case 'staffing':
      return alert.type === 'staffing' || alert.type === 'guard';
    case 'incidents':
      return alert.type === 'incident';
    case 'patrols':
      return alert.type === 'patrol';
    case 'ai':
      return alert.type === 'ai' || alert.type === 'agent' || alert.type === 'webhook';
    default:
      return true;
  }
}

export default function PriorityAlertFeed(props: PriorityAlertFeedProps) {
  const { incidents, notifications, aiAlerts, tickets, patrolSummary, missingGuards, guardsOnShift, staffingAlerts, loneWorkerAlerts, agentHealth } = props;
  const [filter, setFilter] = useState<FilterKey>('all');

  const alerts: UnifiedAlert[] = [
    ...incidents.filter(i => i.severity === 'critical' || i.severity === 'high').map(i => ({
      id: `inc-${i.id}`,
      type: 'incident',
      title: i.incident_type,
      description: `${i.site_name} — ${i.status}`,
      severity: mapSeverity(i.severity),
      timestamp: i.created_at,
      link: `/incidents/detail?id=${i.id}`,
      source: 'Incident',
      meta: i.severity,
    })),
    ...loneWorkerAlerts.filter(a => a.alarm_triggered).map(a => ({
      id: `lw-${a.id}`,
      type: 'loneworker',
      title: `${a.guard_name} — Lone Worker Alarm`,
      description: a.site_name,
      severity: 'critical',
      timestamp: a.last_check_in_at || new Date().toISOString(),
      link: '/dashboard/lone-worker',
      source: 'Lone Worker',
    })),
    ...loneWorkerAlerts.filter(a => a.missed_check_ins > 0 && !a.alarm_triggered).map(a => ({
      id: `lw-miss-${a.id}`,
      type: 'loneworker',
      title: `${a.guard_name} — Missed check-in`,
      description: `${a.missed_check_ins} missed at ${a.site_name}`,
      severity: 'high',
      timestamp: a.next_check_in_due_at || new Date().toISOString(),
      link: '/dashboard/lone-worker',
      source: 'Lone Worker',
    })),
    ...notifications.filter(n => n.severity === 'critical').map(n => ({
      id: `notif-${n.id}`,
      type: 'notification',
      title: n.title,
      description: n.body || '',
      severity: mapSeverity(n.severity),
      timestamp: n.created_at,
      link: n.link || '#',
      source: 'Notification',
    })),
    ...aiAlerts.filter(a => !a.dismissed && (a.severity === 'critical' || a.severity === 'high')).map(a => ({
      id: `ai-${a.id}`,
      type: 'ai',
      title: a.action_type.replace(/_/g, ' '),
      description: a.details?.narrative || a.details?.summary || a.details?.message || '',
      severity: mapSeverity(a.severity),
      timestamp: a.created_at,
      link: a.details?.site_id ? `/sites/${a.details.site_id}` : '#',
      source: 'AI',
    })),
    ...tickets.filter(t => t.status !== 'closed' && t.status !== 'resolved' && (t.priority === 'urgent' || t.priority === 'high')).map(t => ({
      id: `ticket-${t.id}`,
      type: 'ticket',
      title: t.subject,
      description: `${getCategoryLabel(t.category)} — ${getStatusBadge(t.status).label}`,
      severity: mapSeverity(t.priority),
      timestamp: t.created_at,
      link: `/client/support/${t.id}`,
      source: 'Ticket',
    })),
    ...patrolSummary.filter(p => p.status === 'missed').map(p => ({
      id: `patrol-${p.site_name}`,
      type: 'patrol',
      title: `${p.site_name} — Missed patrol`,
      description: `${p.checkpoints_completed}/${p.checkpoints_total} checkpoints`,
      severity: 'high',
      timestamp: p.last_patrol_at || new Date().toISOString(),
      link: '/dashboard/patrol-monitoring',
      source: 'Patrol',
    })),
    ...missingGuards.map(g => ({
      id: `missing-${g.id}`,
      type: 'guard',
      title: `${g.name} — ${g.reason === 'no_clock_in' ? 'No clock-in' : 'Unassigned'}`,
      description: g.site_name,
      severity: 'high',
      timestamp: g.shift_start,
      link: '/guards',
      source: 'Guard',
    })),
    ...guardsOnShift.filter(g => g.status === 'critical_late').map(g => ({
      id: `late-${g.id}`,
      type: 'guard',
      title: `${g.name} — Critical late (+${g.late_minutes}m)`,
      description: g.site_name,
      severity: 'critical',
      timestamp: g.clock_in,
      link: '/guards',
      source: 'Guard',
    })),
    ...staffingAlerts.filter(s => s.severity === 'high').map(s => ({
      id: `staffing-${s.site_name}-${s.shift_time}`,
      type: 'staffing',
      title: `${s.site_name} — Understaffed`,
      description: `${s.guard_needed} guard needed`,
      severity: mapSeverity(s.severity),
      timestamp: s.shift_time,
      link: '/rotas',
      source: 'Rota',
    })),
    ...(agentHealth && agentHealth.failed_executions_24h > 0 ? [{
      id: 'agent-failures',
      type: 'agent',
      title: `Agent failures detected`,
      description: `${agentHealth.failed_executions_24h} execution(s) failed in the last 24 hours`,
      severity: 'high' as const,
      timestamp: agentHealth.last_execution_at || new Date().toISOString(),
      link: '/dashboard/command-centre',
      source: 'Agent',
    }] : []),
    ...(agentHealth && agentHealth.pending_webhook_events > 0 ? [{
      id: 'agent-webhooks-pending',
      type: 'webhook',
      title: `Stuck webhook events`,
      description: `${agentHealth.pending_webhook_events} webhook event(s) pending processing`,
      severity: 'medium' as const,
      timestamp: agentHealth.last_execution_at || new Date().toISOString(),
      link: '/dashboard/command-centre',
      source: 'Webhook',
    }] : []),
    ...(agentHealth && agentHealth.last_execution_status === 'failed' && agentHealth.failed_executions_24h === 0 ? [{
      id: 'agent-last-failed',
      type: 'agent',
      title: `Last agent execution failed`,
      description: `Most recent agent run did not complete successfully`,
      severity: 'medium' as const,
      timestamp: agentHealth.last_execution_at || new Date().toISOString(),
      link: '/dashboard/command-centre',
      source: 'Agent',
    }] : []),
  ];

  const severityOrder = { critical: 4, high: 3, medium: 2, low: 1 };

  alerts.sort((a, b) => {
    const diff = severityOrder[b.severity] - severityOrder[a.severity];
    if (diff !== 0) return diff;
    return new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime();
  });

  const filtered = filter === 'all' ? alerts : alerts.filter(a => matchesFilter(a, filter));
  const display = filtered.slice(0, 20);

  const criticalCount = alerts.filter(a => a.severity === 'critical').length;
  const highCount = alerts.filter(a => a.severity === 'high').length;

  return (
    <div className="bg-[#0f172a]/70 backdrop-blur-sm border border-white/10 shadow-sm rounded-xl overflow-hidden">
      <div className="flex items-center justify-between px-4 pt-4 pb-2">
        <div className="flex items-center gap-2">
          <div className="w-5 h-5 flex items-center justify-center text-red-400">
            <i className="ri-flashlight-line text-sm"></i>
          </div>
          <h3 className="text-sm font-semibold text-white">Priority Alerts</h3>
        </div>
        <div className="flex items-center gap-2">
          {criticalCount > 0 && (
            <span className="px-2 py-0.5 rounded-full bg-red-500/10 text-red-400 text-[10px] font-semibold">
              {criticalCount} critical
            </span>
          )}
          {highCount > 0 && (
            <span className="px-2 py-0.5 rounded-full bg-orange-500/10 text-orange-400 text-[10px] font-semibold">
              {highCount} high
            </span>
          )}
        </div>
      </div>

      <div className="flex flex-wrap px-4 pb-2 gap-1">
        {FILTERS.map(f => (
          <button
            key={f.key}
            onClick={() => setFilter(f.key)}
            className={`px-2.5 py-0.5 rounded-full text-[10px] font-medium transition-all cursor-pointer whitespace-nowrap ${filter === f.key ? 'bg-white/10 text-white' : 'text-gray-500 hover:text-gray-300'}`}
          >
            {f.label}
          </button>
        ))}
      </div>

      <div className="max-h-[32rem] overflow-y-auto">
        {display.length === 0 ? (
          <div className="px-4 pb-4 text-center text-xs text-gray-500 py-8">
            <div className="w-10 h-10 rounded-full bg-emerald-500/10 flex items-center justify-center mx-auto mb-3">
              <div className="w-5 h-5 flex items-center justify-center text-emerald-400">
                <i className="ri-check-line text-sm"></i>
              </div>
            </div>
            No active alerts. All clear.
          </div>
        ) : (
          display.map((alert) => {
            const style = severityStyles[alert.severity];
            const icon = typeIcons[alert.type] || 'ri-more-line';
            return (
              <Link key={alert.id} href={alert.link} className="block cursor-pointer">
                <div className={`px-4 py-3 border-t border-white/5 border-l-2 ${style.border} hover:bg-white/5 transition-all`}>
                  <div className="flex items-center gap-2 mb-1">
                    <div className="w-4 h-4 flex items-center justify-center text-gray-500">
                      <i className={`${icon} text-xs`}></i>
                    </div>
                    <span className="text-sm font-medium text-white truncate">{alert.title}</span>
                    <span className={`px-1.5 py-0.5 rounded text-[10px] font-medium ${style.badge} shrink-0 ml-auto`}>
                      {alert.severity}
                    </span>
                  </div>
                  <p className="text-xs text-gray-500 line-clamp-1">{alert.description}</p>
                  <div className="flex items-center gap-3 mt-1.5">
                    <span className="text-[10px] text-gray-600">{timeAgo(alert.timestamp)}</span>
                    <span className="text-[10px] text-gray-600">{alert.source}</span>
                    {alert.meta && <span className="text-[10px] text-gray-600">{alert.meta}</span>}
                  </div>
                </div>
              </Link>
            );
          })
        )}
      </div>
    </div>
  );
}