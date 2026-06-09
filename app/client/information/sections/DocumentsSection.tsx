'use client';

import { useState, useCallback } from 'react';
import { type ClientDocument, type ClientSite } from '@/lib/useClientInfo';

interface Props {
  documents: ClientDocument[];
  sites: ClientSite[];
  canEdit: boolean;
  saving: boolean;
  onUpload: (file: File, category: string, siteId: string | null, isPublic: boolean) => Promise<{ data: any; error: any }>;
  onDelete: (docId: string, storagePath: string) => Promise<{ error: any }>;
  onUpdateCategory: (docId: string, category: string) => Promise<{ error: any }>;
  getUrl: (storagePath: string) => Promise<string | null>;
}

const DOC_CATEGORIES = [
  'Assignment instructions',
  'SOP documents',
  'Risk assessments',
  'Insurance documents',
  'Site maps',
  'Emergency procedures',
  'Health and safety',
  'Client contracts',
  'Other',
];

const CAT_COLORS: Record<string, string> = {
  'Assignment instructions': 'bg-blue-500/10 text-blue-400 border-blue-500/20',
  'SOP documents': 'bg-violet-500/10 text-violet-400 border-violet-500/20',
  'Risk assessments': 'bg-red-500/10 text-red-400 border-red-500/20',
  'Insurance documents': 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
  'Site maps': 'bg-orange-500/10 text-orange-400 border-orange-500/20',
  'Emergency procedures': 'bg-amber-500/10 text-amber-400 border-amber-500/20',
  'Health and safety': 'bg-sky-500/10 text-sky-400 border-sky-500/20',
  'Client contracts': 'bg-purple-500/10 text-purple-400 border-purple-500/20',
  'Other': 'bg-gray-700 text-gray-300 border-gray-600',
};

function formatSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export default function DocumentsSection({ documents, sites, canEdit, saving, onUpload, onDelete, onUpdateCategory, getUrl }: Props) {
  const [file, setFile] = useState<File | null>(null);
  const [category, setCategory] = useState('Other');
  const [siteId, setSiteId] = useState<string>('');
  const [isPublic, setIsPublic] = useState(false);
  const [search, setSearch] = useState('');
  const [filterCat, setFilterCat] = useState('');
  const [toast, setToast] = useState<string | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);
  const [editingCat, setEditingCat] = useState<string | null>(null);

  const filtered = documents.filter((d) => {
    const matchesSearch = !search || d.file_name.toLowerCase().includes(search.toLowerCase());
    const matchesCat = !filterCat || d.document_category === filterCat;
    return matchesSearch && matchesCat;
  });

  const handleUpload = async () => {
    if (!file) { setToast('Select a file first'); setTimeout(() => setToast(null), 3000); return; }
    const { error } = await onUpload(file, category, siteId || null, isPublic);
    setToast(error ? 'Upload failed' : 'File uploaded');
    if (!error) { setFile(null); setCategory('Other'); setSiteId(''); setIsPublic(false); }
    setTimeout(() => setToast(null), 3000);
  };

  const handleDelete = async (doc: ClientDocument) => {
    const { error } = await onDelete(doc.id, doc.storage_path);
    setToast(error ? 'Delete failed' : 'File deleted');
    setConfirmDelete(null);
    setTimeout(() => setToast(null), 3000);
  };

  const handleView = useCallback(async (doc: ClientDocument) => {
    const url = await getUrl(doc.storage_path);
    if (url) window.open(url, '_blank');
    else setToast('Failed to generate download link');
  }, [getUrl]);

  const handleCatChange = async (docId: string, newCat: string) => {
    const { error } = await onUpdateCategory(docId, newCat);
    setToast(error ? 'Update failed' : 'Category updated');
    setEditingCat(null);
    setTimeout(() => setToast(null), 3000);
  };

  return (
    <div className="space-y-5">
      {toast && (
        <div className={`px-4 py-2.5 rounded-lg text-sm font-medium ${toast.includes('failed') ? 'bg-red-500/10 text-red-400 border border-red-500/20' : 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'}`}>
          {toast}
        </div>
      )}

      {/* Upload */}
      {canEdit && (
        <div className="bg-gray-800/40 border border-gray-700 rounded-xl p-5">
          <h4 className="text-sm font-medium text-white mb-4">Upload Document</h4>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="md:col-span-2">
              <label className="block text-xs text-gray-400 mb-1.5">File</label>
              <input
                type="file"
                accept=".pdf,.docx,.png,.jpg,.jpeg,.webp"
                onChange={(e) => setFile(e.target.files?.[0] || null)}
                className="block w-full text-xs text-gray-400 file:mr-3 file:px-3 file:py-1.5 file:rounded-lg file:border-0 file:bg-gray-700 file:text-white hover:file:bg-gray-600"
              />
              {file && <p className="text-xs text-gray-500 mt-1">{file.name} ({formatSize(file.size)})</p>}
            </div>
            <div>
              <label className="block text-xs text-gray-400 mb-1.5">Category</label>
              <div className="relative">
                <button
                  onClick={() => setEditingCat('new')}
                  className="w-full bg-gray-800/60 border border-gray-700 rounded-lg px-3 py-2.5 text-sm text-white text-left flex items-center justify-between cursor-pointer"
                >
                  {category}
                  <div className="w-4 h-4 flex items-center justify-center text-gray-400"><i className="ri-arrow-down-s-line text-xs"></i></div>
                </button>
                {editingCat === 'new' && (
                  <div className="absolute z-10 mt-1 w-full bg-[#1a1f2e] border border-gray-700 rounded-lg shadow-lg max-h-48 overflow-y-auto">
                    {DOC_CATEGORIES.map((c) => (
                      <button
                        key={c}
                        onClick={() => { setCategory(c); setEditingCat(null); }}
                        className="w-full text-left px-3 py-2 text-xs text-gray-300 hover:bg-white/5 cursor-pointer"
                      >
                        {c}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
            <div>
              <label className="block text-xs text-gray-400 mb-1.5">Linked Site (optional)</label>
              <select
                value={siteId}
                onChange={(e) => setSiteId(e.target.value)}
                className="w-full bg-gray-800/60 border border-gray-700 rounded-lg px-3 py-2.5 text-sm text-white focus:outline-none pr-8"
              >
                <option value="">None</option>
                {sites.map((s) => (
                  <option key={s.id} value={s.id}>{s.site_name}</option>
                ))}
              </select>
            </div>
          </div>
          <div className="flex items-center gap-3 mt-4">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={isPublic}
                onChange={(e) => setIsPublic(e.target.checked)}
                className="w-4 h-4 rounded border-gray-600 bg-gray-800 text-blue-500 focus:ring-blue-500/20"
              />
              <span className="text-xs text-gray-400">Public to account</span>
            </label>
            <button
              onClick={handleUpload}
              disabled={!file || saving}
              className="ml-auto px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white text-sm font-medium rounded-lg transition-colors disabled:opacity-50 cursor-pointer whitespace-nowrap"
            >
              {saving ? 'Uploading...' : 'Upload'}
            </button>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="flex items-center gap-3 flex-wrap">
        <div className="relative flex-1 min-w-[200px]">
          <div className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 flex items-center justify-center text-gray-500">
            <i className="ri-search-line text-xs"></i>
          </div>
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search documents..."
            className="w-full bg-gray-800/40 border border-gray-800 rounded-lg pl-9 pr-3 py-2 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-gray-700"
          />
        </div>
        <div className="flex items-center gap-1">
          <button
            onClick={() => setFilterCat('')}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors cursor-pointer whitespace-nowrap ${!filterCat ? 'bg-gray-700 text-white' : 'text-gray-500 hover:text-gray-300'}`}
          >
            All
          </button>
          {DOC_CATEGORIES.slice(0, 5).map((c) => (
            <button
              key={c}
              onClick={() => setFilterCat(filterCat === c ? '' : c)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors cursor-pointer whitespace-nowrap ${filterCat === c ? 'bg-gray-700 text-white' : 'text-gray-500 hover:text-gray-300'}`}
            >
              {c}
            </button>
          ))}
        </div>
      </div>

      {/* Documents Table */}
      {filtered.length === 0 ? (
        <div className="text-center py-10">
          <div className="w-12 h-12 mx-auto mb-3 flex items-center justify-center bg-gray-800 rounded-full">
            <i className="ri-folder-line text-gray-500 text-xl"></i>
          </div>
          <p className="text-sm text-gray-500">No documents uploaded yet.</p>
        </div>
      ) : (
        <div className="bg-gray-800/30 border border-gray-800 rounded-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-gray-800">
                  <th className="px-4 py-3 text-xs font-medium text-gray-500 uppercase">File</th>
                  <th className="px-4 py-3 text-xs font-medium text-gray-500 uppercase">Category</th>
                  <th className="px-4 py-3 text-xs font-medium text-gray-500 uppercase">Site</th>
                  <th className="px-4 py-3 text-xs font-medium text-gray-500 uppercase">Size</th>
                  <th className="px-4 py-3 text-xs font-medium text-gray-500 uppercase">Date</th>
                  <th className="px-4 py-3 text-xs font-medium text-gray-500 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-800">
                {filtered.map((doc) => {
                  const siteName = sites.find((s) => s.id === doc.site_id)?.site_name;
                  return (
                    <tr key={doc.id} className="hover:bg-white/[0.02] transition-colors">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2.5">
                          <div className="w-8 h-8 flex items-center justify-center bg-gray-800 rounded-lg text-gray-400">
                            <i className={`${doc.file_type === 'pdf' ? 'ri-file-pdf-line' : doc.file_type?.includes('doc') ? 'ri-file-word-line' : 'ri-image-line'} text-xs`}></i>
                          </div>
                          <span className="text-sm text-white truncate max-w-[180px]">{doc.file_name}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        {editingCat === doc.id ? (
                          <div className="relative">
                            <div className="absolute z-10 mt-1 w-48 bg-[#1a1f2e] border border-gray-700 rounded-lg shadow-lg max-h-48 overflow-y-auto">
                              {DOC_CATEGORIES.map((c) => (
                                <button
                                  key={c}
                                  onClick={() => handleCatChange(doc.id, c)}
                                  className="w-full text-left px-3 py-2 text-xs text-gray-300 hover:bg-white/5 cursor-pointer"
                                >
                                  {c}
                                </button>
                              ))}
                            </div>
                          </div>
                        ) : (
                          <button
                            onClick={() => canEdit && setEditingCat(doc.id)}
                            className={`text-[10px] px-2 py-1 rounded-full border font-medium transition-colors cursor-pointer ${CAT_COLORS[doc.document_category || 'Other'] || CAT_COLORS['Other']}`}
                          >
                            {doc.document_category || 'Other'}
                          </button>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <span className="text-xs text-gray-400">{siteName || '-'}</span>
                      </td>
                      <td className="px-4 py-3">
                        <span className="text-xs text-gray-500">{doc.file_size ? formatSize(doc.file_size) : '-'}</span>
                      </td>
                      <td className="px-4 py-3">
                        <span className="text-xs text-gray-500">{new Date(doc.upload_date).toLocaleDateString('en-GB')}</span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => handleView(doc)}
                            className="w-7 h-7 flex items-center justify-center text-gray-400 hover:text-white rounded-lg hover:bg-white/5 transition-colors cursor-pointer"
                            title="View"
                          >
                            <i className="ri-eye-line text-xs"></i>
                          </button>
                          {canEdit && (
                            <>
                              <button
                                onClick={() => setEditingCat(doc.id)}
                                className="w-7 h-7 flex items-center justify-center text-gray-400 hover:text-white rounded-lg hover:bg-white/5 transition-colors cursor-pointer"
                                title="Edit category"
                              >
                                <i className="ri-edit-line text-xs"></i>
                              </button>
                              <button
                                onClick={() => setConfirmDelete(doc.id)}
                                className="w-7 h-7 flex items-center justify-center text-gray-400 hover:text-red-400 rounded-lg hover:bg-red-500/10 transition-colors cursor-pointer"
                                title="Delete"
                              >
                                <i className="ri-delete-bin-line text-xs"></i>
                              </button>
                            </>
                          )}
                        </div>
                        {confirmDelete === doc.id && (
                          <div className="mt-2 bg-red-500/5 border border-red-500/20 rounded-lg p-2">
                            <p className="text-[10px] text-red-300 mb-1.5">Delete this file?</p>
                            <div className="flex items-center gap-1.5">
                              <button
                                onClick={() => handleDelete(doc)}
                                className="px-2 py-1 bg-red-600/20 text-red-400 border border-red-500/30 rounded text-[10px] font-medium hover:bg-red-600/30 cursor-pointer"
                              >
                                Delete
                              </button>
                              <button
                                onClick={() => setConfirmDelete(null)}
                                className="px-2 py-1 bg-gray-800/60 text-gray-400 rounded text-[10px] font-medium hover:bg-gray-800 cursor-pointer"
                              >
                                Cancel
                              </button>
                            </div>
                          </div>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}