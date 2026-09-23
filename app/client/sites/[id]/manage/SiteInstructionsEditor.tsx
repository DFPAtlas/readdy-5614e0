'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';

interface SiteInstructionsEditorProps {
  siteId: string;
  auth: any;
  onSaved: () => void;
  showToast: (msg: string, type?: 'success' | 'error') => void;
}

type InstructionField =
  | 'assignment_instructions'
  | 'emergency_procedures'
  | 'access_instructions'
  | 'keyholding_notes'
  | 'alarm_response'
  | 'site_rules';

type InstructionsForm = Record<InstructionField, string>;

const EMPTY_INSTRUCTIONS_FORM: InstructionsForm = {
  assignment_instructions: '',
  emergency_procedures: '',
  access_instructions: '',
  keyholding_notes: '',
  alarm_response: '',
  site_rules: '',
};

const INSTRUCTION_FIELDS: Array<{ key: InstructionField; label: string; placeholder: string }> = [
  { key: 'assignment_instructions', label: 'Assignment Instructions', placeholder: 'General instructions for security officers at this site...' },
  { key: 'emergency_procedures', label: 'Emergency Procedures', placeholder: 'What to do in case of fire, medical emergency, security breach...' },
  { key: 'access_instructions', label: 'Access Instructions', placeholder: 'How to access the site, key codes, entry points...' },
  { key: 'keyholding_notes', label: 'Keyholding Notes', placeholder: 'Key safe location, alarm codes, keyholder contacts...' },
  { key: 'alarm_response', label: 'Alarm Response Notes', placeholder: 'Procedure when alarm is triggered, alarm company details...' },
  { key: 'site_rules', label: 'Site-Specific Rules', placeholder: 'Any special rules, restrictions, or requirements...' },
];

export default function SiteInstructionsEditor({ siteId, auth, onSaved, showToast }: SiteInstructionsEditorProps) {
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState<InstructionsForm>(EMPTY_INSTRUCTIONS_FORM);

  useEffect(() => {
    if (!auth.site) return;
    const sec = auth.site.security_requirements || {};
    setForm({
      assignment_instructions: auth.site.assignment_instructions || '',
      emergency_procedures: sec.emergency_procedures || '',
      access_instructions: sec.access_instructions || '',
      keyholding_notes: sec.keyholding_notes || '',
      alarm_response: sec.alarm_response || '',
      site_rules: sec.site_rules || '',
    });
  }, [auth.site]);

  const handleChange = (key: InstructionField, value: string) => {
    setForm((prev) => {
      const next: InstructionsForm = { ...prev };
      next[key] = value;
      return next;
    });
  };

  const handleSave = async () => {
    setSaving(true);
    const securityRequirements: Record<string, string> = {
      emergency_procedures: form.emergency_procedures,
      access_instructions: form.access_instructions,
      keyholding_notes: form.keyholding_notes,
      alarm_response: form.alarm_response,
      site_rules: form.site_rules,
    };

    const payload: {
      assignment_instructions: string | null;
      security_requirements: Record<string, string>;
      updated_at: string;
    } = {
      assignment_instructions: form.assignment_instructions || null,
      security_requirements: securityRequirements,
      updated_at: new Date().toISOString(),
    };

    const { error } = await supabase
      .from('sites')
      .update(payload)
      .eq('id', siteId);

    setSaving(false);
    if (error) { showToast(error.message, 'error'); return; }
    onSaved();
  };

  const textareaClass = 'w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-blue-500/50 transition-colors resize-none';

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between mb-2">
        <div>
          <h3 className="text-sm font-semibold text-white">Instructions & SOP</h3>
          <p className="text-xs text-gray-400">Site-specific instructions for security officers</p>
        </div>
        <button
          onClick={handleSave}
          disabled={saving}
          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-medium rounded-lg cursor-pointer whitespace-nowrap disabled:opacity-50 transition-colors flex items-center gap-1.5"
        >
          <div className="w-3.5 h-3.5 flex items-center justify-center">
            <i className={saving ? 'ri-loader-4-line animate-spin' : 'ri-check-line'}></i>
          </div>
          {saving ? 'Saving...' : 'Save Instructions'}
        </button>
      </div>

      {INSTRUCTION_FIELDS.map((field) => (
        <div key={field.key}>
          <label className="text-xs font-medium text-gray-400 mb-1.5 block">{field.label}</label>
          <textarea
            className={textareaClass}
            rows={3}
            value={form[field.key] || ''}
            onChange={(e) => {
              if (e.target.value.length <= 2000) handleChange(field.key, e.target.value);
            }}
            placeholder={field.placeholder}
            maxLength={2000}
          />
          <div className="text-[10px] text-gray-500 mt-1 text-right">{(form[field.key] || '').length}/2000</div>
        </div>
      ))}
    </div>
  );
}