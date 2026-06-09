'use client';

import DashboardShell from '@/app/dashboard/components/DashboardShell';

export default function OccurrenceBookLayout({ children }: { children: React.ReactNode }) {
  return <DashboardShell>{children}</DashboardShell>;
}