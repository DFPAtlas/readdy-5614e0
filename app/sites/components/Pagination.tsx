export default function Pagination({
  page,
  totalPages,
  onChange,
  total,
}: {
  page: number;
  totalPages: number;
  onChange: (p: number) => void;
  total: number;
}) {
  if (total === 0 || totalPages <= 1) return null;
  const start = Math.min((page - 1) * 25 + 1, total);
  const end = Math.min(page * 25, total);
  return (
    <div className="flex items-center justify-between px-5 py-3 border-t border-gray-800">
      <span className="text-xs text-gray-500">
        Showing {start}–{end} of {total}
      </span>
      <div className="flex items-center gap-1">
        <button
          onClick={() => onChange(page - 1)}
          disabled={page === 1}
          className="w-8 h-8 flex items-center justify-center rounded-lg text-gray-400 hover:text-white hover:bg-gray-800 disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
        >
          <div className="w-4 h-4 flex items-center justify-center"><i className="ri-arrow-left-s-line"></i></div>
        </button>
        <span className="text-sm text-gray-400 px-2">{page} / {totalPages}</span>
        <button
          onClick={() => onChange(page + 1)}
          disabled={page === totalPages}
          className="w-8 h-8 flex items-center justify-center rounded-lg text-gray-400 hover:text-white hover:bg-gray-800 disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
        >
          <div className="w-4 h-4 flex items-center justify-center"><i className="ri-arrow-right-s-line"></i></div>
        </button>
      </div>
    </div>
  );
}