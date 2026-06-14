'use client';

import OpsShell from '@/app/components/OpsShell';
import Footer from '@/app/components/Footer';

export default function IncidentsLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <OpsShell>{children}</OpsShell>
      <Footer />
    </>
  );
}