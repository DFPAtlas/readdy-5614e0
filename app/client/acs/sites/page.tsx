'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useACS } from '@/lib/useACS';
import { useAuth } from '@/lib/auth';
import Link from 'next/link';

interface Site {
  id: string;
  site_name: string;
  address: string;
}

export default function ACSSitesPage() {
  const { siteCompliance, refresh } = useACS();
  const { companyId } = useAuth();
  const [sites, setSites] = useState<Site[]>([]);
  const [editing, setEditing] = useState<string | null>(null);

  const [form, setForm] = useState({
    assignment_instructions_url: '',
    assignment_instructions_expiry: '',
    sops_current: false,
    risk_assessment_url: '',
    risk_assessment_expiry: '',
    patrol_log_available: false,
    check_call_log_available: false,
    incident_reports_count: 0,
    dob_log_available: false,
    supervisor_audit_date: '',
    client_review_notes: '',
    status: 'compliant',
  });

  useEffect(() => {
    if (!companyId) return;
    supabase.from('sites').select('id, site_name, address').eq('company_id', companyId).then(({ data }) => setSites(data || []));
  }, [companyId]);

  const siteData = sites.map((site) => {
    const compliance = siteCompliance.find((sc) => sc.site_id === site.id);
    return { site, compliance };
  });

  async function saveCompliance(siteId: string) {
    if (!companyId) return;
    const existing = siteCompliance.find((sc) => sc.site_id === siteId);
    if (existing) {
      await supabase.from('acs_site_compliance').update({
        assignment_instructions_url: form.assignment_instructions_url || null,
        assignment_instructions_expiry: form.assignment_instructions_expiry || null,
        sops_current: form.sops_current,
        risk_assessment_url: form.risk_assessment_url || null,
        risk_assessment_expiry: form.risk_assessment_expiry || null,
        patrol_log_available: form.patrol_log_available,
        check_call_log_available: form.check_call_log_available,
        incident_reports_count: form.incident_reports_count,
        dob_log_available: form.dob_log_available,
        supervisor_audit_date: form.supervisor_audit_date || null,
        client_review_notes: form.client_review_notes || null,
        status: form.status,
      }).eq('id', existing.id);
    } else {
      await supabase.from('acs_site_compliance').insert({
        company_id: companyId,
        site_id: siteId,
        assignment_instructions_url: form.assignment_instructions_url || null,
        assignment_instructions_expiry: form.assignment_instructions_expiry || null,
        sops_current: form.sops_current,
        risk_assessment_url: form.risk_assessment_url || null,
        risk_assessment_expiry: form.risk_assessment_expiry || null,
        patrol_log_available: form.patrol_log_available,
        check_call_log_available: form.check_call_log_available,
        incident_reports_count: form.incident_reports_count,
        dob_log_available: form.dob_log_available,
        supervisor_audit_date: form.supervisor_audit_date || null,
        client_review_notes: form.client_review_notes || null,
        status: form.status,
      });
    }
    refresh();
    setEditing(null);
  }

  function startEdit(siteId: string) {
    const compliance = siteCompliance.find((sc) => sc.site_id === siteId);
    setEditing(siteId);
    setForm({
      assignment_instructions_url: compliance?.assignment_instructions_url || '',
      assignment_instructions_expiry: compliance?.assignment_instructions_expiry || '',
      sops_current: compliance?.sops_current || false,
      risk_assessment_url: compliance?.risk_assessment_url || '',
      risk_assessment_expiry: compliance?.risk_assessment_expiry || '',
      patrol_log_available: compliance?.patrol_log_available || false,
      check_call_log_available: compliance?.check_call_log_available || false,
      incident_reports_count: compliance?.incident_reports_count || 0,
      dob_log_available: compliance?.dob_log_available || false,
      supervisor_audit_date: compliance?.supervisor_audit_date || '',
      client_review_notes: compliance?.client_review_notes || '',
      status: compliance?.status || 'compliant',
    });
  }

  function statusColor(status: string | null) {
    if (status === 'compliant') return 'text-emerald-400 bg-emerald-500/10';
    if (status === 'review') return 'text-amber-400 bg-amber-500/10';
    if (status === 'non-compliant') return 'text-red-400 bg-red-500/10';
    return 'text-gray-400 bg-gray-500/10';
  }

  return (
    <div className="space-y-6">
      <div className="bg-[#0f172a]/70 backdrop-blur-sm border border-white/10 rounded-xl overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-white/10">
              <th className="text-left text-gray-400 font-medium px-4 py-3">Site</th>
              <th className="text-left text-gray-400 font-medium px-4 py-3">Assignment Instructions</th>
              <th className="text-left text-gray-400 font-medium px-4 py-3">Risk Assessment</th>
              <th className="text-left text-gray-400 font-medium px-4 py-3">SOPs Current</th>
              <th className="text-left text-gray-400 font-medium px-4 py-3">Patrol / Check Call</th>
              <th className="text-left text-gray-400 font-medium px-4 py-3">Status</th>
              <th className="text-left text-gray-400 font-medium px-4 py-3"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {siteData.map(({ site, compliance }) => {
              const aiExpired = compliance?.assignment_instructions_expiry && new Date(compliance.assignment_instructions_expiry) < new Date();
              const raExpired = compliance?.risk_assessment_expiry && new Date(compliance.risk_assessment_expiry) < new Date();
              return (
                <tr key={site.id} className="hover:bg-white/5 transition-colors">
                  <td className="px-4 py-3">
                    <p className="font-medium text-white">{site.site_name}</p>
                    <p className="text-xs text-gray-500">{site.address}</p>
                  </td>
                  <td className="px-4 py-3">
                    {compliance?.assignment_instructions_url ? (
                      <div>
                        <a href={compliance.assignment_instructions_url} target="_blank" rel="noopener noreferrer" className="text-xs text-blue-400 hover:text-blue-300 cursor-pointer">View doc</a>
                        {compliance.assignment_instructions_expiry && (
                          <p className={`text-xs ${aiExpired ? 'text-red-400' : 'text-gray-500'}`}>Exp: {new Date(compliance.assignment_instructions_expiry).toLocaleDateString('en-GB')}</p>
                        )}
                      </div>
                    ) : <span className="text-xs text-red-400">Missing</span>}
                  </td>
                  <td className="px-4 py-3">
                    {compliance?.risk_assessment_url ? (
                      <div>
                        <a href={compliance.risk_assessment_url} target="_blank" rel="noopener noreferrer" className="text-xs text-blue-400 hover:text-blue-300 cursor-pointer">View doc</a>
                        {compliance.risk_assessment_expiry && (
                          <p className={`text-xs ${raExpired ? 'text-red-400' : 'text-gray-500'}`}>Exp: {new Date(compliance.risk_assessment_expiry).toLocaleDateString('en-GB')}</p>
                        )}
                      </div>
                    ) : <span className="text-xs text-red-400">Missing</span>}
                  </td>
                  <td className="px-4 py-3">
                    <span className={`text-xs ${compliance?.sops_current ? 'text-emerald-400' : 'text-red-400'}`}>
                      {compliance?.sops_current ? 'Yes' : 'No'}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-xs text-gray-300">
                    Patrol: {compliance?.patrol_log_available ? 'Yes' : 'No'} · Check: {compliance?.check_call_log_available ? 'Yes' : 'No'}
                  </td>
                  <td className="px-4 py-3">
                    <span className={`text-xs px-2 py-1 rounded font-medium ${statusColor(compliance?.status || null)}`}>
                      {compliance?.status || 'not set'}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <button onClick={() => startEdit(site.id)} className="text-blue-400 hover:text-blue-300 text-xs cursor-pointer">
                      Edit
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Edit Modal */}
      {editing && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
          <div className="bg-[#0f172a] border border-white/10 rounded-xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-5 border-b border-white/10">
              <h3 className="text-base font-semibold text-white">
                Edit Compliance: {sites.find((s) => s.id === editing)?.site_name}
              </h3>
              <button onClick={() => setEditing(null)} className="text-gray-400 hover:text-white cursor-pointer">
                <div className="w-5 h-5 flex items-center justify-center"><i className="ri-close-line"></i></div>
              </button>
            </div>
            <div className="p-5 space-y-4">
              <div>
                <label className="text-xs text-gray-400 block mb-1">Assignment Instructions URL</label>
                <input value={form.assignment_instructions_url} onChange={(e) => setForm({ ...form, assignment_instructions_url: e.target.value })} className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-amber-500/50" />
              </div>
              <div>
                <label className="text-xs text-gray-400 block mb-1">Assignment Instructions Expiry</label>
                <input type="date" value={form.assignment_instructions_expiry} onChange={(e) => setForm({ ...form, assignment_instructions_expiry: e.target.value })} className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-amber-500/50" />
              </div>
              <div>
                <label className="text-xs text-gray-400 block mb-1">Risk Assessment URL</label>
                <input value={form.risk_assessment_url} onChange={(e) => setForm({ ...form, risk_assessment_url: e.target.value })} className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-amber-500/50" />
              </div>
              <div>
                <label className="text-xs text-gray-400 block mb-1">Risk Assessment Expiry</label>
                <input type="date" value={form.risk_assessment_expiry} onChange={(e) => setForm({ ...form, risk_assessment_expiry: e.target.value })} className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-amber-500/50" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                {[
                  { label: 'SOPs Current', key: 'sops_current' as const },
                  { label: 'Patrol Logs', key: 'patrol_log_available' as const },
                  { label: 'Check Call Logs', key: 'check_call_log_available' as const },
                  { label: 'DOB Log', key: 'dob_log_available' as const },
                ].map((item) => (
                  <label key={item.key} className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={form[item.key]}
                      onChange={(e) => setForm({ ...form, [item.key]: e.target.checked })}
                      className="w-4 h-4 rounded border-white/20 bg-white/5 text-amber-500"
                    />
                    <span className="text-sm text-gray-300">{item.label}</span>
                  </label>
                ))}
              </div>
              <div>
                <label className="text-xs text-gray-400 block mb-1">Incident Reports (count)</label>
                <input type="number" value={form.incident_reports_count} onChange={(e) => setForm({ ...form, incident_reports_count: parseInt(e.target.value) || 0 })} className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-amber-500/50" />
              </div>
              <div>
                <label className="text-xs text-gray-400 block mb-1">Supervisor Audit Date</label>
                <input type="date" value={form.supervisor_audit_date} onChange={(e) => setForm({ ...form, supervisor_audit_date: e.target.value })} className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-amber-500/50" />
              </div>
              <div>
                <label className="text-xs text-gray-400 block mb-1">Status</label>
                <select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })} className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white pr-8 focus:outline-none focus:border-amber-500/50">
                  <option value="compliant">Compliant</option>
                  <option value="review">Review</option>
                  <option value="non-compliant">Non-Compliant</option>
                </select>
              </div>
              <div>
                <label className="text-xs text-gray-400 block mb-1">Client Review Notes</label>
                <textarea value={form.client_review_notes} onChange={(e) => setForm({ ...form, client_review_notes: e.target.value })} rows={3} className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-amber-500/50 resize-none" />
              </div>
            </div>
            <div className="flex items-center justify-end gap-3 p-5 border-t border-white/10">
              <button onClick={() => setEditing(null)} className="px-4 py-2 text-sm text-gray-400 hover:text-white cursor-pointer">Cancel</button>
              <button onClick={() => saveCompliance(editing)} className="px-4 py-2 bg-amber-600 hover:bg-amber-500 text-white text-sm font-medium rounded-lg cursor-pointer whitespace-nowrap">Save</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}