'use client';

import { useEffect } from 'react';

export default function SetupRedirect() {
  useEffect(() => {
    window.location.replace('/dashboard/setup-wizard');
  }, []);

  return (
    <div className="min-h-screen bg-[#0b0f19] flex items-center justify-center">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
    </div>
  );
}