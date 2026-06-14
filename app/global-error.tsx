'use client';

import { useEffect } from 'react';

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('[GlobalError]', error);
  }, [error]);

  return (
    <html lang="en">
      <body className="antialiased bg-[#0a0e1a] text-white" style={{ fontFamily: "ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Arial, sans-serif" }}>
        <div className="min-h-screen flex items-center justify-center p-4">
          <div className="text-center max-w-md">
            <div className="w-16 h-16 rounded-full bg-red-500/10 border border-red-500/20 flex items-center justify-center mx-auto mb-5">
              <i className="ri-error-warning-line text-2xl text-red-400"></i>
            </div>
            <h1 className="text-xl font-bold text-white mb-2">Application Error</h1>
            <p className="text-sm text-gray-400 mb-6">
              A critical error occurred. Please try refreshing the page.
            </p>
            <button
              onClick={reset}
              className="px-6 py-3 rounded-lg bg-blue-600 hover:bg-blue-500 text-sm font-medium text-white transition-colors cursor-pointer whitespace-nowrap"
            >
              Retry
            </button>
          </div>
        </div>
      </body>
    </html>
  );
}