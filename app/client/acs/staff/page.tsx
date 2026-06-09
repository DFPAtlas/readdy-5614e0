'use client';

import { useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useACS } from '@/lib/useACS';
import { useAuth } from '@/lib/auth';

const STATUSES = ['compliant', 'review', 'missing', 'expired'];

export default function ACSStaffPage() {
  const { staffCompliance, refresh } = useACS();
  const { currentUser } = useAuth();
  const [showAdd, setShowAdd] = useState(false);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [editing, setEditing] = useState<string | null>(null);

  const filtered = staffCompliance.filter((s) => {
    if (statusFilter && s.status !== statusFilter) return false;
    if (search && !s.staff_name.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  const [form, setForm] = useState({
    staff_name: '',
    sia_licence: '',
    sia_expiry: '',
    right_to_work_status: '',
    right_to_work_expiry: '',
    vetting_status: '',
    reference_status: '',
    employment_history_verified: false,
    site_induction_date: '',
    last_appraisal_date: '',
    welfare_notes: '',
    status: 'compliant',
  });

  const expiredLicences = staffCompliance.filter((s) => s.sia_expiry && new Date(s.sia_expiry) < new Date()).length;
  const expiredRTW = staffCompliance.filter((s) => s.right_to_work_expiry && new Date(s.right_to_work_expiry) < new Date()).length;
  const missing = staffCompliance.filter((s) => s.status === 'missing').length;

  async function saveRecord() {
    if (!currentUser?.company_id) return;
    if (editing) {
      await supabase.from('acs_staff_compliance').update({
        staff_name: form.staff_name,
        sia_licence: form.sia_licence || null,
        sia_expiry: form.sia_expiry || null,
        right_to_work_status: form.right_to_work_status || null,
        right_to_work_expiry: form.right_to_work_expiry || null,
        vetting_status: form.vetting_status || null,
        reference_status: form.reference_status || null,
        employment_history_verified: form.employment_history_verified,
        site_induction_date: form.site_induction_date || null,
        last_appraisal_date: form.last_appraisal_date || null,
        welfare_notes: form.welfare_notes || null,
        status: form.status,
      }).eq('id', editing);
    } else {
      await supabase.from('acs_staff_compliance').insert({
        company_id: currentUser.company_id,
        staff_name: form.staff_name,
        sia_licence: form.sia_licence || null,
        sia_expiry: form.sia_expiry || null,
        right_to_work_status: form.right_to_work_status || null,
        right_to_work_expiry: form.right_to_work_expiry || null,
        vetting_status: form.vetting_status || null,
        reference_status: form.reference_status || null,
        employment_history_verified: form.employment_history_verified,
        site_induction_date: form.site_induction_date || null,
        last_appraisal_date: form.last_appraisal_date || null,
        welfare_notes: form.welfare_notes || null,
        status: form.status,
      });
    }
    refresh();
    setShowAdd(false);
    setEditing(null);
    setForm({ staff_name: '', sia_licence: '', sia_expiry: '', right_to_work_status: '', right_to_work_expiry: '', vetting_status: '', reference_status: '', employment_history_verified: false, site_induction_date: '', last_appraisal_date: '', welfare_notes: '', status: 'compliant' });
  }

  function startEdit(s: typeof staffCompliance[0]) {
    setEditing(s.id);
    setForm({
      staff_name: s.staff_name,
      sia_licence: s.sia_licence || '',
      sia_expiry: s.sia_expiry || '',
      right_to_work_status: s.right_to_work_status || '',
      right_to_work_expiry: s.right_to_work_expiry || '',
      vetting_status: s.vetting_status || '',
      reference_status: s.reference_status || '',
      employment_history_verified: s.employment_history_verified || false,
      site_induction_date: s.site_induction_date || '',
      last_appraisal_date: s.last_appraisal_date || '',
      welfare_notes: s.welfare_notes || '',
      status: s.status,
    });
    setShowAdd(true);
  }

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-[#0f172a]/70 backdrop-blur-sm border border-white/10 rounded-xl p-5">
          <div className="text-sm text-gray-400 mb-1">Total Staff</div>
          <div className="text-3xl font-bold text-white">{staffCompliance.length}</div>
        </div>
        <div className="bg-[#0f172a]/70 backdrop-blur-sm border border-white/10 rounded-xl p-5">
          <div className="text-sm text-gray-400 mb-1">Expired SIA Licences</div>
          <div className={`text-3xl font-bold ${expiredLicences > 0 ? 'text-red-400' : 'text-emerald-400'}`}>{expiredLicences}</div>
        </div>
        <div className="bg-[#0f172a]/70 backdrop-blur-sm border border-white/10 rounded-xl p-5">
          <div className="text-sm text-gray-400 mb-1">Expired RTW</div>
          <div className={`text-3xl font-bold ${expiredRTW > 0 ? 'text-red-400' : 'text-emerald-400'}`}>{expiredRTW}</div>
        </div>
        <div className="bg-[#0f172a]/70 backdrop-blur-sm border border-white/10 rounded-xl p-5">
          <div className="text-sm text-gray-400 mb-1">Missing Records</div>
          <div className={`text-3xl font-bold ${missing > 0 ? 'text-red-400' : 'text-emerald-400'}`}>{missing}</div>
        </div>
      </div>

      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <input
            type="text"
            placeholder="Search staff..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-amber-500/50 w-56"
          />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white pr-8 focus:outline-none focus:border-amber-500/50"
          >
            <option value="">All</option>
            {STATUSES.map((s) => (<option key={s} value={s}>{s}</option>))}
          </select>
        </div>
        <button
          onClick={() => { setShowAdd(true); setEditing(null); }}
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-amber-600 hover:bg-amber-500 text-white text-sm font-medium rounded-lg transition-colors cursor-pointer whitespace-nowrap"
        >
          <div className="w-4 h-4 flex items-center justify-center"><i className="ri-user-add-line"></i></div>
          Add Staff Record
        </button>
      </div>

      {/* Table */}
      <div className="bg-[#0f172a]/70 backdrop-blur-sm border border-white/10 rounded-xl overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-white/10">
              <th className="text-left text-gray-400 font-medium px-4 py-3">Staff Name</th>
              <th className="text-left text-gray-400 font-medium px-4 py-3">SIA Licence</th>
              <th className="text-left text-gray-400 font-medium px-4 py-3">Right to Work</th>
              <th className="text-left text-gray-400 font-medium px-4 py-3">Vetting</th>
              <th className="text-left text-gray-400 font-medium px-4 py-3">Induction</th>
              <th className="text-left text-gray-400 font-medium px-4 py-3">Status</th>
              <th className="text-left text-gray-400 font-medium px-4 py-3"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {filtered.length === 0 ? (
              <tr><td colSpan={7} className="px-4 py-8 text-center text-gray-500">No staff records yet.</td></tr>
            ) : (
              filtered.map((s) => {
                const siaExpired = s.sia_expiry && new Date(s.sia_expiry) < new Date();
                const rtwExpired = s.right_to_work_expiry && new Date(s.right_to_work_expiry) < new Date();
                return (
                  <tr key={s.id} className="hover:bg-white/5 transition-colors">
                    <td className="px-4 py-3">
                      <p className="font-medium text-white">{s.staff_name}</p>
                    </td>
                    <td className="px-4 py-3">
                      {s.sia_licence ? (
                        <div>
                          <p className="text-xs text-gray-300">{s.sia_licence}</p>
                          {s.sia_expiry && (
                            <p className={`text-xs ${siaExpired ? 'text-red-400' : 'text-gray-500'}`}>
                              Exp: {new Date(s.sia_expiry).toLocaleDateString('en-GB')}
                            </p>
                          )}
                        </div>
                      ) : <span className="text-xs text-gray-500">-</span>}
                    </td>
                    <td className="px-4 py-3">
                      {s.right_to_work_status ? (
                        <div>
                          <p className="text-xs text-gray-300">{s.right_to_work_status}</p>
                          {s.right_to_work_expiry && (
                            <p className={`text-xs ${rtwExpired ? 'text-red-400' : 'text-gray-500'}`}>
                              Exp: {new Date(s.right_to_work_expiry).toLocaleDateString('en-GB')}
                            </p>
                          )}
                        </div>
                      ) : <span className="text-xs text-gray-500">-</span>}
                    </td>
                    <td className="px-4 py-3">
                      <span className={`text-xs px-2 py-1 rounded ${
                        s.vetting_status === 'cleared' ? 'bg-emerald-500/10 text-emerald-400' :
                        s.vetting_status === 'pending' ? 'bg-amber-500/10 text-amber-400' :
                        'bg-red-500/10 text-red-400'
                      }`}>{s.vetting_status || '-'}</span>
                    </td>
                    <td className="px-4 py-3 text-xs text-gray-300">
                      {s.site_induction_date ? new Date(s.site_induction_date).toLocaleDateString('en-GB') : '-'}
                    </td>
                    <td className="px-4 py-3">
                      <span className={`text-xs px-2 py-1 rounded font-medium ${
                        s.status === 'compliant' ? 'bg-emerald-500/10 text-emerald-400' :
                        s.status === 'review' ? 'bg-amber-500/10 text-amber-400' :
                        s.status === 'missing' ? 'bg-red-500/10 text-red-400' :
                        'bg-gray-500/10 text-gray-400'
                      }`}>{s.status}</span>
                    </td>
                    <td className="px-4 py-3">
                      <button onClick={() => startEdit(s)} className="text-blue-400 hover:text-blue-300 text-xs cursor-pointer">
                        Edit
                      </button>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Modal */}
      {showAdd && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
          <div className="bg-[#0f172a] border border-white/10 rounded-xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-5 border-b border-white/10">
              <h3 className="text-base font-semibold text-white">{editing ? 'Edit Staff Record' : 'Add Staff Record'}</h3>
              <button onClick={() => setShowAdd(false)} className="text-gray-400 hover:text-white cursor-pointer">
                <div className="w-5 h-5 flex items-center justify-center"><i className="ri-close-line"></i></div>
              </button>
            </div>
            <div className="p-5 space-y-4">
              <div>
                <label className="text-xs text-gray-400 block mb-1">Staff Name</label>
                <input value={form.staff_name} onChange={(e) => setForm({ ...form, staff_name: e.target.value })} className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-amber-500/50" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-gray-400 block mb-1">SIA Licence No</label>
                  <input value={form.sia_licence} onChange={(e) => setForm({ ...form, sia_licence: e.target.value })} className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-amber-500/50" />
                </div>
                <div>
                  <label className="text-xs text-gray-400 block mb-1">SIA Expiry</label>
                  <input type="date" value={form.sia_expiry} onChange={(e) => setForm({ ...form, sia_expiry: e.target.value })} className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-amber-500/50" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-gray-400 block mb-1">RTW Status</label>
                  <select value={form.right_to_work_status} onChange={(e) => setForm({ ...form, right_to_work_status: e.target.value })} className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white pr-8 focus:outline-none focus:border-amber-500/50">
                    <option value="">-</option>
                    <option value="UK Citizen">UK Citizen</option>
                    <option value="EU Settled">EU Settled</option>
                    <option value="Visa Holder">Visa Holder</option>
                    <option value="Pending">Pending</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs text-gray-400 block mb-1">RTW Expiry</label>
                  <input type="date" value={form.right_to_work_expiry} onChange={(e) => setForm({ ...form, right_to_work_expiry: e.target.value })} className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-amber-500/50" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-gray-400 block mb-1">Vetting</label>
                  <select value={form.vetting_status} onChange={(e) => setForm({ ...form, vetting_status: e.target.value })} className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white pr-8 focus:outline-none focus:border-amber-500/50">
                    <option value="">-</option>
                    <option value="cleared">Cleared</option>
                    <option value="pending">Pending</option>
                    <option value="failed">Failed</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs text-gray-400 block mb-1">References</label>
                  <select value={form.reference_status} onChange={(e) => setForm({ ...form, reference_status: e.target.value })} className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white pr-8 focus:outline-none focus:border-amber-500/50">
                    <option value="">-</option>
                    <option value="verified">Verified</option>
                    <option value="pending">Pending</option>
                    <option value="missing">Missing</option>
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-gray-400 block mb-1">Site Induction</label>
                  <input type="date" value={form.site_induction_date} onChange={(e) => setForm({ ...form, site_induction_date: e.target.value })} className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-amber-500/50" />
                </div>
                <div>
                  <label className="text-xs text-gray-400 block mb-1">Last Appraisal</label>
                  <input type="date" value={form.last_appraisal_date} onChange={(e) => setForm({ ...form, last_appraisal_date: e.target.value })} className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-amber-500/50" />
                </div>
              </div>
              <div>
                <label className="text-xs text-gray-400 block mb-1">Status</label>
                <select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })} className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white pr-8 focus:outline-none focus:border-amber-500/50">
                  {STATUSES.map((s) => (<option key={s} value={s}>{s}</option>))}
                </select>
              </div>
              <div>
                <label className="text-xs text-gray-400 block mb-1">Welfare Notes</label>
                <textarea value={form.welfare_notes} onChange={(e) => setForm({ ...form, welfare_notes: e.target.value })} rows={3} className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-amber-500/50 resize-none" />
              </div>
            </div>
            <div className="flex items-center justify-end gap-3 p-5 border-t border-white/10">
              <button onClick={() => setShowAdd(false)} className="px-4 py-2 text-sm text-gray-400 hover:text-white cursor-pointer">Cancel</button>
              <button onClick={saveRecord} className="px-4 py-2 bg-amber-600 hover:bg-amber-500 text-white text-sm font-medium rounded-lg cursor-pointer whitespace-nowrap">Save</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}