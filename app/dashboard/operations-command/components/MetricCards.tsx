'use client';

import type { OpsSummary } from '@/lib/useOperationsCommand';

interface MetricCardsProps {
  summary: OpsSummary;
}

const cards = [
  {
    key: 'activeGuards' as const,
    label: 'Active Guards',
    icon: 'ri-shield-user-line',
    getColor: (v: number) => v > 0 ? 'text-emerald-400' : 'text-gray-500',
    getBg: (v: number) => v > 0 ? 'bg-emerald-500/10' : 'bg-gray-500/10',
  },
  {
    key: 'sitesCovered' as const,
    label: 'Sites Covered',
    icon: 'ri-building-line',
    suffix: (s: OpsSummary) => `/ ${s.totalSites}`,
    getColor: () => 'text-blue-400',
    getBg: () => 'bg-blue-500/10',
  },
  {
    key: 'openIncidents' as const,
    label: 'Open Incidents',
    icon: 'ri-alarm-warning-line',
    subKey: 'criticalIncidents' as const,
    subLabel: 'critical/high',
    getColor: (v: number) => v > 0 ? 'text-red-400' : 'text-gray-400',
    getBg: (v: number) => v > 0 ? 'bg-red-500/10' : 'bg-gray-500/10',
  },
  {
    key: 'welfareAlerts' as const,
    label: 'Welfare Alerts',
    icon: 'ri-heart-pulse-line',
    getColor: (v: number) => v > 0 ? 'text-orange-400' : 'text-gray-400',
    getBg: (v: number) => v > 0 ? 'bg-orange-500/10' : 'bg-gray-500/10',
  },
  {
    key: 'missedCheckCalls' as const,
    label: 'Missed Check Calls',
    icon: 'ri-phone-line',
    getColor: (v: number) => v > 0 ? 'text-amber-400' : 'text-gray-400',
    getBg: (v: number) => v > 0 ? 'bg-amber-500/10' : 'bg-gray-500/10',
  },
  {
    key: 'patrolCompletion' as const,
    label: 'Patrol Compliance',
    icon: 'ri-route-line',
    isPercent: true,
    getColor: (v: number) => v >= 90 ? 'text-emerald-400' : v >= 70 ? 'text-amber-400' : 'text-red-400',
    getBg: (v: number) => v >= 90 ? 'bg-emerald-500/10' : v >= 70 ? 'bg-amber-500/10' : 'bg-red-500/10',
  },
  {
    key: 'gpsTrackedGuards' as const,
    label: 'GPS Tracked',
    icon: 'ri-map-pin-line',
    subValue: (s: OpsSummary) => s.gpsOfflineGuards > 0 ? `${s.gpsOfflineGuards} offline` : null,
    getColor: () => 'text-cyan-400',
    getBg: () => 'bg-cyan-500/10',
  },
  {
    key: 'unreadNotifications' as const,
    label: 'Notifications',
    icon: 'ri-notification-3-line',
    getColor: (v: number) => v > 0 ? 'text-purple-400' : 'text-gray-400',
    getBg: (v: number) => v > 0 ? 'bg-purple-500/10' : 'bg-gray-500/10',
  },
  {
    key: 'activeSubscriptions' as const,
    label: 'Active Subs',
    icon: 'ri-bank-card-line',
    subValue: (s: OpsSummary) => s.atRiskSubscriptions > 0 ? `${s.atRiskSubscriptions} at risk` : null,
    getColor: () => 'text-indigo-400',
    getBg: () => 'bg-indigo-500/10',
  },
  {
    key: 'monthlyRevenuePence' as const,
    label: 'Monthly Revenue',
    icon: 'ri-funds-line',
    isRevenue: true,
    getColor: () => 'text-emerald-400',
    getBg: () => 'bg-emerald-500/10',
  },
];

export default function MetricCards({ summary }: MetricCardsProps) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
      {cards.map((card) => {
        const rawValue = summary[card.key];
        let displayValue: string;
        let value: number;

        if (card.isRevenue) {
          value = rawValue as number;
          displayValue = `£${(value / 100).toLocaleString(undefined, { maximumFractionDigits: 0 })}`;
        } else if (card.isPercent) {
          value = rawValue as number;
          displayValue = `${value}%`;
        } else {
          value = rawValue as number;
          displayValue = String(value);
        }

        const color = card.getColor(value);
        const bg = card.getBg(value);

        return (
          <div key={card.key} className={`${bg} border border-white/10 rounded-xl p-4 hover:border-white/20 transition-all`}>
            <div className="flex items-center gap-2 mb-2">
              <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${bg}`}>
                <div className="w-4 h-4 flex items-center justify-center">
                  <i className={`${card.icon} ${color}`}></i>
                </div>
              </div>
              <span className="text-[10px] text-gray-500 font-medium uppercase tracking-wider">{card.label}</span>
            </div>
            <div className="flex items-baseline gap-1.5">
              <span className={`text-2xl font-bold ${color}`}>{displayValue}</span>
              {card.suffix && (
                <span className="text-xs text-gray-600">{card.suffix(summary)}</span>
              )}
            </div>
            {card.subKey && (
              <p className="text-[10px] text-gray-500 mt-0.5">
                {summary[card.subKey] as number} {card.subLabel}
              </p>
            )}
            {card.subValue && card.subValue(summary) && (
              <p className="text-[10px] text-red-400 mt-0.5">{card.subValue(summary)}</p>
            )}
          </div>
        );
      })}
    </div>
  );
}