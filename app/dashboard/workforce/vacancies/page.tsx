'use client';

import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/lib/auth';

export default function VacanciesPage() {
  const { companyId } = useAuth();
  const [vacancies, setVacancies] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [form, setForm] = useState({
    reference: '', title: '', role_type: '', location: '', engagement_type: 'employee',
    hours_pattern: '', description: '', pay_display_text: '', closing_date: '',
  });

  const loadData = useCallback(async () => {
    if (!companyId) return;
    setLoading(true);
    const { data } = await supabase
      .from('vacancies')
      .select('*')
      .eq('company_id', companyId)
      .order('created_at', { ascending: false });
    setVacancies(data || []);
    setLoading(false);
  }, [companyId]);

  useEffect(() => { loadData(); }, [loadData]);

  const handleCreate = async () => {
    if (!companyId || !form.title || !form.reference) return;
    await supabase.from('vacancies').insert({
      company_id: companyId,
      reference: form.reference,
      title: form.title,
      role_type: form.role_type || null,
      location: form.location || null,
      engagement_type: form.engagement_type,
      hours_pattern: form.hours_pattern || null,
      description: form.description || null,
      pay_display_text: form.pay_display_text || null,
      closing_date: form.closing_date || null,
      status: 'draft',
    });
    setShowCreate(false);
    setForm({ reference: '', title: '', role_type: '', location: '', engagement_type: 'employee', hours_pattern: '', description: '', pay_display_text: '', closing_date: '' });
    loadData();
  };

  const statusColors: Record<string, string> = {
    draft: 'bg-gray-500/10 text-gray-400',
    internal_review: 'bg-blue-500/10 text-blue-400',
    published: 'bg-emerald-500/10 text-emerald-400',
    paused: 'bg-amber-500/10 text-amber-400',
    closed: 'bg-red-500/10 text-red-400',
    filled: 'bg-violet-500/10 text-violet-400',
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white">Vacancies</h1>
          <p className="text-gray-400 text-sm mt-1">Create and manage job vacancies</p>
        </div>
        <button
          onClick={() => setShowCreate(true)}
          className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white text-sm font-medium px-4 py-2.5 rounded-lg transition-colors cursor-pointer whitespace-nowrap"
        >
          <div className="w-4 h-4 flex items-center justify-center"><i className="ri-add-line"></i></div>
          Create Vacancy
        </button>
      </div>

      {showCreate && (
        <div className="bg-[#111827] border border-gray-800 rounded-xl p-6 space-y-4">
          <h3 className="text-lg font-semibold text-white">New Vacancy</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-gray-400 mb-1">Reference *</label>
              <input type="text" value={form.reference} onChange={(e) => setForm({ ...form, reference: e.target.value })}
                className="w-full bg-gray-800/60 border border-gray-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-blue-500" placeholder="VAC-2026-001" />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-400 mb-1">Title *</label>
              <input type="text" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })}
                className="w-full bg-gray-800/60 border border-gray-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-blue-500" placeholder="Security Officer" />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-400 mb-1">Role Type</label>
              <input type="text" value={form.role_type} onChange={(e) => setForm({ ...form, role_type: e.target.value })}
                className="w-full bg-gray-800/60 border border-gray-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-blue-500" />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-400 mb-1">Location</label>
              <input type="text" value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })}
                className="w-full bg-gray-800/60 border border-gray-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-blue-500" />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-400 mb-1">Engagement Type</label>
              <select value={form.engagement_type} onChange={(e) => setForm({ ...form, engagement_type: e.target.value })}
                className="w-full bg-gray-800/60 border border-gray-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-blue-500 pr-8">
                <option value="employee">Employee</option>
                <option value="worker">Worker</option>
                <option value="contractor">Contractor</option>
                <option value="self_employed">Self Employed</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-400 mb-1">Pay Display</label>
              <input type="text" value={form.pay_display_text} onChange={(e) => setForm({ ...form, pay_display_text: e.target.value })}
                className="w-full bg-gray-800/60 border border-gray-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-blue-500" placeholder="£12.50 - £14.00 per hour" />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-400 mb-1">Closing Date</label>
              <input type="date" value={form.closing_date} onChange={(e) => setForm({ ...form, closing_date: e.target.value })}
                className="w-full bg-gray-800/60 border border-gray-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-blue-500" />
            </div>
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-400 mb-1">Description</label>
            <textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} rows={4}
              className="w-full bg-gray-800/60 border border-gray-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-blue-500" />
          </div>
          <div className="flex items-center gap-3 pt-2">
            <button onClick={handleCreate} className="bg-blue-600 hover:bg-blue-500 text-white text-sm font-medium px-4 py-2 rounded-lg cursor-pointer whitespace-nowrap">Save as Draft</button>
            <button onClick={() => setShowCreate(false)} className="bg-gray-800 hover:bg-gray-700 text-gray-400 text-sm font-medium px-4 py-2 rounded-lg cursor-pointer whitespace-nowrap">Cancel</button>
          </div>
        </div>
      )}

      {loading ? (
        <div className="p-12 flex items-center justify-center">
          <i className="ri-loader-4-line animate-spin text-blue-500 text-2xl"></i>
        </div>
      ) : (
        <div className="bg-[#111827] border border-gray-800 rounded-xl overflow-hidden">
          {vacancies.length === 0 ? (
            <div className="p-12 text-center">
              <div className="w-12 h-12 mx-auto mb-4 rounded-xl bg-gray-800/50 flex items-center justify-center">
                <div className="w-6 h-6 flex items-center justify-center text-gray-500"><i className="ri-briefcase-line"></i></div>
              </div>
              <p className="text-sm text-gray-400">No vacancies created yet</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-800/40">
                  <tr>
                    <th className="px-5 py-3 text-left text-xs font-medium text-gray-400 uppercase">Reference</th>
                    <th className="px-5 py-3 text-left text-xs font-medium text-gray-400 uppercase">Title</th>
                    <th className="px-5 py-3 text-left text-xs font-medium text-gray-400 uppercase">Role</th>
                    <th className="px-5 py-3 text-left text-xs font-medium text-gray-400 uppercase">Location</th>
                    <th className="px-5 py-3 text-left text-xs font-medium text-gray-400 uppercase">Type</th>
                    <th className="px-5 py-3 text-left text-xs font-medium text-gray-400 uppercase">Status</th>
                    <th className="px-5 py-3 text-left text-xs font-medium text-gray-400 uppercase">Closing</th>
                    <th className="px-5 py-3 text-right text-xs font-medium text-gray-400 uppercase">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-800">
                  {vacancies.map((v: any) => (
                    <tr key={v.id} className="hover:bg-gray-800/20">
                      <td className="px-5 py-3.5 text-sm text-white font-mono">{v.reference}</td>
                      <td className="px-5 py-3.5 text-sm text-white">{v.title}</td>
                      <td className="px-5 py-3.5 text-sm text-gray-300">{v.role_type || '—'}</td>
                      <td className="px-5 py-3.5 text-sm text-gray-300">{v.location || '—'}</td>
                      <td className="px-5 py-3.5 text-sm text-gray-300">{v.engagement_type}</td>
                      <td className="px-5 py-3.5">
                        <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium ${statusColors[v.status] || ''}`}>
                          {v.status.replace(/_/g, ' ')}
                        </span>
                      </td>
                      <td className="px-5 py-3.5 text-sm text-gray-300">{v.closing_date || '—'}</td>
                      <td className="px-5 py-3.5 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <button className="w-8 h-8 flex items-center justify-center text-gray-400 hover:text-emerald-400 hover:bg-emerald-500/10 rounded-lg cursor-pointer" title="Publish">
                            <div className="w-4 h-4 flex items-center justify-center"><i className="ri-send-plane-line"></i></div>
                          </button>
                          <button className="w-8 h-8 flex items-center justify-center text-gray-400 hover:text-blue-400 hover:bg-blue-500/10 rounded-lg cursor-pointer" title="Edit">
                            <div className="w-4 h-4 flex items-center justify-center"><i className="ri-edit-line"></i></div>
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
      )}
    </div>
  );
}