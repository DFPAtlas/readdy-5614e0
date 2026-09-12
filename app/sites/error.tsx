'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';

export default function SitesError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const [retrying, setRetrying] = useState(false);

  useEffect(() => {
    console.error('[Sites Error]', error);
  }, [error]);

  return (
    <div className="min-h-screen bg-[#0a0e1a] flex items-center justify-center">
      <div className="text-center max-w-md mx-auto px-4">
        <div className="w-16 h-16 rounded-full bg-red-500/10 border border-red-500/20 flex items-center justify-center mx-auto mb-5">
          <i className="ri-error-warning-line text-2xl text-red-400"></i>
        </div>
        <h1 className="text-xl font-bold text-white mb-2">Sites page error</h1>
        <p className="text-sm text-gray-400 mb-6">
          Something went wrong loading this page. Please try again.
        </p>
        <div className="flex items-center justify-center gap-3">
          <button
            onClick={() => { setRetrying(true); setTimeout(reset, 300); }}
            disabled={retrying}
            className="px-5 py-2.5 rounded-lg bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-sm font-medium text-white transition-colors cursor-pointer whitespace-nowrap"
          >
            {retrying ? 'Retrying...' : 'Try Again'}
          </button>
          <Link
            href="/dashboard"
            className="px-5 py-2.5 rounded-lg bg-white/5 border border-white/10 hover:border-white/20 text-sm text-gray-400 hover:text-white transition-all cursor-pointer whitespace-nowrap"
          >
            Dashboard
          </Link>
        </div>
      </div>
    </div>
  );
}