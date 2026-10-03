'use client';

import { useState, useEffect, useRef } from 'react';
import type { Guard } from '@/lib/useGuards';
import { SKILL_OPTIONS, getSIAStatus } from '@/lib/useGuards';

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

interface SaveResult {
  success: boolean;
  message?: string;
}

interface Props {
  fullPage?: boolean;
  editingGuard: Guard | null;
  onSave: (payload: any) => Promise<SaveResult>;
  onClose: () => void;
}

function normalizeSIA(value: string): string {
  const digits = value.replace(/\D/g, '');
  return digits.replace(/(\d{4})(?=\d)/g, '$1-');
}

export default function GuardModal({ editingGuard, onSave, onClose, fullPage = false }: Props) {
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
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [dirty, setDirty] = useState(false);
  const [dirtyWarning, setDirtyWarning] = useState(false);
  const [skillDropdownOpen, setSkillDropdownOpen] = useState(false);
  const [customSkill, setCustomSkill] = useState('');

  const modalRef = useRef<HTMLDivElement>(null);
  const firstFieldRef = useRef<HTMLInputElement>(null);
  const previousFocusRef = useRef<HTMLElement | null>(null);
  const dirtyRef = useRef(false);
  const onCloseRef = useRef(onClose);

  useEffect(() => {
    dirtyRef.current = dirty;
  }, [dirty]);

  useEffect(() => {
    onCloseRef.current = onClose;
  }, [onClose]);

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
    setSubmitError(null);
    setDirty(false);
    setDirtyWarning(false);
    setCustomSkill('');
    setSkillDropdownOpen(false);
  }, [editingGuard]);

  useEffect(() => {
    if (fullPage) return;
    previousFocusRef.current = document.activeElement as HTMLElement | null;
    firstFieldRef.current?.focus();

    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        if (dirtyRef.current) setDirtyWarning(true);
        else onCloseRef.current();
        return;
      }
      if (e.key !== 'Tab') return;
      const container = modalRef.current;
      if (!container) return;
      const focusable = Array.from(
        container.querySelectorAll<HTMLElement>(
          'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        )
      ).filter((el) => el.offsetParent !== null);
      if (focusable.length === 0) return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    };

    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('keydown', onKey);
      previousFocusRef.current?.focus?.();
    };
  }, []);

  const update = (field: keyof GuardForm, value: any) => {
    setForm((f) => ({ ...f, [field]: value }));
    setDirty(true);
    setDirtyWarning(false);
    setErrors((prev) => {
      if (!prev[field]) return prev;
      const n = { ...prev };
      delete n[field];
      return n;
    });
  };

  const validate = () => {
    const next: Record<string, string> = {};
    if (!form.first_name.trim()) next.first_name = 'First name is required';
    if (!form.last_name.trim()) next.last_name = 'Last name is required';
    if (!form.email.trim()) {
      next.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
      next.email = 'Enter a valid email address';
    }
    const phoneDigits = form.phone.replace(/\D/g, '');
    if (!form.phone.trim()) next.phone = 'Phone number is required';
    else if (phoneDigits.length < 7 || phoneDigits.length > 15) next.phone = 'Enter a valid phone number';

    const siaDigits = form.sia_licence.replace(/\D/g, '');
    if (!form.sia_licence.trim()) next.sia_licence = 'SIA licence number is required';
    else if (siaDigits.length !== 16) next.sia_licence = 'SIA licence must be 16 digits';

    if (!form.sia_expiry) next.sia_expiry = 'Expiry date is required';

    const rate = parseFloat(form.hourly_rate);
    if (!form.hourly_rate.trim()) next.hourly_rate = 'Hourly rate is required';
    else if (isNaN(rate) || rate <= 0) next.hourly_rate = 'Enter a valid amount';
    else if (rate > 5000) next.hourly_rate = 'Rate seems too high';

    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (submitting) return;
    if (!validate()) return;
    setSubmitError(null);
    setSubmitting(true);
    const res = await onSave({
      first_name: form.first_name.trim(),
      last_name: form.last_name.trim(),
      email: form.email.trim(),
      phone: form.phone.trim(),
      sia_licence: normalizeSIA(form.sia_licence),
      sia_expiry: form.sia_expiry,
      hourly_rate: parseFloat(form.hourly_rate),
      skills: form.skills,
      status: form.status,
    });
    if (!res.success) {
      setSubmitError(res.message || 'Failed to save guard');
      setSubmitting(false);
    }
  };

  const closeModal = () => {
    if (dirtyRef.current) {
      setDirtyWarning(true);
      return;
    }
    onClose();
  };

  const toggleSkill = (skill: string) => {
    const set = new Set(form.skills);
    if (set.has(skill)) set.delete(skill);
    else set.add(skill);
    setForm({ ...form, skills: Array.from(set) });
    setDirty(true);
    setDirtyWarning(false);
  };

  const addCustomSkill = () => {
    const s = customSkill.trim();
    if (!s) return;
    if (!form.skills.includes(s)) {
      setForm({ ...form, skills: [...form.skills, s] });
      setDirty(true);
      setDirtyWarning(false);
    }
    setCustomSkill('');
    setSkillDropdownOpen(false);
  };

  const editingExpired = editingGuard ? getSIAStatus(editingGuard.sia_expiry) === 'expired' : false;
  const enteredExpiryInPast = form.sia_expiry ? new Date(form.sia_expiry) < new Date(new Date().setHours(0, 0, 0, 0)) : false;
  const changingActiveStatus =
    editingGuard &&
    (editingGuard.status || 'active').toLowerCase() === 'active' &&
    (form.status === 'suspended' || form.status === 'inactive');

  return (
    <div
      className={fullPage ? "max-w-4xl mx-auto" : "fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4"}
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) closeModal();
      }}
    >
      <div
        ref={modalRef}
        role={fullPage ? undefined : "dialog"}
        aria-modal={fullPage ? undefined : true}
        aria-label={editingGuard ? 'Edit guard' : 'Add guard'}
        className={`bg-[#111827] border border-gray-800 rounded-xl w-full ${fullPage ? "" : "max-w-2xl max-h-[90vh] overflow-y-auto"}`}
      >
        <div className="px-5 py-4 border-b border-gray-800 flex items-center justify-between sticky top-0 bg-[#111827] z-10">
          <h2 className="text-lg font-semibold text-white">{editingGuard ? 'Edit Guard' : 'Add Guard'}</h2>
          <button
            onClick={closeModal}
            aria-label="Close"
            className="w-8 h-8 flex items-center justify-center text-gray-400 hover:text-white rounded-lg transition-colors cursor-pointer"
          >
            <div className="w-4 h-4 flex items-center justify-center"><i className="ri-close-line"></i></div>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-5" noValidate>
          {editingExpired && (
            <div className="bg-red-500/10 border border-red-500/20 text-red-300 text-sm px-4 py-3 rounded-lg flex items-start gap-2.5">
              <div className="w-4 h-4 flex items-center justify-center flex-shrink-0 mt-0.5"><i className="ri-alert-line"></i></div>
              <span>This guard&apos;s SIA licence is expired. You can still correct unrelated profile details.</span>
            </div>
          )}

          {submitError && (
            <div className="bg-red-500/10 border border-red-500/20 text-red-300 text-sm px-4 py-3 rounded-lg flex items-start gap-2.5" role="alert">
              <div className="w-4 h-4 flex items-center justify-center flex-shrink-0 mt-0.5"><i className="ri-error-warning-line"></i></div>
              <span>{submitError}</span>
            </div>
          )}

          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1.5">First Name *</label>
              <input
                ref={firstFieldRef}
                value={form.first_name}
                onChange={(e) => update('first_name', e.target.value)}
                className={`w-full bg-gray-800/60 border rounded-lg px-3 py-2 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 ${errors.first_name ? 'border-red-500/50' : 'border-gray-700'}`}
                placeholder="John"
              />
              {errors.first_name && <p className="text-xs text-red-400 mt-1">{errors.first_name}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1.5">Last Name *</label>
              <input
                value={form.last_name}
                onChange={(e) => update('last_name', e.target.value)}
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
                onChange={(e) => update('email', e.target.value)}
                className={`w-full bg-gray-800/60 border rounded-lg px-3 py-2 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 ${errors.email ? 'border-red-500/50' : 'border-gray-700'}`}
                placeholder="john@example.com"
              />
              {errors.email && <p className="text-xs text-red-400 mt-1">{errors.email}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1.5">Phone *</label>
              <input
                value={form.phone}
                onChange={(e) => update('phone', e.target.value)}
                className={`w-full bg-gray-800/60 border rounded-lg px-3 py-2 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 ${errors.phone ? 'border-red-500/50' : 'border-gray-700'}`}
                placeholder="+44 7123 456789"
              />
              {errors.phone && <p className="text-xs text-red-400 mt-1">{errors.phone}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1.5">SIA Licence Number *</label>
              <input
                value={form.sia_licence}
                onChange={(e) => update('sia_licence', e.target.value)}
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
                onChange={(e) => update('sia_expiry', e.target.value)}
                className={`w-full bg-gray-800/60 border rounded-lg px-3 py-2 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 ${errors.sia_expiry ? 'border-red-500/50' : 'border-gray-700'}`}
              />
              {errors.sia_expiry && <p className="text-xs text-red-400 mt-1">{errors.sia_expiry}</p>}
              {enteredExpiryInPast && (
                <p className="text-xs text-amber-400 mt-1">This date is in the past — the licence is expired.</p>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1.5">Hourly Rate (£) *</label>
              <input
                type="number"
                step="0.01"
                min="0.01"
                value={form.hourly_rate}
                onChange={(e) => update('hourly_rate', e.target.value)}
                className={`w-full bg-gray-800/60 border rounded-lg px-3 py-2 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 ${errors.hourly_rate ? 'border-red-500/50' : 'border-gray-700'}`}
                placeholder="15.50"
              />
              {errors.hourly_rate && <p className="text-xs text-red-400 mt-1">{errors.hourly_rate}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1.5">Status</label>
              <select
                value={form.status}
                onChange={(e) => update('status', e.target.value)}
                className="w-full bg-gray-800/60 border border-gray-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-blue-500 appearance-none pr-8"
              >
                <option value="active">Active</option>
                <option value="suspended">Suspended</option>
                <option value="inactive">Inactive</option>
              </select>
              {changingActiveStatus && (
                <p className="text-xs text-amber-400 mt-1">You are changing an active guard to {form.status}. This may affect scheduled shifts.</p>
              )}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Skills</label>
            <div className="flex flex-wrap gap-1.5 mb-2">
              {form.skills.map((skill) => (
                <span key={skill} className="inline-flex items-center gap-1 px-2 py-1 rounded text-xs font-medium bg-blue-500/15 text-blue-400 border border-blue-500/20">
                  {skill}
                  <button type="button" onClick={() => toggleSkill(skill)} aria-label={`Remove ${skill}`} className="cursor-pointer">
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

          {dirtyWarning && (
            <p className="text-xs text-amber-400" role="alert">You have unsaved changes. Click Cancel to discard them.</p>
          )}

          <div className="flex justify-end gap-3 pt-2 border-t border-gray-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm text-gray-400 hover:text-white transition-colors cursor-pointer whitespace-nowrap"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="bg-blue-600 hover:bg-blue-500 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors disabled:opacity-50 cursor-pointer whitespace-nowrap inline-flex items-center gap-2"
            >
              {submitting && <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>}
              {submitting ? 'Saving...' : (editingGuard ? 'Update Guard' : 'Add Guard')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}