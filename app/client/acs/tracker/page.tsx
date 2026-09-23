'use client';

import { useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useACS } from '@/lib/useACS';
import { useAuth } from '@/lib/auth';

const ACS_AREAS = [
  'Strategy',
  'Service Delivery',
  'Commercial Relationship Management',
  'Financial Management',
  'Resource Management',
  'People',
  'Leadership & Governance',
];

const STATUSES = ['not_started', 'in_progress', 'ready', 'needs_action', 'complete'];
const STATUS_LABELS: Record<string, string> = {
  not_started: 'Not Started',
  in_progress: 'In Progress',
  ready: 'Ready',
  needs_action: 'Needs Action',
  complete: 'Complete',
};

const STATUS_COLORS: Record<string, string> = {
  not_started: 'bg-gray-500/10 text-gray-400',
  in_progress: 'bg-blue-500/10 text-blue-400',
  ready: 'bg-emerald-500/10 text-emerald-400',
  needs_action: 'bg-red-500/10 text-red-400',
  complete: 'bg-amber-500/10 text-amber-400',
};

export default function ACSTrackerPage() {
  const { criteria, refresh } = useACS();
  const { currentUser } = useAuth();
  const [showAdd, setShowAdd] = useState(false);
  const [editing, setEditing] = useState<string | null>(null);
  const [selectedArea, setSelectedArea] = useState('');
  const [search, setSearch] = useState('');

  const [form, setForm] = useState({
    acs_area: ACS_AREAS[0],
    criterion_code: '',
    criterion_title: '',
    sub_criterion: '',
    indicator: '',
    status: 'not_started',
    owner: '',
    due_date: '',
    notes: '',
  });

  const filtered = criteria.filter((c) => {
    if (selectedArea && c.acs_area !== selectedArea) return false;
    if (search && !c.criterion_title.toLowerCase().includes(search.toLowerCase()) && !c.criterion_code.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  async function saveCriterion() {
    if (!currentUser?.company_id) return;
    if (editing) {
      await supabase.from('acs_criteria').update({
        acs_area: form.acs_area,
        criterion_code: form.criterion_code,
        criterion_title: form.criterion_title,
        sub_criterion: form.sub_criterion || null,
        indicator: form.indicator || null,
        status: form.status,
        owner: form.owner || null,
        due_date: form.due_date || null,
        notes: form.notes || null,
      }).eq('id', editing);
    } else {
      await supabase.from('acs_criteria').insert({
        company_id: currentUser.company_id,
        acs_area: form.acs_area,
        criterion_code: form.criterion_code,
        criterion_title: form.criterion_title,
        sub_criterion: form.sub_criterion || null,
        indicator: form.indicator || null,
        status: form.status,
        owner: form.owner || null,
        due_date: form.due_date || null,
        notes: form.notes || null,
      });
    }
    refresh();
    setShowAdd(false);
    setEditing(null);
    setForm({ acs_area: ACS_AREAS[0], criterion_code: '', criterion_title: '', sub_criterion: '', indicator: '', status: 'not_started', owner: '', due_date: '', notes: '' });
  }

  function startEdit(c: typeof criteria[0]) {
    setEditing(c.id);
    setForm({
      acs_area: c.acs_area,
      criterion_code: c.criterion_code,
      criterion_title: c.criterion_title,
      sub_criterion: c.sub_criterion || '',
      indicator: c.indicator || '',
      status: c.status,
      owner: c.owner || '',
      due_date: c.due_date || '',
      notes: c.notes || '',
    });
    setShowAdd(true);
  }

  const areaStats = ACS_AREAS.map((area) => {
    const items = criteria.filter((c) => c.acs_area === area);
    const ready = items.filter((c) => c.status === 'ready' || c.status === 'complete').length;
    return { area, total: items.length, ready, pct: items.length > 0 ? Math.round((ready / items.length) * 100) : 0 };
  });

  return (
    <div className="space-y-6">
      {/* Area Progress */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {areaStats.map((a) => (
          <button
            key={a.area}
            onClick={() => setSelectedArea(selectedArea === a.area ? '' : a.area)}
            className={`text-left p-4 rounded-xl border transition-colors cursor-pointer ${
              selectedArea === a.area ? 'border-amber-500/30 bg-amber-500/10' : 'border-white/10 bg-[#0f172a]/70'
            }`}
          >
            <p className="text-sm font-medium text-white">{a.area}</p>
            <div className="flex items-end justify-between mt-2">
              <span className={`text-2xl font-bold ${a.pct >= 80 ? 'text-emerald-400' : a.pct >= 50 ? 'text-amber-400' : 'text-red-400'}`}>{a.pct}%</span>
              <span className="text-xs text-gray-500">{a.ready}/{a.total}</span>
            </div>
            <div className="h-1.5 bg-white/10 rounded-full mt-2 overflow-hidden">
              <div className={`h-full rounded-full ${a.pct >= 80 ? 'bg-emerald-500' : a.pct >= 50 ? 'bg-amber-500' : 'bg-red-500'}`} style={{ width: `${a.pct}%` }}></div>
            </div>
          </button>
        ))}
      </div>

      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <input
            type="text"
            placeholder="Search criteria..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-amber-500/50 w-56"
          />
        </div>
        <button
          onClick={() => { setShowAdd(true); setEditing(null); }}
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-amber-600 hover:bg-amber-500 text-white text-sm font-medium rounded-lg transition-colors cursor-pointer whitespace-nowrap"
        >
          <div className="w-4 h-4 flex items-center justify-center"><i className="ri-add-line"></i></div>
          Add Criterion
        </button>
      </div>

      {/* Criteria Table */}
      <div className="bg-[#0f172a]/70 backdrop-blur-sm border border-white/10 rounded-xl overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-white/10">
              <th className="text-left text-gray-400 font-medium px-4 py-3">Code</th>
              <th className="text-left text-gray-400 font-medium px-4 py-3">Title</th>
              <th className="text-left text-gray-400 font-medium px-4 py-3">Area</th>
              <th className="text-left text-gray-400 font-medium px-4 py-3">Status</th>
              <th className="text-left text-gray-400 font-medium px-4 py-3">Owner</th>
              <th className="text-left text-gray-400 font-medium px-4 py-3">Due Date</th>
              <th className="text-left text-gray-400 font-medium px-4 py-3">Evidence</th>
              <th className="text-left text-gray-400 font-medium px-4 py-3"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {filtered.length === 0 ? (
              <tr><td colSpan={8} className="px-4 py-8 text-center text-gray-500">No criteria yet. Add your first ACS criterion.</td></tr>
            ) : (
              filtered.map((c) => (
                <tr key={c.id} className="hover:bg-white/5 transition-colors">
                  <td className="px-4 py-3 font-mono text-xs text-amber-400">{c.criterion_code}</td>
                  <td className="px-4 py-3">
                    <p className="font-medium text-white">{c.criterion_title}</p>
                    {c.sub_criterion && <p className="text-xs text-gray-500">{c.sub_criterion}</p>}
                  </td>
                  <td className="px-4 py-3 text-gray-300">{c.acs_area}</td>
                  <td className="px-4 py-3">
                    <span className={`text-xs px-2 py-1 rounded font-medium ${STATUS_COLORS[c.status] || STATUS_COLORS.not_started}`}>
                      {STATUS_LABELS[c.status] || c.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-gray-300">{c.owner || '-'}</td>
                  <td className="px-4 py-3">
                    {c.due_date ? (
                      <span className={`text-xs ${new Date(c.due_date) < new Date() ? 'text-red-400' : new Date(c.due_date) < new Date(Date.now() + 14*24*60*60*1000) ? 'text-amber-400' : 'text-gray-400'}`}>
                        {new Date(c.due_date).toLocaleDateString('en-GB')}
                      </span>
                    ) : <span className="text-xs text-gray-500">-</span>}
                  </td>
                  <td className="px-4 py-3">
                    <span className="text-xs text-gray-300">{c.evidence_ids?.length || 0} linked</span>
                  </td>
                  <td className="px-4 py-3">
                    <button onClick={() => startEdit(c)} className="text-blue-400 hover:text-blue-300 text-xs cursor-pointer">Edit</button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Modal */}
      {showAdd && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
          <div className="bg-[#0f172a] border border-white/10 rounded-xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-5 border-b border-white/10">
              <h3 className="text-base font-semibold text-white">{editing ? 'Edit Criterion' : 'Add Criterion'}</h3>
              <button onClick={() => setShowAdd(false)} className="text-gray-400 hover:text-white cursor-pointer">
                <div className="w-5 h-5 flex items-center justify-center"><i className="ri-close-line"></i></div>
              </button>
            </div>
            <div className="p-5 space-y-4">
              <div>
                <label className="text-xs text-gray-400 block mb-1">ACS Area</label>
                <select value={form.acs_area} onChange={(e) => setForm({ ...form, acs_area: e.target.value })} className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white pr-8 focus:outline-none focus:border-amber-500/50">
                  {ACS_AREAS.map((a) => (<option key={a} value={a}>{a}</option>))}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-gray-400 block mb-1">Criterion Code</label>
                  <input value={form.criterion_code} onChange={(e) => setForm({ ...form, criterion_code: e.target.value })} className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-amber-500/50" placeholder="e.g. 1.1" />
                </div>
                <div>
                  <label className="text-xs text-gray-400 block mb-1">Due Date</label>
                  <input type="date" value={form.due_date} onChange={(e) => setForm({ ...form, due_date: e.target.value })} className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-amber-500/50" />
                </div>
              </div>
              <div>
                <label className="text-xs text-gray-400 block mb-1">Criterion Title</label>
                <input value={form.criterion_title} onChange={(e) => setForm({ ...form, criterion_title: e.target.value })} className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-amber-500/50" />
              </div>
              <div>
                <label className="text-xs text-gray-400 block mb-1">Sub-Criterion (optional)</label>
                <input value={form.sub_criterion} onChange={(e) => setForm({ ...form, sub_criterion: e.target.value })} className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-amber-500/50" />
              </div>
              <div>
                <label className="text-xs text-gray-400 block mb-1">Indicator (optional)</label>
                <input value={form.indicator} onChange={(e) => setForm({ ...form, indicator: e.target.value })} className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-amber-500/50" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-gray-400 block mb-1">Status</label>
                  <select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })} className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white pr-8 focus:outline-none focus:border-amber-500/50">
                    {STATUSES.map((s) => (<option key={s} value={s}>{STATUS_LABELS[s]}</option>))}
                  </select>
                </div>
                <div>
                  <label className="text-xs text-gray-400 block mb-1">Owner</label>
                  <input value={form.owner} onChange={(e) => setForm({ ...form, owner: e.target.value })} className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-amber-500/50" />
                </div>
              </div>
              <div>
                <label className="text-xs text-gray-400 block mb-1">Notes</label>
                <textarea value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} rows={3} className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-amber-500/50 resize-none" />
              </div>
            </div>
            <div className="flex items-center justify-end gap-3 p-5 border-t border-white/10">
              <button onClick={() => setShowAdd(false)} className="px-4 py-2 text-sm text-gray-400 hover:text-white cursor-pointer">Cancel</button>
              <button onClick={saveCriterion} className="px-4 py-2 bg-amber-600 hover:bg-amber-500 text-white text-sm font-medium rounded-lg cursor-pointer whitespace-nowrap">Save</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}