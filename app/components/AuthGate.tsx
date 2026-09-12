'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth';
import { getRoleHome, getOnboardingRoute } from '@/lib/redirect';
import { checkAccountAccess } from '@/lib/accountStatus';
import { TablePageSkeleton } from './PageSkeleton';

export default function AuthGate({ children, allowedRoles }: { children: React.ReactNode; allowedRoles?: string[] }) {
  const { currentUser, profile, company, isLoading } = useAuth();
  const router = useRouter();
  const [verified, setVerified] = useState(false);

  useEffect(() => {
    if (isLoading) return;

    if (!currentUser || !profile) {
      router.replace('/login');
      return;
    }

    const accountCheck = checkAccountAccess(profile.status, company?.account_status);
    if (!accountCheck.allowed) {
      router.replace(accountCheck.redirectTo || '/login');
      return;
    }

    if (allowedRoles && !allowedRoles.includes(profile.role)) {
      const onboardingRoute = getOnboardingRoute(profile.role, company?.onboarding_status);
      router.replace(onboardingRoute || getRoleHome(profile.role));
      return;
    }

    setVerified(true);
  }, [currentUser, profile, company, isLoading, router, allowedRoles]);

  if (isLoading || !verified) {
    return (
      <div className="min-h-screen bg-[#0b0f19] p-6 lg:p-8">
        <TablePageSkeleton />
      </div>
    );
  }

  if (!currentUser) return null;
  if (allowedRoles && profile && !allowedRoles.includes(profile.role)) return null;

  return <>{children}</>;
}