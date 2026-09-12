'use client';

import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/lib/auth';

export default function RetentionPage() {
  const { companyId } = useAuth();
  const [rules, setRules] = useState<any[]>([]);
  const [holds, setHolds] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<'rules' | 'holds'>('rules');

  const loadData = useCallback(async () => {
    if (!companyId) return;
    setLoading(true);

    const { data: r } = await supabase
      .from('retention_rules')
      .select('*')
      .eq('company_id', companyId)
      .order('record_category');
    setRules(r || []);

    const { data: h } = await supabase
      .from('legal_holds')
      .select('*')
      .eq('company_id', companyId)
      .order('applied_at', { ascending: false });
    setHolds(h || []);

    setLoading(false);
  }, [companyId]);

  useEffect(() => { loadData(); }, [loadData]);

  const defaultCategories = [
    'Unsuccessful Applications',
    'Identity & Right-to-Work Evidence',
    'Screening Files',
    'References',
    'Training Records',
    'Employment/Workforce Records',
    'Health Information',
    'Disciplinary/Grievance Cases',
    'Audit Records',
    'Payroll Data',
    'Client Contracts',
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white">Data Retention</h1>
          <p className="text-gray-400 text-sm mt-1">Configure retention rules and manage legal holds</p>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <button
          onClick={() => setTab('rules')}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors cursor-pointer whitespace-nowrap ${tab === 'rules' ? 'bg-blue-600 text-white' : 'bg-gray-800 text-gray-400 hover:text-white border border-gray-700'}`}
        >
          <div className="w-4 h-4 inline-flex items-center justify-center mr-1.5"><i className="ri-archive-line"></i></div>
          Retention Rules
        </button>
        <button
          onClick={() => setTab('holds')}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors cursor-pointer whitespace-nowrap ${tab === 'holds' ? 'bg-blue-600 text-white' : 'bg-gray-800 text-gray-400 hover:text-white border border-gray-700'}`}
        >
          <div className="w-4 h-4 inline-flex items-center justify-center mr-1.5"><i className="ri-lock-line"></i></div>
          Legal Holds ({holds.length})
        </button>
      </div>

      {loading ? (
        <div className="p-12 flex items-center justify-center">
          <i className="ri-loader-4-line animate-spin text-blue-500 text-2xl"></i>
        </div>
      ) : tab === 'rules' ? (
        <div className="bg-[#111827] border border-gray-800 rounded-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-800/40">
                <tr>
                  <th className="px-5 py-3 text-left text-xs font-medium text-gray-400 uppercase">Record Category</th>
                  <th className="px-5 py-3 text-left text-xs font-medium text-gray-400 uppercase">Purpose</th>
                  <th className="px-5 py-3 text-left text-xs font-medium text-gray-400 uppercase">Lawful Basis</th>
                  <th className="px-5 py-3 text-left text-xs font-medium text-gray-400 uppercase">Retention (months)</th>
                  <th className="px-5 py-3 text-left text-xs font-medium text-gray-400 uppercase">Status</th>
                  <th className="px-5 py-3 text-right text-xs font-medium text-gray-400 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-800">
                {defaultCategories.map((cat) => {
                  const existing = rules.find((r: any) => r.record_category === cat);
                  return (
                    <tr key={cat} className="hover:bg-gray-800/20">
                      <td className="px-5 py-3.5 text-sm text-white">{cat}</td>
                      <td className="px-5 py-3.5 text-sm text-gray-300">{existing?.purpose || '—'}</td>
                      <td className="px-5 py-3.5 text-sm text-gray-300">{existing?.lawful_basis_note || '—'}</td>
                      <td className="px-5 py-3.5 text-sm text-gray-300">{existing?.retention_months || '—'}</td>
                      <td className="px-5 py-3.5">
                        {existing ? (
                          <span className="inline-flex px-2 py-0.5 rounded-full text-xs font-medium bg-emerald-500/10 text-emerald-400">Configured</span>
                        ) : (
                          <span className="inline-flex px-2 py-0.5 rounded-full text-xs font-medium bg-gray-500/10 text-gray-400">Not set</span>
                        )}
                      </td>
                      <td className="px-5 py-3.5 text-right">
                        <button className="w-8 h-8 flex items-center justify-center text-gray-400 hover:text-blue-400 hover:bg-blue-500/10 rounded-lg cursor-pointer">
                          <div className="w-4 h-4 flex items-center justify-center"><i className="ri-edit-line"></i></div>
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="bg-[#111827] border border-gray-800 rounded-xl overflow-hidden">
          {holds.length === 0 ? (
            <div className="p-12 text-center">
              <div className="w-12 h-12 mx-auto mb-4 rounded-xl bg-gray-800/50 flex items-center justify-center">
                <div className="w-6 h-6 flex items-center justify-center text-gray-500"><i className="ri-lock-line"></i></div>
              </div>
              <p className="text-sm text-gray-400">No active legal holds</p>
              <button className="mt-3 inline-flex items-center gap-2 bg-gray-800 hover:bg-gray-700 text-gray-300 text-sm font-medium px-4 py-2 rounded-lg transition-colors cursor-pointer whitespace-nowrap">
                <div className="w-4 h-4 flex items-center justify-center"><i className="ri-add-line"></i></div>
                Place Hold
              </button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-800/40">
                  <tr>
                    <th className="px-5 py-3 text-left text-xs font-medium text-gray-400 uppercase">Reason</th>
                    <th className="px-5 py-3 text-left text-xs font-medium text-gray-400 uppercase">Categories</th>
                    <th className="px-5 py-3 text-left text-xs font-medium text-gray-400 uppercase">Applied</th>
                    <th className="px-5 py-3 text-left text-xs font-medium text-gray-400 uppercase">Status</th>
                    <th className="px-5 py-3 text-right text-xs font-medium text-gray-400 uppercase">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-800">
                  {holds.map((h: any) => (
                    <tr key={h.id} className="hover:bg-gray-800/20">
                      <td className="px-5 py-3.5 text-sm text-white">{h.hold_reason}</td>
                      <td className="px-5 py-3.5 text-sm text-gray-300">{(h.record_categories || []).join(', ')}</td>
                      <td className="px-5 py-3.5 text-sm text-gray-300">{h.applied_at ? new Date(h.applied_at).toLocaleDateString() : '—'}</td>
                      <td className="px-5 py-3.5">
                        {h.released_at ? (
                          <span className="inline-flex px-2 py-0.5 rounded-full text-xs font-medium bg-gray-500/10 text-gray-400">Released</span>
                        ) : (
                          <span className="inline-flex px-2 py-0.5 rounded-full text-xs font-medium bg-red-500/10 text-red-400">Active</span>
                        )}
                      </td>
                      <td className="px-5 py-3.5 text-right">
                        {!h.released_at && (
                          <button className="text-xs text-blue-400 hover:text-blue-300 cursor-pointer">Release</button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  );
}