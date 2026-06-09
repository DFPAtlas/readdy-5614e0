'use client';

import Link from 'next/link';
import type { DashboardKPIs } from '@/lib/useDashboard';

interface KPICardsProps {
  kpis: DashboardKPIs;
}

function TrendBadge({ current, prev, suffix = '' }: { current: number; prev: number; suffix?: string }) {
  const diff = current - prev;
  if (prev === 0) return <span className="text-xs text-gray-500">No prior data</span>;
  const pct = Math.round((diff / prev) * 100);
  const positive = diff >= 0;
  return (
    <span className={`text-xs font-medium ${positive ? 'text-emerald-400' : 'text-red-400'}`}>
      {positive ? '+' : ''}{pct}% {suffix}
    </span>
  );
}

export default function KPICards({ kpis }: KPICardsProps) {
  const cards = [
    {
      label: 'Active Guards Now',
      value: kpis.activeGuards,
      trend: <TrendBadge current={kpis.activeGuards} prev={kpis.activeGuardsYesterday} suffix="vs yesterday" />,
      icon: 'ri-user-3-line',
      color: 'text-emerald-400',
      bg: 'bg-emerald-500/10',
      href: '/guards',
    },
    {
      label: 'Open Incidents',
      value: kpis.openIncidents,
      trend: kpis.highCriticalIncidents > 0 ? (
        <span className="text-xs font-medium text-red-400">{kpis.highCriticalIncidents} High/Critical</span>
      ) : (
        <span className="text-xs text-gray-500">No critical issues</span>
      ),
      icon: 'ri-alert-line',
      color: kpis.highCriticalIncidents > 0 ? 'text-red-400' : kpis.openIncidents > 0 ? 'text-amber-400' : 'text-gray-500',
      bg: kpis.highCriticalIncidents > 0 ? 'bg-red-500/10' : kpis.openIncidents > 0 ? 'bg-amber-500/10' : 'bg-gray-500/10',
      href: '/incidents?status=open',
    },
    {
      label: 'Patrol Completion (24h)',
      value: `${kpis.patrolCompletion}%`,
      trend: <TrendBadge current={kpis.patrolCompletion} prev={kpis.patrolCompletionPrev} />,
      icon: 'ri-route-line',
      color: kpis.patrolCompletion > 90 ? 'text-emerald-400' : kpis.patrolCompletion >= 75 ? 'text-amber-400' : 'text-red-400',
      bg: kpis.patrolCompletion > 90 ? 'bg-emerald-500/10' : kpis.patrolCompletion >= 75 ? 'bg-amber-500/10' : 'bg-red-500/10',
      href: '/sites',
    },
    {
      label: 'Open Shifts (Next 7d)',
      value: kpis.openShifts,
      trend: kpis.nextOpenShift ? (
        <span className="text-xs text-gray-400">Next: {kpis.nextOpenShift.day} at {kpis.nextOpenShift.site}</span>
      ) : (
        <span className="text-xs text-emerald-400">All filled</span>
      ),
      icon: 'ri-calendar-line',
      color: kpis.openShifts > 0 ? 'text-red-400' : 'text-emerald-400',
      bg: kpis.openShifts > 0 ? 'bg-red-500/10' : 'bg-emerald-500/10',
      href: '/rotas',
    },
  ];

  return (
    <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
      {cards.map((card) => (
        <Link key={card.label} href={card.href} className="block cursor-pointer">
          <div className="bg-[#0f172a]/70 backdrop-blur-sm border border-white/10 shadow-sm rounded-xl p-5 hover:shadow-md hover:border-blue-500/30 transition-all">
            <div className="flex items-start justify-between mb-4">
              <div className={`w-11 h-11 rounded-lg flex items-center justify-center ${card.bg}`}>
                <div className="w-6 h-6 flex items-center justify-center">
                  <i className={`${card.icon} text-xl ${card.color}`}></i>
                </div>
              </div>
              <div className="text-right">
                <div className="text-2xl font-bold text-white">{card.value}</div>
              </div>
            </div>
            <h3 className="text-sm font-medium text-gray-400 mb-1">{card.label}</h3>
            <div>{card.trend}</div>
          </div>
        </Link>
      ))}
    </div>
  );
}