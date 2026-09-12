'use client';

import { useEffect, useState } from 'react';
import { useGuardAuth } from '@/lib/useGuardAuth';
import { ToastProvider } from '@/lib/guard/ToastContext';
import GuardTopBar from '../components/GuardTopBar';
import GuardBottomNav from '../components/GuardBottomNav';
import SOPAssistantChat from '@/app/components/SOPAssistantChat';

export default function GuardAssistantPage() {
  const g = useGuardAuth();
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768);
    check();
    window.addEventListener('resize', check);
    return () => window.removeEventListener('resize', check);
  }, []);

  if (g.loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <i className="ri-loader-4-line animate-spin text-[#3b82f6] text-2xl"></i>
      </div>
    );
  }

  const siteName = g.isClockedIn
    ? (g.todayShift?.site?.site_name || 'On Site')
    : g.todayShift?.site?.site_name || 'GuardianHub';

  const activeSiteId = g.isClockedIn && g.todayShift
    ? g.todayShift.site_id
    : null;

  return (
    <ToastProvider>
      <div className="min-h-screen bg-black text-white flex flex-col">
        <GuardTopBar siteName={siteName} />
        <main className="flex-1 pt-14 pb-[72px] overflow-hidden max-w-lg mx-auto w-full">
          <div className="h-full px-2 pt-2 pb-0">
            <SOPAssistantChat
              siteId={activeSiteId}
              siteName={g.todayShift?.site?.site_name || null}
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