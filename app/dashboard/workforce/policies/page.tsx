'use client';

import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/lib/auth';

export default function PoliciesPage() {
  const { companyId } = useAuth();
  const [policies, setPolicies] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const loadData = useCallback(async () => {
    if (!companyId) return;
    setLoading(true);
    const { data } = await supabase
      .from('workforce_policies')
      .select('*')
      .eq('company_id', companyId)
      .order('created_at', { ascending: false });
    setPolicies(data || []);
    setLoading(false);
  }, [companyId]);

  useEffect(() => { loadData(); }, [loadData]);

  const categoryIcons: Record<string, string> = {
    'Code of Conduct': 'ri-hand-heart-line',
    'Health and Safety': 'ri-heart-pulse-line',
    'Data Protection': 'ri-lock-line',
    'Lone Working': 'ri-user-line',
    'Equality and Conduct': 'ri-scales-line',
    'Incident Reporting': 'ri-alert-line',
    'Uniform/Equipment': 'ri-t-shirt-line',
    'Social Media': 'ri-share-line',
    'Site Instructions': 'ri-building-line',
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white">Workforce Policies</h1>
          <p className="text-gray-400 text-sm mt-1">Version-controlled policies, acknowledgments and compliance</p>
        </div>
        <button className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white text-sm font-medium px-4 py-2.5 rounded-lg transition-colors cursor-pointer whitespace-nowrap">
          <div className="w-4 h-4 flex items-center justify-center"><i className="ri-add-line"></i></div>
          New Policy
        </button>
      </div>

      {loading ? (
        <div className="p-12 flex items-center justify-center">
          <i className="ri-loader-4-line animate-spin text-blue-500 text-2xl"></i>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {policies.length === 0 ? (
            <div className="col-span-2 bg-[#111827] border border-gray-800 rounded-xl p-12 text-center">
              <div className="w-12 h-12 mx-auto mb-4 rounded-xl bg-gray-800/50 flex items-center justify-center">
                <div className="w-6 h-6 flex items-center justify-center text-gray-500"><i className="ri-file-text-line"></i></div>
              </div>
              <p className="text-sm text-gray-400">No policies created yet</p>
            </div>
          ) : (
            policies.map((p: any) => (
              <div key={p.id} className="bg-[#111827] border border-gray-800 rounded-xl p-5 hover:border-gray-700 transition-colors">
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-lg bg-blue-500/10 flex items-center justify-center flex-shrink-0">
                    <div className="w-5 h-5 flex items-center justify-center text-blue-400">
                      <i className={categoryIcons[p.category] || 'ri-file-text-line'}></i>
                    </div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h4 className="text-sm font-semibold text-white">{p.title}</h4>
                      <span className="text-xs text-gray-500">v{p.version}</span>
                      {p.is_mandatory && (
                        <span className="inline-flex px-1.5 py-0.5 rounded text-[10px] font-medium bg-amber-500/10 text-amber-400">Mandatory</span>
                      )}
                    </div>
                    <p className="text-xs text-gray-500 mt-1">{p.category}</p>
                    {p.description && (
                      <p className="text-sm text-gray-400 mt-2 line-clamp-2">{p.description}</p>
                    )}
                    <div className="flex items-center gap-3 mt-3">
                      <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium ${
                        p.status === 'active' ? 'bg-emerald-500/10 text-emerald-400' :
                        p.status === 'draft' ? 'bg-gray-500/10 text-gray-400' :
                        p.status === 'superseded' ? 'bg-amber-500/10 text-amber-400' :
                        'bg-gray-500/10 text-gray-400'
                      }`}>{p.status}</span>
                      {p.published_at && (
                        <span className="text-xs text-gray-500">Published {new Date(p.published_at).toLocaleDateString()}</span>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-1">
                    <button className="w-8 h-8 flex items-center justify-center text-gray-400 hover:text-blue-400 hover:bg-blue-500/10 rounded-lg cursor-pointer">
                      <div className="w-4 h-4 flex items-center justify-center"><i className="ri-eye-line"></i></div>
                    </button>
                    <button className="w-8 h-8 flex items-center justify-center text-gray-400 hover:text-blue-400 hover:bg-blue-500/10 rounded-lg cursor-pointer">
                      <div className="w-4 h-4 flex items-center justify-center"><i className="ri-edit-line"></i></div>
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}