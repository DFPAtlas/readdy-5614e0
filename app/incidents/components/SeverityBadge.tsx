import { SEVERITY_COLORS } from '@/lib/useIncidents';

export default function SeverityBadge({ severity }: { severity: string | null }) {
  const s = (severity || 'low').toLowerCase();
  const c = SEVERITY_COLORS[s] || SEVERITY_COLORS.low;
  return (
    <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-medium ${c.bg} ${c.text}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${c.dot}`}></span>
      {s.charAt(0).toUpperCase() + s.slice(1)}
    </span>
  );
}