'use client';

import { useState } from 'react';
import { useAuth } from '@/lib/auth';
import { useApiCredentials, AVAILABLE_SCOPES } from '@/lib/useIntegrations';
import Link from 'next/link';

export default function ApiKeysPage() {
  const { profile } = useAuth();
  const companyId = profile?.company_id || null;
  const { credentials, accessLogs, loading, saving, createCredential, revokeCredential } = useApiCredentials(companyId);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newName, setNewName] = useState('');
  const [newScopes, setNewScopes] = useState<string[]>([]);
  const [newEnv, setNewEnv] = useState('production');
  const [revealedSecret, setRevealedSecret] = useState<{ clientId: string; secret: string } | null>(null);

  const handleCreate = async () => {
    if (!newName || newScopes.length === 0) return;
    const result = await createCredential(newName, newScopes, newEnv);
    if (result) {
      setRevealedSecret(result);
      setShowCreateModal(false);
      setNewName('');
      setNewScopes([]);
      setNewEnv('production');
    }
  };

  const toggleScope = (scope: string) => {
    setNewScopes(prev => prev.includes(scope) ? prev.filter(s => s !== scope) : [...prev, scope]);
  };

  const activeCredentials = credentials.filter(c => c.status === 'active');

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <Link href="/dashboard/integrations" className="text-xs text-gray-400 hover:text-gray-300 mb-2 inline-flex items-center gap-1 cursor-pointer">
            <div className="w-3.5 h-3.5 flex items-center justify-center"><i className="ri-arrow-left-line"></i></div>
            Integrations
          </Link>
          <h1 className="text-2xl font-bold text-white">API Credentials</h1>
          <p className="text-sm text-gray-400 mt-1">Manage machine-to-machine API keys for the GuardianHub API v1</p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-500 rounded-lg text-sm text-white transition-colors whitespace-nowrap cursor-pointer"
        >
          <div className="w-4 h-4 flex items-center justify-center"><i className="ri-add-line"></i></div>
          Create Credential
        </button>
      </div>

      {revealedSecret && (
        <div className="bg-amber-500/10 border border-amber-500/30 rounded-xl p-5">
          <div className="flex items-start justify-between">
            <div>
              <h3 className="text-amber-400 font-semibold text-sm flex items-center gap-2">
                <div className="w-4 h-4 flex items-center justify-center"><i className="ri-alert-line"></i></div>
                Save These Credentials Now
              </h3>
              <p className="text-xs text-amber-400/70 mt-1">The secret will only be shown once. Store it securely.</p>
            </div>
            <button onClick={() => setRevealedSecret(null)} className="text-amber-400 hover:text-amber-300 cursor-pointer">
              <div className="w-5 h-5 flex items-center justify-center"><i className="ri-close-line"></i></div>
            </button>
          </div>
          <div className="mt-3 space-y-2">
            <div>
              <p className="text-[10px] text-gray-500 uppercase tracking-wider">Client ID</p>
              <code className="text-sm text-white font-mono bg-gray-900 px-3 py-1.5 rounded block mt-1">{revealedSecret.clientId}</code>
            </div>
            <div>
              <p className="text-[10px] text-gray-500 uppercase tracking-wider">Secret</p>
              <code className="text-sm text-white font-mono bg-gray-900 px-3 py-1.5 rounded block mt-1 break-all">{revealedSecret.secret}</code>
            </div>
          </div>
        </div>
      )}

      {loading ? (
        <div className="space-y-3">
          {[1,2,3].map(i => <div key={i} className="h-20 bg-[#111827] rounded-xl animate-pulse" />)}
        </div>
      ) : (
        <div className="space-y-6">
          <div className="bg-[#111827] border border-gray-800 rounded-xl overflow-hidden">
            <div className="px-4 py-3 border-b border-gray-800">
              <h3 className="text-sm font-semibold text-white">Active Credentials ({activeCredentials.length})</h3>
            </div>
            {credentials.length === 0 ? (
              <div className="p-8 text-center text-gray-500 text-sm">
                No API credentials yet. Create one to get started.
              </div>
            ) : (
              <div className="divide-y divide-gray-800">
                {credentials.map(cred => (
                  <div key={cred.id} className="px-4 py-3 flex items-center justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-medium text-white">{cred.name}</p>
                        <span className={`px-1.5 py-0.5 rounded text-[10px] uppercase ${
                          cred.status === 'active' ? 'bg-emerald-500/10 text-emerald-400' :
                          cred.status === 'revoked' ? 'bg-red-500/10 text-red-400' : 'bg-gray-500/10 text-gray-400'
                        }`}>{cred.status}</span>
                        <span className="px-1.5 py-0.5 bg-gray-800 rounded text-[10px] text-gray-400">{cred.environment}</span>
                      </div>
                      <div className="flex items-center gap-2 mt-1">
                        <code className="text-xs text-gray-500 font-mono">{cred.client_id}</code>
                        {cred.last_used_at && (
                          <span className="text-[10px] text-gray-600">Last used: {new Date(cred.last_used_at).toLocaleString()}</span>
                        )}
                      </div>
                      <div className="flex flex-wrap gap-1 mt-1.5">
                        {cred.scopes.map(s => (
                          <span key={s} className="px-1.5 py-0.5 bg-blue-500/10 text-blue-400 rounded text-[10px]">{s}</span>
                        ))}
                      </div>
                    </div>
                    {cred.status === 'active' && (
                      <button
                        onClick={() => revokeCredential(cred.id)}
                        className="px-3 py-1.5 bg-red-500/10 hover:bg-red-500/20 text-red-400 rounded-lg text-xs transition-colors whitespace-nowrap cursor-pointer"
                      >
                        Revoke
                      </button>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="bg-[#111827] border border-gray-800 rounded-xl overflow-hidden">
            <div className="px-4 py-3 border-b border-gray-800">
              <h3 className="text-sm font-semibold text-white">Recent API Access Logs</h3>
            </div>
            {accessLogs.length === 0 ? (
              <div className="p-8 text-center text-gray-500 text-sm">No API requests recorded yet.</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="text-left text-[10px] text-gray-500 uppercase tracking-wider">
                      <th className="px-4 py-2">Time</th>
                      <th className="px-4 py-2">Method</th>
                      <th className="px-4 py-2">Endpoint</th>
                      <th className="px-4 py-2">Status</th>
                      <th className="px-4 py-2">Duration</th>
                      <th className="px-4 py-2">IP</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-800">
                    {accessLogs.map(log => (
                      <tr key={log.id} className="text-xs text-gray-400">
                        <td className="px-4 py-2 text-gray-500">{new Date(log.created_at).toLocaleString()}</td>
                        <td className="px-4 py-2">
                          <span className={`px-1.5 py-0.5 rounded text-[10px] ${
                            log.method === 'GET' ? 'bg-blue-500/10 text-blue-400' :
                            log.method === 'POST' ? 'bg-emerald-500/10 text-emerald-400' :
                            log.method === 'PATCH' ? 'bg-amber-500/10 text-amber-400' : 'bg-gray-500/10 text-gray-400'
                          }`}>{log.method}</span>
                        </td>
                        <td className="px-4 py-2 font-mono text-[11px]">/api/v1/{log.endpoint}</td>
                        <td className="px-4 py-2">
                          <span className={log.response_code && log.response_code < 400 ? 'text-emerald-400' : 'text-red-400'}>
                            {log.response_code}
                          </span>
                        </td>
                        <td className="px-4 py-2 text-gray-500">{log.duration_ms}ms</td>
                        <td className="px-4 py-2 text-gray-500 font-mono text-[11px]">{log.ip_address || '—'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {showCreateModal && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center" onClick={() => setShowCreateModal(false)}>
          <div className="bg-[#111827] border border-gray-700 rounded-xl p-6 w-full max-w-lg mx-4 max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
            <h3 className="text-lg font-semibold text-white mb-4">Create API Credential</h3>

            <div className="space-y-4">
              <div>
                <label className="block text-xs text-gray-400 uppercase tracking-wider mb-1">Name</label>
                <input
                  type="text"
                  value={newName}
                  onChange={e => setNewName(e.target.value)}
                  placeholder="e.g. Integration Service"
                  className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs text-gray-400 uppercase tracking-wider mb-1">Environment</label>
                <div className="flex gap-2">
                  {['production', 'staging', 'development'].map(env => (
                    <button
                      key={env}
                      onClick={() => setNewEnv(env)}
                      className={`px-3 py-1.5 rounded-lg text-xs transition-colors whitespace-nowrap cursor-pointer ${
                        newEnv === env ? 'bg-blue-600 text-white' : 'bg-gray-800 text-gray-400 hover:text-white'
                      }`}
                    >
                      {env}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs text-gray-400 uppercase tracking-wider mb-2">Scopes ({newScopes.length} selected)</label>
                <div className="space-y-1 max-h-64 overflow-y-auto">
                  {AVAILABLE_SCOPES.map(scope => (
                    <label key={scope.key} className="flex items-start gap-2 text-sm py-1.5 px-2 rounded hover:bg-gray-800/50 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={newScopes.includes(scope.key)}
                        onChange={() => toggleScope(scope.key)}
                        className="mt-0.5 rounded bg-gray-800 border-gray-600"
                      />
                      <div>
                        <p className="text-gray-300">{scope.label}</p>
                        <p className="text-[10px] text-gray-500">{scope.description}</p>
                      </div>
                    </label>
                  ))}
                </div>
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button onClick={() => setShowCreateModal(false)} className="flex-1 px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-sm text-gray-300 hover:text-white transition-colors whitespace-nowrap cursor-pointer">
                Cancel
              </button>
              <button
                onClick={handleCreate}
                disabled={!newName || newScopes.length === 0 || saving}
                className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 rounded-lg text-sm text-white transition-colors whitespace-nowrap cursor-pointer"
              >
                {saving ? 'Creating...' : 'Create & Reveal Secret'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}