'use client';

import { useState } from 'react';
import { ReleaseDefect } from '@/lib/useReleaseControl';
import { Badge, PanelCard, EmptyState, severityTone } from './ui';

const SEVERITIES = ['critical', 'high', 'medium', 'low'];
const STATUSES = ['open', 'investigating', 'in_progress', 'ready_for_retest', 'resolved', 'accepted_risk', 'rejected', 'duplicate'];

const OPEN = ['open', 'investigating', 'in_progress', 'ready_for_retest'];

export default function DefectsPanel({
  defects,
  createDefect,
  updateDefect,
  canEdit,
}: {
  defects: ReleaseDefect[];
  createDefect: (d: Partial<ReleaseDefect>) => Promise<any>;
  updateDefect: (id: string, updates: Partial<ReleaseDefect>) => Promise<any>;
  canEdit: boolean;
}) {
  const [showNew, setShowNew] = useState(false);
  const [form, setForm] = useState({ title: '', severity: 'medium', description: '', affected_role: '', steps_to_reproduce: '', is_tenant_data_leak: false });

  const openDefects = defects.filter((d) => OPEN.includes(d.status));

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-xs text-gray-500">{openDefects.length} open defects</p>
        <button
          disabled={!canEdit}
          onClick={() => setShowNew(true)}
          className="px-3 py-2 rounded-lg text-sm bg-indigo-600 text-white hover:bg-indigo-500 disabled:opacity-40 cursor-pointer whitespace-nowrap"
        >
          Log defect
        </button>
      </div>

      {defects.length === 0 ? (
        <EmptyState text="No defects recorded" />
      ) : (
        <div className="space-y-2">
          {defects.map((d) => (
            <div key={d.id} className="bg-[#111827] border border-gray-800 rounded-xl p-4 flex items-start gap-3">
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <Badge tone={severityTone(d.severity)}>{d.severity}</Badge>
                  {d.is_tenant_data_leak && <Badge tone="red">tenant leak</Badge>}
                  <span className="text-sm font-medium text-white">{d.title}</span>
                  <span className="text-[10px] text-gray-600 font-mono">{d.reference}</span>
                </div>
                {d.description && <div className="text-xs text-gray-500 mt-1">{d.description}</div>}
                <div className="flex items-center gap-3 mt-2 text-[10px] text-gray-500">
                  {d.affected_role && <span>Role: {d.affected_role}</span>}
                  {d.affected_tenant && <span>Tenant: {d.affected_tenant}</span>}
                  {d.fix_version && <span>Fix: {d.fix_version}</span>}
                  <span className="text-gray-600">{new Date(d.created_at).toLocaleDateString('en-GB')}</span>
                </div>
              </div>
              <div className="flex flex-col items-end gap-1 flex-shrink-0">
                <Badge tone={d.status === 'resolved' ? 'green' : d.status === 'accepted_risk' ? 'amber' : d.status === 'rejected' || d.status === 'duplicate' ? 'grey' : 'indigo'}>
                  {d.status.replace(/_/g, ' ')}
                </Badge>
                {canEdit && (
                  <select
                    value={d.status}
                    onChange={(e) => updateDefect(d.id, { status: e.target.value })}
                    className="bg-gray-800 border border-gray-700 rounded text-[10px] text-gray-300 px-1.5 py-0.5 pr-8 cursor-pointer focus:outline-none"
                  >
                    {STATUSES.map((s) => <option key={s} value={s}>{s.replace(/_/g, ' ')}</option>)}
                  </select>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {showNew && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/60" onClick={() => setShowNew(false)} />
          <div className="relative w-full max-w-md bg-[#111827] border border-gray-700 rounded-xl p-5">
            <h3 className="text-white font-semibold text-sm mb-4">Log defect</h3>
            <div className="space-y-3">
              <input
                type="text"
                value={form.title}
                onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
                placeholder="Title"
                className="w-full bg-gray-800/50 border border-gray-700 rounded-lg px-3 py-2 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-indigo-500"
              />
              <div className="flex flex-wrap gap-2">
                {SEVERITIES.map((s) => (
                  <button
                    key={s}
                    onClick={() => setForm((f) => ({ ...f, severity: s }))}
                    className={`px-2.5 py-1 rounded-md text-xs border cursor-pointer whitespace-nowrap ${form.severity === s ? 'bg-indigo-600/20 text-indigo-300 border-indigo-500/40' : 'text-gray-400 border-gray-700 hover:text-white'}`}
                  >
                    {s}
                  </button>
                ))}
              </div>
              <textarea
                value={form.description}
                onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
                placeholder="Description"
                rows={3}
                className="w-full bg-gray-800/50 border border-gray-700 rounded-lg px-3 py-2 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-indigo-500"
              />
              <textarea
                value={form.steps_to_reproduce}
                onChange={(e) => setForm((f) => ({ ...f, steps_to_reproduce: e.target.value }))}
                placeholder="Steps to reproduce"
                rows={2}
                className="w-full bg-gray-800/50 border border-gray-700 rounded-lg px-3 py-2 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-indigo-500"
              />
              <input
                type="text"
                value={form.affected_role}
                onChange={(e) => setForm((f) => ({ ...f, affected_role: e.target.value }))}
                placeholder="Affected role"
                className="w-full bg-gray-800/50 border border-gray-700 rounded-lg px-3 py-2 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-indigo-500"
              />
              <label className="flex items-center gap-2 text-xs text-gray-400 cursor-pointer">
                <input type="checkbox" checked={form.is_tenant_data_leak} onChange={(e) => setForm((f) => ({ ...f, is_tenant_data_leak: e.target.checked }))} className="accent-red-500" />
                Confirmed tenant data leak
              </label>
              <div className="flex justify-end gap-2 pt-2">
                <button onClick={() => setShowNew(false)} className="px-3 py-2 rounded-lg text-sm text-gray-400 hover:text-white cursor-pointer whitespace-nowrap">Cancel</button>
                <button
                  disabled={!form.title.trim()}
                  onClick={async () => { await createDefect(form); setShowNew(false); setForm({ title: '', severity: 'medium', description: '', affected_role: '', steps_to_reproduce: '', is_tenant_data_leak: false }); }}
                  className="px-4 py-2 rounded-lg text-sm font-medium bg-indigo-600 text-white hover:bg-indigo-500 disabled:opacity-40 cursor-pointer whitespace-nowrap"
                >
                  Save
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}