'use client';

import { useState, useMemo } from 'react';
import { useSOPLibrary } from '@/lib/useSOPLibrary';
import { useSOPAnalytics } from '@/lib/useSOPAnalytics';
import { useSites } from '@/lib/useSites';
import { useAuth } from '@/lib/auth';
import SOPsTable from './components/SOPsTable';
import UploadModal from './components/UploadModal';
import SOPDeleteDialog from './components/SOPDeleteDialog';
import SOPStatsCards from './components/SOPStatsCards';
import TopQuestionsWidget from './components/TopQuestionsWidget';
import GapQuestionsWidget from './components/GapQuestionsWidget';
import Toast from '@/app/sites/components/Toast';
import type { SOPLibraryDocument } from '@/lib/useSOPLibrary';

const TYPE_OPTIONS = ['all', 'PDF', 'DOCX', 'TXT'];
const STATUS_OPTIONS = ['all', 'processing', 'indexed', 'failed'];

export default function SOPsPage() {
  const { docs, loading, error, refetch, addDocument, deleteDocument, reindexDocument } = useSOPLibrary();
  const { sites } = useSites();
  const { role, companyId } = useAuth();
  const { analytics, loading: analyticsLoading, error: analyticsError, acknowledgeGap, tierLimit, tierName } = useSOPAnalytics(companyId);

  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [siteFilter, setSiteFilter] = useState<string | null>(null);
  const [sortKey, setSortKey] = useState('created_at');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('desc');
  const [page, setPage] = useState(1);
  const [toast, setToast] = useState<string | null>(null);

  const [modalOpen, setModalOpen] = useState(false);
  const [saving, setSaving] = useState(false);

  const [deleteTarget, setDeleteTarget] = useState<SOPLibraryDocument | null>(null);
  const [deleting, setDeleting] = useState(false);

  const isAdmin = role === 'company_admin' || role === 'operations_manager';

  const handleSort = (key: string) => {
    if (sortKey === key) {
      setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortKey(key);
      setSortDir('asc');
    }
    setPage(1);
  };

  const filtered = useMemo(() => {
    let result = [...docs];
    const q = search.trim().toLowerCase();
    if (q) {
      result = result.filter(
        (d) =>
          d.title.toLowerCase().includes(q) ||
          (d.description || '').toLowerCase().includes(q) ||
          (d.file_name || '').toLowerCase().includes(q)
      );
    }
    if (typeFilter !== 'all') {
      result = result.filter((d) => (d.file_type || '').toUpperCase() === typeFilter);
    }
    if (statusFilter !== 'all') {
      result = result.filter((d) => d.status === statusFilter);
    }
    if (siteFilter) {
      result = result.filter((d) => d.site_id === siteFilter);
    }
    result.sort((a, b) => {
      let aVal: any;
      let bVal: any;
      if (sortKey === 'site_name') {
        aVal = a.site_name || '';
        bVal = b.site_name || '';
      } else if (sortKey === 'title') {
        aVal = a.title.toLowerCase();
        bVal = b.title.toLowerCase();
      } else {
        aVal = (a as any)[sortKey] ?? '';
        bVal = (b as any)[sortKey] ?? '';
      }
      if (aVal < bVal) return sortDir === 'asc' ? -1 : 1;
      if (aVal > bVal) return sortDir === 'asc' ? 1 : -1;
      return 0;
    });
    return result;
  }, [docs, search, typeFilter, statusFilter, siteFilter, sortKey, sortDir]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / 25));
  const safePage = Math.min(page, totalPages);
  const paged = filtered.slice((safePage - 1) * 25, safePage * 25);

  const handleSave = async (file: File, title: string, description: string, siteId: string | null) => {
    setSaving(true);
    const { error } = await addDocument(file, title, description, siteId);
    if (!error) {
      setToast('Uploaded — indexing will start shortly');
    } else {
      setToast('Upload failed: ' + (error.message || 'Unknown error'));
    }
    setSaving(false);
    setModalOpen(false);
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    const { error } = await deleteDocument(deleteTarget.id);
    if (!error) setToast('Document deleted');
    else setToast('Failed to delete document');
    setDeleting(false);
    setDeleteTarget(null);
  };

  const handleReindex = async (doc: SOPLibraryDocument) => {
    const { error } = await reindexDocument(doc.id);
    if (!error) setToast('Re-indexing started');
    else setToast('Failed to start re-indexing');
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white">Standard Operating Procedures</h1>
          <p className="text-gray-400 text-sm mt-1">Upload your SOPs so staff can ask the AI assistant questions about them</p>
        </div>
        {isAdmin && (
          <button
            onClick={() => setModalOpen(true)}
            className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white text-sm font-medium px-4 py-2.5 rounded-lg transition-colors cursor-pointer whitespace-nowrap"
          >
            <div className="w-4 h-4 flex items-center justify-center"><i className="ri-add-line"></i></div>
            Upload Document
          </button>
        )}
      </div>

      <SOPStatsCards
        analytics={analytics}
        loading={analyticsLoading}
        tierLimit={tierLimit}
        tierName={tierName}
        aiActions={analytics?.aiActionsThisMonth || 0}
      />

      <div className="grid lg:grid-cols-2 gap-5">
        <TopQuestionsWidget topQuestions={analytics?.topQuestions || []} companyId={companyId} />
        <GapQuestionsWidget gapQuestions={analytics?.gapQuestions || []} onAcknowledge={acknowledgeGap} />
      </div>

      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 flex-wrap">
        <div className="relative flex-1 max-w-md">
          <div className="w-5 h-5 flex items-center justify-center absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">
            <i className="ri-search-line text-sm"></i>
          </div>
          <input
            type="text"
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            placeholder="Search by title, description, or filename..."
            className="w-full bg-gray-800/60 border border-gray-700 rounded-lg pl-10 pr-4 py-2 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-blue-500"
          />
        </div>

        <button
          onClick={() => setTypeFilter((r) => TYPE_OPTIONS[(TYPE_OPTIONS.indexOf(r) + 1) % TYPE_OPTIONS.length])}
          className="inline-flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium border border-gray-700 bg-gray-800/60 text-gray-300 hover:text-white transition-colors cursor-pointer whitespace-nowrap"
        >
          <div className="w-4 h-4 flex items-center justify-center"><i className="ri-filter-line"></i></div>
          {typeFilter === 'all' ? 'All Types' : typeFilter}
        </button>

        <button
          onClick={() => setStatusFilter((r) => STATUS_OPTIONS[(STATUS_OPTIONS.indexOf(r) + 1) % STATUS_OPTIONS.length])}
          className="inline-flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium border border-gray-700 bg-gray-800/60 text-gray-300 hover:text-white transition-colors cursor-pointer whitespace-nowrap"
        >
          <div className="w-4 h-4 flex items-center justify-center"><i className="ri-loader-line"></i></div>
          {statusFilter === 'all' ? 'All Statuses' : statusFilter.charAt(0).toUpperCase() + statusFilter.slice(1)}
        </button>

        <button
          onClick={() => {
            const siteIds = sites.map((s) => s.id);
            const idx = siteFilter ? siteIds.indexOf(siteFilter) : -1;
            const nextIdx = (idx + 1) % (siteIds.length + 1);
            setSiteFilter(nextIdx >= siteIds.length ? null : siteIds[nextIdx]);
            setPage(1);
          }}
          className="inline-flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium border border-gray-700 bg-gray-800/60 text-gray-300 hover:text-white transition-colors cursor-pointer whitespace-nowrap"
        >
          <div className="w-4 h-4 flex items-center justify-center"><i className="ri-building-line"></i></div>
          {siteFilter ? sites.find((s) => s.id === siteFilter)?.site_name || 'Site' : 'All Sites'}
        </button>
      </div>

      {error && (
        <div className="bg-red-500/10 border border-red-500/20 text-red-400 text-sm px-4 py-3 rounded-lg flex items-center gap-2">
          <div className="w-4 h-4 flex items-center justify-center"><i className="ri-error-warning-line"></i></div>
          {error}
        </div>
      )}

      <SOPsTable
        docs={paged}
        loading={loading}
        sortKey={sortKey}
        sortDir={sortDir}
        onSort={handleSort}
        onReindex={handleReindex}
        onDelete={setDeleteTarget}
        page={safePage}
        totalPages={totalPages}
        onPageChange={setPage}
        total={filtered.length}
        search={search}
      />

      {modalOpen && (
        <UploadModal
          open={modalOpen}
          onClose={() => setModalOpen(false)}
          onSave={handleSave}
          saving={saving}
        />
      )}

      <SOPDeleteDialog
        doc={deleteTarget}
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
        deleting={deleting}
      />

      {toast && <Toast message={toast} onDismiss={() => setToast(null)} />}
    </div>
  );
}