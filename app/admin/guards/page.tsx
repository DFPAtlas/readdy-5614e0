'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useSuperAdminGuards, AdminGuard } from '@/lib/useSuperAdmin';
import { EmptyState } from '../components/AdminUI';

export default function AdminGuardsPage() {
  const { guards, loading } = useSuperAdminGuards();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  const filtered = guards.filter((g) => {
    if (statusFilter !== 'all' && (g.status || 'active') !== statusFilter) return false;
    if (!search.trim()) return true;
    const q = search.toLowerCase();
    return (
      (g.first_name || '').toLowerCase().includes(q) ||
      (g.last_name || '').toLowerCase().includes(q) ||
      (g.email || '').toLowerCase().includes(q) ||
      (g.sia_licence || '').toLowerCase().includes(q) ||
      (g.company_name || '').toLowerCase().includes(q) ||
      (g.position || '').toLowerCase().includes(q)
    );
  });

  const activeCount = guards.filter(g => g.status === 'active').length;
  const inactiveCount = guards.filter(g => g.status === 'inactive').length;
  const siaExpiringSoon = guards.filter(g => {
    if (!g.sia_expiry) return false;
    const expiry = new Date(g.sia_expiry);
    const now = new Date();
    const diffDays = Math.ceil((expiry.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    return diffDays <= 30 && diffDays >= 0;
  }).length;

  return (
    <div className="p-4 lg:p-6 max-w-7xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-white">Platform Guards</h1>
        <p className="text-sm text-gray-500 mt-0.5">
          {guards.length} total across all companies — {activeCount} active, {inactiveCount} inactive
          {siaExpiringSoon > 0 && (
            <span className="text-amber-400 ml-2">• {siaExpiringSoon} SIA expiring soon</span>
          )}
        </p>
      </div>

      <div className="grid grid-cols-3 gap-4 mb-5">
        <div className="bg-[#111827] border border-gray-800 rounded-xl p-4">
          <div className="text-xs text-gray-500 uppercase tracking-wider mb-1">Total Guards</div>
          <div className="text-2xl font-bold text-white">{guards.length}</div>
        </div>
        <div className="bg-[#111827] border border-gray-800 rounded-xl p-4">
          <div className="text-xs text-gray-500 uppercase tracking-wider mb-1">Active</div>
          <div className="text-2xl font-bold text-emerald-400">{activeCount}</div>
        </div>
        <div className="bg-[#111827] border border-gray-800 rounded-xl p-4">
          <div className="text-xs text-gray-500 uppercase tracking-wider mb-1">SIA Expiring (30d)</div>
          <div className={`text-2xl font-bold ${siaExpiringSoon > 0 ? 'text-amber-400' : 'text-gray-400'}`}>
            {siaExpiringSoon}
          </div>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-3 mb-4">
        <div className="relative">
          <div className="w-4 h-4 flex items-center justify-center absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">
            <i className="ri-search-line text-xs" />
          </div>
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search guards by name, email, licence, company..."
            className="bg-gray-800/40 border border-gray-700/60 rounded-lg pl-9 pr-4 py-2 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-indigo-500 w-80"
          />
        </div>

        <div className="flex items-center gap-1">
          {['all', 'active', 'inactive'].map((s) => (
            <button
              key={s}
              onClick={() => setStatusFilter(s)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all capitalize whitespace-nowrap cursor-pointer ${
                statusFilter === s
                  ? 'bg-indigo-600/15 text-indigo-400 border border-indigo-600/20'
                  : 'text-gray-400 hover:text-white bg-gray-800/40 border border-transparent'
              }`}
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      <div className="bg-[#111827] border border-gray-800 rounded-xl overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-sm text-gray-500">Loading guards...</div>
        ) : filtered.length === 0 ? (
          <EmptyState icon="ri-shield-user-line" title="No guards found" description="Try adjusting your search or filters." />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-800 text-left">
                  <th className="px-5 py-3 text-xs font-medium text-gray-500 uppercase">Name</th>
                  <th className="px-5 py-3 text-xs font-medium text-gray-500 uppercase">Email</th>
                  <th className="px-5 py-3 text-xs font-medium text-gray-500 uppercase">Phone</th>
                  <th className="px-5 py-3 text-xs font-medium text-gray-500 uppercase">Position</th>
                  <th className="px-5 py-3 text-xs font-medium text-gray-500 uppercase">SIA Licence</th>
                  <th className="px-5 py-3 text-xs font-medium text-gray-500 uppercase">SIA Expiry</th>
                  <th className="px-5 py-3 text-xs font-medium text-gray-500 uppercase">Rate</th>
                  <th className="px-5 py-3 text-xs font-medium text-gray-500 uppercase">Company</th>
                  <th className="px-5 py-3 text-xs font-medium text-gray-500 uppercase">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-800">
                {filtered.map((g) => {
                  const siaExpired = g.sia_expiry ? new Date(g.sia_expiry) < new Date() : false;
                  const siaExpiring = g.sia_expiry && !siaExpired
                    ? (() => {
                        const diff = Math.ceil((new Date(g.sia_expiry!).getTime() - Date.now()) / (1000 * 60 * 60 * 24));
                        return diff <= 30;
                      })()
                    : false;
                  return (
                    <tr key={g.id} className="hover:bg-white/[0.02] transition-colors">
                      <td className="px-5 py-3">
                        <div className="text-white font-medium">
                          {[g.first_name, g.last_name].filter(Boolean).join(' ') || '—'}
                        </div>
                        {g.user_id && (
                          <span className="text-[10px] text-gray-600">Linked account</span>
                        )}
                      </td>
                      <td className="px-5 py-3 text-gray-400 text-xs">{g.email || '—'}</td>
                      <td className="px-5 py-3 text-gray-400 text-xs">{g.phone || '—'}</td>
                      <td className="px-5 py-3 text-gray-300 text-xs capitalize">{g.position || '—'}</td>
                      <td className="px-5 py-3">
                        <span className="text-gray-400 font-mono text-xs">{g.sia_licence || '—'}</span>
                      </td>
                      <td className="px-5 py-3">
                        {g.sia_expiry ? (
                          <span className={`inline-flex px-2 py-0.5 rounded-md text-xs font-medium ${
                            siaExpired
                              ? 'text-red-400 bg-red-500/10'
                              : siaExpiring
                              ? 'text-amber-400 bg-amber-500/10'
                              : 'text-emerald-400 bg-emerald-500/10'
                          }`}>
                            {new Date(g.sia_expiry).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
                          </span>
                        ) : (
                          <span className="text-gray-600 text-xs">—</span>
                        )}
                      </td>
                      <td className="px-5 py-3 text-gray-300 text-xs">
                        {g.hourly_rate ? `£${Number(g.hourly_rate).toFixed(2)}/hr` : '—'}
                      </td>
                      <td className="px-5 py-3">
                        {g.company_id ? (
                          <Link href={`/admin/clients/detail?id=${g.company_id}`} className="text-indigo-400 hover:text-indigo-300 text-xs cursor-pointer">
                            {g.company_name || 'Unknown'}
                          </Link>
                        ) : (
                          <span className="text-gray-600 text-xs">—</span>
                        )}
                      </td>
                      <td className="px-5 py-3">
                        <span className={`inline-flex px-2 py-0.5 rounded-md text-xs font-medium ${
                          g.status === 'active' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-gray-500/10 text-gray-400'
                        }`}>
                          {g.status || 'active'}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}