'use client';

import { useCompanyNotices } from '@/lib/useSiteNotices';
import { useAuth } from '@/lib/auth';
import { useSites } from '@/lib/useSites';
import Link from 'next/link';

export default function DashboardNoticesWidget() {
  const { profile } = useAuth();
  const { notices, loading } = useCompanyNotices(profile?.company_id || null);
  const { sites } = useSites();
  const siteMap = new Map(sites.map((s) => [s.id, s.site_name]));

  const urgentCount = notices.filter((n) => n.priority === 'Urgent' || n.priority === 'High').length;
  const pinnedCount = notices.filter((n) => n.pinned).length;

  return (
    <div className="bg-[#111827] border border-gray-800 rounded-xl overflow-hidden">
      <div className="flex items-center justify-between px-5 py-4 border-b border-gray-800">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 flex items-center justify-center rounded-lg bg-blue-600/15">
            <i className="ri-notification-3-line text-blue-400 text-sm"></i>
          </div>
          <div>
            <h3 className="text-sm font-semibold text-white">Notice Board</h3>
            <p className="text-xs text-gray-400">Live site notices</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {urgentCount > 0 && (
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-red-500/10 text-red-400 border border-red-500/20 font-medium">
              {urgentCount} urgent
            </span>
          )}
          {pinnedCount > 0 && (
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/20 font-medium">
              {pinnedCount} pinned
            </span>
          )}
        </div>
      </div>

      <div className="p-4">
        {loading ? (
          <div className="space-y-3">
            {[1, 2].map((i) => (
              <div key={i} className="h-12 bg-gray-800/40 rounded-lg animate-pulse" />
            ))}
          </div>
        ) : notices.length === 0 ? (
          <div className="text-center py-5">
            <div className="w-10 h-10 flex items-center justify-center bg-gray-800/50 rounded-full mx-auto mb-2">
              <i className="ri-notification-off-line text-gray-500"></i>
            </div>
            <p className="text-xs text-gray-400">No active notices</p>
          </div>
        ) : (
          <div className="space-y-3">
            {notices.slice(0, 3).map((notice) => {
              const isUrgent = notice.priority === 'Urgent' || notice.priority === 'High';
              return (
                <Link
                  key={notice.id}
                  href={`/dashboard/sites/${notice.site_id}/notices`}
                  className="flex items-start gap-3 p-3 rounded-lg bg-gray-800/30 hover:bg-gray-800/50 transition-colors group"
                >
                  <div className={`w-2 h-2 rounded-full mt-1.5 flex-shrink-0 ${isUrgent ? 'bg-red-500' : 'bg-blue-500'}`} />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-white truncate group-hover:text-blue-400 transition-colors">
                      {notice.title}
                    </p>
                    <div className="flex items-center gap-2 mt-0.5 text-xs text-gray-400">
                      <span>{siteMap.get(notice.site_id) || 'Unknown Site'}</span>
                      <span className="text-gray-600">|</span>
                      <span className={isUrgent ? 'text-red-400' : ''}>{notice.priority}</span>
                    </div>
                  </div>
                  {notice.pinned && (
                    <div className="w-5 h-5 flex items-center justify-center flex-shrink-0">
                      <i className="ri-pushpin-line text-blue-400 text-xs"></i>
                    </div>
                  )}
                </Link>
              );
            })}
          </div>
        )}
      </div>

      <div className="px-4 py-3 border-t border-gray-800">
        <Link
          href="/dashboard/notices"
          className="flex items-center justify-center gap-2 text-sm text-blue-400 hover:text-blue-300 transition-colors"
        >
          <span>View all notices</span>
          <div className="w-4 h-4 flex items-center justify-center">
            <i className="ri-arrow-right-line text-xs"></i>
          </div>
        </Link>
      </div>
    </div>
  );
}