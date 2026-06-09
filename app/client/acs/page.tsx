'use client';

import Link from 'next/link';
import { useACS } from '@/lib/useACS';

function trafficLight(readiness: number | null) {
  if (readiness === null || readiness === undefined) return { label: 'Unknown', color: 'bg-gray-500', text: 'text-gray-400', border: 'border-gray-500/20', bg: 'bg-gray-500/10' };
  if (readiness >= 85) return { label: 'Green', color: 'bg-emerald-500', text: 'text-emerald-400', border: 'border-emerald-500/20', bg: 'bg-emerald-500/10' };
  if (readiness >= 60) return { label: 'Amber', color: 'bg-amber-500', text: 'text-amber-400', border: 'border-amber-500/20', bg: 'bg-amber-500/10' };
  return { label: 'Red', color: 'bg-red-500', text: 'text-red-400', border: 'border-red-500/20', bg: 'bg-red-500/10' };
}

function daysUntil(dateStr: string | null) {
  if (!dateStr) return null;
  const d = new Date(dateStr);
  const diff = Math.ceil((d.getTime() - Date.now()) / (1000 * 60 * 60 * 24));
  return diff;
}

function isExpired(dateStr: string | null) {
  if (!dateStr) return false;
  return new Date(dateStr) < new Date();
}

function isExpiringSoon(dateStr: string | null, days = 30) {
  if (!dateStr) return false;
  const d = new Date(dateStr);
  const diff = Math.ceil((d.getTime() - Date.now()) / (1000 * 60 * 60 * 24));
  return diff > 0 && diff <= days;
}

export default function ACSDashboardPage() {
  const { evidence, staffCompliance, policies, criteria, actions, siteCompliance, config, isLoading } = useACS();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-amber-500"></div>
      </div>
    );
  }

  const readiness = config?.overall_readiness ?? 0;
  const status = trafficLight(readiness);

  const missingEvidence = criteria.filter((c) => c.status !== 'ready' && c.status !== 'complete').length;
  const expiredDocs = evidence.filter((e) => isExpired(e.expiry_date)).length;
  const expiringSoon = evidence.filter((e) => isExpiringSoon(e.expiry_date)).length;
  const openActions = actions.filter((a) => a.status === 'open').length;
  const overdueActions = actions.filter((a) => a.status === 'open' && isExpired(a.due_date)).length;
  const policiesDueReview = policies.filter((p) => isExpiringSoon(p.review_date)).length;
  const nextAssessment = config?.next_assessment_date || null;
  const assessmentDays = daysUntil(nextAssessment);

  const staffIssues = staffCompliance.filter((s) => {
    if (isExpired(s.sia_expiry)) return true;
    if (isExpired(s.right_to_work_expiry)) return true;
    if (s.status === 'missing') return true;
    return false;
  }).length;

  const siteIssues = siteCompliance.filter((s) => {
    if (!s.assignment_instructions_url) return true;
    if (isExpired(s.assignment_instructions_expiry)) return true;
    if (isExpired(s.risk_assessment_expiry)) return true;
    if (!s.sops_current) return true;
    return false;
  }).length;

  const areaStats = [
    { label: 'Strategy', count: criteria.filter((c) => c.acs_area === 'Strategy').length, ready: criteria.filter((c) => c.acs_area === 'Strategy' && c.status === 'ready').length },
    { label: 'Service Delivery', count: criteria.filter((c) => c.acs_area === 'Service Delivery').length, ready: criteria.filter((c) => c.acs_area === 'Service Delivery' && c.status === 'ready').length },
    { label: 'CRM', count: criteria.filter((c) => c.acs_area === 'Commercial Relationship Management').length, ready: criteria.filter((c) => c.acs_area === 'Commercial Relationship Management' && c.status === 'ready').length },
    { label: 'Financial', count: criteria.filter((c) => c.acs_area === 'Financial Management').length, ready: criteria.filter((c) => c.acs_area === 'Financial Management' && c.status === 'ready').length },
    { label: 'Resource', count: criteria.filter((c) => c.acs_area === 'Resource Management').length, ready: criteria.filter((c) => c.acs_area === 'Resource Management' && c.status === 'ready').length },
    { label: 'People', count: criteria.filter((c) => c.acs_area === 'People').length, ready: criteria.filter((c) => c.acs_area === 'People' && c.status === 'ready').length },
    { label: 'Governance', count: criteria.filter((c) => c.acs_area === 'Leadership & Governance').length, ready: criteria.filter((c) => c.acs_area === 'Leadership & Governance' && c.status === 'ready').length },
  ];

  return (
    <div className="space-y-6">
      {/* Top Stats Row */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        <div className={`bg-[#0f172a]/70 backdrop-blur-sm border ${status.border} rounded-xl p-5`}>
          <div className="flex items-center gap-2 text-gray-400 text-sm mb-2">
            <div className="w-4 h-4 flex items-center justify-center"><i className="ri-percent-line"></i></div>
            Readiness
          </div>
          <div className="flex items-end gap-2">
            <span className={`text-3xl font-bold ${status.text}`}>{readiness}%</span>
          </div>
          <div className="flex items-center gap-1.5 mt-1.5">
            <div className={`w-2 h-2 rounded-full ${status.color}`}></div>
            <span className={`text-xs ${status.text}`}>{status.label} Status</span>
          </div>
        </div>

        <div className="bg-[#0f172a]/70 backdrop-blur-sm border border-white/10 rounded-xl p-5">
          <div className="flex items-center gap-2 text-gray-400 text-sm mb-2">
            <div className="w-4 h-4 flex items-center justify-center"><i className="ri-folder-warning-line text-amber-400"></i></div>
            Missing Evidence
          </div>
          <div className="text-3xl font-bold text-white">{missingEvidence}</div>
          <div className="text-xs text-gray-500 mt-1">criteria not ready</div>
        </div>

        <div className="bg-[#0f172a]/70 backdrop-blur-sm border border-white/10 rounded-xl p-5">
          <div className="flex items-center gap-2 text-gray-400 text-sm mb-2">
            <div className="w-4 h-4 flex items-center justify-center"><i className="ri-file-damage-line text-red-400"></i></div>
            Expired Docs
          </div>
          <div className="text-3xl font-bold text-white">{expiredDocs}</div>
          {expiringSoon > 0 && <div className="text-xs text-amber-400 mt-1">{expiringSoon} expiring soon</div>}
        </div>

        <div className="bg-[#0f172a]/70 backdrop-blur-sm border border-white/10 rounded-xl p-5">
          <div className="flex items-center gap-2 text-gray-400 text-sm mb-2">
            <div className="w-4 h-4 flex items-center justify-center"><i className="ri-alert-line text-red-400"></i></div>
            Open Actions
          </div>
          <div className="text-3xl font-bold text-white">{openActions}</div>
          {overdueActions > 0 && <div className="text-xs text-red-400 mt-1">{overdueActions} overdue</div>}
        </div>

        <div className="bg-[#0f172a]/70 backdrop-blur-sm border border-white/10 rounded-xl p-5">
          <div className="flex items-center gap-2 text-gray-400 text-sm mb-2">
            <div className="w-4 h-4 flex items-center justify-center"><i className="ri-calendar-check-line text-blue-400"></i></div>
            Next Assessment
          </div>
          {assessmentDays !== null ? (
            <>
              <div className={`text-2xl font-bold ${assessmentDays < 30 ? 'text-red-400' : assessmentDays < 90 ? 'text-amber-400' : 'text-white'}`}>
                {assessmentDays}d
              </div>
              <div className="text-xs text-gray-500 mt-1">{new Date(nextAssessment!).toLocaleDateString('en-GB')}</div>
            </>
          ) : (
            <div className="text-sm text-gray-500 mt-2">Not set</div>
          )}
        </div>
      </div>

      {/* Area Progress */}
      <div className="bg-[#0f172a]/70 backdrop-blur-sm border border-white/10 rounded-xl p-5">
        <h2 className="text-sm font-semibold text-white mb-4">ACS Area Progress</h2>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {areaStats.map((area) => {
            const pct = area.count > 0 ? Math.round((area.ready / area.count) * 100) : 0;
            return (
              <Link key={area.label} href="/client/acs/tracker" className="block cursor-pointer">
                <div className="bg-white/5 rounded-lg p-4 hover:bg-white/8 transition-colors">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-gray-300">{area.label}</span>
                    <span className={`text-sm font-semibold ${pct >= 80 ? 'text-emerald-400' : pct >= 50 ? 'text-amber-400' : 'text-red-400'}`}>
                      {pct}%
                    </span>
                  </div>
                  <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all ${pct >= 80 ? 'bg-emerald-500' : pct >= 50 ? 'bg-amber-500' : 'bg-red-500'}`}
                      style={{ width: `${pct}%` }}
                    ></div>
                  </div>
                  <p className="text-xs text-gray-500 mt-1.5">{area.ready} of {area.count} ready</p>
                </div>
              </Link>
            );
          })}
        </div>
      </div>

      {/* Bottom Grid */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Staff & Site Issues */}
        <div className="bg-[#0f172a]/70 backdrop-blur-sm border border-white/10 rounded-xl p-5">
          <h2 className="text-sm font-semibold text-white mb-4">Compliance Alerts</h2>
          <div className="space-y-3">
            <Link href="/client/acs/staff" className="flex items-center justify-between p-3 bg-white/5 rounded-lg hover:bg-white/8 transition-colors cursor-pointer">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 flex items-center justify-center bg-red-500/10 rounded-lg">
                  <i className="ri-user-unfollow-line text-red-400"></i>
                </div>
                <div>
                  <p className="text-sm font-medium text-white">Staff Compliance Issues</p>
                  <p className="text-xs text-gray-500">Expired licences, missing checks</p>
                </div>
              </div>
              <span className="text-sm font-bold text-red-400">{staffIssues}</span>
            </Link>
            <Link href="/client/acs/sites" className="flex items-center justify-between p-3 bg-white/5 rounded-lg hover:bg-white/8 transition-colors cursor-pointer">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 flex items-center justify-center bg-amber-500/10 rounded-lg">
                  <i className="ri-building-line text-amber-400"></i>
                </div>
                <div>
                  <p className="text-sm font-medium text-white">Site Compliance Issues</p>
                  <p className="text-xs text-gray-500">Missing docs, expired assessments</p>
                </div>
              </div>
              <span className="text-sm font-bold text-amber-400">{siteIssues}</span>
            </Link>
            <Link href="/client/acs/policies" className="flex items-center justify-between p-3 bg-white/5 rounded-lg hover:bg-white/8 transition-colors cursor-pointer">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 flex items-center justify-center bg-blue-500/10 rounded-lg">
                  <i className="ri-file-shield-line text-blue-400"></i>
                </div>
                <div>
                  <p className="text-sm font-medium text-white">Policies Due Review</p>
                  <p className="text-xs text-gray-500">Review dates approaching</p>
                </div>
              </div>
              <span className="text-sm font-bold text-blue-400">{policiesDueReview}</span>
            </Link>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-[#0f172a]/70 backdrop-blur-sm border border-white/10 rounded-xl p-5">
          <h2 className="text-sm font-semibold text-white mb-4">Quick Actions</h2>
          <div className="grid grid-cols-2 gap-3">
            <Link href="/client/acs/evidence" className="flex items-center gap-3 p-3 bg-white/5 rounded-lg hover:bg-white/8 transition-colors cursor-pointer">
              <div className="w-8 h-8 flex items-center justify-center bg-amber-500/10 rounded-lg">
                <i className="ri-upload-cloud-2-line text-amber-400"></i>
              </div>
              <span className="text-sm font-medium text-white">Upload Evidence</span>
            </Link>
            <Link href="/client/acs/tracker" className="flex items-center gap-3 p-3 bg-white/5 rounded-lg hover:bg-white/8 transition-colors cursor-pointer">
              <div className="w-8 h-8 flex items-center justify-center bg-emerald-500/10 rounded-lg">
                <i className="ri-list-check text-emerald-400"></i>
              </div>
              <span className="text-sm font-medium text-white">Update Tracker</span>
            </Link>
            <Link href="/client/acs/actions" className="flex items-center gap-3 p-3 bg-white/5 rounded-lg hover:bg-white/8 transition-colors cursor-pointer">
              <div className="w-8 h-8 flex items-center justify-center bg-red-500/10 rounded-lg">
                <i className="ri-add-circle-line text-red-400"></i>
              </div>
              <span className="text-sm font-medium text-white">Add Action</span>
            </Link>
            <Link href="/client/acs/export" className="flex items-center gap-3 p-3 bg-white/5 rounded-lg hover:bg-white/8 transition-colors cursor-pointer">
              <div className="w-8 h-8 flex items-center justify-center bg-blue-500/10 rounded-lg">
                <i className="ri-download-2-line text-blue-400"></i>
              </div>
              <span className="text-sm font-medium text-white">Export Pack</span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}