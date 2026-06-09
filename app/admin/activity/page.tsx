'use client';

import { useAdminActivity } from '@/lib/useSuperAdmin';
import { EmptyState } from '../components/AdminUI';

export default function AdminActivityPage() {
  const { logs, loading } = useAdminActivity();

  const actionColors: Record<string, string> = {
    client_created: 'text-emerald-400 bg-emerald-500/10',
    client_status_change: 'text-amber-400 bg-amber-500/10',
    client_edited: 'text-blue-400 bg-blue-500/10',
    plan_changed: 'text-purple-400 bg-purple-500/10',
    admin_note_added: 'text-indigo-400 bg-indigo-500/10',
    billing_status_changed: 'text-red-400 bg-red-500/10',
  };

  return (
    <div className="p-4 lg:p-6 max-w-5xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-white">Activity Log</h1>
        <p className="text-sm text-gray-500 mt-0.5">All admin actions across the platform</p>
      </div>

      <div className="bg-[#111827] border border-gray-800 rounded-xl">
        {loading ? (
          <div className="p-8 text-center text-sm text-gray-500">Loading activity...</div>
        ) : logs.length === 0 ? (
          <EmptyState icon="ri-shield-check-line" title="No activity yet" description="Admin actions will be logged here." />
        ) : (
          <div className="divide-y divide-gray-800">
            {logs.map((log: any) => (
              <div key={log.id} className="px-5 py-4 flex items-start gap-4">
                <div className="w-10 h-10 rounded-full bg-gray-800 flex items-center justify-center flex-shrink-0">
                  <div className="w-5 h-5 flex items-center justify-center text-gray-500">
                    <i className="ri-shield-check-line text-sm"></i>
                  </div>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className={`inline-flex px-2 py-0.5 rounded text-xs font-medium capitalize ${actionColors[log.action] || 'text-gray-400 bg-gray-500/10'}`}>
                      {log.action.replace(/_/g, ' ')}
                    </span>
                    {log.company && (
                      <span className="text-xs text-gray-500">{log.company.name}</span>
                    )}
                    <span className="text-xs text-gray-600">
                      {new Date(log.created_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                  <p className="text-sm text-gray-300 mt-1">{log.description}</p>
                  {log.performed_by_profile && (
                    <p className="text-xs text-gray-600 mt-1">
                      By {log.performed_by_profile.first_name} {log.performed_by_profile.last_name}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}