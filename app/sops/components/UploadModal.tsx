import { useState, useRef, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/lib/auth';

interface Props {
  open: boolean;
  onClose: () => void;
  onSave: (file: File, title: string, description: string, siteId: string | null) => Promise<void>;
  saving: boolean;
}

interface SiteOption {
  id: string;
  site_name: string;
}

export default function UploadModal({ open, onClose, onSave, saving }: Props) {
  const { companyId } = useAuth();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [siteId, setSiteId] = useState<string | null>(null);
  const [sites, setSites] = useState<SiteOption[]>([]);
  const [file, setFile] = useState<File | null>(null);
  const [dragOver, setDragOver] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);
  const modalRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!companyId || !open) return;
    supabase
      .from('sites')
      .select('id, site_name')
      .eq('company_id', companyId)
      .order('site_name')
      .then(({ data }) => setSites(data || []));
  }, [companyId, open]);

  useEffect(() => {
    if (open) {
      setTitle('');
      setDescription('');
      setSiteId(null);
      setFile(null);
      setDragOver(false);
    }
  }, [open]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && open && !saving) onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, saving, onClose]);

  if (!open) return null;

  const canSave = title.trim().length > 0 && file !== null && !saving;
  const fileSizeMB = file ? (file.size / (1024 * 1024)).toFixed(1) : '0';
  const isOversized = file ? file.size > 25 * 1024 * 1024 : false;

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const dropped = e.dataTransfer.files[0];
    if (dropped) setFile(dropped);
  };

  const handleSave = async () => {
    if (!canSave || !file) return;
    await onSave(file, title.trim(), description.trim(), siteId);
  };

  const validTypes = ['application/pdf', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'application/msword', 'text/plain'];
  const isValidFile = file ? validTypes.some(t => file.type.includes(t) || file.name.toLowerCase().endsWith(t === 'application/pdf' ? '.pdf' : t.includes('wordprocessing') ? '.docx' : t === 'application/msword' ? '.doc' : '.txt')) : true;

  return (
    <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4">
      <div ref={modalRef} className="bg-[#111827] border border-gray-800 rounded-xl w-full max-w-lg overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-800 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-white">Upload SOP Document</h2>
          <button
            onClick={onClose}
            disabled={saving}
            className="w-8 h-8 flex items-center justify-center rounded-lg text-gray-400 hover:text-white hover:bg-gray-800 transition-colors cursor-pointer disabled:opacity-30"
          >
            <div className="w-4 h-4 flex items-center justify-center"><i className="ri-close-line"></i></div>
          </button>
        </div>

        <div className="px-6 py-5 space-y-4">
          <div>
            <label className="block text-xs font-medium text-gray-400 mb-1.5">Document title <span className="text-red-400">*</span></label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Emergency Evacuation Procedure"
              disabled={saving}
              className="w-full bg-gray-800/60 border border-gray-700 rounded-lg px-3 py-2 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 disabled:opacity-50"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-400 mb-1.5">Description</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Brief description of what this document covers..."
              rows={2}
              disabled={saving}
              maxLength={500}
              className="w-full bg-gray-800/60 border border-gray-700 rounded-lg px-3 py-2 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 resize-none disabled:opacity-50"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-400 mb-1.5">Site</label>
            <div className="relative">
              <button
                type="button"
                onClick={() => {
                  const next = sites.find(s => s.id !== siteId);
                  setSiteId(siteId ? null : (next?.id || null));
                }}
                disabled={saving}
                className="w-full flex items-center justify-between bg-gray-800/60 border border-gray-700 rounded-lg px-3 py-2 text-sm text-white hover:border-gray-600 transition-colors cursor-pointer disabled:opacity-50 pr-8"
              >
                <span className={siteId ? 'text-white' : 'text-gray-500 italic'}>
                  {sites.find((s) => s.id === siteId)?.site_name || 'Select a site'}
                </span>
                <div className="absolute right-3 w-4 h-4 flex items-center justify-center text-gray-400"><i className="ri-arrow-down-s-line"></i></div>
              </button>
              {siteId && (
                <button
                  onClick={() => setSiteId(null)}
                  className="mt-1 text-xs text-gray-500 hover:text-gray-300 cursor-pointer"
                >
                  Clear selection
                </button>
              )}
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-400 mb-1.5">File <span className="text-red-400">*</span></label>
            <div
              onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
              onDragLeave={() => setDragOver(false)}
              onDrop={handleDrop}
              onClick={() => fileRef.current?.click()}
              className={`border-2 border-dashed rounded-lg px-4 py-6 text-center cursor-pointer transition-colors ${
                dragOver
                  ? 'border-blue-500 bg-blue-500/5'
                  : 'border-gray-700 bg-gray-800/30 hover:border-gray-600'
              } ${saving ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              {file ? (
                <div className="flex items-center justify-center gap-3">
                  <div className="w-10 h-10 flex items-center justify-center rounded-lg bg-blue-500/10">
                    <div className="w-5 h-5 flex items-center justify-center"><i className="ri-file-text-line text-blue-400"></i></div>
                  </div>
                  <div className="text-left">
                    <p className="text-sm text-white font-medium">{file.name}</p>
                    <p className={`text-xs ${isOversized ? 'text-red-400' : 'text-gray-500'}`}>
                      {fileSizeMB} MB {isOversized && '(max 25MB)'}
                    </p>
                    {!isValidFile && (
                      <p className="text-xs text-red-400 mt-0.5">Invalid file type. Use PDF, DOCX, or TXT.</p>
                    )}
                  </div>
                  <button
                    onClick={(e) => { e.stopPropagation(); setFile(null); }}
                    disabled={saving}
                    className="ml-2 w-7 h-7 flex items-center justify-center rounded-lg text-gray-400 hover:text-red-400 hover:bg-red-500/10 transition-colors cursor-pointer disabled:opacity-30"
                  >
                    <div className="w-4 h-4 flex items-center justify-center"><i className="ri-close-line"></i></div>
                  </button>
                </div>
              ) : (
                <>
                  <div className="w-10 h-10 mx-auto mb-2 flex items-center justify-center rounded-lg bg-gray-800">
                    <div className="w-5 h-5 flex items-center justify-center"><i className="ri-upload-cloud-line text-gray-500"></i></div>
                  </div>
                  <p className="text-sm text-gray-400">Click or drag &amp; drop to upload</p>
                  <p className="text-xs text-gray-600 mt-1">PDF, DOCX, TXT — max 25MB</p>
                </>
              )}
              <input
                ref={fileRef}
                type="file"
                accept=".pdf,.docx,.doc,.txt"
                onChange={(e) => setFile(e.target.files?.[0] || null)}
                disabled={saving}
                className="hidden"
              />
            </div>
          </div>
        </div>

        <div className="px-6 py-4 border-t border-gray-800 flex justify-end gap-3">
          <button
            onClick={onClose}
            disabled={saving}
            className="px-4 py-2 text-sm text-gray-400 hover:text-white transition-colors cursor-pointer whitespace-nowrap disabled:opacity-30"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={!canSave || isOversized || !isValidFile}
            className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-500 disabled:opacity-40 disabled:cursor-not-allowed text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors cursor-pointer whitespace-nowrap"
          >
            {saving && <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>}
            {saving ? 'Uploading...' : 'Upload Document'}
          </button>
        </div>
      </div>
    </div>
  );
}