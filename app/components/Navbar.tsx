'use client';

import Link from 'next/link';
import { useState, useEffect, useRef } from 'react';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/lib/auth';

const productLinks = [
  { href: '/features/command-centre', label: 'Command Centre', icon: 'ri-dashboard-3-line' },
  { href: '/features/guard-management', label: 'Guard Management', icon: 'ri-shield-user-line' },
  { href: '/features/rota-scheduling', label: 'Rota & Scheduling', icon: 'ri-calendar-check-line' },
  { href: '/features/attendance', label: 'Attendance', icon: 'ri-time-line' },
  { href: '/features/patrols', label: 'Patrols', icon: 'ri-route-line' },
  { href: '/features/incidents', label: 'Incidents', icon: 'ri-alert-line' },
  { href: '/features/lone-worker-sos', label: 'Lone Worker & SOS', icon: 'ri-shield-flash-line' },
  { href: '/features/compliance', label: 'Compliance', icon: 'ri-file-shield-line' },
  { href: '/features/client-portal', label: 'Client Portal', icon: 'ri-briefcase-line' },
  { href: '/features/reports', label: 'Reports', icon: 'ri-file-chart-line' },
  { href: '/features/finance', label: 'Finance', icon: 'ri-money-pound-circle-line' },
  { href: '/features/automations', label: 'Automations', icon: 'ri-robot-2-line' },
  { href: '/features/integrations', label: 'Integrations', icon: 'ri-plug-line' },
];

const solutionLinks = [
  { href: '/solutions/security-guarding', label: 'Security Guarding Companies', icon: 'ri-building-2-line' },
  { href: '/solutions/mobile-patrol', label: 'Mobile Patrol Services', icon: 'ri-car-line' },
  { href: '/solutions/event-security', label: 'Event Security', icon: 'ri-calendar-event-line' },
  { href: '/solutions/corporate-security', label: 'Corporate Security', icon: 'ri-building-line' },
  { href: '/solutions/retail-security', label: 'Retail Security', icon: 'ri-store-2-line' },
  { href: '/solutions/construction-security', label: 'Construction Security', icon: 'ri-hammer-line' },
  { href: '/solutions/keyholding-alarm-response', label: 'Keyholding & Alarm Response', icon: 'ri-key-2-line' },
];

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [productOpen, setProductOpen] = useState(false);
  const [solutionsOpen, setSolutionsOpen] = useState(false);
  const [resourcesOpen, setResourcesOpen] = useState(false);
  const pathname = usePathname();
  const { currentUser, profile, isLoading, signOut } = useAuth();

  const productRef = useRef<HTMLDivElement>(null);
  const solutionsRef = useRef<HTMLDivElement>(null);
  const resourcesRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (productRef.current && !productRef.current.contains(e.target as Node)) setProductOpen(false);
      if (solutionsRef.current && !solutionsRef.current.contains(e.target as Node)) setSolutionsOpen(false);
      if (resourcesRef.current && !resourcesRef.current.contains(e.target as Node)) setResourcesOpen(false);
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const isActive = (href: string) => pathname === href || pathname.startsWith(href + '/');

  const isAdmin = profile && ['super_admin', 'company_admin', 'operations_manager'].includes(profile.role);
  const isSuperAdmin = profile?.role === 'super_admin';
  const isClient = profile?.role === 'client';
  const isGuard = profile?.role === 'guard';

  const dashboardLink = isAdmin ? '/dashboard' : isClient ? '/client' : isGuard ? '/guard' : null;

  const closeAll = () => {
    setProductOpen(false);
    setSolutionsOpen(false);
    setResourcesOpen(false);
    setMobileOpen(false);
  };

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${scrolled ? 'bg-[#0a0e1a]/95 backdrop-blur-xl border-b border-white/10' : 'bg-transparent'}`}
    >
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 lg:h-20">
          <Link href="/" className="flex items-center gap-2.5 cursor-pointer" onClick={closeAll}>
            <img
              src="https://public.readdy.ai/ai/img_res/5b8fa21e-164b-4f73-ae11-f3bfe2d13e58.png"
              alt="GuardianHub"
              className="h-8 w-auto"
            />
          </Link>

          <div className="hidden lg:flex items-center gap-1">
            {/* Product Dropdown */}
            <div className="relative" ref={productRef}>
              <button
                onClick={() => { setProductOpen(!productOpen); setSolutionsOpen(false); setResourcesOpen(false); }}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors cursor-pointer flex items-center gap-1 whitespace-nowrap ${productOpen ? 'text-white bg-white/10' : 'text-gray-400 hover:text-white hover:bg-white/5'}`}
              >
                Product
                <div className="w-4 h-4 flex items-center justify-center">
                  <i className={`ri-arrow-down-s-line transition-transform ${productOpen ? 'rotate-180' : ''}`}></i>
                </div>
              </button>
              {productOpen && (
                <div className="absolute top-full left-0 mt-2 w-72 bg-[#0f172a] border border-white/10 rounded-xl overflow-hidden shadow-2xl z-50">
                  <div className="p-2">
                    {productLinks.map((link) => (
                      <Link
                        key={link.href}
                        href={link.href}
                        onClick={closeAll}
                        className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors cursor-pointer ${isActive(link.href) ? 'text-white bg-white/10' : 'text-gray-400 hover:text-white hover:bg-white/5'}`}
                      >
                        <div className="w-5 h-5 flex items-center justify-center">
                          <i className={link.icon}></i>
                        </div>
                        {link.label}
                      </Link>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Solutions Dropdown */}
            <div className="relative" ref={solutionsRef}>
              <button
                onClick={() => { setSolutionsOpen(!solutionsOpen); setProductOpen(false); setResourcesOpen(false); }}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors cursor-pointer flex items-center gap-1 whitespace-nowrap ${solutionsOpen ? 'text-white bg-white/10' : 'text-gray-400 hover:text-white hover:bg-white/5'}`}
              >
                Solutions
                <div className="w-4 h-4 flex items-center justify-center">
                  <i className={`ri-arrow-down-s-line transition-transform ${solutionsOpen ? 'rotate-180' : ''}`}></i>
                </div>
              </button>
              {solutionsOpen && (
                <div className="absolute top-full left-0 mt-2 w-72 bg-[#0f172a] border border-white/10 rounded-xl overflow-hidden shadow-2xl z-50">
                  <div className="p-2">
                    {solutionLinks.map((link) => (
                      <Link
                        key={link.href}
                        href={link.href}
                        onClick={closeAll}
                        className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors cursor-pointer ${isActive(link.href) ? 'text-white bg-white/10' : 'text-gray-400 hover:text-white hover:bg-white/5'}`}
                      >
                        <div className="w-5 h-5 flex items-center justify-center">
                          <i className={link.icon}></i>
                        </div>
                        {link.label}
                      </Link>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <Link
              href="/pricing"
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors cursor-pointer whitespace-nowrap ${isActive('/pricing') ? 'text-white bg-white/10' : 'text-gray-400 hover:text-white hover:bg-white/5'}`}
            >
              Pricing
            </Link>

            <Link
              href="/demo"
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors cursor-pointer whitespace-nowrap ${isActive('/demo') ? 'text-white bg-white/10' : 'text-gray-400 hover:text-white hover:bg-white/5'}`}
            >
              Demo
            </Link>

            {/* Resources Dropdown */}
            <div className="relative" ref={resourcesRef}>
              <button
                onClick={() => { setResourcesOpen(!resourcesOpen); setProductOpen(false); setSolutionsOpen(false); }}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors cursor-pointer flex items-center gap-1 whitespace-nowrap ${resourcesOpen ? 'text-white bg-white/10' : 'text-gray-400 hover:text-white hover:bg-white/5'}`}
              >
                Resources
                <div className="w-4 h-4 flex items-center justify-center">
                  <i className={`ri-arrow-down-s-line transition-transform ${resourcesOpen ? 'rotate-180' : ''}`}></i>
                </div>
              </button>
              {resourcesOpen && (
                <div className="absolute top-full left-0 mt-2 w-56 bg-[#0f172a] border border-white/10 rounded-xl overflow-hidden shadow-2xl z-50">
                  <div className="p-2">
                    {[
                      { href: '/blog', label: 'Blog', icon: 'ri-article-line' },
                      { href: '/case-studies', label: 'Case Studies', icon: 'ri-trophy-line' },
                      { href: '/resources', label: 'Resource Centre', icon: 'ri-book-open-line' },
                      { href: '/docs', label: 'Documentation', icon: 'ri-file-list-3-line' },
                      { href: '/help', label: 'Help Centre', icon: 'ri-question-line' },
                      { href: '/academy', label: 'Academy', icon: 'ri-graduation-cap-line' },
                      { href: '/updates', label: 'Updates', icon: 'ri-megaphone-line' },
                      { href: '/security', label: 'Trust & Security', icon: 'ri-shield-check-line' },
                    ].map((link) => (
                      <Link
                        key={link.href}
                        href={link.href}
                        onClick={closeAll}
                        className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors cursor-pointer ${isActive(link.href) ? 'text-white bg-white/10' : 'text-gray-400 hover:text-white hover:bg-white/5'}`}
                      >
                        <div className="w-5 h-5 flex items-center justify-center">
                          <i className={link.icon}></i>
                        </div>
                        {link.label}
                      </Link>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Logged-in dashboard link */}
            {!isLoading && currentUser && dashboardLink && (
              <Link
                href={dashboardLink}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors cursor-pointer flex items-center gap-1.5 whitespace-nowrap ${isActive(dashboardLink) ? 'text-white bg-white/10' : 'text-emerald-400 hover:text-emerald-300 hover:bg-emerald-500/10'}`}
              >
                <div className="w-4 h-4 flex items-center justify-center">
                  <i className={isAdmin ? 'ri-dashboard-3-line' : isClient ? 'ri-building-line' : 'ri-shield-check-line'}></i>
                </div>
                {isAdmin ? 'Dashboard' : isClient ? 'Client Portal' : 'Guard App'}
              </Link>
            )}

            {!isLoading && isSuperAdmin && (
              <Link
                href="/admin"
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors cursor-pointer flex items-center gap-1.5 whitespace-nowrap ${isActive('/admin') ? 'text-white bg-white/10' : 'text-indigo-400 hover:text-indigo-300 hover:bg-indigo-500/10'}`}
              >
                <div className="w-4 h-4 flex items-center justify-center">
                  <i className="ri-shield-star-line"></i>
                </div>
                Admin
              </Link>
            )}
          </div>

          <div className="hidden lg:flex items-center gap-3">
            {!currentUser ? (
              <>
                <Link
                  href="/login"
                  className="px-4 py-2 text-sm font-medium text-gray-300 hover:text-white transition-colors cursor-pointer whitespace-nowrap"
                >
                  Sign In
                </Link>
                <Link
                  href="/signup"
                  className="px-4 py-2 text-sm font-medium text-blue-400 hover:text-blue-300 transition-colors cursor-pointer whitespace-nowrap"
                >
                  Start Trial
                </Link>
                <Link
                  href="/demo"
                  className="px-5 py-2.5 bg-blue-600 hover:bg-blue-500 text-white text-sm font-semibold rounded-lg transition-colors cursor-pointer whitespace-nowrap"
                >
                  Book a Demo
                </Link>
              </>
            ) : (
              <>
                <span className="text-sm text-gray-400">{profile?.first_name} {profile?.last_name}</span>
                <button
                  onClick={() => signOut()}
                  className="px-4 py-2 text-sm font-medium text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-lg transition-colors cursor-pointer whitespace-nowrap"
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
        <div className="lg:hidden bg-[#0a0e1a]/95 backdrop-blur-xl border-t border-white/10 max-h-[80vh] overflow-y-auto">
          <div className="px-6 py-4 space-y-1">
            <p className="px-4 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wider">Product</p>
            {productLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMobileOpen(false)}
                className={`flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium ${isActive(link.href) ? 'text-white bg-white/10' : 'text-gray-400 hover:text-white hover:bg-white/5'}`}
              >
                <div className="w-5 h-5 flex items-center justify-center">
                  <i className={link.icon}></i>
                </div>
                {link.label}
              </Link>
            ))}

            <p className="px-4 py-2 mt-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Solutions</p>
            {solutionLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMobileOpen(false)}
                className={`flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium ${isActive(link.href) ? 'text-white bg-white/10' : 'text-gray-400 hover:text-white hover:bg-white/5'}`}
              >
                <div className="w-5 h-5 flex items-center justify-center">
                  <i className={link.icon}></i>
                </div>
                {link.label}
              </Link>
            ))}

            <div className="border-t border-white/10 my-2" />

            <Link href="/pricing" onClick={() => setMobileOpen(false)} className={`block px-4 py-2.5 rounded-lg text-sm font-medium ${isActive('/pricing') ? 'text-white bg-white/10' : 'text-gray-400 hover:text-white hover:bg-white/5'}`}>Pricing</Link>
            <Link href="/demo" onClick={() => setMobileOpen(false)} className={`block px-4 py-2.5 rounded-lg text-sm font-medium ${isActive('/demo') ? 'text-white bg-white/10' : 'text-gray-400 hover:text-white hover:bg-white/5'}`}>Demo</Link>
            <Link href="/security" onClick={() => setMobileOpen(false)} className={`block px-4 py-2.5 rounded-lg text-sm font-medium ${isActive('/security') ? 'text-white bg-white/10' : 'text-gray-400 hover:text-white hover:bg-white/5'}`}>Trust & Security</Link>
            <Link href="/resources" onClick={() => setMobileOpen(false)} className={`block px-4 py-2.5 rounded-lg text-sm font-medium ${isActive('/resources') ? 'text-white bg-white/10' : 'text-gray-400 hover:text-white hover:bg-white/5'}`}>Resource Centre</Link>
            <Link href="/docs" onClick={() => setMobileOpen(false)} className={`block px-4 py-2.5 rounded-lg text-sm font-medium ${isActive('/docs') ? 'text-white bg-white/10' : 'text-gray-400 hover:text-white hover:bg-white/5'}`}>Documentation</Link>
            <Link href="/help" onClick={() => setMobileOpen(false)} className={`block px-4 py-2.5 rounded-lg text-sm font-medium ${isActive('/help') ? 'text-white bg-white/10' : 'text-gray-400 hover:text-white hover:bg-white/5'}`}>Help Centre</Link>
            <Link href="/academy" onClick={() => setMobileOpen(false)} className={`block px-4 py-2.5 rounded-lg text-sm font-medium ${isActive('/academy') ? 'text-white bg-white/10' : 'text-gray-400 hover:text-white hover:bg-white/5'}`}>Academy</Link>
            <Link href="/updates" onClick={() => setMobileOpen(false)} className={`block px-4 py-2.5 rounded-lg text-sm font-medium ${isActive('/updates') ? 'text-white bg-white/10' : 'text-gray-400 hover:text-white hover:bg-white/5'}`}>Updates</Link>
            <Link href="/blog" onClick={() => setMobileOpen(false)} className={`block px-4 py-2.5 rounded-lg text-sm font-medium ${isActive('/blog') ? 'text-white bg-white/10' : 'text-gray-400 hover:text-white hover:bg-white/5'}`}>Blog</Link>
            <Link href="/case-studies" onClick={() => setMobileOpen(false)} className={`block px-4 py-2.5 rounded-lg text-sm font-medium ${isActive('/case-studies') ? 'text-white bg-white/10' : 'text-gray-400 hover:text-white hover:bg-white/5'}`}>Case Studies</Link>
            <Link href="/about" onClick={() => setMobileOpen(false)} className={`block px-4 py-2.5 rounded-lg text-sm font-medium ${isActive('/about') ? 'text-white bg-white/10' : 'text-gray-400 hover:text-white hover:bg-white/5'}`}>About</Link>
            <Link href="/contact" onClick={() => setMobileOpen(false)} className={`block px-4 py-2.5 rounded-lg text-sm font-medium ${isActive('/contact') ? 'text-white bg-white/10' : 'text-gray-400 hover:text-white hover:bg-white/5'}`}>Contact</Link>

            {/* Mobile auth links */}
            {dashboardLink && (
              <Link href={dashboardLink} onClick={() => setMobileOpen(false)} className={`block px-4 py-2.5 rounded-lg text-sm font-medium flex items-center gap-2 ${isActive(dashboardLink) ? 'text-white bg-white/10' : 'text-emerald-400'}`}>
                <div className="w-4 h-4 flex items-center justify-center">
                  <i className={isAdmin ? 'ri-dashboard-3-line' : isClient ? 'ri-building-line' : 'ri-shield-check-line'}></i>
                </div>
                {isAdmin ? 'Dashboard' : isClient ? 'Client Portal' : 'Guard App'}
              </Link>
            )}
            {isSuperAdmin && (
              <Link href="/admin" onClick={() => setMobileOpen(false)} className={`block px-4 py-2.5 rounded-lg text-sm font-medium flex items-center gap-2 ${isActive('/admin') ? 'text-white bg-white/10' : 'text-indigo-400'}`}>
                <div className="w-4 h-4 flex items-center justify-center"><i className="ri-shield-star-line"></i></div>
                Admin
              </Link>
            )}

            <div className="pt-3 border-t border-white/10 mt-2">
              {!currentUser ? (
                <>
                  <Link href="/login" onClick={() => setMobileOpen(false)} className="block px-4 py-3 text-sm font-medium text-gray-400 hover:text-white">Sign In</Link>
                  <Link href="/signup" onClick={() => setMobileOpen(false)} className="block px-4 py-3 mt-2 text-sm font-medium text-blue-400 hover:text-blue-300">Start Trial</Link>
                  <Link href="/demo" onClick={() => setMobileOpen(false)} className="block px-4 py-3 mt-2 text-sm font-semibold text-center bg-blue-600 text-white rounded-lg">Book a Demo</Link>
                </>
              ) : (
                <>
                  <p className="px-4 py-2 text-sm text-gray-500">Signed in as {profile?.first_name} {profile?.last_name}</p>
                  <button onClick={() => { setMobileOpen(false); signOut(); }} className="w-full text-left px-4 py-3 text-sm font-medium text-red-400 hover:bg-red-500/10 rounded-lg">Sign Out</button>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </nav>
  );
}