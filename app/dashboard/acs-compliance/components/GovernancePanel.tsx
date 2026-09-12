'use client';

import { GovernanceItem } from '@/lib/useACSCompliance';

function statusBadge(status: string) {
  if (status === 'approved' || status === 'current') return { label: 'Current', cls: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' };
  if (status === 'expired') return { label: 'Expired', cls: 'bg-red-500/10 text-red-400 border-red-500/20' };
  if (status === 'draft' || status === 'pending') return { label: 'Pending', cls: 'bg-amber-500/10 text-amber-400 border-amber-500/20' };
  if (status === 'unknown') return { label: 'Not Uploaded', cls: 'bg-gray-500/10 text-gray-400 border-gray-500/20' };
  return { label: status, cls: 'bg-gray-500/10 text-gray-400 border-gray-500/20' };
}

const categoryGroups: Record<string, string> = {
  'Insurance': 'Insurance & Liability',
  'Certification': 'Certifications',
  'Governance': 'Governance Documents',
  'Policy': 'Policies',
};

export default function GovernancePanel({ items, onRefresh }: { items: GovernanceItem[]; onRefresh: () => void }) {
  const grouped: Record<string, GovernanceItem[]> = {};
  items.forEach((item) => {
    const key = categoryGroups[item.category] || item.category;
    if (!grouped[key]) grouped[key] = [];
    grouped[key].push(item);
  });

  return (
    <div className="space-y-6">
      <div className="bg-[#0f172a]/70 backdrop-blur-sm border border-white/10 rounded-xl p-5">
        <div className="flex items-center gap-2 mb-4">
          <div className="w-8 h-8 flex items-center justify-center bg-amber-500/10 rounded-lg">
            <i className="ri-government-line text-amber-400"></i>
          </div>
          <div>
            <h2 className="text-base font-semibold text-white">Company Governance</h2>
            <p className="text-xs text-gray-500">Required documents, policies and certifications for ACS compliance</p>
          </div>
        </div>

        {Object.entries(grouped).map(([group, groupItems]) => (
          <div key={group} className="mb-6 last:mb-0">
            <h3 className="text-sm font-medium text-gray-400 mb-3 uppercase tracking-wider">{group}</h3>
            <div className="bg-white/5 rounded-lg overflow-hidden">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-white/10">
                    <th className="text-left text-gray-400 font-medium px-4 py-2.5">Document</th>
                    <th className="text-left text-gray-400 font-medium px-4 py-2.5">Status</th>
                    <th className="text-left text-gray-400 font-medium px-4 py-2.5">Review Date</th>
                    <th className="text-left text-gray-400 font-medium px-4 py-2.5">Expiry</th>
                    <th className="text-left text-gray-400 font-medium px-4 py-2.5">Score Impact</th>
                    <th className="text-left text-gray-400 font-medium px-4 py-2.5">File</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {groupItems.map((item) => {
                    const sb = statusBadge(item.status);
                    return (
                      <tr key={item.id} className="hover:bg-white/5 transition-colors">
                        <td className="px-4 py-2.5 text-gray-200 font-medium">{item.title}</td>
                        <td className="px-4 py-2.5">
                          <span className={`text-xs px-2 py-0.5 rounded-full border ${sb.cls}`}>{sb.label}</span>
                        </td>
                        <td className="px-4 py-2.5 text-xs text-gray-400">{item.review_date ? new Date(item.review_date).toLocaleDateString('en-GB') : '-'}</td>
                        <td className="px-4 py-2.5 text-xs text-gray-400">{item.expiry_date ? new Date(item.expiry_date).toLocaleDateString('en-GB') : '-'}</td>
                        <td className="px-4 py-2.5">
                          <span className={`text-xs font-medium ${item.status === 'approved' || item.status === 'current' ? 'text-emerald-400' : 'text-red-400'}`}>
                            {item.status === 'approved' || item.status === 'current' ? `+${item.score_impact}` : `-${item.score_impact}`}
                          </span>
                        </td>
                        <td className="px-4 py-2.5">
                          {item.file_url ? (
                            <a href={item.file_url} target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:text-blue-300 text-xs flex items-center gap-1">
                              <div className="w-3 h-3 flex items-center justify-center"><i className="ri-file-line"></i></div>
                              View
                            </a>
                          ) : (
                            <span className="text-xs text-gray-600">Upload</span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}