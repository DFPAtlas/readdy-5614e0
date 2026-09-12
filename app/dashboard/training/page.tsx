'use client';

import { useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/lib/auth';
import { useTrainingModules, TrainingModule, TrainingCompletion } from '@/lib/useTrainingModules';
import { useExpiryNotifications } from '@/lib/useExpiryNotifications';
import { FeatureGate } from '@/lib/useEntitlements';

type Tab = 'modules' | 'completions' | 'overdue';

const CATEGORIES = ['First Aid', 'Fire Safety', 'Conflict Management', 'Physical Intervention', 'Health & Safety', 'Data Protection', 'Counter Terrorism', 'Customer Service', 'Site Specific', 'Other'];
const CONTENT_TYPES = ['document', 'video', 'quiz', 'external', 'in_person'];

export default function TrainingPage() {
  const { modules, completions, loading, error, refetch } = useTrainingModules();
  const { companyId, profile } = useAuth();
  const { sendExpiryNotifications } = useExpiryNotifications();
  const [activeTab, setActiveTab] = useState<Tab>('modules');
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState<string | null>(null);
  const [search, setSearch] = useState('');

  const [form, setForm] = useState({
    title: '',
    description: '',
    category: CATEGORIES[0],
    content_type: 'document' as string,
    content_url: '',
    duration_minutes: 60,
    pass_score: 75,
    is_mandatory: false,
    mandatory_for_roles: '',
    active: true,
  });

  const [assignForm, setAssignForm] = useState({ module_id: '', guard_ids: [] as string[] });
  const [showAssign, setShowAssign] = useState(false);
  const [guards, setGuards] = useState<any[]>([]);
  const [guardSearch, setGuardSearch] = useState('');

  async function loadGuards() {
    const { data } = await supabase.from('guards').select('id, first_name, last_name').eq('company_id', companyId).eq('status', 'active').order('last_name');
    setGuards(data || []);
  }

  async function saveModule() {
    if (!companyId) return;
    const payload = {
      company_id: companyId,
      title: form.title,
      description: form.description || null,
      category: form.category,
      content_type: form.content_type,
      content_url: form.content_url || null,
      duration_minutes: form.duration_minutes,
      pass_score: form.pass_score,
      is_mandatory: form.is_mandatory,
      mandatory_for_roles: form.mandatory_for_roles ? form.mandatory_for_roles.split(',').map((s) => s.trim()).filter(Boolean) : null,
      active: form.active,
    };

    if (editing) {
      await supabase.from('training_modules').update(payload).eq('id', editing);
    } else {
      await supabase.from('training_modules').insert(payload);
    }
    setShowModal(false);
    setEditing(null);
    refetch();
    setForm({ title: '', description: '', category: CATEGORIES[0], content_type: 'document', content_url: '', duration_minutes: 60, pass_score: 75, is_mandatory: false, mandatory_for_roles: '', active: true });
  }

  function startEdit(mod: TrainingModule) {
    setEditing(mod.id);
    setForm({
      title: mod.title,
      description: mod.description || '',
      category: mod.category || CATEGORIES[0],
      content_type: mod.content_type || 'document',
      content_url: mod.content_url || '',
      duration_minutes: mod.duration_minutes || 60,
      pass_score: mod.pass_score || 75,
      is_mandatory: mod.is_mandatory || false,
      mandatory_for_roles: mod.mandatory_for_roles ? mod.mandatory_for_roles.join(', ') : '',
      active: mod.active !== false,
    });
    setShowModal(true);
  }

  async function assignModule() {
    if (!companyId || assignForm.guard_ids.length === 0) return;
    const inserts = assignForm.guard_ids.map((guard_id) => ({
      module_id: assignForm.module_id,
      guard_id,
      company_id: companyId,
      attempts: 0,
    }));
    await supabase.from('training_completions').insert(inserts);
    setShowAssign(false);
    refetch();
  }

  async function deleteModule(id: string) {
    await supabase.from('training_modules').update({ active: false }).eq('id', id);
    refetch();
  }

  const now = new Date();
  const overdue = completions.filter((c) => c.passed && c.expires_at && new Date(c.expires_at) < now);
  const pending = completions.filter((c) => !c.completed_at);
  const passed = completions.filter((c) => c.passed);
  const totalAssigned = completions.length;

  const filteredModules = modules.filter((m) => {
    if (search && !m.title.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  const filteredCompletions = completions.filter((c) => {
    if (search && !(c.guard_name || '').toLowerCase().includes(search.toLowerCase()) && !(c.module_title || '').toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  return (
    <FeatureGate feature="hasCompliance">
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white">Training Management</h1>
          <p className="text-sm text-gray-500 mt-1">Create training modules, assign to guards, track completion and expiry.</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => sendExpiryNotifications()}
            className="flex items-center gap-2 px-3 py-2 rounded-lg bg-gray-800/60 border border-gray-700 text-sm text-gray-300 hover:text-white hover:bg-gray-700/60 transition-all cursor-pointer whitespace-nowrap"
          >
            <div className="w-4 h-4 flex items-center justify-center">
              <i className="ri-notification-3-line text-sm"></i>
            </div>
            Check Expiries
          </button>
          <button
            onClick={() => { setShowModal(true); setEditing(null); }}
            className="flex items-center gap-2 px-3 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 border border-blue-500 text-sm text-white transition-all cursor-pointer whitespace-nowrap"
          >
            <div className="w-4 h-4 flex items-center justify-center">
              <i className="ri-add-line text-sm"></i>
            </div>
            Create Module
          </button>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <div className="w-8 h-8 border-2 border-blue-500/30 border-t-blue-500 rounded-full animate-spin"></div>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-[#0f172a]/70 backdrop-blur-sm border border-white/10 rounded-xl p-5">
              <div className="flex items-center gap-2 text-gray-400 text-sm mb-2">
                <div className="w-4 h-4 flex items-center justify-center"><i className="ri-book-open-line text-blue-400"></i></div>
                Modules
              </div>
              <div className="text-3xl font-bold text-white">{modules.length}</div>
              <div className="text-xs text-gray-500 mt-1">{modules.filter((m) => m.is_mandatory).length} mandatory</div>
            </div>
            <div className="bg-[#0f172a]/70 backdrop-blur-sm border border-white/10 rounded-xl p-5">
              <div className="flex items-center gap-2 text-gray-400 text-sm mb-2">
                <div className="w-4 h-4 flex items-center justify-center"><i className="ri-user-line text-emerald-400"></i></div>
                Assigned
              </div>
              <div className="text-3xl font-bold text-white">{totalAssigned}</div>
              <div className="text-xs text-gray-500 mt-1">{passed.length} passed</div>
            </div>
            <div className="bg-[#0f172a]/70 backdrop-blur-sm border border-white/10 rounded-xl p-5">
              <div className="flex items-center gap-2 text-gray-400 text-sm mb-2">
                <div className="w-4 h-4 flex items-center justify-center"><i className="ri-hourglass-line text-amber-400"></i></div>
                Pending
              </div>
              <div className={`text-3xl font-bold ${pending.length > 0 ? 'text-amber-400' : 'text-white'}`}>{pending.length}</div>
              <div className="text-xs text-gray-500 mt-1">not yet completed</div>
            </div>
            <div className="bg-[#0f172a]/70 backdrop-blur-sm border border-white/10 rounded-xl p-5">
              <div className="flex items-center gap-2 text-gray-400 text-sm mb-2">
                <div className="w-4 h-4 flex items-center justify-center"><i className="ri-close-circle-line text-red-400"></i></div>
                Overdue
              </div>
              <div className={`text-3xl font-bold ${overdue.length > 0 ? 'text-red-400' : 'text-white'}`}>{overdue.length}</div>
              <div className="text-xs text-gray-500 mt-1">certificates expired</div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {(['modules', 'completions', 'overdue'] as Tab[]).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-all cursor-pointer whitespace-nowrap ${
                  activeTab === tab ? 'bg-blue-500/15 text-blue-400 border border-blue-500/20' : 'text-gray-400 hover:text-white hover:bg-white/5'
                }`}
              >
                {tab === 'modules' ? 'Modules' : tab === 'completions' ? 'Completions' : 'Overdue'}
                {tab === 'overdue' && overdue.length > 0 && (
                  <span className="ml-1.5 px-1.5 py-0.5 text-xs rounded-full bg-red-500/15 text-red-400">{overdue.length}</span>
                )}
              </button>
            ))}
          </div>

          <div className="relative">
            <div className="w-5 h-5 flex items-center justify-center absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">
              <i className="ri-search-line text-sm"></i>
            </div>
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder={activeTab === 'modules' ? 'Search modules...' : 'Search by guard or module...'}
              className="w-full max-w-md bg-gray-800/60 border border-gray-700 rounded-lg pl-10 pr-4 py-2 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-blue-500"
            />
          </div>

          {activeTab === 'modules' && (
            <div className="bg-[#0f172a]/70 backdrop-blur-sm border border-white/10 rounded-xl overflow-hidden">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-white/10">
                    <th className="text-left text-gray-400 font-medium px-4 py-3">Module</th>
                    <th className="text-left text-gray-400 font-medium px-4 py-3">Category</th>
                    <th className="text-left text-gray-400 font-medium px-4 py-3">Type</th>
                    <th className="text-left text-gray-400 font-medium px-4 py-3">Duration</th>
                    <th className="text-left text-gray-400 font-medium px-4 py-3">Mandatory</th>
                    <th className="text-left text-gray-400 font-medium px-4 py-3">Pass Score</th>
                    <th className="text-left text-gray-400 font-medium px-4 py-3">Active</th>
                    <th className="text-left text-gray-400 font-medium px-4 py-3"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {filteredModules.length === 0 ? (
                    <tr><td colSpan={8} className="px-4 py-8 text-center text-gray-500">No training modules yet. Create your first one.</td></tr>
                  ) : filteredModules.map((mod) => (
                    <tr key={mod.id} className="hover:bg-white/5 transition-colors">
                      <td className="px-4 py-3">
                        <p className="font-medium text-white">{mod.title}</p>
                        {mod.description && <p className="text-xs text-gray-500 line-clamp-1">{mod.description}</p>}
                      </td>
                      <td className="px-4 py-3"><span className="text-xs px-2 py-1 rounded bg-white/10 text-gray-300">{mod.category}</span></td>
                      <td className="px-4 py-3 text-xs text-gray-300 capitalize">{mod.content_type}</td>
                      <td className="px-4 py-3 text-xs text-gray-300">{mod.duration_minutes ? `${mod.duration_minutes}min` : '-'}</td>
                      <td className="px-4 py-3">
                        <span className={`text-xs px-2 py-1 rounded font-medium ${mod.is_mandatory ? 'bg-amber-500/10 text-amber-400' : 'bg-gray-500/10 text-gray-400'}`}>
                          {mod.is_mandatory ? 'Yes' : 'No'}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-xs text-gray-300">{mod.pass_score ? `${mod.pass_score}%` : '-'}</td>
                      <td className="px-4 py-3">
                        <span className={`w-2 h-2 rounded-full inline-block ${mod.active ? 'bg-emerald-400' : 'bg-gray-500'}`}></span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1">
                          <button onClick={() => { loadGuards(); setAssignForm({ module_id: mod.id, guard_ids: [] }); setShowAssign(true); }} className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-white/10 text-emerald-400 hover:text-emerald-300 transition-all cursor-pointer" title="Assign">
                            <div className="w-4 h-4 flex items-center justify-center"><i className="ri-user-add-line text-xs"></i></div>
                          </button>
                          <button onClick={() => startEdit(mod)} className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-white/10 text-blue-400 hover:text-blue-300 transition-all cursor-pointer" title="Edit">
                            <div className="w-4 h-4 flex items-center justify-center"><i className="ri-edit-line text-xs"></i></div>
                          </button>
                          <button onClick={() => deleteModule(mod.id)} className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-white/10 text-red-400 hover:text-red-300 transition-all cursor-pointer" title="Deactivate">
                            <div className="w-4 h-4 flex items-center justify-center"><i className="ri-delete-bin-line text-xs"></i></div>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {activeTab === 'completions' && (
            <div className="bg-[#0f172a]/70 backdrop-blur-sm border border-white/10 rounded-xl overflow-hidden">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-white/10">
                    <th className="text-left text-gray-400 font-medium px-4 py-3">Guard</th>
                    <th className="text-left text-gray-400 font-medium px-4 py-3">Module</th>
                    <th className="text-left text-gray-400 font-medium px-4 py-3">Status</th>
                    <th className="text-left text-gray-400 font-medium px-4 py-3">Score</th>
                    <th className="text-left text-gray-400 font-medium px-4 py-3">Attempts</th>
                    <th className="text-left text-gray-400 font-medium px-4 py-3">Completed</th>
                    <th className="text-left text-gray-400 font-medium px-4 py-3">Expires</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {filteredCompletions.length === 0 ? (
                    <tr><td colSpan={7} className="px-4 py-8 text-center text-gray-500">No completions yet. Assign modules to guards to get started.</td></tr>
                  ) : filteredCompletions.map((c) => {
                    const isExpired = c.passed && c.expires_at && new Date(c.expires_at) < now;
                    const isExpiringSoon = c.passed && c.expires_at && new Date(c.expires_at) > now && new Date(c.expires_at) < new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);
                    return (
                      <tr key={c.id} className="hover:bg-white/5 transition-colors">
                        <td className="px-4 py-3 font-medium text-white">{c.guard_name}</td>
                        <td className="px-4 py-3 text-gray-300">{c.module_title}</td>
                        <td className="px-4 py-3">
                          <span className={`text-xs px-2 py-1 rounded font-medium ${
                            c.passed ? (isExpired ? 'bg-red-500/10 text-red-400' : isExpiringSoon ? 'bg-amber-500/10 text-amber-400' : 'bg-emerald-500/10 text-emerald-400') :
                            c.completed_at ? 'bg-red-500/10 text-red-400' : 'bg-blue-500/10 text-blue-400'
                          }`}>
                            {c.passed ? (isExpired ? 'Expired' : isExpiringSoon ? 'Expiring' : 'Passed') : c.completed_at ? 'Failed' : 'Pending'}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-xs text-gray-300">{c.score !== null ? `${c.score}%` : '-'}</td>
                        <td className="px-4 py-3 text-xs text-gray-300">{c.attempts ?? '-'}</td>
                        <td className="px-4 py-3 text-xs text-gray-300">{c.completed_at ? new Date(c.completed_at).toLocaleDateString('en-GB') : '-'}</td>
                        <td className="px-4 py-3 text-xs text-gray-300">{c.expires_at ? new Date(c.expires_at).toLocaleDateString('en-GB') : 'No expiry'}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}

          {activeTab === 'overdue' && (
            <div className="bg-[#0f172a]/70 backdrop-blur-sm border border-white/10 rounded-xl overflow-hidden">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-white/10">
                    <th className="text-left text-gray-400 font-medium px-4 py-3">Guard</th>
                    <th className="text-left text-gray-400 font-medium px-4 py-3">Module</th>
                    <th className="text-left text-gray-400 font-medium px-4 py-3">Score</th>
                    <th className="text-left text-gray-400 font-medium px-4 py-3">Expired</th>
                    <th className="text-left text-gray-400 font-medium px-4 py-3">Days Overdue</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {overdue.length === 0 ? (
                    <tr><td colSpan={5} className="px-4 py-8 text-center text-emerald-400">No overdue training. Everything is up to date.</td></tr>
                  ) : overdue.map((c) => {
                    const daysOverdue = Math.ceil((now.getTime() - new Date(c.expires_at!).getTime()) / (1000 * 60 * 60 * 24));
                    return (
                      <tr key={c.id} className="hover:bg-white/5 transition-colors">
                        <td className="px-4 py-3 font-medium text-white">{c.guard_name}</td>
                        <td className="px-4 py-3 text-gray-300">{c.module_title}</td>
                        <td className="px-4 py-3 text-xs">{c.score !== null ? `${c.score}%` : '-'}</td>
                        <td className="px-4 py-3 text-xs text-red-400">{new Date(c.expires_at!).toLocaleDateString('en-GB')}</td>
                        <td className="px-4 py-3">
                          <span className="text-xs px-2 py-1 rounded font-medium bg-red-500/10 text-red-400">{daysOverdue}d overdue</span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </>
      )}

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
          <div className="bg-[#0f172a] border border-white/10 rounded-xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-5 border-b border-white/10">
              <h3 className="text-base font-semibold text-white">{editing ? 'Edit Module' : 'Create Training Module'}</h3>
              <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-white cursor-pointer">
                <div className="w-5 h-5 flex items-center justify-center"><i className="ri-close-line"></i></div>
              </button>
            </div>
            <div className="p-5 space-y-4">
              <div>
                <label className="text-xs text-gray-400 block mb-1">Title</label>
                <input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-blue-500" />
              </div>
              <div>
                <label className="text-xs text-gray-400 block mb-1">Description</label>
                <textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} rows={3} className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-blue-500 resize-none" maxLength={500} />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-gray-400 block mb-1">Category</label>
                  <select value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white pr-8 focus:outline-none focus:border-blue-500">
                    {CATEGORIES.map((c) => (<option key={c} value={c}>{c}</option>))}
                  </select>
                </div>
                <div>
                  <label className="text-xs text-gray-400 block mb-1">Content Type</label>
                  <select value={form.content_type} onChange={(e) => setForm({ ...form, content_type: e.target.value })} className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white pr-8 focus:outline-none focus:border-blue-500">
                    {CONTENT_TYPES.map((c) => (<option key={c} value={c}>{c.replace('_', ' ')}</option>))}
                  </select>
                </div>
              </div>
              <div>
                <label className="text-xs text-gray-400 block mb-1">Content URL (optional)</label>
                <input value={form.content_url} onChange={(e) => setForm({ ...form, content_url: e.target.value })} className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-blue-500" placeholder="https://..." />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-gray-400 block mb-1">Duration (minutes)</label>
                  <input type="number" value={form.duration_minutes} onChange={(e) => setForm({ ...form, duration_minutes: parseInt(e.target.value) || 0 })} className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-blue-500" />
                </div>
                <div>
                  <label className="text-xs text-gray-400 block mb-1">Pass Score (%)</label>
                  <input type="number" value={form.pass_score} onChange={(e) => setForm({ ...form, pass_score: parseInt(e.target.value) || 0 })} className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-blue-500" />
                </div>
              </div>
              <div className="flex items-center gap-2">
                <input type="checkbox" checked={form.is_mandatory} onChange={(e) => setForm({ ...form, is_mandatory: e.target.checked })} className="w-4 h-4 rounded border-white/20 bg-white/5 text-blue-500" />
                <label className="text-sm text-gray-300">Mandatory Training</label>
              </div>
              {form.is_mandatory && (
                <div>
                  <label className="text-xs text-gray-400 block mb-1">Mandatory For Roles (comma separated)</label>
                  <input value={form.mandatory_for_roles} onChange={(e) => setForm({ ...form, mandatory_for_roles: e.target.value })} className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-blue-500" placeholder="e.g. security_officer, supervisor" />
                </div>
              )}
              <label className="flex items-center gap-2">
                <input type="checkbox" checked={form.active} onChange={(e) => setForm({ ...form, active: e.target.checked })} className="w-4 h-4 rounded border-white/20 bg-white/5 text-blue-500" />
                <span className="text-sm text-gray-300">Active</span>
              </label>
            </div>
            <div className="flex items-center justify-end gap-3 p-5 border-t border-white/10">
              <button onClick={() => setShowModal(false)} className="px-4 py-2 text-sm text-gray-400 hover:text-white cursor-pointer">Cancel</button>
              <button onClick={saveModule} className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white text-sm font-medium rounded-lg cursor-pointer whitespace-nowrap">Save Module</button>
            </div>
          </div>
        </div>
      )}

      {showAssign && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
          <div className="bg-[#0f172a] border border-white/10 rounded-xl w-full max-w-md max-h-[80vh] overflow-y-auto">
            <div className="flex items-center justify-between p-5 border-b border-white/10">
              <h3 className="text-base font-semibold text-white">Assign Module: {modules.find((m) => m.id === assignForm.module_id)?.title}</h3>
              <button onClick={() => setShowAssign(false)} className="text-gray-400 hover:text-white cursor-pointer">
                <div className="w-5 h-5 flex items-center justify-center"><i className="ri-close-line"></i></div>
              </button>
            </div>
            <div className="p-5 space-y-4">
              <div className="relative">
                <div className="w-5 h-5 flex items-center justify-center absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">
                  <i className="ri-search-line text-sm"></i>
                </div>
                <input
                  type="text"
                  value={guardSearch}
                  onChange={(e) => setGuardSearch(e.target.value)}
                  placeholder="Filter guards..."
                  className="w-full bg-white/5 border border-white/10 rounded-lg pl-10 pr-3 py-2 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-blue-500"
                />
              </div>
              <div className="space-y-2 max-h-64 overflow-y-auto">
                {guards.filter((g) => {
                  const name = `${g.first_name || ''} ${g.last_name || ''}`.trim().toLowerCase();
                  return !guardSearch || name.includes(guardSearch.toLowerCase());
                }).map((g) => (
                  <label key={g.id} className="flex items-center gap-3 p-2 hover:bg-white/5 rounded-lg cursor-pointer">
                    <input
                      type="checkbox"
                      checked={assignForm.guard_ids.includes(g.id)}
                      onChange={() => {
                        setAssignForm((prev) => ({
                          ...prev,
                          guard_ids: prev.guard_ids.includes(g.id)
                            ? prev.guard_ids.filter((x) => x !== g.id)
                            : [...prev.guard_ids, g.id],
                        }));
                      }}
                      className="w-4 h-4 rounded border-white/20 bg-white/5 text-blue-500"
                    />
                    <span className="text-sm text-white">{`${g.first_name || ''} ${g.last_name || ''}`.trim() || 'Unknown'}</span>
                  </label>
                ))}
              </div>
            </div>
            <div className="flex items-center justify-between p-5 border-t border-white/10">
              <span className="text-xs text-gray-500">{assignForm.guard_ids.length} guards selected</span>
              <button onClick={assignModule} disabled={assignForm.guard_ids.length === 0} className="px-4 py-2 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white text-sm font-medium rounded-lg cursor-pointer whitespace-nowrap">Assign</button>
            </div>
          </div>
        </div>
      )}
    </div>
    </FeatureGate>
  );
}