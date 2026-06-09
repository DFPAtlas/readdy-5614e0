export default function LoadingState() {
  return (
    <div className="space-y-6 animate-pulse">
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
        {[...Array(6)].map((_, i) => (
          <div key={i} className="h-28 bg-[#0f172a]/70 rounded-xl border border-white/10" />
        ))}
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 h-96 bg-[#0f172a]/70 rounded-xl border border-white/10" />
        <div className="h-96 bg-[#0f172a]/70 rounded-xl border border-white/10" />
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="h-80 bg-[#0f172a]/70 rounded-xl border border-white/10" />
        <div className="h-80 bg-[#0f172a]/70 rounded-xl border border-white/10" />
      </div>
    </div>
  );
}