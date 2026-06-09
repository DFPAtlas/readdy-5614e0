'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/lib/auth';

const navItems = [
  { label: 'Guard Dashboard', href: '/guard-dashboard', icon: 'ri-shield-user-line' },
  { label: 'Site Management', href: '/guard-dashboard/overrule', icon: 'ri-settings-3-line' },
];

export default function GuardDashboardShell({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [mobileOpen, setMobileOpen] = useState(false);
  const pathname = usePathname();
  const { profile, signOut } = useAuth();

  const initials = (profile?.first_name?.[0] || '') + (profile?.last_name?.[0] || '') || 'G';
  const fullName = `${profile?.first_name || ''} ${profile?.last_name || ''}`.trim() || 'Guard';

  const isActive = (href: string) => {
    if (!pathname) return false;
    if (pathname === href) return true;
    if (href === '/guard-dashboard') return pathname === '/guard-dashboard';
    return pathname.startsWith(href + '/');
  };

  return (
    <div className="flex h-screen bg-[#0a0e1a] overflow-hidden">
      {mobileOpen && (
        <div className="fixed inset-0 bg-black/60 z-40 lg:hidden" onClick={() => setMobileOpen(false)} />
      )}

      <aside
        className={`fixed lg:static z-50 h-full bg-[#111827] border-r border-gray-800 transition-all duration-300 ${
          sidebarOpen ? 'w-64' : 'w-20'
        } ${mobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}
      >
        <style>{`
          .guard-sidebar-scroll::-webkit-scrollbar { width: 5px; }
          .guard-sidebar-scroll::-webkit-scrollbar-track { background: transparent; }
          .guard-sidebar-scroll::-webkit-scrollbar-thumb { background: #2e3652; border-radius: 9999px; }
          .guard-sidebar-scroll::-webkit-scrollbar-thumb:hover { background: #4f5b85; }
          .guard-main-scroll::-webkit-scrollbar { width: 6px; }
          .guard-main-scroll::-webkit-scrollbar-track { background: transparent; }
          .guard-main-scroll::-webkit-scrollbar-thumb { background: #1e2845; border-radius: 9999px; }
          .guard-main-scroll::-webkit-scrollbar-thumb:hover { background: #2e3a5e; }
          .guard-main-scroll { scrollbar-width: thin; scrollbar-color: #1e2845 transparent; }
          .guard-sidebar-scroll { scrollbar-width: thin; scrollbar-color: #2e3652 transparent; }
        `}</style>
        <div className="flex flex-col h-full">
          <div className="flex items-center h-16 px-4 border-b border-gray-800">
            <Link href="/guard-dashboard" className="flex items-center gap-3 overflow-hidden whitespace-nowrap">
              <img
                src="https://storage.readdy-site.link/project_files/18288eee-63fa-4165-a658-6aa7ab020255/2992892a-9422-4f3e-b9ae-878e394ccda7_guradian-hub-logo.png?v=d41d8cd98f00b204e9800998ecf8427e"
                alt="GuardianHub"
                className="h-8 w-auto"
              />
            </Link>
          </div>

          <nav className="guard-sidebar-scroll flex-1 px-3 py-4 space-y-1 overflow-y-auto">
            {navItems.map((item) => {
              const active = isActive(item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setMobileOpen(false)}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all whitespace-nowrap ${
                    active
                      ? 'bg-blue-600/15 text-blue-400'
                      : 'text-gray-400 hover:text-white hover:bg-gray-800/50'
                  }`}
                >
                  <div className="w-5 h-5 flex items-center justify-center flex-shrink-0">
                    <i className={item.icon}></i>
                  </div>
                  <span className={`transition-opacity ${sidebarOpen ? 'opacity-100' : 'opacity-0 lg:hidden'}`}>
                    {item.label}
                  </span>
                </Link>
              );
            })}
          </nav>

          <div className="px-3 py-4 border-t border-gray-800">
            <button
              onClick={signOut}
              className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-gray-400 hover:text-red-400 hover:bg-gray-800/50 transition-all w-full whitespace-nowrap"
            >
              <div className="w-5 h-5 flex items-center justify-center flex-shrink-0">
                <i className="ri-logout-box-line"></i>
              </div>
              <span className={`transition-opacity ${sidebarOpen ? 'opacity-100' : 'opacity-0 lg:hidden'}`}>
                Sign Out
              </span>
            </button>
          </div>
        </div>
      </aside>

      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <header className="h-16 bg-[#111827] border-b border-gray-800 flex items-center justify-between px-4 lg:px-6 flex-shrink-0">
          <div className="flex items-center gap-3">
            <button
              onClick={() =>
                typeof window !== 'undefined' && window.innerWidth < 1024
                  ? setMobileOpen(!mobileOpen)
                  : setSidebarOpen(!sidebarOpen)
              }
              className="w-9 h-9 flex items-center justify-center text-gray-400 hover:text-white transition-colors cursor-pointer"
            >
              <div className="w-5 h-5 flex items-center justify-center">
                <i className="ri-menu-line"></i>
              </div>
            </button>
            <div className="hidden md:flex items-center text-sm text-gray-400">
              <div className="w-4 h-4 flex items-center justify-center mr-1.5">
                <i className="ri-shield-user-line"></i>
              </div>
              Guard Portal
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 pl-2 border-l border-gray-700">
              <div className="w-8 h-8 rounded-full bg-blue-600/20 flex items-center justify-center text-blue-400 text-sm font-semibold">
                {initials}
              </div>
              <div className="hidden md:block text-left">
                <p className="text-sm font-medium text-white">{fullName}</p>
                <p className="text-xs text-gray-500">Security Guard</p>
              </div>
            </div>
          </div>
        </header>

        <main className="guard-main-scroll flex-1 overflow-y-auto p-4 lg:p-6">{children}</main>
      </div>
    </div>
  );
}