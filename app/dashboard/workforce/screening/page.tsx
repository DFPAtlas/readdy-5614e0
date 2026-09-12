'use client';

import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/lib/auth';

export default function ScreeningPage() {
  const { companyId } = useAuth();
  const [items, setItems] = useState<any[]>([]);
  const [workers, setWorkers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedWorker, setSelectedWorker] = useState<string>('all');

  const loadData = useCallback(async () => {
    if (!companyId) return;
    setLoading(true);

    const { data: wp } = await supabase
      .from('workforce_profiles')
      .select('id, worker_reference, employment_status')
      .eq('company_id', companyId);
    setWorkers(wp || []);

    const { data: scr } = await supabase
      .from('screening_items')
      .select('*, screening_requirements!inner(name, check_category, is_mandatory), workforce_profiles!inner(worker_reference)')
      .eq('company_id', companyId)
      .order('created_at', { ascending: false });
    setItems(scr || []);

    setLoading(false);
  }, [companyId]);

  useEffect(() => { loadData(); }, [loadData]);

  const filtered = selectedWorker === 'all' ? items : items.filter((i: any) => i.worker_id === selectedWorker);

  const statusColors: Record<string, string> = {
    pending: 'bg-gray-500/10 text-gray-400',
    in_progress: 'bg-blue-500/10 text-blue-400',
    requested: 'bg-violet-500/10 text-violet-400',
    awaiting_response: 'bg-amber-500/10 text-amber-400',
    completed: 'bg-emerald-500/10 text-emerald-400',
    failed: 'bg-red-500/10 text-red-400',
    discrepancy_found: 'bg-orange-500/10 text-orange-400',
    resolved: 'bg-cyan-500/10 text-cyan-400',
    waived: 'bg-gray-500/10 text-gray-500',
    expired: 'bg-red-500/10 text-red-400',
  };

  const stats = [
    { label: 'Total Items', value: items.length },
    { label: 'Completed', value: items.filter((i: any) => i.status === 'completed').length },
    { label: 'In Progress', value: items.filter((i: any) => i.status === 'in_progress').length },
    { label: 'Failed', value: items.filter((i: any) => i.status === 'failed').length },
    { label: 'Pending', value: items.filter((i: any) => i.status === 'pending').length },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white">Screening & Vetting</h1>
          <p className="text-gray-400 text-sm mt-1">Identity, right-to-work, DBS and background checks</p>
        </div>
      </div>

      {loading ? (
        <div className="p-12 flex items-center justify-center">
          <i className="ri-loader-4-line animate-spin text-blue-500 text-2xl"></i>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-4">
            {stats.map((s) => (
              <div key={s.label} className="bg-[#111827] border border-gray-800 rounded-xl p-4">
                <p className="text-xs text-gray-500 uppercase tracking-wider">{s.label}</p>
                <p className="text-xl font-bold text-white mt-0.5">{s.value}</p>
              </div>
            ))}
          </div>

          <div className="flex items-center gap-3">
            <select
              value={selectedWorker}
              onChange={(e) => setSelectedWorker(e.target.value)}
              className="bg-gray-800/60 border border-gray-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-blue-500 pr-8"
            >
              <option value="all">All Workers</option>
              {workers.map((w: any) => (
                <option key={w.id} value={w.id}>{w.worker_reference || w.id.slice(0, 8)}</option>
              ))}
            </select>
          </div>

          <div className="bg-[#111827] border border-gray-800 rounded-xl overflow-hidden">
            {filtered.length === 0 ? (
              <div className="p-12 text-center">
                <div className="w-12 h-12 mx-auto mb-4 rounded-xl bg-gray-800/50 flex items-center justify-center">
                  <div className="w-6 h-6 flex items-center justify-center text-gray-500"><i className="ri-file-search-line"></i></div>
                </div>
                <p className="text-sm text-gray-400">No screening items found</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-800/40">
                    <tr>
                      <th className="px-5 py-3 text-left text-xs font-medium text-gray-400 uppercase">Worker</th>
                      <th className="px-5 py-3 text-left text-xs font-medium text-gray-400 uppercase">Requirement</th>
                      <th className="px-5 py-3 text-left text-xs font-medium text-gray-400 uppercase">Category</th>
                      <th className="px-5 py-3 text-left text-xs font-medium text-gray-400 uppercase">Mandatory</th>
                      <th className="px-5 py-3 text-left text-xs font-medium text-gray-400 uppercase">Status</th>
                      <th className="px-5 py-3 text-left text-xs font-medium text-gray-400 uppercase">Approval</th>
                      <th className="px-5 py-3 text-left text-xs font-medium text-gray-400 uppercase">Expiry</th>
                      <th className="px-5 py-3 text-right text-xs font-medium text-gray-400 uppercase">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-800">
                    {filtered.map((item: any) => (
                      <tr key={item.id} className="hover:bg-gray-800/20">
                        <td className="px-5 py-3.5 text-sm text-white">{item.workforce_profiles?.worker_reference || '—'}</td>
                        <td className="px-5 py-3.5 text-sm text-gray-300">{item.screening_requirements?.name || '—'}</td>
                        <td className="px-5 py-3.5 text-sm text-gray-300">{item.screening_requirements?.check_category || '—'}</td>
                        <td className="px-5 py-3.5">
                          {item.screening_requirements?.is_mandatory ? (
                            <span className="text-xs font-medium text-amber-400">Required</span>
                          ) : (
                            <span className="text-xs text-gray-500">Optional</span>
                          )}
                        </td>
                        <td className="px-5 py-3.5">
                          <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium ${statusColors[item.status] || ''}`}>
                            {item.status.replace(/_/g, ' ')}
                          </span>
                        </td>
                        <td className="px-5 py-3.5">
                          <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium ${
                            item.approval_status === 'approved' ? 'bg-emerald-500/10 text-emerald-400' :
                            item.approval_status === 'rejected' ? 'bg-red-500/10 text-red-400' :
                            'bg-gray-500/10 text-gray-400'
                          }`}>{item.approval_status}</span>
                        </td>
                        <td className="px-5 py-3.5 text-sm text-gray-300">{item.expiry_date || '—'}</td>
                        <td className="px-5 py-3.5 text-right">
                          <div className="flex items-center justify-end gap-1">
                            <button className="w-8 h-8 flex items-center justify-center text-gray-400 hover:text-emerald-400 hover:bg-emerald-500/10 rounded-lg cursor-pointer" title="Approve">
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