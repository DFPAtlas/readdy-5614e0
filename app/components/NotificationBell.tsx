'use client';

import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { useNotifications, type Notification } from '@/lib/useNotifications';

function timeAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 1) return 'Just now';
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  const d = Math.floor(h / 24);
  return `${d}d ago`;
}

function severityBorder(severity: string): string {
  if (severity === 'critical') return 'border-l-2 border-l-red-500';
  if (severity === 'warning') return 'border-l-2 border-l-amber-500';
  return 'border-l-2 border-l-gray-600';
}

function typeIcon(type: string): string {
  if (type === 'incident_critical' || type === 'panic_alert') return 'ri-alarm-warning-line text-red-400';
  if (type === 'incident_created') return 'ri-error-warning-line text-orange-400';
  if (type === 'shift_unfilled') return 'ri-calendar-line text-blue-400';
  if (type === 'sia_expiring') return 'ri-file-shield-line text-yellow-400';
  if (type === 'message_received') return 'ri-chat-3-line text-teal-400';
  if (type === 'report_ready') return 'ri-file-list-3-line text-emerald-400';
  if (type === 'risk_score_increased') return 'ri-line-chart-line text-amber-400';
  return 'ri-information-line text-gray-400';
}

function typeBg(type: string): string {
  if (type === 'incident_critical' || type === 'panic_alert') return 'bg-red-500/10';
  if (type === 'incident_created') return 'bg-orange-500/10';
  if (type === 'shift_unfilled') return 'bg-blue-500/10';
  if (type === 'sia_expiring') return 'bg-yellow-500/10';
  if (type === 'message_received') return 'bg-teal-500/10';
  if (type === 'report_ready') return 'bg-emerald-500/10';
  if (type === 'risk_score_increased') return 'bg-amber-500/10';
  return 'bg-gray-500/10';
}

function NotificationItem({
  n,
  onRead,
}: {
  n: Notification;
  onRead: (id: string) => void;
}) {
  const isUnread = !n.read_at;

  const handleClick = async () => {
    if (isUnread) {
      await onRead(n.id);
    }
  };

  const content = (
    <div
      className={`flex items-start gap-3 px-4 py-3 rounded-lg transition-colors cursor-pointer ${
        isUnread ? 'bg-white/5' : 'hover:bg-white/[0.02]'
      } ${severityBorder(n.severity)}`}
    >
      <div
        className={`w-8 h-8 rounded-lg flex-shrink-0 flex items-center justify-center ${typeBg(n.type)}`}
      >
        <div className="w-4 h-4 flex items-center justify-center">
          <i className={typeIcon(n.type)}></i>
        </div>
      </div>
      <div className="min-w-0 flex-1">
        <p className={`text-sm ${isUnread ? 'font-semibold text-white' : 'text-gray-300'}`}>
          {n.title}
        </p>
        {n.body && (
          <p className="text-xs text-gray-500 mt-0.5 line-clamp-2">{n.body}</p>
        )}
        <p className="text-[11px] text-gray-600 mt-1">{timeAgo(n.created_at)}</p>
      </div>
      {isUnread && <div className="w-2 h-2 rounded-full bg-blue-400 flex-shrink-0 mt-1.5"></div>}
    </div>
  );

  if (n.link) {
    return (
      <Link href={n.link} onClick={handleClick} className="block">
        {content}
      </Link>
    );
  }

  return <div onClick={handleClick}>{content}</div>;
}

export default function NotificationBell({ userId }: { userId: string | null }) {
  const {
    notifications,
    unreadCount,
    loading,
    criticalAlert,
    markAsRead,
    markAllAsRead,
    dismissCritical,
  } = useNotifications(userId);

  const [open, setOpen] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);
  const bellRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    function onClick(e: MouseEvent) {
      const target = e.target as Node;
      if (
        panelRef.current &&
        bellRef.current &&
        !panelRef.current.contains(target) &&
        !bellRef.current.contains(target)
      ) {
        setOpen(false);
      }
    }
    if (open) document.addEventListener('mousedown', onClick);
    return () => document.removeEventListener('mousedown', onClick);
  }, [open]);

  const displayCount = unreadCount > 9 ? '9+' : unreadCount > 0 ? String(unreadCount) : null;

  return (
    <>
      {/* Bell */}
      <div className="relative">
        <button
          ref={bellRef}
          onClick={() => setOpen(!open)}
          className="relative w-9 h-9 flex items-center justify-center text-gray-400 hover:text-white transition-colors cursor-pointer"
        >
          <div className="w-5 h-5 flex items-center justify-center">
            <i className="ri-notification-3-line"></i>
          </div>
          {displayCount && (
            <span
              className={`absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] flex items-center justify-center bg-red-500 text-white text-[10px] font-bold rounded-full px-1 ${
                unreadCount > 0 ? 'animate-pulse' : ''
              }`}
            >
              {displayCount}
            </span>
          )}
        </button>

        {/* Dropdown */}
        {open && (
          <div
            ref={panelRef}
            className="absolute right-0 mt-2 w-[380px] bg-[#0f172a] rounded-xl shadow-2xl border border-gray-800 z-50 overflow-hidden"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-gray-800">
              <h3 className="text-sm font-semibold text-white">Notifications</h3>
              <div className="flex items-center gap-2">
                {unreadCount > 0 && (
                  <button
                    onClick={() => { markAllAsRead(); }}
                    className="text-xs text-blue-400 hover:text-blue-300 transition-colors cursor-pointer whitespace-nowrap"
                  >
                    Mark all read
                  </button>
                )}
                <button
                  onClick={() => setOpen(false)}
                  className="w-7 h-7 flex items-center justify-center text-gray-500 hover:text-white rounded-lg hover:bg-gray-800/50 transition-colors cursor-pointer"
                >
                  <div className="w-4 h-4 flex items-center justify-center">
                    <i className="ri-close-line"></i>
                  </div>
                </button>
              </div>
            </div>

            {/* List */}
            <div className="max-h-[400px] overflow-y-auto">
              {loading ? (
                <div className="py-10 flex items-center justify-center">
                  <i className="ri-loader-4-line animate-spin text-blue-500"></i>
                </div>
              ) : notifications.length === 0 ? (
                <div className="py-10 text-center">
                  <div className="w-12 h-12 mx-auto mb-3 flex items-center justify-center rounded-xl bg-gray-800/50">
                    <div className="w-6 h-6 flex items-center justify-center">
                      <i className="ri-check-double-line text-gray-500 text-xl"></i>
                    </div>
                  </div>
                  <p className="text-sm text-gray-400 font-medium">All caught up!</p>
                  <p className="text-xs text-gray-600 mt-1">No new notifications</p>
                </div>
              ) : (
                <div className="space-y-0.5 py-1 px-1">
                  {notifications.slice(0, 20).map((n) => (
                    <NotificationItem key={n.id} n={n} onRead={markAsRead} />
                  ))}
                </div>
              )}
            </div>

            {/* Footer */}
            {notifications.length > 0 && (
              <div className="px-4 py-2.5 border-t border-gray-800">
                <Link
                  href="/notifications"
                  onClick={() => setOpen(false)}
                  className="text-xs text-blue-400 hover:text-blue-300 transition-colors cursor-pointer"
                >
                  View all notifications
                </Link>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Critical Alert Modal */}
      {criticalAlert && (
        <div className="fixed inset-0 z-[100] bg-black/80 flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-[#0f172a] border-2 border-red-500 rounded-2xl p-6 shadow-2xl">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-full bg-red-500/15 flex items-center justify-center flex-shrink-0">
                <div className="w-7 h-7 flex items-center justify-center">
                  <i className="ri-alarm-warning-line text-red-400 text-2xl"></i>
                </div>
              </div>
              <div>
                <p className="text-xs text-red-400 font-semibold uppercase tracking-wider">
                  Critical Alert
                </p>
                <h2 className="text-lg font-bold text-white">{criticalAlert.title}</h2>
              </div>
            </div>

            {criticalAlert.body && (
              <p className="text-sm text-gray-300 mb-6 leading-relaxed">{criticalAlert.body}</p>
            )}

            <div className="flex items-center gap-3">
              <button
                onClick={async () => {
                  await dismissCritical();
                  if (criticalAlert.link) {
                    window.location.href = criticalAlert.link;
                  }
                }}
                className="flex-1 bg-red-600 hover:bg-red-500 text-white text-sm font-medium px-4 py-2.5 rounded-lg transition-colors cursor-pointer whitespace-nowrap"
              >
                View & Acknowledge
              </button>
              <button
                onClick={dismissCritical}
                className="flex-1 bg-gray-800 hover:bg-gray-700 text-gray-300 text-sm font-medium px-4 py-2.5 rounded-lg transition-colors cursor-pointer whitespace-nowrap border border-gray-700"
              >
                Acknowledge
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}