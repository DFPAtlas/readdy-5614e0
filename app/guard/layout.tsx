'use client';

import { useAuth } from '@/lib/auth';
import { useRouter, usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import Footer from '@/app/components/Footer';
import PwaSetup from '@/components/GuardPwaSetup';
import OfflineSyncBanner from './components/OfflineSyncBanner';
import GuardFirstRunAcknowledgements from './components/GuardFirstRunAcknowledgements';
import { useNetworkStatus } from '@/lib/useNetworkStatus';

export default function GuardLayout({ children }: { children: React.ReactNode }) {
  const { currentUser, profile, isLoading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [allowed, setAllowed] = useState(false);
  const { isOnline } = useNetworkStatus();

  useEffect(() => {
    if (isLoading) return;

    if (!currentUser) {
      router.replace('/login/guard');
      return;
    }

    if (profile && profile.role !== 'guard') {
      if (['super_admin', 'company_admin', 'operations_manager'].includes(profile.role || '')) {
        router.replace('/dashboard');
      } else if (profile.role === 'client') {
        router.replace('/client');
      } else {
        router.replace('/login/guard');
      }
      return;
    }

    setAllowed(true);
  }, [currentUser, profile, isLoading, router]);

  if (isLoading || !allowed) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <i className="ri-loader-4-line animate-spin text-[#3b82f6] text-2xl"></i>
      </div>
    );
  }

  const isSosScreen = pathname?.startsWith('/guard/sos');

  return (
    <PwaSetup>
      <OfflineSyncBanner isOnline={isOnline} />
      {children}
      {!isSosScreen && <GuardFirstRunAcknowledgements />}
      <Footer />
    </PwaSetup>
  );
}