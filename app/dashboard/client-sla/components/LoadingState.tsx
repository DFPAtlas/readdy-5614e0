export default function LoadingState() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="h-8 w-48 bg-white/5 rounded-lg animate-pulse" />
        <div className="h-9 w-32 bg-white/5 rounded-lg animate-pulse" />
      </div>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[...Array(8)].map((_, i) => (
          <div key={i} className="bg-white/5 rounded-xl p-5 border border-white/10 space-y-3">
            <div className="h-4 w-24 bg-white/5 rounded animate-pulse" />
            <div className="h-8 w-16 bg-white/5 rounded animate-pulse" />
            <div className="h-3 w-32 bg-white/5 rounded animate-pulse" />
          </div>
        ))}
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="bg-white/5 rounded-xl p-5 border border-white/10 h-64">
            <div className="h-5 w-32 bg-white/5 rounded animate-pulse mb-4" />
            <div className="h-full w-full bg-white/5 rounded animate-pulse" />
          </div>
        ))}
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="bg-white/5 rounded-xl p-5 border border-white/10 space-y-2">
            <div className="h-5 w-40 bg-white/5 rounded animate-pulse" />
            {[...Array(4)].map((_, j) => (
              <div key={j} className="h-8 bg-white/5 rounded animate-pulse" />
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}