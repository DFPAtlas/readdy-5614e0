export default function SummaryCards({
  totalGuards,
  totalSites,
  assigned,
  approved,
  blocked,
  notTrained,
  expired,
  available,
}: {
  totalGuards: number;
  totalSites: number;
  assigned: number;
  approved: number;
  blocked: number;
  notTrained: number;
  expired: number;
  available: number;
}) {
  const cards = [
    { label: 'Total Guards', value: totalGuards, icon: 'ri-shield-user-line', color: 'text-blue-400', bg: 'bg-blue-500/10' },
    { label: 'Total Sites', value: totalSites, icon: 'ri-building-line', color: 'text-cyan-400', bg: 'bg-cyan-500/10' },
    { label: 'Assigned', value: assigned, icon: 'ri-check-double-line', color: 'text-emerald-400', bg: 'bg-emerald-500/10' },
    { label: 'Approved', value: approved, icon: 'ri-shield-check-line', color: 'text-blue-400', bg: 'bg-blue-500/10' },
    { label: 'Available', value: available, icon: 'ri-user-add-line', color: 'text-gray-400', bg: 'bg-gray-500/10' },
    { label: 'Not Trained', value: notTrained, icon: 'ri-alert-line', color: 'text-orange-400', bg: 'bg-orange-500/10' },
    { label: 'Blocked', value: blocked, icon: 'ri-forbid-line', color: 'text-red-400', bg: 'bg-red-500/10' },
    { label: 'Expired Docs', value: expired, icon: 'ri-file-warning-line', color: 'text-rose-400', bg: 'bg-rose-500/10' },
  ];

  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3">
      {cards.map((card) => (
        <div key={card.label} className="bg-white/5 backdrop-blur border border-white/10 rounded-xl p-4">
          <div className="flex items-center gap-2 mb-2">
            <div className={`w-8 h-8 rounded-lg ${card.bg} flex items-center justify-center`}>
              <i className={`${card.icon} ${card.color} text-sm`}></i>
            </div>
          </div>
          <div className={`text-2xl font-bold ${card.color}`}>{card.value}</div>
          <div className="text-xs text-gray-500 mt-0.5">{card.label}</div>
        </div>
      ))}
    </div>
  );
}