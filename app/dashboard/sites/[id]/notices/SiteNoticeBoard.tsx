'use client';

import { useState } from 'react';
import { useAuth } from '@/lib/auth';
import { useMyPermissions } from '@/lib/usePermissions';
import Link from 'next/link';
import GuardsThisWeek from './components/GuardsThisWeek';
import NoticeList from './components/NoticeList';
import NoticeForm from './components/NoticeForm';

export default function SiteNoticeBoard({ siteId }: { siteId: string }) {
  const { profile, companyId } = useAuth();
  const { can } = useMyPermissions(profile?.id || null, companyId);
  const [showForm, setShowForm] = useState(false);

  const canManage = can('sites', 'edit') || can('sites', 'manage');

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-6 space-y-8">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm text-gray-400">
        <Link href="/dashboard/sites" className="hover:text-white transition-colors cursor-pointer">Sites</Link>
        <div className="w-4 h-4 flex items-center justify-center"><i className="ri-arrow-right-s-line"></i></div>
        <Link href={`/dashboard/sites/${siteId}`} className="hover:text-white transition-colors cursor-pointer">Site Detail</Link>
        <div className="w-4 h-4 flex items-center justify-center"><i className="ri-arrow-right-s-line"></i></div>
        <span className="text-white font-medium">Notice Board</span>
      </div>

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Site Notice Board</h1>
          <p className="text-sm text-gray-400 mt-1">Guards, notices and site communications</p>
        </div>
        {canManage && (
          <button
            onClick={() => setShowForm(true)}
            className="flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-white bg-blue-600 rounded-xl hover:bg-blue-500 transition-colors cursor-pointer whitespace-nowrap"
          >
            <div className="w-4 h-4 flex items-center justify-center"><i className="ri-add-line"></i></div>
            Create Notice
          </button>
        )}
      </div>

      {/* Guards Working This Week */}
      <section>
        <div className="flex items-center gap-2.5 mb-4">
          <div className="w-8 h-8 flex items-center justify-center bg-emerald-500/10 rounded-lg border border-emerald-500/20">
            <i className="ri-team-line text-emerald-400 text-sm"></i>
          </div>
          <h2 className="text-lg font-semibold text-white">Guards Working This Week</h2>
        </div>
        <GuardsThisWeek siteId={siteId} />
      </section>

      {/* Site Notices */}
      <section>
        <div className="flex items-center gap-2.5 mb-4">
          <div className="w-8 h-8 flex items-center justify-center bg-amber-500/10 rounded-lg border border-amber-500/20">
            <i className="ri-article-line text-amber-400 text-sm"></i>
          </div>
          <h2 className="text-lg font-semibold text-white">Site Notices</h2>
        </div>
        <NoticeList siteId={siteId} canManage={canManage} />
      </section>

      {showForm && (
        <NoticeForm
          siteId={siteId}
          onClose={() => setShowForm(false)}
          onSave={() => { setShowForm(false); }}
        />
      )}
    </div>
  );
}