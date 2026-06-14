'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function OnboardingRedirect() {
  const router = useRouter();

  useEffect(() => {
    router.replace('/dashboard/setup-wizard');
    setTimeout(() => {
      window.location.href = '/dashboard/setup-wizard';
    }, 400);
  }, [router]);

  return (
    <div className="min-h-screen bg-[#0b0f19] flex items-center justify-center">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
    </div>
  );
}