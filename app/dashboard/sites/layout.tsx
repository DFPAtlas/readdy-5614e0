import SiteDashboardNav from './components/SiteDashboardNav';

export default function SiteDashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-[#0a0e1a] flex flex-col">
      <SiteDashboardNav />
      <div className="flex-1">
        {children}
      </div>
    </div>
  );
}