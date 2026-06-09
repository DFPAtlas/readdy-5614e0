'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth';
import { ToastProvider } from '@/lib/guard/ToastContext';
import GuardTopBar from '../components/GuardTopBar';
import GuardBottomNav from '../components/GuardBottomNav';
import SOPAssistantChat from '@/app/components/SOPAssistantChat';
import { useGuardPortal } from '@/lib/useGuardPortal';

export default function GuardAssistantPage() {
  const { currentUser, profile, company, isLoading: authLoading } = useAuth();
  const router = useRouter();
  const portal = useGuardPortal(currentUser?.id || null, company?.id || null);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768);
    check();
    window.addEventListener('resize', check);
    return () => window.removeEventListener('resize', check);
  }, []);

  useEffect(() => {
    if (!authLoading && !currentUser) {
      router.replace('/login/guard');
    }
    if (!authLoading && profile && profile.role !== 'guard') {
      router.replace('/dashboard');
    }
  }, [currentUser, profile, authLoading, router]);

  if (authLoading || !currentUser || !profile || portal.loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <i className="ri-loader-4-line animate-spin text-[#3b82f6] text-2xl"></i>
      </div>
    );
  }

  const siteName = portal.activeAttendance
    ? (portal.todayShift?.site?.site_name || 'On Site')
    : portal.todayShift?.site?.site_name || 'GuardianHub';

  const activeSiteId = portal.activeAttendance && portal.todayShift
    ? portal.todayShift.site_id
    : null;

  return (
    <ToastProvider>
      <div className="min-h-screen bg-black text-white flex flex-col">
        <GuardTopBar siteName={siteName} />
        <main className="flex-1 pt-14 pb-[72px] overflow-hidden max-w-lg mx-auto w-full">
          <div className="h-full px-2 pt-2 pb-0">
            <SOPAssistantChat
              siteId={activeSiteId}
              siteName={portal.todayShift?.site?.site_name || null}
              theme="dark"
              enableVoice={isMobile}
              compact={false}
            />
          </div>
        </main>
        <GuardBottomNav />
      </div>
    </ToastProvider>
  );
}