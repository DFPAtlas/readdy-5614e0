'use client';

import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/lib/auth';

export default function OffboardingPage() {
  const { companyId } = useAuth();
  const [checklists, setChecklists] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const loadData = useCallback(async () => {
    if (!companyId) return;
    setLoading(true);
    const { data } = await supabase
      .from('offboarding_checklists')
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
          <h1 className="text-2xl font-bold text-white">Offboarding</h1>
          <p className="text-gray-400 text-sm mt-1">Controlled exit process — access, equipment, and records</p>
        </div>
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
                  <div className="w-6 h-6 flex items-center justify-center text-gray-500"><i className="ri-logout-box-r-line"></i></div>
                </div>
                <p className="text-sm text-gray-400">No offboarding checklists</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-800/40">
                    <tr>
                      <th className="px-5 py-3 text-left text-xs font-medium text-gray-400 uppercase">Worker</th>
                      <th className="px-5 py-3 text-left text-xs font-medium text-gray-400 uppercase">Status</th>
                      <th className="px-5 py-3 text-left text-xs font-medium text-gray-400 uppercase">Exit Reason</th>
                      <th className="px-5 py-3 text-left text-xs font-medium text-gray-400 uppercase">Access Revoked</th>
                      <th className="px-5 py-3 text-left text-xs font-medium text-gray-400 uppercase">Sessions</th>
                      <th className="px-5 py-3 text-left text-xs font-medium text-gray-400 uppercase">Pay Handoff</th>
                      <th className="px-5 py-3 text-right text-xs font-medium text-gray-400 uppercase">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-800">
                    {checklists.map((oc: any) => (
                      <tr key={oc.id} className="hover:bg-gray-800/20">
                        <td className="px-5 py-3.5 text-sm text-white">{oc.workforce_profiles?.worker_reference || '—'}</td>
                        <td className="px-5 py-3.5">
                          <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium ${statusColors[oc.overall_status] || ''}`}>
                            {oc.overall_status.replace(/_/g, ' ')}
                          </span>
                        </td>
                        <td className="px-5 py-3.5 text-sm text-gray-300">{oc.exit_reason || '—'}</td>
                        <td className="px-5 py-3.5 text-sm text-gray-300">
                          {oc.access_revoked_at ? new Date(oc.access_revoked_at).toLocaleDateString() : 'Not yet'}
                        </td>
                        <td className="px-5 py-3.5">
                          {oc.sessions_revoked ? (
                            <span className="text-xs font-medium text-emerald-400">Revoked</span>
                          ) : (
                            <span className="text-xs text-gray-500">Pending</span>
                          )}
                        </td>
                        <td className="px-5 py-3.5">
                          {oc.final_pay_run_handoff ? (
                            <span className="text-xs font-medium text-emerald-400">Complete</span>
                          ) : (
                            <span className="text-xs text-gray-500">Pending</span>
                          )}
                        </td>
                        <td className="px-5 py-3.5 text-right">
                          <button className="w-8 h-8 flex items-center justify-center text-gray-400 hover:text-blue-400 hover:bg-blue-500/10 rounded-lg cursor-pointer">
                            <div className="w-4 h-4 flex items-center justify-center"><i className="ri-eye-line"></i></div>
                          </button>
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