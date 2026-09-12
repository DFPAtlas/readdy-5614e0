'use client';

import { Suspense } from 'react';
import { useGuardAuth } from '@/lib/useGuardAuth';
import { ToastProvider } from '@/lib/guard/ToastContext';
import GuardTopBar from '../components/GuardTopBar';
import GuardBottomNav from '../components/GuardBottomNav';
import PatrolTab from '../components/PatrolTab';
import PanicButton from '../components/PanicButton';

function PatrolContent() {
  const g = useGuardAuth();

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

  return (
    <ToastProvider>
      <div className="min-h-screen bg-black text-white flex flex-col">
        <GuardTopBar siteName={siteName} />
        <main className="flex-1 pt-14 pb-[72px] overflow-y-auto max-w-lg mx-auto w-full">
          <PatrolTab
            todayShift={g.todayShift}
            activeAttendance={g.activeAttendance}
            guardId={g.guardId}
            companyId={g.companyId}
            activePatrolId={g.activePatrol?.id || null}
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

export default function GuardPatrolPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-black flex items-center justify-center">
        <i className="ri-loader-4-line animate-spin text-[#3b82f6] text-2xl"></i>
      </div>
    }>
      <PatrolContent />
    </Suspense>
  );
}