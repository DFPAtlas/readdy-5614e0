'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useSupportTickets, getStatusBadge, getPriorityBadge, getCategoryLabel, CATEGORIES, PRIORITIES } from '@/lib/useSupportTickets';
import { useAuth } from '@/lib/auth';
import { useClientAuth } from '@/lib/useClientAuth';

export default function ClientSupportPage() {
  const { isClientUser } = useClientAuth();
  const { tickets, loading, error, refresh } = useSupportTickets(isClientUser ? true : false);
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const { profile } = useAuth();

  const filtered = statusFilter === 'all'
    ? tickets
    : tickets.filter((t) => t.status === statusFilter);

  const statuses = ['all', 'new', 'open', 'in_progress', 'waiting_on_client', 'resolved', 'closed'] as const;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Support</h1>
          <p className="text-sm text-gray-400 mt-1">Raise tickets for account issues, billing, sites, guards or anything else.</p>
          {!isClientUser && (
            <p className="text-xs text-amber-400 mt-1 bg-amber-500/10 border border-amber-500/20 rounded px-2 py-0.5 inline-block">
              Viewing all company tickets as administrator
            </p>
          )}
        </div>
        <Link
          href="/client/support/new"
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-medium rounded-lg transition-colors whitespace-nowrap cursor-pointer"
        >
          <div className="w-4 h-4 flex items-center justify-center"><i className="ri-add-line"></i></div>
          New Ticket
        </Link>
      </div>

      <div className="flex items-center gap-1.5 bg-[#0f172a] rounded-xl p-1 border border-white/5">
        {statuses.map((s) => (
          <button
            key={s}
            onClick={() => setStatusFilter(s)}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all whitespace-nowrap cursor-pointer ${
              statusFilter === s
                ? 'bg-white/10 text-white'
                : 'text-gray-400 hover:text-white hover:bg-white/5'
            }`}
          >
            {s === 'all' ? 'All' : getStatusBadge(s as any).label}
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

      {!loading && !error && filtered.length === 0 && (
        <div className="rounded-xl bg-[#0f172a] border border-white/5 p-12 text-center">
          <div className="w-16 h-16 rounded-full bg-[#1e293b] flex items-center justify-center mx-auto mb-4">
            <div className="w-8 h-8 flex items-center justify-center text-gray-500">
              <i className="ri-customer-service-line text-2xl"></i>
            </div>
          </div>
          <h3 className="text-lg font-semibold text-white mb-1">No tickets yet</h3>
          <p className="text-sm text-gray-400 mb-4">Got an issue? Create a support ticket and we will help you out.</p>
          <Link
            href="/client/support/new"
            className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-medium rounded-lg transition-colors whitespace-nowrap cursor-pointer"
          >
            <div className="w-4 h-4 flex items-center justify-center"><i className="ri-add-line"></i></div>
            Create Ticket
          </Link>
        </div>
      )}

      {!loading && filtered.length > 0 && (
        <div className="grid gap-3">
          {filtered.map((ticket) => {
            const sb = getStatusBadge(ticket.status);
            const pb = getPriorityBadge(ticket.priority);
            return (
              <Link
                key={ticket.id}
                href={`/client/support/${ticket.id}`}
                className="group block rounded-xl bg-[#0f172a] border border-white/5 hover:border-white/15 transition-all p-4 cursor-pointer"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 mb-1.5">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold text-white ${sb.color}`}>
                        {sb.label}
                      </span>
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold text-white ${pb.color}`}>
                        {pb.label}
                      </span>
                      <span className="text-xs text-gray-500">{getCategoryLabel(ticket.category)}</span>
                    </div>
                    <h3 className="text-sm font-medium text-white group-hover:text-indigo-400 transition-colors truncate">
                      {ticket.subject}
                    </h3>
                    <p className="text-xs text-gray-500 mt-1 truncate">{ticket.description.slice(0, 120)}</p>
                    {ticket.affected_site?.site_name && (
                      <p className="text-xs text-gray-600 mt-1.5 flex items-center gap-1">
                        <div className="w-3 h-3 flex items-center justify-center"><i className="ri-building-line"></i></div>
                        {ticket.affected_site.site_name}
                      </p>
                    )}
                  </div>
                  <div className="flex-shrink-0 text-right">
                    <p className="text-xs text-gray-600 whitespace-nowrap">
                      {new Date(ticket.created_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
                    </p>
                    <p className="text-xs text-gray-600 mt-0.5">
                      #{ticket.id.slice(-6).toUpperCase()}
                    </p>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}