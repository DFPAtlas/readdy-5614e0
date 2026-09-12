'use client';

import { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth';
import { useNotifications } from '@/lib/useNotifications';
import Link from 'next/link';

function timeAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 1) return 'Just now';
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  const d = Math.floor(h / 24);
  if (d < 7) return `${d}d ago`;
  return new Date(iso).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' });
}

function severityColor(severity: string): string {
  if (severity === 'critical') return 'border-l-red-500';
  if (severity === 'warning') return 'border-l-amber-500';
  return 'border-l-gray-600';
}

function typeIcon(type: string): string {
  if (type === 'incident_critical' || type === 'panic_alert' || type === 'sos_alert') return 'ri-alarm-warning-line text-red-400';
  if (type === 'incident_created') return 'ri-error-warning-line text-orange-400';
  if (type === 'shift_unfilled') return 'ri-calendar-line text-blue-400';
  if (type === 'shift_cover_offer') return 'ri-hand-heart-line text-blue-400';
  if (type === 'sia_expiring' || type === 'compliance_expiring') return 'ri-file-shield-line text-yellow-400';
  if (type === 'message_received') return 'ri-chat-3-line text-teal-400';
  if (type === 'report_ready' || type === 'weekly_report_ready') return 'ri-file-list-3-line text-emerald-400';
  if (type === 'risk_score_increased') return 'ri-line-chart-line text-amber-400';
  if (type === 'patrol_missed') return 'ri-route-line text-amber-400';
  if (type === 'guard_no_bookon') return 'ri-user-unfollow-line text-red-400';
  if (type === 'ticket_new' || type === 'ticket_reply') return 'ri-customer-service-line text-indigo-400';
  if (type === 'payment_failed' || type === 'payment_upgraded') return 'ri-bank-card-line text-purple-400';
  if (type === 'agent_failed') return 'ri-robot-line text-red-400';
  if (type === 'lone_worker_overdue') return 'ri-timer-line text-red-400';
  if (type === 'shift_changed' || type === 'shift_assigned') return 'ri-calendar-event-line text-blue-400';
  if (type === 'cover_offer_received') return 'ri-hand-heart-line text-pink-400';
  return 'ri-information-line text-gray-400';
}

function typeBg(type: string): string {
  if (type === 'incident_critical' || type === 'panic_alert' || type === 'sos_alert') return 'bg-red-500/10';
  if (type === 'incident_created') return 'bg-orange-500/10';
  if (type === 'shift_unfilled') return 'bg-blue-500/10';
  if (type === 'shift_cover_offer') return 'bg-blue-500/10';
  if (type === 'sia_expiring' || type === 'compliance_expiring') return 'bg-yellow-500/10';
  if (type === 'message_received') return 'bg-teal-500/10';
  if (type === 'report_ready' || type === 'weekly_report_ready') return 'bg-emerald-500/10';
  if (type === 'risk_score_increased') return 'bg-amber-500/10';
  if (type === 'patrol_missed') return 'bg-amber-500/10';
  if (type === 'guard_no_bookon') return 'bg-red-500/10';
  if (type === 'ticket_new' || type === 'ticket_reply') return 'bg-indigo-500/10';
  if (type === 'payment_failed') return 'bg-red-500/10';
  if (type === 'payment_upgraded') return 'bg-purple-500/10';
  if (type === 'agent_failed') return 'bg-red-500/10';
  if (type === 'lone_worker_overdue') return 'bg-red-500/10';
  if (type === 'shift_changed' || type === 'shift_assigned') return 'bg-blue-500/10';
  if (type === 'cover_offer_received') return 'bg-pink-500/10';
  return 'bg-gray-500/10';
}

const NOTIF_TYPES = [
  { key: 'incident_critical', label: 'Critical Incidents' },
  { key: 'incident_created', label: 'New Incidents' },
  { key: 'sos_alert', label: 'SOS Alerts' },
  { key: 'panic_alert', label: 'Panic Alerts' },
  { key: 'lone_worker_overdue', label: 'Lone Worker Overdue' },
  { key: 'patrol_missed', label: 'Missed Patrols' },
  { key: 'guard_no_bookon', label: 'Guard No-Show' },
  { key: 'shift_unfilled', label: 'Shifts Unfilled' },
  { key: 'shift_changed', label: 'Shift Changes' },
  { key: 'shift_assigned', label: 'Shift Assigned' },
  { key: 'shift_cover_offer', label: 'Cover Offers' },
  { key: 'cover_offer_received', label: 'Cover Offer Received' },
  { key: 'sia_expiring', label: 'SIA Expiring' },
  { key: 'compliance_expiring', label: 'Compliance Expiring' },
  { key: 'message_received', label: 'Messages' },
  { key: 'ticket_new', label: 'New Support Ticket' },
  { key: 'ticket_reply', label: 'Support Reply' },
  { key: 'report_ready', label: 'Reports Ready' },
  { key: 'weekly_report_ready', label: 'Weekly Report Ready' },
  { key: 'risk_score_increased', label: 'Risk Score Increase' },
  { key: 'payment_failed', label: 'Payment Failed' },
  { key: 'payment_upgraded', label: 'Subscription Upgrade' },
  { key: 'agent_failed', label: 'Agent Failure' },
];

const PAGE_SIZE = 50;

export default function DashboardNotificationsPage() {
  const { profile } = useAuth();
  const {
    notifications,
    unreadCount,
    loading,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    clearAllRead,
  } = useNotifications(profile?.id || null);

  const [tab, setTab] = useState<'all' | 'unread' | 'by_type'>('all');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [timeFilter, setTimeFilter] = useState<'today' | 'week' | 'month' | 'all'>('all');
  const [page, setPage] = useState(0);
  const [hoveredId, setHoveredId] = useState<string | null>(null);

  const now = Date.now();
  const cutoff = useMemo(() => {
    if (timeFilter === 'today') return now - 24 * 60 * 60 * 1000;
    if (timeFilter === 'week') return now - 7 * 24 * 60 * 60 * 1000;
    if (timeFilter === 'month') return now - 30 * 24 * 60 * 60 * 1000;
    return 0;
  }, [timeFilter]);

  const filtered = useMemo(() => {
    let list = notifications;
    if (tab === 'unread') list = list.filter((n) => !n.read_at);
    if (tab === 'by_type' && typeFilter !== 'all') list = list.filter((n) => n.type === typeFilter);
    if (cutoff > 0) list = list.filter((n) => new Date(n.created_at).getTime() >= cutoff);
    return list;
  }, [notifications, tab, typeFilter, cutoff]);

  const paged = filtered.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE);
  const totalPages = Math.ceil(filtered.length / PAGE_SIZE);

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Notification Centre</h1>
          <p className="text-sm text-gray-500 mt-1">
            {unreadCount > 0 ? `${unreadCount} unread` : 'All caught up'}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Link
            href="/dashboard/settings?tab=notifications"
            className="text-sm text-gray-400 hover:text-white transition-colors cursor-pointer whitespace-nowrap flex items-center gap-1.5"
          >
            <div className="w-4 h-4 flex items-center justify-center"><i className="ri-settings-3-line"></i></div>
            Preferences
          </Link>
        </div>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex bg-gray-800/60 rounded-lg p-1">
          {(['all', 'unread', 'by_type'] as const).map((t) => (
            <button
              key={t}
              onClick={() => { setTab(t); setPage(0); }}
              className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors cursor-pointer whitespace-nowrap ${
                tab === t ? 'bg-gray-700 text-white' : 'text-gray-400 hover:text-gray-300'
              }`}
            >
              {t === 'by_type' ? 'By Type' : t.charAt(0).toUpperCase() + t.slice(1)}
              {t === 'unread' && unreadCount > 0 && (
                <span className="ml-1.5 bg-red-500 text-white text-[10px] px-1.5 rounded-full">
                  {unreadCount > 99 ? '99+' : unreadCount}
                </span>
              )}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-2">
          {tab === 'by_type' && (
            <div className="flex items-center gap-1 bg-gray-800/40 rounded-lg px-2 py-1 flex-wrap">
              <div className="w-3 h-3 flex items-center justify-center text-gray-500"><i className="ri-filter-3-line text-[10px]"></i></div>
              {NOTIF_TYPES.slice(0, 8).map((t) => (
                <button
                  key={t.key}
                  onClick={() => { setTypeFilter(t.key); setPage(0); }}
                  className={`px-2 py-1 rounded text-[11px] font-medium cursor-pointer whitespace-nowrap transition-colors ${
                    typeFilter === t.key ? 'bg-gray-700 text-white' : 'text-gray-500 hover:text-gray-300'
                  }`}
                >
                  {t.label}
                </button>
              ))}
              <button
                onClick={() => { setTypeFilter('all'); setPage(0); }}
                className={`px-2 py-1 rounded text-[11px] font-medium cursor-pointer whitespace-nowrap transition-colors ${
                  typeFilter === 'all' ? 'bg-gray-700 text-white' : 'text-gray-500 hover:text-gray-300'
                }`}
              >
                All
              </button>
            </div>
          )}

          <div className="flex items-center bg-gray-800/40 rounded-lg px-3 py-1.5 gap-2">
            <div className="w-3 h-3 flex items-center justify-center text-gray-500"><i className="ri-time-line text-[10px]"></i></div>
            {(['today', 'week', 'month', 'all'] as const).map((tf) => (
              <button
                key={tf}
                onClick={() => { setTimeFilter(tf); setPage(0); }}
                className={`text-[11px] font-medium cursor-pointer whitespace-nowrap transition-colors ${
                  timeFilter === tf ? 'text-white' : 'text-gray-500 hover:text-gray-300'
                }`}
              >
                {tf.charAt(0).toUpperCase() + tf.slice(1)}
              </button>
            ))}
          </div>

          {unreadCount > 0 && (
            <button
              onClick={() => markAllAsRead()}
              className="text-xs text-blue-400 hover:text-blue-300 transition-colors cursor-pointer whitespace-nowrap px-3 py-2"
            >
              Mark all read
            </button>
          )}
          <button
            onClick={() => clearAllRead()}
            className="text-xs text-gray-500 hover:text-red-400 transition-colors cursor-pointer whitespace-nowrap px-3 py-2"
          >
            Clear read
          </button>
        </div>
      </div>

      {loading ? (
        <div className="py-20 text-center">
          <i className="ri-loader-4-line animate-spin text-blue-500 text-2xl"></i>
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-20">
          <div className="w-16 h-16 mx-auto mb-4 flex items-center justify-center rounded-xl bg-gray-800/50">
            <div className="w-8 h-8 flex items-center justify-center">
              <i className="ri-check-double-line text-gray-500 text-2xl"></i>
            </div>
          </div>
          <p className="text-lg font-medium text-gray-400">
            {tab === 'unread' ? "You're all caught up" : tab === 'by_type' && typeFilter !== 'all' ? 'No notifications of this type' : 'No notifications yet'}
          </p>
          <p className="text-sm text-gray-600 mt-1">
            {tab === 'unread' ? 'Nothing unread right now' : 'Notifications will appear here as events happen'}
          </p>
        </div>
      ) : (
        <div className="space-y-1">
          {paged.map((n) => {
            const isUnread = !n.read_at;
            const isHovered = hoveredId === n.id;

            const Row = (
              <div
                onMouseEnter={() => setHoveredId(n.id)}
                onMouseLeave={() => setHoveredId(null)}
                className={`flex items-start gap-4 px-4 py-4 rounded-xl transition-colors border-l-2 ${severityColor(n.severity)} ${
                  isUnread ? 'bg-white/[0.04]' : 'hover:bg-white/[0.02]'
                }`}
              >
                <div className={`w-10 h-10 rounded-lg flex-shrink-0 flex items-center justify-center ${typeBg(n.type)}`}>
                  <div className="w-5 h-5 flex items-center justify-center">
                    <i className={typeIcon(n.type)}></i>
                  </div>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <p className={`text-sm ${isUnread ? 'font-semibold text-white' : 'text-gray-300'}`}>
                      {n.title}
                    </p>
                    <span className="text-[11px] text-gray-600 flex-shrink-0">
                      {timeAgo(n.created_at)}
                    </span>
                  </div>
                  {n.body && (
                    <p className="text-sm text-gray-500 mt-1">{n.body}</p>
                  )}
                  <div className="flex items-center gap-2 mt-2">
                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-gray-800 text-gray-500 uppercase tracking-wider">
                      {n.type.replace(/_/g, ' ')}
                    </span>
                    {n.severity !== 'info' && (
                      <span className={`text-[10px] px-1.5 py-0.5 rounded font-medium ${
                        n.severity === 'critical' ? 'bg-red-500/10 text-red-400' : 'bg-amber-500/10 text-amber-400'
                      }`}>
                        {n.severity}
                      </span>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-1 flex-shrink-0">
                  {isUnread && (
                    <div className="w-2.5 h-2.5 rounded-full bg-blue-400"></div>
                  )}
                  {isHovered && (
                    <div className="flex items-center gap-1">
                      {isUnread && (
                        <button
                          onClick={(e) => { e.stopPropagation(); markAsRead(n.id); }}
                          className="w-7 h-7 flex items-center justify-center rounded-md hover:bg-gray-700/50 text-gray-400 hover:text-white transition-colors cursor-pointer"
                          title="Mark as read"
                        >
                          <div className="w-4 h-4 flex items-center justify-center"><i className="ri-mail-check-line text-xs"></i></div>
                        </button>
                      )}
                      <button
                        onClick={(e) => { e.stopPropagation(); deleteNotification(n.id); }}
                        className="w-7 h-7 flex items-center justify-center rounded-md hover:bg-red-500/10 text-gray-400 hover:text-red-400 transition-colors cursor-pointer"
                        title="Delete"
                      >
                        <div className="w-4 h-4 flex items-center justify-center"><i className="ri-delete-bin-line text-xs"></i></div>
                      </button>
                    </div>
                  )}
                </div>
              </div>
            );

            if (n.link) {
              return (
                <Link key={n.id} href={n.link} className="block">
                  {Row}
                </Link>
              );
            }
            return <div key={n.id}>{Row}</div>;
          })}
        </div>
      )}

      {totalPages > 1 && (
        <div className="flex items-center justify-between pt-4">
          <p className="text-xs text-gray-600">
            Showing {page * PAGE_SIZE + 1}-{Math.min((page + 1) * PAGE_SIZE, filtered.length)} of {filtered.length}
          </p>
          <div className="flex items-center gap-1">
            <button
              onClick={() => setPage((p) => Math.max(0, p - 1))}
              disabled={page === 0}
              className="w-8 h-8 flex items-center justify-center rounded-md text-gray-400 hover:bg-gray-800 disabled:opacity-30 cursor-pointer"
            >
              <div className="w-4 h-4 flex items-center justify-center"><i className="ri-arrow-left-s-line"></i></div>
            </button>
            {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
              let idx: number;
              if (totalPages <= 5) idx = i;
              else if (page < 3) idx = i;
              else if (page > totalPages - 4) idx = totalPages - 5 + i;
              else idx = page - 2 + i;
              return (
                <button
                  key={idx}
                  onClick={() => setPage(idx)}
                  className={`w-8 h-8 flex items-center justify-center rounded-md text-xs font-medium cursor-pointer ${
                    page === idx ? 'bg-gray-700 text-white' : 'text-gray-400 hover:bg-gray-800'
                  }`}
                >
                  {idx + 1}
                </button>
              );
            })}
            <button
              onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
              disabled={page === totalPages - 1}
              className="w-8 h-8 flex items-center justify-center rounded-md text-gray-400 hover:bg-gray-800 disabled:opacity-30 cursor-pointer"
            >
              <div className="w-4 h-4 flex items-center justify-center"><i className="ri-arrow-right-s-line"></i></div>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}