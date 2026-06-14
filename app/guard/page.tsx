'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth';
import { ToastProvider } from '@/lib/guard/ToastContext';
import GuardTopBar from './components/GuardTopBar';
import GuardBottomNav from './components/GuardBottomNav';
import HomeTab from './components/HomeTab';
import PanicButton from './components/PanicButton';
import { useGuardPortal } from '@/lib/useGuardPortal';
import { GuardPageSkeleton } from '@/app/components/PageSkeleton';

export default function GuardPortalPage() {
  const { currentUser, profile, company, isLoading: authLoading } = useAuth();
  const router = useRouter();
  const portal = useGuardPortal(currentUser?.id || null, company?.id || null);

  useEffect(() => {
    if (!authLoading && !currentUser) {
      try { router.replace('/login/guard'); } catch { window.location.href = '/login/guard'; }
    }
    if (!authLoading && profile && profile.role !== 'guard') {
      if (['super_admin', 'company_admin', 'operations_manager'].includes(profile.role || '')) {
        try { router.replace('/dashboard'); } catch { window.location.href = '/dashboard'; }
      } else if (profile.role === 'client') {
        try { router.replace('/client'); } catch { window.location.href = '/client'; }
      }
    }
  }, [currentUser, profile, authLoading, router]);

  if (authLoading || !currentUser || !profile || portal.loading) {
    return (
      <div className="min-h-screen bg-black text-white flex flex-col">
        <GuardTopBar siteName="GuardianHub" />
        <main className="flex-1 pt-14 pb-[72px] overflow-y-auto">
          <GuardPageSkeleton />
        </main>
        <GuardBottomNav />
      </div>
    );
  }

  if (profile.role !== 'guard') return null;

  const siteName = portal.activeAttendance
    ? (portal.todayShift?.site?.site_name || 'On Site')
    : portal.todayShift?.site?.site_name || 'GuardianHub';

  return (
    <ToastProvider>
      <div className="min-h-screen bg-black text-white flex flex-col">
        <GuardTopBar siteName={siteName} />
        <main className="flex-1 pt-14 pb-[72px] overflow-y-auto max-w-lg mx-auto w-full">
          <HomeTab
            todayShift={portal.todayShift}
            nextShift={portal.nextShift}
            activeAttendance={portal.activeAttendance}
            guardId={portal.guardId}
            companyId={company?.id || null}
            guardName={`${profile?.first_name || ''} ${profile?.last_name || ''}`.trim() || 'Officer'}
            onRefetch={portal.refetch}
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