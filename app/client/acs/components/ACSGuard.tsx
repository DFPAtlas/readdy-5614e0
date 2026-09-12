'use client';

import { useRequireEntitlement } from '@/lib/useRequireEntitlement';

export default function ACSGuard({ children }: { children: React.ReactNode }) {
  const { allowed, loading: entGuardLoading } = useRequireEntitlement('hasCompliance');

  if (entGuardLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="w-8 h-8 border-2 border-blue-500/30 border-t-blue-500 rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!allowed) {
    return (
      <div className="flex items-center justify-center py-20">
        <p className="text-gray-400 text-sm">Redirecting to plans...</p>
      </div>
    );
  }

  return <>{children}</>;
}