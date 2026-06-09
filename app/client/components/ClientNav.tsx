'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/lib/auth';
import { useClientPortal } from '@/lib/useClientPortal';
import { useNotifications } from '@/lib/useNotifications';
import NotificationBell from '@/app/components/NotificationBell';

const TABS = [
  { label: 'Dashboard', href: '/dashboard', icon: 'ri-dashboard-3-line', adminOnly: true },
  { label: 'ACS Hub', href: '/client/acs', icon: 'ri-shield-star-line' },
  { label: 'Overview', href: '/client', icon: 'ri-dashboard-line' },
  { label: 'Information', href: '/client/information', icon: 'ri-building-2-line' },
  { label: 'Sites', href: '/client/sites', icon: 'ri-building-line' },
  { label: 'Incidents', href: '/client/incidents', icon: 'ri-alarm-warning-line' },
  { label: 'Reports', href: '/client/reports', icon: 'ri-file-list-3-line' },
  { label: 'Patrols', href: '/client/patrol-monitoring', icon: 'ri-route-line' },
  { label: 'Messages', href: '/client/messages', icon: 'ri-mail-line' },
  { label: 'Support', href: '/client/support', icon: 'ri-customer-service-line' },
  { label: 'Settings', href: '/client/settings', icon: 'ri-settings-3-line' },
];

const isAdminRole = (role?: string) =>
  role === 'super_admin' || role === 'company_admin' || role === 'operations_manager';

export default function ClientNav() {
  const { profile, company, signOut } = useAuth();
  const { unreadMessages } = useClientPortal();
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);

  const brandColor = company?.brand_color || '#2563eb';
  const initials = `${profile?.first_name?.[0] || ''}${profile?.last_name?.[0] || ''}`.toUpperCase() || 'C';

  const visibleTabs = TABS.filter((tab) => !tab.adminOnly || isAdminRole(profile?.role));

  return (
    <header className="sticky top-0 z-50 bg-[#0f172a]/90 backdrop-blur-xl border-b border-white/10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2.5">
            {company?.logo_url ? (
              <img src={company.logo_url} alt="" className="h-8 w-auto" />
            ) : (
              <img
                src="https://storage.readdy-site.link/project_files/18288eee-63fa-4165-a658-6aa7ab020255/0f55097c-53e5-494b-b419-876152a51ee7_edited_image_d3fb89d4-4c94-480b-911a-a4f5576d177c_0.png?v=4a5cb4d0eb32cb9bee8b5acd1d9f9fa6"
                alt="GuardianHub"
                className="h-8 w-auto"
              />
            )}
            <span className="text-base font-semibold text-white hidden sm:block">
              {company?.name || 'Security Company'}
            </span>
          </div>

          <nav className="hidden md:flex items-center gap-1">
            {visibleTabs.map((tab) => {
              const isActive = pathname === tab.href || pathname.startsWith(tab.href + '/');
              return (
                <Link
                  key={tab.href}
                  href={tab.href}
                  className={`relative px-3 py-2 rounded-lg text-sm font-medium transition-colors cursor-pointer whitespace-nowrap ${
                    isActive
                      ? 'text-white bg-white/10'
                      : 'text-gray-400 hover:text-white hover:bg-white/5'
                  }`}
                >
                  <span className="flex items-center gap-1.5">
                    <div className="w-4 h-4 flex items-center justify-center">
                      <i className={tab.icon}></i>
                    </div>
                    {tab.label}
                    {tab.label === 'Messages' && unreadMessages > 0 && (
                      <span className="ml-0.5 w-5 h-5 flex items-center justify-center bg-red-500 text-white text-[10px] font-bold rounded-full">
                        {unreadMessages}
                      </span>
                    )}
                  </span>
                </Link>
              );
            })}
          </nav>
        </div>

        <div className="flex items-center gap-3">
          <NotificationBell userId={profile?.id || null} />

          <div className="relative">
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              className="flex items-center gap-2.5 cursor-pointer"
            >
              <div className="text-right hidden sm:block">
                <p className="text-sm font-medium text-white">
                  {profile?.first_name} {profile?.last_name}
                </p>
                <p className="text-xs text-gray-500">Client Portal</p>
              </div>
              <div
                className="w-9 h-9 rounded-full flex items-center justify-center text-white text-sm font-semibold"
                style={{ backgroundColor: brandColor }}
              >
                {initials}
              </div>
            </button>

            {menuOpen && (
              <>
                <div className="fixed inset-0 z-40" onClick={() => setMenuOpen(false)} />
                <div className="absolute right-0 top-full mt-2 w-56 bg-[#0f172a] rounded-xl border border-white/10 shadow-lg z-50 py-1.5">
                  <div className="px-4 py-2 border-b border-white/10">
                    <p className="text-sm font-medium text-white">{profile?.first_name} {profile?.last_name}</p>
                    <p className="text-xs text-gray-500">{profile?.email}</p>
                  </div>
                  <Link
                    href="/client/settings"
                    onClick={() => setMenuOpen(false)}
                    className="flex items-center gap-2 px-4 py-2 text-sm text-gray-400 hover:bg-white/5 hover:text-white cursor-pointer"
                  >
                    <div className="w-4 h-4 flex items-center justify-center"><i className="ri-settings-3-line"></i></div>
                    Settings
                  </Link>
                  <button
                    onClick={() => { setMenuOpen(false); signOut(); }}
                    className="w-full flex items-center gap-2 px-4 py-2 text-sm text-red-400 hover:bg-red-500/10 cursor-pointer"
                  >
                    <div className="w-4 h-4 flex items-center justify-center"><i className="ri-logout-box-line"></i></div>
                    Sign Out
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Mobile nav */}
      <nav className="md:hidden flex items-center gap-0.5 px-4 pb-2 overflow-x-auto">
        {visibleTabs.map((tab) => {
          const isActive = pathname === tab.href || pathname.startsWith(tab.href + '/');
          return (
            <Link
              key={tab.href}
              href={tab.href}
              className={`flex-shrink-0 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors cursor-pointer whitespace-nowrap ${
                isActive
                  ? 'text-white bg-white/10'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              <span className="flex items-center gap-1">
                <div className="w-3.5 h-3.5 flex items-center justify-center">
                  <i className={tab.icon}></i>
                </div>
                {tab.label}
                {tab.label === 'Messages' && unreadMessages > 0 && (
                  <span className="ml-0.5 w-4 h-4 flex items-center justify-center bg-red-500 text-white text-[9px] font-bold rounded-full">
                    {unreadMessages}
                  </span>
                )}
              </span>
            </Link>
          );
        })}
      </nav>
    </header>
  );
}