'use client';

import { AuditRun, AuditFinding } from '@/lib/useACSCompliance';

export default function AIAuditorPanel({
  aiResult,
  aiLoading,
  onRunAudit,
  auditRuns,
  findings,
}: {
  aiResult: any;
  aiLoading: boolean;
  onRunAudit: () => void;
  auditRuns: AuditRun[];
  findings: AuditFinding[];
}) {
  const latestRun = auditRuns[0];
  const latestFindings = latestRun ? findings.filter((f) => f.audit_run_id === latestRun.id) : [];

  return (
    <div className="space-y-6">
      <div className="bg-[#0f172a]/70 backdrop-blur-sm border border-white/10 rounded-xl p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 flex items-center justify-center bg-indigo-500/10 rounded-xl">
            <i className="ri-sparkling-line text-indigo-400 text-lg"></i>
          </div>
          <div>
            <h2 className="text-base font-semibold text-white">AI ACS Auditor</h2>
            <p className="text-xs text-gray-500">AI-powered compliance engine scans all ACS data for gaps and risks</p>
          </div>
        </div>

        <button
          onClick={onRunAudit}
          disabled={aiLoading}
          className="w-full flex items-center justify-center gap-3 px-6 py-4 bg-indigo-600 hover:bg-indigo-500 text-white text-base font-semibold rounded-xl transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-wait whitespace-nowrap"
        >
          <div className={`w-5 h-5 flex items-center justify-center ${aiLoading ? 'animate-spin' : ''}`}>
            <i className={aiLoading ? 'ri-loader-4-line' : 'ri-sparkling-line'}></i>
          </div>
          {aiLoading ? 'Running AI Audit... Scanning all compliance data...' : 'Run AI ACS Audit'}
        </button>

        <p className="text-xs text-gray-500 mt-3 text-center">
          AI checks: missing documents, expired documents, incomplete personnel files, expired training, missing site records, missing risk assessments, missing patrol records, missing incident reports, missing policies
        </p>
      </div>

      {aiResult && (
        <div className="bg-[#0f172a]/70 backdrop-blur-sm border border-white/10 rounded-xl p-5">
          <h3 className="text-sm font-semibold text-white mb-4">Latest AI Audit Result</h3>

          <div className="grid grid-cols-4 gap-3 mb-4">
            <div className="bg-white/5 rounded-lg p-3 text-center">
              <div className={`text-2xl font-bold ${(aiResult.overall_score || 0) >= 85 ? 'text-emerald-400' : (aiResult.overall_score || 0) >= 60 ? 'text-amber-400' : 'text-red-400'}`}>
                {aiResult.overall_score || 0}%
              </div>
              <div className="text-xs text-gray-500">Overall Score</div>
            </div>
            <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-3 text-center">
              <div className="text-2xl font-bold text-red-400">{aiResult.critical_count || 0}</div>
              <div className="text-xs text-red-400">Critical</div>
            </div>
            <div className="bg-amber-500/10 border border-amber-500/20 rounded-lg p-3 text-center">
              <div className="text-2xl font-bold text-amber-400">{aiResult.high_count || 0}</div>
              <div className="text-xs text-amber-400">High</div>
            </div>
            <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-3 text-center">
              <div className="text-2xl font-bold text-blue-400">{aiResult.total_findings || 0}</div>
              <div className="text-xs text-blue-400">Total Findings</div>
            </div>
          </div>

          {aiResult.summary && (
            <div className="bg-indigo-500/10 border border-indigo-500/20 rounded-lg p-4 mb-4">
              <p className="text-sm text-gray-200 leading-relaxed">{aiResult.summary}</p>
            </div>
          )}

          {aiResult.priority_list && aiResult.priority_list.length > 0 && (
            <div>
              <h4 className="text-sm font-medium text-gray-300 mb-2">Priority Actions</h4>
              <div className="space-y-1">
                {aiResult.priority_list.map((item: string, i: number) => (
                  <div key={i} className="flex items-center gap-2 p-2 bg-white/5 rounded-lg">
                    <span className={`text-xs px-1.5 py-0.5 rounded font-medium ${i < 5 ? 'bg-red-500/20 text-red-400' : 'bg-amber-500/20 text-amber-400'}`}>
                      {i < 5 ? 'CRITICAL' : 'HIGH'}
                    </span>
                    <span className="text-sm text-gray-300">{item}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {auditRuns.length > 0 && (
        <div className="bg-[#0f172a]/70 backdrop-blur-sm border border-white/10 rounded-xl p-5">
          <h3 className="text-sm font-semibold text-white mb-3">Audit History</h3>
          <div className="space-y-2">
            {auditRuns.slice(0, 10).map((run) => (
              <div key={run.id} className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
                <div className="flex items-center gap-3">
                  <div className={`w-8 h-8 flex items-center justify-center rounded-lg ${run.run_type === 'ai' ? 'bg-indigo-500/10' : 'bg-amber-500/10'}`}>
                    <i className={`${run.run_type === 'ai' ? 'ri-sparkling-line text-indigo-400' : 'ri-user-line text-amber-400'}`}></i>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-white">{run.run_type === 'ai' ? 'AI Audit' : 'Manual Audit'}</p>
                    <p className="text-xs text-gray-500">
                      {new Date(run.created_at).toLocaleDateString('en-GB')} {new Date(run.created_at).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2">
                    {run.critical_count > 0 && <span className="text-xs text-red-400">{run.critical_count}C</span>}
                    {run.high_count > 0 && <span className="text-xs text-amber-400">{run.high_count}H</span>}
                    {run.medium_count > 0 && <span className="text-xs text-yellow-400">{run.medium_count}M</span>}
                  </div>
                  <span className={`text-sm font-bold ${(run.overall_score || 0) >= 85 ? 'text-emerald-400' : (run.overall_score || 0) >= 60 ? 'text-amber-400' : 'text-red-400'}`}>
                    {run.overall_score || 0}%
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}