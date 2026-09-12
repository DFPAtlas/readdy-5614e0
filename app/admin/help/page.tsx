'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/lib/auth';
import { useHelpAdmin } from '@/lib/useHelpCentre';

const STATUS_COLORS: Record<string, string> = {
  draft: 'bg-gray-600/15 text-gray-400',
  published: 'bg-emerald-600/15 text-emerald-400',
  archived: 'bg-red-600/15 text-red-400',
};

const AUDIENCES = [
  { value: 'public', label: 'Public (no sign in)' },
  { value: 'authenticated', label: 'Authenticated (any signed-in user)' },
  { value: 'tenant', label: 'Tenant (company users)' },
  { value: 'role', label: 'Role-specific' },
];

export default function HelpAdminPage() {
  const { profile } = useAuth();
  const { articles, categories, loading, refresh } = useHelpAdmin();
  const [editing, setEditing] = useState<any | null>(null);
  const [form, setForm] = useState({ title: '', slug: '', summary: '', category_slug: '', audience: 'public', roles: '', content: '', is_featured: false, seo_title: '', seo_description: '' });
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState('');

  const startNew = () => {
    setEditing(null);
    setForm({ title: '', slug: '', summary: '', category_slug: categories[0]?.slug || '', audience: 'public', roles: '', content: '', is_featured: false, seo_title: '', seo_description: '' });
  };

  const startEdit = (a: any) => {
    setEditing(a);
    setForm({
      title: a.title, slug: a.slug, summary: a.summary || '', category_slug: a.category_slug || '',
      audience: a.audience, roles: (a.roles || []).join(', '), content: a.content, is_featured: a.is_featured,
      seo_title: a.seo_title || '', seo_description: a.seo_description || '',
    });
  };

  const save = async (publish: boolean) => {
    if (!form.title.trim() || !form.slug.trim() || !form.content.trim()) { setMessage('Title, slug and content are required.'); return; }
    setBusy(true);
    setMessage('');
    const slug = form.slug.trim().toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
    const payload = {
      slug, title: form.title.trim(), summary: form.summary.trim() || null,
      category_id: categories.find((c) => c.slug === form.category_slug)?.id || null,
      category_slug: form.category_slug || null,
      audience: form.audience,
      roles: form.audience === 'role' ? form.roles.split(',').map((s) => s.trim()).filter(Boolean) : null,
      content: form.content,
      is_featured: form.is_featured,
      seo_title: form.seo_title.trim() || null,
      seo_description: form.seo_description.trim() || null,
      author_id: profile?.id || null,
    };

    let articleId: string | null = editing?.id || null;
    if (editing?.id) {
      await supabase.from('help_articles').update({ ...payload, status: publish ? 'published' : editing.status, published_at: publish ? new Date().toISOString() : editing.published_at, published_by: publish ? profile?.id : editing.published_by, reviewer_id: profile?.id }).eq('id', editing.id);
    } else {
      const { data } = await supabase.from('help_articles').insert({ ...payload, status: publish ? 'published' : 'draft', published_at: publish ? new Date().toISOString() : null, published_by: publish ? profile?.id : null }).select('id').maybeSingle();
      articleId = data?.id || null;
    }

    if (articleId) {
      const { count } = await supabase.from('help_article_versions').select('*', { count: 'exact', head: true }).eq('article_id', articleId);
      await supabase.from('help_article_versions').insert({ article_id: articleId, version: (count || 0) + 1, title: form.title.trim(), summary: form.summary.trim() || null, content: form.content, changed_by: profile?.id, change_summary: publish ? 'Published' : 'Draft update' });
    }

    setMessage(publish ? 'Published.' : 'Saved.');
    setBusy(false);
    startNew();
    refresh();
  };

  const setStatus = async (a: any, status: string) => {
    await supabase.from('help_articles').update({ status, published_at: status === 'published' ? new Date().toISOString() : a.published_at }).eq('id', a.id);
    refresh();
  };

  return (
    <div className="p-4 lg:p-6 max-w-7xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-white">Help Centre Articles</h1>
          <p className="text-sm text-gray-500 mt-0.5">{articles.filter((a) => a.status === 'published').length} published · {articles.filter((a) => a.status === 'draft').length} drafts</p>
        </div>
        <button onClick={startNew} className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-medium rounded-lg transition-colors whitespace-nowrap cursor-pointer">
          <div className="w-4 h-4 flex items-center justify-center"><i className="ri-add-line"></i></div>
          New Article
        </button>
      </div>

      {message && <div className="mb-4 p-3 rounded-lg text-sm bg-emerald-600/10 border border-emerald-600/20 text-emerald-400">{message}</div>}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1 bg-[#111827] border border-gray-800 rounded-xl overflow-hidden max-h-[70vh] overflow-y-auto">
          <div className="divide-y divide-gray-800">
            {articles.length === 0 && !loading && <div className="px-5 py-10 text-center text-sm text-gray-500">No articles yet.</div>}
            {articles.map((a) => (
              <button key={a.id} onClick={() => startEdit(a)} className="w-full text-left px-4 py-3 hover:bg-white/[0.02] transition-colors cursor-pointer">
                <div className="flex items-center gap-2">
                  <span className={`px-1.5 py-0.5 rounded text-[10px] font-medium ${STATUS_COLORS[a.status] || ''}`}>{a.status}</span>
                  {a.audience !== 'public' && <span className="text-[10px] text-gray-500">{a.audience}</span>}
                </div>
                <p className="text-sm text-white mt-1 truncate">{a.title}</p>
                <p className="text-xs text-gray-500 mt-0.5">/{a.slug}</p>
              </button>
            ))}
          </div>
        </div>

        <div className="lg:col-span-2 bg-[#111827] border border-gray-800 rounded-xl p-5">
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs text-gray-500 mb-1">Title</label>
                <input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-indigo-500" />
              </div>
              <div>
                <label className="block text-xs text-gray-500 mb-1">Slug</label>
                <input value={form.slug} onChange={(e) => setForm({ ...form, slug: e.target.value })} className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-indigo-500" />
              </div>
            </div>
            <div>
              <label className="block text-xs text-gray-500 mb-1">Summary</label>
              <input value={form.summary} onChange={(e) => setForm({ ...form, summary: e.target.value })} className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-indigo-500" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs text-gray-500 mb-1">Category</label>
                <select value={form.category_slug} onChange={(e) => setForm({ ...form, category_slug: e.target.value })} className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-indigo-500 pr-8">
                  {categories.map((c) => <option key={c.id} value={c.slug}>{c.name}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs text-gray-500 mb-1">Audience</label>
                <select value={form.audience} onChange={(e) => setForm({ ...form, audience: e.target.value })} className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-indigo-500 pr-8">
                  {AUDIENCES.map((a) => <option key={a.value} value={a.value}>{a.label}</option>)}
                </select>
              </div>
            </div>
            {form.audience === 'role' && (
              <div>
                <label className="block text-xs text-gray-500 mb-1">Visible to roles (comma separated)</label>
                <input value={form.roles} onChange={(e) => setForm({ ...form, roles: e.target.value })} className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-indigo-500" placeholder="guard, supervisor" />
              </div>
            )}
            <div>
              <label className="block text-xs text-gray-500 mb-1">Content (separate paragraphs with a blank line)</label>
              <textarea value={form.content} onChange={(e) => setForm({ ...form, content: e.target.value })} rows={10} className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-indigo-500 resize-none" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs text-gray-500 mb-1">SEO title (optional)</label>
                <input value={form.seo_title} onChange={(e) => setForm({ ...form, seo_title: e.target.value })} className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-indigo-500" />
              </div>
              <div>
                <label className="block text-xs text-gray-500 mb-1">SEO description (optional)</label>
                <input value={form.seo_description} onChange={(e) => setForm({ ...form, seo_description: e.target.value })} className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-indigo-500" />
              </div>
            </div>
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" checked={form.is_featured} onChange={(e) => setForm({ ...form, is_featured: e.target.checked })} className="w-4 h-4 rounded border-white/20 bg-white/5 text-indigo-500" />
              <span className="text-sm text-gray-300">Featured guide</span>
            </label>
            <div className="flex items-center gap-3 pt-2">
              <button onClick={() => save(false)} disabled={busy} className="px-4 py-2 bg-gray-800 hover:bg-gray-700 text-white text-sm font-medium rounded-lg cursor-pointer whitespace-nowrap">Save Draft</button>
              <button onClick={() => save(true)} disabled={busy} className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-medium rounded-lg cursor-pointer whitespace-nowrap">Publish</button>
              {editing?.status === 'published' && (
                <button onClick={() => setStatus(editing, 'archived')} className="px-4 py-2 bg-red-600/15 hover:bg-red-600/25 text-red-400 text-sm font-medium rounded-lg cursor-pointer whitespace-nowrap">Archive</button>
              )}
            </div>
            <p className="text-xs text-gray-600">Changes are versioned. Unsafe HTML and scripts are not rendered — content is plain text only.</p>
          </div>
        </div>
      </div>
    </div>
  );
}