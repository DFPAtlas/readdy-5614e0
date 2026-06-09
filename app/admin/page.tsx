'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useSuperAdminStats, useSuperAdminCompanies, useAdminActivity } from '@/lib/useSuperAdmin';
import { StatCard, StatusBadge, PlanBadge, EmptyState } from './components/AdminUI';
import SignupChart from './components/SignupChart';

export default function AdminOverviewPage() {
  const { stats, loading: statsLoading } = useSuperAdminStats();
  const { companies } = useSuperAdminCompanies();
  const { logs } = useAdminActivity();

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
          <h1 className="text-2xl font-bold text-white">Platform Overview</h1>
          <p className="text-sm text-gray-500 mt-0.5">All Guardian Hub clients at a glance</p>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs text-gray-500">{companies.length} clients</span>
          <span className="w-px h-3 bg-gray-700"></span>
          <span className="text-xs text-gray-500">{stats.totalSites} sites</span>
          <span className="w-px h-3 bg-gray-700"></span>
          <span className="text-xs text-gray-500">{stats.totalUsers} users</span>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4 mb-6">
        <StatCard label="Total Clients" value={stats.totalClients} icon="ri-briefcase-line" color="indigo" href="/admin/clients" />
        <StatCard label="Active" value={stats.activeClients} icon="ri-check-line" color="emerald" href="/admin/clients" />
        <StatCard label="Pending Setup" value={stats.pendingSetup} icon="ri-time-line" color="amber" href="/admin/clients" />
        <StatCard label="Suspended" value={stats.suspended} icon="ri-pause-circle-line" color="red" />
        <StatCard label="Cancelled" value={stats.cancelled} icon="ri-close-circle-line" color="gray" />
        <StatCard label="Archived" value={stats.archived} icon="ri-archive-line" color="gray" />
        <StatCard label="Total Sites" value={stats.totalSites} icon="ri-building-line" color="blue" href="/admin/sites" />
        <StatCard label="Total Users" value={stats.totalUsers} icon="ri-team-line" color="purple" href="/admin/users" />
        <StatCard label="Total Guards" value={stats.totalGuards} icon="ri-shield-user-line" color="blue" />
        <StatCard label="Recent Signups" value={stats.recentSignups} icon="ri-user-add-line" color="emerald" />
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
          </div>
        </div>
      </div>
    </div>
  );
}