'use client';

import { useState } from 'react';
import { useClientWeeklyReports } from '@/lib/useClientWeeklyReports';
import ReportBuilder from './ReportBuilder';
import LoadingState from './LoadingState';
import { DashboardPageSkeleton } from '@/app/components/PageSkeleton';
import { FeatureGate } from '@/lib/useEntitlements';

export default function ClientWeeklyReportsClient() {
  const { loading, error, emailLogs, schedules } = useClientWeeklyReports();
  const [previewCount, setPreviewCount] = useState(0);
  const [exportCount, setExportCount] = useState(0);
  const [emailCount, setEmailCount] = useState(0);

  if (loading && !emailLogs.length) {
    return (
      <div className="space-y-6">
        <DashboardPageSkeleton />
      </div>
    );
  }

  return (
    <FeatureGate feature="hasAiReports">
    <div className="space-y-6">
      <ReportBuilder
        onPreview={() => setPreviewCount((c) => c + 1)}
        onExportPDF={() => setExportCount((c) => c + 1)}
        onExportCSV={() => setExportCount((c) => c + 1)}
        onEmailReport={() => setEmailCount((c) => c + 1)}
      />

      {/* Recent Activity */}
      {emailLogs.length > 0 && (
        <div className="bg-[#111827]/60 border border-gray-800 rounded-xl p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold text-white">Recent Report Emails</h3>
            <span className="text-xs text-gray-500">{emailLogs.length} sent</span>
          </div>
          <div className="space-y-2">
            {emailLogs.slice(0, 5).map((log) => (
              <div key={log.id} className="flex items-center justify-between py-2 border-b border-gray-800/50 last:border-0">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-blue-500/10 flex items-center justify-center flex-shrink-0">
                    <div className="w-4 h-4 flex items-center justify-center text-blue-400">
                      <i className="ri-mail-send-line"></i>
                    </div>
                  </div>
                  <div>
                    <p className="text-sm text-white">{log.report_type} report</p>
                    <p className="text-xs text-gray-500">
                      {log.period_start} to {log.period_end}
                    </p>
                  </div>
                </div>
                <span className="text-xs text-gray-500">{log.status}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Scheduled Reports */}
      {schedules.length > 0 && (
        <div className="bg-[#111827]/60 border border-gray-800 rounded-xl p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold text-white">Scheduled Reports</h3>
            <span className="text-xs text-gray-500">{schedules.length} active</span>
          </div>
          <div className="space-y-2">
            {schedules.slice(0, 5).map((s) => (
              <div key={s.id} className="flex items-center justify-between py-2 border-b border-gray-800/50 last:border-0">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-emerald-500/10 flex items-center justify-center flex-shrink-0">
                    <div className="w-4 h-4 flex items-center justify-center text-emerald-400">
                      <i className="ri-calendar-check-line"></i>
                    </div>
                  </div>
                  <div>
                    <p className="text-sm text-white">{s.schedule_name}</p>
                    <p className="text-xs text-gray-500">
                      {s.frequency} — {s.time_of_day}
                    </p>
                  </div>
                </div>
                <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${
                  s.is_active ? 'bg-emerald-500/10 text-emerald-400' : 'bg-gray-500/10 text-gray-400'
                }`}>
                  {s.is_active ? 'Active' : 'Paused'}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* No data state */}
      {emailLogs.length === 0 && schedules.length === 0 && (
        <div className="bg-[#111827]/40 border border-gray-800 rounded-xl p-8 text-center">
          <div className="w-12 h-12 mx-auto mb-3 flex items-center justify-center rounded-lg bg-gray-800/50">
            <i className="ri-mail-send-line text-gray-500 text-xl"></i>
          </div>
          <h3 className="text-sm font-semibold text-white mb-1">No reports sent yet</h3>
          <p className="text-sm text-gray-400">Build and preview a report above to start sending weekly updates to clients.</p>
        </div>
      )}
    </div>
    </FeatureGate>
  );
}