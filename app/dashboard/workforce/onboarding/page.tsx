'use client';

import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/lib/auth';

export default function OnboardingPage() {
  const { companyId } = useAuth();
  const [checklists, setChecklists] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const loadData = useCallback(async () => {
    if (!companyId) return;
    setLoading(true);
    const { data } = await supabase
      .from('onboarding_checklists')
      .select('*, workforce_profiles!inner(worker_reference, employment_status)')
      .eq('company_id', companyId)
      .order('created_at', { ascending: false });
    setChecklists(data || []);
    setLoading(false);
  }, [companyId]);

  useEffect(() => { loadData(); }, [loadData]);

  const statusColors: Record<string, string> = {
    not_started: 'bg-gray-500/10 text-gray-400',
    in_progress: 'bg-blue-500/10 text-blue-400',
    completed: 'bg-emerald-500/10 text-emerald-400',
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white">Onboarding</h1>
          <p className="text-gray-400 text-sm mt-1">New starter checklists — identity, training, policies and inductions</p>
        </div>
        <button className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white text-sm font-medium px-4 py-2.5 rounded-lg transition-colors cursor-pointer whitespace-nowrap">
          <div className="w-4 h-4 flex items-center justify-center"><i className="ri-add-line"></i></div>
          Start Onboarding
        </button>
      </div>

      {loading ? (
        <div className="p-12 flex items-center justify-center">
          <i className="ri-loader-4-line animate-spin text-blue-500 text-2xl"></i>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-3 gap-4">
            {[
              { label: 'Total', value: checklists.length, color: 'text-blue-400' },
              { label: 'In Progress', value: checklists.filter((c: any) => c.overall_status === 'in_progress').length, color: 'text-amber-400' },
              { label: 'Completed', value: checklists.filter((c: any) => c.overall_status === 'completed').length, color: 'text-emerald-400' },
            ].map((s) => (
              <div key={s.label} className="bg-[#111827] border border-gray-800 rounded-xl p-4">
                <p className="text-xs text-gray-500 uppercase tracking-wider">{s.label}</p>
                <p className={`text-xl font-bold mt-0.5 ${s.color}`}>{s.value}</p>
              </div>
            ))}
          </div>

          <div className="bg-[#111827] border border-gray-800 rounded-xl overflow-hidden">
            {checklists.length === 0 ? (
              <div className="p-12 text-center">
                <div className="w-12 h-12 mx-auto mb-4 rounded-xl bg-gray-800/50 flex items-center justify-center">
                  <div className="w-6 h-6 flex items-center justify-center text-gray-500"><i className="ri-clipboard-line"></i></div>
                </div>
                <p className="text-sm text-gray-400">No onboarding checklists yet</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-800/40">
                    <tr>
                      <th className="px-5 py-3 text-left text-xs font-medium text-gray-400 uppercase">Worker</th>
                      <th className="px-5 py-3 text-left text-xs font-medium text-gray-400 uppercase">Worker Status</th>
                      <th className="px-5 py-3 text-left text-xs font-medium text-gray-400 uppercase">Onboarding Status</th>
                      <th className="px-5 py-3 text-left text-xs font-medium text-gray-400 uppercase">Items</th>
                      <th className="px-5 py-3 text-left text-xs font-medium text-gray-400 uppercase">Started</th>
                      <th className="px-5 py-3 text-left text-xs font-medium text-gray-400 uppercase">Completed</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-800">
                    {checklists.map((oc: any) => {
                      const items = oc.items || [];
                      const total = items.length;
                      const done = items.filter((i: any) => i.status === 'completed' || i.status === 'waived').length;
                      return (
                        <tr key={oc.id} className="hover:bg-gray-800/20">
                          <td className="px-5 py-3.5 text-sm text-white">{oc.workforce_profiles?.worker_reference || '—'}</td>
                          <td className="px-5 py-3.5 text-sm text-gray-300">{oc.workforce_profiles?.employment_status || '—'}</td>
                          <td className="px-5 py-3.5">
                            <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium ${statusColors[oc.overall_status] || ''}`}>
                              {oc.overall_status.replace(/_/g, ' ')}
                            </span>
                          </td>
                          <td className="px-5 py-3.5 text-sm text-gray-300">{done}/{total}</td>
                          <td className="px-5 py-3.5 text-sm text-gray-300">
                            {oc.started_at ? new Date(oc.started_at).toLocaleDateString() : '—'}
                          </td>
                          <td className="px-5 py-3.5 text-sm text-gray-300">
                            {oc.completed_at ? new Date(oc.completed_at).toLocaleDateString() : '—'}
                          </td>
                        </tr>
                      );
                    })}
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