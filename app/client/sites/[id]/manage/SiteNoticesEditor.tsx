'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';

interface NoticeRow {
  id?: string;
  title: string;
  body: string;
  priority: string;
  category: string;
  status: string;
  expiry_date: string;
  isNew: boolean;
}

const PRIORITIES = ['low', 'medium', 'high', 'critical'];
const CATEGORIES = ['general', 'safety', 'access', 'operational', 'compliance', 'other'];
const STATUSES = ['active', 'draft', 'archived'];

interface SiteNoticesEditorProps {
  siteId: string;
  auth: any;
  onSaved: () => void;
  showToast: (msg: string, type?: 'success' | 'error') => void;
}

export default function SiteNoticesEditor({ siteId, auth, onSaved, showToast }: SiteNoticesEditorProps) {
  const [saving, setSaving] = useState(false);
  const [notices, setNotices] = useState<NoticeRow[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!auth.site || !auth.companyId) return;
    setLoading(true);
    supabase
      .from('site_notices')
      .select('id, title, body, priority, category, status, expiry_date')
      .eq('site_id', siteId)
      .order('created_at', { ascending: false })
      .then(({ data }) => {
        if (data && data.length > 0) {
          setNotices(data.map((n: any) => ({
            id: n.id,
            title: n.title || '',
            body: n.body || '',
            priority: n.priority || 'medium',
            category: n.category || 'general',
            status: n.status || 'active',
            expiry_date: n.expiry_date ? n.expiry_date.slice(0, 10) : '',
            isNew: false,
          })));
        }
        setLoading(false);
      });
  }, [auth.site, auth.companyId, siteId]);

  const updateRow = (idx: number, field: string, value: any) => {
    setNotices((prev) => prev.map((n, i) => i === idx ? { ...n, [field]: value } : n));
  };

  const addRow = () => {
    setNotices((prev) => [...prev, { title: '', body: '', priority: 'medium', category: 'general', status: 'active', expiry_date: '', isNew: true }]);
  };

  const removeRow = (idx: number) => {
    setNotices((prev) => prev.filter((_, i) => i !== idx));
  };

  const handleSave = async () => {
    const valid = notices.filter((n) => n.title.trim());
    setSaving(true);
    const companyId = auth.companyId;

    const existingIds = valid.filter((n) => n.id && !n.isNew).map((n) => n.id!);
    if (existingIds.length > 0) {
      await supabase.from('site_notices').delete().eq('site_id', siteId).not('id', 'in', `(${existingIds.join(',')})`);
    } else {
      await supabase.from('site_notices').delete().eq('site_id', siteId);
    }

    const upserts = valid.map((n) => ({
      id: n.id && !n.isNew ? n.id : undefined,
      site_id: siteId,
      company_id: companyId,
      title: n.title.trim(),
      body: n.body.trim(),
      priority: n.priority,
      category: n.category,
      status: n.status,
      pinned: n.priority === 'critical',
      expiry_date: n.expiry_date || null,
      created_by: auth.clientUserId,
      updated_by: auth.clientUserId,
    }));

    const { error } = await supabase.from('site_notices').upsert(upserts, { onConflict: 'id' });

    setSaving(false);
    if (error) { showToast(error.message, 'error'); return; }
    onSaved();
  };

  const selectClass = 'w-full bg-white/5 border border-white/10 rounded-lg px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-blue-500/50 transition-colors appearance-none cursor-pointer';
  const inputClass = 'w-full bg-white/5 border border-white/10 rounded-lg px-2.5 py-1.5 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-blue-500/50 transition-colors';

  const priorityStyle = (p: string) => {
    if (p === 'critical') return 'bg-red-500/20 border-red-500/30 text-red-400';
    if (p === 'high') return 'bg-orange-500/20 border-orange-500/30 text-orange-400';
    if (p === 'medium') return 'bg-amber-500/20 border-amber-500/30 text-amber-400';
    return 'bg-emerald-500/20 border-emerald-500/30 text-emerald-400';
  };

  if (loading) {
    return <div className="flex items-center justify-center h-32"><div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500"></div></div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between mb-2">
        <div>
          <h3 className="text-sm font-semibold text-white">Site Notices</h3>
          <p className="text-xs text-gray-400">Manage notices displayed on this site dashboard</p>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={addRow} className="px-3 py-1.5 bg-white/5 hover:bg-white/10 border border-white/10 text-gray-300 text-xs font-medium rounded-lg cursor-pointer whitespace-nowrap transition-colors flex items-center gap-1">
            <div className="w-3 h-3 flex items-center justify-center"><i className="ri-add-line"></i></div>
            New Notice
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-medium rounded-lg cursor-pointer whitespace-nowrap disabled:opacity-50 transition-colors flex items-center gap-1.5"
          >
            <div className="w-3.5 h-3.5 flex items-center justify-center">
              <i className={saving ? 'ri-loader-4-line animate-spin' : 'ri-check-line'}></i>
            </div>
            {saving ? 'Saving...' : 'Save Notices'}
          </button>
        </div>
      </div>

      {notices.length === 0 ? (
        <div className="text-center py-10 bg-white/[0.02] rounded-xl border border-white/5">
          <p className="text-sm text-gray-400 mb-4">No notices created yet</p>
          <button onClick={addRow} className="px-4 py-2 bg-blue-600 text-white text-xs font-medium rounded-lg cursor-pointer whitespace-nowrap">Create First Notice</button>
        </div>
      ) : (
        <div className="space-y-3">
          {notices.map((n, idx) => (
            <div key={idx} className="bg-white/[0.02] border border-white/10 rounded-xl p-4">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <span className={`text-[10px] px-2 py-0.5 rounded border font-medium ${priorityStyle(n.priority)}`}>{n.priority}</span>
                  <span className="text-[10px] text-gray-500">{n.category}</span>
                </div>
                <button onClick={() => removeRow(idx)} className="w-6 h-6 flex items-center justify-center bg-red-500/10 hover:bg-red-500/20 rounded text-red-400 cursor-pointer transition-colors">
                  <i className="ri-close-line text-xs"></i>
                </button>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="sm:col-span-2">
                  <label className="text-[10px] text-gray-500 block mb-1">Title *</label>
                  <input type="text" className={inputClass} value={n.title} onChange={(e) => updateRow(idx, 'title', e.target.value)} placeholder="Notice title" />
                </div>
                <div className="sm:col-span-2">
                  <label className="text-[10px] text-gray-500 block mb-1">Message *</label>
                  <textarea
                    className={`${inputClass} resize-none`}
                    rows={2}
                    value={n.body}
                    onChange={(e) => { if (e.target.value.length <= 500) updateRow(idx, 'body', e.target.value); }}
                    placeholder="Notice message body"
                    maxLength={500}
                  />
                  <div className="text-[10px] text-gray-500 mt-0.5 text-right">{n.body.length}/500</div>
                </div>
                <div>
                  <div className="relative">
                    <label className="text-[10px] text-gray-500 block mb-1">Priority</label>
                    <select className={selectClass} value={n.priority} onChange={(e) => updateRow(idx, 'priority', e.target.value)}>
                      {PRIORITIES.map((p) => <option key={p} value={p}>{p.charAt(0).toUpperCase() + p.slice(1)}</option>)}
                    </select>
                    <div className="absolute right-2 bottom-2 pointer-events-none"><i className="ri-arrow-down-s-line text-gray-500 text-xs"></i></div>
                  </div>
                </div>
                <div>
                  <div className="relative">
                    <label className="text-[10px] text-gray-500 block mb-1">Category</label>
                    <select className={selectClass} value={n.category} onChange={(e) => updateRow(idx, 'category', e.target.value)}>
                      {CATEGORIES.map((c) => <option key={c} value={c}>{c.charAt(0).toUpperCase() + c.slice(1)}</option>)}
                    </select>
                    <div className="absolute right-2 bottom-2 pointer-events-none"><i className="ri-arrow-down-s-line text-gray-500 text-xs"></i></div>
                  </div>
                </div>
                <div>
                  <div className="relative">
                    <label className="text-[10px] text-gray-500 block mb-1">Status</label>
                    <select className={selectClass} value={n.status} onChange={(e) => updateRow(idx, 'status', e.target.value)}>
                      {STATUSES.map((s) => <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>)}
                    </select>
                    <div className="absolute right-2 bottom-2 pointer-events-none"><i className="ri-arrow-down-s-line text-gray-500 text-xs"></i></div>
                  </div>
                </div>
                <div>
                  <label className="text-[10px] text-gray-500 block mb-1">Expiry Date</label>
                  <input type="date" className={inputClass} value={n.expiry_date} onChange={(e) => updateRow(idx, 'expiry_date', e.target.value)} />
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}