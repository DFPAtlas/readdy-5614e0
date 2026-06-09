'use client';

const colorMap: Record<string, { bg: string; text: string; border: string; iconBg: string }> = {
  emerald: { bg: 'bg-emerald-500/10', text: 'text-emerald-400', border: 'border-emerald-500/20', iconBg: 'bg-emerald-600/15' },
  blue: { bg: 'bg-blue-500/10', text: 'text-blue-400', border: 'border-blue-500/20', iconBg: 'bg-blue-600/15' },
  amber: { bg: 'bg-amber-500/10', text: 'text-amber-400', border: 'border-amber-500/20', iconBg: 'bg-amber-600/15' },
  red: { bg: 'bg-red-500/10', text: 'text-red-400', border: 'border-red-500/20', iconBg: 'bg-red-600/15' },
  purple: { bg: 'bg-purple-500/10', text: 'text-purple-400', border: 'border-purple-500/20', iconBg: 'bg-purple-600/15' },
  gray: { bg: 'bg-gray-500/10', text: 'text-gray-400', border: 'border-gray-500/20', iconBg: 'bg-gray-600/15' },
};

export function StatCard({
  label,
  value,
  icon,
  color,
  sub,
}: {
  label: string;
  value: string;
  icon: string;
  color: string;
  sub?: string;
}) {
  const c = colorMap[color] || colorMap.emerald;

  return (
    <div className={`bg-[#111827] border ${c.border} rounded-xl p-5`}>
      <div className="flex items-start justify-between mb-4">
        <div className={`w-10 h-10 rounded-lg ${c.iconBg} flex items-center justify-center`}>
          <div className={`w-5 h-5 flex items-center justify-center ${c.text}`}>
            <i className={icon}></i>
          </div>
        </div>
      </div>
      <div className="text-2xl font-bold text-white">{value}</div>
      <div className="text-sm text-gray-500 mt-0.5">{label}</div>
      {sub && <div className="text-xs text-gray-600 mt-1">{sub}</div>}
    </div>
  );
}