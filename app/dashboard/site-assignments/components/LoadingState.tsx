export default function LoadingState() {
  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div className="h-8 w-48 bg-gray-800/60 rounded-lg animate-pulse" />
        <div className="h-9 w-32 bg-gray-800/60 rounded-lg animate-pulse" />
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3">
        {[...Array(8)].map((_, i) => (
          <div key={i} className="bg-[#111827] rounded-xl p-4 border border-gray-800 space-y-3">
            <div className="h-4 w-20 bg-gray-800/60 rounded animate-pulse" />
            <div className="h-8 w-12 bg-gray-800/60 rounded animate-pulse" />
          </div>
        ))}
      </div>
      <div className="bg-[#111827] rounded-xl border border-gray-800 overflow-hidden">
        <div className="flex items-center gap-4 px-5 py-3 border-b border-gray-800">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="h-3.5 flex-1 bg-gray-800/60 rounded animate-pulse" />
          ))}
        </div>
        {[...Array(6)].map((_, i) => (
          <div key={i} className="flex items-center gap-4 px-5 py-4 border-b border-gray-800/60">
            <div className="h-8 w-8 rounded-full bg-gray-800/60 animate-pulse" />
            {[...Array(5)].map((_, j) => (
              <div key={j} className="h-3.5 flex-1 bg-gray-800/60 rounded animate-pulse" />
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}