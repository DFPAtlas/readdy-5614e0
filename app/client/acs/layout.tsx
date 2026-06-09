'use client';

import { ACSProvider } from '@/lib/useACS';
import ACSNav from './components/ACSNav';

export default function ACSLayout({ children }: { children: React.ReactNode }) {
  return (
    <ACSProvider>
      <div className="space-y-4">
        <ACSNav />
        {children}
      </div>
    </ACSProvider>
  );
}