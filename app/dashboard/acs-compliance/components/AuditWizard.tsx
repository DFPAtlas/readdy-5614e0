'use client';

import { useState } from 'react';
import { GovernanceItem, GuardComplianceProfile, SiteComplianceItem, HealthSafetyItem, CustomerServiceItem } from '@/lib/useACSCompliance';

const STEPS = [
  { key: 'company', label: 'Company Details', icon: 'ri-building-line' },
  { key: 'policies', label: 'Policies', icon: 'ri-file-shield-line' },
  { key: 'personnel', label: 'Personnel Files', icon: 'ri-user-settings-line' },
  { key: 'training', label: 'Training', icon: 'ri-graduation-cap-line' },
  { key: 'sites', label: 'Sites', icon: 'ri-building-3-line' },
  { key: 'hns', label: 'Health & Safety', icon: 'ri-heart-pulse-line' },
  { key: 'customer', label: 'Customer Service', icon: 'ri-customer-service-2-line' },
  { key: 'final', label: 'Final Audit', icon: 'ri-list-check' },
];

export default function AuditWizard({
  governanceItems,
  guardProfiles,
  siteComplianceItems,
  healthSafetyItems,
  customerServiceItems,
  onRefresh,
}: {
  governanceItems: GovernanceItem[];
  guardProfiles: GuardComplianceProfile[];
  siteComplianceItems: SiteComplianceItem[];
  healthSafetyItems: HealthSafetyItem[];
  customerServiceItems: CustomerServiceItem[];
  onRefresh: () => void;
}) {
  const [currentStep, setCurrentStep] = useState(0);

  const govReady = governanceItems.filter((g) => g.status === 'approved' || g.status === 'current').length;
  const govTotal = governanceItems.length;
  const govScore = govTotal > 0 ? Math.round((govReady / govTotal) * 100) : 0;

  const personnelReady = guardProfiles.filter((p) => p.status === 'green').length;
  const personnelScore = guardProfiles.length > 0 ? Math.round((personnelReady / guardProfiles.length) * 100) : 0;

  const siteReady = siteComplianceItems.filter((s) => s.status === 'green').length;
  const siteScore = siteComplianceItems.length > 0 ? Math.round((siteReady / siteComplianceItems.length) * 100) : 0;

  const hnsReady = healthSafetyItems.filter((h) => h.status === 'current' || h.status === 'approved').length;
  const hnsScore = healthSafetyItems.length > 0 ? Math.round((hnsReady / healthSafetyItems.length) * 100) : 0;

  const csReady = customerServiceItems.filter((c) => c.status === 'complete' || c.status === 'closed').length;
  const csScore = customerServiceItems.length > 0 ? Math.round((csReady / customerServiceItems.length) * 100) : 0;

  const scoreEntries = [
    { label: 'Governance', score: govScore, ready: govReady, total: govTotal },
    { label: 'Personnel', score: personnelScore, ready: personnelReady, total: guardProfiles.length },
    { label: 'Training', score: 0, ready: 0, total: 0 },
    { label: 'Sites', score: siteScore, ready: siteReady, total: siteComplianceItems.length },
    { label: 'Health & Safety', score: hnsScore, ready: hnsReady, total: healthSafetyItems.length },
    { label: 'Customer Service', score: csScore, ready: csReady, total: customerServiceItems.length },
  ];
  const overallWizardScore = Math.round(
    scoreEntries.reduce((s, e) => s + e.score, 0) / scoreEntries.length
  );

  function buildDeficiencyList(): { area: string; item: string; severity: 'critical' | 'high' | 'medium' | 'low'; action: string }[] {
    const list: { area: string; item: string; severity: 'critical' | 'high' | 'medium' | 'low'; action: string }[] = [];

    governanceItems.filter((g) => g.status !== 'approved' && g.status !== 'current').forEach((g) => {
      const sev: 'critical' | 'high' | 'medium' | 'low' = g.score_impact >= 5 ? 'critical' : g.score_impact >= 3 ? 'high' : 'medium';
      list.push({ area: 'Governance', item: `${g.title} — ${g.status === 'unknown' ? 'Missing' : g.status}`, severity: sev, action: `Upload and review ${g.title.toLowerCase()} document` });
    });

    guardProfiles.filter((p) => p.status !== 'green').forEach((p) => {
      const missing: string[] = [];
      if (!p.siaLicence) missing.push('SIA Licence');
      if (!p.rightToWork) missing.push('Right to Work');
      if (!p.photoId) missing.push('Photo ID');
      if (!p.addressVerification) missing.push('Address Verification');
      if (!p.employmentHistory) missing.push('Employment History');
      if (!p.references) missing.push('References');
      if (!p.bs7858Screening) missing.push('BS7858 Screening');
      if (!p.emergencyContact) missing.push('Emergency Contact');
      if (!p.employmentContract) missing.push('Employment Contract');
      if (p.expiredTraining > 0) missing.push(`${p.expiredTraining} expired training certs`);
      const sev: 'critical' | 'high' | 'medium' | 'low' = p.completeness < 50 ? 'critical' : p.completeness < 75 ? 'high' : 'medium';
      list.push({ area: 'Personnel', item: `${p.guard_name} — missing: ${missing.join(', ')}`, severity: sev, action: `Complete personnel file for ${p.guard_name}` });
    });

    siteComplianceItems.filter((s) => s.status !== 'green').forEach((s) => {
      const missing: string[] = [];
      if (!s.assignmentInstructions) missing.push('Assignment Instructions');
      if (!s.riskAssessment) missing.push('Risk Assessment');
      if (!s.siteSurvey) missing.push('Site Survey');
      if (!s.emergencyProcedures) missing.push('Emergency Procedures');
      if (!s.patrolRoutes) missing.push('Patrol Routes');
      if (!s.clientSLA) missing.push('Client SLA');
      const sev: 'critical' | 'high' | 'medium' | 'low' = s.score < 50 ? 'critical' : s.score < 75 ? 'high' : 'medium';
      list.push({ area: 'Sites', item: `${s.site_name} (${s.score}%) — missing: ${missing.join(', ')}`, severity: sev, action: `Complete site documentation for ${s.site_name}` });
    });

    healthSafetyItems.filter((h) => h.status !== 'current' && h.status !== 'approved').forEach((h) => {
      list.push({ area: 'Health & Safety', item: `${h.title} — ${h.status === 'unknown' ? 'Not recorded' : h.status}`, severity: 'high', action: `Compile ${h.title.toLowerCase()} and upload to evidence vault` });
    });

    customerServiceItems.filter((c) => c.status !== 'complete' && c.status !== 'closed').forEach((c) => {
      list.push({ area: 'Customer Service', item: `${c.title} — ${c.status === 'not_started' ? 'Not started' : c.status}`, severity: 'medium', action: `Initiate ${c.title.toLowerCase()} process` });
    });

    list.sort((a, b) => {
      const order = { critical: 0, high: 1, medium: 2, low: 3 };
      return order[a.severity] - order[b.severity];
    });

    return list;
  }

  function renderStep() {
    switch (currentStep) {
      case 0:
        return (
          <div className="space-y-3">
            <h3 className="text-base font-semibold text-white mb-4">Step 1: Company Details</h3>
            <p className="text-sm text-gray-400 mb-4">Upload your company registration, insurance certificates, and key business documents.</p>
            <div className="grid sm:grid-cols-2 gap-2">
              {governanceItems.filter((g) => g.category === 'Governance' || g.category === 'Insurance').map((g) => (
                <div key={g.id} className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
                  <span className="text-sm text-gray-300">{g.title}</span>
                  <span className={`text-xs ${g.status === 'approved' || g.status === 'current' ? 'text-emerald-400' : 'text-red-400'}`}>
                    {g.status === 'unknown' ? 'Missing' : g.status}
                  </span>
                </div>
              ))}
            </div>
            <p className="text-sm text-gray-400 mt-3">
              Upload missing documents via the ACS Evidence section in the client portal.
            </p>
          </div>
        );
      case 1:
        return (
          <div className="space-y-3">
            <h3 className="text-base font-semibold text-white mb-4">Step 2: Policies</h3>
            <p className="text-sm text-gray-400 mb-4">Ensure all required policies are uploaded and approved.</p>
            <div className="grid sm:grid-cols-2 gap-2">
              {governanceItems.filter((g) => g.category === 'Policy').map((g) => (
                <div key={g.id} className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
                  <span className="text-sm text-gray-300">{g.title}</span>
                  <span className={`text-xs ${g.status === 'approved' || g.status === 'current' ? 'text-emerald-400' : 'text-red-400'}`}>
                    {g.status === 'unknown' ? 'Missing' : g.status}
                  </span>
                </div>
              ))}
            </div>
          </div>
        );
      case 2:
        return (
          <div className="space-y-3">
            <h3 className="text-base font-semibold text-white mb-4">Step 3: Personnel Files</h3>
            <p className="text-sm text-gray-400 mb-4">Verify all guard personnel files are complete.</p>
            <div className="space-y-2 max-h-96 overflow-y-auto">
              {guardProfiles.map((p) => (
                <div key={p.id} className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
                  <div>
                    <span className="text-sm text-gray-200">{p.guard_name}</span>
                    <div className="flex items-center gap-1 mt-1 flex-wrap">
                      {!p.siaLicence && <span className="text-xs text-red-400">SIA missing</span>}
                      {!p.rightToWork && <span className="text-xs text-red-400">RTW missing</span>}
                      {!p.bs7858Screening && <span className="text-xs text-amber-400">BS7858 pending</span>}
                      {p.expiredTraining > 0 && <span className="text-xs text-red-400">{p.expiredTraining} certs expired</span>}
                    </div>
                  </div>
                  <span className={`text-sm font-bold ${p.status === 'green' ? 'text-emerald-400' : p.status === 'amber' ? 'text-amber-400' : 'text-red-400'}`}>
                    {p.completeness}%
                  </span>
                </div>
              ))}
            </div>
          </div>
        );
      case 3:
        return (
          <div className="space-y-3">
            <h3 className="text-base font-semibold text-white mb-4">Step 4: Training</h3>
            <p className="text-sm text-gray-400 mb-4">Review training records. Ensure all guards have current certifications.</p>
            <div className="grid grid-cols-2 gap-2">
              <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-lg p-4 text-center">
                <div className="text-2xl font-bold text-emerald-400">{guardProfiles.reduce((s, p) => s + p.trainingCerts, 0)}</div>
                <div className="text-xs text-gray-400">Current Certificates</div>
              </div>
              <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-4 text-center">
                <div className="text-2xl font-bold text-red-400">{guardProfiles.reduce((s, p) => s + p.expiredTraining, 0)}</div>
                <div className="text-xs text-gray-400">Expired Certificates</div>
              </div>
            </div>
            <p className="text-sm text-gray-400 mt-3">
              Visit the Training module to manage assignments and track completions.
            </p>
          </div>
        );
      case 4:
        return (
          <div className="space-y-3">
            <h3 className="text-base font-semibold text-white mb-4">Step 5: Sites</h3>
            <p className="text-sm text-gray-400 mb-4">Check all sites have required documentation.</p>
            {siteComplianceItems.map((s) => (
              <div key={s.id} className="p-3 bg-white/5 rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-white">{s.site_name}</span>
                  <span className={`text-sm font-bold ${s.score >= 85 ? 'text-emerald-400' : s.score >= 60 ? 'text-amber-400' : 'text-red-400'}`}>{s.score}%</span>
                </div>
                <div className="flex flex-wrap gap-1">
                  {!s.assignmentInstructions && <span className="text-xs px-1.5 py-0.5 bg-red-500/10 text-red-400 rounded">Assignment Instr.</span>}
                  {!s.riskAssessment && <span className="text-xs px-1.5 py-0.5 bg-red-500/10 text-red-400 rounded">Risk Assessment</span>}
                </div>
              </div>
            ))}
          </div>
        );
      case 5:
        return (
          <div className="space-y-3">
            <h3 className="text-base font-semibold text-white mb-4">Step 6: Health & Safety</h3>
            <p className="text-sm text-gray-400 mb-4">Ensure all H&S records are up to date.</p>
            <div className="grid sm:grid-cols-2 gap-2">
              {healthSafetyItems.map((h) => (
                <div key={h.id} className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
                  <span className="text-sm text-gray-300">{h.title}</span>
                  <span className={`text-xs ${h.status === 'current' || h.status === 'approved' ? 'text-emerald-400' : 'text-gray-400'}`}>
                    {h.status === 'unknown' ? 'Not started' : h.status}
                  </span>
                </div>
              ))}
            </div>
          </div>
        );
      case 6:
        return (
          <div className="space-y-3">
            <h3 className="text-base font-semibold text-white mb-4">Step 7: Customer Service</h3>
            <p className="text-sm text-gray-400 mb-4">Track client satisfaction and service quality.</p>
            <div className="space-y-2">
              {customerServiceItems.map((c) => (
                <div key={c.id} className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
                  <span className="text-sm text-gray-300">{c.title}</span>
                  <span className={`text-xs ${c.status === 'complete' || c.status === 'closed' ? 'text-emerald-400' : 'text-amber-400'}`}>
                    {c.status === 'not_started' ? 'Not Started' : c.status}
                  </span>
                </div>
              ))}
            </div>
          </div>
        );
      case 7:
        const deficiencies = buildDeficiencyList();
        const critical = deficiencies.filter((d) => d.severity === 'critical');
        const high = deficiencies.filter((d) => d.severity === 'high');
        const medium = deficiencies.filter((d) => d.severity === 'medium');
        const low = deficiencies.filter((d) => d.severity === 'low');

        return (
          <div className="space-y-5">
            <h3 className="text-base font-semibold text-white mb-1">Step 8: Final Audit Summary</h3>

            <div className="bg-white/5 rounded-xl p-6 flex flex-col sm:flex-row items-center gap-6">
              <div className={`relative w-28 h-28 flex items-center justify-center rounded-full border-4 ${
                overallWizardScore >= 85 ? 'border-emerald-500/30' : overallWizardScore >= 60 ? 'border-amber-500/30' : 'border-red-500/30'
              }`}>
                <div className={`text-3xl font-bold ${
                  overallWizardScore >= 85 ? 'text-emerald-400' : overallWizardScore >= 60 ? 'text-amber-400' : 'text-red-400'
                }`}>{overallWizardScore}%</div>
              </div>
              <div>
                <div className={`text-lg font-semibold ${
                  overallWizardScore >= 85 ? 'text-emerald-400' : overallWizardScore >= 60 ? 'text-amber-400' : 'text-red-400'
                }`}>
                  {overallWizardScore >= 85 ? 'ACS Assessment Ready' : overallWizardScore >= 60 ? 'Partial Readiness — Gaps Exist' : 'Significant Gaps — Action Required'}
                </div>
                <p className="text-sm text-gray-400 mt-1">
                  {overallWizardScore >= 85
                    ? 'Your organisation meets the minimum readiness threshold. Keep documentation current.'
                    : overallWizardScore >= 60
                    ? `${deficiencies.length} deficiencies identified across ${new Set(deficiencies.map((d) => d.area)).size} areas. Address critical items before ACS visit.`
                    : `${deficiencies.length} major deficiencies found. A structured remediation plan is required before ACS assessment.`}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-4 gap-3">
              {[
                { label: 'Critical', count: critical.length, color: 'bg-red-500', textColor: 'text-red-400', borderColor: 'border-red-500/20', bg: 'bg-red-500/10' },
                { label: 'High', count: high.length, color: 'bg-orange-500', textColor: 'text-orange-400', borderColor: 'border-orange-500/20', bg: 'bg-orange-500/10' },
                { label: 'Medium', count: medium.length, color: 'bg-amber-500', textColor: 'text-amber-400', borderColor: 'border-amber-500/20', bg: 'bg-amber-500/10' },
                { label: 'Low', count: low.length, color: 'bg-blue-500', textColor: 'text-blue-400', borderColor: 'border-blue-500/20', bg: 'bg-blue-500/10' },
              ].map((sev) => (
                <div key={sev.label} className={`${sev.bg} border ${sev.borderColor} rounded-lg p-3 text-center`}>
                  <div className={`text-2xl font-bold ${sev.textColor}`}>{sev.count}</div>
                  <div className="text-xs text-gray-400">{sev.label}</div>
                </div>
              ))}
            </div>

            {deficiencies.length > 0 && (
              <div className="space-y-2">
                <h4 className="text-sm font-semibold text-white flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-red-500"></span>
                  Deficiency Checklist
                </h4>
                <div className="max-h-80 overflow-y-auto space-y-1.5">
                  {deficiencies.map((d, i) => (
                    <div key={i} className="flex items-start gap-3 p-3 bg-white/5 rounded-lg">
                      <span className={`mt-0.5 flex-shrink-0 w-2 h-2 rounded-full ${
                        d.severity === 'critical' ? 'bg-red-500' : d.severity === 'high' ? 'bg-orange-500' : d.severity === 'medium' ? 'bg-amber-500' : 'bg-blue-500'
                      }`}></span>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className={`text-xs font-semibold uppercase ${
                            d.severity === 'critical' ? 'text-red-400' : d.severity === 'high' ? 'text-orange-400' : d.severity === 'medium' ? 'text-amber-400' : 'text-blue-400'
                          }`}>{d.severity}</span>
                          <span className="text-xs text-gray-500">{d.area}</span>
                        </div>
                        <p className="text-sm text-gray-300 mt-0.5">{d.item}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="bg-white/5 border border-white/10 rounded-xl p-5">
              <h4 className="text-sm font-semibold text-white mb-3 flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-500"></span>
                Action Plan
              </h4>
              {deficiencies.length === 0 ? (
                <p className="text-sm text-gray-400">All areas are in good shape. Keep maintaining your documentation and running periodic audits.</p>
              ) : (
                <div className="space-y-3">
                  {critical.length > 0 && (
                    <div>
                      <p className="text-xs font-semibold text-red-400 mb-1.5">Immediate — Before ACS Assessment</p>
                      {critical.slice(0, 5).map((d, i) => (
                        <div key={i} className="flex items-start gap-2 py-1">
                          <span className="text-red-400 text-xs mt-0.5">{i + 1}.</span>
                          <span className="text-sm text-gray-300">{d.action}</span>
                        </div>
                      ))}
                    </div>
                  )}
                  {high.length > 0 && (
                    <div>
                      <p className="text-xs font-semibold text-orange-400 mb-1.5">Short-term — Within 2 Weeks</p>
                      {high.slice(0, 5).map((d, i) => (
                        <div key={i} className="flex items-start gap-2 py-1">
                          <span className="text-orange-400 text-xs mt-0.5">{i + 1}.</span>
                          <span className="text-sm text-gray-300">{d.action}</span>
                        </div>
                      ))}
                    </div>
                  )}
                  {medium.length > 0 && (
                    <div>
                      <p className="text-xs font-semibold text-amber-400 mb-1.5">Medium-term — Within 30 Days</p>
                      {medium.slice(0, 5).map((d, i) => (
                        <div key={i} className="flex items-start gap-2 py-1">
                          <span className="text-amber-400 text-xs mt-0.5">{i + 1}.</span>
                          <span className="text-sm text-gray-300">{d.action}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>

            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-white/10">
                  <th className="text-xs font-medium text-gray-500 pb-2">Area</th>
                  <th className="text-xs font-medium text-gray-500 pb-2 text-right">Score</th>
                  <th className="text-xs font-medium text-gray-500 pb-2 text-right">Ready</th>
                  <th className="text-xs font-medium text-gray-500 pb-2 text-right">Total</th>
                  <th className="text-xs font-medium text-gray-500 pb-2 text-center">Status</th>
                </tr>
              </thead>
              <tbody>
                {scoreEntries.map((se) => (
                  <tr key={se.label} className="border-b border-white/5">
                    <td className="py-2.5 text-sm text-gray-300">{se.label}</td>
                    <td className="py-2.5 text-sm text-right font-semibold text-white">{se.score}%</td>
                    <td className="py-2.5 text-sm text-right text-gray-400">{se.ready}</td>
                    <td className="py-2.5 text-sm text-right text-gray-400">{se.total || '-'}</td>
                    <td className="py-2.5 text-center">
                      <span className={`inline-block w-2.5 h-2.5 rounded-full ${
                        se.score >= 85 ? 'bg-emerald-500' : se.score >= 60 ? 'bg-amber-500' : 'bg-red-500'
                      }`}></span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        );
      default: return null;
    }
  }

  return (
    <div className="space-y-6">
      <div className="bg-[#0f172a]/70 backdrop-blur-sm border border-white/10 rounded-xl p-5">
        <div className="flex items-center gap-2 mb-6">
          <div className="w-8 h-8 flex items-center justify-center bg-amber-500/10 rounded-lg">
            <i className="ri-list-check text-amber-400"></i>
          </div>
          <div>
            <h2 className="text-base font-semibold text-white">ACS Audit Wizard</h2>
            <p className="text-xs text-gray-500">Step-by-step guided audit process</p>
          </div>
        </div>

        <div className="flex items-center gap-1 overflow-x-auto pb-2 mb-4">
          {STEPS.map((step, i) => (
            <button
              key={step.key}
              onClick={() => setCurrentStep(i)}
              className={`flex-shrink-0 flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium transition-colors cursor-pointer whitespace-nowrap ${
                i === currentStep
                  ? 'bg-amber-500/15 text-amber-400 border border-amber-500/20'
                  : i < currentStep
                  ? 'bg-emerald-500/10 text-emerald-400'
                  : 'text-gray-500 hover:text-gray-300'
              }`}
            >
              <div className="w-3 h-3 flex items-center justify-center">
                <i className={step.icon}></i>
              </div>
              {step.label}
            </button>
          ))}
        </div>

        <div className="bg-white/5 rounded-xl p-5 min-h-64">
          {renderStep()}
        </div>

        <div className="flex items-center justify-between mt-4">
          <button
            onClick={() => setCurrentStep(Math.max(0, currentStep - 1))}
            disabled={currentStep === 0}
            className="px-4 py-2 text-sm text-gray-400 hover:text-white cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed"
          >
            Previous
          </button>
          <span className="text-xs text-gray-500">Step {currentStep + 1} of {STEPS.length}</span>
          <button
            onClick={() => setCurrentStep(Math.min(STEPS.length - 1, currentStep + 1))}
            disabled={currentStep === STEPS.length - 1}
            className="px-4 py-2 bg-amber-600 hover:bg-amber-500 text-white text-sm font-medium rounded-lg cursor-pointer whitespace-nowrap disabled:opacity-30 disabled:cursor-not-allowed"
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
}