'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';

const SEVERITY_STYLES: Record<string, string> = {
  P1: 'text-red-400 bg-red-500/10 border-red-500/20',
  P2: 'text-orange-400 bg-orange-500/10 border-orange-500/20',
  P3: 'text-amber-400 bg-amber-500/10 border-amber-500/20',
  P4: 'text-gray-400 bg-gray-500/10 border-gray-500/20',
};

function SeverityBadge({ severity }: { severity?: string }) {
  const s = severity || 'P4';
  return (
    <span className={`inline-flex px-2 py-0.5 rounded-md text-[10px] font-semibold border ${SEVERITY_STYLES[s] || SEVERITY_STYLES.P4}`}>
      {s}
    </span>
  );
}

function StateDot({ state }: { state: string }) {
  const color = state === 'healthy' ? 'bg-emerald-400' : state === 'degraded' ? 'bg-amber-400' : state === 'unavailable' ? 'bg-red-400' : 'bg-gray-500';
  return <span className={`w-2 h-2 rounded-full ${color} flex-shrink-0`} />;
}

function StatCard({ label, value, tone, sub }: { label: string; value: string | number; tone: 'emerald' | 'amber' | 'red' | 'indigo' | 'gray'; sub?: string }) {
  const tones: Record<string, string> = {
    emerald: 'border-emerald-600/20 bg-emerald-600/5 text-emerald-400',
    amber: 'border-amber-600/20 bg-amber-600/5 text-amber-400',
    red: 'border-red-600/20 bg-red-600/5 text-red-400',
    indigo: 'border-indigo-600/20 bg-indigo-600/5 text-indigo-400',
    gray: 'border-gray-600/20 bg-gray-600/5 text-gray-300',
  };
  return (
    <div className={`border rounded-xl p-4 ${tones[tone]}`}>
      <div className="text-xs text-gray-500 uppercase tracking-wider mb-1">{label}</div>
      <div className="text-xl font-bold">{value}</div>
      {sub && <div className="text-xs text-gray-600 mt-0.5">{sub}</div>}
    </div>
  );
}

export default function OperationsPage() {
  const [loading, setLoading] = useState(true);
  const [health, setHealth] = useState<any>(null);
  const [healthError, setHealthError] = useState('');
  const [incidents, setIncidents] = useState<any[]>([]);
  const [errors, setErrors] = useState<any[]>([]);
  const [error24h, setError24h] = useState(0);
  const [failedAgents, setFailedAgents] = useState<any[]>([]);
  const [deadLetter, setDeadLetter] = useState<any[]>([]);
  const [backlog, setBacklog] = useState(0);
  const [failedNotifications, setFailedNotifications] = useState(0);
  const [failedWebhooks, setFailedWebhooks] = useState<any[]>([]);
  const [securityEvents, setSecurityEvents] = useState<any[]>([]);
  const [deployments, setDeployments] = useState<any[]>([]);
  const [retention, setRetention] = useState<any[]>([]);
  const [overdueSessions, setOverdueSessions] = useState(0);

  useEffect(() => {
    const load = async () => {
      const dayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();

      const [healthRes, incRes, errRes, errCount, agentRes, dlRes, backlogRes, notifRes, whRes, secRes, depRes, retRes, sessionRes] = await Promise.all([
        supabase.functions.invoke('health-check', { method: 'POST', body: { mode: 'ready' } }),
        supabase.from('ops_incidents').select('*').in('status', ['investigating', 'identified', 'monitoring']).order('started_at', { ascending: false }).limit(20),
        supabase.from('ops_error_events').select('*').order('created_at', { ascending: false }).limit(30),
        supabase.from('ops_error_events').select('id', { count: 'exact', head: true }).gte('created_at', dayAgo),
        supabase.from('agent_execution_logs').select('*').eq('status', 'failed').order('created_at', { ascending: false }).limit(20),
        supabase.from('agent_webhook_events').select('*').eq('status', 'dead_letter').order('created_at', { ascending: false }).limit(20),
        supabase.from('agent_webhook_events').select('id', { count: 'exact', head: true }).in('status', ['pending', 'retrying']),
        supabase.from('notification_jobs').select('id', { count: 'exact', head: true }).eq('status', 'failed'),
        supabase.from('billing_webhook_events').select('*').not('error', 'is', null).order('received_at', { ascending: false }).limit(20),
        supabase.from('platform_security_events').select('*').order('created_at', { ascending: false }).limit(20),
        supabase.from('deployment_records').select('*').order('deployed_at', { ascending: false }).limit(10),
        supabase.from('retention_config').select('*').order('record_category', { ascending: true }),
        supabase.from('lone_worker_sessions').select('id', { count: 'exact', head: true }).eq('status', 'active').lt('next_check_in_due_at', new Date().toISOString()),
      ]);

      if (healthRes.error) setHealthError('Health check unavailable');
      else setHealth(healthRes.data);

      setIncidents(incRes.data || []);
      setErrors(errRes.data || []);
      setError24h(errCount.count || 0);
      setFailedAgents(agentRes.data || []);
      setDeadLetter(dlRes.data || []);
      setBacklog(backlogRes.count || 0);
      setFailedNotifications(notifRes.count || 0);
      setFailedWebhooks(whRes.data || []);
      setSecurityEvents(secRes.data || []);
      setDeployments(depRes.data || []);
      setRetention(retRes.data || []);
      setOverdueSessions(sessionRes.count || 0);

      setLoading(false);
    };
    load();
  }, []);

  const overallTone = health?.status === 'healthy' ? 'emerald' : health?.status === 'unavailable' ? 'red' : 'amber';
  const overallLabel = health?.status === 'healthy' ? 'Healthy' : health?.status === 'unavailable' ? 'Unavailable' : health?.status === 'degraded' ? 'Degraded' : 'Unknown';

  const timeAgo = (iso: string) => {
    const d = new Date(iso);
    return d.toLocaleString('en-GB', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="p-4 lg:p-6 max-w-7xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-white">Operations</h1>
        <p className="text-sm text-gray-500 mt-0.5">Production infrastructure, incidents and reliability</p>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-5">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="bg-[#111827] border border-gray-800 rounded-xl p-6 animate-pulse">
              <div className="h-4 bg-gray-800/60 rounded w-1/3 mb-4" />
              <div className="h-8 bg-gray-800/40 rounded w-1/2" />
            </div>
          ))}
        </div>
      ) : (
        <>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
            <div className="bg-[#111827] border border-gray-800 rounded-xl p-4 flex items-center gap-3">
              <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${overallTone === 'emerald' ? 'bg-emerald-600/15 text-emerald-400' : overallTone === 'red' ? 'bg-red-600/15 text-red-400' : 'bg-amber-600/15 text-amber-400'}`}>
                <div className="w-5 h-5 flex items-center justify-center"><i className="ri-heart-pulse-line"></i></div>
              </div>
              <div>
                <div className="text-[10px] text-gray-500 uppercase tracking-wider">Overall Status</div>
                <div className="text-lg font-bold text-white">{overallLabel}</div>
                {healthError && <div className="text-[10px] text-red-400">{healthError}</div>}
              </div>
            </div>
            <StatCard label="Active Incidents" value={incidents.length} tone={incidents.length > 0 ? 'red' : 'gray'} sub={incidents.length > 0 ? 'Requires attention' : 'All clear'} />
            <StatCard label="Errors (24h)" value={error24h} tone={error24h > 0 ? 'amber' : 'gray'} sub={error24h > 0 ? 'Recent telemetry' : 'No errors'} />
            <StatCard label="Webhook Backlog" value={backlog} tone={backlog > 0 ? 'amber' : 'gray'} sub={deadLetter.length > 0 ? `${deadLetter.length} dead-lettered` : 'Queue clear'} />
            <StatCard label="Failed Notifications" value={failedNotifications} tone={failedNotifications > 0 ? 'amber' : 'gray'} />
            <StatCard label="Failed Webhooks" value={failedWebhooks.length} tone={failedWebhooks.length > 0 ? 'red' : 'gray'} sub={failedWebhooks.length > 0 ? 'Stripe events' : 'Stripe healthy'} />
            <StatCard label="Overdue Lone Worker" value={overdueSessions} tone={overdueSessions > 0 ? 'red' : 'gray'} sub={overdueSessions > 0 ? 'Check in overdue' : 'No overdue sessions'} />
            <StatCard label="Failed Agents" value={failedAgents.length} tone={failedAgents.length > 0 ? 'amber' : 'gray'} sub={failedAgents.length > 0 ? 'Automation failures' : 'All healthy'} />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 mb-6">
            <div className="bg-[#111827] border border-gray-800 rounded-xl">
              <div className="px-5 py-4 border-b border-gray-800 flex items-center justify-between">
                <h3 className="text-white font-semibold text-sm">Provider Health</h3>
                {health && <span className="text-xs text-gray-500">{health.mode === 'ready' ? 'Live readiness check' : ''}</span>}
              </div>
              {!health ? (
                <div className="p-8 text-center text-sm text-gray-500">Health check unavailable</div>
              ) : (
                <div className="p-5 grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {Object.entries(health.checks || {}).map(([key, value]: [string, any]) => (
                    <div key={key} className="bg-gray-800/40 border border-gray-700/30 rounded-lg p-3">
                      <div className="flex items-center gap-2 mb-1">
                        <StateDot state={value.state} />
                        <span className="text-xs text-gray-400 capitalize">{key.replace(/_/g, ' ')}</span>
                      </div>
                      <span className={`text-sm font-semibold ${value.state === 'healthy' ? 'text-emerald-400' : value.state === 'unavailable' ? 'text-red-400' : value.state === 'degraded' ? 'text-amber-400' : 'text-gray-500'}`}>
                        {value.state.replace(/_/g, ' ')}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="bg-[#111827] border border-gray-800 rounded-xl">
              <div className="px-5 py-4 border-b border-gray-800 flex items-center justify-between">
                <h3 className="text-white font-semibold text-sm">Recent Deployments</h3>
                <span className="text-xs text-gray-500">{deployments.length} records</span>
              </div>
              <div className="divide-y divide-gray-800 max-h-[360px] overflow-y-auto">
                {deployments.length === 0 ? (
                  <div className="p-8 text-center text-sm text-gray-500">No deployments recorded yet</div>
                ) : (
                  deployments.map((d) => (
                    <div key={d.id} className="px-5 py-3 flex items-center justify-between">
                      <div className="min-w-0">
                        <div className="text-sm text-white truncate">{d.version || d.commit_sha || 'Unknown version'}</div>
                        <div className="text-xs text-gray-500">{d.environment} &middot; {timeAgo(d.deployed_at)}</div>
                      </div>
                      <span className={`inline-flex px-2 py-0.5 rounded text-[10px] font-medium ${d.status === 'deployed' ? 'text-emerald-400 bg-emerald-500/10' : 'text-amber-400 bg-amber-500/10'}`}>
                        {d.status}
                      </span>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 mb-6">
            <div className="bg-[#111827] border border-gray-800 rounded-xl">
              <div className="px-5 py-4 border-b border-gray-800 flex items-center justify-between">
                <h3 className="text-white font-semibold text-sm">Active Incidents</h3>
                <span className={`text-xs ${incidents.length > 0 ? 'text-red-400' : 'text-emerald-400'}`}>{incidents.length}</span>
              </div>
              <div className="divide-y divide-gray-800 max-h-[360px] overflow-y-auto">
                {incidents.length === 0 ? (
                  <div className="p-8 text-center text-sm text-gray-500">No active incidents</div>
                ) : (
                  incidents.map((inc) => (
                    <div key={inc.id} className="px-5 py-3">
                      <div className="flex items-center gap-2 mb-1">
                        <SeverityBadge severity={inc.severity} />
                        <span className="text-sm text-white font-medium">{inc.title}</span>
                      </div>
                      <div className="text-xs text-gray-500">{inc.provider ? `${inc.provider} · ` : ''}since {timeAgo(inc.started_at)}</div>
                    </div>
                  ))
                )}
              </div>
            </div>

            <div className="bg-[#111827] border border-gray-800 rounded-xl">
              <div className="px-5 py-4 border-b border-gray-800 flex items-center justify-between">
                <h3 className="text-white font-semibold text-sm">Recent Errors</h3>
                <span className="text-xs text-gray-500">{error24h} in 24h</span>
              </div>
              <div className="divide-y divide-gray-800 max-h-[360px] overflow-y-auto">
                {errors.length === 0 ? (
                  <div className="p-8 text-center text-sm text-gray-500">No errors captured</div>
                ) : (
                  errors.map((e) => (
                    <div key={e.id} className="px-5 py-3">
                      <div className="flex items-center gap-2 mb-1">
                        <SeverityBadge severity={e.severity} />
                        <span className="text-xs text-gray-500">{e.source}</span>
                        <span className="text-[10px] text-gray-600 ml-auto whitespace-nowrap">{timeAgo(e.created_at)}</span>
                      </div>
                      <div className="text-xs text-white truncate" title={e.message}>{e.message}</div>
                      {e.correlation_id && <div className="text-[10px] text-gray-600 font-mono truncate">{e.correlation_id}</div>}
                    </div>
                  ))
                )}
              </div>
            </div>

            <div className="bg-[#111827] border border-gray-800 rounded-xl">
              <div className="px-5 py-4 border-b border-gray-800 flex items-center justify-between">
                <h3 className="text-white font-semibold text-sm">Security Events</h3>
                <span className="text-xs text-gray-500">Recent</span>
              </div>
              <div className="divide-y divide-gray-800 max-h-[360px] overflow-y-auto">
                {securityEvents.length === 0 ? (
                  <div className="p-8 text-center text-sm text-gray-500">No security events</div>
                ) : (
                  securityEvents.map((s) => (
                    <div key={s.id} className="px-5 py-3">
                      <div className="flex items-center gap-2 mb-1">
                        <span className={`inline-flex px-2 py-0.5 rounded text-[10px] font-semibold ${s.is_confirmed_incident ? 'text-red-400 bg-red-500/10' : 'text-amber-400 bg-amber-500/10'}`}>
                          {s.is_confirmed_incident ? 'Incident' : 'Flag'}
                        </span>
                        <span className="text-xs text-white font-medium">{s.event_type}</span>
                        <span className="text-[10px] text-gray-600 ml-auto whitespace-nowrap">{timeAgo(s.created_at)}</span>
                      </div>
                      {s.description && <div className="text-xs text-gray-500 truncate">{s.description}</div>}
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
            <div className="bg-[#111827] border border-gray-800 rounded-xl">
              <div className="px-5 py-4 border-b border-gray-800 flex items-center justify-between">
                <h3 className="text-white font-semibold text-sm">Dead-lettered Events</h3>
                <span className={`text-xs ${deadLetter.length > 0 ? 'text-amber-400' : 'text-emerald-400'}`}>{deadLetter.length} queued</span>
              </div>
              <div className="divide-y divide-gray-800 max-h-[320px] overflow-y-auto">
                {deadLetter.length === 0 ? (
                  <div className="p-8 text-center text-sm text-gray-500">No dead-lettered events</div>
                ) : (
                  deadLetter.map((dl) => (
                    <div key={dl.id} className="px-5 py-3">
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-white">{dl.event_type}</span>
                        <span className="text-[10px] text-gray-600">{dl.agent_key}</span>
                        <span className="text-[10px] text-gray-500 ml-auto whitespace-nowrap">{timeAgo(dl.created_at)}</span>
                      </div>
                      {dl.last_error && <div className="text-xs text-red-400/80 truncate mt-1" title={dl.last_error}>{dl.last_error}</div>}
                    </div>
                  ))
                )}
              </div>
            </div>

            <div className="bg-[#111827] border border-gray-800 rounded-xl">
              <div className="px-5 py-4 border-b border-gray-800 flex items-center justify-between">
                <h3 className="text-white font-semibold text-sm">Retention Configuration</h3>
                <span className="text-xs text-gray-500">Days</span>
              </div>
              <div className="divide-y divide-gray-800 max-h-[320px] overflow-y-auto">
                {retention.length === 0 ? (
                  <div className="p-8 text-center text-sm text-gray-500">No retention rules configured</div>
                ) : (
                  retention.map((r) => (
                    <div key={r.id} className="px-5 py-3 flex items-center justify-between">
                      <div className="min-w-0">
                        <div className="text-xs text-white truncate">{r.record_category.replace(/_/g, ' ')}</div>
                        <div className="text-[10px] text-gray-600">{r.legal_review_required ? 'Legal review required' : 'Operational'}</div>
                      </div>
                      <div className="flex items-center gap-2 flex-shrink-0 ml-4">
                        {!r.is_enabled && <span className="text-[10px] text-gray-600">disabled</span>}
                        <span className="text-sm font-semibold text-white">{r.retention_days}d</span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}