'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth';

export default function OpsRedirect() {
  const router = useRouter();
  const { role } = useAuth();

  useEffect(() => {
    try {
      if (role === 'super_admin') {
        router.replace('/admin');
      } else {
        router.replace('/dashboard');
      }
    } catch {
      if (role === 'super_admin') window.location.href = '/admin';
      else window.location.href = '/dashboard';
    }
  }, [router, role]);

  return null;
}