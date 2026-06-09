'use client';

import Link from 'next/link';
import { useState, useEffect, useRef } from 'react';
import type { AIAlert } from '@/lib/dashboardFetch';

interface AIAlertsWidgetProps {
  alerts: AIAlert[];
}

const severityConfig: Record<string, { dot: string; bg: string; text: string; border: string }> = {
  critical: { dot: 'bg-red-500', bg: 'bg-red-500/10', text: 'text-red-400', border: 'border-red-500/30' },
  high: { dot: 'bg-orange-500', bg: 'bg-orange-500/10', text: 'text-orange-400', border: 'border-orange-500/30' },
  medium: { dot: 'bg-amber-500', bg: 'bg-amber-500/10', text: 'text-amber-400', border: 'border-amber-500/30' },
  low: { dot: 'bg-blue-500', bg: 'bg-blue-500/10', text: 'text-blue-400', border: 'border-blue-500/30' },
};

function timeAgo(iso: string): string {
  const diff = Math.floor((Date.now() - new Date(iso).getTime()) / 1000);
  if (diff < 60) return 'Just now';
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return `${Math.floor(diff / 86400)}d ago`;
}

export default function AIAlertsWidget({ alerts }: AIAlertsWidgetProps) {
  const [dismissedIds, setDismissedIds] = useState<Set<string>>(new Set());
  const [animatedIds, setAnimatedIds] = useState<Set<string>>(new Set());
  const prevCountRef = useRef(alerts.length);

  useEffect(() => {
    if (alerts.length > prevCountRef.current) {
      const newIds = alerts.slice(0, alerts.length - prevCountRef.current).map((a) => a.id);
      setAnimatedIds(new Set(newIds));
      const timer = setTimeout(() => setAnimatedIds(new Set()), 2000);
      prevCountRef.current = alerts.length;
      return () => clearTimeout(timer);
    }
    prevCountRef.current = alerts.length;
  }, [alerts]);

  const activeAlerts = alerts.filter((a) => !dismissedIds.has(a.id) && !a.dismissed);
  const criticalCount = activeAlerts.filter((a) => a.severity === 'critical' || a.severity === 'high').length;

  const dismiss = (id: string) => {
    setDismissedIds((prev) => new Set([...prev, id]));
  };

  return (
    <div className="bg-[#0f172a]/70 backdrop-blur-sm border border-white/10 shadow-sm rounded-xl overflow-hidden">
      <div className="flex items-center justify-between px-4 pt-4 pb-2">
        <div className="flex items-center gap-2">
          <div className="w-5 h-5 flex items-center justify-center text-purple-400">
            <i className="ri-sparkling-line text-sm"></i>
          </div>
          <h3 className="text-sm font-semibold text-white">AI Insights</h3>
        </div>
        <div className="flex items-center gap-2">
          {criticalCount > 0 && (
            <span className="relative flex h-2 w-2 shrink-0">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-purple-500 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-purple-500"></span>
            </span>
          )}
          <span className="text-xs text-gray-500">{activeAlerts.length} active</span>
        </div>
      </div>

      <div className="max-h-80 overflow-y-auto">
        {activeAlerts.length === 0 ? (
          <div className="px-4 pb-4 text-center text-xs text-gray-500 py-6">
            <div className="w-8 h-8 rounded-full bg-emerald-500/10 flex items-center justify-center mx-auto mb-2">
              <div className="w-4 h-4 flex items-center justify-center text-emerald-400">
                <i className="ri-check-line text-sm"></i>
              </div>
            </div>
            No AI alerts at this time.
          </div>
        ) : (
          activeAlerts.map((alert) => {
            const cfg = severityConfig[alert.severity];
            const isAnimated = animatedIds.has(alert.id);
            const detail = alert.details?.narrative || alert.details?.summary || alert.details?.message || alert.action_type;
            return (
              <div
                key={alert.id}
                className={`px-4 py-3 border-t border-white/5 ${isAnimated ? 'bg-purple-500/5' : ''} ${isAnimated ? '' : 'hover:bg-white/5'} transition-all`}
                style={isAnimated ? { animation: 'slideIn 0.8s ease-out' } : undefined}
              >
                <div className="flex items-start gap-2.5">
                  <span className="relative flex h-2 w-2 shrink-0 mt-1.5">
                    {alert.severity === 'critical' && (
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-500 opacity-75"></span>
                    )}
                    <span className={`relative inline-flex rounded-full h-2 w-2 ${cfg.dot}`}></span>
                  </span>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-0.5">
                      <span className="text-sm font-medium text-white">{alert.action_type.replace(/_/g, ' ')}</span>
                      <span className={`px-1.5 py-0.5 rounded text-[10px] font-medium ${cfg.bg} ${cfg.text} shrink-0`}>{alert.severity}</span>
                    </div>
                    <p className="text-xs text-gray-500 line-clamp-2">{detail}</p>
                    <div className="flex items-center gap-3 mt-1.5">
                      <span className="text-[10px] text-gray-600">{timeAgo(alert.created_at)}</span>
                      <button
                        onClick={() => dismiss(alert.id)}
                        className="text-[10px] text-gray-600 hover:text-gray-400 cursor-pointer"
                      >
                        Dismiss
                      </button>
                      {alert.details?.site_id && (
                        <Link href={`/sites/${alert.details.site_id}`} className="text-[10px] text-blue-400 hover:text-blue-300 cursor-pointer">
                          View site
                        </Link>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}