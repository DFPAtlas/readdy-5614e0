'use client';

import { useState } from 'react';
import { ReleaseApproval } from '@/lib/useReleaseControl';
import { Badge, PanelCard, EmptyState, Tone } from './ui';

const AREAS = ['product', 'engineering', 'security', 'operations', 'finance', 'compliance'];

function decisionTone(d: string): Tone {
  if (d === 'approved') return 'green';
  if (d === 'conditional') return 'amber';
  if (d === 'rejected') return 'red';
  return 'grey';
}

export default function ApprovalsPanel({
  approvals,
  recordApproval,
  canApprove,
  approverId,
}: {
  approvals: ReleaseApproval[];
  recordApproval: (area: string, decision: string, conditions: string, evidence: string, approverId: string) => Promise<any>;
  canApprove: boolean;
  approverId: string;
}) {
  const [editing, setEditing] = useState<string | null>(null);
  const [form, setForm] = useState({ decision: 'approved', conditions: '', evidence: '' });

  return (
    <PanelCard title="Required approvals" subtitle="All six areas must approve for a GO recommendation">
      {approvals.length === 0 ? (
        <EmptyState text="No approval records yet" />
      ) : (
        <div className="divide-y divide-gray-800">
          {AREAS.map((area) => {
            const a = approvals.find((x) => x.area === area);
            const decision = a?.decision || 'pending';
            return (
              <div key={area} className="px-5 py-3 flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-gray-800 flex items-center justify-center flex-shrink-0">
                  <div className="w-4 h-4 flex items-center justify-center text-gray-400">
                    <i className="ri-shield-user-line"></i>
                  </div>
                </div>
                <div className="min-w-0 flex-1">
                  <div className="text-sm text-white capitalize">{area}</div>
                  {a?.decided_at && <div className="text-[10px] text-gray-500">{new Date(a.decided_at).toLocaleString('en-GB')}</div>}
                  {a?.conditions && <div className="text-[11px] text-amber-400/80 truncate" title={a.conditions}>{a.conditions}</div>}
                </div>
                <Badge tone={decisionTone(decision)}>{decision}</Badge>
                {canApprove && (
                  <button
                    onClick={() => { setEditing(area); setForm({ decision: 'approved', conditions: '', evidence: '' }); }}
                    className="text-xs text-indigo-400 hover:text-indigo-300 cursor-pointer whitespace-nowrap"
                  >
                    Review
                  </button>
                )}
              </div>
            );
          })}
        </div>
      )}

      {editing && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/60" onClick={() => setEditing(null)} />
          <div className="relative w-full max-w-md bg-[#111827] border border-gray-700 rounded-xl p-5">
            <h3 className="text-white font-semibold text-sm mb-4 capitalize">{editing} approval</h3>
            <div className="space-y-3">
              <div className="flex flex-wrap gap-2">
                {['approved', 'conditional', 'rejected'].map((d) => (
                  <button
                    key={d}
                    onClick={() => setForm((f) => ({ ...f, decision: d }))}
                    className={`px-3 py-1.5 rounded-md text-xs border cursor-pointer whitespace-nowrap ${form.decision === d ? 'bg-indigo-600/20 text-indigo-300 border-indigo-500/40' : 'text-gray-400 border-gray-700 hover:text-white'}`}
                  >
                    {d}
                  </button>
                ))}
              </div>
              <textarea
                value={form.conditions}
                onChange={(e) => setForm((f) => ({ ...f, conditions: e.target.value }))}
                placeholder="Conditions (optional)"
                rows={2}
                className="w-full bg-gray-800/50 border border-gray-700 rounded-lg px-3 py-2 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-indigo-500"
              />
              <textarea
                value={form.evidence}
                onChange={(e) => setForm((f) => ({ ...f, evidence: e.target.value }))}
                placeholder="Evidence reviewed (e.g. test report reference)"
                rows={2}
                className="w-full bg-gray-800/50 border border-gray-700 rounded-lg px-3 py-2 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-indigo-500"
              />
              <div className="flex justify-end gap-2 pt-2">
                <button onClick={() => setEditing(null)} className="px-3 py-2 rounded-lg text-sm text-gray-400 hover:text-white cursor-pointer whitespace-nowrap">Cancel</button>
                <button
                  onClick={async () => { await recordApproval(editing, form.decision, form.conditions, form.evidence, approverId); setEditing(null); }}
                  className="px-4 py-2 rounded-lg text-sm font-medium bg-indigo-600 text-white hover:bg-indigo-500 cursor-pointer whitespace-nowrap"
                >
                  Record
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </PanelCard>
  );
}