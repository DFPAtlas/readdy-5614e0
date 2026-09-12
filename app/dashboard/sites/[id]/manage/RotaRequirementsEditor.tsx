'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';

interface RotaRequirementsEditorProps {
  siteId: string;
  companyId: string | null;
  userId: string;
  onSaved: () => void;
}

interface ShiftPattern {
  id: string;
  day_of_week: string;
  shift_type: string;
  start_time: string;
  end_time: string;
  guards_required: number;
  notes: string;
}

const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
const shiftTypes = ['day', 'night', 'evening', 'morning', 'split', 'flexi'];

export default function RotaRequirementsEditor({ siteId, companyId, userId, onSaved }: RotaRequirementsEditorProps) {
  const [patterns, setPatterns] = useState<ShiftPattern[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
  const [showAdd, setShowAdd] = useState(false);
  const [newPattern, setNewPattern] = useState({ day_of_week: 'Monday', shift_type: 'day', start_time: '08:00', end_time: '20:00', guards_required: 1, notes: '' });

  useEffect(() => {
    supabase
      .from('site_shift_patterns')
      .select('id, day_of_week, shift_type, start_time, end_time, guards_required, notes')
      .eq('site_id', siteId)
      .order('day_of_week')
      .order('start_time')
      .then(({ data }) => {
        setPatterns((data || []).map((p: any) => ({
          id: p.id,
          day_of_week: p.day_of_week || '',
          shift_type: p.shift_type || 'day',
          start_time: p.start_time || '',
          end_time: p.end_time || '',
          guards_required: p.guards_required || 0,
          notes: p.notes || '',
        })));
        setLoading(false);
      });
  }, [siteId]);

  const updatePattern = async (p: ShiftPattern) => {
    if (!companyId) return;
    const { error } = await supabase
      .from('site_shift_patterns')
      .update({
        shift_type: p.shift_type,
        start_time: p.start_time,
        end_time: p.end_time,
        guards_required: p.guards_required,
        notes: p.notes,
      })
      .eq('id', p.id)
      .eq('company_id', companyId);

    if (error) {
      setToast({ message: 'Failed: ' + error.message, type: 'error' });
    } else {
      setToast({ message: 'Pattern updated', type: 'success' });
      onSaved();
    }
    setTimeout(() => setToast(null), 3000);
  };

  const addPattern = async () => {
    if (!companyId) return;
    setSaving(true);
    const { data, error } = await supabase
      .from('site_shift_patterns')
      .insert({
        site_id: siteId,
        company_id: companyId,
        client_id: null,
        day_of_week: newPattern.day_of_week,
        shift_type: newPattern.shift_type,
        start_time: newPattern.start_time,
        end_time: newPattern.end_time,
        guards_required: newPattern.guards_required,
        notes: newPattern.notes,
        created_by: userId,
      })
      .select('id, day_of_week, shift_type, start_time, end_time, guards_required, notes')
      .single();

    setSaving(false);
    if (error) {
      setToast({ message: 'Failed to add: ' + error.message, type: 'error' });
    } else if (data) {
      setPatterns([...patterns, data as ShiftPattern]);
      setNewPattern({ day_of_week: 'Monday', shift_type: 'day', start_time: '08:00', end_time: '20:00', guards_required: 1, notes: '' });
      setShowAdd(false);
      setToast({ message: 'Shift pattern added', type: 'success' });
      onSaved();
    }
    setTimeout(() => setToast(null), 3000);
  };

  const deletePattern = async (id: string) => {
    if (!companyId) return;
    const { error } = await supabase.from('site_shift_patterns').delete().eq('id', id).eq('company_id', companyId);
    if (error) {
      setToast({ message: 'Failed to delete: ' + error.message, type: 'error' });
    } else {
      setPatterns(patterns.filter((p) => p.id !== id));
      setToast({ message: 'Pattern removed', type: 'success' });
      onSaved();
    }
    setTimeout(() => setToast(null), 3000);
  };

  if (loading) {
    return <div className="space-y-4 animate-pulse">{[...Array(4)].map((_, i) => <div key={i} className="h-14 bg-white/5 rounded-lg" />)}</div>;
  }

  return (
    <div className="space-y-6">
      {toast && (
        <div className={`fixed top-4 right-4 z-50 px-4 py-3 rounded-lg text-sm font-medium shadow-lg ${toast.type === 'success' ? 'bg-emerald-600 text-white' : 'bg-red-600 text-white'}`}>
          {toast.message}
        </div>
      )}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-base font-semibold text-white mb-1">Rota Requirements</h3>
          <p className="text-xs text-gray-400">{patterns.length} shift patterns configured</p>
        </div>
        <button
          onClick={() => setShowAdd(!showAdd)}
          className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white text-sm font-medium rounded-lg transition-colors cursor-pointer whitespace-nowrap flex items-center gap-2"
        >
          <div className="w-4 h-4 flex items-center justify-center"><i className="ri-add-line"></i></div>
          Add Pattern
        </button>
      </div>

      {showAdd && (
        <div className="p-4 rounded-xl border border-blue-500/20 bg-blue-500/5 space-y-4">
          <h4 className="text-sm font-medium text-blue-400">New Shift Pattern</h4>
          <div className="grid grid-cols-4 gap-3">
            <div>
              <label className="block text-xs text-gray-500 mb-1">Day</label>
              <div className="relative">
                <select value={newPattern.day_of_week} onChange={(e) => setNewPattern({ ...newPattern, day_of_week: e.target.value })} className="w-full px-2.5 py-1.5 bg-white/5 border border-white/10 rounded text-xs text-white appearance-none cursor-pointer pr-6">
                  {days.map((d) => <option key={d} value={d} className="bg-[#0b0f19]">{d}</option>)}
                </select>
                <div className="absolute right-1.5 top-1/2 -translate-y-1/2 w-3 h-3 flex items-center justify-center pointer-events-none text-gray-500"><i className="ri-arrow-down-s-line text-xs"></i></div>
              </div>
            </div>
            <div>
              <label className="block text-xs text-gray-500 mb-1">Type</label>
              <div className="relative">
                <select value={newPattern.shift_type} onChange={(e) => setNewPattern({ ...newPattern, shift_type: e.target.value })} className="w-full px-2.5 py-1.5 bg-white/5 border border-white/10 rounded text-xs text-white appearance-none cursor-pointer pr-6">
                  {shiftTypes.map((t) => <option key={t} value={t} className="bg-[#0b0f19] capitalize">{t.charAt(0).toUpperCase() + t.slice(1)}</option>)}
                </select>
                <div className="absolute right-1.5 top-1/2 -translate-y-1/2 w-3 h-3 flex items-center justify-center pointer-events-none text-gray-500"><i className="ri-arrow-down-s-line text-xs"></i></div>
              </div>
            </div>
            <div>
              <label className="block text-xs text-gray-500 mb-1">Start</label>
              <input type="time" value={newPattern.start_time} onChange={(e) => setNewPattern({ ...newPattern, start_time: e.target.value })} className="w-full px-2.5 py-1.5 bg-white/5 border border-white/10 rounded text-xs text-white focus:outline-none focus:ring-1 focus:ring-blue-500" />
            </div>
            <div>
              <label className="block text-xs text-gray-500 mb-1">End</label>
              <input type="time" value={newPattern.end_time} onChange={(e) => setNewPattern({ ...newPattern, end_time: e.target.value })} className="w-full px-2.5 py-1.5 bg-white/5 border border-white/10 rounded text-xs text-white focus:outline-none focus:ring-1 focus:ring-blue-500" />
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div>
              <label className="block text-xs text-gray-500 mb-1">Guards Required</label>
              <input type="number" value={newPattern.guards_required} onChange={(e) => setNewPattern({ ...newPattern, guards_required: parseInt(e.target.value) || 0 })} min="0" max="20" className="w-20 px-2.5 py-1.5 bg-white/5 border border-white/10 rounded text-xs text-white focus:outline-none focus:ring-1 focus:ring-blue-500" />
            </div>
            <div className="flex-1">
              <label className="block text-xs text-gray-500 mb-1">Notes</label>
              <input type="text" value={newPattern.notes} onChange={(e) => setNewPattern({ ...newPattern, notes: e.target.value })} className="w-full px-2.5 py-1.5 bg-white/5 border border-white/10 rounded text-xs text-white placeholder-gray-600 focus:outline-none focus:ring-1 focus:ring-blue-500" placeholder="e.g. Requires SIA Door Supervisor" />
            </div>
          </div>
          <div className="flex gap-2">
            <button onClick={() => setShowAdd(false)} className="px-4 py-2 text-sm text-gray-400 hover:text-white transition-colors cursor-pointer whitespace-nowrap">Cancel</button>
            <button onClick={addPattern} disabled={saving} className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white text-sm rounded-lg transition-colors cursor-pointer whitespace-nowrap disabled:opacity-50">
              {saving ? 'Adding...' : 'Add Pattern'}
            </button>
          </div>
        </div>
      )}

      <div className="space-y-2">
        {patterns.length === 0 && !showAdd && (
          <div className="text-center py-8">
            <div className="w-12 h-12 rounded-xl bg-white/5 flex items-center justify-center mx-auto mb-3">
              <i className="ri-calendar-event-line text-gray-500 text-lg"></i>
            </div>
            <p className="text-sm text-gray-400 mb-1">No shift patterns</p>
            <p className="text-xs text-gray-500">Configure the rota requirements for this site</p>
          </div>
        )}
        {patterns.map((p) => (
          <div key={p.id} className="flex items-center gap-4 p-3 rounded-lg border border-white/10 bg-white/[0.02]">
            <span className="text-sm font-medium text-white w-24">{p.day_of_week}</span>
            <span className="text-xs text-gray-400 capitalize w-16">{p.shift_type}</span>
            <span className="text-sm text-gray-300 w-24">{p.start_time} - {p.end_time}</span>
            <div className="flex items-center gap-2">
              <span className="text-xs text-gray-500">Guards:</span>
              <input
                type="number"
                value={p.guards_required}
                onChange={(e) => {
                  setPatterns(patterns.map((pt) => pt.id === p.id ? { ...pt, guards_required: parseInt(e.target.value) || 0 } : pt));
                }}
                min="0"
                max="20"
                className="w-14 px-2 py-1 bg-white/5 border border-white/10 rounded text-xs text-white text-center focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
            </div>
            <input
              type="text"
              value={p.notes}
              onChange={(e) => setPatterns(patterns.map((pt) => pt.id === p.id ? { ...pt, notes: e.target.value } : pt))}
              className="flex-1 px-2 py-1 bg-white/5 border border-white/10 rounded text-xs text-white placeholder-gray-600 focus:outline-none focus:ring-1 focus:ring-blue-500"
              placeholder="Notes..."
            />
            <button onClick={() => updatePattern(p)} className="px-2.5 py-1 bg-blue-600/20 hover:bg-blue-600/30 text-blue-400 text-xs rounded transition-colors cursor-pointer whitespace-nowrap border border-blue-500/20">Save</button>
            <button onClick={() => deletePattern(p.id)} className="w-6 h-6 rounded hover:bg-red-500/10 flex items-center justify-center cursor-pointer text-gray-500 hover:text-red-400">
              <i className="ri-close-line text-sm"></i>
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}