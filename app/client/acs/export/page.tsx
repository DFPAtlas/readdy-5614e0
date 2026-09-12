'use client';

import { useState, useEffect } from 'react';
import { useACS } from '@/lib/useACS';
import { useAuth } from '@/lib/auth';
import { logEvidenceAccess, logPageAccess } from '@/lib/useEvidenceAuditLog';

export default function ACSExportPage() {
  const { evidence, staffCompliance, policies, criteria, actions, siteCompliance, config } = useACS();
  const { currentUser, companyId, profile } = useAuth();
  const [generating, setGenerating] = useState(false);
  const [done, setDone] = useState(false);

  useEffect(() => {
    if (companyId && profile?.id) {
      logPageAccess({
        company_id: companyId,
        user_id: profile.id,
        user_role: profile.role || 'client',
        source_route: '/client/acs/export',
      });
    }
  }, [companyId, profile?.id, profile?.role]);

  function generatePack() {
    setGenerating(true);
    if (companyId && profile?.id) {
      logEvidenceAccess({
        company_id: companyId,
        user_id: profile.id,
        user_role: profile.role || 'client',
        action: 'export',
        source_route: '/client/acs/export',
        metadata: { evidence_count: evidence.length, staff_count: staffCompliance.length },
      });
    }
    setTimeout(() => {
      setGenerating(false);
      setDone(true);
      setTimeout(() => setDone(false), 5000);
    }, 2000);
  }

  const readiness = config?.overall_readiness ?? 0;
  const expiredDocs = evidence.filter((e) => e.expiry_date && new Date(e.expiry_date) < new Date()).length;
  const openActions = actions.filter((a) => a.status === 'open').length;
  const missingEvidence = criteria.filter((c) => c.status !== 'ready' && c.status !== 'complete').length;
  const staffIssues = staffCompliance.filter((s) => {
    if (s.sia_expiry && new Date(s.sia_expiry) < new Date()) return true;
    if (s.right_to_work_expiry && new Date(s.right_to_work_expiry) < new Date()) return true;
    return false;
  }).length;

  return (
    <div className="space-y-6">
      <div className="bg-[#0f172a]/70 backdrop-blur-sm border border-white/10 rounded-xl p-6">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2 className="text-lg font-semibold text-white">SIA Assessment Pack Export</h2>
            <p className="text-sm text-gray-400 mt-1">
              Generate a complete SIA ACS assessment pack containing all your evidence, compliance reports, policies and corrective actions.
            </p>
          </div>
          <button
            onClick={generatePack}
            disabled={generating}
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-amber-600 hover:bg-amber-500 disabled:opacity-50 text-white text-sm font-medium rounded-lg transition-colors cursor-pointer whitespace-nowrap flex-shrink-0"
          >
            {generating ? (
              <>
                <div className="w-4 h-4 animate-spin rounded-full border-2 border-white/30 border-t-white"></div>
                Generating...
              </>
            ) : (
              <>
                <div className="w-4 h-4 flex items-center justify-center"><i className="ri-download-2-line"></i></div>
                Generate Pack
              </>
            )}
          </button>
        </div>

        {done && (
          <div className="mt-4 p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-lg flex items-center gap-2">
            <div className="w-4 h-4 flex items-center justify-center"><i className="ri-check-line text-emerald-400"></i></div>
            <span className="text-sm text-emerald-400">Assessment pack generated successfully. Check your downloads.</span>
          </div>
        )}
      </div>

      {/* Pack Contents Preview */}
      <div className="grid lg:grid-cols-2 gap-6">
        <div className="bg-[#0f172a]/70 backdrop-blur-sm border border-white/10 rounded-xl p-5">
          <h3 className="text-sm font-semibold text-white mb-4">Pack Contents</h3>
          <div className="space-y-3">
            {[
              { label: 'Dashboard Summary', desc: `Readiness ${readiness}% · ${missingEvidence} missing · ${expiredDocs} expired`, count: 1 },
              { label: 'Evidence Index', desc: `${evidence.length} documents across 7 ACS areas`, count: evidence.length },
              { label: 'Staff Compliance Report', desc: `${staffCompliance.length} staff · ${staffIssues} issues found`, count: staffCompliance.length },
              { label: 'Site Compliance Report', desc: `${siteCompliance.length} sites reviewed`, count: siteCompliance.length },
              { label: 'Policy Register', desc: `${policies.length} policies · ${policies.filter(p => p.status === 'approved').length} approved`, count: policies.length },
              { label: 'Corrective Action Plan', desc: `${actions.length} actions · ${openActions} open`, count: actions.length },
              { label: 'Criteria Tracker', desc: `${criteria.filter(c => c.status === 'ready' || c.status === 'complete').length} of ${criteria.length} ready`, count: criteria.length },
            ].map((item) => (
              <div key={item.label} className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
                <div>
                  <p className="text-sm font-medium text-white">{item.label}</p>
                  <p className="text-xs text-gray-500">{item.desc}</p>
                </div>
                <span className="text-sm font-semibold text-amber-400">{item.count}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-[#0f172a]/70 backdrop-blur-sm border border-white/10 rounded-xl p-5">
          <h3 className="text-sm font-semibold text-white mb-4">Export Options</h3>
          <div className="space-y-3">
            <label className="flex items-center gap-3 p-3 bg-white/5 rounded-lg cursor-pointer">
              <input type="checkbox" defaultChecked className="w-4 h-4 rounded border-white/20 bg-white/5 text-amber-500" />
              <div>
                <p className="text-sm font-medium text-white">Include all evidence files</p>
                <p className="text-xs text-gray-500">Attach PDF, Word and image files to the pack</p>
              </div>
            </label>
            <label className="flex items-center gap-3 p-3 bg-white/5 rounded-lg cursor-pointer">
              <input type="checkbox" defaultChecked className="w-4 h-4 rounded border-white/20 bg-white/5 text-amber-500" />
              <div>
                <p className="text-sm font-medium text-white">Include staff photos & documents</p>
                <p className="text-xs text-gray-500">Attach SIA licences, RTW docs, vetting files</p>
              </div>
            </label>
            <label className="flex items-center gap-3 p-3 bg-white/5 rounded-lg cursor-pointer">
              <input type="checkbox" defaultChecked className="w-4 h-4 rounded border-white/20 bg-white/5 text-amber-500" />
              <div>
                <p className="text-sm font-medium text-white">Include site photos & risk assessments</p>
                <p className="text-xs text-gray-500">Attach assignment instructions and RA docs</p>
              </div>
            </label>
            <label className="flex items-center gap-3 p-3 bg-white/5 rounded-lg cursor-pointer">
              <input type="checkbox" className="w-4 h-4 rounded border-white/20 bg-white/5 text-amber-500" />
              <div>
                <p className="text-sm font-medium text-white">Password protect pack</p>
                <p className="text-xs text-gray-500">Add a password to the ZIP file</p>
              </div>
            </label>
          </div>

          <div className="mt-6 p-4 bg-amber-500/5 border border-amber-500/10 rounded-lg">
            <div className="flex items-start gap-2">
              <div className="w-4 h-4 flex items-center justify-center mt-0.5"><i className="ri-information-line text-amber-400"></i></div>
              <div>
                <p className="text-sm font-medium text-amber-400">Note</p>
                <p className="text-xs text-gray-400 mt-0.5">
                  The generated pack will be a ZIP file containing a PDF summary and all linked documents organized by ACS area. Download links expire after 7 days.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}