'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/lib/auth';

interface EmailAsset {
  id: string;
  file_name: string;
  file_path: string;
  public_url: string;
  file_type: string | null;
  file_size: number | null;
  alt_text: string | null;
  uploaded_by: string | null;
  created_at: string;
}

const ALLOWED_TYPES = [
  'image/png',
  'image/jpeg',
  'image/webp',
  'image/gif',
  'image/svg+xml',
];

const MAX_SIZE_MB = 5;
const MAX_SIZE_BYTES = MAX_SIZE_MB * 1024 * 1024;

function formatBytes(bytes: number | null | undefined): string {
  if (!bytes || bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
}

function formatDate(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

function makeHtmlTag(url: string, alt: string | null): string {
  const safeAlt = (alt || '').replace(/"/g, '&quot;');
  return `<img src="${url}" alt="${safeAlt}" style="max-width:100%; height:auto;" />`;
}

export default function EmailImageLibraryPage() {
  const { profile } = useAuth();
  const [assets, setAssets] = useState<EmailAsset[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [search, setSearch] = useState('');
  const [filterType, setFilterType] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'newest' | 'oldest' | 'name'>('newest');
  const [dragOver, setDragOver] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [editingAltId, setEditingAltId] = useState<string | null>(null);
  const [editAltValue, setEditAltValue] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const showToast = useCallback((message: string, type: 'success' | 'error' = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 4000);
  }, []);

  const fetchAssets = useCallback(async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('email_assets')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        showToast(`Failed to load images: ${error.message}`, 'error');
        setAssets([]);
      } else {
        setAssets(data || []);
      }
    } catch {
      showToast('Failed to load images. Please refresh.', 'error');
      setAssets([]);
    }
    setLoading(false);
  }, [showToast]);

  useEffect(() => {
    fetchAssets();
  }, [fetchAssets]);

  const filteredAssets = useMemo(() => {
    let result = [...assets];

    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter((a) => a.file_name.toLowerCase().includes(q));
    }

    if (filterType !== 'all') {
      result = result.filter((a) => {
        const ft = a.file_type || '';
        if (filterType === 'png') return ft === 'image/png';
        if (filterType === 'jpg') return ft === 'image/jpeg' || ft === 'image/jpg';
        if (filterType === 'webp') return ft === 'image/webp';
        if (filterType === 'gif') return ft === 'image/gif';
        if (filterType === 'svg') return ft === 'image/svg+xml';
        return true;
      });
    }

    result.sort((a, b) => {
      if (sortBy === 'newest') return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
      if (sortBy === 'oldest') return new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
      if (sortBy === 'name') return a.file_name.localeCompare(b.file_name);
      return 0;
    });

    return result;
  }, [assets, search, filterType, sortBy]);

  const handleUpload = async (files: FileList | null) => {
    if (!files || files.length === 0) return;
    const file = files[0];

    if (!ALLOWED_TYPES.includes(file.type)) {
      showToast(`File type not allowed. Use PNG, JPG, WEBP, GIF, or SVG.`, 'error');
      return;
    }
    if (file.size > MAX_SIZE_BYTES) {
      showToast(`File too large. Maximum ${MAX_SIZE_MB}MB.`, 'error');
      return;
    }
    if (!profile || profile.role !== 'super_admin') {
      showToast('Only super admins can upload images.', 'error');
      return;
    }

    setUploading(true);
    setUploadProgress(10);

    try {
      const now = new Date();
      const year = String(now.getFullYear());
      const month = String(now.getMonth() + 1).padStart(2, '0');
      const ext = file.name.split('.').pop() || 'png';
      const uniqueName = `${crypto.randomUUID()}.${ext}`;
      const filePath = `${year}/${month}/${uniqueName}`;

      const progressInterval = setInterval(() => {
        setUploadProgress((p) => {
          if (p >= 85) { clearInterval(progressInterval); return 85; }
          return p + 12;
        });
      }, 250);

      const { error: uploadError } = await supabase.storage
        .from('email-assets')
        .upload(filePath, file, { upsert: false });

      clearInterval(progressInterval);

      if (uploadError) {
        const msg = uploadError.message || '';
        if (msg.toLowerCase().includes('bucket')) {
          showToast('Storage bucket not found. Please contact support.', 'error');
        } else if (msg.toLowerCase().includes('row-level security') || msg.toLowerCase().includes('policy')) {
          showToast('Permission denied: RLS policy blocked the upload.', 'error');
        } else if (msg.toLowerCase().includes('size')) {
          showToast('File too large for storage bucket limit.', 'error');
        } else if (msg.toLowerCase().includes('mime') || msg.toLowerCase().includes('type')) {
          showToast('File type rejected by storage bucket.', 'error');
        } else {
          showToast(`Upload failed: ${msg}`, 'error');
        }
        setUploading(false);
        setUploadProgress(0);
        return;
      }

      setUploadProgress(90);

      const { data: urlData } = supabase.storage
        .from('email-assets')
        .getPublicUrl(filePath);

      if (!urlData?.publicUrl) {
        showToast('Failed to get public URL after upload.', 'error');
        await supabase.storage.from('email-assets').remove([filePath]);
        setUploading(false);
        setUploadProgress(0);
        return;
      }

      const publicUrl = urlData.publicUrl;

      const { error: dbError } = await supabase.from('email_assets').insert({
        file_name: file.name,
        file_path: filePath,
        public_url: publicUrl,
        file_type: file.type,
        file_size: file.size,
        alt_text: '',
        uploaded_by: profile.id || null,
      });

      if (dbError) {
        await supabase.storage.from('email-assets').remove([filePath]);
        if (dbError.message?.toLowerCase().includes('row-level security')) {
          showToast('Database permission denied. Please contact support.', 'error');
        } else {
          showToast(`Database error: ${dbError.message}`, 'error');
        }
        setUploading(false);
        setUploadProgress(0);
        return;
      }

      setUploadProgress(100);
      showToast('Image uploaded successfully');
      await fetchAssets();

      setTimeout(() => {
        setUploading(false);
        setUploadProgress(0);
      }, 600);
    } catch (err: any) {
      showToast(`Upload failed: ${err?.message || 'Unknown error'}`, 'error');
      setUploading(false);
      setUploadProgress(0);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(true);
  };
  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
  };
  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    handleUpload(e.dataTransfer.files);
  };

  const copyToClipboard = async (text: string, label: string) => {
    try {
      await navigator.clipboard.writeText(text);
      showToast(`${label} copied`);
    } catch {
      showToast('Copy failed. Please copy manually.', 'error');
    }
  };

  const handleDelete = async (asset: EmailAsset) => {
    setDeleteConfirmId(null);

    if (!profile || profile.role !== 'super_admin') {
      showToast('Permission denied', 'error');
      return;
    }

    try {
      const { error: storageError } = await supabase.storage
        .from('email-assets')
        .remove([asset.file_path]);

      if (storageError) {
        showToast(`Storage delete failed: ${storageError.message}`, 'error');
        return;
      }

      const { error: dbError } = await supabase
        .from('email_assets')
        .delete()
        .eq('id', asset.id);

      if (dbError) {
        showToast(`Delete failed: ${dbError.message}`, 'error');
        return;
      }

      showToast('Image deleted');
      setAssets((prev) => prev.filter((a) => a.id !== asset.id));
    } catch (err: any) {
      showToast(`Delete failed: ${err?.message || 'Unknown error'}`, 'error');
    }
  };

  const startEditAlt = (asset: EmailAsset) => {
    setEditingAltId(asset.id);
    setEditAltValue(asset.alt_text || '');
  };

  const saveAlt = async (assetId: string) => {
    if (!profile || profile.role !== 'super_admin') {
      showToast('Permission denied', 'error');
      return;
    }
    try {
      const { error } = await supabase
        .from('email_assets')
        .update({ alt_text: editAltValue.trim() })
        .eq('id', assetId);

      if (error) {
        showToast('Failed to update alt text', 'error');
        return;
      }

      showToast('Alt text saved');
      setAssets((prev) =>
        prev.map((a) => (a.id === assetId ? { ...a, alt_text: editAltValue.trim() } : a))
      );
      setEditingAltId(null);
    } catch (err: any) {
      showToast(`Failed: ${err?.message || 'Unknown error'}`, 'error');
    }
  };

  return (
    <div className="max-w-7xl mx-auto">
      <div className="mb-6">
        <div className="flex items-center gap-3 mb-1">
          <div className="w-8 h-8 rounded-lg bg-indigo-600/15 flex items-center justify-center text-indigo-400">
            <div className="w-5 h-5 flex items-center justify-center">
              <i className="ri-image-line"></i>
            </div>
          </div>
          <h1 className="text-2xl font-bold text-white">Email Image Library</h1>
        </div>
        <p className="text-sm text-gray-500">Upload and manage images used in email templates.</p>
      </div>

      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={`relative mb-6 bg-[#111827] border rounded-xl p-6 transition-all ${
          dragOver ? 'border-indigo-500 bg-indigo-600/5' : 'border-gray-800'
        }`}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept="image/png,image/jpeg,image/webp,image/gif,image/svg+xml"
          onChange={(e) => handleUpload(e.target.files)}
          className="hidden"
        />

        <div className="flex flex-col items-center justify-center text-center">
          <div className="w-12 h-12 rounded-xl bg-gray-800/60 flex items-center justify-center mb-3">
            <div className="w-6 h-6 flex items-center justify-center text-gray-400">
              <i className="ri-upload-cloud-2-line text-xl"></i>
            </div>
          </div>
          <p className="text-sm text-white font-medium mb-1">
            {uploading ? 'Uploading...' : 'Drag and drop an image here'}
          </p>
          <p className="text-xs text-gray-500 mb-3">
            PNG, JPG, WEBP, GIF, SVG — up to {MAX_SIZE_MB}MB
          </p>
          {!uploading && (
            <button
              onClick={() => fileInputRef.current?.click()}
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-medium rounded-lg transition-colors cursor-pointer whitespace-nowrap"
            >
              Choose File
            </button>
          )}
          {uploading && (
            <div className="w-full max-w-xs">
              <div className="h-2 bg-gray-800 rounded-full overflow-hidden">
                <div
                  className="h-full bg-indigo-500 rounded-full transition-all duration-200"
                  style={{ width: `${uploadProgress}%` }}
                />
              </div>
              <p className="text-xs text-gray-500 mt-1.5 text-center">{uploadProgress}%</p>
            </div>
          )}
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-3 mb-5">
        <div className="relative flex-1">
          <div className="w-4 h-4 flex items-center justify-center absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">
            <i className="ri-search-line text-xs"></i>
          </div>
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by file name..."
            className="w-full bg-gray-800/40 border border-gray-700/60 rounded-lg pl-9 pr-3 py-2 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-indigo-500"
          />
        </div>

        <div className="flex gap-2">
          <div className="relative">
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="bg-gray-800/40 border border-gray-700/60 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-indigo-500 appearance-none cursor-pointer pr-8"
            >
              <option value="all">All Types</option>
              <option value="png">PNG</option>
              <option value="jpg">JPG</option>
              <option value="webp">WEBP</option>
              <option value="gif">GIF</option>
              <option value="svg">SVG</option>
            </select>
            <div className="w-4 h-4 flex items-center justify-center absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none">
              <i className="ri-arrow-down-s-line text-xs"></i>
            </div>
          </div>

          <div className="relative">
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="bg-gray-800/40 border border-gray-700/60 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-indigo-500 appearance-none cursor-pointer pr-8"
            >
              <option value="newest">Newest First</option>
              <option value="oldest">Oldest First</option>
              <option value="name">Name A-Z</option>
            </select>
            <div className="w-4 h-4 flex items-center justify-center absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none">
              <i className="ri-arrow-down-s-line text-xs"></i>
            </div>
          </div>
        </div>
      </div>

      <div className="flex items-center justify-between mb-3">
        <p className="text-xs text-gray-500">
          {filteredAssets.length} image{filteredAssets.length !== 1 ? 's' : ''}
        </p>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="bg-[#111827] border border-gray-800 rounded-xl p-4 animate-pulse">
              <div className="aspect-video bg-gray-800/60 rounded-lg mb-3" />
              <div className="h-4 bg-gray-800/60 rounded w-3/4 mb-2" />
              <div className="h-3 bg-gray-800/60 rounded w-1/2" />
            </div>
          ))}
        </div>
      ) : filteredAssets.length === 0 ? (
        <div className="bg-[#111827] border border-gray-800 rounded-xl p-12 text-center">
          <div className="w-12 h-12 rounded-xl bg-gray-800/60 flex items-center justify-center mx-auto mb-3">
            <div className="w-6 h-6 flex items-center justify-center text-gray-500">
              <i className="ri-image-line text-xl"></i>
            </div>
          </div>
          <p className="text-sm text-white font-medium mb-1">No email images uploaded yet</p>
          <p className="text-xs text-gray-500">Upload images to use in your email templates.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filteredAssets.map((asset) => (
            <div
              key={asset.id}
              className="bg-[#111827] border border-gray-800 rounded-xl overflow-hidden group hover:border-gray-700 transition-all"
            >
              <div className="aspect-video bg-gray-900 relative overflow-hidden">
                <img
                  src={asset.public_url}
                  alt={asset.alt_text || asset.file_name}
                  className="w-full h-full object-cover object-center"
                  loading="lazy"
                  onError={(e) => {
                    (e.target as HTMLImageElement).style.display = 'none';
                  }}
                />
                <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                  <button
                    onClick={() => copyToClipboard(asset.public_url, 'URL')}
                    className="px-3 py-1.5 bg-white text-gray-900 text-xs font-medium rounded-lg cursor-pointer whitespace-nowrap"
                    title="Copy URL"
                  >
                    Copy URL
                  </button>
                  <button
                    onClick={() => copyToClipboard(makeHtmlTag(asset.public_url, asset.alt_text), 'HTML tag')}
                    className="px-3 py-1.5 bg-indigo-600 text-white text-xs font-medium rounded-lg cursor-pointer whitespace-nowrap"
                    title="Copy HTML"
                  >
                    Copy HTML
                  </button>
                </div>
              </div>

              <div className="p-4">
                <div className="flex items-start justify-between mb-2">
                  <h3 className="text-sm font-medium text-white truncate pr-2" title={asset.file_name}>
                    {asset.file_name}
                  </h3>
                  <button
                    onClick={() => setDeleteConfirmId(asset.id)}
                    className="w-7 h-7 flex items-center justify-center text-gray-500 hover:text-red-400 transition-colors cursor-pointer flex-shrink-0"
                    title="Delete"
                  >
                    <i className="ri-delete-bin-line text-sm"></i>
                  </button>
                </div>

                <div className="flex items-center gap-2 text-xs text-gray-500 mb-3">
                  <span className="px-1.5 py-0.5 bg-gray-800/60 rounded text-gray-400 uppercase">
                    {(asset.file_type || '').replace('image/', '')}
                  </span>
                  <span>{formatBytes(asset.file_size)}</span>
                  <span>&middot;</span>
                  <span>{formatDate(asset.created_at)}</span>
                </div>

                {editingAltId === asset.id ? (
                  <div className="flex gap-2 mb-3">
                    <input
                      type="text"
                      value={editAltValue}
                      onChange={(e) => setEditAltValue(e.target.value)}
                      placeholder="Alt text"
                      className="flex-1 bg-gray-800/40 border border-gray-700/60 rounded-lg px-2.5 py-1.5 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-indigo-500"
                    />
                    <button
                      onClick={() => saveAlt(asset.id)}
                      className="w-7 h-7 flex items-center justify-center text-emerald-400 hover:text-emerald-300 cursor-pointer"
                    >
                      <i className="ri-check-line text-sm"></i>
                    </button>
                    <button
                      onClick={() => { setEditingAltId(null); setEditAltValue(''); }}
                      className="w-7 h-7 flex items-center justify-center text-gray-500 hover:text-gray-300 cursor-pointer"
                    >
                      <i className="ri-close-line text-sm"></i>
                    </button>
                  </div>
                ) : (
                  <div className="flex items-center justify-between mb-3">
                    <p className="text-xs text-gray-500 truncate flex-1 pr-2">
                      {asset.alt_text ? `Alt: ${asset.alt_text}` : 'No alt text'}
                    </p>
                    <button
                      onClick={() => startEditAlt(asset)}
                      className="text-xs text-indigo-400 hover:text-indigo-300 cursor-pointer whitespace-nowrap"
                    >
                      Edit
                    </button>
                  </div>
                )}

                <div className="bg-gray-900/60 border border-gray-800 rounded-lg p-2.5 mb-3">
                  <p className="text-[10px] text-gray-500 uppercase tracking-wider mb-1">Public URL</p>
                  <p className="text-xs text-indigo-400 break-all font-mono leading-relaxed">{asset.public_url}</p>
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={() => copyToClipboard(asset.public_url, 'URL')}
                    className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 bg-gray-800/40 hover:bg-gray-700/40 border border-gray-700/60 rounded-lg text-xs text-gray-300 hover:text-white transition-all cursor-pointer whitespace-nowrap"
                  >
                    <div className="w-3.5 h-3.5 flex items-center justify-center">
                      <i className="ri-link text-xs"></i>
                    </div>
                    Copy URL
                  </button>
                  <button
                    onClick={() => copyToClipboard(makeHtmlTag(asset.public_url, asset.alt_text), 'HTML tag')}
                    className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 bg-gray-800/40 hover:bg-gray-700/40 border border-gray-700/60 rounded-lg text-xs text-gray-300 hover:text-white transition-all cursor-pointer whitespace-nowrap"
                  >
                    <div className="w-3.5 h-3.5 flex items-center justify-center">
                      <i className="ri-code-line text-xs"></i>
                    </div>
                    Copy HTML
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {deleteConfirmId && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/70" onClick={() => setDeleteConfirmId(null)} />
          <div className="relative w-full max-w-sm bg-[#111827] border border-gray-700 rounded-xl shadow-2xl p-5">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-lg bg-red-500/10 flex items-center justify-center">
                <div className="w-5 h-5 flex items-center justify-center text-red-400">
                  <i className="ri-delete-bin-line"></i>
                </div>
              </div>
              <div>
                <h3 className="text-sm font-semibold text-white">Delete Image</h3>
                <p className="text-xs text-gray-500">This cannot be undone.</p>
              </div>
            </div>
            <div className="flex gap-2 pt-2">
              <button
                onClick={() => setDeleteConfirmId(null)}
                className="flex-1 px-4 py-2 bg-gray-800/40 hover:bg-gray-700/40 text-gray-300 text-sm font-medium rounded-lg transition-colors cursor-pointer whitespace-nowrap"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  const asset = assets.find((a) => a.id === deleteConfirmId);
                  if (asset) handleDelete(asset);
                }}
                className="flex-1 px-4 py-2 bg-red-600 hover:bg-red-500 text-white text-sm font-medium rounded-lg transition-colors cursor-pointer whitespace-nowrap"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {toast && (
        <div className="fixed bottom-6 right-6 z-[80]">
          <div
            className={`px-4 py-3 rounded-lg text-sm font-medium shadow-lg border ${
              toast.type === 'success'
                ? 'bg-[#111827] border-emerald-600/30 text-emerald-400'
                : 'bg-[#111827] border-red-600/30 text-red-400'
            }`}
          >
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 flex items-center justify-center">
                <i className={toast.type === 'success' ? 'ri-check-line' : 'ri-error-warning-line'}></i>
              </div>
              {toast.message}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}