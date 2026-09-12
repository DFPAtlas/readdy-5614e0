import DashboardShell from './components/DashboardShell';
import DashboardPageWrapper from './components/DashboardPageWrapper';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <DashboardShell>
      <DashboardPageWrapper>{children}</DashboardPageWrapper>
    </DashboardShell>
  );
}