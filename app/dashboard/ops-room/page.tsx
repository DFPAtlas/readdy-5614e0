'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function OpsRoomRedirect() {
  const router = useRouter();
  useEffect(() => {
    router.replace('/dashboard/command-centre');
  }, [router]);
  return (
    <div className="min-h-screen bg-[#050812] flex items-center justify-center">
      <p className="text-sm text-gray-500">Redirecting to Command Centre...</p>
    </div>
  );
}