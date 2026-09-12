'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/lib/auth';

interface WorkforceStats {
  total: number;
  active: number;
  onboarding: number;
  screening: number;
  suspended: number;
  offboarding: number;
  siaExpiring: number;
  mandatoryTrainingExpired: number;
}

const defaultStats: WorkforceStats = {
  total: 0, active: 0, onboarding: 0, screening: 0,
  suspended: 0, offboarding: 0, siaExpiring: 0, mandatoryTrainingExpired: 0,
};

export default function WorkforceHub() {
  const { companyId } = useAuth();
  const [stats, setStats] = useState<WorkforceStats>(defaultStats);
  const [recentHires, setRecentHires] = useState<any[]>([]);
  const [upcomingExpiry, setUpcomingExpiry] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const loadData = useCallback(async () => {
    if (!companyId) return;
    setLoading(true);

    const { data: profiles } = await supabase
      .from('workforce_profiles')
      .select('*')
      .eq('company_id', companyId);

    const all = profiles || [];
    const now = new Date();
    const sixtyDays = new Date();
    sixtyDays.setDate(sixtyDays.getDate() + 60);

    setStats({
      total: all.length,
      active: all.filter((p: any) => p.employment_status === 'active').length,
      onboarding: all.filter((p: any) => p.employment_status === 'onboarding').length,
      screening: all.filter((p: any) => p.employment_status === 'screening').length,
      suspended: all.filter((p: any) => p.employment_status === 'suspended').length,
      offboarding: all.filter((p: any) => p.employment_status === 'offboarding').length,
      siaExpiring: 0,
      mandatoryTrainingExpired: 0,
    });

    setRecentHires(all.filter((p: any) => p.employment_status === 'active').slice(0, 5));

    const { data: licences } = await supabase
      .from('sia_licences')
      .select('*, workforce_profiles!inner(id)')
      .eq('company_id', companyId)
      .eq('status', 'verified_valid')
      .lt('expiry_date', sixtyDays.toISOString().split('T')[0])
      .order('expiry_date', { ascending: true })
      .limit(10);

    setUpcomingExpiry(licences || []);

    setLoading(false);
  }, [companyId]);

  useEffect(() => { loadData(); }, [loadData]);

  const statCards = [
    { label: 'Total Workforce', value: stats.total, icon: 'ri-team-line', color: 'from-blue-500/20 to-cyan-500/20 text-blue-400' },
    { label: 'Active', value: stats.active, icon: 'ri-shield-check-line', color: 'from-emerald-500/20 to-teal-500/20 text-emerald-400' },
    { label: 'Onboarding', value: stats.onboarding, icon: 'ri-user-add-line', color: 'from-violet-500/20 to-purple-500/20 text-violet-400' },
    { label: 'Screening', value: stats.screening, icon: 'ri-file-search-line', color: 'from-amber-500/20 to-orange-500/20 text-amber-400' },
    { label: 'Suspended', value: stats.suspended, icon: 'ri-alert-line', color: 'from-red-500/20 to-rose-500/20 text-red-400' },
    { label: 'Offboarding', value: stats.offboarding, icon: 'ri-logout-box-line', color: 'from-gray-500/20 to-slate-500/20 text-gray-400' },
  ];

  const quickLinks = [
    { label: 'Vacancies', href: '/dashboard/workforce/vacancies', icon: 'ri-briefcase-line', desc: 'Manage job listings' },
    { label: 'Recruitment', href: '/dashboard/workforce/recruitment', icon: 'ri-user-search-line', desc: 'Application pipeline' },
    { label: 'SIA Licences', href: '/dashboard/workforce/sia', icon: 'ri-shield-keyhole-line', desc: 'Licence management' },
    { label: 'Screening', href: '/dashboard/workforce/screening', icon: 'ri-file-search-line', desc: 'Vetting & checks' },
    { label: 'Onboarding', href: '/dashboard/workforce/onboarding', icon: 'ri-clipboard-line', desc: 'New starter checklists' },
    { label: 'Training', href: '/dashboard/training', icon: 'ri-graduation-cap-line', desc: 'Competency records' },
    { label: 'HR Cases', href: '/dashboard/workforce/hr-cases', icon: 'ri-scales-line', desc: 'Sensitive case management' },
    { label: 'Equipment', href: '/dashboard/workforce/equipment', icon: 'ri-t-shirt-line', desc: 'Uniform & assets' },
    { label: 'Offboarding', href: '/dashboard/workforce/offboarding', icon: 'ri-logout-box-r-line', desc: 'Exit management' },
    { label: 'Retention', href: '/dashboard/workforce/retention', icon: 'ri-archive-line', desc: 'Data retention rules' },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white">Workforce Hub</h1>
          <p className="text-gray-400 text-sm mt-1">Recruitment, vetting, compliance and workforce lifecycle</p>
        </div>
        <Link
          href="/dashboard/workforce/vacancies"
          className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white text-sm font-medium px-4 py-2.5 rounded-lg transition-colors cursor-pointer whitespace-nowrap"
        >
          <div className="w-4 h-4 flex items-center justify-center"><i className="ri-add-line"></i></div>
          New Vacancy
        </Link>
      </div>

      {loading ? (
        <div className="p-12 flex items-center justify-center">
          <i className="ri-loader-4-line animate-spin text-blue-500 text-2xl"></i>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
            {statCards.map((stat) => (
              <div key={stat.label} className="bg-[#111827] border border-gray-800 rounded-xl p-4">
                <div className={`w-9 h-9 rounded-lg bg-gradient-to-br ${stat.color} flex items-center justify-center mb-3`}>
                  <div className="w-4 h-4 flex items-center justify-center">
                    <i className={stat.icon}></i>
                  </div>
                </div>
                <p className="text-xs text-gray-500 font-medium uppercase tracking-wider">{stat.label}</p>
                <p className="text-xl font-bold text-white mt-0.5">{stat.value}</p>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-[#111827] border border-gray-800 rounded-xl p-5">
              <h3 className="text-sm font-semibold text-white mb-4 flex items-center gap-2">
                <div className="w-4 h-4 flex items-center justify-center text-violet-400"><i className="ri-grid-line"></i></div>
                Quick Actions
              </h3>
              <div className="grid grid-cols-2 gap-3">
                {quickLinks.map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    className="flex items-start gap-3 p-3 rounded-lg bg-gray-800/40 hover:bg-gray-800/70 border border-gray-700/50 hover:border-gray-600 transition-all cursor-pointer group"
                  >
                    <div className="w-8 h-8 rounded-lg bg-blue-500/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <div className="w-4 h-4 flex items-center justify-center text-blue-400"><i className={link.icon}></i></div>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-white group-hover:text-blue-400 transition-colors">{link.label}</p>
                      <p className="text-xs text-gray-500">{link.desc}</p>
                    </div>
                  </Link>
                ))}
              </div>
            </div>

            <div className="bg-[#111827] border border-gray-800 rounded-xl p-5">
              <h3 className="text-sm font-semibold text-white mb-4 flex items-center gap-2">
                <div className="w-4 h-4 flex items-center justify-center text-amber-400"><i className="ri-timer-line"></i></div>
                Upcoming Licence Expiry
              </h3>
              {upcomingExpiry.length === 0 ? (
                <div className="text-center py-8">
                  <div className="w-10 h-10 mx-auto mb-3 rounded-xl bg-gray-800/50 flex items-center justify-center">
                    <div className="w-5 h-5 flex items-center justify-center text-gray-500"><i className="ri-shield-check-line"></i></div>
                  </div>
                  <p className="text-sm text-gray-500">No licences expiring soon</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {upcomingExpiry.slice(0, 5).map((item: any) => (
                    <div key={item.id} className="flex items-center justify-between p-3 rounded-lg bg-gray-800/30 border border-gray-700/30">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-amber-500/10 flex items-center justify-center">
                          <div className="w-4 h-4 flex items-center justify-center text-amber-400"><i className="ri-shield-keyhole-line"></i></div>
                        </div>
                        <div>
                          <p className="text-sm text-white font-medium">{item.licence_type} Licence</p>
                          <p className="text-xs text-gray-500">{item.licence_number}</p>
                        </div>
                      </div>
                      <span className="text-xs font-medium text-amber-400">
                        {Math.ceil((new Date(item.expiry_date).getTime() - Date.now()) / 86400000)}d
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="bg-[#111827] border border-gray-800 rounded-xl p-5">
            <h3 className="text-sm font-semibold text-white mb-4 flex items-center gap-2">
              <div className="w-4 h-4 flex items-center justify-center text-blue-400"><i className="ri-user-star-line"></i></div>
              Recent Active Workforce
            </h3>
            {recentHires.length === 0 ? (
              <div className="text-center py-8">
                <div className="w-10 h-10 mx-auto mb-3 rounded-xl bg-gray-800/50 flex items-center justify-center">
                  <div className="w-5 h-5 flex items-center justify-center text-gray-500"><i className="ri-team-line"></i></div>
                </div>
                <p className="text-sm text-gray-500">No active workforce profiles yet</p>
                <p className="text-xs text-gray-600 mt-1">Profiles sync from the Guards page</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-800/40">
                    <tr>
                      <th className="px-4 py-2.5 text-left text-xs font-medium text-gray-400 uppercase">Worker</th>
                      <th className="px-4 py-2.5 text-left text-xs font-medium text-gray-400 uppercase">Reference</th>
                      <th className="px-4 py-2.5 text-left text-xs font-medium text-gray-400 uppercase">Role</th>
                      <th className="px-4 py-2.5 text-left text-xs font-medium text-gray-400 uppercase">Status</th>
                      <th className="px-4 py-2.5 text-left text-xs font-medium text-gray-400 uppercase">Started</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-800">
                    {recentHires.map((wp: any) => (
                      <tr key={wp.id} className="hover:bg-gray-800/20">
                        <td className="px-4 py-3 text-sm text-white">{wp.worker_reference || '—'}</td>
                        <td className="px-4 py-3 text-sm text-gray-300">{wp.worker_reference || '—'}</td>
                        <td className="px-4 py-3 text-sm text-gray-300">{wp.job_title || '—'}</td>
                        <td className="px-4 py-3">
                          <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium ${
                            wp.employment_status === 'active' ? 'bg-emerald-500/10 text-emerald-400' :
                            wp.employment_status === 'screening' ? 'bg-amber-500/10 text-amber-400' :
                            'bg-gray-500/10 text-gray-400'
                          }`}>{wp.employment_status}</span>
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-300">{wp.start_date || '—'}</td>
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