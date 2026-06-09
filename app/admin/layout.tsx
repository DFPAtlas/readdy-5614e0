import SuperAdminGate from './components/SuperAdminGate';
import AdminShell from './components/AdminShell';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <SuperAdminGate>
      <AdminShell>
        {children}
      </AdminShell>
    </SuperAdminGate>
  );
}