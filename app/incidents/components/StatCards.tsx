import { Incident } from '@/lib/useIncidents';

interface Props {
  incidents: Incident[];
}

export default function StatCards({ incidents }: Props) {
  const total = incidents.length;
  const open = incidents.filter((i) => (i.status || 'open') === 'open').length;
  const critical = incidents.filter((i) => (i.severity || '').toLowerCase() === 'critical').length;
  const highPriority = incidents.filter((i) => (i.severity || '').toLowerCase() === 'high').length;
  const reviewing = incidents.filter((i) => (i.status || '') === 'reviewing').length;
  const resolved = incidents.filter((i) => (i.status || '') === 'closed').length;

  const cards = [
    { label: 'Total Incidents', value: total, accent: 'text-white', icon: 'ri-file-list-3-line', bg: 'bg-gray-500/10', ring: '' },
    { label: 'Open', value: open, accent: 'text-red-400', icon: 'ri-alarm-warning-line', bg: 'bg-red-500/10', ring: 'border-red-500/30' },
    { label: 'Critical', value: critical, accent: 'text-red-400', icon: 'ri-fire-line', bg: 'bg-red-500/10', ring: 'border-red-500/30' },
    { label: 'High Priority', value: highPriority, accent: 'text-orange-400', icon: 'ri-arrow-up-circle-line', bg: 'bg-orange-500/10', ring: 'border-orange-500/20' },
    { label: 'Under Review', value: reviewing, accent: 'text-amber-400', icon: 'ri-eye-line', bg: 'bg-amber-500/10', ring: 'border-amber-500/20' },
    { label: 'Resolved', value: resolved, accent: 'text-emerald-400', icon: 'ri-check-double-line', bg: 'bg-emerald-500/10', ring: 'border-emerald-500/20' },
  ];

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
      {cards.map((c) => (
        <div
          key={c.label}
          className={`bg-[#111827]/60 border rounded-xl px-3 py-3 flex items-center gap-2.5 ${c.ring || 'border-gray-800'}`}
        >
          <div className={`w-8 h-8 rounded-lg ${c.bg} flex items-center justify-center flex-shrink-0`}>
            <div className="w-4 h-4 flex items-center justify-center">
              <i className={`${c.icon} ${c.accent}`}></i>
            </div>
          </div>
          <div className="min-w-0">
            <div className={`text-lg font-bold leading-none ${c.accent} tabular-nums`}>{c.value}</div>
            <div className="text-[11px] text-gray-400 mt-1 truncate">{c.label}</div>
          </div>
        </div>
      ))}
    </div>
  );
}