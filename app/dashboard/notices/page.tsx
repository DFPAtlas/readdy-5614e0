'use client';

import { useCompanyNotices, SiteNotice, getStatusDot, CATEGORY_ICONS } from '@/lib/useSiteNotices';
import { useAuth } from '@/lib/auth';
import { useSites } from '@/lib/useSites';
import { useState } from 'react';
import Link from 'next/link';

const PRIORITY_COLORS: Record<string, { bg: string; text: string; border: string; dot: string }> = {
  Urgent: { bg: 'bg-red-500/10', text: 'text-red-400', border: 'border-red-500/20', dot: 'bg-red-500' },
  High: { bg: 'bg-orange-500/10', text: 'text-orange-400', border: 'border-orange-500/20', dot: 'bg-orange-500' },
  Normal: { bg: 'bg-blue-500/10', text: 'text-blue-400', border: 'border-blue-500/20', dot: 'bg-blue-500' },
  Low: { bg: 'bg-gray-500/10', text: 'text-gray-400', border: 'border-gray-500/20', dot: 'bg-gray-500' },
};

function CompactNoticeCard({ notice, siteName }: { notice: SiteNotice; siteName: string }) {
  const [expanded, setExpanded] = useState(false);
  const priority = PRIORITY_COLORS[notice.priority];
  const icon = CATEGORY_ICONS[notice.category];
  const isExpired = notice.expiry_date && new Date(notice.expiry_date) < new Date();

  const dateStr = new Date(notice.updated_at).toLocaleDateString('en-GB', {
    day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit',
  });

  return (
    <div className={`relative bg-[#0f172a]/70 backdrop-blur-sm border border-white/10 rounded-xl overflow-hidden transition-all hover:border-white/15 ${notice.pinned ? 'ring-1 ring-blue-500/30' : ''}`}>
      <div className="p-4">
        <div className="flex items-start gap-3">
          <div className={`w-8 h-8 flex items-center justify-center rounded-lg flex-shrink-0 ${priority.bg} border ${priority.border}`}>
            <i className={`${icon} ${priority.text} text-sm`}></i>
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="text-sm font-semibold text-white">{notice.title}</h3>
              <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium border ${priority.bg} ${priority.text} ${priority.border}`}>
                {notice.priority}
              </span>
              {notice.pinned && (
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400">
                  Pinned
                </span>
              )}
            </div>
            <div className="flex items-center gap-2 mt-1 text-xs text-gray-400">
              <span>{notice.category}</span>
              <span className="text-gray-600">|</span>
              <span>{dateStr}</span>
              <span className="text-gray-600">|</span>
              <Link href={`/dashboard/sites/${notice.site_id}/notices`} className="text-blue-400 hover:text-blue-300">
                {siteName}
              </Link>
            </div>
            <div className="text-sm text-gray-300 leading-relaxed mt-2">
              {expanded || notice.body.length <= 160 ? (
                <p>{notice.body}</p>
              ) : (
                <p>{notice.body.slice(0, 160)}...</p>
              )}
              {notice.body.length > 160 && (
                <button onClick={() => setExpanded(!expanded)} className="text-blue-400 text-xs mt-1 hover:text-blue-300 transition-colors cursor-pointer">
                  {expanded ? 'Show less' : 'Read more'}
                </button>
              )}
            </div>
            <div className="mt-2 flex items-center justify-between">
              <span className="text-xs text-gray-500">By {notice.updated_by_name || 'Unknown'}</span>
              {isExpired && <span className="text-[10px] text-red-400">Expired</span>}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function DashboardNoticesPage() {
  const { profile } = useAuth();
  const { notices, loading } = useCompanyNotices(profile?.company_id || null);
  const { sites } = useSites();
  const [filter, setFilter] = useState<'All' | 'Urgent' | 'Pinned'>('All');
  const [siteFilter, setSiteFilter] = useState<string>('all');
  const [showFilters, setShowFilters] = useState(false);

  const siteMap = new Map(sites.map((s) => [s.id, s.site_name]));

  const filtered = notices.filter((n) => {
    if (siteFilter !== 'all' && n.site_id !== siteFilter) return false;
    if (filter === 'Urgent') return n.priority === 'Urgent' || n.priority === 'High';
    if (filter === 'Pinned') return n.pinned;
    return true;
  });

  const countyHallId = sites.find((s) => s.site_name.toLowerCase().includes('county hall'))?.id;

  return (
    <div className="max-w-5xl mx-auto">
      <div className="flex flex-col md:flex-row md:items-start justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-white">Notice Board</h1>
          <p className="text-sm text-gray-400 mt-1">All site notices across your company</p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center gap-2 px-3 py-2 rounded-lg bg-[#0f172a]/60 border border-white/10 text-sm text-gray-300 hover:text-white hover:bg-[#0f172a] transition-colors cursor-pointer"
          >
            <div className="w-4 h-4 flex items-center justify-center">
              <i className="ri-filter-3-line text-sm"></i>
            </div>
            Filters
          </button>
          <Link
            href="/dashboard/notices/live"
            className="flex items-center gap-2 px-3 py-2 rounded-lg bg-blue-600/15 border border-blue-500/20 text-sm text-blue-400 hover:bg-blue-600/25 transition-colors whitespace-nowrap"
          >
            <div className="w-4 h-4 flex items-center justify-center">
              <i className="ri-live-line text-sm"></i>
            </div>
            Live Board
            <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
          </Link>
          <Link
            href="/dashboard/notices/kiosk"
            className="flex items-center gap-2 px-3 py-2 rounded-lg bg-emerald-600/15 border border-emerald-500/20 text-sm text-emerald-400 hover:bg-emerald-600/25 transition-colors"
          >
            <div className="w-4 h-4 flex items-center justify-center">
              <i className="ri-tv-line text-sm"></i>
            </div>
            Kiosk Mode
          </Link>
        </div>
      </div>

      {showFilters && (
        <div className="flex flex-wrap items-center gap-3 mb-6 p-4 bg-[#0f172a]/60 border border-white/10 rounded-xl">
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-400">Site:</span>
            <div className="relative">
              <button
                onClick={() => setSiteFilter(siteFilter === 'all' ? (countyHallId || 'all') : 'all')}
                className="flex items-center gap-2 px-3 py-2 rounded-lg bg-gray-800/60 border border-gray-700 text-sm text-white hover:bg-gray-800 transition-colors cursor-pointer"
              >
                {siteFilter === 'all' ? 'All Sites' : siteMap.get(siteFilter) || 'Unknown'}
                <div className="w-4 h-4 flex items-center justify-center">
                  <i className="ri-arrow-down-s-line text-gray-400"></i>
                </div>
              </button>
              {siteFilter !== 'all' && (
                <button
                  onClick={() => setSiteFilter('all')}
                  className="ml-2 text-xs text-gray-400 hover:text-white cursor-pointer"
                >
                  Clear
                </button>
              )}
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-400">Priority:</span>
            <div className="flex items-center gap-1 bg-[#0f172a]/60 border border-white/10 rounded-lg p-1">
              {(['All', 'Urgent', 'Pinned'] as const).map((tab) => (
                <button
                  key={tab}
                  onClick={() => setFilter(tab)}
                  className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors cursor-pointer whitespace-nowrap ${
                    filter === tab ? 'bg-blue-600/20 text-blue-400 border border-blue-500/20' : 'text-gray-400 hover:text-white'
                  }`}
                >
                  {tab}
                </button>
              ))}
            </div>
          </div>
          {countyHallId && siteFilter !== countyHallId && (
            <button
              onClick={() => setSiteFilter(countyHallId)}
              className="ml-auto flex items-center gap-2 px-3 py-2 rounded-lg bg-blue-600/15 border border-blue-500/20 text-sm text-blue-400 hover:bg-blue-600/25 transition-colors cursor-pointer"
            >
              <i className="ri-building-line"></i>
              View County Hall
            </button>
          )}
        </div>
      )}

      {!showFilters && (
        <div className="flex items-center gap-2 mb-6">
          <div className="flex items-center gap-1 bg-[#0f172a]/60 border border-white/10 rounded-lg p-1">
            {(['All', 'Urgent', 'Pinned'] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setFilter(tab)}
                className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors cursor-pointer whitespace-nowrap ${
                  filter === tab ? 'bg-blue-600/20 text-blue-400 border border-blue-500/20' : 'text-gray-400 hover:text-white'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>
          {siteFilter !== 'all' && (
            <span className="text-sm text-gray-400">
              for <span className="text-white font-medium">{siteMap.get(siteFilter)}</span>
              <button onClick={() => setSiteFilter('all')} className="ml-2 text-blue-400 hover:text-blue-300 cursor-pointer">Clear</button>
            </span>
          )}
        </div>
      )}

      {loading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-[#0f172a]/40 border border-white/5 rounded-xl p-4 animate-pulse">
              <div className="h-4 bg-gray-800/50 rounded w-1/3 mb-2" />
              <div className="h-3 bg-gray-800/50 rounded w-2/3" />
            </div>
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-16">
          <div className="w-14 h-14 flex items-center justify-center bg-gray-800/50 rounded-full mx-auto mb-4">
            <i className="ri-notification-off-line text-gray-500 text-xl"></i>
          </div>
          <h3 className="text-lg font-medium text-white mb-1">No notices</h3>
          <p className="text-sm text-gray-400">
            {filter === 'All' && siteFilter === 'all' ? 'No active notices across your sites.' : 
             filter === 'All' ? `No active notices for ${siteMap.get(siteFilter)}.` :
             `No ${filter.toLowerCase()} notices found.`}
          </p>
          {countyHallId && siteFilter !== countyHallId && (
            <button
              onClick={() => { setSiteFilter(countyHallId); setShowFilters(true); }}
              className="mt-4 flex items-center gap-2 mx-auto px-4 py-2 rounded-lg bg-blue-600/15 border border-blue-500/20 text-sm text-blue-400 hover:bg-blue-600/25 transition-colors cursor-pointer"
            >
              <i className="ri-building-line"></i>
              View County Hall Notices
            </button>
          )}
        </div>
      ) : (
        <div className="space-y-4">
          {filtered.map((notice) => (
            <CompactNoticeCard
              key={notice.id}
              notice={notice}
              siteName={siteMap.get(notice.site_id) || 'Unknown Site'}
            />
          ))}
        </div>
      )}
    </div>
  );
}