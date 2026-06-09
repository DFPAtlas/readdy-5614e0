'use client';

import Link from 'next/link';

export default function ForbiddenPage() {
  return (
    <div className="min-h-screen bg-[#0B0F1E] flex items-center justify-center px-4">
      <div className="text-center max-w-md">
        <div className="w-20 h-20 rounded-2xl bg-red-500/10 border border-red-500/20 flex items-center justify-center mx-auto mb-6">
          <i className="ri-lock-line text-red-400 text-3xl"></i>
        </div>
        <h1 className="text-4xl font-bold text-white mb-3">403</h1>
        <p className="text-lg text-gray-400 mb-2">Access Denied</p>
        <p className="text-sm text-gray-500 mb-8">
          You do not have permission to access this area. Super admin access is required.
        </p>
        <Link
          href="/dashboard"
          className="inline-flex items-center gap-2 px-6 py-3 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold rounded-lg transition-colors cursor-pointer"
        >
          <i className="ri-arrow-left-line"></i>
          Back to Dashboard
        </Link>
      </div>
    </div>
  );
}