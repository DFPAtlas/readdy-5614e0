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
    { label: 'Guards', value: totalGuards, icon: 'ri-shield-user-line', accent: 'bg-blue-500/15 text-blue-400', critical: false },
    { label: 'Sites', value: totalSites, icon: 'ri-building-line', accent: 'bg-cyan-500/15 text-cyan-400', critical: false },
    { label: 'Assigned', value: assigned, icon: 'ri-check-double-line', accent: 'bg-emerald-500/15 text-emerald-400', critical: false },
    { label: 'Approved', value: approved, icon: 'ri-shield-check-line', accent: 'bg-blue-500/15 text-blue-400', critical: false },
    { label: 'Available', value: available, icon: 'ri-user-add-line', accent: 'bg-sky-500/15 text-sky-400', critical: false },
    { label: 'Not Trained', value: notTrained, icon: 'ri-alert-line', accent: 'bg-amber-500/15 text-amber-400', critical: notTrained > 0 },
    { label: 'Blocked', value: blocked, icon: 'ri-forbid-line', accent: 'bg-red-500/15 text-red-400', critical: blocked > 0 },
    { label: 'Expired Docs', value: expired, icon: 'ri-file-warning-line', accent: 'bg-rose-500/15 text-rose-400', critical: expired > 0 },
  ];

  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3">
      {cards.map((card) => (
        <div
          key={card.label}
          className={`rounded-xl px-3.5 py-3 border ${
            card.critical ? 'bg-red-500/5 border-red-500/20' : 'bg-[#0a0e1a] border-gray-800'
          }`}
        >
          <div className="flex items-center gap-2.5">
            <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${card.accent}`}>
              <div className="w-4 h-4 flex items-center justify-center"><i className={card.icon}></i></div>
            </div>
            <div className="min-w-0">
              <p className={`text-lg font-bold leading-tight ${card.critical ? 'text-red-400' : 'text-white'}`}>{card.value}</p>
              <p className="text-[10px] text-gray-500 font-medium uppercase tracking-wider truncate">{card.label}</p>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}