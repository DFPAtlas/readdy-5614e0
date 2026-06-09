'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/lib/auth';

export default function OpsReports() {
  const { companyId } = useAuth();
  const [period, setPeriod] = useState('7');
  const [stats, setStats] = useState({ incidents: 0, shifts: 0, sites: 0, guards: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!companyId) return;
    loadStats();
  }, [companyId, period]);

  const loadStats = async () => {
    if (!companyId) return;
    setLoading(true);

    const daysAgo = new Date();
    daysAgo.setDate(daysAgo.getDate() - parseInt(period));

    const [{ data: incidents }, { data: shifts }, { data: sites }, { data: guards }] = await Promise.all([
      supabase.from('incidents').select('id').eq('company_id', companyId).gte('created_at', daysAgo.toISOString()),
      supabase.from('shifts').select('id').eq('company_id', companyId).gte('created_at', daysAgo.toISOString()),
      supabase.from('sites').select('id').eq('company_id', companyId),
      supabase.from('guards').select('id').eq('company_id', companyId),
    ]);

    setStats({
      incidents: incidents?.length || 0,
      shifts: shifts?.length || 0,
      sites: sites?.length || 0,
      guards: guards?.length || 0,
    });
    setLoading(false);
  };

  const reportCards = [
    { title: 'Total Incidents', value: stats.incidents, icon: 'ri-alarm-warning-line', color: 'text-red-400', bg: 'bg-red-500/10' },
    { title: 'Shifts Scheduled', value: stats.shifts, icon: 'ri-calendar-event-line', color: 'text-blue-400', bg: 'bg-blue-500/10' },
    { title: 'Active Sites', value: stats.sites, icon: 'ri-building-line', color: 'text-emerald-400', bg: 'bg-emerald-500/10' },
    { title: 'Total Guards', value: stats.guards, icon: 'ri-shield-user-line', color: 'text-purple-400', bg: 'bg-purple-500/10' },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white">Reports</h1>
          <p className="text-gray-400 text-sm mt-1">Operational overview and analytics</p>
        </div>
        <div className="flex items-center gap-2 bg-white/5 border border-white/10 rounded-lg p-1">
          {[
            { label: '7 Days', value: '7' },
            { label: '30 Days', value: '30' },
            { label: '90 Days', value: '90' },
          ].map(opt => (
            <button key={opt.value} onClick={() => setPeriod(opt.value)}
              className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors cursor-pointer whitespace-nowrap ${
                period === opt.value ? 'bg-blue-600 text-white' : 'text-gray-400 hover:text-white'
              }`}>
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="flex items-center gap-2 text-gray-500 text-sm">
          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-500"></div>
          Loading reports...
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {reportCards.map(card => (
              <div key={card.title} className={`${card.bg} border border-white/10 rounded-xl p-5`}>
                <div className="flex items-center justify-between mb-3">
                  <div className={`w-10 h-10 rounded-lg ${card.bg} flex items-center justify-center`}>
                    <div className="w-5 h-5 flex items-center justify-center">
                      <i className={`${card.icon} ${card.color} text-lg`}></i>
                    </div>
                  </div>
                </div>
                <div className={`text-2xl font-bold ${card.color}`}>{card.value}</div>
                <div className="text-sm text-gray-400 mt-1">{card.title}</div>
              </div>
            ))}
          </div>

          <div className="bg-[#0f172a]/70 backdrop-blur-sm border border-white/10 rounded-xl p-6">
            <h2 className="text-sm font-semibold text-white mb-4">Export Options</h2>
            <div className="flex flex-wrap gap-3">
              <button className="inline-flex items-center gap-2 bg-white/5 hover:bg-white/10 border border-white/10 text-gray-300 text-sm px-4 py-2.5 rounded-lg transition-colors cursor-pointer whitespace-nowrap">
                <div className="w-4 h-4 flex items-center justify-center"><i className="ri-file-pdf-line text-red-400"></i></div>
                Export as PDF
              </button>
              <button className="inline-flex items-center gap-2 bg-white/5 hover:bg-white/10 border border-white/10 text-gray-300 text-sm px-4 py-2.5 rounded-lg transition-colors cursor-pointer whitespace-nowrap">
                <div className="w-4 h-4 flex items-center justify-center"><i className="ri-file-excel-line text-emerald-400"></i></div>
                Export as CSV
              </button>
              <button className="inline-flex items-center gap-2 bg-white/5 hover:bg-white/10 border border-white/10 text-gray-300 text-sm px-4 py-2.5 rounded-lg transition-colors cursor-pointer whitespace-nowrap">
                <div className="w-4 h-4 flex items-center justify-center"><i className="ri-mail-line text-blue-400"></i></div>
                Email Report
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}