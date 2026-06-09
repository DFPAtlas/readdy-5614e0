'use client';

import { useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth';

export default function SuperAdminGate({ children }: { children: React.ReactNode }) {
  const { profile, isLoading } = useAuth();
  const hasRedirected = useRef(false);
  const router = useRouter();

  useEffect(() => {
    if (hasRedirected.current) return;
    if (!isLoading && (!profile || profile.role !== 'super_admin')) {
      hasRedirected.current = true;
      router.push('/dashboard');
    }
  }, [profile, isLoading, router]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#0B0F1E] flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="relative flex h-8 w-8">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-8 w-8 bg-indigo-500"></span>
          </div>
          <p className="text-xs text-gray-500">Authenticating...</p>
        </div>
      </div>
    );
  }

  if (!profile || profile.role !== 'super_admin') {
    return (
      <div className="min-h-screen bg-[#0B0F1E] flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 flex items-center justify-center mx-auto mb-4 text-red-400">
            <i className="ri-lock-line text-3xl"></i>
          </div>
          <h2 className="text-lg font-semibold text-white mb-1">Access Denied</h2>
          <p className="text-sm text-gray-400">Super admin access required.</p>
          <p className="text-xs text-gray-500 mt-2">Redirecting...</p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}