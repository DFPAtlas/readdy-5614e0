import Footer from '@/app/components/Footer';

export default function GuardLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      {children}
      <Footer />
    </>
  );
}