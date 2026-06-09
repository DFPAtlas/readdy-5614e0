'use client';

import { useState } from 'react';
import { useSOPDocuments } from '@/lib/useSOPDocuments';

export default function GuardSOPView({ siteId }: { siteId: string }) {
  const { docs, loading } = useSOPDocuments(siteId);
  const [expanded, setExpanded] = useState(false);

  const formatBytes = (bytes: number | null) => {
    if (!bytes) return '';
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const visible = expanded ? docs : docs.slice(0, 3);

  if (loading) {
    return (
      <div className="bg-[#1a1a1a] border border-white/5 rounded-xl p-4">
        <div className="flex items-center gap-2 mb-3">
          <div className="w-8 h-8 flex items-center justify-center bg-blue-500/10 rounded-lg">
            <i className="ri-file-list-3-line text-blue-400 text-sm"></i>
          </div>
          <p className="text-sm font-medium text-white">SOP Documents</p>
        </div>
        <div className="flex justify-center py-4">
          <i className="ri-loader-4-line animate-spin text-gray-500 text-lg"></i>
        </div>
      </div>
    );
  }

  if (docs.length === 0) {
    return (
      <div className="bg-[#1a1a1a] border border-white/5 rounded-xl p-4">
        <div className="flex items-center gap-2 mb-2">
          <div className="w-8 h-8 flex items-center justify-center bg-blue-500/10 rounded-lg">
            <i className="ri-file-list-3-line text-blue-400 text-sm"></i>
          </div>
          <p className="text-sm font-medium text-white">SOP Documents</p>
        </div>
        <p className="text-xs text-gray-500">No procedures uploaded for this site yet.</p>
      </div>
    );
  }

  return (
    <div className="bg-[#1a1a1a] border border-white/5 rounded-xl p-4">
      <div className="flex items-center gap-2 mb-3">
        <div className="w-8 h-8 flex items-center justify-center bg-blue-500/10 rounded-lg">
          <i className="ri-file-list-3-line text-blue-400 text-sm"></i>
        </div>
        <div>
          <p className="text-sm font-medium text-white">SOP Documents</p>
          <p className="text-xs text-gray-500">{docs.length} document{docs.length !== 1 ? 's' : ''}</p>
        </div>
      </div>

      <div className="space-y-2">
        {visible.map((d) => (
          <a
            key={d.id}
            href={d.file_url}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-3 p-3 bg-white/5 rounded-lg hover:bg-white/10 transition-colors cursor-pointer"
          >
            <div className="w-9 h-9 flex items-center justify-center bg-blue-500/10 rounded-lg flex-shrink-0">
              <i className="ri-file-text-line text-blue-400 text-sm"></i>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm text-white truncate">{d.title}</p>
              <div className="flex items-center gap-2 mt-0.5">
                <span className="text-[10px] px-1.5 py-0.5 bg-white/10 text-gray-400 rounded">{d.category}</span>
                <span className="text-[10px] text-blue-400 font-medium">v{d.version_number || 1}</span>
                <span className="text-[10px] text-gray-500">{formatBytes(d.file_size)}</span>
              </div>
              {d.change_notes && (
                <p className="text-[10px] text-gray-500 mt-0.5 italic">{d.change_notes}</p>
              )}
            </div>
            <div className="w-8 h-8 flex items-center justify-center text-gray-500">
              <i className="ri-download-line text-sm"></i>
            </div>
          </a>
        ))}
      </div>

      {docs.length > 3 && (
        <button
          onClick={() => setExpanded((e) => !e)}
          className="w-full mt-2 py-2 text-xs text-blue-400 hover:text-blue-300 transition-colors cursor-pointer whitespace-nowrap"
        >
          {expanded ? 'Show less' : `Show all ${docs.length} documents`}
        </button>
      )}
    </div>
  );
}