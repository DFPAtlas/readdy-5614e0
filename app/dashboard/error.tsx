'use client';

import { useEffect } from 'react';

export default function DashboardError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('[Dashboard Error Boundary]', error);
  }, [error]);

  return (
    <div className="min-h-screen bg-[#0a0e1a] flex items-center justify-center">
      <div className="text-center max-w-md mx-auto px-4">
        <div className="w-16 h-16 rounded-full bg-red-500/10 border border-red-500/20 flex items-center justify-center mx-auto mb-5">
          <i className="ri-error-warning-line text-2xl text-red-400"></i>
        </div>
        <h1 className="text-xl font-bold text-white mb-2">Something went wrong</h1>
        <p className="text-sm text-gray-400 mb-6">
          The dashboard encountered an unexpected error. This is usually temporary.
        </p>
        <div className="flex items-center justify-center gap-3">
          <button
            onClick={reset}
            className="px-5 py-2.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-sm font-medium text-white transition-colors cursor-pointer whitespace-nowrap"
          >
            Try Again
          </button>
          <a
            href="/login"
            className="px-5 py-2.5 rounded-lg bg-white/5 border border-white/10 hover:border-white/20 text-sm text-gray-400 hover:text-white transition-all cursor-pointer whitespace-nowrap"
          >
            Back to Login
          </a>
        </div>
        {error.message && (
          <p className="mt-5 text-xs text-gray-600 break-all">{error.message}</p>
        )}
      </div>
    </div>
  );
}