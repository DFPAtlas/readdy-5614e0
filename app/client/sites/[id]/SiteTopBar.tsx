'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/lib/auth';

interface SiteTopBarProps {
  siteName: string;
  status: string | null;
  riskLevel: string | null;
  onRefresh: () => void;
  onScrollToSettings: () => void;
}

const STATUS_STYLE: Record<string, string> = {
  active: 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400',
  inactive: 'bg-gray-500/10 border-gray-500/20 text-gray-400',
  suspended: 'bg-red-500/10 border-red-500/20 text-red-400',
  pending_setup: 'bg-amber-500/10 border-amber-500/20 text-amber-400',
};

export default function SiteTopBar({ siteName, status, riskLevel, onRefresh, onScrollToSettings }: SiteTopBarProps) {
  const { company, profile, signOut } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);
  const statusKey = status || 'active';
  const statusStyle = STATUS_STYLE[statusKey] || STATUS_STYLE.active;

  return (
    <header className="sticky top-0 z-50 bg-[#0f172a]/90 backdrop-blur-xl border-b border-white/10">
      <div className="px-4 sm:px-6 h-16 flex items-center justify-between gap-4">
        <div className="flex items-center gap-4 min-w-0">
          <div className="flex items-center gap-2.5 flex-shrink-0">
            {company?.logo_url ? (
              <img src={company.logo_url} alt="" className="h-8 w-auto" />
            ) : (
              <img
                src="https://storage.readdy-site.link/project_files/18288eee-63fa-4165-a658-6aa7ab020255/0f55097c-53e5-494b-b419-876152a51ee7_edited_image_d3fb89d4-4c94-480b-911a-a4f5576d177c_0.png?v=4a5cb4d0eb32cb9bee8b5acd1d9f9fa6"
                alt="GuardianHub"
                className="h-8 w-auto"
              />
            )}
          </div>

          <div className="h-6 w-px bg-white/10 flex-shrink-0 hidden sm:block"></div>

          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-8 h-8 rounded-lg bg-blue-600/20 border border-blue-500/20 flex items-center justify-center flex-shrink-0">
              <i className="ri-building-line text-blue-400 text-sm"></i>
            </div>
            <div className="min-w-0">
              <p className="text-sm font-semibold text-white truncate">{siteName || 'Site Dashboard'}</p>
              <div className="flex items-center gap-1.5">
                <span className={`text-[10px] px-1.5 py-0.5 rounded border font-medium capitalize ${statusStyle}`}>
                  {String(statusKey).replace('_', ' ')}
                </span>
                {riskLevel && (
                  <span className="text-[10px] text-gray-500 capitalize">{riskLevel} risk</span>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 flex-shrink-0">
          <button
            onClick={onRefresh}
            className="inline-flex items-center gap-1.5 px-3 py-2 bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white text-xs font-medium rounded-lg transition-colors cursor-pointer whitespace-nowrap border border-white/10"
          >
            <div className="w-3.5 h-3.5 flex items-center justify-center"><i className="ri-refresh-line"></i></div>
            <span className="hidden sm:inline">Refresh</span>
          </button>

          <button
            onClick={onScrollToSettings}
            className="inline-flex items-center gap-1.5 px-3 py-2 bg-blue-600/20 hover:bg-blue-600/30 text-blue-400 hover:text-blue-300 text-xs font-medium rounded-lg transition-colors cursor-pointer whitespace-nowrap border border-blue-500/20"
          >
            <div className="w-3.5 h-3.5 flex items-center justify-center"><i className="ri-settings-3-line"></i></div>
            <span className="hidden sm:inline">Site Settings</span>
          </button>

          <Link
            href="/client/sites"
            className="inline-flex items-center gap-1.5 px-3 py-2 bg-white/5 hover:bg-white/10 text-gray-300 hover:text-white text-xs font-medium rounded-lg transition-colors cursor-pointer whitespace-nowrap border border-white/10"
          >
            <div className="w-3.5 h-3.5 flex items-center justify-center"><i className="ri-apps-line"></i></div>
            <span className="hidden md:inline">All Sites</span>
          </Link>

          <Link
            href="/client"
            className="inline-flex items-center gap-1.5 px-3 py-2 bg-white/5 hover:bg-white/10 text-gray-300 hover:text-white text-xs font-medium rounded-lg transition-colors cursor-pointer whitespace-nowrap border border-white/10"
          >
            <div className="w-3.5 h-3.5 flex items-center justify-center"><i className="ri-arrow-left-line"></i></div>
            <span className="hidden md:inline">Company</span>
          </Link>

          <div className="relative">
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              className="w-9 h-9 rounded-full flex items-center justify-center text-white text-sm font-semibold bg-blue-600 cursor-pointer"
            >
              {`${profile?.first_name?.[0] || ''}${profile?.last_name?.[0] || ''}`.toUpperCase() || 'C'}
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
                    href="/client"
                    onClick={() => setMenuOpen(false)}
                    className="flex items-center gap-2 px-4 py-2 text-sm text-gray-400 hover:bg-white/5 hover:text-white cursor-pointer"
                  >
                    <div className="w-4 h-4 flex items-center justify-center"><i className="ri-dashboard-line"></i></div>
                    Company Dashboard
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
    </header>
  );
}