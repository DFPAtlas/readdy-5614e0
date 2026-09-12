'use client';

import { useState } from 'react';
import { ReleaseDeployment, ReleaseRollback } from '@/lib/useReleaseControl';
import { Badge, PanelCard, EmptyState, Tone } from './ui';

function depTone(s: string): Tone {
  if (s === 'deployed') return 'green';
  if (s === 'failed' || s === 'rolled_back') return 'red';
  return 'amber';
}

export default function DeploymentPanel({
  deployments,
  rollbacks,
  recordDeployment,
  recordRollback,
  canEdit,
}: {
  deployments: ReleaseDeployment[];
  rollbacks: ReleaseRollback[];
  recordDeployment: (d: Partial<ReleaseDeployment>) => Promise<any>;
  recordRollback: (d: Partial<ReleaseRollback>) => Promise<any>;
  canEdit: boolean;
}) {
  const [showDeploy, setShowDeploy] = useState(false);
  const [showRollback, setShowRollback] = useState(false);
  const [deployForm, setDeployForm] = useState({ environment: 'production', commit_sha: '', smoke_test_result: 'passed', backup_confirmed: true, migration_reviewed: true });
  const [rollbackForm, setRollbackForm] = useState({ trigger: '', rollback_version: '', db_recovery_approach: '', incident_ref: '' });

  return (
    <div className="space-y-4">
      <div className="flex gap-2">
        <button
          disabled={!canEdit}
          onClick={() => setShowDeploy(true)}
          className="px-3 py-2 rounded-lg text-sm bg-indigo-600 text-white hover:bg-indigo-500 disabled:opacity-40 cursor-pointer whitespace-nowrap"
        >
          Record deployment
        </button>
        <button
          disabled={!canEdit}
          onClick={() => setShowRollback(true)}
          className="px-3 py-2 rounded-lg text-sm bg-red-600/20 text-red-300 border border-red-600/30 hover:bg-red-600/30 disabled:opacity-40 cursor-pointer whitespace-nowrap"
        >
          Record rollback
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <PanelCard title="Deployments" subtitle={deployments.length > 0 ? `${deployments.length} records` : undefined}>
          {deployments.length === 0 ? (
            <EmptyState text="No deployments recorded" />
          ) : (
            <div className="divide-y divide-gray-800 max-h-[360px] overflow-y-auto">
              {deployments.map((d) => (
                <div key={d.id} className="px-5 py-3">
                  <div className="flex items-center gap-2">
                    <Badge tone={depTone(d.status)}>{d.status.replace(/_/g, ' ')}</Badge>
                    <span className="text-sm text-white font-medium">{d.environment}</span>
                    {d.commit_sha && <span className="text-[10px] text-gray-600 font-mono">{d.commit_sha.slice(0, 8)}</span>}
                  </div>
                  <div className="flex flex-wrap gap-3 mt-1 text-[10px] text-gray-500">
                    {d.backup_confirmed && <span className="text-emerald-400/80">backup confirmed</span>}
                    {d.migration_reviewed && <span className="text-emerald-400/80">migration reviewed</span>}
                    {d.smoke_test_result && <span>smoke: {d.smoke_test_result}</span>}
                    <span>{new Date(d.created_at).toLocaleString('en-GB')}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </PanelCard>

        <PanelCard title="Rollbacks" subtitle="Recovery and communication records">
          {rollbacks.length === 0 ? (
            <EmptyState text="No rollbacks recorded" />
          ) : (
            <div className="divide-y divide-gray-800 max-h-[360px] overflow-y-auto">
              {rollbacks.map((r) => (
                <div key={r.id} className="px-5 py-3">
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-white font-medium">{r.rollback_version || 'Rollback'}</span>
                    {r.incident_ref && <span className="text-[10px] text-gray-600 font-mono">{r.incident_ref}</span>}
                  </div>
                  {r.trigger && <div className="text-xs text-gray-500 mt-0.5">{r.trigger}</div>}
                  {r.db_recovery_approach && <div className="text-[10px] text-amber-400/80 mt-0.5">DB: {r.db_recovery_approach}</div>}
                </div>
              ))}
            </div>
          )}
        </PanelCard>
      </div>

      {showDeploy && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/60" onClick={() => setShowDeploy(false)} />
          <div className="relative w-full max-w-md bg-[#111827] border border-gray-700 rounded-xl p-5">
            <h3 className="text-white font-semibold text-sm mb-4">Record deployment</h3>
            <div className="space-y-3">
              <input type="text" value={deployForm.environment} onChange={(e) => setDeployForm((f) => ({ ...f, environment: e.target.value }))} className="w-full bg-gray-800/50 border border-gray-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-indigo-500" />
              <input type="text" value={deployForm.commit_sha} onChange={(e) => setDeployForm((f) => ({ ...f, commit_sha: e.target.value }))} placeholder="Commit SHA" className="w-full bg-gray-800/50 border border-gray-700 rounded-lg px-3 py-2 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-indigo-500" />
              <div className="flex flex-wrap gap-2">
                {['passed', 'failed', 'in_progress'].map((s) => (
                  <button key={s} onClick={() => setDeployForm((f) => ({ ...f, smoke_test_result: s }))} className={`px-2.5 py-1 rounded-md text-xs border cursor-pointer whitespace-nowrap ${deployForm.smoke_test_result === s ? 'bg-indigo-600/20 text-indigo-300 border-indigo-500/40' : 'text-gray-400 border-gray-700 hover:text-white'}`}>{s.replace(/_/g, ' ')}</button>
                ))}
              </div>
              <label className="flex items-center gap-2 text-xs text-gray-400 cursor-pointer"><input type="checkbox" checked={deployForm.backup_confirmed} onChange={(e) => setDeployForm((f) => ({ ...f, backup_confirmed: e.target.checked }))} className="accent-indigo-500" /> Pre-deployment backup confirmed</label>
              <label className="flex items-center gap-2 text-xs text-gray-400 cursor-pointer"><input type="checkbox" checked={deployForm.migration_reviewed} onChange={(e) => setDeployForm((f) => ({ ...f, migration_reviewed: e.target.checked }))} className="accent-indigo-500" /> Migration reviewed</label>
              <div className="flex justify-end gap-2 pt-2">
                <button onClick={() => setShowDeploy(false)} className="px-3 py-2 rounded-lg text-sm text-gray-400 hover:text-white cursor-pointer whitespace-nowrap">Cancel</button>
                <button onClick={async () => { await recordDeployment({ ...deployForm, status: deployForm.smoke_test_result === 'passed' ? 'deployed' : 'in_progress' }); setShowDeploy(false); }} className="px-4 py-2 rounded-lg text-sm font-medium bg-indigo-600 text-white hover:bg-indigo-500 cursor-pointer whitespace-nowrap">Save</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {showRollback && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/60" onClick={() => setShowRollback(false)} />
          <div className="relative w-full max-w-md bg-[#111827] border border-gray-700 rounded-xl p-5">
            <h3 className="text-white font-semibold text-sm mb-4">Record rollback</h3>
            <div className="space-y-3">
              <input type="text" value={rollbackForm.trigger} onChange={(e) => setRollbackForm((f) => ({ ...f, trigger: e.target.value }))} placeholder="Trigger" className="w-full bg-gray-800/50 border border-gray-700 rounded-lg px-3 py-2 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-indigo-500" />
              <input type="text" value={rollbackForm.rollback_version} onChange={(e) => setRollbackForm((f) => ({ ...f, rollback_version: e.target.value }))} placeholder="Rollback version" className="w-full bg-gray-800/50 border border-gray-700 rounded-lg px-3 py-2 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-indigo-500" />
              <input type="text" value={rollbackForm.db_recovery_approach} onChange={(e) => setRollbackForm((f) => ({ ...f, db_recovery_approach: e.target.value }))} placeholder="Database recovery approach" className="w-full bg-gray-800/50 border border-gray-700 rounded-lg px-3 py-2 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-indigo-500" />
              <input type="text" value={rollbackForm.incident_ref} onChange={(e) => setRollbackForm((f) => ({ ...f, incident_ref: e.target.value }))} placeholder="Incident reference" className="w-full bg-gray-800/50 border border-gray-700 rounded-lg px-3 py-2 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-indigo-500" />
              <div className="flex justify-end gap-2 pt-2">
                <button onClick={() => setShowRollback(false)} className="px-3 py-2 rounded-lg text-sm text-gray-400 hover:text-white cursor-pointer whitespace-nowrap">Cancel</button>
                <button onClick={async () => { await recordRollback(rollbackForm); setShowRollback(false); }} className="px-4 py-2 rounded-lg text-sm font-medium bg-red-600 text-white hover:bg-red-500 cursor-pointer whitespace-nowrap">Save</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}