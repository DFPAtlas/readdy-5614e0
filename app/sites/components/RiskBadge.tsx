const colors: Record<string, string> = {
  low: 'bg-emerald-500/10 text-emerald-400',
  medium: 'bg-amber-500/10 text-amber-400',
  high: 'bg-orange-500/10 text-orange-400',
  critical: 'bg-red-500/10 text-red-400',
};

export default function RiskBadge({ level }: { level: string | null }) {
  const l = level || 'low';
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${colors[l] || colors.low}`}>
      {l}
    </span>
  );
}