'use client';

import { useAuth } from '@/lib/auth';
import { useIntegrations, useSyncRuns } from '@/lib/useIntegrations';
import Link from 'next/link';

export default function MonitoringPage() {
  const { profile } = useAuth();
  const companyId = profile?.company_id || null;
  const { companyIntegrations, loading } = useIntegrations(companyId);
  const { syncRuns } = useSyncRuns(companyId);

  const connectedIntegrations = companyIntegrations.filter(ci => ci.enabled);
  const unhealthyIntegrations = connectedIntegrations.filter(ci => ci.health_status !== 'connected');
  const recentRuns = syncRuns.slice(0, 20);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <Link href="/dashboard/integrations" className="text-xs text-gray-400 hover:text-gray-300 mb-2 inline-flex items-center gap-1 cursor-pointer">
            <div className="w-3.5 h-3.5 flex items-center justify-center"><i className="ri-arrow-left-line"></i></div>
            Integrations
          </Link>
          <h1 className="text-2xl font-bold text-white">Integration Monitoring</h1>
          <p className="text-sm text-gray-400 mt-1">Monitor integration health, sync status and delivery performance</p>
        </div>
      </div>

      <div className="grid grid-cols-4 gap-4">
        <div className="bg-[#111827] border border-gray-800 rounded-xl p-4">
          <p className="text-xs text-gray-500 uppercase tracking-wide">Total Connections</p>
          <p className="text-2xl font-bold text-white mt-1">{connectedIntegrations.length}</p>
        </div>
        <div className="bg-[#111827] border border-gray-800 rounded-xl p-4">
          <p className="text-xs text-gray-500 uppercase tracking-wide">Healthy</p>
          <p className="text-2xl font-bold text-emerald-400 mt-1">{connectedIntegrations.filter(ci => ci.health_status === 'connected').length}</p>
        </div>
        <div className="bg-[#111827] border border-gray-800 rounded-xl p-4">
          <p className="text-xs text-gray-500 uppercase tracking-wide">Needs Attention</p>
          <p className="text-2xl font-bold text-amber-400 mt-1">{unhealthyIntegrations.length}</p>
        </div>
        <div className="bg-[#111827] border border-gray-800 rounded-xl p-4">
          <p className="text-xs text-gray-500 uppercase tracking-wide">Recent Syncs</p>
          <p className="text-2xl font-bold text-blue-400 mt-1">{recentRuns.length}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <div className="bg-[#111827] border border-gray-800 rounded-xl overflow-hidden">
            <div className="px-4 py-3 border-b border-gray-800">
              <h3 className="text-sm font-semibold text-white">Connected Integrations</h3>
            </div>
            {connectedIntegrations.length === 0 ? (
              <div className="p-8 text-center text-gray-500 text-sm">No integrations connected yet.</div>
            ) : (
              <div className="divide-y divide-gray-800">
                {connectedIntegrations.map(ci => (
                  <div key={ci.id} className="px-4 py-3 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className={`w-2.5 h-2.5 rounded-full ${
                        ci.health_status === 'connected' ? 'bg-emerald-500' :
                        ci.health_status === 'degraded' ? 'bg-amber-500' : 'bg-red-500'
                      }`} />
                      <div>
                        <p className="text-sm font-medium text-white">{ci.catalogue?.name || ci.integration_key}</p>
                        <p className="text-[10px] text-gray-500">
                          {ci.health_status} {ci.last_synced_at ? `· Last sync: ${new Date(ci.last_synced_at).toLocaleString()}` : ''}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <button className="px-2.5 py-1 bg-blue-500/10 text-blue-400 rounded text-[10px] hover:bg-blue-500/20 transition-colors whitespace-nowrap cursor-pointer">
                        Test
                      </button>
                      <button className="px-2.5 py-1 bg-amber-500/10 text-amber-400 rounded text-[10px] hover:bg-amber-500/20 transition-colors whitespace-nowrap cursor-pointer">
                        Retry
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="bg-[#111827] border border-gray-800 rounded-xl overflow-hidden">
          <div className="px-4 py-3 border-b border-gray-800">
            <h3 className="text-sm font-semibold text-white">Recent Sync Runs</h3>
          </div>
          {recentRuns.length === 0 ? (
            <div className="p-6 text-center text-gray-500 text-xs">No sync runs recorded.</div>
          ) : (
            <div className="divide-y divide-gray-800 max-h-[400px] overflow-y-auto">
              {recentRuns.map(run => (
                <div key={run.id} className="px-4 py-2.5">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs text-gray-400">{run.integration_key}</span>
                    <span className={`text-[10px] uppercase ${
                      run.status === 'completed' ? 'text-emerald-400' :
                      run.status === 'failed' ? 'text-red-400' :
                      run.status === 'processing' ? 'text-blue-400' : 'text-gray-500'
                    }`}>{run.status}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] text-gray-500">{run.direction} · {run.resource_type}</span>
                    <span className="text-[10px] text-gray-600">
                      {run.records_succeeded}/{run.records_processed} ok
                    </span>
                  </div>
                  {run.sanitized_error && (
                    <p className="text-[10px] text-red-400 mt-1 truncate">{run.sanitized_error}</p>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-[#111827] border border-gray-800 rounded-xl p-5">
          <h3 className="text-sm font-semibold text-white mb-3">Quick Actions</h3>
          <div className="grid grid-cols-2 gap-2">
            <Link href="/dashboard/integrations/webhooks" className="flex items-center gap-2 px-3 py-2.5 bg-gray-800 hover:bg-gray-700 rounded-lg text-xs text-gray-300 transition-colors cursor-pointer whitespace-nowrap">
              <div className="w-4 h-4 flex items-center justify-center"><i className="ri-webhook-line"></i></div>
              Manage Webhooks
            </Link>
            <Link href="/dashboard/integrations/api-keys" className="flex items-center gap-2 px-3 py-2.5 bg-gray-800 hover:bg-gray-700 rounded-lg text-xs text-gray-300 transition-colors cursor-pointer whitespace-nowrap">
              <div className="w-4 h-4 flex items-center justify-center"><i className="ri-key-line"></i></div>
              API Credentials
            </Link>
            <Link href="/dashboard/integrations/import-export" className="flex items-center gap-2 px-3 py-2.5 bg-gray-800 hover:bg-gray-700 rounded-lg text-xs text-gray-300 transition-colors cursor-pointer whitespace-nowrap">
              <div className="w-4 h-4 flex items-center justify-center"><i className="ri-download-line"></i></div>
              Export Data
            </Link>
            <button className="flex items-center gap-2 px-3 py-2.5 bg-gray-800 hover:bg-gray-700 rounded-lg text-xs text-gray-300 transition-colors cursor-pointer whitespace-nowrap">
              <div className="w-4 h-4 flex items-center justify-center"><i className="ri-refresh-line"></i></div>
              Refresh All
            </button>
          </div>
        </div>

        <div className="bg-[#0b1a1f] border border-blue-500/20 rounded-xl p-5">
          <h3 className="text-sm font-semibold text-white mb-3">API Usage Summary</h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs text-gray-400">Requests today</span>
              <span className="text-sm font-medium text-white">—</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-xs text-gray-400">Active credentials</span>
              <span className="text-sm font-medium text-white">—</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-xs text-gray-400">API version</span>
              <span className="text-sm font-medium text-blue-400">v1.0</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-xs text-gray-400">Gateway endpoint</span>
              <code className="text-xs font-mono text-gray-400">/api/v1</code>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}