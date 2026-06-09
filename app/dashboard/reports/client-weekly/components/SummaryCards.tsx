'use client';

interface SummaryCardsProps {
  metrics: {
    totalShifts: number;
    totalPatrols: number;
    patrolCompletionRate: number;
    incidentsOpened: number;
    incidentsClosed: number;
    lateStarts: number;
    openIssues: number;
    guardAttendanceRate: number;
    missedPatrols: number;
    welfareCheckCalls: number;
    missedWelfareChecks: number;
    evidenceFiles: number;
    openTickets: number;
  };
}

export default function SummaryCards({ metrics }: SummaryCardsProps) {
  const cards = [
    {
      label: 'Total Shifts',
      value: metrics.totalShifts,
      icon: 'ri-calendar-event-line',
      color: 'text-blue-400',
      bg: 'bg-blue-500/10',
      trend: metrics.totalShifts > 0 ? `${metrics.totalShifts} this week` : 'No shifts',
    },
    {
      label: 'Total Patrols',
      value: metrics.totalPatrols,
      icon: 'ri-route-line',
      color: 'text-emerald-400',
      bg: 'bg-emerald-500/10',
      trend: `${metrics.patrolCompletionRate}% completion rate`,
    },
    {
      label: 'Patrol Completion',
      value: `${metrics.patrolCompletionRate}%`,
      icon: 'ri-checkbox-circle-line',
      color: 'text-teal-400',
      bg: 'bg-teal-500/10',
      trend: `${metrics.missedPatrols} missed`,
    },
    {
      label: 'Incidents Opened / Closed',
      value: `${metrics.incidentsOpened} / ${metrics.incidentsClosed}`,
      icon: 'ri-alarm-warning-line',
      color: 'text-orange-400',
      bg: 'bg-orange-500/10',
      trend: `${metrics.openIssues} open issues`,
    },
    {
      label: 'Late Starts',
      value: metrics.lateStarts,
      icon: 'ri-time-line',
      color: 'text-red-400',
      bg: 'bg-red-500/10',
      trend: `${metrics.guardAttendanceRate}% on-time rate`,
    },
    {
      label: 'Open Issues',
      value: metrics.openIssues,
      icon: 'ri-error-warning-line',
      color: 'text-rose-400',
      bg: 'bg-rose-500/10',
      trend: `${metrics.openTickets} support tickets`,
    },
    {
      label: 'Welfare Checks',
      value: `${metrics.welfareCheckCalls}`,
      icon: 'ri-heart-pulse-line',
      color: 'text-purple-400',
      bg: 'bg-purple-500/10',
      trend: `${metrics.missedWelfareChecks} missed`,
    },
    {
      label: 'Evidence Files',
      value: metrics.evidenceFiles,
      icon: 'ri-folder-shield-line',
      color: 'text-indigo-400',
      bg: 'bg-indigo-500/10',
      trend: 'Files uploaded this week',
    },
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {cards.map((card, i) => (
        <div key={i} className="bg-[#111827]/60 border border-gray-800 rounded-xl p-4 hover:border-gray-700 transition-all">
          <div className="flex items-center justify-between mb-3">
            <div className={`w-9 h-9 rounded-lg flex items-center justify-center ${card.bg}`}>
              <div className="w-4 h-4 flex items-center justify-center">
                <i className={`${card.icon} ${card.color}`}></i>
              </div>
            </div>
          </div>
          <p className="text-xs text-gray-500 mb-1">{card.label}</p>
          <p className="text-lg font-bold text-white">{card.value}</p>
          <p className="text-xs text-gray-500 mt-1">{card.trend}</p>
        </div>
      ))}
    </div>
  );
}