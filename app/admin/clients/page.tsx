'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useSuperAdminCompanies } from '@/lib/useSuperAdmin';
import { StatusBadge, PlanBadge, SubscriptionStatusBadge, EmptyState } from '../components/AdminUI';

const statusOptions = [
  { value: 'all', label: 'All Statuses' },
  { value: 'active', label: 'Active' },
  { value: 'pending_setup', label: 'Pending Setup' },
  { value: 'suspended', label: 'Suspended' },
  { value: 'cancelled', label: 'Cancelled' },
  { value: 'archived', label: 'Archived' },
];

const planOptions = [
  { value: 'all', label: 'All Plans' },
  { value: 'sentinel', label: 'Sentinel' },
  { value: 'watcher', label: 'Watcher' },
  { value: 'guardian', label: 'Guardian' },
  { value: 'enterprise', label: 'Enterprise' },
];

export default function AdminClientsPage() {
  const { companies, loading, error, refetch } = useSuperAdminCompanies();
  const router = useRouter();

  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [planFilter, setPlanFilter] = useState('all');
  const [sortBy, setSortBy] = useState<'created' | 'name' | 'sites'>('created');


  const filtered = useMemo(() => {
    let list = [...companies];
    if (statusFilter !== 'all') list = list.filter(c => c.account_status === statusFilter);
    if (planFilter !== 'all') list = list.filter(c => (c.plan_name || c.subscription_plan) === planFilter);
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(c =>
        c.name.toLowerCase().includes(q) ||
        (c.contact_email || '').toLowerCase().includes(q) ||
        (c.owner_name || '').toLowerCase().includes(q)
      );
    }
    if (sortBy === 'name') list.sort((a, b) => a.name.localeCompare(b.name));
    if (sortBy === 'sites') list.sort((a, b) => (b.site_count || 0) - (a.site_count || 0));
    if (sortBy === 'created') list.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
    return list;
  }, [companies, statusFilter, planFilter, search, sortBy]);



  const activeStatuses = ['pending_setup', 'active', 'suspended'];
  const visibleClients = filtered.filter(c => activeStatuses.includes(c.account_status) || statusFilter === c.account_status);

  return (
    <div className="p-4 lg:p-6 max-w-7xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-white">Client Management</h1>
          <p className="text-sm text-gray-500 mt-0.5">{companies.length} total clients</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => { setStatusFilter('all'); setPlanFilter('all'); setSearch(''); }}
            className="px-3 py-2 bg-gray-800/40 text-gray-400 text-xs font-medium rounded-lg hover:bg-gray-800/60 transition-colors cursor-pointer whitespace-nowrap"
          >
            Reset Filters
          </button>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-2 mb-4">
        <div className="relative">
          <div className="w-4 h-4 flex items-center justify-center absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">
            <i className="ri-search-line text-xs"></i>
          </div>
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search clients..."
            className="bg-gray-800/40 border border-gray-700/60 rounded-lg pl-9 pr-4 py-2 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-indigo-500 w-64"
          />
        </div>

        <div className="relative group">
          <button className="flex items-center gap-2 px-3 py-2 bg-gray-800/40 border border-gray-700/60 rounded-lg text-sm text-gray-400 hover:text-white transition-colors cursor-pointer whitespace-nowrap">
            <span>Status: {statusOptions.find(o => o.value === statusFilter)?.label}</span>
            <i className="ri-arrow-down-s-line"></i>
          </button>
          <div className="absolute top-full left-0 mt-1 w-44 bg-[#0f1629] border border-gray-700/60 rounded-lg shadow-xl z-30 hidden group-hover:block">
            {statusOptions.map(o => (
              <button
                key={o.value}
                onClick={() => setStatusFilter(o.value)}
                className="w-full text-left px-3 py-2 text-sm text-gray-400 hover:text-white hover:bg-gray-800/40 first:rounded-t-lg last:rounded-b-lg"
              >
                {o.label}
              </button>
            ))}
          </div>
        </div>

        <div className="relative group">
          <button className="flex items-center gap-2 px-3 py-2 bg-gray-800/40 border border-gray-700/60 rounded-lg text-sm text-gray-400 hover:text-white transition-colors cursor-pointer whitespace-nowrap">
            <span>Plan: {planOptions.find(o => o.value === planFilter)?.label}</span>
            <i className="ri-arrow-down-s-line"></i>
          </button>
          <div className="absolute top-full left-0 mt-1 w-40 bg-[#0f1629] border border-gray-700/60 rounded-lg shadow-xl z-30 hidden group-hover:block">
            {planOptions.map(o => (
              <button
                key={o.value}
                onClick={() => setPlanFilter(o.value)}
                className="w-full text-left px-3 py-2 text-sm text-gray-400 hover:text-white hover:bg-gray-800/40 first:rounded-t-lg last:rounded-b-lg"
              >
                {o.label}
              </button>
            ))}
          </div>
        </div>

        <div className="flex items-center gap-1 ml-auto">
          <button onClick={() => setSortBy('created')} className={`px-2 py-1.5 rounded text-xs cursor-pointer whitespace-nowrap ${sortBy === 'created' ? 'bg-indigo-600/20 text-indigo-400' : 'text-gray-500 hover:text-gray-300'}`}>Newest</button>
          <button onClick={() => setSortBy('name')} className={`px-2 py-1.5 rounded text-xs cursor-pointer whitespace-nowrap ${sortBy === 'name' ? 'bg-indigo-600/20 text-indigo-400' : 'text-gray-500 hover:text-gray-300'}`}>Name</button>
          <button onClick={() => setSortBy('sites')} className={`px-2 py-1.5 rounded text-xs cursor-pointer whitespace-nowrap ${sortBy === 'sites' ? 'bg-indigo-600/20 text-indigo-400' : 'text-gray-500 hover:text-gray-300'}`}>Sites</button>
        </div>
      </div>

      {error && (
        <div className="mb-4 p-4 bg-red-500/10 border border-red-500/20 rounded-lg flex items-center gap-2 text-sm text-red-400">
          <i className="ri-error-warning-line"></i>
          {error}
          <button onClick={refetch} className="ml-auto text-xs underline cursor-pointer">Retry</button>
        </div>
      )}

      <div className="bg-[#111827] border border-gray-800 rounded-xl overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-sm text-gray-500">Loading clients...</div>
        ) : visibleClients.length === 0 ? (
          <EmptyState icon="ri-briefcase-line" title="No clients found" description="Try adjusting your filters or search query." />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-800 text-left">
                  <th className="px-5 py-3 text-xs font-medium text-gray-500 uppercase">Company</th>
                  <th className="px-5 py-3 text-xs font-medium text-gray-500 uppercase">Contact</th>
                  <th className="px-5 py-3 text-xs font-medium text-gray-500 uppercase">Plan</th>
                  <th className="px-5 py-3 text-xs font-medium text-gray-500 uppercase">Status</th>
                  <th className="px-5 py-3 text-xs font-medium text-gray-500 uppercase">Sites</th>
                  <th className="px-5 py-3 text-xs font-medium text-gray-500 uppercase">Users</th>
                  <th className="px-5 py-3 text-xs font-medium text-gray-500 uppercase">Guards</th>
                  <th className="px-5 py-3 text-xs font-medium text-gray-500 uppercase">Signup</th>
                  <th className="px-5 py-3 text-xs font-medium text-gray-500 uppercase text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-800">
                {visibleClients.map((c) => (
                  <tr key={c.id} className="hover:bg-white/[0.02] transition-colors">
                    <td className="px-5 py-3">
                      <Link href={`/admin/clients/detail?id=${c.id}`} className="font-medium text-white hover:text-indigo-400 cursor-pointer block">
                        {c.name}
                      </Link>
                      <span className="text-xs text-gray-500">{c.owner_name || 'No owner'}</span>
                    </td>
                    <td className="px-5 py-3">
                      <div className="text-gray-300 text-xs">{c.contact_email || c.owner_email || '-'}</div>
                      <div className="text-gray-600 text-xs">{c.phone || '-'}</div>
                    </td>
                    <td className="px-5 py-3">
                      <PlanBadge plan={c.plan_name || c.subscription_plan} />
                    </td>
                    <td className="px-5 py-3">
                      <StatusBadge status={c.account_status} />
                    </td>
                    <td className="px-5 py-3 text-gray-300 text-xs">{c.site_count || 0}</td>
                    <td className="px-5 py-3 text-gray-300 text-xs">{c.user_count || 0}</td>
                    <td className="px-5 py-3 text-gray-300 text-xs">{c.guard_count || 0}</td>
                    <td className="px-5 py-3 text-gray-500 text-xs">
                      {new Date(c.created_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}
                    </td>
                    <td className="px-5 py-3 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => router.push(`/admin/clients/detail?id=${c.id}`)}
                          className="w-7 h-7 flex items-center justify-center text-gray-500 hover:text-indigo-400 hover:bg-indigo-500/10 rounded transition-colors cursor-pointer"
                          title="View"
                        >
                          <i className="ri-eye-line text-xs"></i>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>


    </div>
  );
}