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
  const lateMissing = lateGuards + missingGuards;

  const cards = [
    {
      label: 'Sites Active',
      value: activeSites,
      sub: `/ ${totalSites}`,
      accent: 'border-l-emerald-500',
      valueColor: 'text-emerald-400',
      icon: 'ri-building-line',
      iconColor: 'text-emerald-400',
      href: '/sites',
    },
    {
      label: 'Guards On Duty',
      value: guardsOnDuty,
      sub: '',
      accent: 'border-l-blue-500',
      valueColor: 'text-blue-400',
      icon: 'ri-shield-user-line',
      iconColor: 'text-blue-400',
      href: '/guards',
    },
    {
      label: 'Late / Missing',
      value: lateMissing,
      sub: '',
      accent: lateMissing > 0 ? 'border-l-red-500' : 'border-l-white/10',
      valueColor: lateMissing > 0 ? 'text-red-400' : 'text-gray-400',
      icon: 'ri-time-line',
      iconColor: lateMissing > 0 ? 'text-red-400' : 'text-gray-500',
      href: '/guards',
    },
    {
      label: 'Open Incidents',
      value: openIncidents,
      sub: '',
      accent: openIncidents > 0 ? 'border-l-red-500' : 'border-l-white/10',
      valueColor: openIncidents > 0 ? 'text-red-400' : 'text-gray-400',
      icon: 'ri-alarm-warning-line',
      iconColor: openIncidents > 0 ? 'text-red-400' : 'text-gray-500',
      href: '/incidents',
    },
    {
      label: 'Missed Patrols',
      value: missedPatrols,
      sub: '',
      accent: missedPatrols > 0 ? 'border-l-amber-500' : 'border-l-white/10',
      valueColor: missedPatrols > 0 ? 'text-amber-400' : 'text-gray-400',
      icon: 'ri-route-line',
      iconColor: missedPatrols > 0 ? 'text-amber-400' : 'text-gray-500',
      href: '/dashboard/patrol-monitoring',
    },
    {
      label: 'High-Risk Sites',
      value: highRiskSites,
      sub: '',
      accent: highRiskSites > 0 ? 'border-l-orange-500' : 'border-l-white/10',
      valueColor: highRiskSites > 0 ? 'text-orange-400' : 'text-gray-400',
      icon: 'ri-error-warning-line',
      iconColor: highRiskSites > 0 ? 'text-orange-400' : 'text-gray-500',
      href: '/sites',
    },
  ];

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2">
      {cards.map((card) => (
        <Link
          key={card.label}
          href={card.href}
          className={`bg-[#0f172a]/70 backdrop-blur-sm border border-white/10 border-l-2 ${card.accent} rounded-lg px-3 py-2.5 hover:bg-white/5 transition-colors cursor-pointer`}
        >
          <div className="flex items-center gap-1.5 mb-1.5">
            <div className="w-3.5 h-3.5 flex items-center justify-center">
              <i className={`${card.icon} ${card.iconColor} text-xs`}></i>
            </div>
            <span className="text-[10px] font-medium text-gray-500 uppercase tracking-wide whitespace-nowrap">
              {card.label}
            </span>
          </div>
          <div className="flex items-baseline gap-1">
            <span className={`text-2xl font-bold leading-none ${card.valueColor}`}>{card.value}</span>
            {card.sub && <span className="text-[10px] text-gray-600">{card.sub}</span>}
          </div>
        </Link>
      ))}
    </div>
  );
}