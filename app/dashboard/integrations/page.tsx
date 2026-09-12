'use client';

import { useState } from 'react';
import { useAuth } from '@/lib/auth';
import { useIntegrations } from '@/lib/useIntegrations';
import Link from 'next/link';

const CATEGORY_ICONS: Record<string, string> = {
  'Accounting': 'ri-calculator-line',
  'Payroll': 'ri-money-pound-circle-line',
  'Communications': 'ri-chat-3-line',
  'Mapping': 'ri-map-pin-line',
  'Calendar': 'ri-calendar-line',
  'Identity/SSO': 'ri-shield-keyhole-line',
  'Security/SIEM': 'ri-shield-check-line',
  'Automation': 'ri-flow-chart',
  'Reporting': 'ri-bar-chart-line',
  'Storage/export': 'ri-folder-download-line',
};

const CATEGORY_COLORS: Record<string, string> = {
  'Accounting': 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
  'Payroll': 'bg-violet-500/10 text-violet-400 border-violet-500/20',
  'Communications': 'bg-blue-500/10 text-blue-400 border-blue-500/20',
  'Mapping': 'bg-amber-500/10 text-amber-400 border-amber-500/20',
  'Calendar': 'bg-cyan-500/10 text-cyan-400 border-cyan-500/20',
  'Identity/SSO': 'bg-pink-500/10 text-pink-400 border-pink-500/20',
  'Security/SIEM': 'bg-red-500/10 text-red-400 border-red-500/20',
  'Automation': 'bg-orange-500/10 text-orange-400 border-orange-500/20',
  'Reporting': 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20',
  'Storage/export': 'bg-teal-500/10 text-teal-400 border-teal-500/20',
};

export default function IntegrationsPage() {
  const { profile } = useAuth();
  const companyId = profile?.company_id || null;
  const { catalogue, companyIntegrations, loading, connectIntegration, disconnectIntegration } = useIntegrations(companyId);
  const [connectingKey, setConnectingKey] = useState<string | null>(null);
  const [showConnectModal, setShowConnectModal] = useState<string | null>(null);
  const [capabilities, setCapabilities] = useState<string[]>([]);
  const [externalOrgId, setExternalOrgId] = useState('');

  const companyIntegrationMap = new Map(companyIntegrations.map(ci => [ci.integration_key, ci]));

  const groupedByCategory = catalogue.reduce<Record<string, typeof catalogue>>((acc, item) => {
    if (!acc[item.category]) acc[item.category] = [];
    acc[item.category].push(item);
    return acc;
  }, {});

  const connectedCount = companyIntegrations.filter(ci => ci.enabled).length;

  const handleConnect = async () => {
    if (!showConnectModal) return;
    setConnectingKey(showConnectModal);
    await connectIntegration(showConnectModal, capabilities, externalOrgId || undefined);
    setConnectingKey(null);
    setShowConnectModal(null);
    setCapabilities([]);
    setExternalOrgId('');
  };

  const handleDisconnect = async (integrationKey: string) => {
    const ci = companyIntegrationMap.get(integrationKey);
    if (!ci) return;
    await disconnectIntegration(ci.id);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Integrations</h1>
          <p className="text-sm text-gray-400 mt-1">Connect GuardianHub with your existing tools and services</p>
        </div>
        <div className="flex items-center gap-3">
          <Link href="/dashboard/integrations/api-keys" className="flex items-center gap-2 px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-sm text-gray-300 hover:text-white hover:border-gray-600 transition-colors whitespace-nowrap cursor-pointer">
            <div className="w-4 h-4 flex items-center justify-center"><i className="ri-key-line"></i></div>
            API Keys
          </Link>
          <Link href="/dashboard/integrations/webhooks" className="flex items-center gap-2 px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-sm text-gray-300 hover:text-white hover:border-gray-600 transition-colors whitespace-nowrap cursor-pointer">
            <div className="w-4 h-4 flex items-center justify-center"><i className="ri-webhook-line"></i></div>
            Webhooks
          </Link>
          <Link href="/dashboard/integrations/import-export" className="flex items-center gap-2 px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-sm text-gray-300 hover:text-white hover:border-gray-600 transition-colors whitespace-nowrap cursor-pointer">
            <div className="w-4 h-4 flex items-center justify-center"><i className="ri-upload-cloud-line"></i></div>
            Import/Export
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-4 gap-4">
        <div className="bg-[#111827] border border-gray-800 rounded-xl p-4">
          <p className="text-xs text-gray-500 uppercase tracking-wide">Available</p>
          <p className="text-2xl font-bold text-white mt-1">{catalogue.length}</p>
        </div>
        <div className="bg-[#111827] border border-gray-800 rounded-xl p-4">
          <p className="text-xs text-gray-500 uppercase tracking-wide">Connected</p>
          <p className="text-2xl font-bold text-emerald-400 mt-1">{connectedCount}</p>
        </div>
        <div className="bg-[#111827] border border-gray-800 rounded-xl p-4">
          <p className="text-xs text-gray-500 uppercase tracking-wide">Healthy</p>
          <p className="text-2xl font-bold text-blue-400 mt-1">{companyIntegrations.filter(ci => ci.enabled && ci.health_status === 'connected').length}</p>
        </div>
        <div className="bg-[#111827] border border-gray-800 rounded-xl p-4">
          <p className="text-xs text-gray-500 uppercase tracking-wide">Needs Attention</p>
          <p className="text-2xl font-bold text-amber-400 mt-1">{companyIntegrations.filter(ci => ci.enabled && (ci.health_status === 'error' || ci.health_status === 'degraded')).length}</p>
        </div>
      </div>

      {loading ? (
        <div className="space-y-6">
          {[1,2,3].map(i => (
            <div key={i} className="bg-[#111827] border border-gray-800 rounded-xl p-6">
              <div className="h-5 w-32 bg-white/5 rounded animate-pulse mb-4" />
              <div className="grid grid-cols-3 gap-4">
                {[1,2,3].map(j => <div key={j} className="h-32 bg-white/5 rounded-lg animate-pulse" />)}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="space-y-8">
          {Object.entries(groupedByCategory).map(([category, items]) => (
            <div key={category}>
              <div className="flex items-center gap-3 mb-4">
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${CATEGORY_COLORS[category]?.split(' ')[0] || 'bg-gray-500/10'}`}>
                  <i className={`${CATEGORY_ICONS[category] || 'ri-plug-line'} ${CATEGORY_COLORS[category]?.split(' ')[1] || 'text-gray-400'}`}></i>
                </div>
                <h3 className="text-base font-semibold text-white">{category}</h3>
                <span className="text-xs text-gray-500">({items.length})</span>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {items.map(item => {
                  const companyIntegration = companyIntegrationMap.get(item.integration_key);
                  const isConnected = companyIntegration?.enabled;
                  const health = companyIntegration?.health_status || 'disconnected';

                  return (
                    <div key={item.integration_key} className="bg-[#111827] border border-gray-800 rounded-xl p-5 hover:border-gray-700 transition-colors">
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <h4 className="text-sm font-semibold text-white">{item.name}</h4>
                          {item.required_plan && item.required_plan !== 'starter' && (
                            <span className="inline-block mt-1 px-2 py-0.5 bg-amber-500/10 text-amber-400 text-[10px] rounded-full uppercase tracking-wider">
                              {item.required_plan}
                            </span>
                          )}
                        </div>
                        <div className={`w-2.5 h-2.5 rounded-full flex-shrink-0 mt-1 ${
                          health === 'connected' ? 'bg-emerald-500' :
                          health === 'degraded' ? 'bg-amber-500' :
                          health === 'error' ? 'bg-red-500' : 'bg-gray-600'
                        }`} />
                      </div>

                      <p className="text-xs text-gray-400 mb-3 line-clamp-2">{item.description}</p>

                      {item.supported_capabilities && item.supported_capabilities.length > 0 && (
                        <div className="flex flex-wrap gap-1.5 mb-3">
                          {item.supported_capabilities.map(cap => (
                            <span key={cap} className="px-2 py-0.5 bg-gray-800 rounded text-[10px] text-gray-400">
                              {cap.replace(/_/g, ' ')}
                            </span>
                          ))}
                        </div>
                      )}

                      <div className="flex items-center gap-2 mt-4">
                        {isConnected ? (
                          <>
                            <span className="text-xs text-emerald-400 flex items-center gap-1">
                              <i className="ri-check-line"></i> Connected
                            </span>
                            {companyIntegration?.last_synced_at && (
                              <span className="text-[10px] text-gray-500">
                                Last sync: {new Date(companyIntegration.last_synced_at).toLocaleDateString()}
                              </span>
                            )}
                            <button
                              onClick={() => handleDisconnect(item.integration_key)}
                              className="ml-auto text-xs text-red-400 hover:text-red-300 transition-colors whitespace-nowrap cursor-pointer"
                            >
                              Disconnect
                            </button>
                          </>
                        ) : (
                          <button
                            onClick={() => {
                              setShowConnectModal(item.integration_key);
                              setCapabilities(item.supported_capabilities || []);
                            }}
                            className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 hover:bg-blue-500 rounded-lg text-xs text-white transition-colors whitespace-nowrap cursor-pointer"
                          >
                            <div className="w-3.5 h-3.5 flex items-center justify-center"><i className="ri-plug-line"></i></div>
                            Connect
                          </button>
                        )}
                        {item.documentation_url && (
                          <a href={item.documentation_url} target="_blank" rel="noopener noreferrer" className="text-xs text-gray-500 hover:text-gray-300 whitespace-nowrap ml-2">
                            <div className="w-3.5 h-3.5 flex items-center justify-center inline"><i className="ri-external-link-line"></i></div> Docs
                          </a>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      )}

      {showConnectModal && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center" onClick={() => setShowConnectModal(null)}>
          <div className="bg-[#111827] border border-gray-700 rounded-xl p-6 w-full max-w-md mx-4" onClick={e => e.stopPropagation()}>
            <h3 className="text-lg font-semibold text-white mb-1">
              Connect {catalogue.find(c => c.integration_key === showConnectModal)?.name}
            </h3>
            <p className="text-sm text-gray-400 mb-4">This integration will be enabled for your company. Review the capabilities below.</p>

            <div className="space-y-2 mb-4">
              <label className="block text-xs text-gray-400 uppercase tracking-wider">Authorized Capabilities</label>
              {capabilities.map(cap => (
                <label key={cap} className="flex items-center gap-2 text-sm text-gray-300 py-1">
                  <input
                    type="checkbox"
                    checked={true}
                    onChange={() => {}}
                    className="rounded bg-gray-800 border-gray-600"
                  />
                  {cap.replace(/_/g, ' ')}
                </label>
              ))}
            </div>

            <div className="mb-4">
              <label className="block text-xs text-gray-400 uppercase tracking-wider mb-1">External Organisation ID (optional)</label>
              <input
                type="text"
                value={externalOrgId}
                onChange={e => setExternalOrgId(e.target.value)}
                placeholder="e.g. Xero tenant ID"
                className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-blue-500"
              />
            </div>

            <div className="flex gap-3">
              <button onClick={() => setShowConnectModal(null)} className="flex-1 px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-sm text-gray-300 hover:text-white transition-colors whitespace-nowrap cursor-pointer">
                Cancel
              </button>
              <button
                onClick={handleConnect}
                disabled={connectingKey === showConnectModal}
                className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 rounded-lg text-sm text-white transition-colors whitespace-nowrap cursor-pointer"
              >
                {connectingKey === showConnectModal ? 'Connecting...' : 'Confirm Connection'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}