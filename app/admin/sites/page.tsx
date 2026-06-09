'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useAdminSites } from '@/lib/useSuperAdmin';
import { EmptyState } from '../components/AdminUI';

export default function AdminSitesPage() {
  const { sites, loading } = useAdminSites();
  const [search, setSearch] = useState('');

  const filtered = search.trim()
    ? sites.filter((s) =>
        (s.site_name || '').toLowerCase().includes(search.toLowerCase()) ||
        (s.address || '').toLowerCase().includes(search.toLowerCase()) ||
        (s.company_name || '').toLowerCase().includes(search.toLowerCase())
      )
    : sites;

  return (
    <div className="p-4 lg:p-6 max-w-7xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-white">All Sites</h1>
          <p className="text-sm text-gray-500 mt-0.5">{sites.length} total sites across all clients</p>
        </div>
      </div>

      <div className="relative mb-4">
        <div className="w-4 h-4 flex items-center justify-center absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">
          <i className="ri-search-line text-xs"></i>
        </div>
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search sites by name, address, or company..."
          className="bg-gray-800/40 border border-gray-700/60 rounded-lg pl-9 pr-4 py-2 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-indigo-500 w-full max-w-md"
        />
      </div>

      <div className="bg-[#111827] border border-gray-800 rounded-xl overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-sm text-gray-500">Loading sites...</div>
        ) : filtered.length === 0 ? (
          <EmptyState icon="ri-building-line" title="No sites found" description="Try adjusting your search query." />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-800 text-left">
                  <th className="px-5 py-3 text-xs font-medium text-gray-500 uppercase">Site Name</th>
                  <th className="px-5 py-3 text-xs font-medium text-gray-500 uppercase">Client</th>
                  <th className="px-5 py-3 text-xs font-medium text-gray-500 uppercase">Address</th>
                  <th className="px-5 py-3 text-xs font-medium text-gray-500 uppercase">Risk Level</th>
                  <th className="px-5 py-3 text-xs font-medium text-gray-500 uppercase">Created</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-800">
                {filtered.map((site) => (
                  <tr key={site.id} className="hover:bg-white/[0.02] transition-colors">
                    <td className="px-5 py-3 font-medium text-white">{site.site_name || 'Unnamed'}</td>
                    <td className="px-5 py-3">
                      {site.company_id ? (
                        <Link href={`/admin/clients/detail?id=${site.company_id}`} className="text-indigo-400 hover:text-indigo-300 cursor-pointer text-xs">
                          {site.company_name || 'Unknown'}
                        </Link>
                      ) : (
                        <span className="text-gray-600 text-xs">-</span>
                      )}
                    </td>
                    <td className="px-5 py-3 text-gray-400 text-xs">{site.address || '-'}</td>
                    <td className="px-5 py-3">
                      <span className={`text-xs capitalize font-medium ${
                        site.risk_level === 'high' ? 'text-red-400' :
                        site.risk_level === 'medium' ? 'text-amber-400' :
                        'text-emerald-400'
                      }`}>{site.risk_level || 'low'}</span>
                    </td>
                    <td className="px-5 py-3 text-gray-500 text-xs">
                      {new Date(site.created_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
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