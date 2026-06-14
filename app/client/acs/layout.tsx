import Footer from '@/app/components/Footer';
import ACSNav from './components/ACSNav';

export default function ACSLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-[#0a0e1a] flex flex-col">
      <ACSNav />
      <main className="flex-1">
        {children}
      </main>
      <Footer />
    </div>
  );
}