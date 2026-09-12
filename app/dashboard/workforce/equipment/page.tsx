'use client';

import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/lib/auth';

export default function EquipmentPage() {
  const { companyId } = useAuth();
  const [equipment, setEquipment] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');

  const loadData = useCallback(async () => {
    if (!companyId) return;
    setLoading(true);
    const { data } = await supabase
      .from('uniform_equipment')
      .select('*, workforce_profiles!inner(worker_reference)')
      .eq('company_id', companyId)
      .order('created_at', { ascending: false });
    setEquipment(data || []);
    setLoading(false);
  }, [companyId]);

  useEffect(() => { loadData(); }, [loadData]);

  const filtered = filter === 'all' ? equipment : equipment.filter((e: any) => e.asset_type === filter || e.condition_status === filter);

  const conditionColors: Record<string, string> = {
    new: 'bg-blue-500/10 text-blue-400',
    good: 'bg-emerald-500/10 text-emerald-400',
    fair: 'bg-amber-500/10 text-amber-400',
    damaged: 'bg-orange-500/10 text-orange-400',
    lost: 'bg-red-500/10 text-red-400',
    returned: 'bg-gray-500/10 text-gray-400',
  };

  const assetTypes = ['all', 'uniform', 'id_card', 'radio', 'body_worn_camera', 'phone', 'keys', 'access_card', 'ppe', 'other'];

  const stats = [
    { label: 'Total Items', value: equipment.length },
    { label: 'Issued', value: equipment.filter((e: any) => e.condition_status !== 'returned').length },
    { label: 'Returned', value: equipment.filter((e: any) => e.condition_status === 'returned').length },
    { label: 'Lost/Damaged', value: equipment.filter((e: any) => e.condition_status === 'lost' || e.condition_status === 'damaged').length },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white">Uniform & Equipment</h1>
          <p className="text-gray-400 text-sm mt-1">Track issued assets, uniforms, keys and devices</p>
        </div>
        <button className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white text-sm font-medium px-4 py-2.5 rounded-lg transition-colors cursor-pointer whitespace-nowrap">
          <div className="w-4 h-4 flex items-center justify-center"><i className="ri-add-line"></i></div>
          Issue Item
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
            {assetTypes.map((f) => (
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
                  <div className="w-6 h-6 flex items-center justify-center text-gray-500"><i className="ri-t-shirt-line"></i></div>
                </div>
                <p className="text-sm text-gray-400">No equipment records found</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-800/40">
                    <tr>
                      <th className="px-5 py-3 text-left text-xs font-medium text-gray-400 uppercase">Worker</th>
                      <th className="px-5 py-3 text-left text-xs font-medium text-gray-400 uppercase">Type</th>
                      <th className="px-5 py-3 text-left text-xs font-medium text-gray-400 uppercase">Asset</th>
                      <th className="px-5 py-3 text-left text-xs font-medium text-gray-400 uppercase">Serial/Tag</th>
                      <th className="px-5 py-3 text-left text-xs font-medium text-gray-400 uppercase">Condition</th>
                      <th className="px-5 py-3 text-left text-xs font-medium text-gray-400 uppercase">Issued</th>
                      <th className="px-5 py-3 text-left text-xs font-medium text-gray-400 uppercase">Returned</th>
                      <th className="px-5 py-3 text-left text-xs font-medium text-gray-400 uppercase">Sensitive</th>
                      <th className="px-5 py-3 text-right text-xs font-medium text-gray-400 uppercase">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-800">
                    {filtered.map((item: any) => (
                      <tr key={item.id} className="hover:bg-gray-800/20">
                        <td className="px-5 py-3.5 text-sm text-white">{item.workforce_profiles?.worker_reference || '—'}</td>
                        <td className="px-5 py-3.5 text-sm text-gray-300">{item.asset_type.replace(/_/g, ' ')}</td>
                        <td className="px-5 py-3.5 text-sm text-gray-300">{item.asset_name}</td>
                        <td className="px-5 py-3.5 text-sm text-gray-300 font-mono">{item.serial_number || item.asset_id_tag || '—'}</td>
                        <td className="px-5 py-3.5">
                          <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium ${conditionColors[item.condition_status] || ''}`}>
                            {item.condition_status}
                          </span>
                        </td>
                        <td className="px-5 py-3.5 text-sm text-gray-300">{item.issued_date || '—'}</td>
                        <td className="px-5 py-3.5 text-sm text-gray-300">{item.returned_date || '—'}</td>
                        <td className="px-5 py-3.5">
                          {item.is_security_sensitive ? (
                            <span className="text-xs font-medium text-red-400">Restricted</span>
                          ) : (
                            <span className="text-xs text-gray-500">Standard</span>
                          )}
                        </td>
                        <td className="px-5 py-3.5 text-right">
                          <button className="w-8 h-8 flex items-center justify-center text-gray-400 hover:text-blue-400 hover:bg-blue-500/10 rounded-lg cursor-pointer">
                            <div className="w-4 h-4 flex items-center justify-center"><i className="ri-edit-line"></i></div>
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