import type { SOPLibraryDocument } from '@/lib/useSOPLibrary';
import Pagination from '@/app/sites/components/Pagination';
import SOPSortHeader from './SOPSortHeader';
import SOPTableSkeleton from './SOPTableSkeleton';

interface Props {
  docs: SOPLibraryDocument[];
  loading: boolean;
  sortKey: string;
  sortDir: 'asc' | 'desc';
  onSort: (key: string) => void;
  onReindex: (doc: SOPLibraryDocument) => void;
  onDelete: (doc: SOPLibraryDocument) => void;
  page: number;
  totalPages: number;
  onPageChange: (p: number) => void;
  total: number;
  search: string;
}

function fileTypePill(type: string | null) {
  if (!type) return <span className="text-[10px] px-1.5 py-0.5 bg-gray-700 text-gray-400 rounded border border-gray-600 whitespace-nowrap">—</span>;
  const map: Record<string, string> = {
    PDF: 'bg-red-500/10 text-red-400 border-red-500/20',
    DOCX: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
    DOC: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
    TXT: 'bg-gray-500/10 text-gray-400 border-gray-500/20',
  };
  const cls = map[type.toUpperCase()] || 'bg-gray-500/10 text-gray-400 border-gray-500/20';
  return <span className={`text-[10px] px-1.5 py-0.5 rounded border whitespace-nowrap ${cls}`}>{type.toUpperCase()}</span>;
}

function statusBadge(status: string | null, errorMsg?: string | null) {
  if (status === 'indexed') {
    return (
      <span className="inline-flex items-center gap-1 text-[10px] px-2 py-0.5 bg-green-500/10 text-green-400 rounded border border-green-500/20 whitespace-nowrap">
        <div className="w-1.5 h-1.5 rounded-full bg-green-400"></div>
        Indexed
      </span>
    );
  }
  if (status === 'processing') {
    return (
      <span className="inline-flex items-center gap-1 text-[10px] px-2 py-0.5 bg-yellow-500/10 text-yellow-400 rounded border border-yellow-500/20 whitespace-nowrap">
        <div className="w-1.5 h-1.5 rounded-full bg-yellow-400 animate-pulse"></div>
        Processing
      </span>
    );
  }
  if (status === 'failed') {
    return (
      <span
        className="inline-flex items-center gap-1 text-[10px] px-2 py-0.5 bg-red-500/10 text-red-400 rounded border border-red-500/20 whitespace-nowrap cursor-help"
        title={errorMsg || 'Indexing failed'}
      >
        <div className="w-1.5 h-1.5 rounded-full bg-red-400"></div>
        Failed
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1 text-[10px] px-2 py-0.5 bg-gray-700 text-gray-400 rounded border border-gray-600 whitespace-nowrap">
      <div className="w-1.5 h-1.5 rounded-full bg-gray-400"></div>
      Unknown
    </span>
  );
}

export default function SOPsTable({
  docs, loading, sortKey, sortDir, onSort, onReindex, onDelete, page, totalPages, onPageChange, total, search,
}: Props) {
  return (
    <div className="bg-[#111827] border border-gray-800 rounded-xl overflow-hidden">
      {loading ? (
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-800/40">
              <tr>
                <th className="px-5 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Title</th>
                <th className="px-5 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Site</th>
                <th className="px-5 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Type</th>
                <th className="px-5 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Status</th>
                <th className="px-5 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Uploaded</th>
                <th className="px-5 py-3 text-right text-xs font-medium text-gray-400 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <SOPTableSkeleton />
          </table>
        </div>
      ) : docs.length === 0 ? (
        <div className="text-center py-12">
          <div className="w-12 h-12 mx-auto mb-4 flex items-center justify-center rounded-xl bg-gray-800/50">
            <div className="w-6 h-6 flex items-center justify-center">
              <i className="ri-file-list-3-line text-gray-500 text-xl"></i>
            </div>
          </div>
          <h3 className="text-sm font-medium text-gray-300 mb-1">
            {search ? 'No documents match your search' : 'No SOP documents yet'}
          </h3>
          <p className="text-sm text-gray-500">
            {search ? 'Try adjusting your search or filters' : 'Upload your first document to get started.'}
          </p>
        </div>
      ) : (
        <>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-800/40">
                <tr>
                  <SOPSortHeader label="Title" sortKey="title" activeKey={sortKey} dir={sortDir} onSort={onSort} />
                  <SOPSortHeader label="Site" sortKey="site_name" activeKey={sortKey} dir={sortDir} onSort={onSort} />
                  <th className="px-5 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Type</th>
                  <th className="px-5 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Status</th>
                  <SOPSortHeader label="Uploaded" sortKey="created_at" activeKey={sortKey} dir={sortDir} onSort={onSort} />
                  <th className="px-5 py-3 text-right text-xs font-medium text-gray-400 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-800">
                {docs.map((doc) => (
                  <tr key={doc.id} className="hover:bg-gray-800/20 transition-colors">
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-blue-500/10 flex items-center justify-center flex-shrink-0">
                          <div className="w-4 h-4 flex items-center justify-center">
                            <i className="ri-file-text-line text-blue-400 text-sm"></i>
                          </div>
                        </div>
                        <div className="min-w-0">
                          <p className="text-sm font-medium text-white truncate">{doc.title}</p>
                          {doc.description && (
                            <p className="text-xs text-gray-500 truncate">{doc.description}</p>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-3.5 text-sm text-gray-300">
                      {doc.site_name || (<span className="text-gray-500 italic">Company-wide</span>
                      )}
                    </td>
                    <td className="px-5 py-3.5">{fileTypePill(doc.file_type)}</td>
                    <td className="px-5 py-3.5">{statusBadge(doc.status, doc.error_message)}</td>
                    <td className="px-5 py-3.5">
                      <div className="space-y-0.5">
                        <p className="text-sm text-gray-300">{doc.uploader_name || '—'}</p>
                        <p className="text-xs text-gray-500">
                          {new Date(doc.created_at).toLocaleDateString('en-GB', {
                            day: 'numeric',
                            month: 'short',
                            year: '2-digit',
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </p>
                      </div>
                    </td>
                    <td className="px-5 py-3.5 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <a
                          href={doc.file_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="w-8 h-8 flex items-center justify-center text-gray-400 hover:text-blue-400 hover:bg-blue-500/10 rounded-lg transition-colors cursor-pointer"
                          title="Download"
                        >
                          <div className="w-4 h-4 flex items-center justify-center"><i className="ri-download-line"></i></div>
                        </a>
                        <button
                          onClick={() => onReindex(doc)}
                          disabled={doc.status === 'processing'}
                          className="w-8 h-8 flex items-center justify-center text-gray-400 hover:text-violet-400 hover:bg-violet-500/10 rounded-lg transition-colors cursor-pointer disabled:opacity-30"
                          title="Re-index for AI search"
                        >
                          <div className="w-4 h-4 flex items-center justify-center"><i className="ri-refresh-line"></i></div>
                        </button>
                        <button
                          onClick={() => onDelete(doc)}
                          className="w-8 h-8 flex items-center justify-center text-gray-400 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors cursor-pointer"
                          title="Delete"
                        >
                          <div className="w-4 h-4 flex items-center justify-center"><i className="ri-delete-bin-line"></i></div>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <Pagination page={page} totalPages={totalPages} onChange={onPageChange} total={total} />
        </>
      )}
    </div>
  );
}