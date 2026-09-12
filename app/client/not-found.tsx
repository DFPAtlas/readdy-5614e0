'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function ClientNotFound() {
  const pathname = usePathname();

  return (
    <div className="min-h-screen bg-[#0a0e1a] flex items-center justify-center">
      <div className="text-center max-w-md mx-auto px-4">
        <div className="w-20 h-20 rounded-full bg-amber-500/10 border border-amber-500/20 flex items-center justify-center mx-auto mb-6">
          <i className="ri-forbid-line text-3xl text-amber-400"></i>
        </div>
        <h1 className="text-2xl font-bold text-white mb-2">Page Not Found</h1>
        <p className="text-sm text-gray-400 mb-1">
          The client page you&apos;re looking for doesn&apos;t exist.
        </p>
        <p className="text-xs text-gray-600 mb-6 font-mono break-all">{pathname}</p>
        <div className="flex items-center justify-center gap-3">
          <Link
            href="/client"
            className="px-5 py-2.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-sm font-medium text-white transition-colors cursor-pointer whitespace-nowrap"
          >
            Client Overview
          </Link>
          <Link
            href="/"
            className="px-5 py-2.5 rounded-lg bg-white/5 border border-white/10 hover:border-white/20 text-sm text-gray-400 hover:text-white transition-all cursor-pointer whitespace-nowrap"
          >
            Go Home
          </Link>
        </div>
      </div>
    </div>
  );
}