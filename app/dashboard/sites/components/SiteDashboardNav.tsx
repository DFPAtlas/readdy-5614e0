'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { supabase } from '@/lib/supabase';

export default function SiteDashboardNav() {
  const pathname = usePathname();
  const [siteName, setSiteName] = useState<string | null>(null);
  const [siteId, setSiteId] = useState<string | null>(null);

  useEffect(() => {
    const match = pathname.match(/\/dashboard\/sites\/([^/]+)/);
    if (match) {
      const id = match[1];
      setSiteId(id);
      supabase
        .from('sites')
        .select('site_name')
        .eq('id', id)
        .maybeSingle()
        .then(({ data }) => {
          if (data) setSiteName(data.site_name);
          else setSiteName('Unknown Site');
        });
    } else {
      setSiteId(null);
      setSiteName(null);
    }
  }, [pathname]);

  const isNotices = pathname.includes('/notices');

  if (!siteId) return null;

  return (
    <div className="bg-[#0f172a] border-b border-gray-800">
      <div className="max-w-[1600px] mx-auto px-4 lg:px-6">
        <div className="flex items-center h-14 gap-4">
          <Link
            href="/dashboard"
            className="flex items-center gap-2 text-sm text-gray-400 hover:text-white transition-colors cursor-pointer whitespace-nowrap"
          >
            <div className="w-4 h-4 flex items-center justify-center">
              <i className="ri-arrow-left-line"></i>
            </div>
            <span className="hidden sm:inline">Operations</span>
          </Link>

          <div className="w-px h-6 bg-gray-700"></div>

          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-blue-600/20 flex items-center justify-center">
              <i className="ri-building-line text-blue-400 text-sm"></i>
            </div>
            <span className="text-white font-semibold text-sm truncate max-w-[200px]">
              {siteName || 'Loading...'}
            </span>
          </div>

          <div className="flex-1"></div>

          <nav className="flex items-center gap-1">
            <Link
              href={`/dashboard/sites/${siteId}`}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors cursor-pointer whitespace-nowrap ${
                !isNotices
                  ? 'bg-blue-600/20 text-blue-400'
                  : 'text-gray-400 hover:text-white hover:bg-gray-800/50'
              }`}
            >
              Overview
            </Link>
            <Link
              href={`/dashboard/sites/${siteId}/notices`}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors cursor-pointer whitespace-nowrap ${
                isNotices
                  ? 'bg-blue-600/20 text-blue-400'
                  : 'text-gray-400 hover:text-white hover:bg-gray-800/50'
              }`}
            >
              Notices
            </Link>
          </nav>

          <div className="w-px h-6 bg-gray-700"></div>

          <Link
            href="/dashboard/sites"
            className="flex items-center gap-1.5 text-sm text-gray-400 hover:text-white transition-colors cursor-pointer whitespace-nowrap"
          >
            <div className="w-4 h-4 flex items-center justify-center">
              <i className="ri-grid-line"></i>
            </div>
            <span className="hidden sm:inline">All Sites</span>
          </Link>
        </div>
      </div>
    </div>
  );
}