'use client';

import { useState } from 'react';
import { useCompliance } from '@/lib/useCompliance';
import { Pill } from '@/app/admin/compliance/components/ui';

function deadline(awareness: string | null): string {
  if (!awareness) return '—';
  return new Date(new Date(awareness).getTime() + 72 * 3600 * 1000).toLocaleString();
}

export default function BreachPanel() {
  const { breaches, createBreach } = useCompliance();
  const [show, setShow] = useState(false);
  const [description, setDescription] = useState('');
  const [dataAffected, setDataAffected] = useState('');
  const [awareness, setAwareness] = useState('');
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState('');

  const submit = async () => {
    if (!description.trim()) return;
    setSaving(true);
    const { error } = await createBreach({
      description,
      data_affected: dataAffected || null,
      awareness_time: awareness ? new Date(awareness).toISOString() : null,
      reportability_assessment: 'unassessed',
    });
    setSaving(false);
    if (error) {
      setMsg('Could not save. Check permissions.');
      return;
    }
    setMsg('Breach case recorded. Reportability requires human confirmation.');
    setDescription('');
    setDataAffected('');
    setAwareness('');
    setShow(false);
  };

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <p className="text-sm text-gray-400">
          Notification deadline is calculated from recorded awareness time. The ICO is never notified automatically.
        </p>
        <button
          onClick={() => setShow((v) => !v)}
          className="px-3 py-2 text-sm font-medium bg-blue-600 hover:bg-blue-500 text-white rounded-lg transition-colors cursor-pointer whitespace-nowrap"
        >
          Record breach
        </button>
      </div>

      {show && (
        <div className="bg-[#111827]/80 border border-gray-800 rounded-xl p-5 space-y-4">
          <div>
            <label className="block text-xs text-gray-400 mb-1.5">Incident description</label>
            <textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={3} className="w-full bg-[#0f1629] border border-gray-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-blue-500" />
          </div>
          <div>
            <label className="block text-xs text-gray-400 mb-1.5">Data affected</label>
            <input value={dataAffected} onChange={(e) => setDataAffected(e.target.value)} className="w-full bg-[#0f1629] border border-gray-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-blue-500" />
          </div>
          <div>
            <label className="block text-xs text-gray-400 mb-1.5">Awareness time</label>
            <input type="datetime-local" value={awareness} onChange={(e) => setAwareness(e.target.value)} className="w-full bg-[#0f1629] border border-gray-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-blue-500" />
          </div>
          <div className="flex items-center gap-3">
            <button onClick={submit} disabled={saving || !description.trim()} className="px-4 py-2 text-sm font-medium bg-blue-600 hover:bg-blue-500 disabled:opacity-40 text-white rounded-lg cursor-pointer whitespace-nowrap">Save case</button>
            {msg && <span className="text-xs text-gray-400">{msg}</span>}
          </div>
        </div>
      )}

      {breaches.length === 0 ? (
        <p className="text-sm text-gray-500 py-6 text-center">No breach cases recorded for your organisation.</p>
      ) : (
        <div className="divide-y divide-gray-800/60 bg-[#111827]/80 border border-gray-800 rounded-xl">
          {breaches.map((b) => (
            <div key={b.id} className="px-5 py-3 flex items-center justify-between gap-4">
              <div className="min-w-0">
                <p className="text-sm text-white truncate">{b.reference || '—'}</p>
                <p className="text-xs text-gray-500 truncate">{b.description}</p>
              </div>
              <div className="text-right flex-shrink-0">
                <p className="text-xs text-gray-400">Deadline: {deadline(b.awareness_time)}</p>
                <div className="mt-1 flex justify-end"><Pill value={b.reportability_assessment} /></div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}