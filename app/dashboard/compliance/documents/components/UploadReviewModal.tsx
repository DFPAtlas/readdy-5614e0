'use client';

import { useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/lib/auth';

interface UploadReviewModalProps {
  mode: 'upload' | 'export';
  onClose: () => void;
  onRefresh: () => void;
}

const entityOptions = [
  { label: 'Guard', value: 'guard' },
  { label: 'Site', value: 'site' },
  { label: 'Client', value: 'client' },
  { label: 'Company', value: 'company' },
];

const typeOptions = [
  { label: 'SIA Licence', value: 'sia_licence' },
  { label: 'Right to Work', value: 'right_to_work' },
  { label: 'First Aid Certificate', value: 'first_aid' },
  { label: 'Training Certificate', value: 'training_certificate' },
  { label: 'Insurance', value: 'insurance' },
  { label: 'Site Assignment', value: 'site_assignment' },
  { label: 'ACS Evidence', value: 'acs_evidence' },
  { label: 'Risk Assessment', value: 'risk_assessment' },
  { label: 'Assignment Instructions', value: 'assignment_instructions' },
  { label: 'Health & Safety', value: 'health_safety' },
];

export default function UploadReviewModal({ mode, onClose, onRefresh }: UploadReviewModalProps) {
  const { companyId } = useAuth();
  const [uploading, setUploading] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [title, setTitle] = useState('');
  const [entityType, setEntityType] = useState('guard');
  const [entityId, setEntityId] = useState('');
  const [documentType, setDocumentType] = useState('sia_licence');
  const [expiryDate, setExpiryDate] = useState('');
  const [issueDate, setIssueDate] = useState('');
  const [success, setSuccess] = useState(false);
  const [entityDropdownOpen, setEntityDropdownOpen] = useState(false);
  const [typeDropdownOpen, setTypeDropdownOpen] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) {
      setFile(e.target.files[0]);
    }
  };

  const handleUpload = async () => {
    if (!companyId || !file || !title || !entityId) return;
    setUploading(true);

    try {
      const ext = file.name.split('.').pop() || '';
      const path = `compliance/${companyId}/${documentType}/${Date.now()}_${Math.random().toString(36).slice(2)}.${ext}`;
      const { error: upErr } = await supabase.storage.from('compliance-documents').upload(path, file, { cacheControl: '3600' });
      if (upErr) throw upErr;

      const { data: urlData } = supabase.storage.from('compliance-documents').getPublicUrl(path);
      const fileUrl = urlData.publicUrl;

      const { error: dbErr } = await supabase.from('compliance_documents').insert({
        company_id: companyId,
        entity_type: entityType,
        entity_id: entityId,
        document_type: documentType,
        document_title: title,
        file_url: fileUrl,
        file_name: file.name,
        file_type: file.type,
        file_size: file.size,
        expiry_date: expiryDate || null,
        issue_date: issueDate || null,
        status: 'awaiting_review',
        review_status: 'pending',
      });

      if (dbErr) throw dbErr;
      setSuccess(true);
      setTimeout(() => {
        onRefresh();
        onClose();
      }, 1200);
    } catch (err: any) {
      alert(err.message || 'Upload failed');
    } finally {
      setUploading(false);
    }
  };

  if (mode === 'export') {
    return (
      <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
        <div className="bg-[#0f172a] border border-white/10 rounded-xl shadow-xl max-w-md w-full p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-white">Export Compliance Evidence</h3>
            <button onClick={onClose} className="cursor-pointer text-gray-500 hover:text-white">
              <div className="w-5 h-5 flex items-center justify-center"><i className="ri-close-line"></i></div>
            </button>
          </div>
          <p className="text-sm text-gray-400 mb-4">Select the format for your compliance evidence export.</p>
          <div className="space-y-2">
            <button className="w-full flex items-center gap-3 px-4 py-3 rounded-lg bg-gray-800/60 border border-gray-700 hover:border-blue-500/50 hover:bg-gray-800/80 transition-all cursor-pointer">
              <div className="w-9 h-9 rounded-lg bg-green-500/10 flex items-center justify-center">
                <div className="w-5 h-5 flex items-center justify-center text-green-400"><i className="ri-file-excel-2-line text-sm"></i></div>
              </div>
              <div className="text-left">
                <p className="text-sm font-medium text-white">Export as CSV</p>
                <p className="text-xs text-gray-500">All documents with expiry dates</p>
              </div>
            </button>
            <button className="w-full flex items-center gap-3 px-4 py-3 rounded-lg bg-gray-800/60 border border-gray-700 hover:border-blue-500/50 hover:bg-gray-800/80 transition-all cursor-pointer">
              <div className="w-9 h-9 rounded-lg bg-red-500/10 flex items-center justify-center">
                <div className="w-5 h-5 flex items-center justify-center text-red-400"><i className="ri-file-pdf-2-line text-sm"></i></div>
              </div>
              <div className="text-left">
                <p className="text-sm font-medium text-white">Export as PDF</p>
                <p className="text-xs text-gray-500">Formatted compliance report</p>
              </div>
            </button>
          </div>
          <div className="mt-4 text-center">
            <button onClick={onClose} className="px-4 py-2 rounded-lg bg-gray-800/60 text-sm text-gray-400 hover:text-white cursor-pointer">Close</button>
          </div>
        </div>
      </div>
    );
  }

  if (success) {
    return (
      <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
        <div className="bg-[#0f172a] border border-white/10 rounded-xl shadow-xl max-w-md w-full p-6 text-center">
          <div className="w-12 h-12 rounded-full bg-emerald-500/10 flex items-center justify-center mx-auto mb-3">
            <div className="w-6 h-6 flex items-center justify-center text-emerald-400"><i className="ri-check-line text-lg"></i></div>
          </div>
          <h3 className="text-lg font-semibold text-white mb-1">Upload Successful</h3>
          <p className="text-sm text-gray-400">Your document has been uploaded and is awaiting review.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
      <div className="bg-[#0f172a] border border-white/10 rounded-xl shadow-xl max-w-lg w-full max-h-[90vh] overflow-y-auto p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-white">Upload Document</h3>
          <button onClick={onClose} className="cursor-pointer text-gray-500 hover:text-white">
            <div className="w-5 h-5 flex items-center justify-center"><i className="ri-close-line"></i></div>
          </button>
        </div>

        <div className="space-y-4">
          <div>
            <label className="text-xs text-gray-500 block mb-1.5">Document Title</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g., SIA Licence - John Smith"
              className="w-full bg-gray-800/60 border border-gray-700 rounded-lg px-3 py-2 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-blue-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="relative">
              <label className="text-xs text-gray-500 block mb-1.5">Entity Type</label>
              <button
                onClick={() => setEntityDropdownOpen(!entityDropdownOpen)}
                className="w-full bg-gray-800/60 border border-gray-700 rounded-lg px-3 py-2 text-sm text-white text-left flex items-center justify-between cursor-pointer pr-8"
              >
                {entityOptions.find(e => e.value === entityType)?.label}
                <i className="ri-arrow-down-s-line text-gray-500"></i>
              </button>
              {entityDropdownOpen && (
                <div className="absolute top-full left-0 right-0 mt-1 bg-[#0f172a] border border-gray-700 rounded-lg shadow-lg z-10 overflow-hidden">
                  {entityOptions.map((opt) => (
                    <button key={opt.value} onClick={() => { setEntityType(opt.value); setEntityDropdownOpen(false); }} className="w-full text-left px-3 py-2 text-sm text-gray-300 hover:bg-white/5 cursor-pointer">
                      {opt.label}
                    </button>
                  ))}
                </div>
              )}
            </div>
            <div>
              <label className="text-xs text-gray-500 block mb-1.5">Entity ID</label>
              <input
                type="text"
                value={entityId}
                onChange={(e) => setEntityId(e.target.value)}
                placeholder="Guard / Site ID"
                className="w-full bg-gray-800/60 border border-gray-700 rounded-lg px-3 py-2 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-blue-500"
              />
            </div>
          </div>

          <div className="relative">
            <label className="text-xs text-gray-500 block mb-1.5">Document Type</label>
            <button
              onClick={() => setTypeDropdownOpen(!typeDropdownOpen)}
              className="w-full bg-gray-800/60 border border-gray-700 rounded-lg px-3 py-2 text-sm text-white text-left flex items-center justify-between cursor-pointer pr-8"
            >
              {typeOptions.find(t => t.value === documentType)?.label}
              <i className="ri-arrow-down-s-line text-gray-500"></i>
            </button>
            {typeDropdownOpen && (
              <div className="absolute top-full left-0 right-0 mt-1 bg-[#0f172a] border border-gray-700 rounded-lg shadow-lg z-10 overflow-hidden max-h-60 overflow-y-auto">
                {typeOptions.map((opt) => (
                  <button key={opt.value} onClick={() => { setDocumentType(opt.value); setTypeDropdownOpen(false); }} className="w-full text-left px-3 py-2 text-sm text-gray-300 hover:bg-white/5 cursor-pointer">
                    {opt.label}
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs text-gray-500 block mb-1.5">Issue Date</label>
              <input
                type="date"
                value={issueDate}
                onChange={(e) => setIssueDate(e.target.value)}
                className="w-full bg-gray-800/60 border border-gray-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-blue-500"
              />
            </div>
            <div>
              <label className="text-xs text-gray-500 block mb-1.5">Expiry Date</label>
              <input
                type="date"
                value={expiryDate}
                onChange={(e) => setExpiryDate(e.target.value)}
                className="w-full bg-gray-800/60 border border-gray-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-blue-500"
              />
            </div>
          </div>

          <div>
            <label className="text-xs text-gray-500 block mb-1.5">File</label>
            <div className="border-2 border-dashed border-gray-700 rounded-lg p-6 text-center hover:border-blue-500/50 transition-all">
              <input type="file" onChange={handleFileChange} className="hidden" id="compliance-upload" />
              <label htmlFor="compliance-upload" className="cursor-pointer">
                <div className="w-10 h-10 rounded-full bg-blue-500/10 flex items-center justify-center mx-auto mb-2">
                  <div className="w-5 h-5 flex items-center justify-center text-blue-400">
                    <i className="ri-upload-cloud-line text-sm"></i>
                  </div>
                </div>
                <p className="text-sm text-gray-400">{file ? file.name : 'Click to upload or drag and drop'}</p>
                <p className="text-xs text-gray-600 mt-1">PDF, JPG, PNG up to 10MB</p>
              </label>
            </div>
          </div>

          <div className="flex items-center gap-2 pt-2">
            <button
              onClick={handleUpload}
              disabled={uploading || !file || !title || !entityId}
              className="flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 disabled:opacity-50 disabled:cursor-not-allowed text-sm text-white transition-all cursor-pointer whitespace-nowrap"
            >
              <div className="w-4 h-4 flex items-center justify-center">
                <i className={`${uploading ? 'ri-loader-4-line animate-spin' : 'ri-upload-cloud-line'} text-xs`}></i>
              </div>
              {uploading ? 'Uploading...' : 'Upload Document'}
            </button>
            <button onClick={onClose} className="px-4 py-2 rounded-lg bg-gray-800/60 text-sm text-gray-400 hover:text-white cursor-pointer">Cancel</button>
          </div>
        </div>
      </div>
    </div>
  );
}