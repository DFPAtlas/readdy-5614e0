'use client';

import { useSiteNotices, NoticePriority, NoticeCategory, NoticeFormData, NoticeStatus } from '@/lib/useSiteNotices';
import { useAuth } from '@/lib/auth';
import { useState } from 'react';

interface NoticeFormProps {
  siteId: string;
  notice?: any;
  onClose: () => void;
  onSave: () => void;
}

export default function NoticeForm({ siteId, notice, onClose, onSave }: NoticeFormProps) {
  const { create, update } = useSiteNotices(siteId);
  const { profile } = useAuth();

  const [form, setForm] = useState<NoticeFormData>({
    title: notice?.title || '',
    body: notice?.body || '',
    category: notice?.category || 'General Information',
    priority: notice?.priority || 'Normal',
    pinned: notice?.pinned || false,
    expiry_date: notice?.expiry_date ? notice.expiry_date.slice(0, 10) : '',
    status: notice?.status || 'active',
  });

  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const categories: NoticeCategory[] = [
    'General Information',
    'Assignment Instructions',
    'Health & Safety',
    'Access Instructions',
    'Client Updates',
    'Emergency Procedures',
    'Parking / Keyholding',
    'Site Risks',
    'Temporary Changes',
  ];

  const priorities: NoticePriority[] = ['Low', 'Normal', 'High', 'Urgent'];

  const validate = () => {
    const e: Record<string, string> = {};
    if (!form.title.trim()) e.title = 'Title is required';
    if (!form.body.trim()) e.body = 'Body is required';
    if (form.title.length > 200) e.title = 'Title must be under 200 characters';
    if (form.body.length > 2000) e.body = 'Body must be under 2000 characters';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    setSaving(true);

    const payload: NoticeFormData = {
      ...form,
      expiry_date: form.expiry_date || null,
    };

    let result;
    if (notice) {
      result = await update(notice.id, payload);
    } else {
      result = await create(payload);
    }

    setSaving(false);
    if (!result.error) {
      onSave();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60" onClick={onClose} />
      <div className="relative bg-[#0f172a] border border-white/10 rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-[#0f172a] border-b border-white/10 px-6 py-4 flex items-center justify-between rounded-t-2xl z-10">
          <h2 className="text-lg font-semibold text-white">{notice ? 'Edit Notice' : 'Create Notice'}</h2>
          <button onClick={onClose} className="w-8 h-8 flex items-center justify-center text-gray-400 hover:text-white cursor-pointer rounded-lg hover:bg-white/5 transition-colors">
            <i className="ri-close-line text-lg"></i>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1.5">Title</label>
            <input
              type="text"
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              className={`w-full px-3 py-2.5 bg-white/5 border rounded-lg text-sm text-white placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-blue-500 transition-colors ${errors.title ? 'border-red-500' : 'border-white/10'}`}
              placeholder="Enter notice title..."
            />
            {errors.title && <p className="text-xs text-red-400 mt-1">{errors.title}</p>}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1.5">Category</label>
              <div className="relative">
                <select
                  value={form.category}
                  onChange={(e) => setForm({ ...form, category: e.target.value as NoticeCategory })}
                  className="w-full px-3 py-2.5 bg-white/5 border border-white/10 rounded-lg text-sm text-white focus:outline-none focus:ring-1 focus:ring-blue-500 appearance-none cursor-pointer pr-8"
                >
                  {categories.map((c) => (
                    <option key={c} value={c} className="bg-[#0f172a] text-white">{c}</option>
                  ))}
                </select>
                <div className="absolute right-2 top-1/2 -translate-y-1/2 w-4 h-4 flex items-center justify-center pointer-events-none text-gray-400">
                  <i className="ri-arrow-down-s-line"></i>
                </div>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1.5">Priority</label>
              <div className="relative">
                <select
                  value={form.priority}
                  onChange={(e) => setForm({ ...form, priority: e.target.value as NoticePriority })}
                  className="w-full px-3 py-2.5 bg-white/5 border border-white/10 rounded-lg text-sm text-white focus:outline-none focus:ring-1 focus:ring-blue-500 appearance-none cursor-pointer pr-8"
                >
                  {priorities.map((p) => (
                    <option key={p} value={p} className="bg-[#0f172a] text-white">{p}</option>
                  ))}
                </select>
                <div className="absolute right-2 top-1/2 -translate-y-1/2 w-4 h-4 flex items-center justify-center pointer-events-none text-gray-400">
                  <i className="ri-arrow-down-s-line"></i>
                </div>
              </div>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1.5">Notice Content</label>
            <textarea
              value={form.body}
              onChange={(e) => setForm({ ...form, body: e.target.value })}
              rows={5}
              maxLength={2000}
              className={`w-full px-3 py-2.5 bg-white/5 border rounded-lg text-sm text-white placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-blue-500 transition-colors resize-none ${errors.body ? 'border-red-500' : 'border-white/10'}`}
              placeholder="Write the notice content here..."
            />
            <div className="flex justify-between mt-1">
              {errors.body && <p className="text-xs text-red-400">{errors.body}</p>}
              <p className={`text-xs ml-auto ${form.body.length > 1800 ? 'text-amber-400' : 'text-gray-500'}`}>{form.body.length}/2000</p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1.5">Expiry Date</label>
              <input
                type="date"
                value={form.expiry_date || ''}
                onChange={(e) => setForm({ ...form, expiry_date: e.target.value || null })}
                className="w-full px-3 py-2.5 bg-white/5 border border-white/10 rounded-lg text-sm text-white focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
            </div>
            <div className="flex flex-col gap-3">
              <label className="flex items-center gap-2.5 cursor-pointer">
                <div className={`w-10 h-5 rounded-full transition-colors relative ${form.pinned ? 'bg-blue-500' : 'bg-white/10'}`}>
                  <div className={`absolute top-0.5 w-4 h-4 rounded-full bg-white transition-transform ${form.pinned ? 'translate-x-5' : 'translate-x-0.5'}`} />
                </div>
                <input
                  type="checkbox"
                  checked={form.pinned}
                  onChange={(e) => setForm({ ...form, pinned: e.target.checked })}
                  className="sr-only"
                />
                <span className="text-sm text-gray-300">Pin to top</span>
              </label>
              <label className="flex items-center gap-2.5 cursor-pointer">
                <div className={`w-10 h-5 rounded-full transition-colors relative ${form.status === 'active' ? 'bg-emerald-500' : 'bg-white/10'}`}>
                  <div className={`absolute top-0.5 w-4 h-4 rounded-full bg-white transition-transform ${form.status === 'active' ? 'translate-x-5' : 'translate-x-0.5'}`} />
                </div>
                <input
                  type="checkbox"
                  checked={form.status === 'active'}
                  onChange={(e) => setForm({ ...form, status: e.target.checked ? 'active' : 'inactive' })}
                  className="sr-only"
                />
                <span className="text-sm text-gray-300">Active</span>
              </label>
            </div>
          </div>

          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2.5 text-sm font-medium text-gray-300 bg-white/5 border border-white/10 rounded-lg hover:bg-white/10 transition-colors cursor-pointer whitespace-nowrap"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="flex-1 px-4 py-2.5 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-500 transition-colors cursor-pointer whitespace-nowrap flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {saving && <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />}
              {notice ? 'Update Notice' : 'Create Notice'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}