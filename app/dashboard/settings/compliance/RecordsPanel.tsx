'use client';

import { useState } from 'react';
import { useCompliance } from '@/lib/useCompliance';
import { Pill } from '@/app/admin/compliance/components/ui';

const BASIS = ['Contract', 'Legal obligation', 'Legitimate interests', 'Vital interests', 'Consent'];

export default function RecordsPanel() {
  const { activities, dpias, createLawfulBasis, createDpia } = useCompliance();
  const [basisType, setBasisType] = useState('Contract');
  const [basisPurpose, setBasisPurpose] = useState('');
  const [dpiaTitle, setDpiaTitle] = useState('');
  const [msg, setMsg] = useState('');

  const tenantDpias = dpias.filter((d) => !d.is_template);
  const templates = dpias.filter((d) => d.is_template);

  const addBasis = async () => {
    if (!basisPurpose.trim()) return;
    const { error } = await createLawfulBasis({ basis_type: basisType, purpose: basisPurpose, decision_notes: 'Marked for legal review' });
    setMsg(error ? 'Could not save.' : 'Lawful-basis record saved.');
    setBasisPurpose('');
  };

  const addDpia = async () => {
    if (!dpiaTitle.trim()) return;
    const { error } = await createDpia({ title: dpiaTitle, residual_risk: 'unassessed', approval_status: 'draft' });
    setMsg(error ? 'Could not save.' : 'DPIA started.');
    setDpiaTitle('');
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-sm font-semibold text-white mb-2">Processing activities</h3>
        <p className="text-xs text-gray-500 mb-3">Controller / processor responsibilities. Platform reference activities are shared for transparency.</p>
        <div className="divide-y divide-gray-800/60 bg-[#111827]/80 border border-gray-800 rounded-xl">
          {activities.map((a) => (
            <div key={a.id} className="px-5 py-3 flex items-center justify-between gap-4">
              <div className="min-w-0">
                <p className="text-sm text-white truncate">{a.name}</p>
                <p className="text-xs text-gray-500 truncate">{a.lawful_basis || 'No lawful basis selected'} · {a.controller_role}{a.processor_role ? ` / ${a.processor_role}` : ''}</p>
              </div>
              <Pill value={a.status} />
            </div>
          ))}
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <div className="bg-[#111827]/80 border border-gray-800 rounded-xl p-5">
          <h3 className="text-sm font-semibold text-white mb-3">Record lawful basis</h3>
          <div className="space-y-3">
            <select value={basisType} onChange={(e) => setBasisType(e.target.value)} className="w-full bg-[#0f1629] border border-gray-700 rounded-lg px-3 py-2 text-sm text-white pr-8">
              {BASIS.map((b) => <option key={b} value={b}>{b}</option>)}
            </select>
            <input value={basisPurpose} onChange={(e) => setBasisPurpose(e.target.value)} placeholder="Purpose of processing" className="w-full bg-[#0f1629] border border-gray-700 rounded-lg px-3 py-2 text-sm text-white placeholder-gray-600" />
            <button onClick={addBasis} disabled={!basisPurpose.trim()} className="px-3 py-2 text-sm font-medium bg-blue-600 hover:bg-blue-500 disabled:opacity-40 text-white rounded-lg cursor-pointer whitespace-nowrap">Record</button>
          </div>
        </div>

        <div className="bg-[#111827]/80 border border-gray-800 rounded-xl p-5">
          <h3 className="text-sm font-semibold text-white mb-3">Start a DPIA</h3>
          <p className="text-xs text-gray-500 mb-3">Templates: {templates.map((t) => t.title).join(' · ')}</p>
          <div className="flex gap-2 mb-3">
            <input value={dpiaTitle} onChange={(e) => setDpiaTitle(e.target.value)} placeholder="DPIA title" className="flex-1 bg-[#0f1629] border border-gray-700 rounded-lg px-3 py-2 text-sm text-white placeholder-gray-600" />
            <button onClick={addDpia} disabled={!dpiaTitle.trim()} className="px-3 py-2 text-sm font-medium bg-blue-600 hover:bg-blue-500 disabled:opacity-40 text-white rounded-lg cursor-pointer whitespace-nowrap">Start</button>
          </div>
          {tenantDpias.map((d) => (
            <div key={d.id} className="py-2 flex items-center justify-between gap-3">
              <p className="text-sm text-white truncate">{d.title}</p>
              <Pill value={d.approval_status} />
            </div>
          ))}
        </div>
      </div>

      {msg && <p className="text-xs text-gray-400">{msg}</p>}
    </div>
  );
}