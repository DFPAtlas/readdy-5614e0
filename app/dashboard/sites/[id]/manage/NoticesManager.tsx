'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';

interface NoticesManagerProps {
  siteId: string;
  companyId: string | null;
  userId: string;
  onSaved: () => void;
}

interface Notice {
  id: string;
  title: string;
  body: string;
  category: string;
  priority: string;
  status: string;
  pinned: boolean;
  expiry_date: string | null;
  created_at: string;
}

const categories = ['General Information', 'Assignment Instructions', 'Health & Safety', 'Access Instructions', 'Client Updates', 'Emergency Procedures', 'Parking / Keyholding', 'Site Risks', 'Temporary Changes'];
const priorities = ['Low', 'Normal', 'High', 'Urgent'];

export default function NoticesManager({ siteId, companyId, userId, onSaved }: NoticesManagerProps) {
  const [notices, setNotices] = useState<Notice[]>([]);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
  const [showAdd, setShowAdd] = useState(false);
  const [newNotice, setNewNotice] = useState({ title: '', body: '', category: 'General Information', priority: 'Normal', pinned: false, expiry_date: '' });

  useEffect(() => {
    supabase
      .from('site_notices')
      .select('id, title, body, category, priority, status, pinned, expiry_date, created_at')
      .eq('site_id', siteId)
      .order('pinned', { ascending: false })
      .order('created_at', { ascending: false })
      .limit(30)
      .then(({ data }) => {
        setNotices((data || []).map((n: any) => ({
          id: n.id,
          title: n.title || '',
          body: n.body || '',
          category: n.category || 'General Information',
          priority: n.priority || 'Normal',
          status: n.status || 'active',
          pinned: n.pinned || false,
          expiry_date: n.expiry_date || null,
          created_at: n.created_at,
        })));
        setLoading(false);
      });
  }, [siteId]);

  const addNotice = async () => {
    if (!companyId || !newNotice.title.trim() || !newNotice.body.trim()) return;
    const { data, error } = await supabase
      .from('site_notices')
      .insert({
        site_id: siteId,
        company_id: companyId,
        client_id: null,
        title: newNotice.title.trim(),
        body: newNotice.body.trim(),
        category: newNotice.category,
        priority: newNotice.priority,
        pinned: newNotice.pinned,
        status: 'active',
        expiry_date: newNotice.expiry_date || null,
        created_by: userId,
      })
      .select('id, title, body, category, priority, status, pinned, expiry_date, created_at')
      .single();

    if (error) setToast({ message: 'Failed: ' + error.message, type: 'error' });
    else if (data) {
      setNotices([data as Notice, ...notices]);
      setNewNotice({ title: '', body: '', category: 'General Information', priority: 'Normal', pinned: false, expiry_date: '' });
      setShowAdd(false);
      setToast({ message: 'Notice created', type: 'success' });
      onSaved();
    }
    setTimeout(() => setToast(null), 3000);
  };

  const toggleStatus = async (notice: Notice) => {
    if (!companyId) return;
    const newStatus = notice.status === 'active' ? 'inactive' : 'active';
    const { error } = await supabase
      .from('site_notices')
      .update({ status: newStatus })
      .eq('id', notice.id)
      .eq('company_id', companyId);

    if (error) setToast({ message: 'Failed: ' + error.message, type: 'error' });
    else {
      setNotices(notices.map((n) => n.id === notice.id ? { ...n, status: newStatus } : n));
      setToast({ message: `Notice ${newStatus === 'active' ? 'activated' : 'deactivated'}`, type: 'success' });
      onSaved();
    }
    setTimeout(() => setToast(null), 3000);
  };

  const deleteNotice = async (id: string) => {
    if (!companyId) return;
    const { error } = await supabase.from('site_notices').delete().eq('id', id).eq('company_id', companyId);
    if (error) setToast({ message: 'Failed to delete', type: 'error' });
    else { setNotices(notices.filter((n) => n.id !== id)); setToast({ message: 'Notice deleted', type: 'success' }); onSaved(); }
    setTimeout(() => setToast(null), 3000);
  };

  const priorityDot: Record<string, string> = { Urgent: 'bg-red-500', High: 'bg-orange-500', Normal: 'bg-blue-500', Low: 'bg-gray-500' };

  if (loading) return <div className="space-y-3 animate-pulse">{[...Array(5)].map((_, i) => <div key={i} className="h-16 bg-white/5 rounded-lg" />)}</div>;

  return (
    <div className="space-y-6">
      {toast && (
        <div className={`fixed top-4 right-4 z-50 px-4 py-3 rounded-lg text-sm font-medium shadow-lg ${toast.type === 'success' ? 'bg-emerald-600 text-white' : 'bg-red-600 text-white'}`}>
          {toast.message}
        </div>
      )}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-base font-semibold text-white mb-1">Site Notices</h3>
          <p className="text-xs text-gray-400">{notices.filter((n) => n.status === 'active').length} active · {notices.length} total</p>
        </div>
        <button onClick={() => setShowAdd(!showAdd)} className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white text-sm font-medium rounded-lg transition-colors cursor-pointer whitespace-nowrap flex items-center gap-2">
          <div className="w-4 h-4 flex items-center justify-center"><i className="ri-add-line"></i></div>
          Create Notice
        </button>
      </div>

      {showAdd && (
        <div className="p-4 rounded-xl border border-blue-500/20 bg-blue-500/5 space-y-4">
          <h4 className="text-sm font-medium text-blue-400">New Notice</h4>
          <div>
            <label className="block text-xs text-gray-500 mb-1">Title *</label>
            <input type="text" value={newNotice.title} onChange={(e) => setNewNotice({ ...newNotice, title: e.target.value })} className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-sm text-white focus:outline-none focus:ring-1 focus:ring-blue-500" placeholder="Notice title..." maxLength={200} />
          </div>
          <div>
            <label className="block text-xs text-gray-500 mb-1">Content *</label>
            <textarea value={newNotice.body} onChange={(e) => setNewNotice({ ...newNotice, body: e.target.value })} rows={3} maxLength={2000} className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-sm text-white focus:outline-none focus:ring-1 focus:ring-blue-500 resize-none" placeholder="Notice content..." />
            <p className="text-[10px] text-gray-500 text-right mt-1">{newNotice.body.length}/2000</p>
          </div>
          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-xs text-gray-500 mb-1">Category</label>
              <div className="relative">
                <select value={newNotice.category} onChange={(e) => setNewNotice({ ...newNotice, category: e.target.value })} className="w-full px-2.5 py-1.5 bg-white/5 border border-white/10 rounded text-xs text-white appearance-none cursor-pointer pr-6">
                  {categories.map((c) => <option key={c} value={c} className="bg-[#0b0f19]">{c}</option>)}
                </select>
                <div className="absolute right-1.5 top-1/2 -translate-y-1/2 w-3 h-3 flex items-center justify-center pointer-events-none text-gray-500"><i className="ri-arrow-down-s-line text-xs"></i></div>
              </div>
            </div>
            <div>
              <label className="block text-xs text-gray-500 mb-1">Priority</label>
              <div className="relative">
                <select value={newNotice.priority} onChange={(e) => setNewNotice({ ...newNotice, priority: e.target.value })} className="w-full px-2.5 py-1.5 bg-white/5 border border-white/10 rounded text-xs text-white appearance-none cursor-pointer pr-6">
                  {priorities.map((p) => <option key={p} value={p} className="bg-[#0b0f19]">{p}</option>)}
                </select>
                <div className="absolute right-1.5 top-1/2 -translate-y-1/2 w-3 h-3 flex items-center justify-center pointer-events-none text-gray-500"><i className="ri-arrow-down-s-line text-xs"></i></div>
              </div>
            </div>
            <div>
              <label className="block text-xs text-gray-500 mb-1">Expiry</label>
              <input type="date" value={newNotice.expiry_date} onChange={(e) => setNewNotice({ ...newNotice, expiry_date: e.target.value })} className="w-full px-2.5 py-1.5 bg-white/5 border border-white/10 rounded text-xs text-white focus:outline-none focus:ring-1 focus:ring-blue-500" />
            </div>
          </div>
          <label className="flex items-center gap-2 cursor-pointer">
            <input type="checkbox" checked={newNotice.pinned} onChange={(e) => setNewNotice({ ...newNotice, pinned: e.target.checked })} className="w-3.5 h-3.5 rounded border-white/20 bg-white/5 text-blue-500 focus:ring-blue-500" />
            <span className="text-xs text-gray-400">Pin to top</span>
          </label>
          <div className="flex gap-2">
            <button onClick={() => setShowAdd(false)} className="px-4 py-2 text-sm text-gray-400 hover:text-white cursor-pointer whitespace-nowrap">Cancel</button>
            <button onClick={addNotice} disabled={!newNotice.title.trim() || !newNotice.body.trim()} className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white text-sm rounded-lg cursor-pointer whitespace-nowrap disabled:opacity-50">Create</button>
          </div>
        </div>
      )}

      <div className="space-y-2">
        {notices.length === 0 && !showAdd && (
          <div className="text-center py-8">
            <div className="w-12 h-12 rounded-xl bg-white/5 flex items-center justify-center mx-auto mb-3">
              <i className="ri-article-line text-gray-500 text-lg"></i>
            </div>
            <p className="text-sm text-gray-400 mb-1">No notices yet</p>
            <p className="text-xs text-gray-500">Create notices to communicate with guards on site</p>
          </div>
        )}
        {notices.map((n) => (
          <div key={n.id} className={`p-3 rounded-lg border transition-colors ${n.status === 'active' ? 'border-white/10 bg-white/[0.02]' : 'border-white/5 bg-white/[0.01] opacity-60'}`}>
            <div className="flex items-start justify-between gap-3">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <div className={`w-2 h-2 rounded-full flex-shrink-0 ${priorityDot[n.priority] || 'bg-gray-500'}`} />
                  <span className="text-sm font-medium text-white truncate">{n.title}</span>
                  {n.pinned && (
                    <div className="w-4 h-4 flex items-center justify-center text-blue-400 flex-shrink-0">
                      <i className="ri-pushpin-line text-xs"></i>
                    </div>
                  )}
                </div>
                <p className="text-xs text-gray-400 line-clamp-2 mb-1.5">{n.body}</p>
                <div className="flex items-center gap-2 text-[10px]">
                  <span className="text-gray-500">{n.category}</span>
                  <span className="text-gray-600">·</span>
                  <span className={`font-medium ${n.priority === 'Urgent' ? 'text-red-400' : n.priority === 'High' ? 'text-orange-400' : 'text-gray-400'}`}>{n.priority}</span>
                  <span className="text-gray-600">·</span>
                  <span className="text-gray-500">{new Date(n.created_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}</span>
                </div>
              </div>
              <div className="flex items-center gap-1 flex-shrink-0">
                <button onClick={() => toggleStatus(n)} className={`px-2.5 py-1 rounded text-[11px] font-medium transition-colors cursor-pointer whitespace-nowrap ${n.status === 'active' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-gray-500/10 text-gray-400 border border-gray-500/20'}`}>
                  {n.status === 'active' ? 'Active' : 'Inactive'}
                </button>
                <button onClick={() => deleteNotice(n.id)} className="w-7 h-7 rounded-lg hover:bg-red-500/10 flex items-center justify-center cursor-pointer text-gray-500 hover:text-red-400">
                  <i className="ri-delete-bin-line text-sm"></i>
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}