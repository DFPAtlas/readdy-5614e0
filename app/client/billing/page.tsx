import { Suspense } from 'react';
import BillingClient from './BillingClient';

function LoadingFallback() {
  return (
    <div className="space-y-8 animate-pulse">
      <div className="h-9 w-64 bg-white/5 rounded-lg mb-2" />
      <div className="h-5 w-96 bg-white/5 rounded-lg" />
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="rounded-xl bg-white/[0.03] border border-white/10 p-5">
            <div className="h-4 w-24 bg-white/5 rounded mb-3" />
            <div className="h-8 w-16 bg-white/5 rounded mb-1" />
            <div className="h-3 w-20 bg-white/5 rounded" />
          </div>
        ))}
      </div>
    </div>
  );
}

export default function BillingPage() {
  return (
    <Suspense fallback={<LoadingFallback />}>
      <BillingClient />
    </Suspense>
  );
}