'use client';

import Link from 'next/link';
import { SiteComplianceItem } from '@/lib/useACSCompliance';

function statusIcon(ok: boolean) {
  return ok ? (
    <span className="w-4 h-4 flex items-center justify-center text-emerald-400"><i className="ri-check-line"></i></span>
  ) : (
    <span className="w-4 h-4 flex items-center justify-center text-red-400"><i className="ri-close-line"></i></span>
  );
}

export default function SiteCompliancePanel({ items }: { items: SiteComplianceItem[] }) {
  if (items.length === 0) {
    return (
      <div className="bg-[#0f172a]/70 backdrop-blur-sm border border-white/10 rounded-xl p-8 text-center">
        <div className="w-12 h-12 mx-auto flex items-center justify-center bg-emerald-500/10 rounded-full mb-3">
          <i className="ri-building-3-line text-emerald-400 text-xl"></i>
        </div>
        <h3 className="text-base font-semibold text-white mb-1">No Site Compliance Data</h3>
        <p className="text-sm text-gray-500">Add sites and configure compliance settings via the ACS client portal.</p>
      </div>
    );
  }

  const avgScore = Math.round(items.reduce((s, i) => s + i.score, 0) / items.length);
  const greenSites = items.filter((i) => i.status === 'green').length;
  const redSites = items.filter((i) => i.status === 'red').length;

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-4 gap-3">
        <div className="bg-[#0f172a]/70 backdrop-blur-sm border border-white/10 rounded-xl p-4 text-center">
          <div className="text-2xl font-bold text-white">{items.length}</div>
          <div className="text-xs text-gray-500">Total Sites</div>
        </div>
        <div className="bg-[#0f172a]/70 backdrop-blur-sm border border-white/10 rounded-xl p-4 text-center">
          <div className="text-2xl font-bold text-emerald-400">{avgScore}%</div>
          <div className="text-xs text-gray-500">Avg Score</div>
        </div>
        <div className="bg-[#0f172a]/70 backdrop-blur-sm border border-white/10 rounded-xl p-4 text-center">
          <div className="text-2xl font-bold text-emerald-400">{greenSites}</div>
          <div className="text-xs text-gray-500">Compliant</div>
        </div>
        <div className="bg-[#0f172a]/70 backdrop-blur-sm border border-white/10 rounded-xl p-4 text-center">
          <div className="text-2xl font-bold text-red-400">{redSites}</div>
          <div className="text-xs text-gray-500">Non-Compliant</div>
        </div>
      </div>

      <div className="bg-[#0f172a]/70 backdrop-blur-sm border border-white/10 rounded-xl p-5">
        <div className="flex items-center gap-2 mb-4">
          <div className="w-8 h-8 flex items-center justify-center bg-emerald-500/10 rounded-lg">
            <i className="ri-building-3-line text-emerald-400"></i>
          </div>
          <div>
            <h2 className="text-base font-semibold text-white">Site Compliance Overview</h2>
            <p className="text-xs text-gray-500">Documentation and compliance status per site</p>
          </div>
        </div>

        <div className="space-y-3">
          {items.map((site) => (
            <div key={site.id} className="bg-white/5 rounded-lg p-4 border border-white/5">
              <div className="flex items-center justify-between mb-3">
                <Link href={`/sites/${site.site_id}`} className="text-sm font-semibold text-white hover:text-amber-400 transition-colors cursor-pointer">
                  {site.site_name}
                </Link>
                <div className="flex items-center gap-2">
                  <div className={`h-2 w-24 rounded-full bg-white/10 overflow-hidden`}>
                    <div
                      className={`h-full rounded-full ${site.score >= 85 ? 'bg-emerald-500' : site.score >= 60 ? 'bg-amber-500' : 'bg-red-500'}`}
                      style={{ width: `${site.score}%` }}></div>
                  </div>
                  <span className={`text-sm font-bold ${site.score >= 85 ? 'text-emerald-400' : site.score >= 60 ? 'text-amber-400' : 'text-red-400'}`}>
                    {site.score}%
                  </span>
                </div>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
                <div className="flex items-center gap-1.5">{statusIcon(site.assignmentInstructions)}<span className="text-xs text-gray-400">Assignment Instr.</span></div>
                <div className="flex items-center gap-1.5">{statusIcon(site.riskAssessment)}<span className="text-xs text-gray-400">Risk Assessment</span></div>
                <div className="flex items-center gap-1.5">{statusIcon(site.patrolRoutes)}<span className="text-xs text-gray-400">Patrol Routes</span></div>
                <div className="flex items-center gap-1.5">{statusIcon(site.dobRecords)}<span className="text-xs text-gray-400">DOB Records</span></div>
                <div className="flex items-center gap-1.5">{statusIcon(site.patrolRecords)}<span className="text-xs text-gray-400">Patrol Logs</span></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}