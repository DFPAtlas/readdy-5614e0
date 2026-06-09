'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import RaiseTicketModal from './RaiseTicketModal';
import { useAuth } from '@/lib/auth';
import { useMyPermissions } from '@/lib/usePermissions';
import SOPAssistantWidget from '@/app/components/SOPAssistantWidget';
import NotificationBell from '@/app/components/NotificationBell';
import { DashboardPageSkeleton } from '@/app/components/PageSkeleton';

const navItems = [
  { label: 'Dashboard', href: '/dashboard', icon: 'ri-dashboard-line', perm: 'dashboard' },
  { label: 'Command Centre', href: '/dashboard/command-centre', icon: 'ri-command-line', perm: 'dashboard' },
  { label: 'Guard Welfare', href: '/dashboard/guard-welfare', icon: 'ri-heart-pulse-line', perm: 'dashboard' },
  { label: 'Evidence Vault', href: '/dashboard/evidence-vault', icon: 'ri-folder-shield-line', perm: 'incidents' },
  { label: 'Site Assignments', href: '/dashboard/site-assignments', icon: 'ri-grid-line', perm: 'staff' },
  { label: 'Setup Wizard', href: '/dashboard/setup-wizard', icon: 'ri-magic-line', perm: 'settings' },
  { label: 'Compliance', href: '/dashboard/compliance/documents', icon: 'ri-file-shield-line', perm: 'dashboard' },
  { label: 'Client SLA', href: '/dashboard/client-sla', icon: 'ri-line-chart-line', perm: 'dashboard' },
  { label: 'Admin', href: '/dashboard/admin', icon: 'ri-user-settings-line', perm: 'settings' },
  { label: 'Sites', href: '/sites', icon: 'ri-building-line', perm: 'sites' },
  { label: 'Clients', href: '/dashboard/clients', icon: 'ri-briefcase-line', perm: 'client_portal' },
  { label: 'Patrol Checkpoints', href: '/dashboard/patrol-checkpoints', icon: 'ri-qr-code-line', perm: 'sites' },
  { label: 'Patrol Monitoring', href: '/dashboard/patrol-monitoring', icon: 'ri-route-line', perm: 'sites' },
  { label: 'Notices', href: '/dashboard/notices', icon: 'ri-notification-3-line', perm: 'sites' },
  { label: 'Incidents', href: '/incidents', icon: 'ri-alarm-warning-line', perm: 'incidents' },
  { label: 'Occurrence Book', href: '/occurrence-book', icon: 'ri-book-line', perm: 'occurrence_book' },
  { label: 'Guards', href: '/guards', icon: 'ri-shield-user-line', perm: 'staff' },
  { label: 'Leave Requests', href: '/dashboard/leave-requests', icon: 'ri-calendar-close-line', perm: 'staff' },
  { label: 'Rotas', href: '/rotas', icon: 'ri-calendar-event-line', perm: 'rotas' },
  { label: 'Pattern Builder', href: '/rotas/patterns', icon: 'ri-stack-line', perm: 'shift_patterns' },
  { label: 'Reports', href: '/reports', icon: 'ri-bar-chart-box-line', perm: 'reports' },
  { label: 'Weekly Reports', href: '/dashboard/reports/client-weekly', icon: 'ri-file-chart-line', perm: 'reports' },
  { label: 'SOP Builder', href: '/sop-builder', icon: 'ri-draft-line', perm: 'sop_documents' },
  { label: 'SOP Library', href: '/sops', icon: 'ri-book-open-line', perm: 'sop_documents' },
  { label: 'AI Automation Hub', href: '/dashboard/ai-automation', icon: 'ri-robot-2-line', perm: 'ai_tools' },
  { label: 'Staff', href: '/dashboard/staff', icon: 'ri-team-line', perm: 'staff' },
  { label: 'Settings', href: '/dashboard/settings', icon: 'ri-settings-3-line', perm: 'settings' },
];

const adminNavItems = [
  { label: 'Roles & Permissions', href: '/dashboard/settings/roles', icon: 'ri-shield-user-line', perm: 'roles' },
];

export default function DashboardShell({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showTicketModal, setShowTicketModal] = useState(false);
  const pathname = usePathname();
  const { profile, signOut, isLoading } = useAuth();
  const { can } = useMyPermissions(profile?.id || null, profile?.company_id || null);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 1024);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const initials = (profile?.first_name?.[0] || '') + (profile?.last_name?.[0] || '') || 'U';
  const fullName = `${profile?.first_name || ''} ${profile?.last_name || ''}`.trim() || 'User';
  const roleLabel = profile?.role
    ? profile.role.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase())
    : 'User';
  const isSuperAdmin = profile?.role === 'super_admin';

  const isActive = (href: string) => {
    if (!pathname) return false;
    if (pathname === href) return true;
    if (href === '/dashboard') return pathname === '/dashboard';
    return pathname.startsWith(href + '/');
  };

  const isSetupPage = pathname === '/dashboard/setup' || pathname === '/dashboard/setup-wizard';

  if (isLoading) {
    return (
      <div className="flex h-screen bg-[#0a0e1a] overflow-hidden">
        <aside className="hidden lg:flex w-64 h-full bg-[#111827] border-r border-gray-800 flex-col">
          <div className="flex items-center h-16 px-4 border-b border-gray-800">
            <div className="h-10 w-36 bg-white/5 rounded-lg animate-pulse" />
          </div>
          <div className="flex-1 px-3 py-4 space-y-1.5">
            {[...Array(12)].map((_, i) => (
              <div key={i} className="h-9 rounded-lg bg-white/5 animate-pulse" />
            ))}
          </div>
        </aside>
        <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
          <header className="h-16 bg-[#111827] border-b border-gray-800 flex items-center px-6 gap-4">
            <div className="h-5 w-5 bg-white/5 rounded animate-pulse" />
            <div className="h-4 w-40 bg-white/5 rounded animate-pulse" />
            <div className="ml-auto flex items-center gap-3">
              <div className="h-9 w-56 bg-white/5 rounded-lg animate-pulse hidden sm:block" />
              <div className="h-8 w-8 rounded-full bg-white/5 animate-pulse" />
              <div className="h-8 w-24 bg-white/5 rounded animate-pulse hidden md:block" />
            </div>
          </header>
          <main className="flex-1 overflow-y-auto p-4 lg:p-6">
            <DashboardPageSkeleton />
          </main>
        </div>
      </div>
    );
  }

  if (isSetupPage) {
    return (
      <div className="min-h-screen bg-[#0b0f19] overflow-y-auto">
        {children}
      </div>
    );
  }

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
          .dash-sidebar-scroll::-webkit-scrollbar { width: 5px; }
          .dash-sidebar-scroll::-webkit-scrollbar-track { background: transparent; }
          .dash-sidebar-scroll::-webkit-scrollbar-thumb { background: #2e3652; border-radius: 9999px; }
          .dash-sidebar-scroll::-webkit-scrollbar-thumb:hover { background: #4f5b85; }
          .dash-main-scroll::-webkit-scrollbar { width: 6px; }
          .dash-main-scroll::-webkit-scrollbar-track { background: transparent; }
          .dash-main-scroll::-webkit-scrollbar-thumb { background: #1e2845; border-radius: 9999px; }
          .dash-main-scroll::-webkit-scrollbar-thumb:hover { background: #2e3a5e; }
          .dash-main-scroll { scrollbar-width: thin; scrollbar-color: #1e2845 transparent; }
          .dash-sidebar-scroll { scrollbar-width: thin; scrollbar-color: #2e3652 transparent; }
        `}</style>
        <div className="flex flex-col h-full">
          <div className="flex items-center h-16 px-4 border-b border-gray-800">
            <Link href="/dashboard" className="flex items-center gap-3 overflow-hidden whitespace-nowrap">
              <img
                src="https://public.readdy.ai/ai/img_res/67f2334e-cf30-4238-b549-3b5a360c5a50.png"
                alt="GuardianHub"
                className="h-12 w-auto"
              />
              <span className={`text-sm font-bold text-white tracking-wide transition-opacity ${sidebarOpen ? 'opacity-100' : 'opacity-0 lg:hidden'}`}>
                Guardian-Hub.UK
              </span>
            </Link>
          </div>

          <nav className="dash-sidebar-scroll flex-1 px-3 py-4 space-y-1 overflow-y-auto">
            {navItems.map((item) => {
              if (item.perm && !can(item.perm, 'view')) return null;
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

            {isSuperAdmin && (
              <Link
                href="/admin"
                onClick={() => setMobileOpen(false)}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all whitespace-nowrap ${
                  pathname?.startsWith('/admin')
                    ? 'bg-indigo-600/15 text-indigo-400'
                    : 'text-gray-400 hover:text-white hover:bg-gray-800/50'
                }`}
              >
                <div className="w-5 h-5 flex items-center justify-center flex-shrink-0">
                  <i className="ri-shield-star-line"></i>
                </div>
                <span className={`transition-opacity ${sidebarOpen ? 'opacity-100' : 'opacity-0 lg:hidden'}`}>
                  Super Admin
                </span>
              </Link>
            )}

            {adminNavItems.map((item) => {
              if (item.perm && !can(item.perm, 'manage')) return null;
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
        <header className="h-16 bg-[#111827] border-b border-gray-800 flex items-center justify-between px-4 lg:px-6 flex-shrink-0" data-tour="sidebar">
          <div className="flex items-center gap-3">
            <button
              onClick={() => isMobile ? setMobileOpen(!mobileOpen) : setSidebarOpen(!sidebarOpen)}
              className="w-9 h-9 flex items-center justify-center text-gray-400 hover:text-white transition-colors cursor-pointer"
            >
              <div className="w-5 h-5 flex items-center justify-center">
                <i className="ri-menu-line"></i>
              </div>
            </button>
            <div className="hidden md:flex items-center text-sm text-gray-400">
              <div className="w-4 h-4 flex items-center justify-center mr-1.5">
                <i className="ri-shield-check-line"></i>
              </div>
              Control Room
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

            <button
              onClick={() => setShowTicketModal(true)}
              className="hidden sm:flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 border border-indigo-500 rounded-lg px-3 py-1.5 text-sm text-white transition-colors cursor-pointer whitespace-nowrap"
            >
              <div className="w-4 h-4 flex items-center justify-center">
                <i className="ri-customer-service-2-line text-sm"></i>
              </div>
              <span className="text-xs">Raise Ticket</span>
            </button>

            <div className="relative">
              <NotificationBell userId={profile?.id || null} />
            </div>

            <div className="relative">
              <button
                onClick={() => setShowUserMenu(!showUserMenu)}
                className="flex items-center space-x-3 cursor-pointer"
              >
                <div className="w-8 h-8 rounded-full bg-blue-600/20 flex items-center justify-center text-blue-400 text-sm font-semibold">
                  {initials}
                </div>
                <div className="hidden md:block text-left">
                  <p className="text-sm font-medium text-white">{fullName}</p>
                  <p className="text-xs text-gray-500">{roleLabel}</p>
                </div>
                <div className="w-4 h-4 flex items-center justify-center">
                  <i className="ri-arrow-down-s-line text-gray-500"></i>
                </div>
              </button>

              {showUserMenu && (
                <div className="absolute right-0 mt-2 w-56 bg-[#0f172a] rounded-lg shadow-lg border border-white/10 z-50">
                  <div className="p-3 border-b border-white/10">
                    <p className="text-sm font-medium text-white">{fullName}</p>
                    <p className="text-xs text-gray-500">{profile?.email || ''}</p>
                  </div>
                  <div className="p-1">
                    <Link
                      href="/dashboard/settings"
                      onClick={() => setShowUserMenu(false)}
                      className="flex items-center gap-2 px-3 py-2 text-sm text-gray-400 hover:bg-white/5 hover:text-white rounded-md cursor-pointer"
                    >
                      <div className="w-4 h-4 flex items-center justify-center">
                        <i className="ri-settings-3-line text-gray-500"></i>
                      </div>
                      Settings
                    </Link>
                    <Link
                      href="/dashboard/ops-room"
                      onClick={() => setShowUserMenu(false)}
                      className="flex items-center gap-2 px-3 py-2 text-sm text-gray-400 hover:bg-white/5 hover:text-white rounded-md cursor-pointer"
                    >
                      <div className="w-4 h-4 flex items-center justify-center">
                        <i className="ri-dashboard-line text-gray-500"></i>
                      </div>
                      Ops Room
                    </Link>
                    <button
                      onClick={() => {
                        setShowUserMenu(false);
                        signOut();
                      }}
                      className="w-full flex items-center gap-2 px-3 py-2 text-sm text-red-400 hover:bg-red-500/10 rounded-md cursor-pointer"
                    >
                      <div className="w-4 h-4 flex items-center justify-center">
                        <i className="ri-logout-box-line"></i>
                      </div>
                      Sign Out
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </header>

        <main className="dash-main-scroll flex-1 overflow-y-auto p-4 lg:p-6">{children}</main>
      </div>

      <SOPAssistantWidget theme="dark" enableVoice={false} />
      {showTicketModal && <RaiseTicketModal onClose={() => setShowTicketModal(false)} />}
    </div>
  );
}