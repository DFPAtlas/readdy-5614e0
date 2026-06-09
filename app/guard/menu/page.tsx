'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth';
import { ToastProvider } from '@/lib/guard/ToastContext';
import GuardTopBar from '../components/GuardTopBar';
import GuardBottomNav from '../components/GuardBottomNav';
import MenuTab from '../components/MenuTab';

export default function GuardMenuPage() {
  const { currentUser, profile, isLoading: authLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!authLoading && !currentUser) {
      router.replace('/login/guard');
    }
    if (!authLoading && profile && profile.role !== 'guard') {
      router.replace('/dashboard');
    }
  }, [currentUser, profile, authLoading, router]);

  if (authLoading || !currentUser || !profile) {
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