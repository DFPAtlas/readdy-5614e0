'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/lib/auth';

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [resourcesOpen, setResourcesOpen] = useState(false);
  const pathname = usePathname();
  const { currentUser, profile, isLoading, signOut } = useAuth();

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const isActive = (href: string) => pathname === href;

  const isAdmin = profile && ['super_admin', 'company_admin', 'operations_manager'].includes(profile.role);
  const isSuperAdmin = profile?.role === 'super_admin';
  const isClient = profile?.role === 'client';
  const isGuard = profile?.role === 'guard';

  const dashboardLink = isAdmin ? '/dashboard' : isClient ? '/client' : isGuard ? '/guard' : null;

  const navLinks = [
    { href: '/platform', label: 'Platform' },
    { href: '/solutions', label: 'Solutions' },
    { href: '/pricing', label: 'Pricing' },
    ...(dashboardLink ? [{ href: dashboardLink, label: 'Dashboard' }] : []),
  ];

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${scrolled ? 'bg-[#0a0e1a]/90 backdrop-blur-xl border-b border-white/10' : 'bg-transparent'}`}
    >
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 lg:h-20">
          <Link href="/" className="flex items-center gap-2.5 group">
            <img
              src="https://storage.readdy-site.link/project_files/18288eee-63fa-4165-a658-6aa7ab020255/0f55097c-53e5-494b-b419-876152a51ee7_edited_image_d3fb89d4-4c94-480b-911a-a4f5576d177c_0.png?v=4a5cb4d0eb32cb9bee8b5acd1d9f9fa6"
              alt="GuardianHub"
              className="h-8 w-auto"
            />
          </Link>

          <div className="hidden lg:flex items-center gap-1">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors cursor-pointer ${isActive(link.href) ? 'text-white bg-white/10' : 'text-gray-400 hover:text-white hover:bg-white/5'}`}
              >
                {link.label}
              </Link>
            ))}

            <div
              className="relative"
              onMouseEnter={() => setResourcesOpen(true)}
              onMouseLeave={() => setResourcesOpen(false)}
            >
              <button className="px-4 py-2 rounded-lg text-sm font-medium text-gray-400 hover:text-white hover:bg-white/5 transition-colors flex items-center gap-1 cursor-pointer">
                Resources
                <i
                  className={`ri-arrow-down-s-line transition-transform ${resourcesOpen ? 'rotate-180' : ''}`}
                ></i>
              </button>
              {resourcesOpen && (
                <div className="absolute top-full left-0 mt-2 w-52 bg-[#0f172a] border border-white/10 rounded-xl overflow-hidden shadow-2xl z-50">
                  <span className="block px-4 py-3 text-sm text-gray-500">
                    Blog <span className="text-xs ml-1">(Coming soon)</span>
                  </span>
                  <span className="block px-4 py-3 text-sm text-gray-500">
                    Case Studies{' '}
                    <span className="text-xs ml-1">(Coming soon)</span>
                  </span>
                  <span className="block px-4 py-3 text-sm text-gray-500">
                    Documentation{' '}
                    <span className="text-xs ml-1">(Coming soon)</span>
                  </span>
                </div>
              )}
            </div>

            {/* Logged-in dashboard link */}
            {!isLoading && currentUser && dashboardLink && (
              <Link
                href={dashboardLink}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors cursor-pointer flex items-center gap-1.5 ${
                  pathname.startsWith('/dashboard') || pathname.startsWith('/client') || pathname.startsWith('/guard')
                    ? 'text-white bg-white/10'
                    : 'text-emerald-400 hover:text-emerald-300 hover:bg-emerald-500/10'
                }`}
              >
                <div className="w-4 h-4 flex items-center justify-center">
                  <i className={isAdmin ? 'ri-dashboard-3-line' : isClient ? 'ri-building-line' : 'ri-shield-check-line'}></i>
                </div>
                {isAdmin ? 'Dashboard' : isClient ? 'Client Portal' : 'Guard App'}
              </Link>
            )}

            {/* Super Admin link */}
            {!isLoading && isSuperAdmin && (
              <Link
                href="/admin"
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors cursor-pointer flex items-center gap-1.5 ${
                  pathname.startsWith('/admin')
                    ? 'text-white bg-white/10'
                    : 'text-indigo-400 hover:text-indigo-300 hover:bg-indigo-500/10'
                }`}
              >
                <div className="w-4 h-4 flex items-center justify-center">
                  <i className="ri-shield-star-line"></i>
                </div>
                Super Admin
              </Link>
            )}
          </div>

          <div className="hidden lg:flex items-center gap-3">
            {!currentUser ? (
              <>
                <button
                  onClick={() => {
                    const event = new CustomEvent('openLoginModal');
                    window.dispatchEvent(event);
                  }}
                  className="px-4 py-2 text-sm font-medium text-gray-300 hover:text-white transition-colors cursor-pointer"
                >
                  Login
                </button>
                <Link
                  href="/demo"
                  className="px-5 py-2.5 bg-blue-600 hover:bg-blue-500 text-white text-sm font-semibold rounded-lg transition-colors cursor-pointer"
                >
                  Book a Demo
                </Link>
              </>
            ) : (
              <>
                <span className="text-sm text-gray-400">{profile?.first_name} {profile?.last_name}</span>
                <button
                  onClick={() => signOut()}
                  className="px-4 py-2 text-sm font-medium text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-lg transition-colors cursor-pointer"
                >
                  Sign Out
                </button>
              </>
            )}
          </div>

          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="lg:hidden w-10 h-10 flex items-center justify-center text-white cursor-pointer"
          >
            <i className={`ri-${mobileOpen ? 'close' : 'menu'}-line text-xl`}></i>
          </button>
        </div>
      </div>

      {mobileOpen && (
        <div className="lg:hidden bg-[#0a0e1a]/95 backdrop-blur-xl border-t border-white/10">
          <div className="px-6 py-4 space-y-1">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMobileOpen(false)}
                className={`block px-4 py-3 rounded-lg text-sm font-medium ${isActive(link.href) ? 'text-white bg-white/10' : 'text-gray-400 hover:text-white hover:bg-white/5'}`}
              >
                {link.label}
              </Link>
            ))}
            <div className="px-4 py-3 text-sm font-medium text-gray-400">
              Resources <span className="text-xs">(Coming soon)</span>
            </div>

            {/* Mobile dashboard link */}
            {dashboardLink && (
              <Link
                href={dashboardLink}
                onClick={() => setMobileOpen(false)}
                className={`block px-4 py-3 rounded-lg text-sm font-medium flex items-center gap-2 ${
                  pathname.startsWith('/dashboard') || pathname.startsWith('/client') || pathname.startsWith('/guard')
                    ? 'text-white bg-white/10'
                    : 'text-emerald-400'
                }`}
              >
                <div className="w-4 h-4 flex items-center justify-center">
                  <i className={isAdmin ? 'ri-dashboard-3-line' : isClient ? 'ri-building-line' : 'ri-shield-check-line'}></i>
                </div>
                {isAdmin ? 'Dashboard' : isClient ? 'Client Portal' : 'Guard App'}
              </Link>
            )}

            {/* Mobile Super Admin link */}
            {isSuperAdmin && (
              <Link
                href="/admin"
                onClick={() => setMobileOpen(false)}
                className={`block px-4 py-3 rounded-lg text-sm font-medium flex items-center gap-2 ${
                  pathname.startsWith('/admin') ? 'text-white bg-white/10' : 'text-indigo-400'
                }`}
              >
                <div className="w-4 h-4 flex items-center justify-center">
                  <i className="ri-shield-star-line"></i>
                </div>
                Super Admin
              </Link>
            )}

            <div className="pt-3 border-t border-white/10 mt-2">
              {!currentUser ? (
                <>
                <Link href="/login" onClick={() => setMobileOpen(false)}
                    className="block px-4 py-3 text-sm font-medium text-gray-400 hover:text-white">
                    Login
                  </Link>
                  <Link
                    href="/demo"
                    onClick={() => setMobileOpen(false)}
                    className="block px-4 py-3 mt-2 text-sm font-semibold text-center bg-blue-600 text-white rounded-lg"
                  >
                    Book a Demo
                  </Link>
                </>
              ) : (
                <>
                  <p className="px-4 py-2 text-sm text-gray-500">
                    Signed in as {profile?.first_name} {profile?.last_name}
                  </p>
                  <button
                    onClick={() => { setMobileOpen(false); signOut(); }}
                    className="w-full text-left px-4 py-3 text-sm font-medium text-red-400 hover:bg-red-500/10 rounded-lg"
                  >
                    Sign Out
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </nav>
  );
}