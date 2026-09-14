'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useClientPortal } from '@/lib/useClientPortal';
import { supabase } from '@/lib/supabase';
import AgentGate from '@/components/AgentGate';
import { useAuth } from '@/lib/auth';
import { callAgent, logWebhookEvent } from '@/lib/guardianhubAgents';
import { useEffect, useCallback } from 'react';
import WidgetBoundary from '@/components/dashboard/WidgetBoundary';
import WidgetFallback from '@/components/dashboard/WidgetFallback';

export default function ClientIncidentsPage() {
  const { incidents, sites, isLoading } = useClientPortal();
  const { profile } = useAuth();
  const [siteFilter, setSiteFilter] = useState('all');
  const [severityFilter, setSeverityFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');

  const triggerDobIncident = useCallback(async () => {
    if (!profile?.id) return;
    try {
      await callAgent(
        'dob_incident',
        'health.status',
        { incidents_count: incidents.length, open_count: incidents.filter(i => i.status === 'open').length },
        { requestedPage: '/client/incidents', requestedFeature: 'dob_incident' }
      );
    } catch {}
  }, [profile?.id, profile?.company_id, incidents.length]);

  useEffect(() => {
    if (!isLoading && profile?.id) triggerDobIncident();
  }, [isLoading, profile?.id]);

  const filtered = incidents.filter((i) => {
    if (siteFilter !== 'all' && i.site_id !== siteFilter) return false;
    if (severityFilter !== 'all' && i.severity !== severityFilter) return false;
    if (statusFilter !== 'all' && i.status !== statusFilter) return false;
    return true;
  });

  function severityStyle(severity: string) {
    switch (severity) {
      case 'critical': return 'bg-red-50 text-red-700 border-red-200';
      case 'high': return 'bg-orange-50 text-orange-700 border-orange-200';
      case 'medium': return 'bg-amber-50 text-amber-700 border-amber-200';
      default: return 'bg-emerald-50 text-emerald-700 border-emerald-200';
    }
  }

  function clientStatus(status: string) {
    switch (status) {
      case 'open': return { label: 'New', style: 'bg-blue-50 text-blue-700 border-blue-200' };
      case 'under_review': return { label: 'Under Review', style: 'bg-amber-50 text-amber-700 border-amber-200' };
      case 'resolved': return { label: 'Resolved', style: 'bg-emerald-50 text-emerald-700 border-emerald-200' };
      default: return { label: status, style: 'bg-slate-50 text-slate-600 border-slate-200' };
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <AgentGate pagePath="/client/incidents" featureName="Incidents">
    <div className="space-y-6">
      <WidgetBoundary widgetName="IncidentsHeader" pagePath="/client/incidents" clientId={profile?.company_id} userId={profile?.id}>
        <div>
          <h1 className="text-2xl font-semibold text-white">Incidents</h1>
          <p className="text-gray-400 mt-1">All incidents across your sites</p>
        </div>
      </WidgetBoundary>

      <WidgetBoundary widgetName="IncidentsFilters" pagePath="/client/incidents" clientId={profile?.company_id} userId={profile?.id}>
        <div className="bg-[#0f172a]/70 backdrop-blur-sm border border-white/10 rounded-xl p-4 flex flex-wrap gap-3">
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-400">Site:</span>
            <div className="flex gap-1">
              <button
                onClick={() => setSiteFilter('all')}
                className={`px-3 py-1.5 text-xs font-medium rounded-lg cursor-pointer whitespace-nowrap ${
                  siteFilter === 'all' ? 'bg-white/10 text-white' : 'bg-white/5 text-gray-400 hover:bg-white/10'
                }`}
              >
                All
              </button>
              {sites.map((s) => (
                <button
                  key={s.id}
                  onClick={() => setSiteFilter(s.id)}
                  className={`px-3 py-1.5 text-xs font-medium rounded-lg cursor-pointer whitespace-nowrap ${
                    siteFilter === s.id ? 'bg-white/10 text-white' : 'bg-white/5 text-gray-400 hover:bg-white/10'
                  }`}
                >
                  {s.site_name}
                </button>
              ))}
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-400">Severity:</span>
            <div className="flex gap-1">
              {['all', 'critical', 'high', 'medium', 'low'].map((sev) => (
                <button
                  key={sev}
                  onClick={() => setSeverityFilter(sev)}
                  className={`px-3 py-1.5 text-xs font-medium rounded-lg cursor-pointer whitespace-nowrap ${
                    severityFilter === sev ? 'bg-white/10 text-white' : 'bg-white/5 text-gray-400 hover:bg-white/10'
                  }`}
                >
                  {sev === 'all' ? 'All' : sev.charAt(0).toUpperCase() + sev.slice(1)}
                </button>
              ))}
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-400">Status:</span>
            <div className="flex gap-1">
              {['all', 'open', 'under_review', 'resolved'].map((st) => (
                <button
                  key={st}
                  onClick={() => setStatusFilter(st)}
                  className={`px-3 py-1.5 text-xs font-medium rounded-lg cursor-pointer whitespace-nowrap ${
                    statusFilter === st ? 'bg-white/10 text-white' : 'bg-white/5 text-gray-400 hover:bg-white/10'
                  }`}
                >
                  {st === 'all' ? 'All' : st === 'under_review' ? 'Under Review' : st.charAt(0).toUpperCase() + st.slice(1)}
                </button>
              ))}
            </div>
          </div>
        </div>
      </WidgetBoundary>

      <WidgetBoundary widgetName="IncidentsTable" pagePath="/client/incidents" clientId={profile?.company_id} userId={profile?.id} fallbackTitle="Incidents Table">
        {filtered.length === 0 ? (
          <WidgetFallback state="empty" title="No incidents" message="No incidents match your filters. Adjust your filters or check back later." />
        ) : (
          <div className="bg-[#0f172a]/70 backdrop-blur-sm border border-white/10 rounded-xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-white/5">
                    <th className="text-left px-4 py-3 font-medium text-gray-500">Ref</th>
                    <th className="text-left px-4 py-3 font-medium text-gray-500">Date & Time</th>
                    <th className="text-left px-4 py-3 font-medium text-gray-500">Site</th>
                    <th className="text-left px-4 py-3 font-medium text-gray-500">Type</th>
                    <th className="text-left px-4 py-3 font-medium text-gray-500">Severity</th>
                    <th className="text-left px-4 py-3 font-medium text-gray-500">Reported by</th>
                    <th className="text-left px-4 py-3 font-medium text-gray-500">Status</th>
                    <th className="text-right px-4 py-3 font-medium text-gray-500"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {filtered.map((i) => {
                    const st = clientStatus(i.status);
                    return (
                      <tr key={i.id} className="hover:bg-white/5 transition-colors">
                        <td className="px-4 py-3 text-gray-400 text-xs font-mono">{i.incident_number || '—'}</td>
                        <td className="px-4 py-3 text-white">
                          {new Date(i.occurred_at || i.created_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
                          <div className="text-xs text-gray-500">
                            {new Date(i.occurred_at || i.created_at).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })}
                          </div>
                        </td>
                        <td className="px-4 py-3 text-white">{i.site_name}</td>
                        <td className="px-4 py-3 text-white">{i.incident_type}</td>
                        <td className="px-4 py-3">
                          <span className={`text-xs px-2 py-0.5 rounded border font-medium ${
                            i.severity === 'critical' ? 'bg-red-500/10 border-red-500/20 text-red-400' :
                            i.severity === 'high' ? 'bg-orange-500/10 border-orange-500/20 text-orange-400' :
                            i.severity === 'medium' ? 'bg-amber-500/10 border-amber-500/20 text-amber-400' :
                            'bg-emerald-500/10 border-emerald-500/20 text-emerald-400'
                          }`}>
                            {i.severity}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-gray-300">{i.officer_name || 'Officer'}</td>
                        <td className="px-4 py-3">
                          <span className={`text-xs px-2 py-0.5 rounded border font-medium ${st.style}`}>
                            {st.label}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-right">
                          <Link
                            href={`/client/incidents/${i.id}`}
                            className="text-sm text-blue-400 hover:text-blue-300 font-medium cursor-pointer whitespace-nowrap"
                          >
                            View
                          </Link>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </WidgetBoundary>
    </div>
    </AgentGate>
  );
}
