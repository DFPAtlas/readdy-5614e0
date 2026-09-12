'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useSuperAdminStats, useSuperAdminCompanies, useAdminActivity } from '@/lib/useSuperAdmin';
import { useCommandCentreFinancials, useCommandCentreAgents, useCommandCentreClientActivity, useCommandCentrePlatformHealth } from '@/lib/useSuperAdminCommandCentre';
import { StatCard, StatusBadge, PlanBadge, EmptyState } from './components/AdminUI';
import SignupChart from './components/SignupChart';
import { supabase } from '@/lib/supabase';
import SuperAdminACSOverview from './components/SuperAdminACSOverview';

export default function AdminOverviewPage() {
  const { stats, loading: statsLoading } = useSuperAdminStats();
  const { companies } = useSuperAdminCompanies();
  const { logs } = useAdminActivity();
  const { financials, loading: finLoading } = useCommandCentreFinancials();
  const { agents, loading: agentLoading } = useCommandCentreAgents();
  const { clientActivity, loading: caLoading } = useCommandCentreClientActivity();
  const { platformHealth, loading: phLoading } = useCommandCentrePlatformHealth();

  const [mrrTotal, setMrrTotal] = useState(0);
  const [supportQueue, setSupportQueue] = useState(0);
  const [urgentTickets, setUrgentTickets] = useState(0);

  useEffect(() => {
    const fetchExtras = async () => {
      const { data: mrr } = await supabase.from('v_billing_mrr_current').select('active_subs');
      const { count: openCount } = await supabase.from('support_tickets').select('*', { count: 'exact', head: true }).in('status', ['new', 'open']);
      const { count: urgentCount } = await supabase.from('support_tickets').select('*', { count: 'exact', head: true }).eq('priority', 'urgent').in('status', ['new', 'open', 'in_progress']);
      setMrrTotal((mrr || []).reduce((s: number, r: any) => s + (r.active_subs || 0), 0));
      setSupportQueue(openCount || 0);
      setUrgentTickets(urgentCount || 0);
    };
    fetchExtras();
  }, []);

  const fmt = (pence: number) => `£${(pence / 100).toLocaleString('en-GB', { minimumFractionDigits: 2 })}`;

  const webhookSuccessRate = financials.webhookTotal > 0
    ? Math.round(((financials.webhookTotal - financials.webhookFailed) / financials.webhookTotal) * 100)
    : 100;

  const recentSignups = companies.slice(0, 6);
  const alerts = companies.filter(c =>
    c.account_status === 'pending_setup' ||
    c.account_status === 'suspended' ||
    (c.trial_ends_at && new Date(c.trial_ends_at) < new Date(Date.now() + 3 * 24 * 60 * 60 * 1000)) ||
    c.subscription_status === 'past_due' ||
    c.subscription_status === 'unpaid'
  ).slice(0, 6);

  const latestLog = logs.slice(0, 6);

  const planBreakdown = {
    sentinel: companies.filter(c => (c.plan_name || c.subscription_plan) === 'sentinel').length,
    watcher: companies.filter(c => (c.plan_name || c.subscription_plan) === 'watcher').length,
    guardian: companies.filter(c => (c.plan_name || c.subscription_plan) === 'guardian').length,
    enterprise: companies.filter(c => (c.plan_name || c.subscription_plan) === 'enterprise').length,
  };

  const topClients = [...companies]
    .filter(c => c.site_count > 0 || c.user_count > 0)
    .sort((a, b) => (b.site_count + b.user_count) - (a.site_count + a.user_count))
    .slice(0, 6);

  return (
    <div className="p-4 lg:p-6 max-w-7xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-white">Super Admin Command Centre</h1>
          <p className="text-sm text-gray-500 mt-0.5">GuardianHub platform-wide oversight and control</p>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs text-gray-500">{companies.length} clients</span>
          <span className="w-px h-3 bg-gray-700"></span>
          <span className="text-xs text-gray-500">{stats.totalSites} sites</span>
          <span className="w-px h-3 bg-gray-700"></span>
          <span className="text-xs text-gray-500">{stats.totalUsers} users</span>
        </div>
        <div className="flex items-center gap-2">
          <Link href="/admin/evidence-audit" className="text-xs text-indigo-400 hover:text-indigo-300 cursor-pointer">Evidence Audit</Link>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 mb-5">
        <Link href="/super-admin/financial" className="bg-[#111827] border border-emerald-600/20 rounded-xl p-4 hover:border-emerald-600/40 transition-all cursor-pointer">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-7 h-7 rounded-lg bg-emerald-600/15 flex items-center justify-center text-emerald-400">
              <div className="w-4 h-4 flex items-center justify-center"><i className="ri-money-pound-circle-line"></i></div>
            </div>
            <span className="text-[10px] text-gray-500 uppercase tracking-wider">Monthly Revenue</span>
          </div>
          <div className="text-lg font-bold text-white">{fmt(financials.revenueThisMonth)}</div>
          <div className="text-[10px] text-gray-600 mt-0.5">{financials.activeSubs} active subs</div>
        </Link>

        <Link href="/super-admin/financial/failed" className="bg-[#111827] border border-indigo-600/20 rounded-xl p-4 hover:border-indigo-600/40 transition-all cursor-pointer">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-7 h-7 rounded-lg bg-indigo-600/15 flex items-center justify-center text-indigo-400">
              <div className="w-4 h-4 flex items-center justify-center"><i className="ri-briefcase-line"></i></div>
            </div>
            <span className="text-[10px] text-gray-500 uppercase tracking-wider">Active Companies</span>
          </div>
          <div className="text-lg font-bold text-white">{stats.activeClients}</div>
          <div className="text-[10px] text-gray-600 mt-0.5">of {stats.totalClients} total</div>
        </Link>

        <Link href="/admin/guards" className="bg-[#111827] border border-blue-600/20 rounded-xl p-4 hover:border-blue-600/40 transition-all cursor-pointer">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-7 h-7 rounded-lg bg-blue-600/15 flex items-center justify-center text-blue-400">
              <div className="w-4 h-4 flex items-center justify-center"><i className="ri-shield-user-line"></i></div>
            </div>
            <span className="text-[10px] text-gray-500 uppercase tracking-wider">Active Guards</span>
          </div>
          <div className="text-lg font-bold text-white">{stats.totalGuards}</div>
          <div className="text-[10px] text-indigo-400 mt-0.5">View all</div>
        </Link>

        <Link href="/super-admin/support" className="bg-[#111827] border rounded-xl p-4 hover:border-amber-600/40 transition-all cursor-pointer border-amber-600/20">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-7 h-7 rounded-lg bg-amber-600/15 flex items-center justify-center text-amber-400">
              <div className="w-4 h-4 flex items-center justify-center"><i className="ri-customer-service-line"></i></div>
            </div>
            <span className="text-[10px] text-gray-500 uppercase tracking-wider">Support Queue</span>
          </div>
          <div className="text-lg font-bold text-amber-400">{supportQueue}</div>
          <div className="text-[10px] text-gray-600 mt-0.5">{urgentTickets > 0 ? `${urgentTickets} urgent` : 'All clear'}</div>
        </Link>

        <Link href="/admin/system-health" className="bg-[#111827] border rounded-xl p-4 hover:border-red-600/40 transition-all cursor-pointer border-red-600/20">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-7 h-7 rounded-lg bg-red-600/15 flex items-center justify-center text-red-400">
              <div className="w-4 h-4 flex items-center justify-center"><i className="ri-webhook-line"></i></div>
            </div>
            <span className="text-[10px] text-gray-500 uppercase tracking-wider">Failed Webhooks</span>
          </div>
          <div className={`text-lg font-bold ${financials.webhookFailed > 0 ? 'text-red-400' : 'text-white'}`}>{financials.webhookFailed}</div>
          <div className="text-[10px] text-gray-600 mt-0.5">{financials.webhookTotal} total</div>
        </Link>

        <Link href="/admin/agents" className="bg-[#111827] border rounded-xl p-4 hover:border-purple-600/40 transition-all cursor-pointer border-purple-600/20">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-7 h-7 rounded-lg bg-purple-600/15 flex items-center justify-center text-purple-400">
              <div className="w-4 h-4 flex items-center justify-center"><i className="ri-robot-line"></i></div>
            </div>
            <span className="text-[10px] text-gray-500 uppercase tracking-wider">Agent Health</span>
          </div>
          <div className={`text-lg font-bold ${agents.failed24h > 0 ? 'text-amber-400' : 'text-emerald-400'}`}>
            {agents.enabled}/{agents.registered}
          </div>
          <div className="text-[10px] text-gray-600 mt-0.5">{agents.failed24h > 0 ? `${agents.failed24h} failed 24h` : 'All healthy'}</div>
        </Link>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4 mb-6">
        <StatCard label="Total Clients" value={stats.totalClients} icon="ri-briefcase-line" color="indigo" href="/admin/clients" />
        <StatCard label="Active" value={stats.activeClients} icon="ri-check-line" color="emerald" href="/admin/clients" />
        <StatCard label="Pending Setup" value={stats.pendingSetup} icon="ri-time-line" color="amber" href="/admin/clients" />
        <StatCard label="Suspended" value={stats.suspended} icon="ri-pause-circle-line" color="red" />
        <StatCard label="Cancelled" value={stats.cancelled} icon="ri-close-circle-line" color="gray" />
        <StatCard label="Total Sites" value={stats.totalSites} icon="ri-building-line" color="blue" href="/admin/sites" />
        <StatCard label="Total Users" value={stats.totalUsers} icon="ri-team-line" color="purple" href="/admin/users" />
        <StatCard label="Total Guards" value={stats.totalGuards} icon="ri-shield-user-line" color="blue" />
        <StatCard label="Trial" value={stats.trialCount} icon="ri-rocket-line" color="emerald" />
        <StatCard label="Failed Billing" value={stats.failedBilling} icon="ri-error-warning-line" color={stats.failedBilling > 0 ? 'red' : 'gray'} href="/super-admin/financial/failed" />
      </div>

      <div className="grid lg:grid-cols-3 gap-5 mb-5">
        <div className="lg:col-span-2 bg-[#111827] border border-gray-800 rounded-xl">
          <div className="px-5 py-4 border-b border-gray-800 flex items-center justify-between">
            <h3 className="text-white font-semibold text-sm">Financial Summary</h3>
            <Link href="/super-admin/financial" className="text-xs text-indigo-400 hover:text-indigo-300 cursor-pointer">Full financials</Link>
          </div>
          <div className="p-5">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <Link href="/super-admin/financial" className="bg-gray-800/40 border border-gray-700/30 rounded-lg p-3 hover:border-emerald-600/30 transition-all cursor-pointer">
                <div className="text-[10px] text-gray-500 uppercase tracking-wider mb-1">Current MRR</div>
                <div className="text-base font-bold text-emerald-400">{fmt(financials.mrrTotal)}</div>
                <div className="text-[10px] text-gray-600 mt-0.5">{financials.activeSubs} active</div>
              </Link>
              <Link href="/super-admin/financial/failed" className="bg-gray-800/40 border border-gray-700/30 rounded-lg p-3 hover:border-red-600/30 transition-all cursor-pointer">
                <div className="text-[10px] text-gray-500 uppercase tracking-wider mb-1">Failed Payments</div>
                <div className={`text-base font-bold ${financials.failedPayments > 0 ? 'text-red-400' : 'text-gray-400'}`}>{financials.failedPayments}</div>
                <div className="text-[10px] text-gray-600 mt-0.5">{fmt(financials.overdueTotal)} overdue</div>
              </Link>
              <Link href="/super-admin/financial/refunds" className="bg-gray-800/40 border border-gray-700/30 rounded-lg p-3 hover:border-amber-600/30 transition-all cursor-pointer">
                <div className="text-[10px] text-gray-500 uppercase tracking-wider mb-1">Refunds (Month)</div>
                <div className={`text-base font-bold ${financials.refundsThisMonth > 0 ? 'text-amber-400' : 'text-gray-400'}`}>{fmt(financials.refundsThisMonth)}</div>
                <div className="text-[10px] text-gray-600 mt-0.5">{financials.disputesOpen} disputes open</div>
              </Link>
              <Link href="/super-admin/financial/tax" className="bg-gray-800/40 border border-gray-700/30 rounded-lg p-3 hover:border-purple-600/30 transition-all cursor-pointer">
                <div className="text-[10px] text-gray-500 uppercase tracking-wider mb-1">VAT (Month)</div>
                <div className="text-base font-bold text-purple-400">{fmt(financials.vatThisMonth)}</div>
                <div className="text-[10px] text-gray-600 mt-0.5">{financials.trialingSubs} trialing</div>
              </Link>
            </div>
            <div className="mt-4 flex items-center gap-2">
              <div className="flex-1 bg-gray-800 rounded-full h-2 overflow-hidden">
                <div className={`h-full rounded-full transition-all ${webhookSuccessRate >= 95 ? 'bg-emerald-500' : 'bg-amber-500'}`} style={{ width: `${webhookSuccessRate}%` }} />
              </div>
              <span className="text-xs text-gray-500 whitespace-nowrap">Webhook: {webhookSuccessRate}% ({financials.webhookLast24h} in 24h)</span>
            </div>
          </div>
        </div>

        <div className="bg-[#111827] border border-gray-800 rounded-xl">
          <div className="px-5 py-4 border-b border-gray-800">
            <h3 className="text-white font-semibold text-sm">Plan Breakdown</h3>
          </div>
          <div className="p-5 space-y-3">
            {Object.entries(planBreakdown).map(([plan, count]) => (
              <div key={plan} className="flex items-center justify-between">
                <PlanBadge plan={plan} />
                <span className="text-sm font-semibold text-white">{count}</span>
              </div>
            ))}
            <div className="pt-2 border-t border-gray-800 flex items-center justify-between">
              <span className="text-xs text-gray-500">Total</span>
              <span className="text-sm font-semibold text-white">{companies.length}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-5 mb-5">
        <div className="bg-[#111827] border border-gray-800 rounded-xl">
          <div className="px-5 py-4 border-b border-gray-800 flex items-center justify-between">
            <h3 className="text-white font-semibold text-sm">Platform Health</h3>
            <Link href="/admin/system-health" className="text-xs text-indigo-400 hover:text-indigo-300 cursor-pointer">Full report</Link>
          </div>
          <div className="p-5">
            <div className="grid grid-cols-2 gap-3 mb-4">
              <div className={`border rounded-lg p-3 ${platformHealth.dbReachable ? 'border-emerald-600/20 bg-emerald-600/5' : 'border-red-600/20 bg-red-600/5'}`}>
                <div className="flex items-center gap-2 mb-1">
                  <div className={`w-2 h-2 rounded-full ${platformHealth.dbReachable ? 'bg-emerald-400' : 'bg-red-400'}`}></div>
                  <span className="text-xs text-gray-400">Database</span>
                </div>
                <span className={`text-sm font-semibold ${platformHealth.dbReachable ? 'text-emerald-400' : 'text-red-400'}`}>
                  {platformHealth.dbReachable ? `${platformHealth.dbResponseMs}ms` : 'Unreachable'}
                </span>
              </div>
              <div className={`border rounded-lg p-3 ${platformHealth.authReachable ? 'border-emerald-600/20 bg-emerald-600/5' : 'border-red-600/20 bg-red-600/5'}`}>
                <div className="flex items-center gap-2 mb-1">
                  <div className={`w-2 h-2 rounded-full ${platformHealth.authReachable ? 'bg-emerald-400' : 'bg-red-400'}`}></div>
                  <span className="text-xs text-gray-400">Auth Service</span>
                </div>
                <span className={`text-sm font-semibold ${platformHealth.authReachable ? 'text-emerald-400' : 'text-red-400'}`}>
                  {platformHealth.authReachable ? 'Reachable' : 'Unreachable'}
                </span>
              </div>
              <div className={`border rounded-lg p-3 ${webhookSuccessRate >= 95 ? 'border-emerald-600/20 bg-emerald-600/5' : 'border-amber-600/20 bg-amber-600/5'}`}>
                <div className="flex items-center gap-2 mb-1">
                  <div className={`w-2 h-2 rounded-full ${webhookSuccessRate >= 95 ? 'bg-emerald-400' : 'bg-amber-400'}`}></div>
                  <span className="text-xs text-gray-400">Stripe Webhooks</span>
                </div>
                <span className={`text-sm font-semibold ${webhookSuccessRate >= 95 ? 'text-emerald-400' : 'text-amber-400'}`}>
                  {webhookSuccessRate}% success
                </span>
              </div>
              <div className={`border rounded-lg p-3 ${platformHealth.agentFailures24h === 0 ? 'border-emerald-600/20 bg-emerald-600/5' : 'border-red-600/20 bg-red-600/5'}`}>
                <div className="flex items-center gap-2 mb-1">
                  <div className={`w-2 h-2 rounded-full ${platformHealth.agentFailures24h === 0 ? 'bg-emerald-400' : 'bg-red-400'}`}></div>
                  <span className="text-xs text-gray-400">Agent Failures (24h)</span>
                </div>
                <span className={`text-sm font-semibold ${platformHealth.agentFailures24h === 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                  {platformHealth.agentFailures24h}
                </span>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="flex items-center justify-between text-gray-400">
                <span>Support Backlog</span>
                <span className={platformHealth.supportBacklog > 0 ? 'text-amber-400 font-medium' : 'text-gray-500'}>{platformHealth.supportBacklog}</span>
              </div>
              <div className="flex items-center justify-between text-gray-400">
                <span>Email Failures (24h)</span>
                <span className={platformHealth.emailFailures24h > 0 ? 'text-red-400 font-medium' : 'text-gray-500'}>{platformHealth.emailFailures24h}</span>
              </div>
            </div>
            {platformHealth.recentErrors.length > 0 && (
              <div className="mt-3 pt-3 border-t border-gray-800">
                <p className="text-[10px] text-gray-500 uppercase tracking-wider mb-2">Recent Webhook Errors</p>
                {platformHealth.recentErrors.slice(0, 3).map((e, i) => (
                  <div key={i} className="text-xs text-red-400/80 truncate mb-1">{e.message}</div>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="bg-[#111827] border border-gray-800 rounded-xl">
          <div className="px-5 py-4 border-b border-gray-800 flex items-center justify-between">
            <h3 className="text-white font-semibold text-sm">Agent Monitoring</h3>
            <Link href="/admin/agents" className="text-xs text-indigo-400 hover:text-indigo-300 cursor-pointer">View all</Link>
          </div>
          <div className="p-5">
            <div className="grid grid-cols-4 gap-3 mb-4">
              <div className="text-center">
                <div className="text-xs text-gray-500 mb-1">Registered</div>
                <div className="text-lg font-bold text-white">{agents.registered}</div>
              </div>
              <div className="text-center">
                <div className="text-xs text-gray-500 mb-1">Enabled</div>
                <div className="text-lg font-bold text-emerald-400">{agents.enabled}</div>
              </div>
              <div className="text-center">
                <div className="text-xs text-gray-500 mb-1">Failed 24h</div>
                <div className={`text-lg font-bold ${agents.failed24h > 0 ? 'text-red-400' : 'text-gray-400'}`}>{agents.failed24h}</div>
              </div>
              <div className="text-center">
                <div className="text-xs text-gray-500 mb-1">Pending</div>
                <div className={`text-lg font-bold ${agents.pendingWebhooks > 0 ? 'text-amber-400' : 'text-gray-400'}`}>{agents.pendingWebhooks}</div>
              </div>
            </div>
            <div className="space-y-2">
              {agents.lastSuccess && (
                <div className="flex items-center gap-2 text-xs">
                  <div className="w-2 h-2 rounded-full bg-emerald-400 flex-shrink-0"></div>
                  <span className="text-gray-400">Last success: <span className="text-white">{agents.lastSuccess.agent_key}</span></span>
                  <span className="text-gray-600 ml-auto">{new Date(agents.lastSuccess.created_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}</span>
                </div>
              )}
              {agents.lastFailed && (
                <div className="flex items-center gap-2 text-xs">
                  <div className="w-2 h-2 rounded-full bg-red-400 flex-shrink-0"></div>
                  <span className="text-gray-400">Last failure: <span className="text-white">{agents.lastFailed.agent_key}</span></span>
                  <span className="text-gray-600 ml-auto">{new Date(agents.lastFailed.created_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}</span>
                </div>
              )}
              {!agents.lastSuccess && !agents.lastFailed && (
                <div className="text-xs text-gray-500">No agent execution data yet</div>
              )}
            </div>
            {agents.agentList.length > 0 && (
              <div className="mt-3 pt-3 border-t border-gray-800 max-h-32 overflow-y-auto space-y-1">
                {agents.agentList.map((a) => (
                  <div key={a.agent_key} className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2 min-w-0">
                      <div className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${a.is_active ? 'bg-emerald-400' : 'bg-gray-600'}`}></div>
                      <span className="text-gray-300 truncate">{a.agent_name}</span>
                    </div>
                    <span className={`text-[10px] flex-shrink-0 ml-2 ${a.is_active ? 'text-emerald-400' : 'text-gray-600'}`}>{a.is_active ? 'Active' : 'Inactive'}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="mb-5">
        <SuperAdminACSOverview />
      </div>

      <div className="grid lg:grid-cols-3 gap-5 mb-5">
        <div className="lg:col-span-2 bg-[#111827] border border-gray-800 rounded-xl">
          <div className="px-5 py-4 border-b border-gray-800 flex items-center justify-between">
            <h3 className="text-white font-semibold text-sm">Signups (Last 14 Days)</h3>
            <Link href="/admin/clients" className="text-xs text-indigo-400 hover:text-indigo-300 cursor-pointer">View all</Link>
          </div>
          <div className="px-5 py-4">
            {companies.length > 0 ? (
              <SignupChart companies={companies} />
            ) : (
              <div className="h-48 flex items-center justify-center text-gray-600 text-sm">No data yet</div>
            )}
          </div>
        </div>

        <div className="bg-[#111827] border border-gray-800 rounded-xl">
          <div className="px-5 py-4 border-b border-gray-800 flex items-center justify-between">
            <h3 className="text-white font-semibold text-sm">Client Activity</h3>
            <Link href="/admin/clients" className="text-xs text-indigo-400 hover:text-indigo-300 cursor-pointer">All clients</Link>
          </div>
          <div className="divide-y divide-gray-800 max-h-[300px] overflow-y-auto">
            <div className="px-5 py-2">
              <p className="text-[10px] text-gray-500 uppercase tracking-wider mb-2">Newest Companies</p>
              {clientActivity.newest.length === 0 ? (
                <p className="text-xs text-gray-600">None yet</p>
              ) : (
                clientActivity.newest.map((c) => (
                  <Link key={c.id} href={`/admin/clients/detail?id=${c.id}`} className="flex items-center justify-between py-1 hover:bg-white/[0.02] px-2 -mx-2 rounded transition-colors cursor-pointer">
                    <span className="text-xs text-white truncate">{c.name}</span>
                    <span className="text-[10px] text-gray-500 flex-shrink-0 ml-2">{new Date(c.created_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}</span>
                  </Link>
                ))
              )}
            </div>
            {clientActivity.failedPayment.length > 0 && (
              <div className="px-5 py-2">
                <p className="text-[10px] text-red-400 uppercase tracking-wider mb-2">Failed Payments</p>
                {clientActivity.failedPayment.map((c) => (
                  <Link key={c.id} href={`/admin/clients/detail?id=${c.id}`} className="flex items-center justify-between py-1 hover:bg-white/[0.02] px-2 -mx-2 rounded transition-colors cursor-pointer">
                    <span className="text-xs text-white truncate">{c.name}</span>
                    <span className="text-[10px] text-red-400 flex-shrink-0 ml-2 capitalize">{c.subscription_status}</span>
                  </Link>
                ))}
              </div>
            )}
            {clientActivity.noSites.length > 0 && (
              <div className="px-5 py-2">
                <p className="text-[10px] text-amber-400 uppercase tracking-wider mb-2">No Sites Configured</p>
                {clientActivity.noSites.map((c) => (
                  <Link key={c.id} href={`/admin/clients/detail?id=${c.id}`} className="flex items-center justify-between py-1 hover:bg-white/[0.02] px-2 -mx-2 rounded transition-colors cursor-pointer">
                    <span className="text-xs text-white truncate">{c.name}</span>
                    <StatusBadge status={c.account_status} />
                  </Link>
                ))}
              </div>
            )}
            {clientActivity.sitesWithIncidents.length > 0 && (
              <div className="px-5 py-2">
                <p className="text-[10px] text-red-400 uppercase tracking-wider mb-2">Sites With Open Incidents</p>
                {clientActivity.sitesWithIncidents.map((s) => (
                  <Link key={s.id} href={`/admin/sites`} className="flex items-center justify-between py-1 hover:bg-white/[0.02] px-2 -mx-2 rounded transition-colors cursor-pointer">
                    <div className="min-w-0">
                      <span className="text-xs text-white truncate block">{s.site_name}</span>
                      <span className="text-[10px] text-gray-500">{s.company_name}</span>
                    </div>
                    <span className="text-xs text-red-400 font-medium flex-shrink-0 ml-2">{s.incident_count}</span>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-5 mb-5">
        <div className="bg-[#111827] border border-gray-800 rounded-xl">
          <div className="px-5 py-4 border-b border-gray-800 flex items-center justify-between">
            <h3 className="text-white font-semibold text-sm">Recent Signups</h3>
            <Link href="/admin/clients" className="text-xs text-indigo-400 hover:text-indigo-300 cursor-pointer">View all</Link>
          </div>
          <div className="divide-y divide-gray-800">
            {recentSignups.length === 0 && (
              <EmptyState icon="ri-user-add-line" title="No recent signups" description="New clients will appear here when they register." />
            )}
            {recentSignups.map((c) => (
              <div key={c.id} className="px-5 py-3 flex items-center justify-between hover:bg-white/[0.02] transition-colors">
                <div className="min-w-0">
                  <Link href={`/admin/clients/detail?id=${c.id}`} className="text-sm text-white font-medium hover:text-indigo-400 truncate block cursor-pointer">
                    {c.name}
                  </Link>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-xs text-gray-500">{c.owner_email || c.contact_email || 'No email'}</span>
                    <StatusBadge status={c.account_status} />
                  </div>
                </div>
                <div className="text-right flex-shrink-0 ml-4">
                  <PlanBadge plan={c.plan_name || c.subscription_plan} />
                  <p className="text-xs text-gray-600 mt-1">
                    {new Date(c.created_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-[#111827] border border-gray-800 rounded-xl">
          <div className="px-5 py-4 border-b border-gray-800 flex items-center justify-between">
            <h3 className="text-white font-semibold text-sm">System Alerts</h3>
            <div className="w-5 h-5 flex items-center justify-center text-amber-400">
              <i className="ri-alert-line"></i>
            </div>
          </div>
          <div className="divide-y divide-gray-800">
            {alerts.length === 0 && (
              <EmptyState icon="ri-shield-check-line" title="All clear" description="No alerts requiring attention." />
            )}
            {alerts.map((c) => (
              <div key={c.id} className="px-5 py-3 flex items-center justify-between hover:bg-white/[0.02] transition-colors">
                <div className="min-w-0">
                  <Link href={`/admin/clients/detail?id=${c.id}`} className="text-sm text-white font-medium hover:text-indigo-400 truncate block cursor-pointer">
                    {c.name}
                  </Link>
                  <p className="text-xs text-gray-500 mt-0.5">
                    {c.account_status === 'pending_setup' && 'Setup incomplete'}
                    {c.account_status === 'suspended' && 'Account suspended'}
                    {c.subscription_status === 'past_due' && 'Failed billing'}
                    {c.subscription_status === 'unpaid' && 'Unpaid subscription'}
                    {c.trial_ends_at && new Date(c.trial_ends_at) < new Date(Date.now() + 3 * 24 * 60 * 60 * 1000) && 'Trial expiring soon'}
                  </p>
                </div>
                <StatusBadge status={c.account_status} />
              </div>
            ))}
          </div>
        </div>

        <div className="bg-[#111827] border border-gray-800 rounded-xl">
          <div className="px-5 py-4 border-b border-gray-800 flex items-center justify-between">
            <h3 className="text-white font-semibold text-sm">Top Clients by Scale</h3>
            <Link href="/admin/clients" className="text-xs text-indigo-400 hover:text-indigo-300 cursor-pointer">View all</Link>
          </div>
          <div className="divide-y divide-gray-800">
            {topClients.length === 0 && (
              <EmptyState icon="ri-briefcase-line" title="No active clients" description="Clients with sites or users will appear here." />
            )}
            {topClients.map((c) => (
              <div key={c.id} className="px-5 py-3 flex items-center justify-between hover:bg-white/[0.02] transition-colors">
                <div className="min-w-0">
                  <Link href={`/admin/clients/detail?id=${c.id}`} className="text-sm text-white font-medium hover:text-indigo-400 truncate block cursor-pointer">
                    {c.name}
                  </Link>
                  <div className="flex items-center gap-3 mt-1 text-xs text-gray-500">
                    <span>{c.site_count || 0} sites</span>
                    <span>{c.user_count || 0} users</span>
                    <span>{c.guard_count || 0} guards</span>
                  </div>
                </div>
                <PlanBadge plan={c.plan_name || c.subscription_plan} />
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-5">
        <div className="bg-[#111827] border border-gray-800 rounded-xl">
          <div className="px-5 py-4 border-b border-gray-800 flex items-center justify-between">
            <h3 className="text-white font-semibold text-sm">Recent Activity</h3>
            <Link href="/admin/activity" className="text-xs text-indigo-400 hover:text-indigo-300 cursor-pointer">View all</Link>
          </div>
          <div className="divide-y divide-gray-800">
            {latestLog.length === 0 && (
              <EmptyState icon="ri-shield-check-line" title="No recent activity" description="Admin actions will appear here as they happen." />
            )}
            {latestLog.map((log: any) => (
              <div key={log.id} className="px-5 py-3">
                <div className="flex items-center gap-2 flex-wrap">
                  <StatusBadge status={log.action} />
                  {log.company && (
                    <span className="text-xs text-gray-500">{log.company.name}</span>
                  )}
                  <span className="text-xs text-gray-600">
                    {new Date(log.created_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
                <p className="text-sm text-gray-300 mt-1">{log.description}</p>
                {log.performed_by_profile && (
                  <p className="text-xs text-gray-600 mt-0.5">
                    By {log.performed_by_profile.first_name} {log.performed_by_profile.last_name}
                  </p>
                )}
              </div>
            ))}
          </div>
        </div>

        <div className="bg-[#111827] border border-gray-800 rounded-xl">
          <div className="px-5 py-4 border-b border-gray-800 flex items-center justify-between">
            <h3 className="text-white font-semibold text-sm">Quick Actions</h3>
          </div>
          <div className="p-5 grid grid-cols-2 gap-3">
            <Link href="/admin/clients" className="flex items-center gap-3 p-3 bg-gray-800/40 rounded-lg hover:bg-gray-800/60 transition-colors cursor-pointer">
              <div className="w-8 h-8 bg-indigo-600/15 rounded-lg flex items-center justify-center text-indigo-400">
                <div className="w-4 h-4 flex items-center justify-center"><i className="ri-briefcase-line"></i></div>
              </div>
              <div>
                <p className="text-sm text-white font-medium">Clients</p>
                <p className="text-xs text-gray-500">{stats.totalClients} total</p>
              </div>
            </Link>
            <Link href="/admin/sites" className="flex items-center gap-3 p-3 bg-gray-800/40 rounded-lg hover:bg-gray-800/60 transition-colors cursor-pointer">
              <div className="w-8 h-8 bg-blue-600/15 rounded-lg flex items-center justify-center text-blue-400">
                <div className="w-4 h-4 flex items-center justify-center"><i className="ri-building-line"></i></div>
              </div>
              <div>
                <p className="text-sm text-white font-medium">Sites</p>
                <p className="text-xs text-gray-500">{stats.totalSites} total</p>
              </div>
            </Link>
            <Link href="/admin/users" className="flex items-center gap-3 p-3 bg-gray-800/40 rounded-lg hover:bg-gray-800/60 transition-colors cursor-pointer">
              <div className="w-8 h-8 bg-purple-600/15 rounded-lg flex items-center justify-center text-purple-400">
                <div className="w-4 h-4 flex items-center justify-center"><i className="ri-team-line"></i></div>
              </div>
              <div>
                <p className="text-sm text-white font-medium">Users</p>
                <p className="text-xs text-gray-500">{stats.totalUsers} total</p>
              </div>
            </Link>
            <Link href="/admin/subscriptions" className="flex items-center gap-3 p-3 bg-gray-800/40 rounded-lg hover:bg-gray-800/60 transition-colors cursor-pointer">
              <div className="w-8 h-8 bg-amber-600/15 rounded-lg flex items-center justify-center text-amber-400">
                <div className="w-4 h-4 flex items-center justify-center"><i className="ri-vip-crown-line"></i></div>
              </div>
              <div>
                <p className="text-sm text-white font-medium">Subscriptions</p>
                <p className="text-xs text-gray-500">{stats.failedBilling} billing issues</p>
              </div>
            </Link>
            <Link href="/super-admin/financial" className="flex items-center gap-3 p-3 bg-gray-800/40 rounded-lg hover:bg-gray-800/60 transition-colors cursor-pointer">
              <div className="w-8 h-8 bg-emerald-600/15 rounded-lg flex items-center justify-center text-emerald-400">
                <div className="w-4 h-4 flex items-center justify-center"><i className="ri-bank-card-line"></i></div>
              </div>
              <div>
                <p className="text-sm text-white font-medium">Financial</p>
                <p className="text-xs text-gray-500">{fmt(financials.mrrTotal)} MRR</p>
              </div>
            </Link>
            <Link href="/admin/system-health" className="flex items-center gap-3 p-3 bg-gray-800/40 rounded-lg hover:bg-gray-800/60 transition-colors cursor-pointer">
              <div className="w-8 h-8 bg-red-600/15 rounded-lg flex items-center justify-center text-red-400">
                <div className="w-4 h-4 flex items-center justify-center"><i className="ri-heart-pulse-line"></i></div>
              </div>
              <div>
                <p className="text-sm text-white font-medium">System Health</p>
                <p className="text-xs text-gray-500">{financials.webhookFailed} webhook errors</p>
              </div>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}