'use client';

import { useGuardAuth } from '@/lib/useGuardAuth';
import { ToastProvider } from '@/lib/guard/ToastContext';
import GuardTopBar from '../components/GuardTopBar';
import GuardBottomNav from '../components/GuardBottomNav';
import GuardNoticesView from '../components/GuardNoticesView';

export default function GuardNoticesPage() {
  const g = useGuardAuth();

  if (g.loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <i className="ri-loader-4-line animate-spin text-[#3b82f6] text-2xl"></i>
      </div>
    );
  }

  return (
    <ToastProvider>
      <div className="min-h-screen bg-black text-white flex flex-col">
        <GuardTopBar siteName={g.todayShift?.site?.site_name || 'GuardianHub'} />
        <main className="flex-1 pt-14 pb-[72px] overflow-y-auto max-w-lg mx-auto w-full">
          <GuardNoticesView />
        </main>
        <GuardBottomNav />
      </div>
    </ToastProvider>
  );
}