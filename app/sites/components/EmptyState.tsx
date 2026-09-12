'use client';

export default function EmptyState({
  search,
  hasAnySites,
  canCreate,
  onAdd,
}: {
  search: string;
  hasAnySites: boolean;
  canCreate: boolean;
  onAdd: () => void;
}) {
  const noSitesAtAll = !hasAnySites;

  return (
    <div className="text-center py-14 px-6">
      <div className="w-14 h-14 mx-auto mb-4 flex items-center justify-center rounded-xl bg-gray-800/50 border border-gray-700/50">
        <div className="w-7 h-7 flex items-center justify-center">
          <i className="ri-building-line text-gray-500 text-2xl"></i>
        </div>
      </div>
      <h3 className="text-base font-semibold text-gray-200 mb-1.5">
        {noSitesAtAll ? 'No sites have been added yet.' : 'No sites match your current filters.'}
      </h3>
      <p className="text-sm text-gray-500 max-w-sm mx-auto">
        {noSitesAtAll
          ? 'Add your first guarded location to start monitoring operations.'
          : 'Try adjusting your search or risk filter to see more sites.'}
      </p>
      {noSitesAtAll && canCreate && (
        <button
          onClick={onAdd}
          className="mt-5 inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white text-sm font-medium px-4 py-2.5 rounded-lg transition-colors cursor-pointer whitespace-nowrap"
        >
          <div className="w-4 h-4 flex items-center justify-center"><i className="ri-add-line"></i></div>
          Add Site
        </button>
      )}
    </div>
  );
}