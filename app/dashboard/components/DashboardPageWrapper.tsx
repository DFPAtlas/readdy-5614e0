'use client';

import { usePathname } from 'next/navigation';
import PageErrorBoundary from '@/components/dashboard/PageErrorBoundary';

export default function DashboardPageWrapper({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const pageName = pathname
    ? pathname.split('/').filter(Boolean).join(' / ').replace(/-/g, ' ')
    : 'Dashboard';

  return (
    <PageErrorBoundary pageName={pageName}>
      {children}
    </PageErrorBoundary>
  );
}