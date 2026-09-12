'use client';

import { useState } from 'react';
import { ReleaseSuite, ReleaseCase, ReleaseResult } from '@/lib/useReleaseControl';
import { Badge, PanelCard, EmptyState, resultTone } from './ui';

const RESULT_OPTIONS = ['not_run', 'running', 'passed', 'failed', 'blocked', 'skipped', 'not_applicable'];

export default function TestExecutionPanel({
  suites,
  cases,
  latestResults,
  recordResult,
  canEdit,
}: {
  suites: ReleaseSuite[];
  cases: ReleaseCase[];
  latestResults: Record<string, ReleaseResult>;
  recordResult: (caseId: string, result: string, notes: string, device: string, automated: boolean) => Promise<any>;
  canEdit: boolean;
}) {
  const [openSuite, setOpenSuite] = useState<string | null>(null);
  const [roleFilter, setRoleFilter] = useState('');
  const [resultFilter, setResultFilter] = useState('');
  const [recordCase, setRecordCase] = useState<ReleaseCase | null>(null);
  const [form, setForm] = useState({ result: 'passed', notes: '', device: '', automated: false });

  const casesBySuite = (suiteId: string) => cases.filter((c) => c.suite_id === suiteId);

  const roles = ['platform_superadmin', 'company_admin', 'operations_manager', 'supervisor', 'guard', 'client_admin', 'finance', 'recruitment', 'platform'];

  const suiteProgress = (suite: ReleaseSuite) => {
    const list = casesBySuite(suite.id);
    const total = list.length;
    const passed = list.filter((c) => latestResults[c.id]?.result === 'passed').length;
    const failed = list.filter((c) => latestResults[c.id]?.result === 'failed').length;
    return { total, passed, failed };
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-2">
        <div className="flex flex-wrap gap-1.5">
          <button
            onClick={() => setRoleFilter('')}
            className={`px-2.5 py-1 rounded-full text-xs border cursor-pointer whitespace-nowrap ${roleFilter === '' ? 'bg-indigo-600/20 text-indigo-300 border-indigo-500/40' : 'text-gray-400 border-gray-700 hover:text-white'}`}
          >
            All roles
          </button>
          {roles.map((r) => (
            <button
              key={r}
              onClick={() => setRoleFilter(r)}
              className={`px-2.5 py-1 rounded-full text-xs border cursor-pointer whitespace-nowrap ${roleFilter === r ? 'bg-indigo-600/20 text-indigo-300 border-indigo-500/40' : 'text-gray-400 border-gray-700 hover:text-white'}`}
            >
              {r.replace(/_/g, ' ')}
            </button>
          ))}
        </div>
      </div>

      <div className="flex flex-wrap gap-1.5">
        {['', 'passed', 'failed', 'blocked', 'skipped', 'not_run'].map((r) => (
          <button
            key={r || 'all'}
            onClick={() => setResultFilter(r)}
            className={`px-2.5 py-1 rounded-full text-xs border cursor-pointer whitespace-nowrap ${resultFilter === r ? 'bg-indigo-600/20 text-indigo-300 border-indigo-500/40' : 'text-gray-400 border-gray-700 hover:text-white'}`}
          >
            {r === '' ? 'All results' : r.replace(/_/g, ' ')}
          </button>
        ))}
      </div>

      {suites.length === 0 ? (
        <EmptyState text="No test suites defined yet" />
      ) : (
        <div className="space-y-3">
          {suites.map((suite) => {
            const list = casesBySuite(suite.id).filter((c) => {
              if (roleFilter && c.role !== roleFilter) return false;
              if (resultFilter) {
                const r = latestResults[c.id]?.result || 'not_run';
                if (resultFilter === 'not_run' && r !== 'not_run' && r) return false;
                if (resultFilter !== 'not_run' && r !== resultFilter) return false;
              }
              return true;
            });
            const prog = suiteProgress(suite);
            const open = openSuite === suite.id;
            return (
              <div key={suite.id} className="bg-[#111827] border border-gray-800 rounded-xl overflow-hidden">
                <button
                  onClick={() => setOpenSuite(open ? null : suite.id)}
                  className="w-full flex items-center justify-between px-5 py-4 text-left cursor-pointer hover:bg-white/[0.02]"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-6 h-6 flex items-center justify-center text-gray-500">
                      <i className={`ri-arrow-down-s-line text-lg transition-transform ${open ? 'rotate-180' : ''}`}></i>
                    </div>
                    <div className="min-w-0">
                      <div className="text-sm font-semibold text-white truncate">{suite.name}</div>
                      <div className="text-[10px] text-gray-500 capitalize">{suite.category.replace(/_/g, ' ')}</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    {prog.failed > 0 && <Badge tone="red">{prog.failed} failed</Badge>}
                    <span className="text-xs text-gray-500">{prog.passed}/{prog.total} passed</span>
                  </div>
                </button>
                {open && (
                  <div className="divide-y divide-gray-800/60 border-t border-gray-800/60">
                    {list.length === 0 ? (
                      <EmptyState text="No cases match the filter" />
                    ) : (
                      list.map((c) => {
                        const res = latestResults[c.id];
                        const r = res?.result || 'not_run';
                        return (
                          <div key={c.id} className="px-5 py-3 flex items-center gap-3">
                            <div className="min-w-0 flex-1">
                              <div className="text-sm text-white truncate">{c.name}</div>
                              {c.steps && <div className="text-[11px] text-gray-500 truncate">{c.steps}</div>}
                            </div>
                            <Badge tone={resultTone(r)}>{r.replace(/_/g, ' ')}</Badge>
                            <button
                              disabled={!canEdit}
                              onClick={() => { setRecordCase(c); setForm({ result: 'passed', notes: '', device: '', automated: false }); }}
                              className="text-xs text-indigo-400 hover:text-indigo-300 disabled:opacity-40 cursor-pointer whitespace-nowrap"
                            >
                              Record
                            </button>
                          </div>
                        );
                      })
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {recordCase && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/60" onClick={() => setRecordCase(null)} />
          <div className="relative w-full max-w-md bg-[#111827] border border-gray-700 rounded-xl p-5">
            <h3 className="text-white font-semibold text-sm mb-1">Record test result</h3>
            <p className="text-xs text-gray-500 mb-4">{recordCase.name}</p>
            <div className="space-y-3">
              <div className="flex flex-wrap gap-2">
                {RESULT_OPTIONS.map((r) => (
                  <button
                    key={r}
                    onClick={() => setForm((f) => ({ ...f, result: r }))}
                    className={`px-2.5 py-1 rounded-md text-xs border cursor-pointer whitespace-nowrap ${form.result === r ? 'bg-indigo-600/20 text-indigo-300 border-indigo-500/40' : 'text-gray-400 border-gray-700 hover:text-white'}`}
                  >
                    {r.replace(/_/g, ' ')}
                  </button>
                ))}
              </div>
              <div>
                <label className="text-xs text-gray-500 block mb-1">Browser / device</label>
                <input
                  type="text"
                  value={form.device}
                  onChange={(e) => setForm((f) => ({ ...f, device: e.target.value }))}
                  placeholder="e.g. Chrome 126 desktop"
                  className="w-full bg-gray-800/50 border border-gray-700 rounded-lg px-3 py-2 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-indigo-500"
                />
              </div>
              <div>
                <label className="text-xs text-gray-500 block mb-1">Notes</label>
                <textarea
                  value={form.notes}
                  onChange={(e) => setForm((f) => ({ ...f, notes: e.target.value }))}
                  className="w-full bg-gray-800/50 border border-gray-700 rounded-lg px-3 py-2 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-indigo-500"
                  rows={3}
                />
              </div>
              <label className="flex items-center gap-2 text-xs text-gray-400 cursor-pointer">
                <input type="checkbox" checked={form.automated} onChange={(e) => setForm((f) => ({ ...f, automated: e.target.checked }))} className="accent-indigo-500" />
                Automated result
              </label>
              <div className="flex justify-end gap-2 pt-2">
                <button onClick={() => setRecordCase(null)} className="px-3 py-2 rounded-lg text-sm text-gray-400 hover:text-white cursor-pointer whitespace-nowrap">Cancel</button>
                <button
                  onClick={async () => { await recordResult(recordCase.id, form.result, form.notes, form.device, form.automated); setRecordCase(null); }}
                  className="px-4 py-2 rounded-lg text-sm font-medium bg-indigo-600 text-white hover:bg-indigo-500 cursor-pointer whitespace-nowrap"
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