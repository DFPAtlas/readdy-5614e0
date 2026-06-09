'use client';

import { useClientPortal } from '@/lib/useClientPortal';

export default function ClientReportsPage() {
  const { reports, isLoading } = useClientPortal();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  const readyReports = reports.filter((r) => r.status === 'sent');

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-white">Reports</h1>
        <p className="text-gray-400 mt-1">Weekly security reports and incident summaries</p>
      </div>

      {readyReports.length === 0 ? (
        <div className="bg-[#0f172a]/70 backdrop-blur-sm border border-white/10 rounded-xl p-12 text-center">
          <div className="w-16 h-16 flex items-center justify-center bg-white/10 rounded-full mx-auto mb-4">
            <i className="ri-file-list-3-line text-gray-500 text-2xl"></i>
          </div>
          <p className="text-gray-400 font-medium">No reports available yet</p>
          <p className="text-sm text-gray-500 mt-1">Weekly reports are generated every Monday morning. Check back soon.</p>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 gap-4">
          {readyReports.map((report) => (
            <div key={report.id} className="bg-[#0f172a]/70 backdrop-blur-sm border border-white/10 rounded-xl p-5 hover:border-blue-500/30 transition-colors">
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-2">
                  <div className="w-10 h-10 flex items-center justify-center bg-blue-500/10 rounded-lg">
                    <i className="ri-file-list-3-line text-blue-400 text-lg"></i>
                  </div>
                  <div>
                    <h3 className="font-medium text-white text-sm">{report.title || 'Weekly Security Report'}</h3>
                    <p className="text-xs text-gray-500">{report.site_name}</p>
                  </div>
                </div>
                <span className="text-[10px] px-2 py-0.5 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded-full font-medium">
                  Published
                </span>
              </div>

              {report.ai_summary && (
                <p className="text-xs text-gray-400 mb-4 line-clamp-2">{report.ai_summary}</p>
              )}

              <div className="flex items-center justify-between">
                <span className="text-xs text-gray-500">
                  {report.period_start
                    ? `${new Date(report.period_start).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })} — ${new Date(report.period_end || report.generated_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}`
                    : new Date(report.generated_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}
                </span>
                {report.file_url && (
                  <a
                    href={report.file_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-blue-400 bg-blue-500/10 rounded-lg hover:bg-blue-500/20 transition-colors cursor-pointer whitespace-nowrap"
                  >
                    <div className="w-3.5 h-3.5 flex items-center justify-center"><i className="ri-download-line"></i></div>
                    Download PDF
                  </a>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}