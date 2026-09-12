interface SummaryItem {
  label: string;
  value: number;
  icon: string;
  accent: string;
}

export default function GuardSummaryCards({ items }: { items: SummaryItem[] }) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
      {items.map((item) => (
        <div key={item.label} className="bg-[#111827] border border-gray-800 rounded-xl px-4 py-3">
          <div className="flex items-center gap-2.5">
            <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${item.accent}`}>
              <div className="w-4 h-4 flex items-center justify-center"><i className={item.icon}></i></div>
            </div>
            <div className="min-w-0">
              <p className="text-[11px] text-gray-500 font-medium uppercase tracking-wider truncate">{item.label}</p>
              <p className="text-lg font-bold text-white leading-tight">{item.value}</p>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}