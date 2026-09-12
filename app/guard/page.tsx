'use client';

import { useRouter } from 'next/navigation';
import { useGuardAuth } from '@/lib/useGuardAuth';
import { ToastProvider } from '@/lib/guard/ToastContext';
import GuardTopBar from './components/GuardTopBar';
import GuardBottomNav from './components/GuardBottomNav';
import HomeTab from './components/HomeTab';
import PanicButton from './components/PanicButton';
import { GuardPageSkeleton } from '@/app/components/PageSkeleton';

export default function GuardPortalPage() {
  const router = useRouter();
  const g = useGuardAuth();

  if (g.loading || !g.currentUser || !g.profile) {
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

  const siteName = g.isClockedIn
    ? (g.todayShift?.site?.site_name || 'On Site')
    : g.todayShift?.site?.site_name || 'GuardianHub';

  return (
    <ToastProvider>
      <div className="min-h-screen bg-black text-white flex flex-col">
        <GuardTopBar siteName={siteName} />
        <main className="flex-1 pt-14 pb-[72px] overflow-y-auto max-w-lg mx-auto w-full">
          <HomeTab
            todayShift={g.todayShift}
            nextShift={g.nextShift}
            activeAttendance={g.activeAttendance}
            guardId={g.guardId}
            companyId={g.companyId}
            guardName={g.guardName}
            assignedSites={g.assignedSites}
            onRefetch={g.refetch}
          />
        </main>
        <GuardBottomNav />
        {g.isClockedIn && (
          <PanicButton
            companyId={g.companyId}
            siteId={g.todayShift?.site_id || null}
            guardId={g.guardId}
            guardName={g.guardName}
          />
        )}
      </div>
    </ToastProvider>
  );
}