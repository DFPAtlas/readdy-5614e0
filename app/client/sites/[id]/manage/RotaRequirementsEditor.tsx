'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';

interface PatternRow {
  id?: string;
  day_of_week: number;
  shift_type: string;
  start_time: string;
  end_time: string;
  guards_required: number;
  isNew: boolean;
}

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
const SHIFT_TYPES = ['Day', 'Night', 'Split', 'Weekend Day', 'Weekend Night', 'Cover'];

interface RotaRequirementsEditorProps {
  siteId: string;
  auth: any;
  onSaved: () => void;
  showToast: (msg: string, type?: 'success' | 'error') => void;
}

export default function RotaRequirementsEditor({ siteId, auth, onSaved, showToast }: RotaRequirementsEditorProps) {
  const [saving, setSaving] = useState(false);
  const [patterns, setPatterns] = useState<PatternRow[]>([]);

  useEffect(() => {
    if (!auth.site || !auth.companyId) return;
    supabase
      .from('site_shift_patterns')
      .select('id, day_of_week, shift_type, start_time, end_time, guards_required')
      .eq('site_id', siteId)
      .order('day_of_week')
      .order('start_time')
      .then(({ data }) => {
        if (data && data.length > 0) {
          setPatterns(data.map((p: any) => ({
            id: p.id,
            day_of_week: p.day_of_week,
            shift_type: p.shift_type || 'Day',
            start_time: p.start_time?.slice(0, 5) || '08:00',
            end_time: p.end_time?.slice(0, 5) || '18:00',
            guards_required: p.guards_required || 1,
            isNew: false,
          })));
        } else {
          setPatterns([{ day_of_week: 0, shift_type: 'Day', start_time: '08:00', end_time: '18:00', guards_required: 1, isNew: true }]);
        }
      });
  }, [auth.site, auth.companyId, siteId]);

  const updateRow = (idx: number, field: string, value: any) => {
    setPatterns((prev) => prev.map((p, i) => i === idx ? { ...p, [field]: value } : p));
  };

  const addRow = () => {
    setPatterns((prev) => [...prev, { day_of_week: 0, shift_type: 'Day', start_time: '08:00', end_time: '18:00', guards_required: 1, isNew: true }]);
  };

  const removeRow = (idx: number) => {
    setPatterns((prev) => prev.filter((_, i) => i !== idx));
  };

  const handleSave = async () => {
    const valid = patterns.filter((p) => p.start_time && p.end_time && p.start_time < p.end_time);
    if (valid.length === 0) {
      showToast('Add at least one valid shift pattern (start must be before end)', 'error');
      return;
    }
    for (const p of patterns) {
      if (p.start_time >= p.end_time) {
        showToast('Start time must be before end time', 'error');
        return;
      }
    }

    setSaving(true);
    const companyId = auth.companyId;
    const clientId = auth.clientId;

    const existingIds = valid.filter((p) => p.id && !p.isNew).map((p) => p.id!);
    if (existingIds.length > 0) {
      await supabase.from('site_shift_patterns').delete().eq('site_id', siteId).not('id', 'in', `(${existingIds.join(',')})`);
    } else {
      await supabase.from('site_shift_patterns').delete().eq('site_id', siteId);
    }

    const upserts = valid.map((p) => ({
      id: p.id && !p.isNew ? p.id : undefined,
      site_id: siteId,
      company_id: companyId,
      client_id: clientId,
      day_of_week: p.day_of_week,
      shift_type: p.shift_type,
      start_time: p.start_time,
      end_time: p.end_time,
      guards_required: p.guards_required,
    }));

    const { error } = await supabase.from('site_shift_patterns').upsert(upserts, { onConflict: 'id' });

    setSaving(false);
    if (error) { showToast(error.message, 'error'); return; }
    onSaved();
  };

  const selectClass = 'w-full bg-white/5 border border-white/10 rounded-lg px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-blue-500/50 transition-colors appearance-none cursor-pointer';
  const inputClass = 'w-full bg-white/5 border border-white/10 rounded-lg px-2.5 py-1.5 text-xs text-white text-center focus:outline-none focus:border-blue-500/50 transition-colors';

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between mb-2">
        <div>
          <h3 className="text-sm font-semibold text-white">Rota Requirements</h3>
          <p className="text-xs text-gray-400">Define shift patterns for each day of the week</p>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={addRow} className="px-3 py-1.5 bg-white/5 hover:bg-white/10 border border-white/10 text-gray-300 text-xs font-medium rounded-lg cursor-pointer whitespace-nowrap transition-colors flex items-center gap-1">
            <div className="w-3 h-3 flex items-center justify-center"><i className="ri-add-line"></i></div>
            Add Pattern
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-medium rounded-lg cursor-pointer whitespace-nowrap disabled:opacity-50 transition-colors flex items-center gap-1.5"
          >
            <div className="w-3.5 h-3.5 flex items-center justify-center">
              <i className={saving ? 'ri-loader-4-line animate-spin' : 'ri-check-line'}></i>
            </div>
            {saving ? 'Saving...' : 'Save Rota'}
          </button>
        </div>
      </div>

      {patterns.length === 0 ? (
        <div className="text-center py-10 bg-white/[0.02] rounded-xl border border-white/5">
          <p className="text-sm text-gray-400 mb-4">No shift patterns defined</p>
          <button onClick={addRow} className="px-4 py-2 bg-blue-600 text-white text-xs font-medium rounded-lg cursor-pointer whitespace-nowrap">Add Pattern</button>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-white/10">
                <th className="text-left text-[10px] font-medium text-gray-500 py-2 px-2">Day</th>
                <th className="text-left text-[10px] font-medium text-gray-500 py-2 px-2">Type</th>
                <th className="text-left text-[10px] font-medium text-gray-500 py-2 px-2">Start</th>
                <th className="text-left text-[10px] font-medium text-gray-500 py-2 px-2">End</th>
                <th className="text-left text-[10px] font-medium text-gray-500 py-2 px-2">Guards</th>
                <th className="text-left text-[10px] font-medium text-gray-500 py-2 px-2"></th>
              </tr>
            </thead>
            <tbody>
              {patterns.map((p, idx) => (
                <tr key={idx} className="border-b border-white/5">
                  <td className="py-2 px-2">
                    <div className="relative">
                      <select className={selectClass} value={p.day_of_week} onChange={(e) => updateRow(idx, 'day_of_week', parseInt(e.target.value))}>
                        {DAYS.map((d, i) => <option key={i} value={i}>{d}</option>)}
                      </select>
                      <div className="absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none">
                        <i className="ri-arrow-down-s-line text-gray-500 text-xs"></i>
                      </div>
                    </div>
                  </td>
                  <td className="py-2 px-2">
                    <div className="relative">
                      <select className={selectClass} value={p.shift_type} onChange={(e) => updateRow(idx, 'shift_type', e.target.value)}>
                        {SHIFT_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
                      </select>
                      <div className="absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none">
                        <i className="ri-arrow-down-s-line text-gray-500 text-xs"></i>
                      </div>
                    </div>
                  </td>
                  <td className="py-2 px-2">
                    <input type="time" className={inputClass} value={p.start_time} onChange={(e) => updateRow(idx, 'start_time', e.target.value)} />
                  </td>
                  <td className="py-2 px-2">
                    <input type="time" className={inputClass} value={p.end_time} onChange={(e) => updateRow(idx, 'end_time', e.target.value)} />
                  </td>
                  <td className="py-2 px-2">
                    <input type="number" min={1} max={10} className={`${inputClass} w-16`} value={p.guards_required} onChange={(e) => updateRow(idx, 'guards_required', parseInt(e.target.value) || 1)} />
                  </td>
                  <td className="py-2 px-2">
                    <button onClick={() => removeRow(idx)} className="w-6 h-6 flex items-center justify-center bg-red-500/10 hover:bg-red-500/20 rounded text-red-400 cursor-pointer transition-colors">
                      <i className="ri-delete-bin-line text-xs"></i>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}