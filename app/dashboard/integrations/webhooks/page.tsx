'use client';

import { useState } from 'react';
import { useAuth } from '@/lib/auth';
import { useWebhooks, WEBHOOK_EVENT_TYPES } from '@/lib/useIntegrations';
import Link from 'next/link';

export default function WebhooksPage() {
  const { profile } = useAuth();
  const companyId = profile?.company_id || null;
  const { endpoints, deliveries, loading, saving, createEndpoint, toggleEndpoint, deleteEndpoint } = useWebhooks(companyId);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newUrl, setNewUrl] = useState('');
  const [newEvents, setNewEvents] = useState<string[]>([]);

  const handleCreate = async () => {
    if (!newUrl || newEvents.length === 0) return;
    const ok = await createEndpoint(newUrl, newEvents);
    if (ok) {
      setShowCreateModal(false);
      setNewUrl('');
      setNewEvents([]);
    }
  };

  const toggleEvent = (event: string) => {
    setNewEvents(prev => prev.includes(event) ? prev.filter(e => e !== event) : [...prev, event]);
  };

  const groupedEvents = WEBHOOK_EVENT_TYPES.reduce<Record<string, typeof WEBHOOK_EVENT_TYPES>>((acc, ev) => {
    if (!acc[ev.category]) acc[ev.category] = [];
    acc[ev.category].push(ev);
    return acc;
  }, {});

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <Link href="/dashboard/integrations" className="text-xs text-gray-400 hover:text-gray-300 mb-2 inline-flex items-center gap-1 cursor-pointer">
            <div className="w-3.5 h-3.5 flex items-center justify-center"><i className="ri-arrow-left-line"></i></div>
            Integrations
          </Link>
          <h1 className="text-2xl font-bold text-white">Webhooks</h1>
          <p className="text-sm text-gray-400 mt-1">Configure outbound webhooks for real-time event delivery</p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-500 rounded-lg text-sm text-white transition-colors whitespace-nowrap cursor-pointer"
        >
          <div className="w-4 h-4 flex items-center justify-center"><i className="ri-add-line"></i></div>
          Add Endpoint
        </button>
      </div>

      <div className="bg-[#0b1a1f] border border-blue-500/20 rounded-xl p-4">
        <div className="flex items-start gap-3">
          <div className="w-5 h-5 flex items-center justify-center text-blue-400 flex-shrink-0 mt-0.5"><i className="ri-information-line"></i></div>
          <div>
            <p className="text-sm text-blue-300 font-medium">Webhook Security</p>
            <p className="text-xs text-blue-400/70 mt-1">
              Payloads are signed with HMAC-SHA256. Verify signatures using the <code className="bg-blue-500/10 px-1 rounded">x-guardianhub-signature</code> header.
              Only HTTPS destinations are accepted in production. Private network addresses are blocked.
            </p>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="space-y-3">
          {[1,2].map(i => <div key={i} className="h-24 bg-[#111827] rounded-xl animate-pulse" />)}
        </div>
      ) : (
        <div className="space-y-6">
          <div className="space-y-3">
            {endpoints.length === 0 ? (
              <div className="bg-[#111827] border border-gray-800 rounded-xl p-8 text-center">
                <div className="w-12 h-12 mx-auto flex items-center justify-center bg-gray-800 rounded-full text-gray-500 mb-3">
                  <i className="ri-webhook-line text-xl"></i>
                </div>
                <p className="text-sm text-gray-400">No webhook endpoints configured</p>
                <p className="text-xs text-gray-500 mt-1">Add an endpoint to receive real-time event notifications</p>
              </div>
            ) : (
              endpoints.map(endpoint => {
                const endpointDeliveries = deliveries.filter(d => d.webhook_endpoint_id === endpoint.id);
                const recentDeliveries = endpointDeliveries.slice(0, 5);
                const successRate = endpointDeliveries.length > 0
                  ? Math.round((endpointDeliveries.filter(d => d.status === 'delivered').length / endpointDeliveries.length) * 100)
                  : null;

                return (
                  <div key={endpoint.id} className="bg-[#111827] border border-gray-800 rounded-xl overflow-hidden">
                    <div className="px-4 py-3 flex items-center justify-between">
                      <div className="flex items-center gap-3 min-w-0">
                        <div className={`w-2 h-2 rounded-full flex-shrink-0 ${
                          endpoint.status === 'active' ? 'bg-emerald-500' : endpoint.status === 'paused' ? 'bg-amber-500' : 'bg-gray-600'
                        }`} />
                        <div className="min-w-0">
                          <p className="text-sm font-medium text-white truncate">{endpoint.url}</p>
                          <div className="flex items-center gap-2 mt-1">
                            <span className={`text-[10px] uppercase ${
                              endpoint.status === 'active' ? 'text-emerald-400' : 'text-amber-400'
                            }`}>{endpoint.status}</span>
                            {successRate !== null && (
                              <span className="text-[10px] text-gray-500">{successRate}% success rate</span>
                            )}
                            {endpoint.failure_count > 0 && (
                              <span className="text-[10px] text-red-400">{endpoint.failure_count} failures</span>
                            )}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 flex-shrink-0">
                        <button
                          onClick={() => toggleEndpoint(endpoint.id, endpoint.status !== 'active')}
                          className={`px-2.5 py-1 rounded text-[10px] transition-colors whitespace-nowrap cursor-pointer ${
                            endpoint.status === 'active'
                              ? 'bg-amber-500/10 text-amber-400 hover:bg-amber-500/20'
                              : 'bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20'
                          }`}
                        >
                          {endpoint.status === 'active' ? 'Pause' : 'Resume'}
                        </button>
                        <button
                          onClick={() => deleteEndpoint(endpoint.id)}
                          className="px-2.5 py-1 bg-red-500/10 text-red-400 hover:bg-red-500/20 rounded text-[10px] transition-colors whitespace-nowrap cursor-pointer"
                        >
                          Delete
                        </button>
                      </div>
                    </div>

                    <div className="px-4 py-2 border-t border-gray-800 bg-[#0a0e1a]/50">
                      <div className="flex flex-wrap gap-1">
                        {endpoint.enabled_events.map(event => (
                          <span key={event} className="px-1.5 py-0.5 bg-gray-800 rounded text-[10px] text-gray-400">{event}</span>
                        ))}
                      </div>
                    </div>

                    {recentDeliveries.length > 0 && (
                      <div className="border-t border-gray-800 divide-y divide-gray-800/50">
                        {recentDeliveries.map(delivery => (
                          <div key={delivery.id} className="px-4 py-2 flex items-center justify-between text-xs">
                            <div className="flex items-center gap-2">
                              <span className={`w-1.5 h-1.5 rounded-full ${
                                delivery.status === 'delivered' ? 'bg-emerald-500' :
                                delivery.status === 'failed' ? 'bg-red-500' : 'bg-gray-500'
                              }`} />
                              <span className="text-gray-400">{delivery.event_type}</span>
                              <span className="text-gray-600">{new Date(delivery.created_at).toLocaleString()}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              {delivery.response_code && (
                                <span className={delivery.response_code < 400 ? 'text-emerald-400' : 'text-red-400'}>
                                  {delivery.response_code}
                                </span>
                              )}
                              <span className="text-gray-600">Attempt {delivery.attempt_count}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}

      {showCreateModal && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center" onClick={() => setShowCreateModal(false)}>
          <div className="bg-[#111827] border border-gray-700 rounded-xl p-6 w-full max-w-lg mx-4 max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
            <h3 className="text-lg font-semibold text-white mb-4">Add Webhook Endpoint</h3>

            <div className="space-y-4">
              <div>
                <label className="block text-xs text-gray-400 uppercase tracking-wider mb-1">Endpoint URL (HTTPS required)</label>
                <input
                  type="url"
                  value={newUrl}
                  onChange={e => setNewUrl(e.target.value)}
                  placeholder="https://your-service.com/webhooks"
                  className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs text-gray-400 uppercase tracking-wider mb-2">Events ({newEvents.length} selected)</label>
                {Object.entries(groupedEvents).map(([category, events]) => (
                  <div key={category} className="mb-3">
                    <p className="text-[10px] text-gray-600 uppercase tracking-wider mb-1.5">{category}</p>
                    <div className="space-y-1">
                      {events.map(ev => (
                        <label key={ev.key} className="flex items-center gap-2 text-sm py-1 px-2 rounded hover:bg-gray-800/50 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={newEvents.includes(ev.key)}
                            onChange={() => toggleEvent(ev.key)}
                            className="rounded bg-gray-800 border-gray-600"
                          />
                          <span className="text-gray-300 text-xs">{ev.label}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button onClick={() => setShowCreateModal(false)} className="flex-1 px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-sm text-gray-300 hover:text-white transition-colors whitespace-nowrap cursor-pointer">
                Cancel
              </button>
              <button
                onClick={handleCreate}
                disabled={!newUrl || newEvents.length === 0 || saving}
                className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 rounded-lg text-sm text-white transition-colors whitespace-nowrap cursor-pointer"
              >
                {saving ? 'Creating...' : 'Create Endpoint'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}