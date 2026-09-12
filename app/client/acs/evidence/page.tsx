'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useACS } from '@/lib/useACS';
import { useAuth } from '@/lib/auth';
import { logEvidenceAccess, logPageAccess } from '@/lib/useEvidenceAuditLog';

const ACS_AREAS = [
  'Strategy',
  'Service Delivery',
  'Commercial Relationship Management',
  'Financial Management',
  'Resource Management',
  'People',
  'Leadership & Governance',
];

const CATEGORIES = ['Policy', 'Procedure', 'Report', 'Audit', 'Training Record', 'Contract', 'Certificate', 'Other'];
const STATUSES = ['current', 'review', 'expired', 'archived'];

export default function ACSEvidencePage() {
  const { evidence, criteria, refresh } = useACS();
  const { currentUser, companyId, profile } = useAuth();
  const [showUpload, setShowUpload] = useState(false);
  const [selectedArea, setSelectedArea] = useState('');
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  useEffect(() => {
    if (companyId && profile?.id) {
      logPageAccess({
        company_id: companyId,
        user_id: profile.id,
        user_role: profile.role || 'client',
        source_route: '/client/acs/evidence',
      });
    }
  }, [companyId, profile?.id, profile?.role]);

  const [form, setForm] = useState({
    title: '',
    acs_area: ACS_AREAS[0],
    acs_criterion: '',
    category: CATEGORIES[0],
    owner: '',
    review_date: '',
    expiry_date: '',
    version: '1.0',
    status: 'current',
    notes: '',
  });

  const filtered = evidence.filter((e) => {
    if (selectedArea && e.acs_area !== selectedArea) return false;
    if (statusFilter && e.status !== statusFilter) return false;
    if (search && !e.title.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  const areaEvidence = ACS_AREAS.map((area) => ({
    area,
    items: evidence.filter((e) => e.acs_area === area),
  }));

  async function handleUpload() {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.pdf,.doc,.docx,.xls,.xlsx,.png,.jpg,.jpeg';
    input.onchange = async () => {
      const file = input.files?.[0];
      if (!file) return;
      const filePath = `${Date.now()}_${file.name}`;
      const { error: uploadError } = await supabase.storage.from('acs-evidence').upload(filePath, file);
      if (uploadError) return;

      const { data: signedData } = await supabase.storage.from('acs-evidence').createSignedUrl(filePath, 60 * 60 * 24 * 7);

      const fileUrl = signedData?.signedUrl || '';

      await supabase.from('acs_evidence').insert({
        company_id: currentUser?.company_id,
        title: form.title || file.name,
        acs_area: form.acs_area,
        acs_criterion: form.acs_criterion,
        category: form.category,
        owner: form.owner,
        file_url: fileUrl,
        file_name: file.name,
        file_type: file.type,
        file_size: file.size,
        review_date: form.review_date || null,
        expiry_date: form.expiry_date || null,
        version: form.version,
        status: form.status,
        notes: form.notes,
        uploaded_by: currentUser?.id,
      });
      refresh();
      setShowUpload(false);
      setForm({ title: '', acs_area: ACS_AREAS[0], acs_criterion: '', category: CATEGORIES[0], owner: '', review_date: '', expiry_date: '', version: '1.0', status: 'current', notes: '' });
    };
    input.click();
  }

  return (
    <div className="space-y-6">
      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <input
            type="text"
            placeholder="Search evidence..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-amber-500/50 w-56"
          />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white pr-8 focus:outline-none focus:border-amber-500/50"
          >
            <option value="">All Status</option>
            {STATUSES.map((s) => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
        </div>
        <button
          onClick={() => setShowUpload(true)}
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-amber-600 hover:bg-amber-500 text-white text-sm font-medium rounded-lg transition-colors cursor-pointer whitespace-nowrap"
        >
          <div className="w-4 h-4 flex items-center justify-center"><i className="ri-upload-cloud-2-line"></i></div>
          Upload Evidence
        </button>
      </div>

      {/* Area Tabs */}
      <div className="flex items-center gap-1 overflow-x-auto pb-1">
        <button
          onClick={() => setSelectedArea('')}
          className={`flex-shrink-0 px-3 py-1.5 rounded-lg text-sm font-medium cursor-pointer whitespace-nowrap ${selectedArea === '' ? 'bg-amber-500/15 text-amber-400' : 'text-gray-400 hover:text-white hover:bg-white/5'}`}
        >
          All ({evidence.length})
        </button>
        {areaEvidence.map((a) => (
          <button
            key={a.area}
            onClick={() => setSelectedArea(a.area)}
            className={`flex-shrink-0 px-3 py-1.5 rounded-lg text-sm font-medium cursor-pointer whitespace-nowrap ${selectedArea === a.area ? 'bg-amber-500/15 text-amber-400' : 'text-gray-400 hover:text-white hover:bg-white/5'}`}
          >
            {a.area} ({a.items.length})
          </button>
        ))}
      </div>

      {/* Evidence Table */}
      <div className="bg-[#0f172a]/70 backdrop-blur-sm border border-white/10 rounded-xl overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-white/10">
              <th className="text-left text-gray-400 font-medium px-4 py-3">Title</th>
              <th className="text-left text-gray-400 font-medium px-4 py-3">Area</th>
              <th className="text-left text-gray-400 font-medium px-4 py-3">Category</th>
              <th className="text-left text-gray-400 font-medium px-4 py-3">Owner</th>
              <th className="text-left text-gray-400 font-medium px-4 py-3">Status</th>
              <th className="text-left text-gray-400 font-medium px-4 py-3">Expiry</th>
              <th className="text-left text-gray-400 font-medium px-4 py-3">File</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-4 py-8 text-center text-gray-500">
                  No evidence files yet. Upload your first document.
                </td>
              </tr>
            ) : (
              filtered.map((e) => (
                <tr key={e.id} className="hover:bg-white/5 transition-colors">
                  <td className="px-4 py-3">
                    <p className="font-medium text-white">{e.title}</p>
                    {e.acs_criterion && <p className="text-xs text-gray-500">{e.acs_criterion}</p>}
                  </td>
                  <td className="px-4 py-3 text-gray-300">{e.acs_area}</td>
                  <td className="px-4 py-3">
                    <span className="text-xs px-2 py-1 rounded bg-white/10 text-gray-300">{e.category}</span>
                  </td>
                  <td className="px-4 py-3 text-gray-300">{e.owner || '-'}</td>
                  <td className="px-4 py-3">
                    <span className={`text-xs px-2 py-1 rounded font-medium ${
                      e.status === 'current' ? 'bg-emerald-500/10 text-emerald-400' :
                      e.status === 'review' ? 'bg-amber-500/10 text-amber-400' :
                      e.status === 'expired' ? 'bg-red-500/10 text-red-400' :
                      'bg-gray-500/10 text-gray-400'
                    }`}>
                      {e.status}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    {e.expiry_date ? (
                      <span className={`text-xs ${new Date(e.expiry_date) < new Date() ? 'text-red-400' : new Date(e.expiry_date) < new Date(Date.now() + 30*24*60*60*1000) ? 'text-amber-400' : 'text-gray-400'}`}>
                        {new Date(e.expiry_date).toLocaleDateString('en-GB')}
                      </span>
                    ) : (
                      <span className="text-xs text-gray-500">-</span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    {e.file_url && (
                      <a href={e.file_url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-blue-400 hover:text-blue-300 text-xs cursor-pointer">
                        <div className="w-3 h-3 flex items-center justify-center"><i className="ri-external-link-line"></i></div>
                        Open
                      </a>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Upload Modal */}
      {showUpload && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
          <div className="bg-[#0f172a] border border-white/10 rounded-xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-5 border-b border-white/10">
              <h3 className="text-base font-semibold text-white">Upload Evidence</h3>
              <button onClick={() => setShowUpload(false)} className="text-gray-400 hover:text-white cursor-pointer">
                <div className="w-5 h-5 flex items-center justify-center"><i className="ri-close-line"></i></div>
              </button>
            </div>
            <div className="p-5 space-y-4">
              <div>
                <label className="text-xs text-gray-400 block mb-1">Title</label>
                <input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-amber-500/50" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-gray-400 block mb-1">ACS Area</label>
                  <select value={form.acs_area} onChange={(e) => setForm({ ...form, acs_area: e.target.value })} className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white pr-8 focus:outline-none focus:border-amber-500/50">
                    {ACS_AREAS.map((a) => (<option key={a} value={a}>{a}</option>))}
                  </select>
                </div>
                <div>
                  <label className="text-xs text-gray-400 block mb-1">Category</label>
                  <select value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white pr-8 focus:outline-none focus:border-amber-500/50">
                    {CATEGORIES.map((c) => (<option key={c} value={c}>{c}</option>))}
                  </select>
                </div>
              </div>
              <div>
                <label className="text-xs text-gray-400 block mb-1">ACS Criterion (optional)</label>
                <select value={form.acs_criterion} onChange={(e) => setForm({ ...form, acs_criterion: e.target.value })} className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white pr-8 focus:outline-none focus:border-amber-500/50">
                  <option value="">None</option>
                  {criteria.map((c) => (
                    <option key={c.id} value={`${c.criterion_code} ${c.criterion_title}`}>{c.criterion_code} - {c.criterion_title}</option>
                  ))}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-gray-400 block mb-1">Owner</label>
                  <input value={form.owner} onChange={(e) => setForm({ ...form, owner: e.target.value })} className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-amber-500/50" />
                </div>
                <div>
                  <label className="text-xs text-gray-400 block mb-1">Version</label>
                  <input value={form.version} onChange={(e) => setForm({ ...form, version: e.target.value })} className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-amber-500/50" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-gray-400 block mb-1">Review Date</label>
                  <input type="date" value={form.review_date} onChange={(e) => setForm({ ...form, review_date: e.target.value })} className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-amber-500/50" />
                </div>
                <div>
                  <label className="text-xs text-gray-400 block mb-1">Expiry Date</label>
                  <input type="date" value={form.expiry_date} onChange={(e) => setForm({ ...form, expiry_date: e.target.value })} className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-amber-500/50" />
                </div>
              </div>
              <div>
                <label className="text-xs text-gray-400 block mb-1">Status</label>
                <select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })} className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white pr-8 focus:outline-none focus:border-amber-500/50">
                  {STATUSES.map((s) => (<option key={s} value={s}>{s}</option>))}
                </select>
              </div>
              <div>
                <label className="text-xs text-gray-400 block mb-1">Notes</label>
                <textarea value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} rows={3} className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-amber-500/50 resize-none" />
              </div>
            </div>
            <div className="flex items-center justify-end gap-3 p-5 border-t border-white/10">
              <button onClick={() => setShowUpload(false)} className="px-4 py-2 text-sm text-gray-400 hover:text-white cursor-pointer">Cancel</button>
              <button onClick={handleUpload} className="px-4 py-2 bg-amber-600 hover:bg-amber-500 text-white text-sm font-medium rounded-lg cursor-pointer whitespace-nowrap">Select File & Upload</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}