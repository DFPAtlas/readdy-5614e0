'use client';

import { useState, useCallback, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth';
import { useSuperAdminCompanies, useAdminSites, useAdminUsers } from '@/lib/useSuperAdmin';

const sidebarItems = [
  { label: 'Overview', href: '/admin', icon: 'ri-dashboard-line' },
  { label: 'Clients', href: '/admin/clients', icon: 'ri-briefcase-line' },
  { label: 'Sites', href: '/admin/sites', icon: 'ri-building-line' },
  { label: 'Users', href: '/admin/users', icon: 'ri-team-line' },
  { label: 'Subscriptions', href: '/admin/subscriptions', icon: 'ri-vip-crown-line' },
  { label: 'Support Tickets', href: '/super-admin/support', icon: 'ri-customer-service-line' },
  { label: 'Financial', href: '/super-admin/financial', icon: 'ri-bank-card-line' },
  { label: 'Email Images', href: '/super-admin/email-image-library', icon: 'ri-image-line' },
  { label: 'Stripe Webhook Test', href: '/admin/stripe-webhook-test', icon: 'ri-bug-line' },
  { label: 'Activity Log', href: '/admin/activity', icon: 'ri-shield-check-line' },
  { label: 'Settings', href: '/admin/settings', icon: 'ri-settings-3-line' },
];

interface SearchResult {
  type: 'company' | 'user' | 'site';
  id: string;
  title: string;
  subtitle: string;
  href: string;
  icon: string;
}

export default function AdminShell({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchOpen, setSearchOpen] = useState(false);
  const pathname = usePathname();
  const router = useRouter();
  const { profile, signOut } = useAuth();

  const { companies } = useSuperAdminCompanies();
  const { sites } = useAdminSites();
  const { users } = useAdminUsers();

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 1024);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const initials = (profile?.first_name?.[0] || '') + (profile?.last_name?.[0] || '') || 'SA';
  const fullName = `${profile?.first_name || ''} ${profile?.last_name || ''}`.trim() || 'Super Admin';

  const isActive = (href: string) => {
    if (!pathname) return false;
    if (href === '/admin') return pathname === '/admin';
    return pathname.startsWith(href);
  };

  const getResults = useCallback((): SearchResult[] => {
    if (!searchQuery.trim()) return [];
    const q = searchQuery.toLowerCase();
    const results: SearchResult[] = [];

    companies.forEach((c) => {
      if (
        c.name.toLowerCase().includes(q) ||
        (c.contact_email || '').toLowerCase().includes(q) ||
        (c.owner_name || '').toLowerCase().includes(q)
      ) {
        results.push({
          type: 'company',
          id: c.id,
          title: c.name,
          subtitle: c.plan_name || c.subscription_plan || 'No plan',
          href: `/admin/clients/detail?id=${c.id}`,
          icon: 'ri-briefcase-line',
        });
      }
    });

    sites.forEach((s) => {
      if (
        (s.site_name || '').toLowerCase().includes(q) ||
        (s.address || '').toLowerCase().includes(q) ||
        (s.company_name || '').toLowerCase().includes(q)
      ) {
        results.push({
          type: 'site',
          id: s.id,
          title: s.site_name || 'Unnamed Site',
          subtitle: s.company_name || 'Unknown client',
          href: s.company_id ? `/admin/clients/detail?id=${s.company_id}` : '/admin/sites',
          icon: 'ri-building-line',
        });
      }
    });

    users.forEach((u) => {
      if (
        (u.first_name || '').toLowerCase().includes(q) ||
        (u.last_name || '').toLowerCase().includes(q) ||
        (u.email || '').toLowerCase().includes(q) ||
        (u.company_name || '').toLowerCase().includes(q)
      ) {
        results.push({
          type: 'user',
          id: u.id,
          title: `${u.first_name || ''} ${u.last_name || ''}`.trim() || 'Unknown',
          subtitle: `${u.role.replace(/_/g, ' ')}${u.company_name ? ' at ' + u.company_name : ''}`,
          href: u.company_id ? `/admin/clients/detail?id=${u.company_id}` : '/admin/users',
          icon: 'ri-user-line',
        });
      }
    });

    return results.slice(0, 12);
  }, [searchQuery, companies, sites, users]);

  const results = getResults();

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setSearchOpen(true);
      }
      if (e.key === 'Escape') {
        setSearchOpen(false);
        setSearchQuery('');
      }
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, []);

  return (
    <div className="flex h-screen bg-[#0B0F1E] overflow-hidden">
      <style>{`
        .admin-sidebar-scroll::-webkit-scrollbar {
          width: 5px;
        }
        .admin-sidebar-scroll::-webkit-scrollbar-track {
          background: transparent;
        }
        .admin-sidebar-scroll::-webkit-scrollbar-thumb {
          background: #2e3652;
          border-radius: 9999px;
        }
        .admin-sidebar-scroll::-webkit-scrollbar-thumb:hover {
          background: #4f5b85;
        }
        .admin-main-scroll::-webkit-scrollbar { width: 6px; }
        .admin-main-scroll::-webkit-scrollbar-track { background: transparent; }
        .admin-main-scroll::-webkit-scrollbar-thumb { background: #1e2845; border-radius: 9999px; }
        .admin-main-scroll::-webkit-scrollbar-thumb:hover { background: #2e3a5e; }
        .admin-main-scroll { scrollbar-width: thin; scrollbar-color: #1e2845 transparent; }
        .admin-sidebar-scroll {
          scrollbar-width: thin;
          scrollbar-color: #2e3652 transparent;
        }
      `}</style>
      {mobileOpen && (
        <div className="fixed inset-0 bg-black/60 z-40 lg:hidden" onClick={() => setMobileOpen(false)} />
      )}

      <aside
        className={`fixed lg:static z-50 h-full bg-[#0f1629] border-r border-gray-800/60 transition-all duration-300 ${
          sidebarOpen ? 'w-64' : 'w-20'
        } ${mobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}
      >
        <div className="flex flex-col h-full">
          <div className="flex items-center h-16 px-4 border-b border-gray-800/60">
            <Link href="/admin" className="flex items-center gap-3 overflow-hidden whitespace-nowrap">
              <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center flex-shrink-0">
                <div className="w-5 h-5 flex items-center justify-center text-white">
                  <i className="ri-shield-star-line"></i>
                </div>
              </div>
              <span className={`font-semibold text-white text-sm transition-opacity ${sidebarOpen ? 'opacity-100' : 'opacity-0 lg:hidden'}`}>
                Super Admin
              </span>
            </Link>
          </div>

          <nav className="admin-sidebar-scroll flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
            {sidebarItems.map((item) => {
              const active = isActive(item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setMobileOpen(false)}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all whitespace-nowrap ${
                    active
                      ? 'bg-indigo-600/15 text-indigo-400'
                      : 'text-gray-400 hover:text-white hover:bg-gray-800/40'
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

          <div className="px-3 py-4 border-t border-gray-800/60">
            <button
              onClick={() => { signOut(); }}
              className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-gray-400 hover:text-red-400 hover:bg-gray-800/40 transition-all w-full whitespace-nowrap"
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
        <header className="h-16 bg-[#0f1629] border-b border-gray-800/60 flex items-center justify-between px-4 lg:px-6 flex-shrink-0">
          <div className="flex items-center gap-3">
            <button
              onClick={() => isMobile ? setMobileOpen(!mobileOpen) : setSidebarOpen(!sidebarOpen)}
              className="w-9 h-9 flex items-center justify-center text-gray-400 hover:text-white transition-colors cursor-pointer"
            >
              <div className="w-5 h-5 flex items-center justify-center">
                <i className="ri-menu-line"></i>
              </div>
            </button>
            <div className="hidden md:flex items-center text-sm text-gray-500">
              <div className="w-4 h-4 flex items-center justify-center mr-1.5">
                <i className="ri-shield-check-line"></i>
              </div>
              Platform Administration
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setSearchOpen(true)}
              className="hidden sm:flex items-center gap-2 bg-gray-800/40 border border-gray-700/60 rounded-lg px-3 py-1.5 text-sm text-gray-500 hover:text-gray-300 hover:border-gray-600 transition-colors cursor-pointer"
            >
              <div className="w-4 h-4 flex items-center justify-center">
                <i className="ri-search-line text-xs"></i>
              </div>
              <span className="text-xs">Search...</span>
              <kbd className="ml-1 hidden lg:inline-flex items-center gap-0.5 px-1.5 py-0.5 bg-gray-800 rounded text-[10px] text-gray-500 font-mono border border-gray-700">
                <span className="text-[10px]">Ctrl</span> <span className="text-[10px]">K</span>
              </kbd>
            </button>

            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-indigo-600/20 flex items-center justify-center text-indigo-400 text-sm font-semibold">
                {initials}
              </div>
              <div className="hidden md:block text-left">
                <p className="text-sm font-medium text-white">{fullName}</p>
                <p className="text-xs text-gray-500">Super Admin</p>
              </div>
            </div>
          </div>
        </header>

        <main className="admin-main-scroll flex-1 overflow-y-auto">{children}</main>
      </div>

      {searchOpen && (
        <div className="fixed inset-0 z-[60] flex items-start justify-center pt-20 px-4">
          <div className="absolute inset-0 bg-black/60" onClick={() => { setSearchOpen(false); setSearchQuery(''); }} />
          <div className="relative w-full max-w-xl bg-[#111827] border border-gray-700 rounded-xl shadow-2xl overflow-hidden">
            <div className="flex items-center gap-3 px-4 py-3 border-b border-gray-800">
              <div className="w-5 h-5 flex items-center justify-center text-gray-500">
                <i className="ri-search-line"></i>
              </div>
              <input
                autoFocus
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search companies, users, sites..."
                className="flex-1 bg-transparent text-sm text-white placeholder-gray-500 focus:outline-none"
              />
              <kbd className="hidden sm:inline-flex items-center px-1.5 py-0.5 bg-gray-800 rounded text-[10px] text-gray-500 font-mono border border-gray-700">
                ESC
              </kbd>
            </div>
            <div className="max-h-[60vh] overflow-y-auto">
              {results.length === 0 && searchQuery.trim() && (
                <div className="px-4 py-8 text-center text-sm text-gray-500">No results found</div>
              )}
              {results.length === 0 && !searchQuery.trim() && (
                <div className="px-4 py-6 text-center text-sm text-gray-500">
                  Type to search across the platform
                </div>
              )}
              {results.map((r) => (
                <button
                  key={`${r.type}-${r.id}`}
                  onClick={() => { router.push(r.href); setSearchOpen(false); setSearchQuery(''); }}
                  className="w-full flex items-center gap-3 px-4 py-3 hover:bg-white/[0.02] transition-colors text-left"
                >
                  <div className="w-8 h-8 rounded-lg bg-gray-800 flex items-center justify-center flex-shrink-0">
                    <div className="w-4 h-4 flex items-center justify-center text-gray-500">
                      <i className={r.icon}></i>
                    </div>
                  </div>
                  <div className="min-w-0">
                    <div className="text-sm text-white truncate">{r.title}</div>
                    <div className="text-xs text-gray-500 capitalize">
                      {r.type} &middot; {r.subtitle}
                    </div>
                  </div>
                  <div className="ml-auto w-4 h-4 flex items-center justify-center text-gray-600 flex-shrink-0">
                    <i className="ri-arrow-right-line text-xs"></i>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}