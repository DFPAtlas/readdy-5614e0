'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth';
import { useGuardPortal } from '@/lib/useGuardPortal';
import type { GuardShift, AttendanceLog, PatrolLog, GuardAssignedSite } from '@/lib/useGuardPortal';

export interface GuardAuthState {
  currentUser: any;
  profile: any;
  company: any;
  companyId: string | null;
  guardId: string | null;
  todayShift: GuardShift | null;
  nextShift: GuardShift | null;
  activeAttendance: AttendanceLog | null;
  activePatrol: PatrolLog | null;
  isClockedIn: boolean;
  guardName: string;
  authLoading: boolean;
  portalLoading: boolean;
  loading: boolean;
  assignedSites: GuardAssignedSite[];
  refetch: () => void;
}

export function useGuardAuth(): GuardAuthState {
  const { currentUser, profile, company, isLoading: authLoading } = useAuth();
  const router = useRouter();
  const portal = useGuardPortal(currentUser?.id || null, company?.id || null);

  useEffect(() => {
    if (!authLoading && !currentUser) {
      try { router.replace('/login/guard'); } catch { window.location.href = '/login/guard'; }
      return;
    }
    if (!authLoading && profile && profile.role !== 'guard') {
      if (['super_admin', 'company_admin', 'operations_manager'].includes(profile.role || '')) {
        try { router.replace('/dashboard'); } catch { window.location.href = '/dashboard'; }
      } else if (profile.role === 'client') {
        try { router.replace('/client'); } catch { window.location.href = '/client'; }
      } else {
        try { router.replace('/login/guard'); } catch { window.location.href = '/login/guard'; }
      }
    }
  }, [currentUser, profile, authLoading, router]);

  const isClockedIn = !!portal.activeAttendance && !portal.activeAttendance.clock_out;
  const guardName = `${profile?.first_name || ''} ${profile?.last_name || ''}`.trim() || 'Officer';

  return {
    currentUser,
    profile,
    company,
    companyId: company?.id || null,
    guardId: portal.guardId,
    todayShift: portal.todayShift,
    nextShift: portal.nextShift,
    activeAttendance: portal.activeAttendance,
    activePatrol: portal.activePatrol,
    isClockedIn,
    guardName,
    authLoading,
    portalLoading: portal.loading,
    loading: authLoading || portal.loading,
    assignedSites: portal.assignedSites,
    refetch: portal.refetch,
  };
}