'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function OperationsCommandRedirect() {
  const router = useRouter();
  useEffect(() => {
    router.replace('/dashboard/command-centre');
  }, [router]);
  return (
    <div className="min-h-screen bg-[#080c16] flex items-center justify-center">
      <p className="text-sm text-gray-500">Redirecting to Command Centre...</p>
    </div>
  );
}