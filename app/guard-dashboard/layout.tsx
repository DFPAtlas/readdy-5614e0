import GuardDashboardShell from './components/GuardDashboardShell';

export default function GuardDashboardLayout({ children }: { children: React.ReactNode }) {
  return <GuardDashboardShell>{children}</GuardDashboardShell>;
}