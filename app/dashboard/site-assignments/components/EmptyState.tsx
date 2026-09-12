export default function EmptyState({ onRefresh }: { onRefresh: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center py-20 text-center">
      <div className="w-16 h-16 rounded-2xl bg-gray-800/60 flex items-center justify-center mb-4">
        <div className="w-8 h-8 flex items-center justify-center">
          <i className="ri-map-pin-2-line text-gray-500 text-xl"></i>
        </div>
      </div>
      <h3 className="text-lg font-semibold text-white mb-2">No Assignment Data</h3>
      <p className="text-sm text-gray-500 max-w-sm">
        There are no guards or sites configured yet. Add guards and sites to build your assignment matrix.
      </p>
      <button
        onClick={onRefresh}
        className="mt-6 flex items-center gap-2 text-sm text-blue-400 hover:text-blue-300 transition-colors cursor-pointer"
      >
        <div className="w-4 h-4 flex items-center justify-center">
          <i className="ri-refresh-line"></i>
        </div>
        Refresh
      </button>
    </div>
  );
}