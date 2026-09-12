'use client';

import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/lib/auth';

export default function SIALicenceManagement() {
  const { companyId } = useAuth();
  const [licences, setLicences] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');

  const loadData = useCallback(async () => {
    if (!companyId) return;
    setLoading(true);
    const { data } = await supabase
      .from('sia_licences')
      .select('*, workforce_profiles!inner(worker_reference)')
      .eq('company_id', companyId)
      .order('expiry_date', { ascending: true });
    setLicences(data || []);
    setLoading(false);
  }, [companyId]);

  useEffect(() => { loadData(); }, [loadData]);

  const filtered = licences.filter((l: any) => {
    if (filter === 'all') return true;
    if (filter === 'expiring') return l.expiry_date && new Date(l.expiry_date) < new Date(Date.now() + 60 * 86400000);
    if (filter === 'expired') return l.expiry_date && new Date(l.expiry_date) < new Date();
    if (filter === 'valid') return l.status === 'verified_valid';
    return l.status === filter;
  });

  const statusColors: Record<string, string> = {
    pending_verification: 'bg-gray-500/10 text-gray-400',
    verified_valid: 'bg-emerald-500/10 text-emerald-400',
    verified_expired: 'bg-red-500/10 text-red-400',
    verified_suspended: 'bg-amber-500/10 text-amber-400',
    verified_revoked: 'bg-red-500/10 text-red-400',
    verification_failed: 'bg-red-500/10 text-red-400',
  };

  const stats = [
    { label: 'Total Licences', value: licences.length },
    { label: 'Verified Valid', value: licences.filter((l: any) => l.status === 'verified_valid').length },
    { label: 'Expiring Soon', value: licences.filter((l: any) => l.expiry_date && new Date(l.expiry_date) < new Date(Date.now() + 60 * 86400000) && l.status === 'verified_valid').length },
    { label: 'Expired', value: licences.filter((l: any) => l.expiry_date && new Date(l.expiry_date) < new Date() && l.status === 'verified_valid').length },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white">SIA Licence Management</h1>
          <p className="text-gray-400 text-sm mt-1">Track, verify and monitor SIA licences</p>
        </div>
        <button className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white text-sm font-medium px-4 py-2.5 rounded-lg transition-colors cursor-pointer whitespace-nowrap">
          <div className="w-4 h-4 flex items-center justify-center"><i className="ri-add-line"></i></div>
          Add Licence
        </button>
      </div>

      {loading ? (
        <div className="p-12 flex items-center justify-center">
          <i className="ri-loader-4-line animate-spin text-blue-500 text-2xl"></i>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {stats.map((s) => (
              <div key={s.label} className="bg-[#111827] border border-gray-800 rounded-xl p-4">
                <p className="text-xs text-gray-500 uppercase tracking-wider">{s.label}</p>
                <p className="text-xl font-bold text-white mt-0.5">{s.value}</p>
              </div>
            ))}
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            {['all', 'valid', 'expiring', 'expired', 'pending_verification', 'verified_suspended'].map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors cursor-pointer whitespace-nowrap ${
                  filter === f ? 'bg-blue-600 text-white' : 'bg-gray-800 text-gray-400 hover:text-white border border-gray-700'
                }`}
              >
                {f.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase())}
              </button>
            ))}
          </div>

          <div className="bg-[#111827] border border-gray-800 rounded-xl overflow-hidden">
            {filtered.length === 0 ? (
              <div className="p-12 text-center">
                <div className="w-12 h-12 mx-auto mb-4 rounded-xl bg-gray-800/50 flex items-center justify-center">
                  <div className="w-6 h-6 flex items-center justify-center text-gray-500"><i className="ri-shield-keyhole-line"></i></div>
                </div>
                <p className="text-sm text-gray-400">No licences match the filter</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-800/40">
                    <tr>
                      <th className="px-5 py-3 text-left text-xs font-medium text-gray-400 uppercase">Worker</th>
                      <th className="px-5 py-3 text-left text-xs font-medium text-gray-400 uppercase">Licence Number</th>
                      <th className="px-5 py-3 text-left text-xs font-medium text-gray-400 uppercase">Type</th>
                      <th className="px-5 py-3 text-left text-xs font-medium text-gray-400 uppercase">Status</th>
                      <th className="px-5 py-3 text-left text-xs font-medium text-gray-400 uppercase">Issue Date</th>
                      <th className="px-5 py-3 text-left text-xs font-medium text-gray-400 uppercase">Expiry</th>
                      <th className="px-5 py-3 text-left text-xs font-medium text-gray-400 uppercase">Last Checked</th>
                      <th className="px-5 py-3 text-right text-xs font-medium text-gray-400 uppercase">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-800">
                    {filtered.map((l: any) => (
                      <tr key={l.id} className="hover:bg-gray-800/20">
                        <td className="px-5 py-3.5 text-sm text-white">{l.workforce_profiles?.worker_reference || '—'}</td>
                        <td className="px-5 py-3.5 text-sm text-gray-300 font-mono">{l.licence_number}</td>
                        <td className="px-5 py-3.5 text-sm text-gray-300">{l.licence_type}</td>
                        <td className="px-5 py-3.5">
                          <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium ${statusColors[l.status] || ''}`}>
                            {l.status.replace(/_/g, ' ')}
                          </span>
                        </td>
                        <td className="px-5 py-3.5 text-sm text-gray-300">{l.issue_date || '—'}</td>
                        <td className="px-5 py-3.5">
                          <span className={`text-sm ${l.expiry_date && new Date(l.expiry_date) < new Date() ? 'text-red-400' : 'text-gray-300'}`}>
                            {l.expiry_date || '—'}
                          </span>
                        </td>
                        <td className="px-5 py-3.5 text-sm text-gray-300">
                          {l.last_checked_date ? new Date(l.last_checked_date).toLocaleDateString() : '—'}
                        </td>
                        <td className="px-5 py-3.5 text-right">
                          <div className="flex items-center justify-end gap-1">
                            <button className="w-8 h-8 flex items-center justify-center text-gray-400 hover:text-emerald-400 hover:bg-emerald-500/10 rounded-lg cursor-pointer" title="Verify">
                              <div className="w-4 h-4 flex items-center justify-center"><i className="ri-check-line"></i></div>
                            </button>
                            <button className="w-8 h-8 flex items-center justify-center text-gray-400 hover:text-blue-400 hover:bg-blue-500/10 rounded-lg cursor-pointer" title="View">
                              <div className="w-4 h-4 flex items-center justify-center"><i className="ri-eye-line"></i></div>
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
        </>
      )}
    </div>
  );
}