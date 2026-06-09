'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useSuperAdminTickets, getStatusBadge, getPriorityBadge, getCategoryLabel, STATUSES } from '@/lib/useSuperAdminTickets';

export default function SupportTicketsPage() {
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const { tickets, loading, error, refresh } = useSuperAdminTickets(
    statusFilter === 'all' ? null : (statusFilter as any),
    searchQuery
  );
  const router = useRouter();

  const statusList = ['all', 'new', 'open', 'in_progress', 'waiting_on_client', 'resolved', 'closed'] as const;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Support Tickets</h1>
          <p className="text-sm text-gray-400 mt-1">Manage all client support requests across the platform.</p>
        </div>
        <div className="flex items-center gap-2">
          <div className="relative">
            <div className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 flex items-center justify-center text-gray-500">
              <i className="ri-search-line text-xs"></i>
            </div>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search tickets..."
              className="w-64 bg-[#0f172a] border border-white/10 rounded-lg pl-9 pr-3 py-2 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-indigo-500/50"
            />
          </div>
          <button
            onClick={() => refresh()}
            className="w-9 h-9 flex items-center justify-center rounded-lg bg-[#0f172a] border border-white/10 text-gray-400 hover:text-white hover:border-white/20 transition-colors cursor-pointer"
          >
            <div className="w-4 h-4 flex items-center justify-center"><i className="ri-refresh-line"></i></div>
          </button>
        </div>
      </div>

      <div className="flex items-center gap-1.5 bg-[#0f172a] rounded-xl p-1 border border-white/5">
        {statusList.map((s) => (
          <button
            key={s}
            onClick={() => setStatusFilter(s)}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all whitespace-nowrap cursor-pointer ${
              statusFilter === s
                ? 'bg-white/10 text-white'
                : 'text-gray-400 hover:text-white hover:bg-white/5'
            }`}
          >
            {s === 'all' ? 'All' : STATUSES[s as any].label}
            {s === 'all' && <span className="ml-1 text-gray-500">({tickets.length})</span>}
          </button>
        ))}
      </div>

      {loading && (
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-500"></div>
        </div>
      )}

      {error && (
        <div className="rounded-xl bg-red-500/10 border border-red-500/20 p-4 text-sm text-red-400">
          {error}
        </div>
      )}

      {!loading && !error && tickets.length === 0 && (
        <div className="rounded-xl bg-[#0f172a] border border-white/5 p-12 text-center">
          <div className="w-16 h-16 rounded-full bg-[#1e293b] flex items-center justify-center mx-auto mb-4">
            <div className="w-8 h-8 flex items-center justify-center text-gray-500">
              <i className="ri-customer-service-line text-2xl"></i>
            </div>
          </div>
          <h3 className="text-lg font-semibold text-white mb-1">No tickets</h3>
          <p className="text-sm text-gray-400">There are no support tickets matching your filters.</p>
        </div>
      )}

      {!loading && !error && tickets.length > 0 && (
        <div className="rounded-xl bg-[#0f172a] border border-white/5 overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-white/5 text-left">
                <th className="px-4 py-3 text-xs font-semibold text-gray-500">ID</th>
                <th className="px-4 py-3 text-xs font-semibold text-gray-500">Subject</th>
                <th className="px-4 py-3 text-xs font-semibold text-gray-500">Company</th>
                <th className="px-4 py-3 text-xs font-semibold text-gray-500">Category</th>
                <th className="px-4 py-3 text-xs font-semibold text-gray-500">Priority</th>
                <th className="px-4 py-3 text-xs font-semibold text-gray-500">Status</th>
                <th className="px-4 py-3 text-xs font-semibold text-gray-500">Created</th>
                <th className="px-4 py-3 text-xs font-semibold text-gray-500"></th>
              </tr>
            </thead>
            <tbody>
              {tickets.map((t) => {
                const sb = getStatusBadge(t.status);
                const pb = getPriorityBadge(t.priority);
                return (
                  <tr
                    key={t.id}
                    onClick={() => router.push(`/super-admin/support/${t.id}`)}
                    className="border-b border-white/5 hover:bg-white/[0.02] transition-colors cursor-pointer"
                  >
                    <td className="px-4 py-3 text-gray-500 text-xs">#{t.id.slice(-6).toUpperCase()}</td>
                    <td className="px-4 py-3">
                      <p className="text-white font-medium truncate max-w-xs">{t.subject}</p>
                      <p className="text-gray-600 text-xs truncate max-w-xs">{t.creator?.email}</p>
                    </td>
                    <td className="px-4 py-3 text-gray-400">{t.company?.name || '—'}</td>
                    <td className="px-4 py-3 text-gray-400">{getCategoryLabel(t.category)}</td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold text-white ${pb.color}`}>
                        {pb.label}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold text-white ${sb.color}`}>
                        {sb.label}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-gray-500 text-xs">
                      {new Date(t.created_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}
                    </td>
                    <td className="px-4 py-3">
                      <div className="w-5 h-5 flex items-center justify-center text-gray-600">
                        <i className="ri-arrow-right-s-line"></i>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}