'use client';

import { useState, useMemo } from 'react';
import { useSiteNotices, NoticeCategory, NoticePriority, SiteNotice } from '@/lib/useSiteNotices';
import NoticeCard from './NoticeCard';
import NoticeForm from './NoticeForm';

interface NoticeListProps {
  siteId: string;
  canManage: boolean;
}

const FILTER_OPTIONS: { key: string; label: string }[] = [
  { key: 'all', label: 'All' },
  { key: 'active', label: 'Active' },
  { key: 'pinned', label: 'Pinned' },
  { key: 'urgent', label: 'Urgent' },
];

export default function NoticeList({ siteId, canManage }: NoticeListProps) {
  const { notices, loading, refetch, update, remove } = useSiteNotices(siteId);
  const [filter, setFilter] = useState('all');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [search, setSearch] = useState('');
  const [editingNotice, setEditingNotice] = useState<SiteNotice | null>(null);

  const categories = useMemo(() => {
    const set = new Set(notices.map((n) => n.category));
    return Array.from(set);
  }, [notices]);

  const filtered = useMemo(() => {
    let result = notices;

    if (filter === 'active') result = result.filter((n) => n.status === 'active');
    if (filter === 'pinned') result = result.filter((n) => n.pinned);
    if (filter === 'urgent') result = result.filter((n) => n.priority === 'Urgent' || n.priority === 'High');

    if (categoryFilter !== 'all') result = result.filter((n) => n.category === categoryFilter);

    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter((n) => n.title.toLowerCase().includes(q) || n.body.toLowerCase().includes(q));
    }

    return result;
  }, [notices, filter, categoryFilter, search]);

  const handleToggleStatus = async (id: string, status: 'active' | 'inactive') => {
    await update(id, { status });
  };

  const handleTogglePin = async (id: string, pinned: boolean) => {
    await update(id, { pinned });
  };

  const handleDelete = async (id: string) => {
    await remove(id);
  };

  return (
    <div className="space-y-5">
      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
        <div className="flex items-center gap-1 bg-[#0f172a]/70 border border-white/10 rounded-xl p-1">
          {FILTER_OPTIONS.map((f) => (
            <button
              key={f.key}
              onClick={() => setFilter(f.key)}
              className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors cursor-pointer whitespace-nowrap ${
                filter === f.key ? 'bg-blue-600 text-white' : 'text-gray-400 hover:text-white hover:bg-white/5'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-2 flex-1 w-full sm:w-auto">
          <div className="relative flex-1">
            <div className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 flex items-center justify-center text-gray-400">
              <i className="ri-search-line text-sm"></i>
            </div>
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search notices..."
              className="w-full pl-9 pr-3 py-2 bg-[#0f172a]/70 border border-white/10 rounded-lg text-sm text-white placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          </div>

          {categories.length > 0 && (
            <div className="relative">
              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="px-3 py-2 bg-[#0f172a]/70 border border-white/10 rounded-lg text-sm text-white focus:outline-none focus:ring-1 focus:ring-blue-500 appearance-none cursor-pointer pr-8"
              >
                <option value="all" className="bg-[#0f172a]">All categories</option>
                {categories.map((c) => (
                  <option key={c} value={c} className="bg-[#0f172a]">{c}</option>
                ))}
              </select>
              <div className="absolute right-2 top-1/2 -translate-y-1/2 w-4 h-4 flex items-center justify-center pointer-events-none text-gray-400">
                <i className="ri-arrow-down-s-line"></i>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Results count */}
      <p className="text-xs text-gray-500">
        {filtered.length} notice{filtered.length !== 1 ? 's' : ''} {filter !== 'all' ? `(${FILTER_OPTIONS.find((f) => f.key === filter)?.label.toLowerCase()})` : ''}
      </p>

      {/* Notices */}
      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-[#0f172a]/70 border border-white/10 rounded-xl p-5 animate-pulse">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-9 h-9 rounded-lg bg-white/5" />
                <div className="flex-1 space-y-2">
                  <div className="h-3.5 bg-white/5 rounded w-48" />
                  <div className="h-2.5 bg-white/5 rounded w-32" />
                </div>
              </div>
              <div className="space-y-2">
                <div className="h-2.5 bg-white/5 rounded w-full" />
                <div className="h-2.5 bg-white/5 rounded w-3/4" />
              </div>
            </div>
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="bg-[#0f172a]/70 border border-white/10 rounded-xl p-12 text-center">
          <div className="w-12 h-12 flex items-center justify-center bg-white/5 rounded-full mx-auto mb-3">
            <i className="ri-article-line text-gray-400 text-xl"></i>
          </div>
          <p className="text-sm text-gray-400 font-medium">No notices found</p>
          <p className="text-xs text-gray-500 mt-1">
            {search || filter !== 'all' || categoryFilter !== 'all'
              ? 'Try adjusting your filters.'
              : 'Notices will appear here once they are created.'}
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((notice) => (
            <NoticeCard
              key={notice.id}
              notice={notice}
              canManage={canManage}
              onEdit={(n) => setEditingNotice(n)}
              onToggleStatus={handleToggleStatus}
              onDelete={handleDelete}
              onTogglePin={handleTogglePin}
            />
          ))}
        </div>
      )}

      {editingNotice && (
        <NoticeForm
          siteId={siteId}
          notice={editingNotice}
          onClose={() => setEditingNotice(null)}
          onSave={() => setEditingNotice(null)}
        />
      )}
    </div>
  );
}