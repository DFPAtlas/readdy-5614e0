export default function EmptyState({ search }: { search: string }) {
  return (
    <div className="text-center py-12">
      <div className="w-12 h-12 mx-auto mb-4 flex items-center justify-center rounded-xl bg-gray-800/50">
        <div className="w-6 h-6 flex items-center justify-center">
          <i className="ri-building-line text-gray-500 text-xl"></i>
        </div>
      </div>
      <h3 className="text-sm font-medium text-gray-300 mb-1">
        {search ? 'No sites match your search' : 'No sites yet'}
      </h3>
      <p className="text-sm text-gray-500">
        {search ? 'Try adjusting your search or filters' : 'Add your first site to get started.'}
      </p>
    </div>
  );
}