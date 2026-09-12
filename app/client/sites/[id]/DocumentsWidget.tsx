'use client';

import { useSiteDocuments } from '@/lib/useSiteDocuments';

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
}

const CATEGORY_ICONS: Record<string, string> = {
  policy: 'ri-file-text-line',
  emergency_plan: 'ri-alert-line',
  risk_assessment: 'ri-shield-check-line',
  insurance: 'ri-file-shield-line',
  contract: 'ri-file-list-3-line',
  training: 'ri-graduation-cap-line',
  licence: 'ri-award-line',
  other: 'ri-file-line',
};

const DOC_TYPE_ICONS: Record<string, string> = {
  pdf: 'ri-file-pdf-line',
  doc: 'ri-file-word-line',
  docx: 'ri-file-word-line',
  xls: 'ri-file-excel-line',
  xlsx: 'ri-file-excel-line',
  image: 'ri-image-line',
};

function getFileIcon(fileName: string): string {
  const ext = fileName.split('.').pop()?.toLowerCase() || '';
  return DOC_TYPE_ICONS[ext] || 'ri-file-line';
}

export default function DocumentsWidget({ siteId, companyId, clientId, enabled }: { siteId: string; companyId: string | null; clientId: string | null; enabled: boolean }) {
  const { clientDocs, complianceDocs, loading, error } = useSiteDocuments(siteId, companyId, clientId, enabled);

  if (!enabled) return null;

  const allDocsCount = clientDocs.length + complianceDocs.length;

  return (
    <div className="bg-[#0f172a]/70 backdrop-blur-sm border border-white/10 rounded-xl overflow-hidden">
      <div className="px-5 py-4 border-b border-white/10 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 flex items-center justify-center bg-orange-500/10 rounded-lg border border-orange-500/20">
            <i className="ri-folder-line text-orange-400 text-sm"></i>
          </div>
          <h3 className="text-sm font-semibold text-white">Documents</h3>
        </div>
        <span className="text-xs text-gray-500">{allDocsCount} file{allDocsCount !== 1 ? 's' : ''}</span>
      </div>
      <div className="p-4">
        {loading ? (
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-orange-500"></div>
          </div>
        ) : error ? (
          <div className="text-center py-6">
            <p className="text-xs text-gray-500">Could not load documents</p>
          </div>
        ) : allDocsCount === 0 ? (
          <div className="text-center py-6">
            <div className="w-10 h-10 flex items-center justify-center bg-white/5 rounded-full mx-auto mb-2">
              <i className="ri-folder-open-line text-gray-500"></i>
            </div>
            <p className="text-sm text-gray-400 font-medium">No documents uploaded</p>
            <p className="text-xs text-gray-500 mt-1">Site files and policies will appear here.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {complianceDocs.length > 0 && (
              <div>
                <p className="text-[10px] text-gray-400 uppercase tracking-wider mb-2">Compliance &amp; Policies</p>
                <div className="space-y-1.5">
                  {complianceDocs.slice(0, 8).map((doc) => (
                    <div key={doc.id} className="flex items-center gap-3 p-2.5 bg-white/5 rounded-lg">
                      <div className={`w-8 h-8 flex items-center justify-center rounded-lg flex-shrink-0 ${doc.status === 'expired' ? 'bg-red-500/10' : doc.status === 'expiring' ? 'bg-amber-500/10' : 'bg-emerald-500/10'}`}>
                        <i className={`${getFileIcon(doc.file_name || '')} text-sm ${doc.status === 'expired' ? 'text-red-400' : doc.status === 'expiring' ? 'text-amber-400' : 'text-emerald-400'}`}></i>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-medium text-white truncate">{doc.document_title || doc.file_name}</p>
                        <p className="text-[10px] text-gray-400">
                          {doc.document_type?.replace(/_/g, ' ')}
                          {doc.issue_date && ` \u00B7 ${formatDate(doc.issue_date)}`}
                        </p>
                      </div>
                      {doc.expiry_date && (
                        <span className={`text-[10px] px-1.5 py-0.5 rounded border font-medium flex-shrink-0 ${doc.status === 'expired' ? 'bg-red-500/10 border-red-500/20 text-red-400' : doc.status === 'expiring' ? 'bg-amber-500/10 border-amber-500/20 text-amber-400' : 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400'}`}>
                          {doc.status === 'expired' ? 'Expired' : doc.status === 'expiring' ? 'Expiring' : 'Valid'}
                        </span>
                      )}
                      {doc.file_url && (
                        <a href={doc.file_url} target="_blank" rel="noopener noreferrer" className="w-6 h-6 flex items-center justify-center text-gray-500 hover:text-white cursor-pointer flex-shrink-0">
                          <i className="ri-download-line text-xs"></i>
                        </a>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {clientDocs.length > 0 && (
              <div>
                <p className="text-[10px] text-gray-400 uppercase tracking-wider mb-2">Site Files</p>
                <div className="space-y-1.5">
                  {clientDocs.slice(0, 6).map((doc) => (
                    <div key={doc.id} className="flex items-center gap-3 p-2.5 bg-white/5 rounded-lg">
                      <div className="w-8 h-8 flex items-center justify-center rounded-lg bg-white/5 flex-shrink-0">
                        <i className={`${CATEGORY_ICONS[doc.document_category] || 'ri-file-line'} text-sm text-gray-400`}></i>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-medium text-white truncate">{doc.file_name}</p>
                        <p className="text-[10px] text-gray-400">
                          {doc.document_category?.replace(/_/g, ' ')}
                          {doc.file_size && ` \u00B7 ${formatFileSize(doc.file_size)}`}
                        </p>
                      </div>
                      <span className="text-[10px] text-gray-500 flex-shrink-0">{formatDate(doc.upload_date)}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {allDocsCount > 14 && (
              <p className="text-center text-[10px] text-gray-500 mt-1">Showing {Math.min(allDocsCount, 14)} of {allDocsCount} files</p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}