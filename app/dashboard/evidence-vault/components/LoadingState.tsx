export default function LoadingState() {
  return (
    <div className="space-y-5">
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="bg-[#111827] rounded-xl p-4 border border-gray-800 animate-pulse">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-xl bg-white/5" />
              <div className="space-y-2">
                <div className="h-3 w-20 bg-white/5 rounded" />
                <div className="h-5 w-12 bg-white/5 rounded" />
              </div>
            </div>
          </div>
        ))}
      </div>
      <div className="flex gap-2">
        <div className="h-9 flex-1 bg-[#111827] rounded-lg border border-gray-800 animate-pulse" />
        <div className="h-9 w-32 bg-[#111827] rounded-lg border border-gray-800 animate-pulse" />
        <div className="h-9 w-32 bg-[#111827] rounded-lg border border-gray-800 animate-pulse" />
      </div>
      <div className="bg-[#111827] rounded-xl border border-gray-800 overflow-hidden animate-pulse">
        {[...Array(6)].map((_, i) => (
          <div key={i} className="flex items-center gap-4 px-5 py-4 border-b border-gray-800/50">
            <div className="h-12 w-12 rounded-lg bg-white/5" />
            <div className="flex-1 space-y-2">
              <div className="h-3.5 w-3/4 bg-white/5 rounded" />
              <div className="h-3 w-1/2 bg-white/5 rounded" />
            </div>
            <div className="h-8 w-20 bg-white/5 rounded-lg" />
          </div>
        ))}
      </div>
    </div>
  );
}