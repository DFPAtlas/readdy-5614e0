'use client';

import { useGuardAuth } from '@/lib/useGuardAuth';
import { ToastProvider } from '@/lib/guard/ToastContext';
import GuardTopBar from '../components/GuardTopBar';
import GuardBottomNav from '../components/GuardBottomNav';
import MenuTab from '../components/MenuTab';

export default function GuardMenuPage() {
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
        <GuardTopBar />
        <main className="flex-1 pt-14 pb-[72px] overflow-y-auto max-w-lg mx-auto w-full">
          <MenuTab />
        </main>
        <GuardBottomNav />
      </div>
    </ToastProvider>
  );
}