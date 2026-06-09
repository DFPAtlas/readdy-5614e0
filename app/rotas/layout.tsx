'use client';

import OpsShell from '@/app/components/OpsShell';

export default function RotasLayout({ children }: { children: React.ReactNode }) {
  return <OpsShell>{children}</OpsShell>;
}