'use client';

import { HealthSafetyItem } from '@/lib/useACSCompliance';

function statusDot(status: string) {
  if (status === 'current' || status === 'approved') return 'bg-emerald-500';
  if (status === 'expired') return 'bg-red-500';
  if (status === 'unknown' || status === 'not_started') return 'bg-gray-500';
  return 'bg-amber-500';
}

export default function HealthSafetyPanel({ items }: { items: HealthSafetyItem[] }) {
  return (
    <div className="space-y-6">
      <div className="bg-[#0f172a]/70 backdrop-blur-sm border border-white/10 rounded-xl p-5">
        <div className="flex items-center gap-2 mb-4">
          <div className="w-8 h-8 flex items-center justify-center bg-red-500/10 rounded-lg">
            <i className="ri-heart-pulse-line text-red-400"></i>
          </div>
          <div>
            <h2 className="text-base font-semibold text-white">Health & Safety Module</h2>
            <p className="text-xs text-gray-500">Track accident reports, risk assessments, PPE, and equipment inspections</p>
          </div>
        </div>

        <div className="grid sm:grid-cols-2 gap-3">
          {items.map((item) => (
            <div key={item.id} className="bg-white/5 rounded-lg p-4 border border-white/5 hover:bg-white/8 transition-colors">
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-3">
                  <div className={`w-2.5 h-2.5 rounded-full mt-1.5 flex-shrink-0 ${statusDot(item.status)}`}></div>
                  <div>
                    <p className="text-sm font-medium text-white">{item.title}</p>
                    <p className="text-xs text-gray-500 capitalize mt-0.5">{item.category.replace(/_/g, ' ')}</p>
                  </div>
                </div>
                <span className={`text-xs px-2 py-0.5 rounded-full border ${item.status === 'current' || item.status === 'approved' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : item.status === 'expired' ? 'bg-red-500/10 text-red-400 border-red-500/20' : 'bg-gray-500/10 text-gray-400 border-gray-500/20'}`}>
                  {item.status === 'unknown' ? 'Not Started' : item.status}
                </span>
              </div>
              <div className="flex gap-4 mt-3 text-xs text-gray-500">
                {item.review_date && <span>Review: {new Date(item.review_date).toLocaleDateString('en-GB')}</span>}
                {item.expiry_date && <span>Expires: {new Date(item.expiry_date).toLocaleDateString('en-GB')}</span>}
              </div>
            </div>
          ))}
        </div>

        <div className="mt-4 p-4 bg-amber-500/5 border border-amber-500/10 rounded-lg">
          <p className="text-xs text-amber-400">
            <span className="font-semibold">Note:</span> Upload H&S documents via the ACS Evidence section in the client portal. 
            Documents will appear here automatically once categorised as &apos;Health & Safety&apos;.
          </p>
        </div>
      </div>
    </div>
  );
}