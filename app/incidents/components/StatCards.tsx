import { Incident } from '@/lib/useIncidents';

interface Props {
  incidents: Incident[];
}

export default function StatCards({ incidents }: Props) {
  const openCount = incidents.filter((i) => (i.status || 'open') === 'open').length;
  const reviewingCount = incidents.filter((i) => (i.status || '') === 'reviewing').length;

  const oneWeekAgo = new Date();
  oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
  const closedWeekCount = incidents.filter((i) => {
    if ((i.status || '') !== 'closed') return false;
    const d = i.resolved_at || i.created_at;
    if (!d) return false;
    return new Date(d) >= oneWeekAgo;
  }).length;

  const highCriticalOpen = incidents.filter(
    (i) =>
      (i.status || 'open') === 'open' &&
      ['high', 'critical'].includes((i.severity || '').toLowerCase())
  ).length;

  const cards = [
    { label: 'Open Incidents', value: openCount, accent: 'text-red-400', bg: 'bg-red-500/10', icon: 'ri-alarm-warning-line' },
    { label: 'Reviewing', value: reviewingCount, accent: 'text-amber-400', bg: 'bg-amber-500/10', icon: 'ri-eye-line' },
    { label: 'Closed This Week', value: closedWeekCount, accent: 'text-emerald-400', bg: 'bg-emerald-500/10', icon: 'ri-check-double-line' },
    { label: 'High/Critical Open', value: highCriticalOpen, accent: 'text-orange-400', bg: 'bg-orange-500/10', icon: 'ri-fire-line' },
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3"
    >
      {cards.map((c) => (
        <div key={c.label} className="bg-[#111827]/60 border border-gray-800 rounded-xl px-4 py-3.5 flex items-center gap-3"
        >
          <div className={`w-10 h-10 rounded-lg ${c.bg} flex items-center justify-center flex-shrink-0`}
          >
            <div className="w-5 h-5 flex items-center justify-center"
            >
              <i className={`${c.accent} ${c.icon}`}></i>
            </div>
          </div>
          <div>
            <div className={`text-xl font-bold ${c.accent}`}>{c.value}</div>
            <div className="text-xs text-gray-400">{c.label}</div>
          </div>
        </div>
      ))}
    </div>
  );
}