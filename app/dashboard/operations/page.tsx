'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function OperationsRedirect() {
  const router = useRouter();
  useEffect(() => {
    router.replace('/dashboard/staff');
  }, [router]);
  return null;
}