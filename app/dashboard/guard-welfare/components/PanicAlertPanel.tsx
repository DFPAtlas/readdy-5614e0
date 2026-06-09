'use client';

import { useState } from 'react';
import { useGuardWelfare, type WelfareNotification } from '@/lib/useGuardWelfare';
import GlassCard from '@/app/components/GlassCard';

interface Props {
  notifications: WelfareNotification[];
  incidents: ReturnType<typeof useGuardWelfare>['welfareIncidents'];
}

function getSeverityConfig(severity: string | null) {
  switch (severity) {
    case 'critical':
      return { bg: 'bg-red-500/10', text: 'text-red-400', border: 'border-red-500/20', dot: 'bg-red-500', label: 'Critical' };
    case 'high':
      return { bg: 'bg-orange-500/10', text: 'text-orange-400', border: 'border-orange-500/20', dot: 'bg-orange-500', label: 'High' };
    case 'warning':
      return { bg: 'bg-amber-500/10', text: 'text-amber-400', border: 'border-amber-500/20', dot: 'bg-amber-500', label: 'Warning' };
    default:
      return { bg: 'bg-blue-500/10', text: 'text-blue-400', border: 'border-blue-500/20', dot: 'bg-blue-500', label: 'Info' };
  }
}

function timeSince(iso: string): string {
  const diff = Math.floor((Date.now() - new Date(iso).getTime()) / 1000);
  if (diff < 60) return 'Just now';
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return `${Math.floor(diff / 86400)}d ago`;
}

export default function PanicAlertPanel({ notifications, incidents }: Props) {
  const [activeTab, setActiveTab] = useState<'alerts' | 'incidents'>('alerts');

  const panicNotifications = notifications.filter(
    (n) =>
      !n.read_at &&
      (n.type?.toLowerCase().includes('panic') ||
        n.type?.toLowerCase().includes('sos') ||
        n.severity === 'critical')
  );

  const panicIncidents = incidents.filter(
    (i) =>
      i.status === 'open' &&
      (i.severity === 'critical' ||
        i.incident_type?.toLowerCase().includes('panic') ||
        i.incident_type?.toLowerCase().includes('sos') ||
        i.incident_type?.toLowerCase().includes('medical') ||
        i.incident_type?.toLowerCase().includes('assault'))
  );

  const alertCount = panicNotifications.length;
  const incidentCount = panicIncidents.length;

  return (
    <GlassCard className="overflow-hidden">
      <div className="flex items-center justify-between px-5 pt-5 pb-3">
        <div className="flex items-center gap-2">
          <div className="w-5 h-5 flex items-center justify-center text-red-400">
            <i className="ri-alarm-warning-line text-sm"></i>
          </div>
          <h3 className="text-sm font-semibold text-white">Panic & SOS Alerts</h3>
          {(alertCount + incidentCount) > 0 && (
            <span className="ml-1 px-2 py-0.5 rounded-full bg-red-500/10 text-red-400 text-[10px] font-bold">
              {alertCount + incidentCount}
            </span>
          )}
        </div>
      </div>

      <div className="flex px-5 pb-3 gap-1">
        <button
          onClick={() => setActiveTab('alerts')}
          className={`px-3 py-1 rounded-full text-xs font-medium transition-all cursor-pointer whitespace-nowrap ${
            activeTab === 'alerts' ? 'bg-white/10 text-white' : 'text-gray-500 hover:text-gray-300'
          }`}
        >
          Notifications {alertCount > 0 && <span className="text-red-400">({alertCount})</span>}
        </button>
        <button
          onClick={() => setActiveTab('incidents')}
          className={`px-3 py-1 rounded-full text-xs font-medium transition-all cursor-pointer whitespace-nowrap ${
            activeTab === 'incidents' ? 'bg-white/10 text-white' : 'text-gray-500 hover:text-gray-300'
          }`}
        >
          Incidents {incidentCount > 0 && <span className="text-red-400">({incidentCount})</span>}
        </button>
      </div>

      <div className="max-h-[420px] overflow-y-auto">
        {activeTab === 'alerts' ? (
          panicNotifications.length === 0 ? (
            <div className="px-5 pb-5 text-center text-xs text-gray-500 py-8">
              <div className="w-8 h-8 rounded-full bg-emerald-500/10 flex items-center justify-center mx-auto mb-2">
                <div className="w-4 h-4 flex items-center justify-center text-emerald-400">
                  <i className="ri-check-line text-sm"></i>
                </div>
              </div>
              No active panic or SOS alerts.
            </div>
          ) : (
            panicNotifications.map((n) => {
              const cfg = getSeverityConfig(n.severity);
              return (
                <div
                  key={n.id}
                  className={`px-5 py-3 border-t border-white/5 ${cfg.border} border-l-2 bg-white/5`}
                >
                  <div className="flex items-start gap-3">
                    <span className="relative flex h-2.5 w-2.5 shrink-0 mt-1">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-500 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-red-500"></span>
                    </span>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium text-white">{n.title}</span>
                        <span className={`px-1.5 py-0.5 rounded text-[10px] font-medium ${cfg.bg} ${cfg.text} shrink-0`}>
                          {cfg.label}
                        </span>
                      </div>
                      <p className="text-xs text-gray-400 mt-0.5">{n.body}</p>
                      <div className="flex items-center gap-3 mt-2">
                        <span className="text-[10px] text-gray-500">{timeSince(n.created_at)}</span>
                        <button className="text-[10px] text-blue-400 hover:text-blue-300 font-medium cursor-pointer">
                          Mark Resolved
                        </button>
                        <button className="text-[10px] text-red-400 hover:text-red-300 font-medium cursor-pointer">
                          Escalate
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })
          )
        ) : (
          panicIncidents.length === 0 ? (
            <div className="px-5 pb-5 text-center text-xs text-gray-500 py-8">
              <div className="w-8 h-8 rounded-full bg-emerald-500/10 flex items-center justify-center mx-auto mb-2">
                <div className="w-4 h-4 flex items-center justify-center text-emerald-400">
                  <i className="ri-check-line text-sm"></i>
                </div>
              </div>
              No open welfare-related incidents.
            </div>
          ) : (
            panicIncidents.map((i) => {
              const cfg = getSeverityConfig(i.severity);
              return (
                <div
                  key={i.id}
                  className={`px-5 py-3 border-t border-white/5 ${cfg.border} border-l-2 bg-white/5`}
                >
                  <div className="flex items-start gap-3">
                    <span className="relative flex h-2.5 w-2.5 shrink-0 mt-1">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-500 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-red-500"></span>
                    </span>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium text-white">{i.incident_type}</span>
                        <span className={`px-1.5 py-0.5 rounded text-[10px] font-medium ${cfg.bg} ${cfg.text} shrink-0`}>
                          {cfg.label}
                        </span>
                      </div>
                      <p className="text-xs text-gray-400 mt-0.5 truncate">{i.description}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-[10px] text-gray-500">{i.guard_name}</span>
                        <span className="text-[10px] text-gray-600">{i.site_name}</span>
                        <span className="text-[10px] text-gray-500">{timeSince(i.created_at || '')}</span>
                      </div>
                      <div className="flex items-center gap-3 mt-2">
                        <button className="text-[10px] text-blue-400 hover:text-blue-300 font-medium cursor-pointer">
                          View Incident
                        </button>
                        <button className="text-[10px] text-emerald-400 hover:text-emerald-300 font-medium cursor-pointer">
                          Mark Resolved
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })
          )
        )}
      </div>
    </GlassCard>
  );
}