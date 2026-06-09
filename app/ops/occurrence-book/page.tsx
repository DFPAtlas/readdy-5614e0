'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function OccurrenceBookRedirect() {
  const router = useRouter();
  useEffect(() => { router.replace('/ops/forms'); }, [router]);
  return null;
}