import { Suspense } from 'react';
import CheckoutSuccessContent from './CheckoutSuccessContent';

function LoadingFallback() {
  return (
    <div className="min-h-screen bg-[#0a0e1a] flex items-center justify-center">
      <div className="flex items-center gap-3 text-gray-400">
        <i className="ri-loader-4-line animate-spin text-xl" />
        <span>Loading…</span>
      </div>
    </div>
  );
}

export default function CheckoutSuccessPage() {
  return (
    <Suspense fallback={<LoadingFallback />}>
      <CheckoutSuccessContent />
    </Suspense>
  );
}