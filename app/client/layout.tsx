'use client';

import { ClientPortalProvider } from '@/lib/useClientPortal';
import ClientNav from './components/ClientNav';
import { useAuth } from '@/lib/auth';
import { ClientPageSkeleton } from '@/app/components/PageSkeleton';

function ClientLayoutInner({ children }: { children: React.ReactNode }) {
  const { isLoading } = useAuth();

  return (
    <div className="min-h-screen bg-[#0a0e1a]">
      <ClientNav />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-6">
        {isLoading ? <ClientPageSkeleton /> : children}
      </main>
    </div>
  );
}

export default function ClientLayout({ children }: { children: React.ReactNode }) {
  return (
    <ClientPortalProvider>
      <ClientLayoutInner>{children}</ClientLayoutInner>
    </ClientPortalProvider>
  );
}