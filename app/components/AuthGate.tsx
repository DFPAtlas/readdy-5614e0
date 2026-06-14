'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth';
import { TablePageSkeleton } from './PageSkeleton';

export default function AuthGate({ children, allowedRoles }: { children: React.ReactNode; allowedRoles?: string[] }) {
  const { currentUser, profile, company, isLoading } = useAuth();
  const router = useRouter();
  const [verified, setVerified] = useState(false);

  useEffect(() => {
    if (isLoading) return;

    if (!currentUser) {
      router.replace('/login');
      return;
    }

    if (allowedRoles && profile && !allowedRoles.includes(profile.role)) {
      const onboardingStatus = company?.onboarding_status;
      if (['super_admin', 'company_admin', 'operations_manager'].includes(profile.role)) {
        if (onboardingStatus === 'pending_setup') {
          router.replace('/dashboard/setup-wizard');
        } else {
          router.replace('/dashboard');
        }
      } else if (profile.role === 'guard') {
        router.replace('/guard');
      } else if (profile.role === 'client') {
        router.replace('/client');
      }
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