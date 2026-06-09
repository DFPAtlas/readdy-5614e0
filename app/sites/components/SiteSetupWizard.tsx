'use client';

import { useState, useEffect, useMemo } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/lib/auth';
import { BUILT_IN_PATTERNS, type ShiftPatternTemplate, type PatternSlot } from '@/lib/useShiftPatternTemplates';
import { SOP_TYPES } from '@/lib/sopTypes';
import type { Site } from '@/lib/useSites';
import type { BuiltSOP } from '@/lib/useBuiltSOPs';

const riskOptions = [
  { value: 'low', label: 'Low', color: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' },
  { value: 'medium', label: 'Medium', color: 'bg-amber-500/10 text-amber-400 border-amber-500/20' },
  { value: 'high', label: 'High', color: 'bg-orange-500/10 text-orange-400 border-orange-500/20' },
  { value: 'critical', label: 'Critical', color: 'bg-red-500/10 text-red-400 border-red-500/20' },
];

const dayNames = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

const SKILL_OPTIONS = [
  'CCTV', 'Door Supervision', 'Close Protection', 'Public Space Surveillance',
  'Vehicle Immobilisation', 'First Aid', 'Conflict Management',
  'Search & Frisk', 'Manned Guarding', 'Mobile Patrol',
];

interface ShiftPattern {
  day_of_week: number;
  shift_type: 'day' | 'night' | '24h';
  start_time: string;
  end_time: string;
  guards_required: number;
}

interface Guard {
  id: string;
  first_name: string | null;
  last_name: string | null;
}

interface Props {
  editingSite: Site | null;
  onSave: (payload: any, patterns: ShiftPattern[], requirements: any, sopLinkIds: string[], sopTypesToCreate: string[]) => Promise<void>;
  onClose: () => void;
  saving: boolean;
}

function shiftTypeDefaults(type: 'day' | 'night' | '24h') {
  if (type === 'day') return { start: '08:00', end: '20:00' };
  if (type === 'night') return { start: '20:00', end: '08:00' };
  return { start: '00:00', end: '23:59' };
}

function slotsToPatterns(slots: PatternSlot[]): ShiftPattern[] {
  return slots.map((s) => {
    const defaults = shiftTypeDefaults(s.shift_type as 'day' | 'night' | '24h');
    return {
      day_of_week: s.day_offset % 7,
      shift_type: (s.shift_type as 'day' | 'night' | '24h') || 'day',
      start_time: s.start_time || defaults.start,
      end_time: s.end_time || defaults.end,
      guards_required: s.guards_required || 1,
    };
  }).filter((p, i, arr) => arr.findIndex((x) => x.day_of_week === p.day_of_week) === i || true);
}

function applyTemplateToPatterns(template: ShiftPatternTemplate): ShiftPattern[] {
  const base = (template.slots || []).map((s) => ({
    day_of_week: s.day_offset % 7,
    shift_type: (s.shift_type as 'day' | 'night' | '24h') || 'day',
    start_time: s.start_time,
    end_time: s.end_time,
    guards_required: s.guards_required || 1,
  }));
  const byDay: Record<number, ShiftPattern[]> = {};
  base.forEach((p) => {
    byDay[p.day_of_week] = byDay[p.day_of_week] || [];
    byDay[p.day_of_week].push(p);
  });
  const result: ShiftPattern[] = [];
  for (let d = 0; d < 7; d++) {
    if (byDay[d]) result.push(...byDay[d]);
  }
  return result.length > 0 ? result : dayNames.map((_, i) => ({
    day_of_week: i, shift_type: 'day' as const, start_time: '08:00', end_time: '20:00', guards_required: 1,
  }));
}

function guardName(g: Guard) {
  return `${g.first_name || ''} ${g.last_name || ''}`.trim() || 'Unnamed';
}

export default function SiteSetupWizard({ editingSite, onSave, onClose, saving }: Props) {
  const { companyId } = useAuth();
  const safeEditingSite = editingSite && typeof editingSite === 'object' && 'site_name' in editingSite ? editingSite : null;
  const [step, setStep] = useState(1);
  const [form, setForm] = useState({
    site_name: '',
    client_name: '',
    address: '',
    latitude: '',
    longitude: '',
    risk_level: 'medium',
    check_call_interval: 60,
    client_logo_url: '',
    client_contact_email: '',
    client_contact_name: '',
    site_contact_phone: '',
    assignment_instructions: '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const [patterns, setPatterns] = useState<ShiftPattern[]>(
    dayNames.map((_, i) => ({
      day_of_week: i,
      shift_type: 'day',
      start_time: '08:00',
      end_time: '20:00',
      guards_required: 1,
    }))
  );
  const [batchShiftType, setBatchShiftType] = useState<'day' | 'night' | '24h'>('day');
  const [batchGuards, setBatchGuards] = useState(1);
  const [copyToAll, setCopyToAll] = useState(true);

  const [requiredSkills, setRequiredSkills] = useState<string[]>([]);
  const [preferredGuardIds, setPreferredGuardIds] = useState<string[]>([]);
  const [bannedGuardIds, setBannedGuardIds] = useState<string[]>([]);
  const [guards, setGuards] = useState<Guard[]>([]);
  const [customSkill, setCustomSkill] = useState('');

  const [savedTemplates, setSavedTemplates] = useState<ShiftPatternTemplate[]>([]);
  const [templateMenuOpen, setTemplateMenuOpen] = useState(false);

  const [existingSOPs, setExistingSOPs] = useState<BuiltSOP[]>([]);
  const [linkedSOPIds, setLinkedSOPIds] = useState<string[]>([]);
  const [sopTypesToCreate, setSopTypesToCreate] = useState<string[]>([]);

  // Load data
  useEffect(() => {
    if (!companyId) return;
    supabase.from('shift_pattern_templates').select('*').eq('company_id', companyId).order('name').then(({ data }) => {
      setSavedTemplates((data || []).filter((d: any) => d && typeof d === 'object'));
    });
    supabase.from('guards').select('id, first_name, last_name').eq('company_id', companyId).eq('status', 'active').order('last_name').then(({ data }) => {
      setGuards(data || []);
    });
    supabase.from('built_sops').select('id, title, sop_type, status').eq('company_id', companyId).eq('is_active', true).order('title').then(({ data }) => {
      setExistingSOPs(data || []);
    });
  }, [companyId]);

  // Load existing site data when editing
  useEffect(() => {
    if (!safeEditingSite || !companyId) {
      setForm({
        site_name: '', client_name: '', address: '', latitude: '', longitude: '',
        risk_level: 'medium', check_call_interval: 60, client_logo_url: '',
        client_contact_email: '', client_contact_name: '', site_contact_phone: '',
        assignment_instructions: '',
      });
      setPatterns(dayNames.map((_, i) => ({
        day_of_week: i, shift_type: 'day', start_time: '08:00', end_time: '20:00', guards_required: 1,
      })));
      setRequiredSkills([]);
      setPreferredGuardIds([]);
      setBannedGuardIds([]);
      setLinkedSOPIds([]);
      setSopTypesToCreate([]);
      setStep(1);
      setErrors({});
      return;
    }
    setForm({
      site_name: safeEditingSite?.site_name || '',
      client_name: safeEditingSite?.client_name || '',
      address: safeEditingSite?.address || '',
      latitude: safeEditingSite?.latitude != null ? String(safeEditingSite.latitude) : '',
      longitude: safeEditingSite?.longitude != null ? String(safeEditingSite.longitude) : '',
      risk_level: safeEditingSite?.risk_level || 'medium',
      check_call_interval: safeEditingSite?.check_call_interval || 60,
      client_logo_url: (safeEditingSite as any)?.client_logo_url || '',
      client_contact_email: (safeEditingSite as any)?.client_contact_email || '',
      client_contact_name: (safeEditingSite as any)?.client_contact_name || '',
      site_contact_phone: (safeEditingSite as any)?.site_contact_phone || '',
      assignment_instructions: (safeEditingSite as any)?.assignment_instructions || '',
    });
    supabase.from('site_shift_patterns').select('*').eq('site_id', safeEditingSite?.id).eq('company_id', companyId).order('day_of_week').then(({ data }) => {
      if (data && data.length > 0) {
        setPatterns(data.map((d: any) => ({
          day_of_week: d.day_of_week,
          shift_type: d.shift_type as 'day' | 'night' | '24h',
          start_time: d.start_time?.slice?.(0, 5) || '00:00',
          end_time: d.end_time?.slice?.(0, 5) || '00:00',
          guards_required: d.guards_required ?? 1,
        })));
      }
    });
    supabase.from('sites').select('required_skills, preferred_guard_ids, banned_guard_ids').eq('id', safeEditingSite?.id).eq('company_id', companyId).maybeSingle().then(({ data }) => {
      if (data) {
        setRequiredSkills(data.required_skills || []);
        setPreferredGuardIds(data.preferred_guard_ids || []);
        setBannedGuardIds(data.banned_guard_ids || []);
      }
    });
    supabase.from('built_sops').select('id').eq('company_id', companyId).eq('site_id', safeEditingSite?.id).eq('is_active', true).then(({ data }) => {
      if (data) setLinkedSOPIds(data.map((d: any) => d.id));
    });
    setStep(1);
  }, [safeEditingSite, companyId]);

  const allTemplates = useMemo(() => {
    const builtIn = BUILT_IN_PATTERNS.map((p, i) => ({ ...p, id: `builtin-${i}`, company_id: null, created_at: '', updated_at: '' } as ShiftPatternTemplate));
    return [...builtIn, ...savedTemplates];
  }, [savedTemplates]);

  const validateStep = (s: number) => {
    const next: Record<string, string> = {};
    if (s === 1) {
      if (!form.site_name.trim()) next.site_name = 'Site name is required';
      if (!form.address.trim()) next.address = 'Address is required';
    }
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const goNext = () => {
    if (!validateStep(step)) return;
    setStep((v) => Math.min(v + 1, 5));
  };

  const goBack = () => setStep((v) => Math.max(v - 1, 1));

  const goToStep = (s: number) => {
    if (s < step || validateStep(step)) setStep(s);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateStep(step)) return;
    const payload = {
      site_name: form.site_name.trim(),
      client_name: form.client_name.trim() || null,
      address: form.address.trim() || null,
      latitude: form.latitude ? parseFloat(form.latitude) : null,
      longitude: form.longitude ? parseFloat(form.longitude) : null,
      risk_level: form.risk_level,
      check_call_interval: form.check_call_interval,
      client_logo_url: form.client_logo_url.trim() || null,
      client_contact_email: form.client_contact_email.trim() || null,
      client_contact_name: form.client_contact_name.trim() || null,
      site_contact_phone: form.site_contact_phone.trim() || null,
      assignment_instructions: form.assignment_instructions.trim() || null,
      required_skills: requiredSkills.length > 0 ? requiredSkills : null,
      preferred_guard_ids: preferredGuardIds.length > 0 ? preferredGuardIds : null,
      banned_guard_ids: bannedGuardIds.length > 0 ? bannedGuardIds : null,
    };
    await onSave(payload, patterns, { requiredSkills, preferredGuardIds, bannedGuardIds }, linkedSOPIds, sopTypesToCreate);
  };

  const updatePattern = (index: number, patch: Partial<ShiftPattern>) => {
    setPatterns((prev) => prev.map((p, i) => (i === index ? { ...p, ...patch } : p)));
  };

  const addSlot = (dayIndex: number) => {
    setPatterns((prev) => [...prev, {
      day_of_week: dayIndex,
      shift_type: 'day',
      start_time: '08:00',
      end_time: '20:00',
      guards_required: 1,
    }]);
  };

  const removeSlot = (patternIndex: number) => {
    setPatterns((prev) => prev.filter((_, i) => i !== patternIndex));
  };

  const applyBatch = () => {
    const newPatterns: ShiftPattern[] = [];
    for (let i = 0; i < 7; i++) {
      if (!copyToAll && i >= 5) continue;
      const defaults = shiftTypeDefaults(batchShiftType);
      newPatterns.push({
        day_of_week: i,
        shift_type: batchShiftType,
        guards_required: batchGuards,
        start_time: defaults.start,
        end_time: defaults.end,
      });
    }
    setPatterns(newPatterns);
  };

  const applyTemplate = (template: ShiftPatternTemplate) => {
    setPatterns(applyTemplateToPatterns(template));
    setTemplateMenuOpen(false);
  };

  const activeRisk = riskOptions.find((r) => r.value === form.risk_level) || riskOptions[1];

  const totalWeeklyGuards = patterns.reduce((sum, p) => sum + p.guards_required, 0);
  const totalWeeklyHours = patterns.reduce((sum, p) => {
    const [sh, sm] = p.start_time.split(':').map(Number);
    const [eh, em] = p.end_time.split(':').map(Number);
    let hrs = eh - sh;
    let mins = em - sm;
    if (mins < 0) { hrs -= 1; mins += 60; }
    if (hrs < 0) hrs += 24;
    return sum + (hrs + mins / 60) * p.guards_required;
  }, 0);

  const patternsByDay = dayNames.map((_, i) => patterns.filter((p) => p.day_of_week === i));
  const coveredDays = patternsByDay.filter((list) => list.some((p) => p.guards_required > 0)).length;

  const availableGuards = useMemo(() => guards.filter((g) => !bannedGuardIds.includes(g.id)), [guards, bannedGuardIds]);

  const toggleSkill = (skill: string) => {
    setRequiredSkills((prev) => prev.includes(skill) ? prev.filter((s) => s !== skill) : [...prev, skill]);
  };

  const togglePreferred = (guardId: string) => {
    setPreferredGuardIds((prev) => prev.includes(guardId) ? prev.filter((id) => id !== guardId) : [...prev, guardId]);
  };

  const toggleBanned = (guardId: string) => {
    setBannedGuardIds((prev) => prev.includes(guardId) ? prev.filter((id) => id !== guardId) : [...prev, guardId]);
    setPreferredGuardIds((prev) => prev.filter((id) => id !== guardId));
  };

  const toggleLinkedSOP = (id: string) => {
    setLinkedSOPIds((prev) => prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]);
  };

  const toggleSOPType = (type: string) => {
    setSopTypesToCreate((prev) => prev.includes(type) ? prev.filter((t) => t !== type) : [...prev, type]);
  };

  const stepLabels = ['Site Info', 'Cover Plan', 'Guard Requirements', 'SOP Setup', 'Review'];

  return (
    <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
      <div className="bg-[#111827] border border-gray-800 rounded-xl w-full max-w-3xl max-h-[92vh] overflow-y-auto">
        {/* Header */}
        <div className="px-5 py-4 border-b border-gray-800 flex items-center justify-between sticky top-0 bg-[#111827] z-10">
          <div>
            <h2 className="text-lg font-semibold text-white">
              {editingSite ? 'Edit Site' : 'New Site Setup'}
            </h2>
            <div className="flex items-center gap-1.5 mt-2">
              {stepLabels.map((label, i) => {
                const s = i + 1;
                const active = s === step;
                const done = s < step;
                return (
                  <button
                    key={s}
                    onClick={() => goToStep(s)}
                    className={`flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium transition-colors cursor-pointer whitespace-nowrap ${
                      active ? 'bg-blue-500/20 text-blue-400' :
                      done ? 'bg-emerald-500/15 text-emerald-400' :
                      'bg-gray-800 text-gray-500'
                    }`}
                  >
                    <span className={`w-4 h-4 rounded-full flex items-center justify-center text-[10px] ${done ? 'bg-emerald-500/30' : active ? 'bg-blue-500/30' : 'bg-gray-700'}`}>
                      {done ? <i className="ri-check-line" /> : s}
                    </span>
                    {label}
                  </button>
                );
              })}
            </div>
          </div>
          <button onClick={onClose} className="w-8 h-8 flex items-center justify-center text-gray-400 hover:text-white rounded-lg transition-colors cursor-pointer">
            <div className="w-4 h-4 flex items-center justify-center"><i className="ri-close-line"></i></div>
          </button>
        </div>

        {/* ===== STEP 1: Site Info ===== */}
        {step === 1 && (
          <div className="p-5 space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1.5">Site Name *</label>
              <input
                value={form.site_name}
                onChange={(e) => { setForm({ ...form, site_name: e.target.value }); setErrors((prev) => ({ ...prev, site_name: '' })); }}
                className={`w-full bg-gray-800/60 border rounded-lg px-3 py-2 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 ${errors.site_name ? 'border-red-500/50' : 'border-gray-700'}`}
                placeholder="e.g. City Centre Mall"
              />
              {errors.site_name && <p className="text-xs text-red-400 mt-1">{errors.site_name}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1.5">Client Name</label>
              <input
                value={form.client_name}
                onChange={(e) => setForm({ ...form, client_name: e.target.value })}
                className="w-full bg-gray-800/60 border border-gray-700 rounded-lg px-3 py-2 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-blue-500"
                placeholder="e.g. ABC Properties Ltd"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1.5">Client Contact Name</label>
                <input
                  value={form.client_contact_name}
                  onChange={(e) => setForm({ ...form, client_contact_name: e.target.value })}
                  className="w-full bg-gray-800/60 border border-gray-700 rounded-lg px-3 py-2 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-blue-500"
                  placeholder="Sarah Johnson"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1.5">Client Contact Email</label>
                <input
                  type="email"
                  value={form.client_contact_email}
                  onChange={(e) => setForm({ ...form, client_contact_email: e.target.value })}
                  className="w-full bg-gray-800/60 border border-gray-700 rounded-lg px-3 py-2 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-blue-500"
                  placeholder="sarah@example.com"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1.5">Site Contact Phone</label>
                <input
                  value={form.site_contact_phone}
                  onChange={(e) => setForm({ ...form, site_contact_phone: e.target.value })}
                  className="w-full bg-gray-800/60 border border-gray-700 rounded-lg px-3 py-2 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-blue-500"
                  placeholder="+44 7700 900001"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1.5">Client Logo URL</label>
                <input
                  value={form.client_logo_url}
                  onChange={(e) => setForm({ ...form, client_logo_url: e.target.value })}
                  className="w-full bg-gray-800/60 border border-gray-700 rounded-lg px-3 py-2 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-blue-500"
                  placeholder="https://..."
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1.5">Address *</label>
              <input
                value={form.address}
                onChange={(e) => { setForm({ ...form, address: e.target.value }); setErrors((prev) => ({ ...prev, address: '' })); }}
                className={`w-full bg-gray-800/60 border rounded-lg px-3 py-2 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 ${errors.address ? 'border-red-500/50' : 'border-gray-700'}`}
                placeholder="Full address"
              />
              {errors.address && <p className="text-xs text-red-400 mt-1">{errors.address}</p>}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1.5">Latitude</label>
                <input
                  type="number"
                  step="any"
                  value={form.latitude}
                  onChange={(e) => setForm({ ...form, latitude: e.target.value })}
                  className="w-full bg-gray-800/60 border border-gray-700 rounded-lg px-3 py-2 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-blue-500"
                  placeholder="51.5074"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1.5">Longitude</label>
                <input
                  type="number"
                  step="any"
                  value={form.longitude}
                  onChange={(e) => setForm({ ...form, longitude: e.target.value })}
                  className="w-full bg-gray-800/60 border border-gray-700 rounded-lg px-3 py-2 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-blue-500"
                  placeholder="-0.1278"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="relative">
                <label className="block text-sm font-medium text-gray-300 mb-1.5">Risk Level</label>
                <button
                  type="button"
                  onClick={() => setDropdownOpen(!dropdownOpen)}
                  className={`w-full text-left px-3 py-2 rounded-lg text-sm font-medium border transition-colors cursor-pointer flex items-center justify-between ${activeRisk.color}`}
                >
                  {activeRisk.label}
                  <div className="w-4 h-4 flex items-center justify-center"><i className="ri-arrow-down-s-line text-gray-500"></i></div>
                </button>
                {dropdownOpen && (
                  <div className="absolute z-10 mt-1 w-full bg-[#1f2937] border border-gray-700 rounded-lg shadow-lg overflow-hidden">
                    {riskOptions.map((opt) => (
                      <button
                        key={opt.value}
                        type="button"
                        onClick={() => { setForm({ ...form, risk_level: opt.value }); setDropdownOpen(false); }}
                        className={`w-full text-left px-3 py-2 text-sm font-medium hover:bg-gray-800/50 transition-colors cursor-pointer ${opt.color}`}
                      >
                        {opt.label}
                      </button>
                    ))}
                  </div>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1.5">Check-Call Interval (min)</label>
                <input
                  type="number"
                  min={5}
                  value={form.check_call_interval}
                  onChange={(e) => setForm({ ...form, check_call_interval: Math.max(5, parseInt(e.target.value) || 60) })}
                  className="w-full bg-gray-800/60 border border-gray-700 rounded-lg px-3 py-2 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-blue-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1.5">Assignment Instructions</label>
              <textarea
                value={form.assignment_instructions}
                onChange={(e) => setForm({ ...form, assignment_instructions: e.target.value })}
                rows={3}
                maxLength={500}
                className="w-full bg-gray-800/60 border border-gray-700 rounded-lg px-3 py-2 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-blue-500"
                placeholder="Key instructions for guards (access codes, patrol routes, etc.)"
              />
              <p className="text-xs text-gray-600 mt-1">{form.assignment_instructions.length}/500</p>
            </div>

            <div className="flex justify-end gap-3 pt-2">
              <button type="button" onClick={onClose} className="px-4 py-2 text-sm text-gray-400 hover:text-white transition-colors cursor-pointer whitespace-nowrap">Cancel</button>
              <button onClick={goNext} className="bg-blue-600 hover:bg-blue-500 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors cursor-pointer whitespace-nowrap inline-flex items-center gap-2">
                Next: Cover Plan
                <div className="w-4 h-4 flex items-center justify-center"><i className="ri-arrow-right-line"></i></div>
              </button>
            </div>
          </div>
        )}

        {/* ===== STEP 2: Cover Plan ===== */}
        {step === 2 && (
          <div className="p-5 space-y-5">
            {/* Templates */}
            <div className="bg-gray-800/40 rounded-lg p-4 border border-gray-700/50">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-semibold text-white flex items-center gap-2">
                  <div className="w-4 h-4 flex items-center justify-center"><i className="ri-stack-line text-blue-400"></i></div>
                  Load from Pattern Template
                </h3>
                <button
                  onClick={() => setTemplateMenuOpen(!templateMenuOpen)}
                  className="text-xs text-blue-400 hover:text-blue-300 cursor-pointer whitespace-nowrap"
                >
                  {templateMenuOpen ? 'Hide' : 'Browse templates'}
                </button>
              </div>
              {templateMenuOpen && (
                <div className="grid grid-cols-2 gap-2 max-h-48 overflow-y-auto">
                  {allTemplates.map((t) => (
                    <button
                      key={t.id}
                      onClick={() => applyTemplate(t)}
                      className="text-left px-3 py-2.5 rounded-lg bg-gray-900/60 border border-gray-800 hover:border-blue-500/30 hover:bg-gray-900 transition-all cursor-pointer"
                    >
                      <p className="text-xs font-semibold text-white">{t.name}</p>
                      <p className="text-[10px] text-gray-500 mt-0.5">{(t.slots || []).length} slots · {t.pattern_type || 'weekly'}</p>
                      <p className="text-[10px] text-gray-600 mt-0.5 truncate">{t.description || ''}</p>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Quick Setup */}
            <div className="bg-gray-800/40 rounded-lg p-4 border border-gray-700/50">
              <h3 className="text-sm font-semibold text-white mb-3 flex items-center gap-2">
                <div className="w-4 h-4 flex items-center justify-center"><i className="ri-settings-4-line text-blue-400"></i></div>
                Quick Setup
              </h3>
              <div className="flex flex-wrap items-center gap-3">
                <div>
                  <label className="text-xs text-gray-400 block mb-1">Shift Type</label>
                  <div className="flex items-center gap-1 bg-gray-800 rounded-lg p-1">
                    {(['day', 'night', '24h'] as const).map((t) => (
                      <button
                        key={t}
                        onClick={() => setBatchShiftType(t)}
                        className={`px-3 py-1.5 rounded-md text-xs font-medium capitalize transition-colors cursor-pointer whitespace-nowrap ${
                          batchShiftType === t ? 'bg-blue-600 text-white' : 'text-gray-400 hover:text-white'
                        }`}
                      >
                        {t === '24h' ? '24hr' : t}
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="text-xs text-gray-400 block mb-1">Guards / Slot</label>
                  <input
                    type="number"
                    min={1}
                    max={50}
                    value={batchGuards}
                    onChange={(e) => setBatchGuards(Math.max(1, parseInt(e.target.value) || 1))}
                    className="w-16 bg-gray-800 border border-gray-700 rounded-lg px-2 py-1.5 text-sm text-white text-center focus:outline-none focus:border-blue-500"
                  />
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setCopyToAll((v) => !v)}
                    className={`w-4 h-4 rounded border flex items-center justify-center transition-colors cursor-pointer ${copyToAll ? 'bg-blue-500 border-blue-500' : 'border-gray-600'}`}
                  >
                    {copyToAll && <i className="ri-check-line text-white text-xs"></i>}
                  </button>
                  <span className="text-xs text-gray-400">Include weekend</span>
                </div>
                <button
                  onClick={applyBatch}
                  className="ml-auto bg-gray-700 hover:bg-gray-600 text-white text-xs font-medium px-3 py-2 rounded-lg transition-colors cursor-pointer whitespace-nowrap"
                >
                  Apply Quick Setup
                </button>
              </div>
            </div>

            {/* Day slots */}
            <div className="space-y-3">
              {dayNames.map((dayName, dayIndex) => {
                const slots = patternsByDay[dayIndex];
                return (
                  <div key={dayIndex} className="bg-gray-800/30 rounded-lg border border-gray-800/60 p-3">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-semibold text-white">{dayName}</p>
                        <span className="text-xs text-gray-500">{slots.length} slot{slots.length !== 1 ? 's' : ''}</span>
                      </div>
                      <button
                        onClick={() => addSlot(dayIndex)}
                        className="text-xs text-blue-400 hover:text-blue-300 flex items-center gap-1 transition-colors cursor-pointer whitespace-nowrap"
                      >
                        <div className="w-3 h-3 flex items-center justify-center"><i className="ri-add-line"></i></div>
                        Add Shift Slot
                      </button>
                    </div>
                    {slots.length === 0 ? (
                      <p className="text-xs text-gray-600 py-2">No shifts set for this day</p>
                    ) : (
                      <div className="space-y-2">
                        {slots.map((slot, slotIdx) => {
                          const patternIdx = patterns.findIndex((p, i) => p.day_of_week === dayIndex && patternsByDay[dayIndex].indexOf(p) === slotIdx);
                          return (
                            <div key={slotIdx} className="flex items-center gap-2 bg-gray-900/40 rounded-lg px-3 py-2">
                              <div className="flex items-center gap-1 bg-gray-800 rounded-lg p-0.5">
                                {(['day', 'night', '24h'] as const).map((t) => (
                                  <button
                                    key={t}
                                    onClick={() => updatePattern(patternIdx, { shift_type: t })}
                                    className={`px-2 py-0.5 rounded text-[11px] font-medium capitalize transition-colors cursor-pointer whitespace-nowrap ${
                                      slot.shift_type === t ? 'bg-blue-600 text-white' : 'text-gray-400 hover:text-white'
                                    }`}
                                  >
                                    {t === '24h' ? '24hr' : t}
                                  </button>
                                ))}
                              </div>
                              <div className="flex items-center gap-1.5">
                                <input
                                  type="time"
                                  value={slot.start_time}
                                  onChange={(e) => updatePattern(patternIdx, { start_time: e.target.value })}
                                  className="w-[72px] bg-gray-800 border border-gray-700 rounded-md px-1.5 py-1 text-xs text-white focus:outline-none focus:border-blue-500"
                                />
                                <span className="text-gray-500 text-[10px]">→</span>
                                <input
                                  type="time"
                                  value={slot.end_time}
                                  onChange={(e) => updatePattern(patternIdx, { end_time: e.target.value })}
                                  className="w-[72px] bg-gray-800 border border-gray-700 rounded-md px-1.5 py-1 text-xs text-white focus:outline-none focus:border-blue-500"
                                />
                              </div>
                              <div className="flex items-center gap-1.5 ml-auto">
                                <label className="text-[11px] text-gray-400">Guards</label>
                                <input
                                  type="number"
                                  min={0}
                                  max={50}
                                  value={slot.guards_required}
                                  onChange={(e) => updatePattern(patternIdx, { guards_required: Math.max(0, parseInt(e.target.value) || 0) })}
                                  className="w-12 bg-gray-800 border border-gray-700 rounded-md px-1.5 py-1 text-xs text-white text-center focus:outline-none focus:border-blue-500"
                                />
                              </div>
                              <button
                                onClick={() => removeSlot(patternIdx)}
                                className="w-7 h-7 flex items-center justify-center rounded-md hover:bg-red-500/10 text-gray-500 hover:text-red-400 transition-colors cursor-pointer shrink-0"
                              >
                                <div className="w-3 h-3 flex items-center justify-center"><i className="ri-delete-bin-line text-xs"></i></div>
                              </button>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-3 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 flex items-center justify-center rounded-lg bg-blue-500/20">
                  <i className="ri-shield-user-line text-blue-400 text-sm"></i>
                </div>
                <div>
                  <p className="text-sm font-medium text-white">Weekly Requirement</p>
                  <p className="text-xs text-gray-400">{totalWeeklyGuards} guard slots · {Math.round(totalWeeklyHours)} hours</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-lg font-bold text-blue-400">{coveredDays}/7</p>
                <p className="text-xs text-gray-500">days covered</p>
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-2">
              <button onClick={goBack} className="px-4 py-2 text-sm text-gray-400 hover:text-white transition-colors cursor-pointer whitespace-nowrap flex items-center gap-2">
                <div className="w-4 h-4 flex items-center justify-center"><i className="ri-arrow-left-line"></i></div>
                Back
              </button>
              <button onClick={goNext} className="bg-blue-600 hover:bg-blue-500 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors cursor-pointer whitespace-nowrap inline-flex items-center gap-2">
                Next: Guard Requirements
                <div className="w-4 h-4 flex items-center justify-center"><i className="ri-arrow-right-line"></i></div>
              </button>
            </div>
          </div>
        )}

        {/* ===== STEP 3: Guard Requirements ===== */}
        {step === 3 && (
          <div className="p-5 space-y-6">
            {/* Skills */}
            <div className="bg-gray-800/30 border border-gray-800 rounded-xl p-4">
              <h3 className="text-sm font-semibold text-white mb-1 flex items-center gap-2">
                <div className="w-4 h-4 flex items-center justify-center"><i className="ri-medal-line text-blue-400"></i></div>
                Required Skills
              </h3>
              <p className="text-xs text-gray-500 mb-3">Guards without these skills will be deprioritised for this site.</p>
              <div className="flex flex-wrap gap-1.5 mb-2">
                {requiredSkills.map((skill) => (
                  <span key={skill} className="inline-flex items-center gap-1 px-2 py-1 rounded text-xs font-medium bg-blue-500/15 text-blue-400 border border-blue-500/20">
                    {skill}
                    <button onClick={() => toggleSkill(skill)} className="cursor-pointer"><i className="ri-close-line text-[10px]"></i></button>
                  </span>
                ))}
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={customSkill}
                  onChange={(e) => setCustomSkill(e.target.value)}
                  onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); if (customSkill.trim()) { toggleSkill(customSkill.trim()); setCustomSkill(''); } } }}
                  placeholder="Add skill..."
                  className="flex-1 max-w-xs bg-gray-800/60 border border-gray-700 rounded-lg px-3 py-1.5 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-blue-500"
                />
                <div className="flex gap-1 flex-wrap">
                  {SKILL_OPTIONS.filter((s) => !requiredSkills.includes(s)).slice(0, 6).map((s) => (
                    <button key={s} onClick={() => toggleSkill(s)} className="px-2 py-1 rounded text-[10px] bg-gray-800/60 text-gray-400 border border-gray-700 hover:text-white hover:border-gray-600 transition-colors cursor-pointer whitespace-nowrap">
                      + {s}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Preferred */}
            <div className="bg-gray-800/30 border border-gray-800 rounded-xl p-4">
              <h3 className="text-sm font-semibold text-white mb-1 flex items-center gap-2">
                <div className="w-4 h-4 flex items-center justify-center"><i className="ri-star-line text-emerald-400"></i></div>
                Preferred Guards
              </h3>
              <p className="text-xs text-gray-500 mb-3">AI will prioritise assigning these guards to this site.</p>
              {availableGuards.length === 0 ? (
                <p className="text-sm text-gray-500">No active guards available.</p>
              ) : (
                <div className="grid grid-cols-3 gap-2">
                  {availableGuards.map((g) => (
                    <button
                      key={g.id}
                      onClick={() => togglePreferred(g.id)}
                      className={`flex items-center gap-2 px-3 py-2 rounded-lg border text-xs transition-colors cursor-pointer ${
                        preferredGuardIds.includes(g.id)
                          ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/25'
                          : 'bg-gray-800/40 text-gray-400 border-gray-700 hover:border-gray-600'
                      }`}
                    >
                      <div className="w-5 h-5 rounded-full bg-gray-700 flex items-center justify-center text-[9px] font-bold text-gray-400">
                        {((g.first_name || '')[0] || '') + ((g.last_name || '')[0] || '')}
                      </div>
                      <span className="truncate">{guardName(g)}</span>
                      {preferredGuardIds.includes(g.id) && <i className="ri-check-line text-[10px] ml-auto"></i>}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Banned */}
            <div className="bg-gray-800/30 border border-gray-800 rounded-xl p-4">
              <h3 className="text-sm font-semibold text-white mb-1 flex items-center gap-2">
                <div className="w-4 h-4 flex items-center justify-center"><i className="ri-forbid-line text-red-400"></i></div>
                Banned Guards
              </h3>
              <p className="text-xs text-gray-500 mb-3">Client-requested exclusions — these guards will never be assigned to this site.</p>
              <div className="grid grid-cols-3 gap-2">
                {guards.map((g) => (
                  <button
                    key={g.id}
                    onClick={() => toggleBanned(g.id)}
                    className={`flex items-center gap-2 px-3 py-2 rounded-lg border text-xs transition-colors cursor-pointer ${
                      bannedGuardIds.includes(g.id)
                        ? 'bg-red-500/10 text-red-400 border-red-500/25'
                        : 'bg-gray-800/40 text-gray-400 border-gray-700 hover:border-gray-600'
                    }`}
                  >
                    <div className="w-5 h-5 rounded-full bg-gray-700 flex items-center justify-center text-[9px] font-bold text-gray-400">
                      {((g.first_name || '')[0] || '') + ((g.last_name || '')[0] || '')}
                    </div>
                    <span className="truncate">{guardName(g)}</span>
                    {bannedGuardIds.includes(g.id) && <i className="ri-forbid-line text-[10px] ml-auto"></i>}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-2">
              <button onClick={goBack} className="px-4 py-2 text-sm text-gray-400 hover:text-white transition-colors cursor-pointer whitespace-nowrap flex items-center gap-2">
                <div className="w-4 h-4 flex items-center justify-center"><i className="ri-arrow-left-line"></i></div>
                Back
              </button>
              <button onClick={goNext} className="bg-blue-600 hover:bg-blue-500 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors cursor-pointer whitespace-nowrap inline-flex items-center gap-2">
                Next: SOP Setup
                <div className="w-4 h-4 flex items-center justify-center"><i className="ri-arrow-right-line"></i></div>
              </button>
            </div>
          </div>
        )}

        {/* ===== STEP 4: SOP Setup ===== */}
        {step === 4 && (
          <div className="p-5 space-y-6">
            {/* Existing SOPs */}
            <div className="bg-gray-800/30 border border-gray-800 rounded-xl p-4">
              <h3 className="text-sm font-semibold text-white mb-1 flex items-center gap-2">
                <div className="w-4 h-4 flex items-center justify-center"><i className="ri-file-list-3-line text-blue-400"></i></div>
                Link Existing SOPs
              </h3>
              <p className="text-xs text-gray-500 mb-3">Select SOPs from your library to associate with this site.</p>
              {existingSOPs.length === 0 ? (
                <p className="text-sm text-gray-500">No SOPs in your library yet.</p>
              ) : (
                <div className="grid grid-cols-2 gap-2">
                  {existingSOPs.map((sop) => (
                    <button
                      key={sop.id}
                      onClick={() => toggleLinkedSOP(sop.id)}
                      className={`flex items-center gap-2 px-3 py-2.5 rounded-lg border text-xs transition-colors text-left cursor-pointer ${
                        linkedSOPIds.includes(sop.id)
                          ? 'bg-blue-500/10 text-blue-400 border-blue-500/25'
                          : 'bg-gray-800/40 text-gray-400 border-gray-700 hover:border-gray-600'
                      }`}
                    >
                      <div className={`w-4 h-4 rounded flex items-center justify-center text-[10px] ${linkedSOPIds.includes(sop.id) ? 'bg-blue-500/30' : 'bg-gray-700'}`}>
                        {linkedSOPIds.includes(sop.id) ? <i className="ri-check-line" /> : ''}
                      </div>
                      <div className="min-w-0">
                        <p className="font-medium truncate">{sop.title}</p>
                        <p className="text-[10px] text-gray-500 capitalize">{sop.sop_type?.replace(/_/g, ' ')} · {sop.status}</p>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Auto-create SOPs */}
            <div className="bg-gray-800/30 border border-gray-800 rounded-xl p-4">
              <h3 className="text-sm font-semibold text-white mb-1 flex items-center gap-2">
                <div className="w-4 h-4 flex items-center justify-center"><i className="ri-add-circle-line text-emerald-400"></i></div>
                Create Recommended SOPs
              </h3>
              <p className="text-xs text-gray-500 mb-3">Select SOP types to auto-create as drafts for this site. You can edit them later in the SOP builder.</p>
              <div className="grid grid-cols-2 gap-2">
                {SOP_TYPES.map((t) => (
                  <button
                    key={t.value}
                    onClick={() => toggleSOPType(t.value)}
                    className={`flex items-center gap-2 px-3 py-2.5 rounded-lg border text-xs transition-colors text-left cursor-pointer ${
                      sopTypesToCreate.includes(t.value)
                        ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/25'
                        : 'bg-gray-800/40 text-gray-400 border-gray-700 hover:border-gray-600'
                    }`}
                  >
                    <div className={`w-4 h-4 rounded flex items-center justify-center text-[10px] ${sopTypesToCreate.includes(t.value) ? 'bg-emerald-500/30' : 'bg-gray-700'}`}>
                      {sopTypesToCreate.includes(t.value) ? <i className="ri-check-line" /> : <i className={`${t.icon} text-[10px]`} />}
                    </div>
                    <span className="font-medium">{t.label}</span>
                  </button>
                ))}
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-2">
              <button onClick={goBack} className="px-4 py-2 text-sm text-gray-400 hover:text-white transition-colors cursor-pointer whitespace-nowrap flex items-center gap-2">
                <div className="w-4 h-4 flex items-center justify-center"><i className="ri-arrow-left-line"></i></div>
                Back
              </button>
              <button onClick={goNext} className="bg-blue-600 hover:bg-blue-500 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors cursor-pointer whitespace-nowrap inline-flex items-center gap-2">
                Review & Create
                <div className="w-4 h-4 flex items-center justify-center"><i className="ri-arrow-right-line"></i></div>
              </button>
            </div>
          </div>
        )}

        {/* ===== STEP 5: Review ===== */}
        {step === 5 && (
          <div className="p-5 space-y-5">
            <div className="bg-gray-800/30 border border-gray-800 rounded-xl p-4 space-y-4">
              <h3 className="text-sm font-semibold text-white flex items-center gap-2">
                <div className="w-4 h-4 flex items-center justify-center"><i className="ri-file-list-3-line text-blue-400"></i></div>
                Site Summary
              </h3>

              {/* Site info summary */}
              <div className="grid grid-cols-2 gap-3 text-xs">
                <div className="bg-gray-900/40 rounded-lg p-3">
                  <p className="text-gray-500 mb-0.5">Site Name</p>
                  <p className="text-white font-medium">{form.site_name || '—'}</p>
                </div>
                <div className="bg-gray-900/40 rounded-lg p-3">
                  <p className="text-gray-500 mb-0.5">Client</p>
                  <p className="text-white font-medium">{form.client_name || '—'}</p>
                </div>
                <div className="bg-gray-900/40 rounded-lg p-3">
                  <p className="text-gray-500 mb-0.5">Address</p>
                  <p className="text-white font-medium">{form.address || '—'}</p>
                </div>
                <div className="bg-gray-900/40 rounded-lg p-3">
                  <p className="text-gray-500 mb-0.5">Risk Level</p>
                  <span className={`inline-flex px-2 py-0.5 rounded text-[10px] font-medium border ${activeRisk.color}`}>{activeRisk.label}</span>
                </div>
              </div>

              {/* Cover plan summary */}
              <div className="bg-gray-900/40 rounded-lg p-3">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-gray-500 text-xs">Cover Plan</p>
                  <button onClick={() => setStep(2)} className="text-[10px] text-blue-400 hover:text-blue-300 cursor-pointer whitespace-nowrap">Edit</button>
                </div>
                <div className="flex items-center gap-4">
                  <div className="text-center">
                    <p className="text-lg font-bold text-white">{totalWeeklyGuards}</p>
                    <p className="text-[10px] text-gray-500">weekly slots</p>
                  </div>
                  <div className="text-center">
                    <p className="text-lg font-bold text-white">{Math.round(totalWeeklyHours)}</p>
                    <p className="text-[10px] text-gray-500">weekly hours</p>
                  </div>
                  <div className="text-center">
                    <p className="text-lg font-bold text-blue-400">{coveredDays}/7</p>
                    <p className="text-[10px] text-gray-500">days covered</p>
                  </div>
                </div>
              </div>

              {/* Requirements summary */}
              <div className="bg-gray-900/40 rounded-lg p-3">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-gray-500 text-xs">Guard Requirements</p>
                  <button onClick={() => setStep(3)} className="text-[10px] text-blue-400 hover:text-blue-300 cursor-pointer whitespace-nowrap">Edit</button>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {requiredSkills.length > 0 ? requiredSkills.map((s) => (
                    <span key={s} className="px-2 py-0.5 rounded text-[10px] bg-blue-500/15 text-blue-400 border border-blue-500/20">{s}</span>
                  )) : <span className="text-[10px] text-gray-500">No required skills</span>}
                </div>
                <p className="text-[10px] text-gray-500 mt-1.5">
                  {preferredGuardIds.length} preferred · {bannedGuardIds.length} banned
                </p>
              </div>

              {/* SOP summary */}
              <div className="bg-gray-900/40 rounded-lg p-3">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-gray-500 text-xs">SOPs</p>
                  <button onClick={() => setStep(4)} className="text-[10px] text-blue-400 hover:text-blue-300 cursor-pointer whitespace-nowrap">Edit</button>
                </div>
                <p className="text-[10px] text-gray-400">
                  {linkedSOPIds.length} linked · {sopTypesToCreate.length} to create
                </p>
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-2">
              <button onClick={goBack} className="px-4 py-2 text-sm text-gray-400 hover:text-white transition-colors cursor-pointer whitespace-nowrap flex items-center gap-2">
                <div className="w-4 h-4 flex items-center justify-center"><i className="ri-arrow-left-line"></i></div>
                Back
              </button>
              <button type="button" onClick={onClose} className="px-4 py-2 text-sm text-gray-400 hover:text-white transition-colors cursor-pointer whitespace-nowrap">Cancel</button>
              <button
                onClick={handleSubmit}
                disabled={saving}
                className="bg-blue-600 hover:bg-blue-500 text-white text-sm font-medium px-5 py-2 rounded-lg transition-colors disabled:opacity-50 cursor-pointer whitespace-nowrap inline-flex items-center gap-2"
              >
                {saving && <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>}
                {saving ? 'Creating...' : (editingSite ? 'Update Site' : 'Create Site')}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}