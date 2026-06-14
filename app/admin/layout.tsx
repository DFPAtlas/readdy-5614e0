import SuperAdminGate from './components/SuperAdminGate';
import AdminShell from './components/AdminShell';
import Footer from '@/app/components/Footer';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <SuperAdminGate>
      <AdminShell>
        {children}
      </AdminShell>
      <Footer />
    </SuperAdminGate>
  );
}