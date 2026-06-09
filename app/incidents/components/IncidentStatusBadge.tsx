const colors: Record<string, string> = {
  open: 'bg-red-500/10 text-red-400',
  reviewing: 'bg-amber-500/10 text-amber-400',
  closed: 'bg-emerald-500/10 text-emerald-400',
};

export default function IncidentStatusBadge({ status }: { status: string | null }) {
  const s = (status || 'open').toLowerCase();
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${colors[s] || colors.open}`}>
      {s.charAt(0).toUpperCase() + s.slice(1)}
    </span>
  );
}