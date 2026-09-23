'use client';

import { useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useACS } from '@/lib/useACS';
import { useAuth } from '@/lib/auth';

interface AIReport {
  overall_score: number;
  status: 'red' | 'amber' | 'green';
  summary: string;
  areas: {
    name: string;
    score: number;
    issues: string[];
    recommendations: string[];
  }[];
  urgent_actions: string[];
  expired_items: { type: string; name: string; expiry: string }[];
  missing_evidence: { area: string; criterion: string; description: string }[];
}

export default function ACSAIAssistantPage() {
  const { evidence, staffCompliance, policies, criteria, actions, siteCompliance } = useACS();
  const { currentUser } = useAuth();
  const [scanning, setScanning] = useState(false);
  const [report, setReport] = useState<AIReport | null>(null);
  const [error, setError] = useState('');

  async function runScan() {
    setScanning(true);
    setError('');

    try {
      const session = await supabase.auth.getSession();
      const token = session.data.session?.access_token;
      const funcUrl = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/functions/v1/ai-acs-readiness`;

      const res = await fetch(funcUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ company_id: currentUser?.company_id }),
      });

      if (!res.ok) {
        const err = await res.text();
        throw new Error(err || 'Scan failed');
      }

      const data = await res.json();
      setReport(data.report);
    } catch (e: any) {
      setError(e.message || 'AI scan failed. Please try again.');
    } finally {
      setScanning(false);
    }
  }

  function generateLocalReport(): AIReport {
    const now = new Date();
    const thirtyDays = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);

    const expiredEvidence = evidence.filter((e) => e.expiry_date && new Date(e.expiry_date) < now);
    const expiringEvidence = evidence.filter((e) => e.expiry_date && new Date(e.expiry_date) >= now && new Date(e.expiry_date) <= thirtyDays);
    const expiredStaff = staffCompliance.filter((s) => (s.sia_expiry && new Date(s.sia_expiry) < now) || (s.right_to_work_expiry && new Date(s.right_to_work_expiry) < now));
    const missingCriteria = criteria.filter((c) => c.status !== 'ready' && c.status !== 'complete');
    const overdueActions = actions.filter((a) => a.status === 'open' && a.due_date && new Date(a.due_date) < now);
    const openActions = actions.filter((a) => a.status === 'open');

    const totalChecks = evidence.length + staffCompliance.length + policies.length + criteria.length + siteCompliance.length;
    const passedChecks =
      evidence.filter((e) => e.status === 'current' && (!e.expiry_date || new Date(e.expiry_date) >= now)).length +
      staffCompliance.filter((s) => s.status === 'compliant').length +
      policies.filter((p) => p.status === 'approved').length +
      criteria.filter((c) => c.status === 'ready' || c.status === 'complete').length +
      siteCompliance.filter((s) => s.status === 'compliant').length;

    const overallScore = totalChecks > 0 ? Math.round((passedChecks / totalChecks) * 100) : 0;

    const areas = [
      {
        name: 'Evidence Library',
        score: evidence.length > 0 ? Math.round(((evidence.length - expiredEvidence.length - expiringEvidence.length) / evidence.length) * 100) : 0,
        issues: [
          ...(expiredEvidence.length > 0 ? [`${expiredEvidence.length} expired documents`] : []),
          ...(expiringEvidence.length > 0 ? [`${expiringEvidence.length} documents expiring soon`] : []),
        ],
        recommendations: [
          expiredEvidence.length > 0 ? 'Renew expired evidence immediately' : '',
          expiringEvidence.length > 0 ? 'Schedule renewals for documents expiring within 30 days' : '',
        ].filter(Boolean),
      },
      {
        name: 'Staff Compliance',
        score: staffCompliance.length > 0 ? Math.round(((staffCompliance.length - expiredStaff.length) / staffCompliance.length) * 100) : 0,
        issues: expiredStaff.map((s) => `${s.staff_name}: expired ${s.sia_expiry && new Date(s.sia_expiry) < now ? 'SIA licence' : 'RTW check'}`),
        recommendations: [
          expiredStaff.length > 0 ? 'Contact staff with expired documents and arrange renewals' : '',
          'Schedule annual vetting reviews for all active staff',
        ].filter(Boolean),
      },
      {
        name: 'Site Compliance',
        score: siteCompliance.length > 0 ? Math.round((siteCompliance.filter((s) => s.status === 'compliant').length / siteCompliance.length) * 100) : 0,
        issues: siteCompliance
          .filter((s) => !s.assignment_instructions_url || (s.assignment_instructions_expiry && new Date(s.assignment_instructions_expiry) < now))
          .map((s) => 'Site missing or expired assignment instructions'),
        recommendations: [
          'Ensure all sites have current assignment instructions',
          'Complete risk assessments for every active site',
        ],
      },
      {
        name: 'Policies',
        score: policies.length > 0 ? Math.round((policies.filter((p) => p.status === 'approved').length / policies.length) * 100) : 0,
        issues: policies.filter((p) => p.status !== 'approved').map((p) => `Policy "${p.title}" is ${p.status}`),
        recommendations: [
          policies.filter((p) => p.status === 'draft').length > 0 ? 'Approve draft policies before assessment' : '',
          'Ensure all staff have acknowledged key policies',
        ].filter(Boolean),
      },
      {
        name: 'ACS Criteria',
        score: criteria.length > 0 ? Math.round((criteria.filter((c) => c.status === 'ready' || c.status === 'complete').length / criteria.length) * 100) : 0,
        issues: missingCriteria.slice(0, 5).map((c) => `${c.criterion_code}: ${c.criterion_title}`),
        recommendations: [
          missingCriteria.length > 0 ? `Update ${missingCriteria.length} criteria to Ready status` : '',
          'Link evidence to each criterion where possible',
        ].filter(Boolean),
      },
    ];

    return {
      overall_score: overallScore,
      status: overallScore >= 85 ? 'green' : overallScore >= 60 ? 'amber' : 'red',
      summary: `Your ACS readiness is at ${overallScore}%. ${openActions.length} corrective actions are open, ${missingCriteria.length} criteria need attention, and ${expiredEvidence.length + expiredStaff.length} documents or licences have expired.`,
      areas,
      urgent_actions: [
        ...(overdueActions.length > 0 ? [`${overdueActions.length} overdue corrective actions require immediate attention`] : []),
        ...(expiredEvidence.length > 0 ? [`${expiredEvidence.length} evidence documents have expired`] : []),
        ...(expiredStaff.length > 0 ? [`${expiredStaff.length} staff members have expired compliance records`] : []),
        ...(missingCriteria.length > 0 ? [`${missingCriteria.length} ACS criteria are not ready`] : []),
      ],
      expired_items: [
        ...expiredEvidence.map((e) => ({ type: 'Evidence', name: e.title, expiry: e.expiry_date! })),
        ...expiredStaff.map((s) => ({
          type: 'Staff',
          name: s.staff_name,
          expiry: s.sia_expiry && new Date(s.sia_expiry) < now ? s.sia_expiry : s.right_to_work_expiry!,
        })),
      ],
      missing_evidence: missingCriteria.slice(0, 10).map((c) => ({
        area: c.acs_area,
        criterion: c.criterion_code,
        description: c.criterion_title,
      })),
    };
  }

  function runLocalScan() {
    setScanning(true);
    setError('');
    setTimeout(() => {
      setReport(generateLocalReport());
      setScanning(false);
    }, 1500);
  }

  const activeReport = report || generateLocalReport();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-[#0f172a]/70 backdrop-blur-sm border border-white/10 rounded-xl p-6">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2 className="text-lg font-semibold text-white">AI ACS Readiness Scanner</h2>
            <p className="text-sm text-gray-400 mt-1">
              Scan your entire ACS hub to identify gaps, expired records, weak areas and recommended actions.
            </p>
          </div>
          <button
            onClick={runLocalScan}
            disabled={scanning}
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-amber-600 hover:bg-amber-500 disabled:opacity-50 text-white text-sm font-medium rounded-lg transition-colors cursor-pointer whitespace-nowrap flex-shrink-0"
          >
            {scanning ? (
              <>
                <div className="w-4 h-4 animate-spin rounded-full border-2 border-white/30 border-t-white"></div>
                Scanning...
              </>
            ) : (
              <>
                <div className="w-4 h-4 flex items-center justify-center"><i className="ri-sparkling-line"></i></div>
                Run Scan
              </>
            )}
          </button>
        </div>
        {error && (
          <div className="mt-4 p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-sm text-red-400">
            {error}
          </div>
        )}
      </div>

      {/* Overall Score */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className={`bg-[#0f172a]/70 backdrop-blur-sm border rounded-xl p-6 ${
          activeReport.status === 'green' ? 'border-emerald-500/20' :
          activeReport.status === 'amber' ? 'border-amber-500/20' :
          'border-red-500/20'
        }`}>
          <div className="text-sm text-gray-400 mb-2">Overall Readiness</div>
          <div className={`text-5xl font-bold ${
            activeReport.status === 'green' ? 'text-emerald-400' :
            activeReport.status === 'amber' ? 'text-amber-400' :
            'text-red-400'
          }`}>
            {activeReport.overall_score}%
          </div>
          <div className="flex items-center gap-2 mt-3">
            <div className={`w-3 h-3 rounded-full ${
              activeReport.status === 'green' ? 'bg-emerald-500' :
              activeReport.status === 'amber' ? 'bg-amber-500' :
              'bg-red-500'
            }`}></div>
            <span className={`text-sm font-medium ${
              activeReport.status === 'green' ? 'text-emerald-400' :
              activeReport.status === 'amber' ? 'text-amber-400' :
              'text-red-400'
            }`}>
              {activeReport.status === 'green' ? 'Good — Assessment Ready' :
               activeReport.status === 'amber' ? 'Fair — Needs Work' :
               'Poor — Significant Gaps'}
            </span>
          </div>
          <p className="text-xs text-gray-500 mt-3">{activeReport.summary}</p>
        </div>

        <div className="lg:col-span-2 bg-[#0f172a]/70 backdrop-blur-sm border border-white/10 rounded-xl p-6">
          <h3 className="text-sm font-semibold text-white mb-4">Urgent Actions</h3>
          {activeReport.urgent_actions.length === 0 ? (
            <div className="flex items-center gap-2 p-4 bg-emerald-500/5 rounded-lg">
              <div className="w-5 h-5 flex items-center justify-center"><i className="ri-check-double-line text-emerald-400"></i></div>
              <span className="text-sm text-emerald-400">No urgent actions. You are in good shape.</span>
            </div>
          ) : (
            <div className="space-y-2">
              {activeReport.urgent_actions.map((action, i) => (
                <div key={i} className="flex items-start gap-2 p-3 bg-red-500/5 border border-red-500/10 rounded-lg">
                  <div className="w-4 h-4 flex items-center justify-center mt-0.5"><i className="ri-error-warning-line text-red-400"></i></div>
                  <span className="text-sm text-red-300">{action}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Area Breakdown */}
      <div className="bg-[#0f172a]/70 backdrop-blur-sm border border-white/10 rounded-xl p-5">
        <h3 className="text-sm font-semibold text-white mb-4">Area Breakdown</h3>
        <div className="space-y-4">
          {activeReport.areas.map((area) => (
            <div key={area.name} className="bg-white/5 rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-white">{area.name}</span>
                <span className={`text-sm font-bold ${area.score >= 80 ? 'text-emerald-400' : area.score >= 50 ? 'text-amber-400' : 'text-red-400'}`}>
                  {area.score}%
                </span>
              </div>
              <div className="h-2 bg-white/10 rounded-full overflow-hidden mb-3">
                <div
                  className={`h-full rounded-full ${area.score >= 80 ? 'bg-emerald-500' : area.score >= 50 ? 'bg-amber-500' : 'bg-red-500'}`}
                  style={{ width: `${area.score}%` }}
                ></div>
              </div>
              {area.issues.length > 0 && (
                <div className="space-y-1 mb-2">
                  {area.issues.map((issue, i) => (
                    <p key={i} className="text-xs text-red-300 flex items-center gap-1.5">
                      <div className="w-3 h-3 flex items-center justify-center"><i className="ri-close-circle-line text-red-400"></i></div>
                      {issue}
                    </p>
                  ))}
                </div>
              )}
              {area.recommendations.length > 0 && (
                <div className="space-y-1">
                  {area.recommendations.map((rec, i) => (
                    <p key={i} className="text-xs text-amber-300 flex items-center gap-1.5">
                      <div className="w-3 h-3 flex items-center justify-center"><i className="ri-lightbulb-line text-amber-400"></i></div>
                      {rec}
                    </p>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Expired Items */}
      {activeReport.expired_items.length > 0 && (
        <div className="bg-[#0f172a]/70 backdrop-blur-sm border border-white/10 rounded-xl p-5">
          <h3 className="text-sm font-semibold text-white mb-4">Expired Items</h3>
          <div className="bg-red-500/5 border border-red-500/10 rounded-lg overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-red-500/10">
                  <th className="text-left text-red-300 font-medium px-4 py-2">Type</th>
                  <th className="text-left text-red-300 font-medium px-4 py-2">Name</th>
                  <th className="text-left text-red-300 font-medium px-4 py-2">Expired</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-red-500/5">
                {activeReport.expired_items.map((item, i) => (
                  <tr key={i}>
                    <td className="px-4 py-2 text-xs text-red-300">{item.type}</td>
                    <td className="px-4 py-2 text-xs text-gray-300">{item.name}</td>
                    <td className="px-4 py-2 text-xs text-red-400">{new Date(item.expiry).toLocaleDateString('en-GB')}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Missing Evidence */}
      {activeReport.missing_evidence.length > 0 && (
        <div className="bg-[#0f172a]/70 backdrop-blur-sm border border-white/10 rounded-xl p-5">
          <h3 className="text-sm font-semibold text-white mb-4">Missing Evidence</h3>
          <div className="space-y-2">
            {activeReport.missing_evidence.map((item, i) => (
              <div key={i} className="flex items-start gap-3 p-3 bg-white/5 rounded-lg">
                <div className="w-8 h-8 flex items-center justify-center bg-amber-500/10 rounded-lg flex-shrink-0">
                  <i className="ri-folder-warning-line text-amber-400 text-sm"></i>
                </div>
                <div>
                  <p className="text-sm text-white">{item.criterion} — {item.description}</p>
                  <p className="text-xs text-gray-500">{item.area}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}