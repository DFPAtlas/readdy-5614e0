'use client';

import { useState, useEffect } from 'react';
import { useSystemHealth } from '@/lib/useSuperAdmin';
import { supabase } from '@/lib/supabase';
import Link from 'next/link';

function HealthGauge({ score }: { score: number }) {
  const color = score >= 85 ? 'text-emerald-400' : score >= 65 ? 'text-amber-400' : 'text-red-400';
  const bg = score >= 85 ? 'bg-emerald-500/20' : score >= 65 ? 'bg-amber-500/20' : 'bg-red-500/20';
  const stroke = score >= 85 ? '#34d399' : score >= 65 ? '#fbbf24' : '#f87171';
  const radius = 56;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (score / 100) * circumference;

  return (
    <div className="flex flex-col items-center">
      <div className="relative w-36 h-36">
        <svg className="w-full h-full -rotate-90" viewBox="0 0 128 128">
          <circle cx="64" cy="64" r={radius} fill="none" stroke="#1e293b" strokeWidth="10" />
          <circle
            cx="64" cy="64" r={radius} fill="none" stroke={stroke} strokeWidth="10"
            strokeLinecap="round" strokeDasharray={circumference} strokeDashoffset={offset}
            className="transition-all duration-1000 ease-out"
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <span className={`text-3xl font-bold ${color}`}>{score}</span>
        </div>
      </div>
      <span className="text-xs text-gray-500 mt-2">out of 100</span>
    </div>
  );
}

function StatPill({ label, value, color, sub }: { label: string; value: string | number; color: string; sub?: string }) {
  const colors: Record<string, string> = {
    emerald: 'border-emerald-600/20 bg-emerald-600/5',
    blue: 'border-blue-600/20 bg-blue-600/5',
    indigo: 'border-indigo-600/20 bg-indigo-600/5',
    amber: 'border-amber-600/20 bg-amber-600/5',
    red: 'border-red-600/20 bg-red-600/5',
    purple: 'border-purple-600/20 bg-purple-600/5',
    gray: 'border-gray-600/20 bg-gray-600/5',
  };
  const textColors: Record<string, string> = {
    emerald: 'text-emerald-400',
    blue: 'text-blue-400',
    indigo: 'text-indigo-400',
    amber: 'text-amber-400',
    red: 'text-red-400',
    purple: 'text-purple-400',
    gray: 'text-gray-400',
  };

  return (
    <div className={`border rounded-xl p-4 ${colors[color] || colors.gray}`}>
      <div className="text-xs text-gray-500 uppercase tracking-wider mb-1">{label}</div>
      <div className={`text-xl font-bold ${textColors[color] || textColors.gray}`}>{value}</div>
      {sub && <div className="text-xs text-gray-600 mt-0.5">{sub}</div>}
    </div>
  );
}

interface WebhookEvent {
  id: string;
  stripe_event_id: string;
  type: string;
  livemode: boolean;
  processed_at: string | null;
  error: string | null;
  received_at: string;
}

export default function SystemHealthPage() {
  const { health, loading } = useSystemHealth();
  const [recentWebhooks, setRecentWebhooks] = useState<WebhookEvent[]>([]);
  const [webhooksLoading, setWebhooksLoading] = useState(true);
  const [failedAgents, setFailedAgents] = useState<any[]>([]);
  const [agentsLoading, setAgentsLoading] = useState(true);

  useEffect(() => {
    const fetchWebhooks = async () => {
      setWebhooksLoading(true);
      const { data } = await supabase
        .from('billing_webhook_events')
        .select('*')
        .order('received_at', { ascending: false })
        .limit(50);
      setRecentWebhooks(data || []);
      setWebhooksLoading(false);
    };
    const fetchFailedAgents = async () => {
      setAgentsLoading(true);
      const { data } = await supabase
        .from('agent_execution_logs')
        .select('*')
        .eq('status', 'failed')
        .order('created_at', { ascending: false })
        .limit(20);
      setFailedAgents(data || []);
      setAgentsLoading(false);
    };
    fetchWebhooks();
    fetchFailedAgents();
  }, []);

  const webhookSuccessRate = health.webhookTotal > 0
    ? Math.round(((health.webhookTotal - health.webhookFailed) / health.webhookTotal) * 100)
    : 100;

  const webhook24hSuccessRate = health.webhookLast24h > 0
    ? Math.round(((health.webhookLast24h - health.webhookFailed24h) / health.webhookLast24h) * 100)
    : 100;

  const formatMoney = (pence: number) =>
    `£${(pence / 100).toLocaleString('en-GB', { minimumFractionDigits: 2 })}`;

  return (
    <div className="p-4 lg:p-6 max-w-7xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-white">System Health</h1>
        <p className="text-sm text-gray-500 mt-0.5">
          Platform-wide diagnostics and monitoring
          {!loading && health.dbResponseMs !== null && (
            <span className="ml-3 text-xs text-gray-600">
              DB response: {health.dbResponseMs}ms
            </span>
          )}
        </p>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
          <div className="lg:col-span-1 bg-[#111827] border border-gray-800 rounded-xl p-8 flex items-center justify-center">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-indigo-500" />
          </div>
          <div className="lg:col-span-2 space-y-5">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="bg-[#111827] border border-gray-800 rounded-xl p-6 animate-pulse">
                <div className="h-4 bg-gray-800/60 rounded w-1/3 mb-4" />
                <div className="h-20 bg-gray-800/40 rounded" />
              </div>
            ))}
          </div>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 mb-6">
            <div className="bg-[#111827] border border-gray-800 rounded-xl p-6 flex flex-col items-center justify-center">
              <div className="text-xs text-gray-500 uppercase tracking-wider mb-4">Platform Health Score</div>
              <HealthGauge score={health.healthScore} />
              <div className="mt-3">
                {health.healthScore >= 85 ? (
                  <span className="text-xs text-emerald-400 font-medium">Healthy</span>
                ) : health.healthScore >= 65 ? (
                  <span className="text-xs text-amber-400 font-medium">Needs Attention</span>
                ) : (
                  <span className="text-xs text-red-400 font-medium">Critical</span>
                )}
              </div>
            </div>

            <div className="lg:col-span-2 grid grid-cols-2 sm:grid-cols-4 gap-3">
              <StatPill label="Companies" value={health.totalCompanies} color="indigo" sub={`${health.activeCompanies} active`} />
              <StatPill label="Users" value={health.totalUsers} color="blue" sub={`${health.activeUsersToday} active today`} />
              <StatPill label="Guards" value={health.totalGuards} color="emerald" />
              <StatPill label="Sites" value={health.totalSites} color="purple" />
              <StatPill label="Open Tickets" value={health.openTickets} color={health.urgentTickets > 0 ? 'red' : 'amber'} sub={health.urgentTickets > 0 ? `${health.urgentTickets} urgent` : undefined} />
              <StatPill label="Failed Billing" value={health.failedBilling} color={health.failedBilling > 0 ? 'red' : 'gray'} />
              <StatPill label="Overdue" value={formatMoney(health.overdueAmount)} color={health.overdueAmount > 0 ? 'red' : 'gray'} />
              <StatPill label="DB Response" value={`${health.dbResponseMs}ms`} color={health.dbResponseMs && health.dbResponseMs < 500 ? 'emerald' : health.dbResponseMs && health.dbResponseMs < 1000 ? 'amber' : 'red'} />
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 mb-6">
            <div className="bg-[#111827] border border-gray-800 rounded-xl">
              <div className="px-5 py-4 border-b border-gray-800 flex items-center justify-between">
                <h3 className="text-white font-semibold text-sm">Webhook Health</h3>
                <span className="text-xs text-gray-500">{health.webhookTotal} total events</span>
              </div>
              <div className="p-5 space-y-4">
                <div className="grid grid-cols-3 gap-3">
                  <div className="text-center">
                    <div className="text-xs text-gray-500 mb-1">Success Rate</div>
                    <div className={`text-xl font-bold ${webhookSuccessRate >= 95 ? 'text-emerald-400' : 'text-amber-400'}`}>
                      {webhookSuccessRate}%
                    </div>
                  </div>
                  <div className="text-center">
                    <div className="text-xs text-gray-500 mb-1">Last 24h Rate</div>
                    <div className={`text-xl font-bold ${webhook24hSuccessRate >= 95 ? 'text-emerald-400' : 'text-amber-400'}`}>
                      {webhook24hSuccessRate}%
                    </div>
                  </div>
                  <div className="text-center">
                    <div className="text-xs text-gray-500 mb-1">Failed Events</div>
                    <div className={`text-xl font-bold ${health.webhookFailed > 0 ? 'text-red-400' : 'text-emerald-400'}`}>
                      {health.webhookFailed}
                    </div>
                  </div>
                </div>

                <div className="w-full bg-gray-800 rounded-full h-2 overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-700 ${webhookSuccessRate >= 95 ? 'bg-emerald-500' : 'bg-amber-500'}`}
                    style={{ width: `${webhookSuccessRate}%` }}
                  />
                </div>

                <div className="text-xs text-gray-600">
                  {health.webhookLast24h} events received in the last 24 hours
                  {health.webhookFailed24h > 0 && (
                    <span className="text-red-400 ml-1">({health.webhookFailed24h} failed)</span>
                  )}
                </div>
              </div>
            </div>

            <div className="bg-[#111827] border border-gray-800 rounded-xl">
              <div className="px-5 py-4 border-b border-gray-800 flex items-center justify-between">
                <h3 className="text-white font-semibold text-sm">Score Breakdown</h3>
              </div>
              <div className="p-5 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-gray-400">Billing Health (30%)</span>
                  <div className="flex items-center gap-2">
                    <div className="w-24 bg-gray-800 rounded-full h-1.5 overflow-hidden">
                      <div className="h-full bg-emerald-500 rounded-full" style={{ width: `${Math.min(100, ((health.totalCompanies - health.failedBilling) / Math.max(1, health.totalCompanies)) * 100)}%` }} />
                    </div>
                    <span className="text-xs text-gray-500 w-8 text-right">
                      {Math.round(((health.totalCompanies - health.failedBilling) / Math.max(1, health.totalCompanies)) * 30)}
                    </span>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-gray-400">Webhook Health (20%)</span>
                  <div className="flex items-center gap-2">
                    <div className="w-24 bg-gray-800 rounded-full h-1.5 overflow-hidden">
                      <div className="h-full bg-emerald-500 rounded-full" style={{ width: `${webhookSuccessRate}%` }} />
                    </div>
                    <span className="text-xs text-gray-500 w-8 text-right">
                      {Math.round(webhookSuccessRate * 0.2)}
                    </span>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-gray-400">Ticket Health (20%)</span>
                  <div className="flex items-center gap-2">
                    <div className="w-24 bg-gray-800 rounded-full h-1.5 overflow-hidden">
                      <div className="h-full bg-emerald-500 rounded-full" style={{ width: `${Math.max(0, 100 - (health.openTickets / Math.max(1, health.totalTickets)) * 100)}%` }} />
                    </div>
                    <span className="text-xs text-gray-500 w-8 text-right">
                      {Math.round(Math.max(0, 100 - (health.openTickets / Math.max(1, health.totalTickets)) * 40) * 0.2)}
                    </span>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-gray-400">DB Performance (15%)</span>
                  <div className="flex items-center gap-2">
                    <div className="w-24 bg-gray-800 rounded-full h-1.5 overflow-hidden">
                      <div className={`h-full rounded-full ${health.dbResponseMs && health.dbResponseMs < 500 ? 'bg-emerald-500' : 'bg-amber-500'}`} style={{ width: `${health.dbResponseMs ? Math.max(0, 100 - health.dbResponseMs / 20) : 100}%` }} />
                    </div>
                    <span className="text-xs text-gray-500 w-8 text-right">
                      {Math.round((health.dbResponseMs ? Math.max(0, 100 - health.dbResponseMs / 20) : 100) * 0.15)}
                    </span>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-gray-400">Platform Activity (15%)</span>
                  <div className="flex items-center gap-2">
                    <div className="w-24 bg-gray-800 rounded-full h-1.5 overflow-hidden">
                      <div className="h-full bg-emerald-500 rounded-full" style={{ width: `${health.activeCompanies > 0 ? 100 : 0}%` }} />
                    </div>
                    <span className="text-xs text-gray-500 w-8 text-right">{health.activeCompanies > 0 ? 15 : 0}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
            <div className="bg-[#111827] border border-gray-800 rounded-xl">
              <div className="px-5 py-4 border-b border-gray-800 flex items-center justify-between">
                <h3 className="text-white font-semibold text-sm">Edge Functions</h3>
                <Link href="/admin/evidence-audit" className="text-xs text-indigo-400 hover:text-indigo-300 cursor-pointer">Evidence Audit</Link>
              </div>
              <div className="p-5">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-80 overflow-y-auto">
                  {health.edgeFunctions.map((fn) => (
                    <div key={fn.slug} className="flex items-center gap-2 px-3 py-2 bg-gray-800/30 rounded-lg">
                      <div className="w-2 h-2 rounded-full bg-emerald-500 flex-shrink-0" />
                      <div className="min-w-0">
                        <div className="text-xs text-white truncate">{fn.name}</div>
                        <div className="text-[10px] text-gray-600 font-mono">{fn.slug}</div>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="mt-3 pt-3 border-t border-gray-800 text-xs text-gray-600">
                  {health.edgeFunctions.length} functions registered
                </div>
              </div>
            </div>

            <div className="bg-[#111827] border border-gray-800 rounded-xl">
              <div className="px-5 py-4 border-b border-gray-800 flex items-center justify-between">
                <h3 className="text-white font-semibold text-sm">Failed Agent Executions</h3>
                <span className={`text-xs ${failedAgents.length > 0 ? 'text-red-400' : 'text-emerald-400'}`}>
                  {failedAgents.length > 0 ? `${failedAgents.length} failures` : 'All clear'}
                </span>
              </div>
              <div className="max-h-80 overflow-y-auto">
                {agentsLoading ? (
                  <div className="p-8 text-center">
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-indigo-500 mx-auto" />
                  </div>
                ) : failedAgents.length === 0 ? (
                  <div className="p-8 text-center">
                    <div className="w-12 h-12 rounded-full bg-emerald-500/10 flex items-center justify-center mx-auto mb-2">
                      <div className="w-6 h-6 flex items-center justify-center text-emerald-400">
                        <i className="ri-robot-line text-xl"></i>
                      </div>
                    </div>
                    <p className="text-sm text-gray-400">No failed agent executions</p>
                    <p className="text-xs text-gray-600 mt-1">All AI agents are running normally</p>
                  </div>
                ) : (
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="text-left text-[10px] text-gray-500 uppercase tracking-wider border-b border-gray-800">
                        <th className="px-4 py-2 font-medium">Agent</th>
                        <th className="px-4 py-2 font-medium">Error</th>
                        <th className="px-4 py-2 font-medium">Time</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-800/50">
                      {failedAgents.map((a) => (
                        <tr key={a.id} className="group hover:bg-red-500/[0.03]">
                          <td className="px-4 py-2.5">
                            <div className="flex items-center gap-2">
                              <div className="w-1.5 h-1.5 rounded-full bg-red-400 flex-shrink-0"></div>
                              <div>
                                <div className="text-xs text-white truncate max-w-[140px]">{a.agent_key}</div>
                                {a.requested_page && (
                                  <div className="text-[10px] text-gray-600">{a.requested_page}</div>
                                )}
                              </div>
                            </div>
                          </td>
                          <td className="px-4 py-2.5">
                            <div className="text-xs text-red-400/80 truncate max-w-[200px]" title={a.error_message}>
                              {a.error_message || 'Unknown error'}
                            </div>
                          </td>
                          <td className="px-4 py-2.5 text-[10px] text-gray-500 whitespace-nowrap">
                            {new Date(a.created_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
            <div className="bg-[#111827] border border-gray-800 rounded-xl">
              <div className="px-5 py-4 border-b border-gray-800 flex items-center justify-between">
                <h3 className="text-white font-semibold text-sm">Recent Webhook Events</h3>
                <span className="text-xs text-gray-500">Last 50</span>
              </div>
              <div className="max-h-80 overflow-y-auto">
                {webhooksLoading ? (
                  <div className="p-8 text-center">
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-indigo-500 mx-auto" />
                  </div>
                ) : recentWebhooks.length === 0 ? (
                  <div className="p-8 text-center text-sm text-gray-500">No webhook events yet</div>
                ) : (
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="text-left text-[10px] text-gray-500 uppercase tracking-wider border-b border-gray-800">
                        <th className="px-4 py-2 font-medium">Event</th>
                        <th className="px-4 py-2 font-medium">Status</th>
                        <th className="px-4 py-2 font-medium">Time</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-800/50">
                      {recentWebhooks.map((ev) => (
                        <tr key={ev.id} className="group">
                          <td className="px-4 py-2.5">
                            <div className="text-xs text-white truncate max-w-[200px]">{ev.type}</div>
                            <div className="text-[10px] text-gray-600 font-mono truncate max-w-[200px]">{ev.stripe_event_id}</div>
                          </td>
                          <td className="px-4 py-2.5">
                            {ev.error ? (
                              <span className="inline-flex px-1.5 py-0.5 rounded text-[10px] font-medium text-red-400 bg-red-500/10" title={ev.error}>
                                Failed
                              </span>
                            ) : (
                              <span className="inline-flex px-1.5 py-0.5 rounded text-[10px] font-medium text-emerald-400 bg-emerald-500/10">
                                OK
                              </span>
                            )}
                          </td>
                          <td className="px-4 py-2.5 text-[10px] text-gray-500 whitespace-nowrap">
                            {new Date(ev.received_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}