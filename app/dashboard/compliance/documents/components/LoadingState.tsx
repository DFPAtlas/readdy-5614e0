export default function LoadingState() {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="bg-[#0f172a]/70 border border-white/10 rounded-xl p-4 animate-pulse">
            <div className="w-9 h-9 rounded-lg bg-white/5 mb-3" />
            <div className="h-8 w-12 bg-white/5 rounded mb-1" />
            <div className="h-4 w-24 bg-white/5 rounded" />
          </div>
        ))}
      </div>
      <div className="bg-[#0f172a]/70 border border-white/10 rounded-xl overflow-hidden animate-pulse">
        <div className="h-12 border-b border-white/10" />
        {[...Array(6)].map((_, i) => (
          <div key={i} className="h-14 border-b border-white/5" />
        ))}
      </div>
    </div>
  );
}