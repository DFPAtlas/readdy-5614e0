'use client';

import { useSiteCompliance } from '@/lib/useSiteCompliance';

function formatDate(dateStr: string | null) {
  if (!dateStr) return 'N/A';
  return new Date(dateStr).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
}

function getExpiryBadge(days: number): { label: string; style: string } {
  if (days < 0) return { label: 'Expired', style: 'bg-red-500/10 border-red-500/20 text-red-400' };
  if (days <= 30) return { label: `${days}d`, style: 'bg-red-500/10 border-red-500/20 text-red-400' };
  if (days <= 60) return { label: `${days}d`, style: 'bg-amber-500/10 border-amber-500/20 text-amber-400' };
  return { label: `${days}d`, style: 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' };
}

function getStatusBadge(status: string): { label: string; style: string } {
  switch (status) {
    case 'current': return { label: 'Current', style: 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' };
    case 'good': return { label: 'Good', style: 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' };
    case 'missing': return { label: 'Missing', style: 'bg-red-500/10 border-red-500/20 text-red-400' };
    case 'pending': return { label: 'Pending', style: 'bg-amber-500/10 border-amber-500/20 text-amber-400' };
    case 'unknown': return { label: 'Unknown', style: 'bg-gray-500/10 border-gray-500/20 text-gray-400' };
    default: return { label: status, style: 'bg-gray-500/10 border-gray-500/20 text-gray-400' };
  }
}

export default function ComplianceWidget({ siteId, companyId, enabled }: { siteId: string; companyId: string | null; enabled: boolean }) {
  const { compliance, certExpiries, trainingExpiries, loading, error } = useSiteCompliance(siteId, companyId, enabled);

  if (!enabled) return null;

  const sopBadge = getStatusBadge(compliance.sopStatus);
  const emergencyBadge = getStatusBadge(compliance.emergencyStatus);

  const riskLevelStyle = compliance.riskLevel === 'high'
    ? 'bg-red-500/10 border-red-500/20 text-red-400'
    : compliance.riskLevel === 'medium'
      ? 'bg-amber-500/10 border-amber-500/20 text-amber-400'
      : 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400';

  const scoreColor = compliance.overallScore != null
    ? compliance.overallScore >= 80 ? 'text-emerald-400' : compliance.overallScore >= 50 ? 'text-amber-400' : 'text-red-400'
    : 'text-gray-400';

  const totalWarnings = certExpiries.length + trainingExpiries.length;

  return (
    <div className="bg-[#0f172a]/70 backdrop-blur-sm border border-white/10 rounded-xl overflow-hidden">
      <div className="px-5 py-4 border-b border-white/10 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 flex items-center justify-center bg-indigo-500/10 rounded-lg border border-indigo-500/20">
            <i className="ri-shield-check-line text-indigo-400 text-sm"></i>
          </div>
          <h3 className="text-sm font-semibold text-white">Compliance</h3>
        </div>
        {totalWarnings > 0 && (
          <span className="text-xs px-2 py-0.5 bg-red-500/10 border border-red-500/20 text-red-400 rounded-full font-medium">{totalWarnings} warning{totalWarnings !== 1 ? 's' : ''}</span>
        )}
      </div>
      <div className="p-4">
        {loading ? (
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-indigo-500"></div>
          </div>
        ) : error ? (
          <div className="text-center py-6">
            <p className="text-xs text-gray-500">Could not load compliance data</p>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-2">
              <div className="bg-white/5 rounded-lg p-3 border border-white/5">
                <p className="text-[10px] text-gray-400 uppercase tracking-wider mb-1">Risk Level</p>
                <span className={`text-xs px-2 py-0.5 rounded border font-medium ${riskLevelStyle}`}>
                  {compliance.riskLevel ? compliance.riskLevel.charAt(0).toUpperCase() + compliance.riskLevel.slice(1) : 'Not set'}
                </span>
              </div>
              <div className="bg-white/5 rounded-lg p-3 border border-white/5">
                <p className="text-[10px] text-gray-400 uppercase tracking-wider mb-1">Risk Score</p>
                <p className={`text-lg font-bold ${scoreColor}`}>{compliance.riskScore ?? '--'}<span className="text-xs text-gray-500 font-normal">/100</span></p>
              </div>
              <div className="bg-white/5 rounded-lg p-3 border border-white/5">
                <p className="text-[10px] text-gray-400 uppercase tracking-wider mb-1">Risk Assessment</p>
                {compliance.riskAssessmentExpiry ? (
                  <div>
                    <span className={`text-xs px-2 py-0.5 rounded border font-medium ${getExpiryBadge(Math.ceil((new Date(compliance.riskAssessmentExpiry).getTime() - Date.now()) / (1000 * 60 * 60 * 24))).style}`}>
                      Expires {formatDate(compliance.riskAssessmentExpiry)}
                    </span>
                  </div>
                ) : (
                  <span className="text-xs text-gray-500">Not uploaded</span>
                )}
              </div>
              <div className="bg-white/5 rounded-lg p-3 border border-white/5">
                <p className="text-[10px] text-gray-400 uppercase tracking-wider mb-1">Assignment Instructions</p>
                {compliance.assignmentInstructionsExpiry ? (
                  <span className={`text-xs px-2 py-0.5 rounded border font-medium ${getExpiryBadge(Math.ceil((new Date(compliance.assignmentInstructionsExpiry).getTime() - Date.now()) / (1000 * 60 * 60 * 24))).style}`}>
                    Expires {formatDate(compliance.assignmentInstructionsExpiry)}
                  </span>
                ) : (
                  <span className={`text-xs px-2 py-0.5 rounded border font-medium ${compliance.hasAssignmentInstructions ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' : 'bg-gray-500/10 border-gray-500/20 text-gray-400'}`}>
                    {compliance.hasAssignmentInstructions ? 'On file' : 'Not uploaded'}
                  </span>
                )}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div className="bg-white/5 rounded-lg p-3 border border-white/5">
                <p className="text-[10px] text-gray-400 uppercase tracking-wider mb-1">SOP Status</p>
                <span className={`text-xs px-2 py-0.5 rounded border font-medium ${sopBadge.style}`}>{sopBadge.label}</span>
              </div>
              <div className="bg-white/5 rounded-lg p-3 border border-white/5">
                <p className="text-[10px] text-gray-400 uppercase tracking-wider mb-1">Emergency Procedures</p>
                <span className={`text-xs px-2 py-0.5 rounded border font-medium ${emergencyBadge.style}`}>{emergencyBadge.label}</span>
              </div>
              <div className="bg-white/5 rounded-lg p-3 border border-white/5">
                <p className="text-[10px] text-gray-400 uppercase tracking-wider mb-1">Patrol Route</p>
                <span className={`text-xs px-2 py-0.5 rounded border font-medium ${getStatusBadge(compliance.patrolRouteStatus).style}`}>{getStatusBadge(compliance.patrolRouteStatus).label}</span>
              </div>
              <div className="bg-white/5 rounded-lg p-3 border border-white/5">
                <p className="text-[10px] text-gray-400 uppercase tracking-wider mb-1">Incident Records</p>
                <span className={`text-xs px-2 py-0.5 rounded border font-medium ${getStatusBadge(compliance.incidentRecordsStatus).style}`}>{getStatusBadge(compliance.incidentRecordsStatus).label}</span>
              </div>
            </div>

            {compliance.overallScore != null && (
              <div className="bg-white/5 rounded-lg p-4 border border-white/5">
                <p className="text-[10px] text-gray-400 uppercase tracking-wider mb-2">Overall Compliance Score</p>
                <div className="flex items-end gap-2">
                  <span className={`text-3xl font-bold ${scoreColor}`}>{compliance.overallScore}</span>
                  <span className="text-sm text-gray-500 mb-1">/ 100</span>
                </div>
                <div className="w-full bg-white/5 rounded-full h-2 mt-2">
                  <div
                    className={`h-2 rounded-full transition-all ${compliance.overallScore >= 80 ? 'bg-emerald-500' : compliance.overallScore >= 50 ? 'bg-amber-500' : 'bg-red-500'}`}
                    style={{ width: `${Math.min(compliance.overallScore, 100)}%` }}
                  ></div>
                </div>
              </div>
            )}

            {compliance.riskNarrative && (
              <div className="bg-indigo-500/[0.04] border border-indigo-500/20 rounded-lg p-3">
                <p className="text-[10px] text-indigo-400 uppercase tracking-wider mb-1">AI Risk Analysis</p>
                <p className="text-xs text-gray-300 line-clamp-3">{compliance.riskNarrative}</p>
              </div>
            )}

            {certExpiries.length > 0 && (
              <div>
                <p className="text-[10px] text-red-400 uppercase tracking-wider mb-2 flex items-center gap-1">
                  <i className="ri-award-line"></i>
                  Licence &amp; Cert Expiry ({certExpiries.length})
                </p>
                <div className="space-y-1.5 max-h-48 overflow-y-auto">
                  {certExpiries.map((cert, i) => {
                    const badge = getExpiryBadge(cert.daysUntilExpiry);
                    return (
                      <div key={i} className="flex items-center justify-between p-2.5 bg-white/5 rounded-lg">
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-medium text-white truncate">{cert.cert_name}</p>
                          <p className="text-[10px] text-gray-400">{cert.guard_name} \u00B7 {cert.cert_type}</p>
                        </div>
                        <div className="flex items-center gap-2 flex-shrink-0">
                          <span className="text-[10px] text-gray-500">{formatDate(cert.expiry_date)}</span>
                          <span className={`text-[10px] px-1.5 py-0.5 rounded border font-medium ${badge.style}`}>{badge.label}</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {trainingExpiries.length > 0 && (
              <div>
                <p className="text-[10px] text-amber-400 uppercase tracking-wider mb-2 flex items-center gap-1">
                  <i className="ri-graduation-cap-line"></i>
                  Training Expiry ({trainingExpiries.length})
                </p>
                <div className="space-y-1.5 max-h-48 overflow-y-auto">
                  {trainingExpiries.map((t, i) => {
                    const badge = getExpiryBadge(t.daysUntilExpiry);
                    return (
                      <div key={i} className="flex items-center justify-between p-2.5 bg-white/5 rounded-lg">
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-medium text-white truncate">{t.module_title}</p>
                          <p className="text-[10px] text-gray-400">{t.guard_name}{t.passed ? ' \u00B7 Passed' : ' \u00B7 Not passed'}</p>
                        </div>
                        <div className="flex items-center gap-2 flex-shrink-0">
                          <span className="text-[10px] text-gray-500">{formatDate(t.expires_at)}</span>
                          <span className={`text-[10px] px-1.5 py-0.5 rounded border font-medium ${badge.style}`}>{badge.label}</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}