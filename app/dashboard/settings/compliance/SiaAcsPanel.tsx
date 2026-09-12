'use client';

import { useEffect, useState } from 'react';
import { useCompliance } from '@/lib/useCompliance';
import { Pill } from '@/app/admin/compliance/components/ui';

const ACS_STATUS = ['not_held', 'preparing', 'held'];

export default function SiaAcsPanel() {
  const { siaLicences, acsRecord, saveAcsRecord } = useCompliance();
  const [form, setForm] = useState({
    acs_status: 'not_held',
    approved_activities: '',
    approval_reference: '',
    effective_date: '',
    expiry_date: '',
    assessor: '',
  });
  const [msg, setMsg] = useState('');

  useEffect(() => {
    if (acsRecord) {
      setForm({
        acs_status: acsRecord.acs_status,
        approved_activities: (acsRecord.approved_activities || []).join(', '),
        approval_reference: acsRecord.approval_reference || '',
        effective_date: acsRecord.effective_date || '',
        expiry_date: acsRecord.expiry_date || '',
        assessor: acsRecord.assessor || '',
      });
    }
  }, [acsRecord]);

  const save = async () => {
    const { error } = await saveAcsRecord({
      acs_status: form.acs_status,
      approved_activities: form.approved_activities ? form.approved_activities.split(',').map((s) => s.trim()).filter(Boolean) : [],
      approval_reference: form.approval_reference || null,
      effective_date: form.effective_date || null,
      expiry_date: form.expiry_date || null,
      assessor: form.assessor || null,
      display_authorised: false,
    });
    setMsg(error ? 'Could not save.' : 'ACS record saved. Display remains off until platform verification.');
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-sm font-semibold text-white mb-2">SIA licences (individual)</h3>
        <p className="text-xs text-gray-500 mb-3">
          Licence format validation is not verification. Eligibility affects assignment to licensable activity.
        </p>
        {siaLicences.length === 0 ? (
          <p className="text-sm text-gray-500 py-4">No SIA licence records found.</p>
        ) : (
          <div className="divide-y divide-gray-800/60 bg-[#111827]/80 border border-gray-800 rounded-xl">
            {siaLicences.map((l) => (
              <div key={l.id} className="px-5 py-3 flex items-center justify-between gap-4">
                <div className="min-w-0">
                  <p className="text-sm text-white truncate">{l.licence_number || 'No number recorded'}</p>
                  <p className="text-xs text-gray-500 truncate">{l.licence_type}{l.licence_activity ? ` · ${l.licence_activity}` : ''}</p>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  <Pill value={l.status} />
                  <Pill value={l.assignment_eligibility} />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="bg-[#111827]/80 border border-gray-800 rounded-xl p-5 space-y-4">
        <div>
          <h3 className="text-sm font-semibold text-white mb-1">Approved Contractor Scheme (company)</h3>
          <p className="text-xs text-gray-500">
            ACS is a voluntary company quality scheme, distinct from individual SIA licensing. An ACS mark is never
            displayed until platform staff verify your evidence and authorise it.
          </p>
        </div>
        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs text-gray-400 mb-1.5">ACS status</label>
            <select value={form.acs_status} onChange={(e) => setForm((f) => ({ ...f, acs_status: e.target.value }))} className="w-full bg-[#0f1629] border border-gray-700 rounded-lg px-3 py-2 text-sm text-white pr-8">
              {ACS_STATUS.map((s) => <option key={s} value={s}>{s.replace(/_/g, ' ')}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-xs text-gray-400 mb-1.5">Approval reference</label>
            <input value={form.approval_reference} onChange={(e) => setForm((f) => ({ ...f, approval_reference: e.target.value }))} className="w-full bg-[#0f1629] border border-gray-700 rounded-lg px-3 py-2 text-sm text-white" />
          </div>
          <div>
            <label className="block text-xs text-gray-400 mb-1.5">Approved activities (comma-separated)</label>
            <input value={form.approved_activities} onChange={(e) => setForm((f) => ({ ...f, approved_activities: e.target.value }))} className="w-full bg-[#0f1629] border border-gray-700 rounded-lg px-3 py-2 text-sm text-white" placeholder="Door supervision, security guarding" />
          </div>
          <div>
            <label className="block text-xs text-gray-400 mb-1.5">Assessor</label>
            <input value={form.assessor} onChange={(e) => setForm((f) => ({ ...f, assessor: e.target.value }))} className="w-full bg-[#0f1629] border border-gray-700 rounded-lg px-3 py-2 text-sm text-white" />
          </div>
          <div>
            <label className="block text-xs text-gray-400 mb-1.5">Effective date</label>
            <input type="date" value={form.effective_date} onChange={(e) => setForm((f) => ({ ...f, effective_date: e.target.value }))} className="w-full bg-[#0f1629] border border-gray-700 rounded-lg px-3 py-2 text-sm text-white" />
          </div>
          <div>
            <label className="block text-xs text-gray-400 mb-1.5">Expiry date</label>
            <input type="date" value={form.expiry_date} onChange={(e) => setForm((f) => ({ ...f, expiry_date: e.target.value }))} className="w-full bg-[#0f1629] border border-gray-700 rounded-lg px-3 py-2 text-sm text-white" />
          </div>
        </div>
        {form.acs_status === 'preparing' && (
          <p className="text-xs text-amber-400/80">This is preparation mode only — it does not represent ACS approval.</p>
        )}
        <div className="flex items-center gap-3">
          <button onClick={save} className="px-4 py-2 text-sm font-medium bg-blue-600 hover:bg-blue-500 text-white rounded-lg cursor-pointer whitespace-nowrap">Save ACS record</button>
          {msg && <span className="text-xs text-gray-400">{msg}</span>}
        </div>
      </div>
    </div>
  );
}