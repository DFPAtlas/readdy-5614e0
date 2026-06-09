'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth';
import { ToastProvider } from '@/lib/guard/ToastContext';
import GuardTopBar from '../components/GuardTopBar';
import GuardBottomNav from '../components/GuardBottomNav';
import PatrolTab from '../components/PatrolTab';
import PanicButton from '../components/PanicButton';
import { useGuardPortal } from '@/lib/useGuardPortal';

export default function GuardPatrolPage() {
  const { currentUser, profile, company, isLoading: authLoading } = useAuth();
  const router = useRouter();
  const portal = useGuardPortal(currentUser?.id || null, company?.id || null);

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

  return (
    <ToastProvider>
      <div className="min-h-screen bg-black text-white flex flex-col">
        <GuardTopBar siteName={siteName} />
        <main className="flex-1 pt-14 pb-[72px] overflow-y-auto max-w-lg mx-auto w-full">
          <PatrolTab
            todayShift={portal.todayShift}
            activeAttendance={portal.activeAttendance}
            guardId={portal.guardId}
            companyId={company?.id || null}
          />
        </main>
        <GuardBottomNav />
        {portal.activeAttendance && !portal.activeAttendance.clock_out && (
          <PanicButton
            companyId={company?.id || null}
            siteId={portal.todayShift?.site_id || null}
            guardId={portal.guardId}
            guardName={`${profile?.first_name || ''} ${profile?.last_name || ''}`.trim() || 'Officer'}
          />
        )}
      </div>
    </ToastProvider>
  );
}