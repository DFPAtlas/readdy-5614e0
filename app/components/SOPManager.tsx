'use client';

import { useState, useRef } from 'react';
import { useSOPDocuments } from '@/lib/useSOPDocuments';
import { useSOPIndex } from '@/lib/useSOPIndex';

interface SOPManagerProps {
  siteId: string;
}

const categories = ['General', 'Emergency Procedures', 'Patrol Procedures', 'Access Control', 'Fire Safety', 'Health & Safety', 'Other'];

export default function SOPManager({ siteId }: SOPManagerProps) {
  const { docs, versions, loading, error, uploadSOP, uploadNewVersion, restoreVersion, loadVersions, deleteSOP, refetch } = useSOPDocuments(siteId);
  const { isIndexing, indexDocument } = useSOPIndex();
  const [indexingDocId, setIndexingDocId] = useState<string | null>(null);
  const [showUpload, setShowUpload] = useState(false);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('General');
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
  const [expandedDoc, setExpandedDoc] = useState<string | null>(null);
  const [versionDocId, setVersionDocId] = useState<string | null>(null);
  const [versionFile, setVersionFile] = useState<File | null>(null);
  const [versionNotes, setVersionNotes] = useState('');
  const [versionUploading, setVersionUploading] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const versionFileRef = useRef<HTMLInputElement>(null);

  const handleUpload = async () => {
    if (!file || !title.trim()) return;
    setUploading(true);
    const { data, error } = await uploadSOP(siteId, file, title.trim(), description.trim(), category);
    setUploading(false);
    if (error) {
      setToast('Upload failed: ' + (error as any).message);
    } else {
      setToast('SOP uploaded — indexing for AI search...');
      setShowUpload(false);
      setTitle('');
      setDescription('');
      setCategory('General');
      setFile(null);
      if (data?.id) {
        setIndexingDocId(data.id);
        const ok = await indexDocument(data.id);
        if (ok) setToast('SOP indexed for AI search');
        else setToast('SOP uploaded but AI indexing failed');
        setIndexingDocId(null);
      }
    }
    setTimeout(() => setToast(null), 3000);
  };

  const handleIndex = async (docId: string) => {
    setIndexingDocId(docId);
    const ok = await indexDocument(docId);
    if (ok) setToast('Document indexed for AI search');
    else setToast('Indexing failed — document may not contain readable text');
    setIndexingDocId(null);
    setTimeout(() => setToast(null), 3000);
  };

  const handleNewVersion = async () => {
    if (!versionFile || !versionDocId) return;
    setVersionUploading(true);
    const { data, error } = await uploadNewVersion(versionDocId, versionFile, versionNotes.trim());
    setVersionUploading(false);
    if (error) {
      setToast('Version upload failed: ' + (error as any).message);
    } else {
      setToast('New version uploaded — re-indexing...');
      setVersionDocId(null);
      setVersionFile(null);
      setVersionNotes('');
      if (data?.id) {
        setIndexingDocId(data.id);
        const ok = await indexDocument(data.id);
        if (ok) setToast('New version indexed for AI search');
        else setToast('Uploaded but AI indexing failed');
        setIndexingDocId(null);
      }
    }
    setTimeout(() => setToast(null), 3000);
  };

  const handleDelete = async (id: string) => {
    const { error } = await deleteSOP(id);
    setDeleteTarget(null);
    if (error) setToast('Failed to delete');
    else setToast('SOP deleted');
    setTimeout(() => setToast(null), 3000);
  };

  const handleRestore = async (versionId: string) => {
    const { error } = await restoreVersion(versionId);
    if (error) setToast('Restore failed: ' + (error as any).message);
    else setToast('Version restored');
    setTimeout(() => setToast(null), 3000);
  };

  const handleExpandVersions = async (docId: string) => {
    if (expandedDoc === docId) {
      setExpandedDoc(null);
    } else {
      setExpandedDoc(docId);
      if (!versions?.[docId]) await loadVersions(docId);
    }
  };

  const formatBytes = (bytes: number | null) => {
    if (!bytes) return '';
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-slate-900">Standard Operating Procedures</h3>
        <button
          onClick={() => setShowUpload((s) => !s)}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-blue-600 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors cursor-pointer whitespace-nowrap"
        >
          <div className="w-3.5 h-3.5 flex items-center justify-center"><i className="ri-add-line"></i></div>
          {showUpload ? 'Cancel' : 'Upload SOP'}
        </button>
      </div>

      {showUpload && (
        <div className="bg-slate-50 rounded-lg p-4 border border-slate-200 space-y-3">
          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1">Document title</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Emergency Evacuation Procedure"
              className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1">Description</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Brief description of this document..."
              rows={2}
              className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white resize-none"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1">Category</label>
            <div className="flex flex-wrap gap-2">
              {categories.map((c) => (
                <button
                  key={c}
                  onClick={() => setCategory(c)}
                  className={`px-3 py-1.5 text-xs rounded-full border transition-colors cursor-pointer whitespace-nowrap ${
                    category === c
                      ? 'bg-blue-600 text-white border-blue-600'
                      : 'bg-white text-slate-600 border-slate-300 hover:border-blue-400'
                  }`}
                >
                  {c}
                </button>
              ))}
            </div>
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1">File</label>
            <input
              ref={fileRef}
              type="file"
              accept=".pdf,.doc,.docx,.txt,.png,.jpg,.jpeg"
              onChange={(e) => setFile(e.target.files?.[0] || null)}
              className="block w-full text-xs text-slate-600 file:mr-3 file:px-3 file:py-1.5 file:rounded-lg file:border-0 file:text-xs file:font-medium file:bg-blue-50 file:text-blue-600 hover:file:bg-blue-100 cursor-pointer"
            />
            {file && <p className="text-xs text-slate-500 mt-1">{file.name} · {formatBytes(file.size)}</p>}
          </div>
          <div className="flex gap-2 pt-1">
            <button
              onClick={handleUpload}
              disabled={!file || !title.trim() || uploading}
              className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-500 transition-colors cursor-pointer whitespace-nowrap disabled:opacity-50"
            >
              {uploading ? (
                <>
                  <div className="w-3.5 h-3.5 flex items-center justify-center"><i className="ri-loader-4-line animate-spin"></i></div>
                  Uploading...
                </>
              ) : (
                <>
                  <div className="w-3.5 h-3.5 flex items-center justify-center"><i className="ri-upload-cloud-line"></i></div>
                  Upload
                </>
              )}
            </button>
          </div>
        </div>
      )}

      {/* New version upload panel */}
      {versionDocId && (
        <div className="bg-blue-50 rounded-lg p-4 border border-blue-200 space-y-3">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 flex items-center justify-center bg-blue-100 rounded-lg">
              <i className="ri-stack-line text-blue-600 text-sm"></i>
            </div>
            <div>
              <p className="text-sm font-medium text-slate-900">Upload new version</p>
              <p className="text-xs text-slate-500">Replaces the current document while keeping history</p>
            </div>
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1">What changed?</label>
            <textarea
              value={versionNotes}
              onChange={(e) => setVersionNotes(e.target.value)}
              placeholder="e.g. Updated emergency contact numbers, revised patrol route..."
              rows={2}
              className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white resize-none"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1">New file</label>
            <input
              ref={versionFileRef}
              type="file"
              accept=".pdf,.doc,.docx,.txt,.png,.jpg,.jpeg"
              onChange={(e) => setVersionFile(e.target.files?.[0] || null)}
              className="block w-full text-xs text-slate-600 file:mr-3 file:px-3 file:py-1.5 file:rounded-lg file:border-0 file:text-xs file:font-medium file:bg-blue-50 file:text-blue-600 hover:file:bg-blue-100 cursor-pointer"
            />
            {versionFile && <p className="text-xs text-slate-500 mt-1">{versionFile.name} · {formatBytes(versionFile.size)}</p>}
          </div>
          <div className="flex gap-2 pt-1">
            <button
              onClick={handleNewVersion}
              disabled={!versionFile || versionUploading}
              className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-500 transition-colors cursor-pointer whitespace-nowrap disabled:opacity-50"
            >
              {versionUploading ? (
                <>
                  <div className="w-3.5 h-3.5 flex items-center justify-center"><i className="ri-loader-4-line animate-spin"></i></div>
                  Uploading...
                </>
              ) : (
                <>
                  <div className="w-3.5 h-3.5 flex items-center justify-center"><i className="ri-stack-line"></i></div>
                  Save new version
                </>
              )}
            </button>
            <button
              onClick={() => { setVersionDocId(null); setVersionFile(null); setVersionNotes(''); }}
              className="px-4 py-2 text-xs font-medium text-slate-600 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors cursor-pointer whitespace-nowrap"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {loading && (
        <div className="flex items-center justify-center py-6">
          <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600"></div>
        </div>
      )}

      {error && (
        <p className="text-xs text-red-600 bg-red-50 rounded-lg p-3">{error}</p>
      )}

      {!loading && docs.length === 0 && (
        <div className="text-center py-6 bg-slate-50 rounded-lg border border-dashed border-slate-200">
          <div className="w-10 h-10 flex items-center justify-center bg-slate-100 rounded-full mx-auto mb-2">
            <i className="ri-file-list-3-line text-slate-400 text-lg"></i>
          </div>
          <p className="text-xs text-slate-500 font-medium">No SOP documents yet</p>
          <p className="text-xs text-slate-400 mt-0.5">Upload procedures for guards and clients</p>
        </div>
      )}

      <div className="space-y-2">
        {docs.map((d) => (
          <div key={d.id} className="bg-white rounded-lg border border-slate-200 hover:border-slate-300 transition-colors overflow-hidden">
            <div className="flex items-center gap-3 p-3">
              <div className="w-9 h-9 flex items-center justify-center bg-blue-50 rounded-lg flex-shrink-0">
                <i className="ri-file-text-line text-blue-600 text-sm"></i>
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <p className="text-sm font-medium text-slate-900 truncate">{d.title}</p>
                  <span className="text-[10px] px-1.5 py-0.5 bg-blue-50 text-blue-700 rounded border border-blue-200 font-medium whitespace-nowrap">
                    v{d.version_number || 1}
                  </span>
                </div>
                <div className="flex items-center gap-2 mt-0.5">
                  <span className="text-[10px] px-1.5 py-0.5 bg-slate-100 text-slate-600 rounded border border-slate-200">{d.category}</span>
                  <span className="text-[10px] text-slate-400">{formatBytes(d.file_size)}</span>
                  <span className="text-[10px] text-slate-400">
                    {new Date(d.created_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}
                  </span>
                </div>
                {d.change_notes && (
                  <p className="text-[10px] text-slate-500 mt-1 italic">{d.change_notes}</p>
                )}
              </div>
              <div className="flex items-center gap-1 flex-shrink-0">
                <a
                  href={d.file_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-slate-100 text-slate-500 transition-colors cursor-pointer"
                  title="Download"
                >
                  <i className="ri-download-line text-sm"></i>
                </a>
                <button
                  onClick={() => handleIndex(d.id)}
                  disabled={indexingDocId === d.id || isIndexing}
                  className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-violet-50 text-slate-400 hover:text-violet-600 transition-colors cursor-pointer disabled:opacity-50"
                  title="Index for AI search"
                >
                  {indexingDocId === d.id ? (
                    <i className="ri-loader-4-line animate-spin text-sm text-violet-500"></i>
                  ) : (
                    <i className="ri-brain-line text-sm"></i>
                  )}
                </button>
                <button
                  onClick={() => setVersionDocId(d.id)}
                  className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-blue-50 text-slate-400 hover:text-blue-600 transition-colors cursor-pointer"
                  title="Upload new version"
                >
                  <i className="ri-stack-line text-sm"></i>
                </button>
                <button
                  onClick={() => handleExpandVersions(d.id)}
                  className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors cursor-pointer"
                  title="Version history"
                >
                  <i className={`ri-history-line text-sm ${expandedDoc === d.id ? 'text-blue-600' : ''}`}></i>
                </button>
                <button
                  onClick={() => setDeleteTarget(d.id)}
                  className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-red-50 text-slate-400 hover:text-red-500 transition-colors cursor-pointer"
                  title="Delete"
                >
                  <i className="ri-delete-bin-line text-sm"></i>
                </button>
              </div>
            </div>

            {/* Version history panel */}
            {expandedDoc === d.id && (
              <div className="border-t border-slate-100 bg-slate-50 px-3 py-3 space-y-2">
                <p className="text-xs font-medium text-slate-700 mb-2">Version history</p>
                {(!versions?.[d.id] || versions[d.id].length === 0) && (
                  <p className="text-xs text-slate-400 py-2">No previous versions found.</p>
                )}
                {versions?.[d.id]?.map((v) => (
                  <div
                    key={v.id}
                    className={`flex items-center gap-3 p-2.5 rounded-lg border transition-colors ${
                      v.is_current
                        ? 'bg-white border-blue-200'
                        : 'bg-white/60 border-slate-200'
                    }`}
                  >
                    <div className="w-7 h-7 flex items-center justify-center bg-slate-100 rounded flex-shrink-0">
                      <span className="text-[10px] font-bold text-slate-600">v{v.version_number}</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-medium text-slate-900">
                          {v.is_current ? 'Current' : `Version ${v.version_number}`}
                        </span>
                        <span className="text-[10px] text-slate-400">
                          {new Date(v.created_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: '2-digit' })}
                        </span>
                        <span className="text-[10px] text-slate-400">{formatBytes(v.file_size)}</span>
                      </div>
                      {v.change_notes && (
                        <p className="text-[10px] text-slate-500 mt-0.5">{v.change_notes}</p>
                      )}
                    </div>
                    <div className="flex items-center gap-1 flex-shrink-0">
                      <a
                        href={v.file_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="w-7 h-7 flex items-center justify-center rounded hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors cursor-pointer"
                        title="Download"
                      >
                        <i className="ri-download-line text-xs"></i>
                      </a>
                      {!v.is_current && (
                        <button
                          onClick={() => handleRestore(v.id)}
                          className="w-7 h-7 flex items-center justify-center rounded hover:bg-blue-50 text-blue-600 transition-colors cursor-pointer"
                          title="Restore this version"
                        >
                          <i className="ri-arrow-go-back-line text-xs"></i>
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Delete confirmation */}
      {deleteTarget && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center px-4">
          <div className="bg-white rounded-xl border border-slate-200 p-5 w-full max-w-sm shadow-lg">
            <p className="text-sm font-medium text-slate-900 mb-2">Delete this SOP document?</p>
            <p className="text-xs text-slate-500 mb-4">This will delete the document and all its versions. This action cannot be undone.</p>
            <div className="flex gap-2">
              <button
                onClick={() => setDeleteTarget(null)}
                className="flex-1 h-10 bg-slate-100 hover:bg-slate-200 text-slate-700 text-sm font-medium rounded-lg cursor-pointer transition-colors whitespace-nowrap"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDelete(deleteTarget)}
                className="flex-1 h-10 bg-red-600 hover:bg-red-500 text-white text-sm font-medium rounded-lg cursor-pointer transition-colors whitespace-nowrap"
              >
                Delete all versions
              </button>
            </div>
          </div>
        </div>
      )}

      {toast && (
        <div className="fixed bottom-4 right-4 z-50 bg-slate-900 text-white text-xs px-4 py-2.5 rounded-lg shadow-lg">
          {toast}
        </div>
      )}
    </div>
  );
}