'use client';

import { useState, useEffect } from 'react';
import { useSites } from '@/lib/useSites';
import { useAuth } from '@/lib/auth';
import { supabase } from '@/lib/supabase';
import { SOPFormData } from '@/lib/useBuiltSOPs';

interface Props {
  data: SOPFormData;
  onChange: (data: Partial<SOPFormData>) => void;
}

interface ClientOption {
  id: string;
  client_name: string;
}

export default function StepClientSite({ data, onChange }: Props) {
  const { sites } = useSites();
  const { companyId } = useAuth();
  const [clients, setClients] = useState<ClientOption[]>([]);
  const [loadingClients, setLoadingClients] = useState(false);

  useEffect(() => {
    if (!companyId) return;
    setLoadingClients(true);
    supabase
      .from('clients')
      .select('id, client_name')
      .eq('company_id', companyId)
      .order('client_name', { ascending: true })
      .then(({ data: d }) => {
        setClients(d || []);
        setLoadingClients(false);
      });
  }, [companyId]);

  const selectedSite = sites.find((s) => s.id === data.site_id);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-white mb-1">Client & Site</h2>
        <p className="text-sm text-gray-400">Link this SOP to a specific client and site, or create a company-wide procedure.</p>
      </div>

      <div className="space-y-5">
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">SOP Title</label>
          <input
            type="text"
            value={data.title}
            onChange={(e) => onChange({ title: e.target.value })}
            placeholder="e.g. Westgate Mall - Opening Procedure"
            className="w-full bg-gray-800/60 border border-gray-700 rounded-lg px-4 py-2.5 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-blue-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">Client (optional)</label>
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => onChange({ client_name: '' })}
              className={`px-3 py-2 rounded-lg text-sm border transition-colors cursor-pointer whitespace-nowrap ${
                !data.client_name
                  ? 'bg-blue-500/10 border-blue-500/30 text-blue-400'
                  : 'bg-gray-800/40 border-gray-700 text-gray-400 hover:border-gray-600'
              }`}
            >
              Company-wide
            </button>
            {loadingClients && (
              <div className="w-4 h-4 flex items-center justify-center">
                <i className="ri-loader-4-line animate-spin text-gray-500"></i>
              </div>
            )}
            {clients.map((c) => (
              <button
                key={c.id}
                onClick={() => onChange({ client_name: c.client_name })}
                className={`px-3 py-2 rounded-lg text-sm border transition-colors cursor-pointer whitespace-nowrap ${
                  data.client_name === c.client_name
                    ? 'bg-blue-500/10 border-blue-500/30 text-blue-400'
                    : 'bg-gray-800/40 border-gray-700 text-gray-400 hover:border-gray-600'
                }`}
              >
                {c.client_name}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">Site (optional)</label>
          <div className="grid grid-cols-2 lg:grid-cols-3 gap-2">
            <button
              onClick={() => onChange({ site_id: null })}
              className={`px-3 py-2.5 rounded-lg text-sm border transition-colors text-left cursor-pointer whitespace-nowrap ${
                !data.site_id
                  ? 'bg-blue-500/10 border-blue-500/30 text-blue-400'
                  : 'bg-gray-800/40 border-gray-700 text-gray-400 hover:border-gray-600'
              }`}
            >
              <div className="w-4 h-4 inline-flex items-center justify-center mr-1">
                <i className="ri-global-line text-xs"></i>
              </div>
              All Sites
            </button>
            {sites.map((s) => (
              <button
                key={s.id}
                onClick={() => onChange({ site_id: s.id })}
                className={`px-3 py-2.5 rounded-lg text-sm border transition-colors text-left cursor-pointer whitespace-nowrap ${
                  data.site_id === s.id
                    ? 'bg-blue-500/10 border-blue-500/30 text-blue-400'
                    : 'bg-gray-800/40 border-gray-700 text-gray-400 hover:border-gray-600'
                }`}
              >
                <div className="w-4 h-4 inline-flex items-center justify-center mr-1">
                  <i className="ri-building-line text-xs"></i>
                </div>
                {s.site_name}
              </button>
            ))}
          </div>
        </div>

        {selectedSite && (
          <div className="flex items-center gap-2 text-sm text-gray-400 bg-gray-800/30 rounded-lg px-3 py-2 border border-gray-700/50">
            <div className="w-4 h-4 flex items-center justify-center"><i className="ri-map-pin-line text-xs"></i></div>
            {selectedSite.site_address || selectedSite.site_name}
          </div>
        )}
      </div>
    </div>
  );
}