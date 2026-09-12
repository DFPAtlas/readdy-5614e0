'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

interface Update { id: string; title: string; body: string; change_type: string; severity: string; published_at: string | null; }

const TYPE_META: Record<string, { label: string; color: string; icon: string }> = {
  announcement: { label: 'Announcement', color: 'bg-blue-600/15 text-blue-400', icon: 'ri-megaphone-line' },
  new_feature: { label: 'New feature', color: 'bg-emerald-600/15 text-emerald-400', icon: 'ri-sparkling-2-line' },
  improvement: { label: 'Improvement', color: 'bg-indigo-600/15 text-indigo-400', icon: 'ri-arrow-up-circle-line' },
  fix: { label: 'Fix', color: 'bg-gray-600/15 text-gray-400', icon: 'ri-bug-line' },
  security: { label: 'Security notice', color: 'bg-red-600/15 text-red-400', icon: 'ri-shield-keyhole-line' },
  maintenance: { label: 'Maintenance', color: 'bg-purple-600/15 text-purple-400', icon: 'ri-tools-line' },
  deprecation: { label: 'Deprecation', color: 'bg-amber-600/15 text-amber-400', icon: 'ri-archive-line' },
};

export default function UpdatesPage() {
  const [updates, setUpdates] = useState<Update[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.from('platform_announcements').select('id,title,body,change_type,severity,published_at').eq('is_published', true).order('published_at', { ascending: false }).then(({ data }) => {
      setUpdates(data || []);
      setLoading(false);
    });
  }, []);

  return (
    <div className="min-h-screen bg-[#0a0e1a]">
      <Navbar />
      <section className="pt-32 pb-10">
        <div className="max-w-4xl mx-auto px-6 lg:px-8">
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">Product Updates</h1>
          <p className="text-lg text-gray-400 max-w-2xl">New features, improvements, fixes and notices from GuardianHub.</p>
        </div>
      </section>

      <section className="pb-16">
        <div className="max-w-4xl mx-auto px-6 lg:px-8">
          {loading ? (
            <div className="flex justify-center py-16"><div className="w-8 h-8 border-2 border-blue-500/30 border-t-blue-500 rounded-full animate-spin"></div></div>
          ) : updates.length === 0 ? (
            <div className="text-center py-16 text-gray-400 text-sm">No updates published yet.</div>
          ) : (
            <div className="space-y-4">
              {updates.map((u) => {
                const meta = TYPE_META[u.change_type] || TYPE_META.announcement;
                return (
                  <div key={u.id} className="p-5 rounded-xl bg-white/5 border border-white/10">
                    <div className="flex items-center gap-2 flex-wrap mb-2">
                      <span className={`px-2 py-0.5 rounded text-[11px] font-medium flex items-center gap-1 ${meta.color}`}>
                        <i className={meta.icon}></i> {meta.label}
                      </span>
                      {u.published_at && <span className="text-xs text-gray-500">{new Date(u.published_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}</span>}
                    </div>
                    <h2 className="text-white font-semibold text-sm">{u.title}</h2>
                    <p className="text-gray-400 text-sm mt-1 whitespace-pre-wrap leading-relaxed">{u.body}</p>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </section>

      <Footer />
    </div>
  );
}