'use client';

import DashboardShell from '@/app/dashboard/components/DashboardShell';
import Footer from '@/app/components/Footer';

export default function OccurrenceBookLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <DashboardShell>{children}</DashboardShell>
      <Footer />
    </>
  );
}