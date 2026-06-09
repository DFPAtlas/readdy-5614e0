'use client';

import { useState } from 'react';
import type { SLAData } from '@/lib/useClientSLA';

interface SummaryCardsProps {
  summary: SLAData;
}

function Card({
  label,
  value,
  unit,
  icon,
  color,
  trend,
}: {
  label: string;
  value: string | number;
  unit?: string;
  icon: string;
  color: string;
  trend?: string;
}) {
  return (
    <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-5">
      <div className="flex items-start justify-between">
        <div className="space-y-1">
          <p className="text-sm text-gray-400">{label}</p>
          <div className="flex items-baseline gap-1">
            <span className="text-2xl font-bold text-white">{value}</span>
            {unit && <span className="text-sm text-gray-500">{unit}</span>}
          </div>
          {trend && <p className="text-xs text-gray-500">{trend}</p>}
        </div>
        <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${color}`}>
          <div className="w-5 h-5 flex items-center justify-center">
            <i className={`${icon} text-sm`}></i>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function SummaryCards({ summary }: SummaryCardsProps) {
  const [selectedPeriod, setSelectedPeriod] = useState<'7d' | '30d' | '90d'>('30d');

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-white">SLA Performance Overview</h2>
        <div className="flex items-center bg-gray-800/60 border border-gray-700 rounded-lg p-0.5">
          {(['7d', '30d', '90d'] as const).map((p) => (
            <button
              key={p}
              onClick={() => setSelectedPeriod(p)}
              className={`px-3 py-1 text-xs rounded-md transition-colors cursor-pointer whitespace-nowrap ${
                selectedPeriod === p
                  ? 'bg-blue-600/30 text-blue-400'
                  : 'text-gray-500 hover:text-gray-300'
              }`}
            >
              {p === '7d' ? '7 Days' : p === '30d' ? '30 Days' : '90 Days'}
            </button>
          ))}
        </div>
      </div>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card
          label="Avg Response Time"
          value={summary.avgResponseTime}
          unit="min"
          icon="ri-time-line"
          color="bg-blue-500/10 text-blue-400"
          trend={summary.avgResponseTime < 30 ? 'Within SLA' : 'Above SLA target'}
        />
        <Card
          label="Patrol Completion"
          value={`${summary.patrolCompletionRate}%`}
          icon="ri-route-line"
          color="bg-emerald-500/10 text-emerald-400"
          trend={`${summary.missedPatrols} missed patrols`}
        />
        <Card
          label="Missed Patrols"
          value={summary.missedPatrols}
          icon="ri-map-pin-line"
          color="bg-orange-500/10 text-orange-400"
          trend={summary.missedPatrols === 0 ? 'All complete' : 'Requires attention'}
        />
        <Card
          label="Incident Closure"
          value={summary.incidentClosureTime}
          unit="min"
          icon="ri-alarm-warning-line"
          color="bg-purple-500/10 text-purple-400"
          trend={summary.incidentClosureTime < 60 ? 'Fast resolution' : 'Review process'}
        />
        <Card
          label="Guard Punctuality"
          value={`${summary.guardPunctuality}%`}
          icon="ri-shield-check-line"
          color="bg-cyan-500/10 text-cyan-400"
          trend={summary.guardPunctuality >= 95 ? 'Excellent' : 'Below target'}
        />
        <Card
          label="Report Completion"
          value={`${summary.reportCompletionRate}%`}
          icon="ri-file-list-3-line"
          color="bg-indigo-500/10 text-indigo-400"
          trend="Daily occurrence books"
        />
        <Card
          label="Open Issues"
          value={summary.openClientIssues}
          icon="ri-error-warning-line"
          color="bg-red-500/10 text-red-400"
          trend={summary.openClientIssues === 0 ? 'All resolved' : 'Awaiting action'}
        />
        <Card
          label="SLA Breaches"
          value={summary.slaBreachCount}
          icon="ri-timer-flash-line"
          color="bg-rose-500/10 text-rose-400"
          trend={summary.slaBreachCount === 0 ? 'No breaches' : 'Escalation needed'}
        />
      </div>
    </div>
  );
}