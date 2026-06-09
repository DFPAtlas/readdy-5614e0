'use client';

import { useEffect } from 'react';
import { useIncidentReports } from '../useIncidentReports';

interface ReportsTabProps {
  incidentId: string;
}

export default function ReportsTab({ incidentId }: ReportsTabProps) {
  const { reports, loading, fetchReports } = useIncidentReports(incidentId);

  useEffect(() => {
    fetchReports();
  }, [incidentId]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-16">
        <div className="w-8 h-8 border-2 border-blue-500/30 border-t-blue-500 rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="bg-[#111827]/60 border border-gray-800 rounded-xl p-4">
      <h3 className="text-sm font-semibold text-white uppercase tracking-wider mb-4">
        Generated Reports ({reports.length})
      </h3>

      {reports.length === 0 ? (
        <div className="text-center py-10">
          <div className="w-10 h-10 mx-auto flex items-center justify-center text-gray-600 mb-2">
            <i className="ri-file-text-line text-xl"></i>
          </div>
          <p className="text-sm text-gray-500">No PDF reports generated yet.</p>
          <p className="text-xs text-gray-600 mt-1">Click "Generate Report PDF" in Quick Actions to create one.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {reports.map((r) => (
            <a
              key={r.id}
              href={r.file_url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-3 p-3 rounded-lg bg-gray-800/40 border border-gray-700/50 hover:border-gray-600 transition-colors cursor-pointer"
            >
              <div className="w-10 h-10 rounded-lg bg-red-500/10 flex items-center justify-center flex-shrink-0">
                <div className="w-5 h-5 flex items-center justify-center text-red-400">
                  <i className="ri-file-pdf-line text-sm"></i>
                </div>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-white truncate">{r.title}</p>
                <p className="text-xs text-gray-500">
                  {new Date(r.generated_at).toLocaleDateString('en-GB', {
                    day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit'
                  })}
                </p>
              </div>
              <div className="w-8 h-8 flex items-center justify-center text-gray-500 hover:text-white transition-colors">
                <i className="ri-download-line text-sm"></i>
              </div>
            </a>
          ))}
        </div>
      )}
    </div>
  );
}