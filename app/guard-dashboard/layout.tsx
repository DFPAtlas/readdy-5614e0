import Footer from '@/app/components/Footer';

export default function GuardDashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      {children}
      <Footer />
    </>
  );
}