import { PanicModeProvider } from '../components/PanicModeContext';
import PanicModeOverlay from '../components/PanicModeOverlay';
import Footer from '@/app/components/Footer';

export default function OpsRoomLayout({ children }: { children: React.ReactNode }) {
  return (
    <PanicModeProvider>
      {children}
      <Footer />
      <PanicModeOverlay />
    </PanicModeProvider>
  );
}