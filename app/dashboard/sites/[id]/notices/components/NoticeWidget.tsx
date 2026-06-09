'use client';

import { useSiteNotices } from '@/lib/useSiteNotices';
import Link from 'next/link';

interface NoticeWidgetProps {
  siteId: string;
  siteName: string;
}

const PRIORITY_DOT: Record<string, string> = {
  Urgent: 'bg-red-500',
  High: 'bg-orange-500',
  Normal: 'bg-blue-500',
  Low: 'bg-gray-500',
};

export default function NoticeWidget({ siteId, siteName }: NoticeWidgetProps) {
  const { notices, loading } = useSiteNotices(siteId);

  const activeNotices = notices.filter((n) => n.status === 'active').slice(0, 3);

  return (
    <div className="bg-[#0f172a]/70 backdrop-blur-sm border border-white/10 rounded-xl overflow-hidden">
      <div className="px-5 py-4 border-b border-white/10 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 flex items-center justify-center bg-blue-500/10 rounded-lg border border-blue-500/20">
            <i className="ri-article-line text-blue-400 text-sm"></i>
          </div>
          <div>
            <h3 className="text-sm font-semibold text-white">Site Notices</h3>
            <p className="text-[11px] text-gray-400">Latest updates for {siteName}</p>
          </div>
        </div>
        <Link
          href={`/dashboard/sites/${siteId}/notices`}
          className="text-xs text-blue-400 hover:text-blue-300 transition-colors cursor-pointer flex items-center gap-1"
        >
          View all
          <div className="w-3.5 h-3.5 flex items-center justify-center"><i className="ri-arrow-right-line"></i></div>
        </Link>
      </div>

      <div className="p-4 space-y-2.5">
        {loading ? (
          <div className="space-y-2.5">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex items-start gap-2.5 animate-pulse">
                <div className="w-2 h-2 rounded-full bg-white/5 mt-1.5 flex-shrink-0" />
                <div className="flex-1 space-y-1.5">
                  <div className="h-3 bg-white/5 rounded w-3/4" />
                  <div className="h-2 bg-white/5 rounded w-1/2" />
                </div>
              </div>
            ))}
          </div>
        ) : activeNotices.length === 0 ? (
          <div className="text-center py-4">
            <p className="text-xs text-gray-400">No active notices</p>
          </div>
        ) : (
          activeNotices.map((notice) => (
            <Link
              key={notice.id}
              href={`/dashboard/sites/${siteId}/notices`}
              className="flex items-start gap-2.5 p-2.5 rounded-lg hover:bg-white/5 transition-colors cursor-pointer group"
            >
              <div className={`w-2 h-2 rounded-full mt-1.5 flex-shrink-0 ${PRIORITY_DOT[notice.priority] || 'bg-gray-500'}`} />
              <div className="flex-1 min-w-0">
                <p className="text-xs font-medium text-white group-hover:text-blue-300 transition-colors truncate">
                  {notice.title}
                </p>
                <p className="text-[11px] text-gray-400 truncate mt-0.5">{notice.body.slice(0, 60)}{notice.body.length > 60 ? '...' : ''}</p>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-[10px] text-gray-500">{notice.category}</span>
                  <span className="text-[10px] text-gray-600">|</span>
                  <span className="text-[10px] text-gray-500">
                    {new Date(notice.updated_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}
                  </span>
                </div>
              </div>
              {notice.pinned && (
                <div className="w-5 h-5 flex items-center justify-center text-blue-400 flex-shrink-0">
                  <i className="ri-pushpin-line text-xs"></i>
                </div>
              )}
            </Link>
          ))
        )}
      </div>
    </div>
  );
}