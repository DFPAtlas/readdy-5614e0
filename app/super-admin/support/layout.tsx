'use client';

import SuperAdminGate from '../../admin/components/SuperAdminGate';
import AdminShell from '../../admin/components/AdminShell';
import Footer from '@/app/components/Footer';

export default function SupportLayout({ children }: { children: React.ReactNode }) {
  return (
    <SuperAdminGate>
      <AdminShell>
        <div className="p-4 lg:p-6 max-w-7xl mx-auto">
          {children}
        </div>
      </AdminShell>
      <Footer />
    </SuperAdminGate>
  );
}