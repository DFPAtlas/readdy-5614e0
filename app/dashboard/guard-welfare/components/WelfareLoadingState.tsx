import { DashboardPageSkeleton } from '@/app/components/PageSkeleton';

export default function WelfareLoadingState() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="h-8 w-64 bg-white/5 rounded-lg animate-pulse" />
        <div className="h-9 w-32 bg-white/5 rounded-lg animate-pulse" />
      </div>
      <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        {[...Array(6)].map((_, i) => (
          <div key={i} className="bg-white/5 rounded-xl p-4 border border-white/10 space-y-3">
            <div className="h-4 w-24 bg-white/5 rounded animate-pulse" />
            <div className="h-8 w-12 bg-white/5 rounded animate-pulse" />
            <div className="h-3 w-32 bg-white/5 rounded animate-pulse" />
          </div>
        ))}
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="bg-white/5 rounded-xl p-5 border border-white/10 space-y-3">
          <div className="h-5 w-40 bg-white/5 rounded animate-pulse" />
          <div className="space-y-2.5 pt-1">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="flex items-center gap-3">
                <div className="h-2.5 w-2.5 rounded-full bg-white/5 animate-pulse" />
                <div className="flex-1 space-y-1.5">
                  <div className="h-3.5 w-3/4 bg-white/5 rounded animate-pulse" />
                  <div className="h-3 w-1/2 bg-white/5 rounded animate-pulse" />
                </div>
              </div>
            ))}
          </div>
        </div>
        <div className="bg-white/5 rounded-xl p-5 border border-white/10 space-y-3">
          <div className="h-5 w-32 bg-white/5 rounded animate-pulse" />
          <div className="space-y-2.5 pt-1">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="flex items-center gap-3">
                <div className="h-2.5 w-2.5 rounded-full bg-white/5 animate-pulse" />
                <div className="flex-1 space-y-1.5">
                  <div className="h-3.5 w-3/4 bg-white/5 rounded animate-pulse" />
                  <div className="h-3 w-1/2 bg-white/5 rounded animate-pulse" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}