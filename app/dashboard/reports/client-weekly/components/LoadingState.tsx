'use client';

export default function LoadingState() {
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3 mb-4">
        <div className="w-8 h-8 bg-white/5 rounded-lg animate-pulse"></div>
        <div className="h-4 w-48 bg-white/5 rounded animate-pulse"></div>
      </div>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[...Array(8)].map((_, i) => (
          <div key={i} className="bg-[#111827] rounded-xl p-4 border border-gray-800 space-y-3">
            <div className="h-3 w-20 bg-white/5 rounded animate-pulse"></div>
            <div className="h-6 w-12 bg-white/5 rounded animate-pulse"></div>
            <div className="h-3 w-32 bg-white/5 rounded animate-pulse"></div>
          </div>
        ))}
      </div>
      <div className="bg-[#111827] rounded-xl p-5 border border-gray-800 space-y-3">
        <div className="h-4 w-40 bg-white/5 rounded animate-pulse"></div>
        <div className="space-y-2 pt-2">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-10 bg-white/5 rounded animate-pulse"></div>
          ))}
        </div>
      </div>
    </div>
  );
}