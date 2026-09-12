'use client';

import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/lib/auth';

export default function HRCasesPage() {
  const { companyId } = useAuth();
  const [cases, setCases] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');

  const loadData = useCallback(async () => {
    if (!companyId) return;
    setLoading(true);
    const { data } = await supabase
      .from('sensitive_hr_cases')
      .select('*, workforce_profiles!inner(worker_reference)')
      .eq('company_id', companyId)
      .order('created_at', { ascending: false });
    setCases(data || []);
    setLoading(false);
  }, [companyId]);

  useEffect(() => { loadData(); }, [loadData]);

  const filtered = filter === 'all' ? cases : cases.filter((c: any) => c.case_type === filter || c.status === filter || c.priority === filter);

  const caseTypeColors: Record<string, string> = {
    welfare: 'bg-purple-500/10 text-purple-400',
    grievance: 'bg-orange-500/10 text-orange-400',
    disciplinary: 'bg-red-500/10 text-red-400',
    performance: 'bg-blue-500/10 text-blue-400',
    workplace_incident: 'bg-amber-500/10 text-amber-400',
    reasonable_adjustment: 'bg-cyan-500/10 text-cyan-400',
    whistleblowing: 'bg-rose-500/10 text-rose-400',
    other: 'bg-gray-500/10 text-gray-400',
  };

  const statusColors: Record<string, string> = {
    open: 'bg-blue-500/10 text-blue-400',
    under_investigation: 'bg-amber-500/10 text-amber-400',
    awaiting_response: 'bg-violet-500/10 text-violet-400',
    hearing_scheduled: 'bg-orange-500/10 text-orange-400',
    resolved: 'bg-emerald-500/10 text-emerald-400',
    appealed: 'bg-red-500/10 text-red-400',
    closed: 'bg-gray-500/10 text-gray-400',
  };

  const priorityColors: Record<string, string> = {
    low: 'bg-gray-500/10 text-gray-400',
    normal: 'bg-blue-500/10 text-blue-400',
    high: 'bg-amber-500/10 text-amber-400',
    critical: 'bg-red-500/10 text-red-400',
  };

  const stats = [
    { label: 'Open Cases', value: cases.filter((c: any) => c.status === 'open' || c.status === 'under_investigation').length },
    { label: 'Resolved', value: cases.filter((c: any) => c.status === 'resolved' || c.status === 'closed').length },
    { label: 'Critical', value: cases.filter((c: any) => c.priority === 'critical').length },
    { label: 'Disciplinary', value: cases.filter((c: any) => c.case_type === 'disciplinary').length },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white">Sensitive HR Cases</h1>
          <p className="text-gray-400 text-sm mt-1">Restricted access — welfare, grievance, disciplinary and confidential matters</p>
        </div>
        <button className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white text-sm font-medium px-4 py-2.5 rounded-lg transition-colors cursor-pointer whitespace-nowrap">
          <div className="w-4 h-4 flex items-center justify-center"><i className="ri-add-line"></i></div>
          New Case
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
            {['all', 'open', 'under_investigation', 'resolved', 'disciplinary', 'grievance', 'welfare', 'critical'].map((f) => (
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
                  <div className="w-6 h-6 flex items-center justify-center text-gray-500"><i className="ri-scales-line"></i></div>
                </div>
                <p className="text-sm text-gray-400">No cases match the filter</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-800/40">
                    <tr>
                      <th className="px-5 py-3 text-left text-xs font-medium text-gray-400 uppercase">Worker</th>
                      <th className="px-5 py-3 text-left text-xs font-medium text-gray-400 uppercase">Type</th>
                      <th className="px-5 py-3 text-left text-xs font-medium text-gray-400 uppercase">Title</th>
                      <th className="px-5 py-3 text-left text-xs font-medium text-gray-400 uppercase">Priority</th>
                      <th className="px-5 py-3 text-left text-xs font-medium text-gray-400 uppercase">Status</th>
                      <th className="px-5 py-3 text-left text-xs font-medium text-gray-400 uppercase">Opened</th>
                      <th className="px-5 py-3 text-right text-xs font-medium text-gray-400 uppercase">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-800">
                    {filtered.map((c: any) => (
                      <tr key={c.id} className="hover:bg-gray-800/20">
                        <td className="px-5 py-3.5 text-sm text-white">{c.workforce_profiles?.worker_reference || '—'}</td>
                        <td className="px-5 py-3.5">
                          <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium ${caseTypeColors[c.case_type] || ''}`}>
                            {c.case_type.replace(/_/g, ' ')}
                          </span>
                        </td>
                        <td className="px-5 py-3.5 text-sm text-gray-300 max-w-xs truncate">{c.title}</td>
                        <td className="px-5 py-3.5">
                          <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium ${priorityColors[c.priority] || ''}`}>
                            {c.priority}
                          </span>
                        </td>
                        <td className="px-5 py-3.5">
                          <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium ${statusColors[c.status] || ''}`}>
                            {c.status.replace(/_/g, ' ')}
                          </span>
                        </td>
                        <td className="px-5 py-3.5 text-sm text-gray-300">
                          {c.opened_at ? new Date(c.opened_at).toLocaleDateString() : '—'}
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