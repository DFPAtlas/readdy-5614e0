'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';

function timeAgo(iso: string) {
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins} mins ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
}

export default function ActiveAlerts({ siteId }: { siteId: string }) {
  const [alerts, setAlerts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      setLoading(true);
      const { data } = await supabase
        .from('incidents')
        .select('id, incident_type, severity, description, status, occurred_at, title')
        .eq('site_id', siteId)
        .in('status', ['open', 'in_progress', 'reviewing'])
        .order('occurred_at', { ascending: false })
        .limit(8);

      setAlerts(data || []);
      setLoading(false);
    }
    load();
  }, [siteId]);

  const getSeverityBadge = (severity: string) => {
    switch (severity) {
      case 'high': case 'critical': return { bg: 'bg-red-500/10', text: 'text-red-400', border: 'border-red-500/20' };
      case 'medium': return { bg: 'bg-orange-500/10', text: 'text-orange-400', border: 'border-orange-500/20' };
      case 'low': return { bg: 'bg-amber-500/10', text: 'text-amber-400', border: 'border-amber-500/20' };
      default: return { bg: 'bg-gray-500/10', text: 'text-gray-400', border: 'border-gray-500/20' };
    }
  };

  const getAlertIcon = (type: string | null) => {
    if (!type) return 'ri-alert-line';
    const t = type.toLowerCase();
    if (t.includes('breach') || t.includes('intrusion') || t.includes('security')) return 'ri-shield-cross-line';
    if (t.includes('suspicious') || t.includes('theft')) return 'ri-error-warning-line';
    if (t.includes('system') || t.includes('equipment')) return 'ri-information-line';
    if (t.includes('fire') || t.includes('emergency')) return 'ri-fire-line';
    return 'ri-alert-line';
  };

  return (
    <div className="bg-[#0f172a]/70 backdrop-blur-sm border border-white/10 rounded-xl overflow-hidden">
      <div className="px-5 py-4 border-b border-white/10 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-red-500/10 border border-red-500/20 flex items-center justify-center">
            <i className="ri-error-warning-line text-red-400 text-sm"></i>
          </div>
          <div>
            <h2 className="text-sm font-semibold text-white">Active Alerts</h2>
            {alerts.length > 0 && (
              <p className="text-[11px] text-red-400">{alerts.length} open</p>
            )}
          </div>
        </div>
        {alerts.length > 0 && (
          <div className="w-7 h-7 rounded-full bg-red-500/20 border border-red-500/30 flex items-center justify-center">
            <span className="text-xs font-bold text-red-400">{alerts.length}</span>
          </div>
        )}
      </div>

      <div className="p-4">
        {loading ? (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="animate-pulse flex items-start gap-3">
                <div className="w-7 h-7 rounded-lg bg-white/5 flex-shrink-0"></div>
                <div className="flex-1 space-y-1.5">
                  <div className="h-3 bg-white/5 rounded w-20"></div>
                  <div className="h-2 bg-white/5 rounded w-full"></div>
                </div>
              </div>
            ))}
          </div>
        ) : alerts.length === 0 ? (
          <div className="text-center py-6">
            <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center mx-auto mb-2">
              <i className="ri-check-line text-gray-500"></i>
            </div>
            <p className="text-xs text-gray-400">No active alerts</p>
          </div>
        ) : (
          <div className="space-y-2.5">
            {alerts.map((alert) => {
              const sev = getSeverityBadge(alert.severity || 'medium');
              return (
                <div key={alert.id} className="p-3 rounded-lg border border-white/5 hover:border-white/10 transition-colors">
                  <div className="flex items-start gap-2.5">
                    <div className={`w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 ${sev.bg} ${sev.border}`}>
                      <i className={`${getAlertIcon(alert.incident_type)} ${sev.text} text-xs`}></i>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2 mb-0.5">
                        <p className="text-sm font-medium text-white truncate">
                          {alert.title || alert.incident_type || 'Alert'}
                        </p>
                        <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-medium ${sev.bg} ${sev.text} whitespace-nowrap flex-shrink-0`}>
                          {alert.severity || 'medium'}
                        </span>
                      </div>
                      {alert.description && (
                        <p className="text-xs text-gray-400 line-clamp-2 mb-1">{alert.description}</p>
                      )}
                      <div className="flex items-center gap-2 text-[10px]">
                        <span className={`${alert.status === 'open' ? 'text-red-400' : 'text-amber-400'}`}>
                          {alert.status === 'in_progress' ? 'In Progress' : alert.status === 'reviewing' ? 'Reviewing' : 'Open'}
                        </span>
                        {alert.occurred_at && (
                          <>
                            <span className="text-gray-600">·</span>
                            <span className="text-gray-500">{timeAgo(alert.occurred_at)}</span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}