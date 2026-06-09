import { PanicModeProvider } from '../components/PanicModeContext';
import PanicModeOverlay from '../components/PanicModeOverlay';

export default function OpsRoomLayout({ children }: { children: React.ReactNode }) {
  return (
    <PanicModeProvider>
      {children}
      <PanicModeOverlay />
    </PanicModeProvider>
  );
}