'use client';

import { usePathname } from 'next/navigation';
import { ClientPortalProvider } from '@/lib/useClientPortal';
import { ClientAuthProvider } from '@/lib/useClientAuth';
import ClientNav from './components/ClientNav';
import { useAuth } from '@/lib/auth';
import { useRequireEntitlement } from '@/lib/useRequireEntitlement';
import { ClientPageSkeleton } from '@/app/components/PageSkeleton';
import Footer from '@/app/components/Footer';

function ClientLayoutInner({ children }: { children: React.ReactNode }) {
  const { isLoading } = useAuth();
  const pathname = usePathname();
  const isSignupPage = pathname === '/client/signup';
  const isStandaloneSite = /^\/client\/sites\/(?!new$)[^/]+$/.test(pathname);
  const { allowed, loading: entGuardLoading, redirecting } = useRequireEntitlement('hasClientPortal');
  const guardActive = !isSignupPage;

  const shouldGuard = guardActive && !entGuardLoading && !allowed;
  const showSkeleton = isLoading || (guardActive && entGuardLoading);

  const guardBlock = (
    <div className="flex flex-col items-center justify-center py-20 gap-4">
      <div className="w-16 h-16 rounded-full bg-amber-500/10 border border-amber-500/20 flex items-center justify-center">
        <i className="ri-lock-line text-2xl text-amber-400"></i>
      </div>
      <p className="text-gray-300 text-sm font-medium">Client Portal not available</p>
      <p className="text-gray-500 text-xs">This feature requires the Command plan or above. Please contact your security provider.</p>
    </div>
  );

  if (isStandaloneSite) {
    return (
      <div className="min-h-screen bg-[#0a0e1a]">
        {showSkeleton ? (
          <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6"><ClientPageSkeleton /></div>
        ) : shouldGuard ? (
          <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6">{guardBlock}</div>
        ) : children}
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0a0e1a] flex flex-col">
      <ClientNav />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-6 flex-1">
        {showSkeleton ? <ClientPageSkeleton /> : shouldGuard ? guardBlock : children}
      </main>
      <Footer />
    </div>
  );
}

export default function ClientLayout({ children }: { children: React.ReactNode }) {
  return (
    <ClientAuthProvider>
      <ClientPortalProvider>
        <ClientLayoutInner>{children}</ClientLayoutInner>
      </ClientPortalProvider>
    </ClientAuthProvider>
  );
}