import type { DocSummary } from '@/lib/useComplianceDocuments';

interface SummaryCardsProps {
  summary: DocSummary;
}

const cards = [
  {
    key: 'expired',
    label: 'Expired',
    icon: 'ri-close-circle-line',
    color: 'text-red-400',
    bg: 'bg-red-500/10',
    border: 'border-red-500/20',
  },
  {
    key: 'expiring7Days',
    label: 'Expiring in 7 Days',
    icon: 'ri-time-line',
    color: 'text-amber-400',
    bg: 'bg-amber-500/10',
    border: 'border-amber-500/20',
  },
  {
    key: 'expiring30Days',
    label: 'Expiring in 30 Days',
    icon: 'ri-calendar-event-line',
    color: 'text-orange-400',
    bg: 'bg-orange-500/10',
    border: 'border-orange-500/20',
  },
  {
    key: 'missing',
    label: 'Missing',
    icon: 'ri-file-close-line',
    color: 'text-gray-400',
    bg: 'bg-gray-500/10',
    border: 'border-gray-500/20',
  },
  {
    key: 'awaitingReview',
    label: 'Awaiting Review',
    icon: 'ri-hourglass-line',
    color: 'text-blue-400',
    bg: 'bg-blue-500/10',
    border: 'border-blue-500/20',
  },
];

export default function SummaryCards({ summary }: SummaryCardsProps) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
      {cards.map((card) => {
        const value = summary[card.key as keyof DocSummary] as number;
        return (
          <div
            key={card.key}
            className={`bg-[#0f172a]/70 backdrop-blur-sm border ${card.border} rounded-xl p-4 hover:bg-[#0f172a]/90 transition-all`}
          >
            <div className={`w-9 h-9 rounded-lg flex items-center justify-center ${card.bg} mb-3`}>
              <div className="w-5 h-5 flex items-center justify-center">
                <i className={`${card.icon} ${card.color}`}></i>
              </div>
            </div>
            <p className={`text-2xl font-bold ${card.color}`}>{value}</p>
            <p className="text-xs text-gray-500 mt-1">{card.label}</p>
          </div>
        );
      })}
    </div>
  );
}