'use client';

import Link from 'next/link';
import { useState } from 'react';
import type { RecentIncident, AIAlert, GuardOnShift, MissingGuard, PatrolSummary, StaffingAlert } from '@/lib/useDashboard';
import type { Notification } from '@/lib/useNotifications';
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
};

export default function PriorityAlertFeed(props: PriorityAlertFeedProps) {
  const { incidents, notifications, aiAlerts, tickets, patrolSummary, missingGuards, guardsOnShift, staffingAlerts } = props;
  const [filter, setFilter] = useState<'all' | 'critical' | 'high' | 'medium'>('all');

  const alerts: UnifiedAlert[] = [
    ...incidents.map(i => ({
      id: `inc-${i.id}`,
      type: 'incident',
      title: i.incident_type,
      description: `${i.site_name} — ${i.status}`,
      severity: mapSeverity(i.severity),
      timestamp: i.created_at,
      link: `/incidents/${i.id}`,
      source: 'Incident',
      meta: i.severity,
    })),
    ...notifications.map(n => ({
      id: `notif-${n.id}`,
      type: 'notification',
      title: n.title,
      description: n.body || '',
      severity: mapSeverity(n.severity),
      timestamp: n.created_at,
      link: n.link || '#',
      source: 'Notification',
    })),
    ...aiAlerts.filter(a => !a.dismissed).map(a => ({
      id: `ai-${a.id}`,
      type: 'ai',
      title: a.action_type.replace(/_/g, ' '),
      description: a.details?.narrative || a.details?.summary || a.details?.message || '',
      severity: mapSeverity(a.severity),
      timestamp: a.created_at,
      link: a.details?.site_id ? `/sites/${a.details.site_id}` : '#',
      source: 'AI',
    })),
    ...tickets.filter(t => t.status !== 'closed' && t.status !== 'resolved').map(t => ({
      id: `ticket-${t.id}`,
      type: 'ticket',
      title: t.subject,
      description: `${getCategoryLabel(t.category)} — ${getStatusBadge(t.status).label}`,
      severity: mapSeverity(t.priority),
      timestamp: t.created_at,
      link: `/client/support/${t.id}`,
      source: 'Ticket',
    })),
    ...patrolSummary.filter(p => p.status === 'missed' || p.status === 'partial').map(p => ({
      id: `patrol-${p.site_name}`,
      type: 'patrol',
      title: `${p.site_name} — ${p.status} patrol`,
      description: `${p.checkpoints_completed}/${p.checkpoints_total} checkpoints`,
      severity: p.status === 'missed' ? 'high' : 'medium',
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
    ...guardsOnShift.filter(g => g.status === 'late' || g.status === 'critical_late').map(g => ({
      id: `late-${g.id}`,
      type: 'guard',
      title: `${g.name} — ${g.status === 'critical_late' ? 'Critical late' : 'Late'}`,
      description: `${g.site_name} — +${g.late_minutes}m late`,
      severity: g.status === 'critical_late' ? 'critical' : 'high',
      timestamp: g.clock_in,
      link: '/guards',
      source: 'Guard',
    })),
    ...staffingAlerts.map(s => ({
      id: `staffing-${s.site_name}-${s.shift_time}`,
      type: 'staffing',
      title: `${s.site_name} — understaffed`,
      description: `${s.guard_needed} guard needed`,
      severity: mapSeverity(s.severity),
      timestamp: s.shift_time,
      link: '/rotas',
      source: 'Rota',
    })),
  ];

  const severityOrder = { critical: 4, high: 3, medium: 2, low: 1 };

  alerts.sort((a, b) => {
    const diff = severityOrder[b.severity] - severityOrder[a.severity];
    if (diff !== 0) return diff;
    return new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime();
  });

  const filtered = filter === 'all' ? alerts : alerts.filter(a => a.severity === filter || (filter === 'high' && a.severity === 'high'));
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
          <h3 className="text-sm font-semibold text-white">Priority Alert Feed</h3>
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

      <div className="flex px-4 pb-2 gap-1">
        {(['all', 'critical', 'high', 'medium'] as const).map(f => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-2.5 py-0.5 rounded-full text-[10px] font-medium transition-all cursor-pointer whitespace-nowrap ${filter === f ? 'bg-white/10 text-white' : 'text-gray-500 hover:text-gray-300'}`}
          >
            {f === 'all' ? 'All' : f.charAt(0).toUpperCase() + f.slice(1)}
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