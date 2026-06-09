'use client';

import OpsShell from '@/app/components/OpsShell';

export default function IncidentsLayout({ children }: { children: React.ReactNode }) {
  return <OpsShell>{children}</OpsShell>;
}