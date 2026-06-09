import { useState, useEffect } from 'react';
import type { Guard } from '@/lib/useGuards';
import { SKILL_OPTIONS } from '@/lib/useGuards';

interface GuardForm {
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  sia_licence: string;
  sia_expiry: string;
  hourly_rate: string;
  skills: string[];
  status: string;
}

interface Props {
  editingGuard: Guard | null;
  onSave: (payload: any) => Promise<void>;
  onClose: () => void;
  saving: boolean;
}

export default function GuardModal({ editingGuard, onSave, onClose, saving }: Props) {
  const [form, setForm] = useState<GuardForm>({
    first_name: '',
    last_name: '',
    email: '',
    phone: '',
    sia_licence: '',
    sia_expiry: '',
    hourly_rate: '',
    skills: [],
    status: 'active',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [skillDropdownOpen, setSkillDropdownOpen] = useState(false);
  const [customSkill, setCustomSkill] = useState('');

  useEffect(() => {
    if (editingGuard) {
      setForm({
        first_name: editingGuard.first_name || '',
        last_name: editingGuard.last_name || '',
        email: editingGuard.email || '',
        phone: editingGuard.phone || '',
        sia_licence: editingGuard.sia_licence || '',
        sia_expiry: editingGuard.sia_expiry || '',
        hourly_rate: editingGuard.hourly_rate != null ? String(editingGuard.hourly_rate) : '',
        skills: editingGuard.skills || [],
        status: editingGuard.status || 'active',
      });
    } else {
      setForm({
        first_name: '', last_name: '', email: '', phone: '',
        sia_licence: '', sia_expiry: '', hourly_rate: '', skills: [], status: 'active',
      });
    }
    setErrors({});
  }, [editingGuard]);

  const validate = () => {
    const next: Record<string, string> = {};
    if (!form.first_name.trim()) next.first_name = 'First name is required';
    if (!form.last_name.trim()) next.last_name = 'Last name is required';
    if (!form.email.trim()) {
      next.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
      next.email = 'Enter a valid email address';
    }
    if (!form.phone.trim()) next.phone = 'Phone is required';
    if (!form.sia_licence.trim()) next.sia_licence = 'SIA licence is required';
    else if (!/^\d{4}-\d{4}-\d{4}-\d{4}$/.test(form.sia_licence)) next.sia_licence = 'Format: 1010-2030-4050-6070';
    if (!form.sia_expiry) {
      next.sia_expiry = 'Expiry date is required';
    } else {
      const exp = new Date(form.sia_expiry);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      if (exp < today) next.sia_expiry = 'Date is in the past';
    }
    if (!form.hourly_rate.trim()) next.hourly_rate = 'Hourly rate is required';
    else if (isNaN(parseFloat(form.hourly_rate)) || parseFloat(form.hourly_rate) <= 0) next.hourly_rate = 'Enter a valid amount';
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    await onSave({
      first_name: form.first_name.trim(),
      last_name: form.last_name.trim(),
      email: form.email.trim(),
      phone: form.phone.trim(),
      sia_licence: form.sia_licence.trim(),
      sia_expiry: form.sia_expiry,
      hourly_rate: parseFloat(form.hourly_rate),
      skills: form.skills,
      status: form.status,
    });
  };

  const toggleSkill = (skill: string) => {
    const set = new Set(form.skills);
    if (set.has(skill)) set.delete(skill);
    else set.add(skill);
    setForm({ ...form, skills: Array.from(set) });
  };

  const addCustomSkill = () => {
    const s = customSkill.trim();
    if (!s) return;
    if (!form.skills.includes(s)) {
      setForm({ ...form, skills: [...form.skills, s] });
    }
    setCustomSkill('');
  };

  return (
    <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
      <div className="bg-[#111827] border border-gray-800 rounded-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="px-5 py-4 border-b border-gray-800 flex items-center justify-between sticky top-0 bg-[#111827]">
          <h2 className="text-lg font-semibold text-white">{editingGuard ? 'Edit Guard' : 'Add Guard'}</h2>
          <button onClick={onClose} className="w-8 h-8 flex items-center justify-center text-gray-400 hover:text-white rounded-lg transition-colors cursor-pointer">
            <div className="w-4 h-4 flex items-center justify-center"><i className="ri-close-line"></i></div>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-5">
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1.5">First Name *</label>
              <input
                value={form.first_name}
                onChange={(e) => { setForm({ ...form, first_name: e.target.value }); setErrors({ ...errors, first_name: '' }); }}
                className={`w-full bg-gray-800/60 border rounded-lg px-3 py-2 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 ${errors.first_name ? 'border-red-500/50' : 'border-gray-700'}`}
                placeholder="John"
              />
              {errors.first_name && <p className="text-xs text-red-400 mt-1">{errors.first_name}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1.5">Last Name *</label>
              <input
                value={form.last_name}
                onChange={(e) => { setForm({ ...form, last_name: e.target.value }); setErrors({ ...errors, last_name: '' }); }}
                className={`w-full bg-gray-800/60 border rounded-lg px-3 py-2 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 ${errors.last_name ? 'border-red-500/50' : 'border-gray-700'}`}
                placeholder="Smith"
              />
              {errors.last_name && <p className="text-xs text-red-400 mt-1">{errors.last_name}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1.5">Email *</label>
              <input
                type="email"
                value={form.email}
                onChange={(e) => { setForm({ ...form, email: e.target.value }); setErrors({ ...errors, email: '' }); }}
                className={`w-full bg-gray-800/60 border rounded-lg px-3 py-2 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 ${errors.email ? 'border-red-500/50' : 'border-gray-700'}`}
                placeholder="john@example.com"
              />
              {errors.email && <p className="text-xs text-red-400 mt-1">{errors.email}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1.5">Phone *</label>
              <input
                value={form.phone}
                onChange={(e) => { setForm({ ...form, phone: e.target.value }); setErrors({ ...errors, phone: '' }); }}
                className={`w-full bg-gray-800/60 border rounded-lg px-3 py-2 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 ${errors.phone ? 'border-red-500/50' : 'border-gray-700'}`}
                placeholder="+44 7123 456789"
              />
              {errors.phone && <p className="text-xs text-red-400 mt-1">{errors.phone}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1.5">SIA Licence Number *</label>
              <input
                value={form.sia_licence}
                onChange={(e) => { setForm({ ...form, sia_licence: e.target.value }); setErrors({ ...errors, sia_licence: '' }); }}
                className={`w-full bg-gray-800/60 border rounded-lg px-3 py-2 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 ${errors.sia_licence ? 'border-red-500/50' : 'border-gray-700'}`}
                placeholder="1010-2030-4050-6070"
              />
              {errors.sia_licence && <p className="text-xs text-red-400 mt-1">{errors.sia_licence}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1.5">SIA Expiry Date *</label>
              <input
                type="date"
                value={form.sia_expiry}
                onChange={(e) => { setForm({ ...form, sia_expiry: e.target.value }); setErrors({ ...errors, sia_expiry: '' }); }}
                className={`w-full bg-gray-800/60 border rounded-lg px-3 py-2 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 ${errors.sia_expiry ? 'border-red-500/50' : 'border-gray-700'}`}
              />
              {errors.sia_expiry && <p className="text-xs text-red-400 mt-1">{errors.sia_expiry}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1.5">Hourly Rate (£) *</label>
              <input
                type="number"
                step="0.01"
                value={form.hourly_rate}
                onChange={(e) => { setForm({ ...form, hourly_rate: e.target.value }); setErrors({ ...errors, hourly_rate: '' }); }}
                className={`w-full bg-gray-800/60 border rounded-lg px-3 py-2 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 ${errors.hourly_rate ? 'border-red-500/50' : 'border-gray-700'}`}
                placeholder="15.50"
              />
              {errors.hourly_rate && <p className="text-xs text-red-400 mt-1">{errors.hourly_rate}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1.5">Status</label>
              <select
                value={form.status}
                onChange={(e) => setForm({ ...form, status: e.target.value })}
                className="w-full bg-gray-800/60 border border-gray-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-blue-500 appearance-none pr-8"
              >
                <option value="active">Active</option>
                <option value="suspended">Suspended</option>
                <option value="inactive">Inactive</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Skills</label>
            <div className="flex flex-wrap gap-1.5 mb-2">
              {form.skills.map((skill) => (
                <span key={skill} className="inline-flex items-center gap-1 px-2 py-1 rounded text-xs font-medium bg-blue-500/15 text-blue-400 border border-blue-500/20">
                  {skill}
                  <button type="button" onClick={() => toggleSkill(skill)} className="cursor-pointer">
                    <div className="w-3 h-3 flex items-center justify-center"><i className="ri-close-line text-[10px]"></i></div>
                  </button>
                </span>
              ))}
            </div>
            <div className="flex items-center gap-2">
              <div className="relative flex-1">
                <input
                  type="text"
                  value={customSkill}
                  onChange={(e) => { setCustomSkill(e.target.value); setSkillDropdownOpen(true); }}
                  onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addCustomSkill(); } }}
                  placeholder="Type skill and press Enter..."
                  className="w-full bg-gray-800/60 border border-gray-700 rounded-lg px-3 py-2 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-blue-500"
                />
                {skillDropdownOpen && customSkill && (
                  <div className="absolute z-10 mt-1 w-full bg-[#1f2937] border border-gray-700 rounded-lg shadow-lg max-h-40 overflow-y-auto">
                    {SKILL_OPTIONS.filter((s) => s.toLowerCase().includes(customSkill.toLowerCase()) && !form.skills.includes(s)).map((s) => (
                      <button
                        key={s}
                        type="button"
                        onClick={() => { toggleSkill(s); setCustomSkill(''); setSkillDropdownOpen(false); }}
                        className="w-full text-left px-3 py-2 text-sm text-gray-300 hover:bg-gray-800/50 transition-colors cursor-pointer"
                      >
                        {s}
                      </button>
                    ))}
                    <button
                      type="button"
                      onClick={() => addCustomSkill()}
                      className="w-full text-left px-3 py-2 text-sm text-blue-400 hover:bg-gray-800/50 transition-colors cursor-pointer"
                    >
                      Add "{customSkill}" as custom
                    </button>
                  </div>
                )}
              </div>
              <div className="flex items-center gap-1 flex-wrap">
                {SKILL_OPTIONS.filter((s) => !form.skills.includes(s)).slice(0, 5).map((s) => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => toggleSkill(s)}
                    className="px-2 py-1 rounded text-xs bg-gray-800/60 text-gray-400 border border-gray-700 hover:text-white hover:border-gray-600 transition-colors cursor-pointer whitespace-nowrap"
                  >
                    + {s}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-2 border-t border-gray-800">
            <button type="button" onClick={onClose} className="px-4 py-2 text-sm text-gray-400 hover:text-white transition-colors cursor-pointer whitespace-nowrap">
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="bg-blue-600 hover:bg-blue-500 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors disabled:opacity-50 cursor-pointer whitespace-nowrap inline-flex items-center gap-2"
            >
              {saving && <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>}
              {saving ? 'Saving...' : (editingGuard ? 'Update Guard' : 'Add Guard')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}