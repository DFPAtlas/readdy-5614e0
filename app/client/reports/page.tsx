'use client';

import { useClientPortal } from '@/lib/useClientPortal';
import AgentGate from '@/components/AgentGate';
import { useAuth } from '@/lib/auth';
import { callAgent, logWebhookEvent } from '@/lib/guardianhubAgents';
import { useEffect, useCallback, useState } from 'react';
import WidgetBoundary from '@/components/dashboard/WidgetBoundary';
import WidgetFallback from '@/components/dashboard/WidgetFallback';

export default function ClientReportsPage() {
  const { reports, isLoading } = useClientPortal();
  const { profile } = useAuth();

  const triggerReportAgent = useCallback(async () => {
    if (!profile?.id) return;
    try {
      await callAgent(
        'report_generator',
        { reports_available: reports.filter(r => r.status === 'sent').length },
        { clientId: profile.company_id, userId: profile.id, requestedPage: '/client/reports', requestedFeature: 'report_generator' }
      );
    } catch {}
  }, [profile?.id, profile?.company_id, reports.length]);

  useEffect(() => {
    if (!isLoading && profile?.id) triggerReportAgent();
  }, [isLoading, profile?.id]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  const readyReports = reports.filter((r) => r.status === 'sent');

  return (
    <AgentGate pagePath="/client/reports" featureName="Reports">
    <div className="space-y-6">
      <WidgetBoundary widgetName="ReportsHeader" pagePath="/client/reports" clientId={profile?.company_id} userId={profile?.id}>
        <div>
          <h1 className="text-2xl font-semibold text-white">Reports</h1>
          <p className="text-gray-400 mt-1">Weekly security reports and incident summaries</p>
        </div>
      </WidgetBoundary>

      <WidgetBoundary widgetName="ReportsGrid" pagePath="/client/reports" clientId={profile?.company_id} userId={profile?.id} fallbackTitle="Reports">
        {readyReports.length === 0 ? (
          <WidgetFallback state="empty" title="No reports" message="Weekly reports are generated every Monday morning. Check back soon." />
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
      </WidgetBoundary>
    </div>
    </AgentGate>
  );
}