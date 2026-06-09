export default function SIAStatusBadge({ dateStr }: { dateStr: string | null }) {
  const days = dateStr ? Math.ceil((new Date(dateStr).getTime() - new Date().setHours(0, 0, 0, 0)) / (1000 * 60 * 60 * 24)) : null;

  if (days === null) {
    return <span className="inline-flex px-2 py-0.5 rounded-full text-xs font-medium bg-gray-500/10 text-gray-400">Unknown</span>;
  }
  if (days < 0) {
    return <span className="inline-flex px-2 py-0.5 rounded-full text-xs font-medium bg-red-500/10 text-red-400">Expired</span>;
  }
  if (days <= 60) {
    return (
      <span className="inline-flex px-2 py-0.5 rounded-full text-xs font-medium bg-amber-500/10 text-amber-400">
        Expiring in {days} day{days !== 1 ? 's' : ''}
      </span>
    );
  }
  return <span className="inline-flex px-2 py-0.5 rounded-full text-xs font-medium bg-emerald-500/10 text-emerald-400">Valid</span>;
}