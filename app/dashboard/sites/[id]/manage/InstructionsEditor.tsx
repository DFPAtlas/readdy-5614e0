'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';

interface InstructionsEditorProps {
  siteId: string;
  companyId: string | null;
  onSaved: () => void;
}

export default function InstructionsEditor({ siteId, companyId, onSaved }: InstructionsEditorProps) {
  const [form, setForm] = useState({
    assignment_instructions: '',
    emergency_procedures: '',
    access_instructions: '',
    keyholding_notes: '',
    alarm_response: '',
    site_rules: '',
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  useEffect(() => {
    supabase
      .from('sites')
      .select('assignment_instructions, emergency_procedures, access_instructions, keyholding_notes, alarm_response, site_rules')
      .eq('id', siteId)
      .maybeSingle()
      .then(({ data }) => {
        if (data) {
          setForm({
            assignment_instructions: data.assignment_instructions || '',
            emergency_procedures: data.emergency_procedures || '',
            access_instructions: data.access_instructions || '',
            keyholding_notes: data.keyholding_notes || '',
            alarm_response: data.alarm_response || '',
            site_rules: data.site_rules || '',
          });
        }
        setLoading(false);
      });
  }, [siteId]);

  const handleSave = async () => {
    if (!companyId) return;
    setSaving(true);
    const { error } = await supabase
      .from('sites')
      .update({
        assignment_instructions: form.assignment_instructions,
        emergency_procedures: form.emergency_procedures,
        access_instructions: form.access_instructions,
        keyholding_notes: form.keyholding_notes,
        alarm_response: form.alarm_response,
        site_rules: form.site_rules,
      })
      .eq('id', siteId)
      .eq('company_id', companyId);

    setSaving(false);
    if (error) {
      setToast({ message: 'Failed to save: ' + error.message, type: 'error' });
    } else {
      setToast({ message: 'Instructions updated', type: 'success' });
      onSaved();
    }
    setTimeout(() => setToast(null), 3000);
  };

  if (loading) {
    return <div className="space-y-4 animate-pulse">{[...Array(4)].map((_, i) => <div key={i} className="h-24 bg-white/5 rounded-lg" />)}</div>;
  }

  const fields = [
    { key: 'assignment_instructions', label: 'Assignment Instructions', placeholder: 'Guard duties, patrol routes, special instructions...', rows: 4 },
    { key: 'emergency_procedures', label: 'Emergency Procedures', placeholder: 'Fire evacuation, medical emergency, security breach protocols...', rows: 4 },
    { key: 'access_instructions', label: 'Access Instructions', placeholder: 'Key codes, entry points, access control systems...', rows: 3 },
    { key: 'keyholding_notes', label: 'Keyholding Notes', placeholder: 'Key safe location, keyholder contacts, alarm codes...', rows: 3 },
    { key: 'alarm_response', label: 'Alarm Response', placeholder: 'Alarm types, response procedures, escalation contacts...', rows: 3 },
    { key: 'site_rules', label: 'Site Rules', placeholder: 'Dress code, smoking policy, patrol frequency requirements...', rows: 3 },
  ];

  return (
    <div className="space-y-6">
      {toast && (
        <div className={`fixed top-4 right-4 z-50 px-4 py-3 rounded-lg text-sm font-medium shadow-lg ${toast.type === 'success' ? 'bg-emerald-600 text-white' : 'bg-red-600 text-white'}`}>
          {toast.message}
        </div>
      )}
      <div>
        <h3 className="text-base font-semibold text-white mb-1">Instructions & Procedures</h3>
        <p className="text-xs text-gray-400">Site-specific instructions and standard operating procedures for guards</p>
      </div>
      <div className="space-y-4">
        {fields.map((field) => (
          <div key={field.key}>
            <label className="block text-sm font-medium text-gray-300 mb-1.5">{field.label}</label>
            <textarea
              value={(form as any)[field.key]}
              onChange={(e) => setForm({ ...form, [field.key]: e.target.value })}
              rows={field.rows}
              maxLength={5000}
              className="w-full px-3 py-2.5 bg-white/5 border border-white/10 rounded-lg text-sm text-white placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-blue-500 resize-none"
              placeholder={field.placeholder}
            />
          </div>
        ))}
      </div>
      <div className="flex justify-end pt-2">
        <button
          onClick={handleSave}
          disabled={saving}
          className="px-6 py-2.5 bg-blue-600 hover:bg-blue-500 text-white text-sm font-medium rounded-lg transition-colors cursor-pointer whitespace-nowrap flex items-center gap-2 disabled:opacity-50"
        >
          {saving && <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />}
          Save Instructions
        </button>
      </div>
    </div>
  );
}