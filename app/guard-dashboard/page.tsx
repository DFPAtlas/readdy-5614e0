'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function GuardDashboardRedirect() {
  const router = useRouter();

  useEffect(() => {
    router.replace('/guard');
  }, [router]);

  return (
    <div className="min-h-screen bg-black flex items-center justify-center">
      <div className="flex flex-col items-center gap-3">
        <div className="relative flex h-8 w-8">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
          <span className="relative inline-flex rounded-full h-8 w-8 bg-blue-500"></span>
        </div>
        <p className="text-sm text-gray-400">Redirecting to Guard Portal...</p>
      </div>
    </div>
  );
}