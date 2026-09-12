'use client';

import { useState } from 'react';
import { useGuardAuth } from '@/lib/useGuardAuth';
import { ToastProvider, useToast } from '@/lib/guard/ToastContext';
import GuardTopBar from '../components/GuardTopBar';
import GuardBottomNav from '../components/GuardBottomNav';
import IncidentFlow from '../components/IncidentFlow';
import PanicButton from '../components/PanicButton';

function IncidentPageInner() {
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
        <IncidentFlow
          todayShift={g.todayShift}
          guardId={g.guardId}
          companyId={g.companyId}
          guardName={g.guardName}
          onSubmitted={() => showToast('Incident reported', 'success')}
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
  );
}

export default function GuardIncidentPage() {
  return (
    <ToastProvider>
      <IncidentPageInner />
    </ToastProvider>
  );
}