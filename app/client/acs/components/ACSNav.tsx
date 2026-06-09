'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

const TABS = [
  { label: 'Dashboard', href: '/client/acs', icon: 'ri-dashboard-3-line' },
  { label: 'Evidence', href: '/client/acs/evidence', icon: 'ri-folder-upload-line' },
  { label: 'Staff', href: '/client/acs/staff', icon: 'ri-user-settings-line' },
  { label: 'Sites', href: '/client/acs/sites', icon: 'ri-building-3-line' },
  { label: 'Policies', href: '/client/acs/policies', icon: 'ri-file-shield-line' },
  { label: 'Tracker', href: '/client/acs/tracker', icon: 'ri-list-check-2' },
  { label: 'Actions', href: '/client/acs/actions', icon: 'ri-alert-line' },
  { label: 'Export', href: '/client/acs/export', icon: 'ri-download-2-line' },
  { label: 'AI Assistant', href: '/client/acs/ai-assistant', icon: 'ri-sparkling-line' },
];

export default function ACSNav() {
  const pathname = usePathname();

  return (
    <div className="mb-6">
      <div className="flex items-center gap-2 mb-3">
        <div className="w-8 h-8 flex items-center justify-center bg-amber-500/15 rounded-lg">
          <i className="ri-shield-star-line text-amber-400"></i>
        </div>
        <div>
          <h1 className="text-lg font-semibold text-white">SIA ACS Assessment Hub</h1>
          <p className="text-xs text-gray-500">Approved Contractor Scheme readiness</p>
        </div>
      </div>
      <nav className="flex items-center gap-1 overflow-x-auto pb-1">
        {TABS.map((tab) => {
          const isActive = pathname === tab.href || (tab.href !== '/client/acs' && pathname.startsWith(tab.href + '/'));
          return (
            <Link
              key={tab.href}
              href={tab.href}
              className={`flex-shrink-0 px-3 py-2 rounded-lg text-sm font-medium transition-colors cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
                isActive ? 'bg-amber-500/15 text-amber-400 border border-amber-500/20' : 'text-gray-400 hover:text-white hover:bg-white/5'
              }`}
            >
              <div className="w-4 h-4 flex items-center justify-center">
                <i className={tab.icon}></i>
              </div>
              {tab.label}
            </Link>
          );
        })}
      </nav>
    </div>
  );
}