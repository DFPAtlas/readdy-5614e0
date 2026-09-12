'use client';

import { useGuardAuth } from '@/lib/useGuardAuth';
import { ToastProvider, useToast } from '@/lib/guard/ToastContext';
import GuardTopBar from '../components/GuardTopBar';
import GuardBottomNav from '../components/GuardBottomNav';
import OBEntryFlow from '../components/OBEntryFlow';

function OBPageInner() {
  const g = useGuardAuth();
  const { showToast } = useToast();

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
    <div className="min-h-screen bg-black text-white flex flex-col">
      <GuardTopBar siteName={siteName} />
      <main className="flex-1 pt-14 pb-[72px] overflow-y-auto max-w-lg mx-auto w-full">
        <OBEntryFlow
          todayShift={g.todayShift}
          guardId={g.guardId}
          companyId={g.companyId}
          guardName={g.guardName}
          activeAttendanceId={g.activeAttendance?.id || null}
          onSubmitted={() => showToast('Entry saved', 'success')}
        />
      </main>
      <GuardBottomNav />
    </div>
  );
}

export default function GuardOBPage() {
  return (
    <ToastProvider>
      <OBPageInner />
    </ToastProvider>
  );
}