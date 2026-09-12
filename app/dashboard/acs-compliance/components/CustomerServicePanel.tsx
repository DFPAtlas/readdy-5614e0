'use client';

import { CustomerServiceItem } from '@/lib/useACSCompliance';

export default function CustomerServicePanel({ items }: { items: CustomerServiceItem[] }) {
  return (
    <div className="space-y-6">
      <div className="bg-[#0f172a]/70 backdrop-blur-sm border border-white/10 rounded-xl p-5">
        <div className="flex items-center gap-2 mb-4">
          <div className="w-8 h-8 flex items-center justify-center bg-purple-500/10 rounded-lg">
            <i className="ri-customer-service-2-line text-purple-400"></i>
          </div>
          <div>
            <h2 className="text-base font-semibold text-white">Customer Service Module</h2>
            <p className="text-xs text-gray-500">Track client satisfaction, complaints, and service quality</p>
          </div>
        </div>

        <div className="space-y-2">
          {items.map((item) => (
            <div key={item.id} className="flex items-center justify-between p-3 bg-white/5 rounded-lg border border-white/5">
              <div className="flex items-center gap-3">
                <div className={`w-2.5 h-2.5 rounded-full ${item.status === 'complete' || item.status === 'closed' ? 'bg-emerald-500' : item.status === 'open' || item.status === 'in_progress' ? 'bg-amber-500' : 'bg-gray-500'}`}></div>
                <div>
                  <p className="text-sm font-medium text-white">{item.title}</p>
                  <span className="text-xs text-gray-500 capitalize">{item.category}</span>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <span className={`text-xs px-2 py-0.5 rounded-full border ${item.status === 'complete' || item.status === 'closed' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : item.status === 'open' || item.status === 'in_progress' ? 'bg-amber-500/10 text-amber-400 border-amber-500/20' : 'bg-gray-500/10 text-gray-400 border-gray-500/20'}`}>
                  {item.status.replace(/_/g, ' ')}
                </span>
                {item.due_date && (
                  <span className={`text-xs ${new Date(item.due_date) < new Date() ? 'text-red-400' : 'text-gray-400'}`}>
                    Due: {new Date(item.due_date).toLocaleDateString('en-GB')}
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>

        <div className="mt-4 p-4 bg-purple-500/5 border border-purple-500/10 rounded-lg">
          <p className="text-xs text-purple-400">
            <span className="font-semibold">Tip:</span> Customer service records are tracked via corrective actions. 
            Create actions categorised as customer service to track surveys, complaints, and client meeting outcomes.
          </p>
        </div>
      </div>
    </div>
  );
}