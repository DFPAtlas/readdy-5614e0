'use client';

import Link from 'next/link';

interface StatusCardsProps {
  activeSites: number;
  totalSites: number;
  guardsOnDuty: number;
  lateGuards: number;
  missingGuards: number;
  openIncidents: number;
  missedPatrols: number;
  highRiskSites: number;
}

export default function StatusCards({ activeSites, totalSites, guardsOnDuty, lateGuards, missingGuards, openIncidents, missedPatrols, highRiskSites }: StatusCardsProps) {
  const cards = [
    { label: 'Active Sites', value: activeSites, total: totalSites, color: 'text-emerald-400', bg: 'bg-emerald-500/10', icon: 'ri-building-line', href: '/sites' },
    { label: 'Guards On Duty', value: guardsOnDuty, color: 'text-blue-400', bg: 'bg-blue-500/10', icon: 'ri-shield-user-line', href: '/guards' },
    { label: 'Late / Missing', value: lateGuards + missingGuards, color: (lateGuards + missingGuards) > 0 ? 'text-red-400' : 'text-gray-400', bg: (lateGuards + missingGuards) > 0 ? 'bg-red-500/10' : 'bg-gray-500/10', icon: 'ri-time-line', href: '/guards' },
    { label: 'Open Incidents', value: openIncidents, color: openIncidents > 0 ? 'text-red-400' : 'text-gray-400', bg: openIncidents > 0 ? 'bg-red-500/10' : 'bg-gray-500/10', icon: 'ri-alarm-warning-line', href: '/incidents' },
    { label: 'Missed Patrols', value: missedPatrols, color: missedPatrols > 0 ? 'text-amber-400' : 'text-gray-400', bg: missedPatrols > 0 ? 'bg-amber-500/10' : 'bg-gray-500/10', icon: 'ri-route-line', href: '/dashboard/patrol-monitoring' },
    { label: 'High Risk Sites', value: highRiskSites, color: highRiskSites > 0 ? 'text-orange-400' : 'text-gray-400', bg: highRiskSites > 0 ? 'bg-orange-500/10' : 'bg-gray-500/10', icon: 'ri-error-warning-line', href: '/sites' },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
      {cards.map((card) => (
        <Link key={card.label} href={card.href} className="block cursor-pointer">
          <div className="bg-[#0f172a]/70 backdrop-blur-sm border border-white/10 rounded-xl p-4 hover:border-blue-500/30 transition-all">
            <div className={`w-9 h-9 rounded-lg flex items-center justify-center ${card.bg} mb-3`}>
              <div className="w-5 h-5 flex items-center justify-center">
                <i className={`${card.icon} ${card.color}`}></i>
              </div>
            </div>
            <div className="flex items-baseline gap-1.5">
              <span className={`text-2xl font-bold ${card.color}`}>{card.value}</span>
              {card.total !== undefined && <span className="text-xs text-gray-500">/ {card.total}</span>}
            </div>
            <p className="text-xs text-gray-500 mt-1">{card.label}</p>
          </div>
        </Link>
      ))}
    </div>
  );
}