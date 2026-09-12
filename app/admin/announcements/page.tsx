'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/lib/auth';
import { usePlatformAccess } from '@/lib/usePlatformAccess';

interface Announcement {
  id: string;
  title: string;
  body: string;
  severity: string;
  display_type: string;
  is_dismissible: boolean;
  requires_acknowledgment: boolean;
  is_published: boolean;
  is_maintenance: boolean;
  starts_at: string | null;
  ends_at: string | null;
  target_audience: string[];
  published_at: string | null;
  created_at: string;
}

export default function AnnouncementsPage() {
  const { profile } = useAuth();
  const { can } = usePlatformAccess(profile?.id || null);
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [loading, setLoading] = useState(true);
  const [showNew, setShowNew] = useState(false);
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [severity, setSeverity] = useState('info');
  const [displayType, setDisplayType] = useState('banner');
  const [isDismissible, setIsDismissible] = useState(true);

  const load = async () => {
    const { data } = await supabase.from('platform_announcements').select('*').order('created_at', { ascending: false });
    if (data) setAnnouncements(data);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const createAnnouncement = async () => {
    if (!title.trim() || !body.trim()) return;
    const { error } = await supabase.from('platform_announcements').insert({
      title, body, severity, display_type: displayType,
      is_dismissible: isDismissible, is_published: true,
      published_by: profile?.id, published_at: new Date().toISOString(),
      created_by: profile?.id,
    });
    if (!error) {
      setShowNew(false);
      setTitle(''); setBody('');
      load();
      await supabase.from('platform_audit_log').insert({
        actor_id: profile?.id,
        effective_actor_id: profile?.id,
        action: 'announcement_published',
        resource_type: 'platform_announcement',
        reason: title,
      });
    }
  };

  const unpublish = async (id: string) => {
    await supabase.from('platform_announcements').update({ is_published: false }).eq('id', id);
    load();
  };

  const severityColors: Record<string, string> = {
    info: 'bg-blue-600/15 text-blue-400',
    warning: 'bg-amber-600/15 text-amber-400',
    critical: 'bg-red-600/15 text-red-400',
    maintenance: 'bg-purple-600/15 text-purple-400',
  };

  return (
    <div className="p-4 lg:p-6 max-w-7xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-white">Platform Announcements</h1>
          <p className="text-sm text-gray-500 mt-0.5">{announcements.filter(a => a.is_published).length} active</p>
        </div>
        {can('announcements.manage') && (
          <button onClick={() => setShowNew(true)} className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-medium rounded-lg transition-colors whitespace-nowrap cursor-pointer">
            <div className="w-4 h-4 flex items-center justify-center"><i className="ri-add-line"></i></div>
            New Announcement
          </button>
        )}
      </div>

      {showNew && (
        <div className="mb-6 bg-[#111827] border border-gray-800 rounded-xl p-5">
          <h3 className="text-white font-semibold text-sm mb-4">New Announcement</h3>
          <div className="space-y-4">
            <div>
              <label className="block text-xs text-gray-500 mb-1">Title</label>
              <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-indigo-500" />
            </div>
            <div>
              <label className="block text-xs text-gray-500 mb-1">Body</label>
              <textarea value={body} onChange={(e) => setBody(e.target.value)} rows={3} className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-indigo-500" />
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="block text-xs text-gray-500 mb-1">Severity</label>
                <select value={severity} onChange={(e) => setSeverity(e.target.value)} className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-indigo-500 pr-8">
                  <option value="info">Info</option>
                  <option value="warning">Warning</option>
                  <option value="critical">Critical</option>
                  <option value="maintenance">Maintenance</option>
                </select>
              </div>
              <div>
                <label className="block text-xs text-gray-500 mb-1">Display</label>
                <select value={displayType} onChange={(e) => setDisplayType(e.target.value)} className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-indigo-500 pr-8">
                  <option value="banner">Banner</option>
                  <option value="modal">Modal</option>
                  <option value="inbox">Inbox</option>
                </select>
              </div>
              <div className="flex items-end pb-2">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" checked={isDismissible} onChange={(e) => setIsDismissible(e.target.checked)} className="rounded bg-gray-800 border-gray-700" />
                  <span className="text-sm text-gray-400">Dismissible</span>
                </label>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-3 mt-4">
            <button onClick={createAnnouncement} className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-medium rounded-lg transition-colors whitespace-nowrap cursor-pointer">Publish</button>
            <button onClick={() => setShowNew(false)} className="px-4 py-2 bg-gray-800 hover:bg-gray-700 text-gray-300 text-sm rounded-lg transition-colors whitespace-nowrap cursor-pointer">Cancel</button>
          </div>
        </div>
      )}

      <div className="bg-[#111827] border border-gray-800 rounded-xl overflow-hidden">
        <div className="divide-y divide-gray-800">
          {announcements.length === 0 && !loading && (
            <div className="px-5 py-12 text-center text-sm text-gray-500">No announcements yet</div>
          )}
          {announcements.map((a) => (
            <div key={a.id} className="px-5 py-3 hover:bg-white/[0.02] transition-colors">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className={`px-1.5 py-0.5 rounded text-[10px] font-medium ${severityColors[a.severity] || ''}`}>{a.severity}</span>
                    {a.is_published ? (
                      <span className="inline-flex items-center gap-1 text-xs text-emerald-400">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span> Published
                      </span>
                    ) : (
                      <span className="text-xs text-gray-500">Draft</span>
                    )}
                    {a.is_maintenance && <span className="px-1.5 py-0.5 rounded text-[10px] font-medium bg-purple-600/15 text-purple-400">Maintenance</span>}
                    <span className="text-xs text-gray-600">{a.display_type}</span>
                  </div>
                  <p className="text-sm text-white mt-1 font-medium">{a.title}</p>
                  <p className="text-sm text-gray-400 mt-0.5 line-clamp-2">{a.body}</p>
                  <div className="flex items-center gap-2 mt-1 text-xs text-gray-500">
                    {a.is_dismissible && <span>Dismissible</span>}
                    {a.requires_acknowledgment && <span>Requires acknowledgment</span>}
                    <span>{new Date(a.created_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}</span>
                  </div>
                </div>
                {can('announcements.manage') && a.is_published && (
                  <button onClick={() => unpublish(a.id)} className="w-8 h-8 flex items-center justify-center text-gray-500 hover:text-red-400 transition-colors rounded-lg hover:bg-red-600/10 cursor-pointer flex-shrink-0">
                    <div className="w-4 h-4 flex items-center justify-center"><i className="ri-close-circle-line"></i></div>
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}