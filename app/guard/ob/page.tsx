'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth';
import { ToastProvider, useToast } from '@/lib/guard/ToastContext';
import GuardTopBar from '../components/GuardTopBar';
import GuardBottomNav from '../components/GuardBottomNav';
import OBEntryFlow from '../components/OBEntryFlow';
import { useGuardPortal } from '@/lib/useGuardPortal';

function OBPageInner() {
  const { currentUser, profile, company, isLoading: authLoading } = useAuth();
  const router = useRouter();
  const portal = useGuardPortal(currentUser?.id || null, company?.id || null);
  const { showToast } = useToast();

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
    <div className="min-h-screen bg-black text-white flex flex-col">
      <GuardTopBar siteName={siteName} />
      <main className="flex-1 pt-14 pb-[72px] overflow-y-auto max-w-lg mx-auto w-full">
        <OBEntryFlow
          todayShift={portal.todayShift}
          guardId={portal.guardId}
          companyId={company?.id || null}
          guardName={`${profile?.first_name || ''} ${profile?.last_name || ''}`.trim() || 'Officer'}
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