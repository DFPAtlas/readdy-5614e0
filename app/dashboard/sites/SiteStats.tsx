'use client';

import type { Site } from '@/lib/useSites';

interface SiteStatsProps {
  sites: Site[];
  loading: boolean;
}

export default function SiteStats({ sites, loading }: SiteStatsProps) {
  const totalSites = sites.length;
  const activeSites = sites.filter((s) => !s.status || s.status === 'active').length;
  const archivedSites = sites.filter((s) => s.status === 'archived').length;
  const highRiskSites = sites.filter((s) => s.risk_level === 'high' || s.risk_level === 'critical').length;
  const patrolEnabledSites = sites.filter((s) => s.patrol_enabled).length;

  const stats = [
    {
      label: 'Total Sites',
      value: totalSites,
      icon: 'ri-building-line',
      color: 'from-blue-500/20 to-cyan-500/20 text-blue-400',
      sub: `${activeSites} active`,
    },
    {
      label: 'Active Sites',
      value: activeSites,
      icon: 'ri-checkbox-circle-line',
      color: 'from-emerald-500/20 to-teal-500/20 text-emerald-400',
      sub: `${archivedSites} archived`,
    },
    {
      label: 'High Risk',
      value: highRiskSites,
      icon: 'ri-error-warning-line',
      color: 'from-red-500/20 to-rose-500/20 text-red-400',
      sub: highRiskSites > 0 ? 'Needs attention' : 'All clear',
    },
    {
      label: 'Patrol Enabled',
      value: patrolEnabledSites,
      icon: 'ri-route-line',
      color: 'from-violet-500/20 to-purple-500/20 text-violet-400',
      sub: `${totalSites > 0 ? Math.round((patrolEnabledSites / totalSites) * 100) : 0}% coverage`,
    },
  ];

  if (loading && sites.length === 0) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((_, i) => (
          <div key={i} className="bg-[#111827] border border-gray-800 rounded-xl p-5 animate-pulse">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-lg bg-white/5"></div>
              <div className="flex-1 space-y-2">
                <div className="h-3 bg-white/5 rounded w-16"></div>
                <div className="h-6 bg-white/5 rounded w-8"></div>
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {stats.map((stat) => (
        <div key={stat.label} className="bg-[#111827] border border-gray-800 rounded-xl p-5">
          <div className="flex items-center gap-4">
            <div className={`w-10 h-10 rounded-lg bg-gradient-to-br ${stat.color} flex items-center justify-center`}>
              <div className="w-5 h-5 flex items-center justify-center">
                <i className={stat.icon}></i>
              </div>
            </div>
            <div>
              <p className="text-xs text-gray-500 font-medium uppercase tracking-wider">{stat.label}</p>
              <p className="text-xl font-bold text-white mt-0.5">{stat.value}</p>
              <p className="text-[11px] text-gray-500 mt-0.5">{stat.sub}</p>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}