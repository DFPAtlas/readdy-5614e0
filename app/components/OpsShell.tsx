'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/lib/auth';
import { useMyPermissions } from '@/lib/usePermissions';
import SOPAssistantWidget from '@/app/components/SOPAssistantWidget';
import NotificationBell from '@/app/components/NotificationBell';
import { usePendingLeave } from '@/lib/usePendingLeave';
import { TablePageSkeleton } from './PageSkeleton';

const navItems = [
  { label: 'Dashboard', href: '/ops', icon: 'ri-dashboard-line', perm: 'dashboard' },
  { label: 'Sites', href: '/ops/sites', icon: 'ri-building-line', perm: 'sites' },
  { label: 'Notices', href: '/dashboard/notices', icon: 'ri-notification-3-line', perm: 'sites' },
  { label: 'Guards', href: '/ops/guards', icon: 'ri-shield-user-line', perm: 'staff' },
  { label: 'Availability', href: '/ops/guards/availability', icon: 'ri-calendar-check-line', perm: 'staff' },
  { label: 'Leave Approval', href: '/ops/guards/leave-approval', icon: 'ri-calendar-close-line', perm: 'staff', badge: true },
  { label: 'Leave Requests', href: '/dashboard/leave-requests', icon: 'ri-hand-heart-line', perm: 'staff' },
  { label: 'Rotas', href: '/rotas', icon: 'ri-calendar-event-line', perm: 'rotas' },
  { label: 'Pattern Builder', href: '/rotas/patterns', icon: 'ri-stack-line', perm: 'shift_patterns' },
  { label: 'Incidents', href: '/ops/incidents', icon: 'ri-alarm-warning-line', perm: 'incidents' },
  { label: 'Forms', href: '/ops/forms', icon: 'ri-file-list-line', perm: 'occurrence_book' },
  { label: 'Reports', href: '/ops/reports', icon: 'ri-bar-chart-box-line', perm: 'reports' },
  { label: 'SOP Builder', href: '/sop-builder', icon: 'ri-draft-line', perm: 'sop_documents' },
  { label: 'SOP Library', href: '/ops/sops', icon: 'ri-book-open-line', perm: 'sop_documents' },
  { label: 'Settings', href: '/ops/settings', icon: 'ri-settings-3-line', perm: 'settings' },
];

const AUTH_PAGES = ['/ops/login', '/ops/signup'];

export default function OpsShell({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const pathname = usePathname();
  const { user, isLoading, signOut } = useAuth();
  const { can } = useMyPermissions(user?.id || null, user?.company_id || null);
  const { pending } = usePendingLeave();

  const isAuthPage = pathname && AUTH_PAGES.some((p) => pathname === p || pathname.startsWith(p + '/'));

  const sortedNavItems = [...navItems].sort((a, b) => b.href.length - a.href.length);
  const activeHref = pathname
    ? sortedNavItems.find(
        (item) =>
          pathname === item.href ||
          (pathname.startsWith(item.href + '/') && item.href !== '/ops')
      )?.href ?? null
    : null;

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 1024);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  if (isAuthPage) return <>{children}</>;

  if (isLoading || !user) {
    return (
      <div className="flex h-screen bg-[#0b0f19] overflow-hidden">
        <aside className="hidden lg:flex w-64 h-full bg-[#111827] border-r border-gray-800 flex-col">
          <div className="flex items-center h-16 px-4 border-b border-gray-800">
            <div className="h-8 w-32 bg-white/5 rounded-lg animate-pulse" />
          </div>
          <div className="flex-1 px-3 py-4 space-y-1.5">
            {[...Array(10)].map((_, i) => (
              <div key={i} className="h-9 rounded-lg bg-white/5 animate-pulse" />
            ))}
          </div>
        </aside>
        <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
          <header className="h-16 bg-[#111827] border-b border-gray-800 flex items-center px-6 gap-4">
            <div className="h-5 w-5 bg-white/5 rounded animate-pulse" />
            <div className="h-4 w-48 bg-white/5 rounded animate-pulse" />
            <div className="ml-auto flex gap-3">
              <div className="h-9 w-56 bg-white/5 rounded-lg animate-pulse" />
              <div className="h-8 w-8 rounded-full bg-white/5 animate-pulse" />
            </div>
          </header>
          <main className="flex-1 overflow-y-auto p-4 lg:p-6">
            <TablePageSkeleton />
          </main>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-[#0b0f19] overflow-hidden">
      {mobileOpen && (
        <div className="fixed inset-0 bg-black/60 z-40 lg:hidden" onClick={() => setMobileOpen(false)} />
      )}

      <aside
        className={`fixed lg:static z-50 h-full bg-[#111827] border-r border-gray-800 transition-all duration-300 ${
          sidebarOpen ? 'w-64' : 'w-20'
        } ${mobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}
      >
        <style>{`
          .ops-sidebar-scroll::-webkit-scrollbar { width: 5px; }
          .ops-sidebar-scroll::-webkit-scrollbar-track { background: transparent; }
          .ops-sidebar-scroll::-webkit-scrollbar-thumb { background: #2e3652; border-radius: 9999px; }
          .ops-sidebar-scroll::-webkit-scrollbar-thumb:hover { background: #4f5b85; }
          .ops-main-scroll::-webkit-scrollbar { width: 6px; }
          .ops-main-scroll::-webkit-scrollbar-track { background: transparent; }
          .ops-main-scroll::-webkit-scrollbar-thumb { background: #1e2845; border-radius: 9999px; }
          .ops-main-scroll::-webkit-scrollbar-thumb:hover { background: #2e3a5e; }
          .ops-main-scroll { scrollbar-width: thin; scrollbar-color: #1e2845 transparent; }
          .ops-sidebar-scroll { scrollbar-width: thin; scrollbar-color: #2e3652 transparent; }
        `}</style>
        <div className="flex flex-col h-full">
          <div className="flex items-center h-16 px-4 border-b border-gray-800">
            <Link href="/ops" className="flex items-center gap-3 overflow-hidden whitespace-nowrap">
              <img
                src="https://storage.readdy-site.link/project_files/18288eee-63fa-4165-a658-6aa7ab020255/0f55097c-53e5-494b-b419-876152a51ee7_edited_image_d3fb89d4-4c94-480b-911a-a4f5576d177c_0.png?v=4a5cb4d0eb32cb9bee8b5acd1d9f9fa6"
                alt="GuardianHub"
                className="h-8 w-auto"
              />
            </Link>
          </div>

          <nav className="ops-sidebar-scroll flex-1 px-3 py-4 space-y-1 overflow-y-auto">
            {navItems.map((item: any) => {
              if (item.perm && !can(item.perm, 'view')) return null;
              const active = activeHref === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setMobileOpen(false)}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all whitespace-nowrap ${
                    active ? 'bg-blue-600/15 text-blue-400' : 'text-gray-400 hover:text-white hover:bg-gray-800/50'
                  }`}
                >
                  <div className="w-5 h-5 flex items-center justify-center flex-shrink-0 relative">
                    <i className={item.icon}></i>
                    {item.badge && pending.length > 0 && (
                      <span className="absolute -top-1.5 -right-1.5 w-4 h-4 bg-amber-500 rounded-full text-[9px] font-bold text-black flex items-center justify-center">
                        {pending.length > 9 ? '9+' : pending.length}
                      </span>
                    )}
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
              onClick={() => isMobile ? setMobileOpen(!mobileOpen) : setSidebarOpen(!sidebarOpen)}
              className="w-9 h-9 flex items-center justify-center text-gray-400 hover:text-white transition-colors"
            >
              <div className="w-5 h-5 flex items-center justify-center">
                <i className="ri-menu-line"></i>
              </div>
            </button>
            <div className="hidden md:flex items-center text-sm text-gray-400">
              <div className="w-4 h-4 flex items-center justify-center mr-1.5">
                <i className="ri-building-4-line"></i>
              </div>
              {user?.company_name || 'GuardianHub Operations'}
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="relative hidden sm:block">
              <div className="w-5 h-5 flex items-center justify-center absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">
                <i className="ri-search-line text-sm"></i>
              </div>
              <input
                type="text"
                placeholder="Search..."
                className="bg-gray-800/60 border border-gray-700 rounded-lg pl-10 pr-4 py-1.5 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 w-56"
              />
            </div>
            <NotificationBell userId={user?.id || null} />
            <div className="flex items-center gap-2 pl-2 border-l border-gray-700">
              <div className="w-8 h-8 rounded-full bg-blue-600/20 flex items-center justify-center text-blue-400 text-sm font-semibold">
                {user?.first_name?.[0] || user?.last_name?.[0] || 'U'}
              </div>
              <span className="hidden md:block text-sm text-gray-300">
                {user?.first_name} {user?.last_name}
              </span>
            </div>
          </div>
        </header>

        <main className="ops-main-scroll flex-1 overflow-y-auto p-4 lg:p-6">{children}</main>
      </div>

      <SOPAssistantWidget theme="dark" enableVoice={false} />
    </div>
  );
}