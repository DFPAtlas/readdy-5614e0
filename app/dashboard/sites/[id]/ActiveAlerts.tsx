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
        .select('id, incident_type, description, severity, status, occurred_at, site_name:sites(site_name)')
        .eq('site_id', siteId)
        .in('status', ['open', 'in_progress'])
        .order('occurred_at', { ascending: false })
        .limit(6);

      setAlerts((data || []).map((a: any) => ({
        ...a,
        site_name: a.site_name?.site_name || 'This site',
      })));
      setLoading(false);
    }
    load();
  }, [siteId]);

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'high': case 'critical': return 'bg-red-500';
      case 'medium': return 'bg-orange-500';
      case 'low': return 'bg-yellow-500';
      default: return 'bg-gray-500';
    }
  };

  const getAlertIcon = (type: string) => {
    if (!type) return 'ri-alert-line';
    const t = type.toLowerCase();
    if (t.includes('breach') || t.includes('intrusion')) return 'ri-shield-cross-line';
    if (t.includes('suspicious') || t.includes('theft')) return 'ri-error-warning-line';
    if (t.includes('system') || t.includes('equipment')) return 'ri-information-line';
    return 'ri-alert-line';
  };

  if (loading) {
    return (
      <div className="bg-slate-600 rounded-lg p-6 text-white">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold">Active Alerts</h2>
        </div>
        <p className="text-sm text-gray-400">Loading alerts...</p>
      </div>
    );
  }

  return (
    <div className="bg-slate-600 rounded-lg p-6 text-white">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold">Active Alerts</h2>
        {alerts.length > 0 && (
          <div className="w-6 h-6 bg-red-500 rounded-full flex items-center justify-center">
            <span className="text-xs font-bold">{alerts.length}</span>
          </div>
        )}
      </div>

      {alerts.length === 0 ? (
        <p className="text-sm text-gray-400">No active alerts for this site.</p>
      ) : (
        <div className="space-y-4">
          {alerts.map((alert) => (
            <div key={alert.id} className="bg-slate-700 rounded-lg p-4">
              <div className="flex items-start space-x-3 mb-3">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center ${getSeverityColor(alert.severity || 'medium')}`}>
                  <i className={`${getAlertIcon(alert.incident_type || '')} text-white text-sm`}></i>
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-1">
                    <h3 className="font-medium text-white">{alert.incident_type || 'Alert'}</h3>
                    <span className="text-xs text-gray-300">{alert.occurred_at ? timeAgo(alert.occurred_at) : ''}</span>
                  </div>
                  <p className="text-sm text-gray-300 mb-2">{alert.description || 'No description'}</p>
                  <p className="text-xs text-blue-300">Status: {alert.status}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}