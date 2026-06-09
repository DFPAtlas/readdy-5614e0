import DashboardShell from './components/DashboardShell';
import { PanicModeProvider } from './components/PanicModeContext';
import PanicModeOverlay from './components/PanicModeOverlay';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <PanicModeProvider>
      <DashboardShell>
        {children}
      </DashboardShell>
      <PanicModeOverlay />
    </PanicModeProvider>
  );
}