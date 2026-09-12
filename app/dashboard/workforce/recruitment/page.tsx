'use client';

import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/lib/auth';

interface Vacancy {
  id: string;
  reference: string;
  title: string;
  role_type: string;
  location: string;
  status: string;
  closing_date: string;
  created_at: string;
}

interface Application {
  id: string;
  vacancy_id: string;
  applicant_email: string;
  first_name: string;
  last_name: string;
  status: string;
  stage_updated_at: string;
  vacancy_title?: string;
}

export default function RecruitmentPage() {
  const { companyId } = useAuth();
  const [tab, setTab] = useState<'vacancies' | 'pipeline'>('vacancies');
  const [vacancies, setVacancies] = useState<Vacancy[]>([]);
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);

  const loadData = useCallback(async () => {
    if (!companyId) return;
    setLoading(true);

    const { data: vacs } = await supabase
      .from('vacancies')
      .select('*')
      .eq('company_id', companyId)
      .order('created_at', { ascending: false });

    setVacancies(vacs || []);

    const { data: apps } = await supabase
      .from('applications')
      .select('*, vacancies!inner(title)')
      .eq('company_id', companyId)
      .order('created_at', { ascending: false });

    setApplications((apps || []).map((a: any) => ({
      ...a,
      vacancy_title: a.vacancies?.title || 'Unknown',
    })));

    setLoading(false);
  }, [companyId]);

  useEffect(() => { loadData(); }, [loadData]);

  const stageColors: Record<string, string> = {
    received: 'bg-gray-500/10 text-gray-400',
    initial_review: 'bg-blue-500/10 text-blue-400',
    shortlist: 'bg-violet-500/10 text-violet-400',
    interview: 'bg-amber-500/10 text-amber-400',
    conditional_offer: 'bg-cyan-500/10 text-cyan-400',
    screening: 'bg-orange-500/10 text-orange-400',
    onboarding: 'bg-purple-500/10 text-purple-400',
    hired: 'bg-emerald-500/10 text-emerald-400',
    unsuccessful: 'bg-red-500/10 text-red-400',
    withdrawn: 'bg-gray-500/10 text-gray-500',
    archived: 'bg-gray-500/10 text-gray-600',
  };

  const vacStatusColors: Record<string, string> = {
    draft: 'bg-gray-500/10 text-gray-400',
    internal_review: 'bg-blue-500/10 text-blue-400',
    published: 'bg-emerald-500/10 text-emerald-400',
    paused: 'bg-amber-500/10 text-amber-400',
    closed: 'bg-red-500/10 text-red-400',
    filled: 'bg-violet-500/10 text-violet-400',
    archived: 'bg-gray-500/10 text-gray-600',
  };

  const pipelineStages = ['received', 'initial_review', 'shortlist', 'interview', 'conditional_offer', 'screening', 'onboarding', 'hired'];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white">Recruitment</h1>
          <p className="text-gray-400 text-sm mt-1">Vacancies and application pipeline</p>
        </div>
        <button
          onClick={() => setTab('vacancies')}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors cursor-pointer whitespace-nowrap ${
            tab === 'vacancies'
              ? 'bg-blue-600 text-white'
              : 'bg-gray-800 text-gray-400 hover:text-white border border-gray-700'
          }`}
        >
          <div className="w-4 h-4 inline-flex items-center justify-center mr-1.5"><i className="ri-briefcase-line"></i></div>
          Vacancies ({vacancies.length})
        </button>
      </div>

      {loading ? (
        <div className="p-12 flex items-center justify-center">
          <i className="ri-loader-4-line animate-spin text-blue-500 text-2xl"></i>
        </div>
      ) : tab === 'vacancies' ? (
        <div className="space-y-4">
          {vacancies.length === 0 ? (
            <div className="bg-[#111827] border border-gray-800 rounded-xl p-12 text-center">
              <div className="w-12 h-12 mx-auto mb-4 rounded-xl bg-gray-800/50 flex items-center justify-center">
                <div className="w-6 h-6 flex items-center justify-center text-gray-500"><i className="ri-briefcase-line"></i></div>
              </div>
              <h3 className="text-sm font-medium text-gray-300 mb-1">No vacancies yet</h3>
              <p className="text-sm text-gray-500">Create your first job vacancy to start recruiting</p>
              <button className="mt-4 inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors cursor-pointer whitespace-nowrap">
                <div className="w-4 h-4 flex items-center justify-center"><i className="ri-add-line"></i></div>
                Create Vacancy
              </button>
            </div>
          ) : (
            <div className="bg-[#111827] border border-gray-800 rounded-xl overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-800/40">
                    <tr>
                      <th className="px-5 py-3 text-left text-xs font-medium text-gray-400 uppercase">Reference</th>
                      <th className="px-5 py-3 text-left text-xs font-medium text-gray-400 uppercase">Title</th>
                      <th className="px-5 py-3 text-left text-xs font-medium text-gray-400 uppercase">Role</th>
                      <th className="px-5 py-3 text-left text-xs font-medium text-gray-400 uppercase">Location</th>
                      <th className="px-5 py-3 text-left text-xs font-medium text-gray-400 uppercase">Status</th>
                      <th className="px-5 py-3 text-left text-xs font-medium text-gray-400 uppercase">Closing</th>
                      <th className="px-5 py-3 text-right text-xs font-medium text-gray-400 uppercase">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-800">
                    {vacancies.map((v) => (
                      <tr key={v.id} className="hover:bg-gray-800/20">
                        <td className="px-5 py-3.5 text-sm text-white font-mono">{v.reference}</td>
                        <td className="px-5 py-3.5 text-sm text-white font-medium">{v.title}</td>
                        <td className="px-5 py-3.5 text-sm text-gray-300">{v.role_type || '—'}</td>
                        <td className="px-5 py-3.5 text-sm text-gray-300">{v.location || '—'}</td>
                        <td className="px-5 py-3.5">
                          <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium ${vacStatusColors[v.status] || 'bg-gray-500/10 text-gray-400'}`}>
                            {v.status.replace(/_/g, ' ')}
                          </span>
                        </td>
                        <td className="px-5 py-3.5 text-sm text-gray-300">{v.closing_date || '—'}</td>
                        <td className="px-5 py-3.5 text-right">
                          <div className="flex items-center justify-end gap-1">
                            <button className="w-8 h-8 flex items-center justify-center text-gray-400 hover:text-blue-400 hover:bg-blue-500/10 rounded-lg cursor-pointer">
                              <div className="w-4 h-4 flex items-center justify-center"><i className="ri-edit-line"></i></div>
                            </button>
                            <button className="w-8 h-8 flex items-center justify-center text-gray-400 hover:text-emerald-400 hover:bg-emerald-500/10 rounded-lg cursor-pointer">
                              <div className="w-4 h-4 flex items-center justify-center"><i className="ri-eye-line"></i></div>
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          <div className="bg-[#111827] border border-gray-800 rounded-xl p-5">
            <h3 className="text-sm font-semibold text-white mb-4">Application Pipeline</h3>
            {applications.length === 0 ? (
              <p className="text-sm text-gray-500 text-center py-4">No applications yet</p>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3">
                {pipelineStages.map((stage) => {
                  const count = applications.filter((a) => a.status === stage).length;
                  return (
                    <div key={stage} className="bg-gray-800/30 border border-gray-700/30 rounded-lg p-3 text-center">
                      <p className="text-2xl font-bold text-white">{count}</p>
                      <p className="text-xs text-gray-400 mt-1 capitalize">{stage.replace(/_/g, ' ')}</p>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {applications.length > 0 && (
            <div className="bg-[#111827] border border-gray-800 rounded-xl overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-800/40">
                    <tr>
                      <th className="px-5 py-3 text-left text-xs font-medium text-gray-400 uppercase">Candidate</th>
                      <th className="px-5 py-3 text-left text-xs font-medium text-gray-400 uppercase">Vacancy</th>
                      <th className="px-5 py-3 text-left text-xs font-medium text-gray-400 uppercase">Stage</th>
                      <th className="px-5 py-3 text-left text-xs font-medium text-gray-400 uppercase">Updated</th>
                      <th className="px-5 py-3 text-right text-xs font-medium text-gray-400 uppercase">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-800">
                    {applications.slice(0, 20).map((app) => (
                      <tr key={app.id} className="hover:bg-gray-800/20">
                        <td className="px-5 py-3.5">
                          <div className="text-sm font-medium text-white">{app.first_name} {app.last_name}</div>
                          <div className="text-xs text-gray-500">{app.applicant_email}</div>
                        </td>
                        <td className="px-5 py-3.5 text-sm text-gray-300">{app.vacancy_title}</td>
                        <td className="px-5 py-3.5">
                          <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium ${stageColors[app.status] || 'bg-gray-500/10 text-gray-400'}`}>
                            {app.status.replace(/_/g, ' ')}
                          </span>
                        </td>
                        <td className="px-5 py-3.5 text-sm text-gray-300">
                          {app.stage_updated_at ? new Date(app.stage_updated_at).toLocaleDateString() : '—'}
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
            </div>
          )}
        </div>
      ) : null}
    </div>
  );
}