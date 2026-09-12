'use client';

import OpsShell from '@/app/components/OpsShell';
import Footer from '@/app/components/Footer';

export default function OccurrenceBookLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <OpsShell>{children}</OpsShell>
      <Footer />
    </>
  );
}