'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/lib/auth';
import AITooledOperationsCopilot from '@/app/dashboard/components/AITooledOperationsCopilot';

interface Client {
  id: string;
  name: string;
  contact_person: string | null;
  contact_email: string | null;
  status: string | null;
  user_count: number;
}

export default function ClientsListPage() {
  const { companyId, profile } = useAuth();
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  const isAdmin = profile && ['super_admin', 'company_admin', 'operations_manager'].includes(profile.role);

  useEffect(() => {
    if (!companyId) {
      setLoading(false);
      return;
    }

    const fetchClients = async () => {
      const { data: clientsData } = await supabase
        .from('clients')
        .select('id, name, contact_person, contact_email, status')
        .eq('company_id', companyId)
        .order('name', { ascending: true });

      const clientList = clientsData || [];

      const { data: cuData } = await supabase
        .from('client_users')
        .select('client_id')
        .in(
          'client_id',
          clientList.map((c) => c.id)
        );

      const counts: Record<string, number> = {};
      (cuData || []).forEach((cu) => {
        counts[cu.client_id] = (counts[cu.client_id] || 0) + 1;
      });

      setClients(
        clientList.map((c) => ({
          ...c,
          user_count: counts[c.id] || 0,
        }))
      );
      setLoading(false);
    };

    fetchClients();
  }, [companyId]);

  const filtered = clients.filter(
    (c) =>
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      (c.contact_person || '').toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-[#0a0e1a]">
      <div className="max-w-5xl mx-auto px-4 lg:px-6 py-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
          <div>
            <h1 className="text-2xl font-bold text-white">Clients</h1>
            <p className="text-sm text-gray-400 mt-0.5">
              {isAdmin
                ? 'Manage your client accounts and portal access.'
                : 'Your assigned clients.'}
            </p>
          </div>
          <div className="relative">
            <div className="w-5 h-5 flex items-center justify-center absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">
              <i className="ri-search-line text-sm"></i>
            </div>
            <input
              type="text"
              placeholder="Search clients..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="bg-gray-800/60 border border-gray-700 rounded-lg pl-10 pr-4 py-2 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 w-64"
            />
          </div>
        </div>

        {loading && (
          <div className="flex items-center justify-center py-20">
            <div className="relative flex h-8 w-8">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-8 w-8 bg-blue-500"></span>
            </div>
          </div>
        )}

        {!loading && filtered.length === 0 && (
          <div className="bg-[#111827] border border-gray-800 rounded-xl p-10 text-center">
            <div className="w-12 h-12 mx-auto mb-4 rounded-full bg-gray-800 flex items-center justify-center">
              <div className="w-6 h-6 flex items-center justify-center text-gray-500">
                <i className="ri-building-line text-xl"></i>
              </div>
            </div>
            <h3 className="text-white font-semibold mb-1">No clients found</h3>
            <p className="text-sm text-gray-400">
              {search ? 'Try adjusting your search.' : 'Clients will appear here once created.'}
            </p>
          </div>
        )}

        {!loading && filtered.length > 0 && (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filtered.map((client) => (
              <div
                key={client.id}
                className="bg-[#111827] border border-gray-800 rounded-xl p-5 hover:border-gray-700 transition-colors"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="w-10 h-10 rounded-lg bg-blue-600/15 flex items-center justify-center flex-shrink-0">
                    <div className="w-5 h-5 flex items-center justify-center text-blue-400">
                      <i className="ri-building-line"></i>
                    </div>
                  </div>
                  <span
                    className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border ${
                      client.status === 'active'
                        ? 'bg-emerald-500/15 text-emerald-400 border-emerald-500/20'
                        : 'bg-gray-500/15 text-gray-400 border-gray-500/20'
                    }`}
                  >
                    {client.status || 'active'}
                  </span>
                </div>
                <h3 className="text-white font-semibold mb-1">{client.name}</h3>
                <p className="text-sm text-gray-500 mb-3">{client.contact_person || '—'}</p>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-gray-500">
                    {client.user_count} portal user{client.user_count !== 1 ? 's' : ''}
                  </span>
                  <Link
                    href={`/dashboard/clients/${client.id}/users`}
                    className="inline-flex items-center gap-1 px-3 py-1.5 bg-blue-600/15 text-blue-400 text-xs font-medium rounded-lg hover:bg-blue-600/25 transition-colors cursor-pointer whitespace-nowrap"
                  >
                    <div className="w-4 h-4 flex items-center justify-center">
                      <i className="ri-user-settings-line"></i>
                    </div>
                    Manage Users
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <AITooledOperationsCopilot />
    </div>
  );
}