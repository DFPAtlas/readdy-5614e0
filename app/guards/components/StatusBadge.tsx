export default function StatusBadge({ status }: { status: string | null }) {
  const s = (status || 'active').toLowerCase();
  const map: Record<string, string> = {
    active: 'bg-emerald-500/10 text-emerald-400',
    suspended: 'bg-amber-500/10 text-amber-400',
    inactive: 'bg-gray-500/10 text-gray-400',
  };
  return (
    <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium ${map[s] || map.active}`}>
      {s.charAt(0).toUpperCase() + s.slice(1)}
    </span>
  );
}