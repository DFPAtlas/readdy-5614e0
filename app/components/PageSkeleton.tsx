'use client';

interface SkeletonBlockProps {
  className?: string;
}

function SkeletonBlock({ className = '' }: SkeletonBlockProps) {
  return (
    <div className={`bg-white/5 rounded-lg animate-pulse ${className}`} />
  );
}

export function DashboardPageSkeleton() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <SkeletonBlock className="h-8 w-56" />
        <SkeletonBlock className="h-9 w-32" />
      </div>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="bg-[#111827] rounded-xl p-5 border border-gray-800 space-y-3">
            <SkeletonBlock className="h-4 w-24" />
            <SkeletonBlock className="h-8 w-16" />
            <SkeletonBlock className="h-3 w-32" />
          </div>
        ))}
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2 bg-[#111827] rounded-xl p-5 border border-gray-800 space-y-3">
          <SkeletonBlock className="h-5 w-40" />
          <div className="space-y-2.5 pt-1">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="flex items-center gap-3">
                <SkeletonBlock className="h-9 w-9 rounded-full flex-shrink-0" />
                <div className="flex-1 space-y-1.5">
                  <SkeletonBlock className="h-3.5 w-3/4" />
                  <SkeletonBlock className="h-3 w-1/2" />
                </div>
                <SkeletonBlock className="h-6 w-16 rounded-full" />
              </div>
            ))}
          </div>
        </div>
        <div className="bg-[#111827] rounded-xl p-5 border border-gray-800 space-y-3">
          <SkeletonBlock className="h-5 w-32" />
          <div className="space-y-2.5 pt-1">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="flex items-center justify-between">
                <SkeletonBlock className="h-3.5 w-28" />
                <SkeletonBlock className="h-6 w-14 rounded-full" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export function TablePageSkeleton() {
  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <SkeletonBlock className="h-8 w-48" />
        <div className="flex gap-2">
          <SkeletonBlock className="h-9 w-36" />
          <SkeletonBlock className="h-9 w-28" />
        </div>
      </div>
      <div className="flex gap-3">
        <SkeletonBlock className="h-9 w-64" />
        <SkeletonBlock className="h-9 w-32" />
        <SkeletonBlock className="h-9 w-32" />
      </div>
      <div className="bg-[#111827] rounded-xl border border-gray-800 overflow-hidden">
        <div className="flex items-center gap-4 px-5 py-3 border-b border-gray-800">
          {[...Array(5)].map((_, i) => (
            <SkeletonBlock key={i} className="h-3.5 flex-1" />
          ))}
        </div>
        {[...Array(8)].map((_, i) => (
          <div key={i} className="flex items-center gap-4 px-5 py-4 border-b border-gray-800/50">
            <SkeletonBlock className="h-8 w-8 rounded-full flex-shrink-0" />
            {[...Array(4)].map((_, j) => (
              <SkeletonBlock key={j} className="h-3.5 flex-1" />
            ))}
            <SkeletonBlock className="h-6 w-20 rounded-full flex-shrink-0" />
          </div>
        ))}
      </div>
    </div>
  );
}

export function ClientPageSkeleton() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <SkeletonBlock className="h-8 w-52" />
        <SkeletonBlock className="h-9 w-28" />
      </div>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="bg-white/5 rounded-xl p-5 border border-white/10 space-y-3">
            <SkeletonBlock className="h-4 w-20" />
            <SkeletonBlock className="h-7 w-14" />
          </div>
        ))}
      </div>
      <div className="bg-white/5 rounded-xl border border-white/10 overflow-hidden">
        {[...Array(6)].map((_, i) => (
          <div key={i} className="flex items-center gap-4 px-5 py-4 border-b border-white/5">
            <SkeletonBlock className="h-8 w-8 rounded-lg flex-shrink-0" />
            <div className="flex-1 space-y-1.5">
              <SkeletonBlock className="h-3.5 w-2/3" />
              <SkeletonBlock className="h-3 w-1/3" />
            </div>
            <SkeletonBlock className="h-6 w-16 rounded-full" />
          </div>
        ))}
      </div>
    </div>
  );
}

export function GuardPageSkeleton() {
  return (
    <div className="max-w-lg mx-auto w-full px-4 pt-4 space-y-4">
      <div className="bg-white/5 rounded-2xl p-5 border border-white/10 space-y-3">
        <SkeletonBlock className="h-5 w-32" />
        <SkeletonBlock className="h-16 w-full rounded-xl" />
        <div className="flex gap-3">
          <SkeletonBlock className="h-10 flex-1 rounded-xl" />
          <SkeletonBlock className="h-10 flex-1 rounded-xl" />
        </div>
      </div>
      <div className="grid grid-cols-2 gap-3">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="bg-white/5 rounded-2xl p-4 border border-white/10 space-y-2">
            <SkeletonBlock className="h-8 w-8 rounded-lg" />
            <SkeletonBlock className="h-3.5 w-20" />
            <SkeletonBlock className="h-3 w-14" />
          </div>
        ))}
      </div>
      <div className="bg-white/5 rounded-2xl p-5 border border-white/10 space-y-3">
        <SkeletonBlock className="h-4 w-28" />
        {[...Array(3)].map((_, i) => (
          <div key={i} className="flex items-center gap-3">
            <SkeletonBlock className="h-9 w-9 rounded-full flex-shrink-0" />
            <div className="flex-1 space-y-1.5">
              <SkeletonBlock className="h-3.5 w-3/4" />
              <SkeletonBlock className="h-3 w-1/2" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function PageSkeleton({ variant = 'dashboard' }: { variant?: 'dashboard' | 'table' | 'client' | 'guard' }) {
  if (variant === 'table') return <TablePageSkeleton />;
  if (variant === 'client') return <ClientPageSkeleton />;
  if (variant === 'guard') return <GuardPageSkeleton />;
  return <DashboardPageSkeleton />;
}