'use client';

import { useState } from 'react';
import { useCompliance } from '@/lib/useCompliance';
import { Pill, Card, PanelHeader } from './ui';

const BASIS_OPTIONS = ['Contract', 'Legal obligation', 'Legitimate interests', 'Vital interests', 'Consent', 'Public task'];

export default function RecordsPanel() {
  const { activities, dpias, reviewTasks, createLawfulBasis, createReviewTask, updateReviewTask } = useCompliance();
  const [showBasisForm, setShowBasisForm] = useState(false);
  const [basisType, setBasisType] = useState('Contract');
  const [basisPurpose, setBasisPurpose] = useState('');
  const [basisNotes, setBasisNotes] = useState('');
  const [taskTitle, setTaskTitle] = useState('');
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState('');

  const nonTemplateDpias = dpias.filter((d) => !d.is_template);

  const submitBasis = async () => {
    if (!basisPurpose.trim()) return;
    setSaving(true);
    const { error } = await createLawfulBasis({
      basis_type: basisType,
      purpose: basisPurpose,
      decision_notes: basisNotes || 'Decision requires legal confirmation',
    });
    setSaving(false);
    if (error) {
      setMsg('Could not save. Ensure you have permission.');
      return;
    }
    setMsg('Lawful-basis record saved. Marked for legal review.');
    setBasisPurpose('');
    setBasisNotes('');
    setShowBasisForm(false);
  };

  const addTask = async () => {
    if (!taskTitle.trim()) return;
    await createReviewTask({ title: taskTitle, category: 'legal_review', priority: 'medium', status: 'open' });
    setTaskTitle('');
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-semibold text-white">Records of processing activities</h2>
        <button
          onClick={() => setShowBasisForm((v) => !v)}
          className="inline-flex items-center gap-1.5 text-xs font-medium text-indigo-400 hover:text-indigo-300 transition-colors cursor-pointer whitespace-nowrap"
        >
          <i className="ri-add-line"></i>
          Record lawful basis
        </button>
      </div>

      {showBasisForm && (
        <Card className="p-5">
          <div className="grid md:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-xs text-gray-400 mb-1.5">Lawful basis</label>
              <select
                value={basisType}
                onChange={(e) => setBasisType(e.target.value)}
                className="w-full bg-[#0f1629] border border-gray-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-indigo-500 pr-8"
              >
                {BASIS_OPTIONS.map((b) => (
                  <option key={b} value={b}>{b}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs text-gray-400 mb-1.5">Purpose (required)</label>
              <input
                value={basisPurpose}
                onChange={(e) => setBasisPurpose(e.target.value)}
                placeholder="Explain the purpose of processing"
                className="w-full bg-[#0f1629] border border-gray-700 rounded-lg px-3 py-2 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-indigo-500"
              />
            </div>
          </div>
          <div className="mb-4">
            <label className="block text-xs text-gray-400 mb-1.5">Decision notes</label>
            <textarea
              value={basisNotes}
              onChange={(e) => setBasisNotes(e.target.value)}
              rows={2}
              placeholder="Record the decision owner and rationale"
              className="w-full bg-[#0f1629] border border-gray-700 rounded-lg px-3 py-2 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-indigo-500"
            />
          </div>
          <p className="text-xs text-amber-400/80 mb-3">
            Employee consent must not be assumed to be freely given. A purpose and decision owner are required.
          </p>
          <div className="flex items-center gap-3">
            <button
              onClick={submitBasis}
              disabled={saving || !basisPurpose.trim()}
              className="px-4 py-2 text-sm font-medium bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 text-white rounded-lg transition-colors cursor-pointer whitespace-nowrap"
            >
              Save record
            </button>
            {msg && <span className="text-xs text-gray-400">{msg}</span>}
          </div>
        </Card>
      )}

      <Card>
        <PanelHeader title="Processing activities" subtitle="Controller / processor responsibility matrix" count={activities.length} />
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-xs text-gray-500 border-b border-gray-800">
                <th className="px-5 py-3 font-medium">Activity</th>
                <th className="px-5 py-3 font-medium">Controller / Processor</th>
                <th className="px-5 py-3 font-medium">Lawful basis</th>
                <th className="px-5 py-3 font-medium">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-800/60">
              {activities.map((a) => (
                <tr key={a.id} className="hover:bg-white/[0.02]">
                  <td className="px-5 py-3">
                    <p className="text-white">{a.name}</p>
                    <p className="text-xs text-gray-500 mt-0.5 max-w-md truncate">{a.purpose}</p>
                  </td>
                  <td className="px-5 py-3 text-gray-400 capitalize">
                    {a.controller_role}
                    {a.processor_role ? ` / ${a.processor_role}` : ''}
                  </td>
                  <td className="px-5 py-3 text-gray-400">{a.lawful_basis || '—'}</td>
                  <td className="px-5 py-3"><Pill value={a.status} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      <div className="grid lg:grid-cols-2 gap-6">
        <Card>
          <PanelHeader title="DPIA assessments" subtitle="Excludes templates" count={nonTemplateDpias.length} />
          <div className="divide-y divide-gray-800/60">
            {nonTemplateDpias.length === 0 && (
              <p className="px-5 py-4 text-sm text-gray-500">No tenant DPIAs recorded yet.</p>
            )}
            {nonTemplateDpias.map((d) => (
              <div key={d.id} className="px-5 py-3 flex items-center justify-between gap-4">
                <div className="min-w-0">
                  <p className="text-sm text-white truncate">{d.title}</p>
                  <p className="text-xs text-gray-500">Residual risk: {d.residual_risk.replace(/_/g, ' ')}</p>
                </div>
                <Pill value={d.approval_status} />
              </div>
            ))}
          </div>
        </Card>

        <Card>
          <PanelHeader title="Open legal review tasks" count={reviewTasks.filter((t) => t.status === 'open').length} />
          <div className="p-5 space-y-3">
            <div className="flex gap-2">
              <input
                value={taskTitle}
                onChange={(e) => setTaskTitle(e.target.value)}
                placeholder="Add a review task..."
                className="flex-1 bg-[#0f1629] border border-gray-700 rounded-lg px-3 py-2 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-indigo-500"
              />
              <button
                onClick={addTask}
                className="px-3 py-2 text-sm font-medium bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg transition-colors cursor-pointer whitespace-nowrap"
              >
                Add
              </button>
            </div>
            <div className="divide-y divide-gray-800/60">
              {reviewTasks.map((t) => (
                <div key={t.id} className="py-2.5 flex items-center justify-between gap-3">
                  <div className="min-w-0">
                    <p className="text-sm text-white truncate">{t.title}</p>
                    <p className="text-xs text-gray-500">{t.category.replace(/_/g, ' ')}</p>
                  </div>
                  <button
                    onClick={() => updateReviewTask(t.id, { status: t.status === 'open' ? 'done' : 'open' })}
                    className="text-xs text-indigo-400 hover:text-indigo-300 cursor-pointer whitespace-nowrap"
                  >
                    {t.status === 'open' ? 'Mark done' : 'Reopen'}
                  </button>
                </div>
              ))}
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}