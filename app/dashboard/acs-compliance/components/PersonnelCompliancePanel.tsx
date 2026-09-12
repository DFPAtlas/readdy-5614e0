'use client';

import { GuardComplianceProfile } from '@/lib/useACSCompliance';

export default function PersonnelCompliancePanel({ profiles }: { profiles: GuardComplianceProfile[] }) {
  if (profiles.length === 0) {
    return (
      <div className="bg-[#0f172a]/70 backdrop-blur-sm border border-white/10 rounded-xl p-8 text-center">
        <div className="w-12 h-12 mx-auto flex items-center justify-center bg-amber-500/10 rounded-full mb-3">
          <i className="ri-user-settings-line text-amber-400 text-xl"></i>
        </div>
        <h3 className="text-base font-semibold text-white mb-1">No Guard Profiles</h3>
        <p className="text-sm text-gray-500">Add guards to your company to view personnel compliance.</p>
      </div>
    );
  }

  const avg = Math.round(profiles.reduce((s, p) => s + p.completeness, 0) / profiles.length);
  const greenCount = profiles.filter((p) => p.status === 'green').length;
  const amberCount = profiles.filter((p) => p.status === 'amber').length;
  const redCount = profiles.filter((p) => p.status === 'red').length;

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-4 gap-3">
        <div className="bg-[#0f172a]/70 backdrop-blur-sm border border-white/10 rounded-xl p-4 text-center">
          <div className="text-2xl font-bold text-white">{profiles.length}</div>
          <div className="text-xs text-gray-500">Total Guards</div>
        </div>
        <div className="bg-[#0f172a]/70 backdrop-blur-sm border border-white/10 rounded-xl p-4 text-center">
          <div className="text-2xl font-bold text-emerald-400">{greenCount}</div>
          <div className="text-xs text-gray-500">Compliant</div>
        </div>
        <div className="bg-[#0f172a]/70 backdrop-blur-sm border border-white/10 rounded-xl p-4 text-center">
          <div className="text-2xl font-bold text-amber-400">{amberCount}</div>
          <div className="text-xs text-gray-500">Partial</div>
        </div>
        <div className="bg-[#0f172a]/70 backdrop-blur-sm border border-white/10 rounded-xl p-4 text-center">
          <div className="text-2xl font-bold text-red-400">{redCount}</div>
          <div className="text-xs text-gray-500">Non-Compliant</div>
        </div>
      </div>

      <div className="bg-[#0f172a]/70 backdrop-blur-sm border border-white/10 rounded-xl p-5">
        <div className="flex items-center gap-2 mb-4">
          <div className="w-8 h-8 flex items-center justify-center bg-blue-500/10 rounded-lg">
            <i className="ri-shield-user-line text-blue-400"></i>
          </div>
          <div>
            <h2 className="text-base font-semibold text-white">Personnel File Compliance</h2>
            <p className="text-xs text-gray-500">Average completeness: {avg}% across {profiles.length} guards</p>
          </div>
        </div>

        <div className="bg-white/5 rounded-lg overflow-x-auto">
          <table className="w-full text-sm min-w-[900px]">
            <thead>
              <tr className="border-b border-white/10">
                <th className="text-left text-gray-400 font-medium px-3 py-2.5">Guard</th>
                <th className="text-center text-gray-400 font-medium px-3 py-2.5">SIA</th>
                <th className="text-center text-gray-400 font-medium px-3 py-2.5">RTW</th>
                <th className="text-center text-gray-400 font-medium px-3 py-2.5">Photo ID</th>
                <th className="text-center text-gray-400 font-medium px-3 py-2.5">Address</th>
                <th className="text-center text-gray-400 font-medium px-3 py-2.5">Emp History</th>
                <th className="text-center text-gray-400 font-medium px-3 py-2.5">References</th>
                <th className="text-center text-gray-400 font-medium px-3 py-2.5">BS7858</th>
                <th className="text-center text-gray-400 font-medium px-3 py-2.5">Emerg Contact</th>
                <th className="text-center text-gray-400 font-medium px-3 py-2.5">Contract</th>
                <th className="text-center text-gray-400 font-medium px-3 py-2.5">Training</th>
                <th className="text-center text-gray-400 font-medium px-3 py-2.5">Score</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {profiles.map((p) => (
                <tr key={p.id} className="hover:bg-white/5 transition-colors">
                  <td className="px-3 py-2.5 text-gray-200 font-medium">{p.guard_name}</td>
                  <td className="px-3 py-2.5 text-center">
                    {p.siaLicence ? <span className="text-emerald-400 text-xs">OK</span> : <span className="text-red-400 text-xs">{p.siaExpiry && new Date(p.siaExpiry) < new Date() ? 'EXPIRED' : 'MISSING'}</span>}
                  </td>
                  <td className="px-3 py-2.5 text-center">
                    {p.rightToWork ? <span className="text-emerald-400 text-xs">OK</span> : <span className="text-red-400 text-xs">MISSING</span>}
                  </td>
                  <td className="px-3 py-2.5 text-center">
                    {p.photoId ? <span className="text-emerald-400 text-xs">OK</span> : <span className="text-red-400 text-xs">MISSING</span>}
                  </td>
                  <td className="px-3 py-2.5 text-center">
                    {p.addressVerification ? <span className="text-emerald-400 text-xs">OK</span> : <span className="text-red-400 text-xs">MISSING</span>}
                  </td>
                  <td className="px-3 py-2.5 text-center">
                    {p.employmentHistory ? <span className="text-emerald-400 text-xs">OK</span> : <span className="text-red-400 text-xs">MISSING</span>}
                  </td>
                  <td className="px-3 py-2.5 text-center">
                    {p.references ? <span className="text-emerald-400 text-xs">OK</span> : <span className="text-red-400 text-xs">MISSING</span>}
                  </td>
                  <td className="px-3 py-2.5 text-center">
                    {p.bs7858Screening ? <span className="text-emerald-400 text-xs">DONE</span> : <span className="text-amber-400 text-xs">PENDING</span>}
                  </td>
                  <td className="px-3 py-2.5 text-center">
                    {p.emergencyContact ? <span className="text-emerald-400 text-xs">OK</span> : <span className="text-red-400 text-xs">MISSING</span>}
                  </td>
                  <td className="px-3 py-2.5 text-center">
                    {p.employmentContract ? <span className="text-emerald-400 text-xs">OK</span> : <span className="text-red-400 text-xs">MISSING</span>}
                  </td>
                  <td className="px-3 py-2.5 text-center">
                    {p.expiredTraining > 0 ? (
                      <span className="text-red-400 text-xs">{p.expiredTraining} expired</span>
                    ) : (
                      <span className="text-emerald-400 text-xs">{p.trainingCerts} certs</span>
                    )}
                  </td>
                  <td className="px-3 py-2.5 text-center">
                    <span className={`text-xs font-bold ${p.status === 'green' ? 'text-emerald-400' : p.status === 'amber' ? 'text-amber-400' : 'text-red-400'}`}>
                      {p.completeness}%
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}