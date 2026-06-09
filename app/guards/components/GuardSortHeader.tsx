export default function GuardSortHeader({
  label,
  sortKey,
  activeKey,
  dir,
  onSort,
}: {
  label: string;
  sortKey: string;
  activeKey: string;
  dir: 'asc' | 'desc';
  onSort: (key: string) => void;
}) {
  const active = activeKey === sortKey;
  return (
    <th
      onClick={() => onSort(sortKey)}
      className="px-5 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider cursor-pointer select-none hover:text-white transition-colors"
    >
      <div className="flex items-center gap-1">
        {label}
        {active && (
          <div className="w-3 h-3 flex items-center justify-center">
            {dir === 'asc' ? (
              <i className="ri-arrow-up-s-line text-gray-300"></i>
            ) : (
              <i className="ri-arrow-down-s-line text-gray-300"></i>
            )}
          </div>
        )}
      </div>
    </th>
  );
}