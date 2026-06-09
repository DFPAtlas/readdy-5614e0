interface Props {
  label: string;
  sortKey: string;
  activeKey: string;
  dir: 'asc' | 'desc';
  onSort: (key: string) => void;
}

export default function SOPSortHeader({ label, sortKey, activeKey, dir, onSort }: Props) {
  const active = activeKey === sortKey;
  return (
    <th
      className="px-5 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider cursor-pointer select-none hover:text-gray-300 transition-colors"
      onClick={() => onSort(sortKey)}
    >
      <div className="flex items-center gap-1">
        <span>{label}</span>
        {active && (
          <div className="w-3.5 h-3.5 flex items-center justify-center">
            {dir === 'asc' ? (
              <i className="ri-arrow-up-s-line text-xs"></i>
            ) : (
              <i className="ri-arrow-down-s-line text-xs"></i>
            )}
          </div>
        )}
      </div>
    </th>
  );
}