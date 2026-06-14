import OpsShell from '@/app/components/OpsShell';
import Footer from '@/app/components/Footer';

export default function OpsLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <OpsShell>{children}</OpsShell>
      <Footer />
    </>
  );
}