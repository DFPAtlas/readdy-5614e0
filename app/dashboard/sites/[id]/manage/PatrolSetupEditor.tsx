'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';

interface PatrolSetupEditorProps {
  siteId: string;
  companyId: string | null;
  userId: string;
  onSaved: () => void;
}

interface Checkpoint {
  id: string;
  name: string;
  location_label: string;
  order_index: number;
  is_active: boolean;
  requires_photo: boolean;
  requires_comment: boolean;
  allowed_radius_meters: number;
  patrol_time: string;
  patrol_frequency: string;
}

export default function PatrolSetupEditor({ siteId, companyId, userId, onSaved }: PatrolSetupEditorProps) {
  const [checkpoints, setCheckpoints] = useState<Checkpoint[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
  const [showAdd, setShowAdd] = useState(false);
  const [newCp, setNewCp] = useState({ name: '', location_label: '', requires_photo: false, requires_comment: false, allowed_radius_meters: 50 });

  useEffect(() => {
    supabase
      .from('patrol_checkpoints')
      .select('id, name, location_label, order_index, is_active, requires_photo, requires_comment, allowed_radius_meters, patrol_time, patrol_frequency')
      .eq('site_id', siteId)
      .order('order_index', { ascending: true })
      .then(({ data }) => {
        setCheckpoints((data || []).map((cp: any) => ({
          id: cp.id,
          name: cp.name || '',
          location_label: cp.location_label || '',
          order_index: cp.order_index || 0,
          is_active: cp.is_active !== false,
          requires_photo: cp.requires_photo || false,
          requires_comment: cp.requires_comment || false,
          allowed_radius_meters: cp.allowed_radius_meters || 50,
          patrol_time: cp.patrol_time || '',
          patrol_frequency: cp.patrol_frequency || 'hourly',
        })));
        setLoading(false);
      });
  }, [siteId]);

  const toggleCheckpointField = async (cpId: string, field: string, value: any) => {
    if (!companyId) return;
    setCheckpoints((prev) => prev.map((cp) => cp.id === cpId ? { ...cp, [field]: value } : cp));
  };

  const saveCheckpoint = async (cp: Checkpoint) => {
    if (!companyId) return;
    const { error } = await supabase
      .from('patrol_checkpoints')
      .update({
        name: cp.name,
        location_label: cp.location_label,
        is_active: cp.is_active,
        requires_photo: cp.requires_photo,
        requires_comment: cp.requires_comment,
        allowed_radius_meters: cp.allowed_radius_meters,
        patrol_time: cp.patrol_time || null,
        patrol_frequency: cp.patrol_frequency,
      })
      .eq('id', cp.id)
      .eq('company_id', companyId);

    if (error) {
      setToast({ message: 'Failed: ' + error.message, type: 'error' });
    } else {
      setToast({ message: `"${cp.name}" updated`, type: 'success' });
      onSaved();
    }
    setTimeout(() => setToast(null), 3000);
  };

  const addCheckpoint = async () => {
    if (!companyId || !newCp.name.trim()) return;
    setSaving(true);
    const maxOrder = Math.max(0, ...checkpoints.map((c) => c.order_index));
    const { data, error } = await supabase
      .from('patrol_checkpoints')
      .insert({
        site_id: siteId,
        company_id: companyId,
        name: newCp.name.trim(),
        location_label: newCp.location_label.trim(),
        order_index: maxOrder + 1,
        is_active: true,
        requires_photo: newCp.requires_photo,
        requires_comment: newCp.requires_comment,
        allowed_radius_meters: newCp.allowed_radius_meters,
        patrol_frequency: 'hourly',
        created_by: userId,
      })
      .select('id, name, location_label, order_index, is_active, requires_photo, requires_comment, allowed_radius_meters, patrol_time, patrol_frequency')
      .single();

    setSaving(false);
    if (error) {
      setToast({ message: 'Failed to add: ' + error.message, type: 'error' });
    } else if (data) {
      setCheckpoints([...checkpoints, data as Checkpoint]);
      setNewCp({ name: '', location_label: '', requires_photo: false, requires_comment: false, allowed_radius_meters: 50 });
      setShowAdd(false);
      setToast({ message: 'Checkpoint added', type: 'success' });
      onSaved();
    }
    setTimeout(() => setToast(null), 3000);
  };

  const deleteCheckpoint = async (cpId: string) => {
    if (!companyId) return;
    const { error } = await supabase
      .from('patrol_checkpoints')
      .delete()
      .eq('id', cpId)
      .eq('company_id', companyId);

    if (error) {
      setToast({ message: 'Failed to delete: ' + error.message, type: 'error' });
    } else {
      setCheckpoints(checkpoints.filter((c) => c.id !== cpId));
      setToast({ message: 'Checkpoint removed', type: 'success' });
      onSaved();
    }
    setTimeout(() => setToast(null), 3000);
  };

  if (loading) {
    return <div className="space-y-4 animate-pulse">{[...Array(3)].map((_, i) => <div key={i} className="h-20 bg-white/5 rounded-lg" />)}</div>;
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
          <h3 className="text-base font-semibold text-white mb-1">Patrol Checkpoints</h3>
          <p className="text-xs text-gray-400">{checkpoints.length} checkpoints configured</p>
        </div>
        <button
          onClick={() => setShowAdd(!showAdd)}
          className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white text-sm font-medium rounded-lg transition-colors cursor-pointer whitespace-nowrap flex items-center gap-2"
        >
          <div className="w-4 h-4 flex items-center justify-center"><i className="ri-add-line"></i></div>
          Add Checkpoint
        </button>
      </div>

      {showAdd && (
        <div className="p-4 rounded-xl border border-blue-500/20 bg-blue-500/5 space-y-4">
          <h4 className="text-sm font-medium text-blue-400">New Checkpoint</h4>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-gray-400 mb-1">Name *</label>
              <input
                type="text"
                value={newCp.name}
                onChange={(e) => setNewCp({ ...newCp, name: e.target.value })}
                className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-sm text-white placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                placeholder="e.g. Main Entrance"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-400 mb-1">Location</label>
              <input
                type="text"
                value={newCp.location_label}
                onChange={(e) => setNewCp({ ...newCp, location_label: e.target.value })}
                className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-sm text-white placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                placeholder="e.g. Front gate, north side"
              />
            </div>
          </div>
          <div className="flex items-center gap-6">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={newCp.requires_photo}
                onChange={(e) => setNewCp({ ...newCp, requires_photo: e.target.checked })}
                className="w-4 h-4 rounded border-white/20 bg-white/5 text-blue-500 focus:ring-blue-500"
              />
              <span className="text-sm text-gray-300">Photo required</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={newCp.requires_comment}
                onChange={(e) => setNewCp({ ...newCp, requires_comment: e.target.checked })}
                className="w-4 h-4 rounded border-white/20 bg-white/5 text-blue-500 focus:ring-blue-500"
              />
              <span className="text-sm text-gray-300">Comment required</span>
            </label>
          </div>
          <div className="flex gap-2">
            <button onClick={() => setShowAdd(false)} className="px-4 py-2 text-sm text-gray-400 hover:text-white transition-colors cursor-pointer whitespace-nowrap">Cancel</button>
            <button onClick={addCheckpoint} disabled={saving || !newCp.name.trim()} className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white text-sm rounded-lg transition-colors cursor-pointer whitespace-nowrap disabled:opacity-50">
              {saving ? 'Adding...' : 'Add Checkpoint'}
            </button>
          </div>
        </div>
      )}

      <div className="space-y-3">
        {checkpoints.length === 0 && !showAdd && (
          <div className="text-center py-8">
            <div className="w-12 h-12 rounded-xl bg-white/5 flex items-center justify-center mx-auto mb-3">
              <i className="ri-route-line text-gray-500 text-lg"></i>
            </div>
            <p className="text-sm text-gray-400 mb-1">No checkpoints yet</p>
            <p className="text-xs text-gray-500">Add patrol checkpoints for this site</p>
          </div>
        )}
        {checkpoints.map((cp, idx) => (
          <div key={cp.id} className="p-4 rounded-xl border border-white/10 bg-white/[0.02] space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className="w-6 h-6 rounded-full bg-blue-500/20 border border-blue-500/20 flex items-center justify-center text-xs font-medium text-blue-400">
                  {idx + 1}
                </span>
                <input
                  type="text"
                  value={cp.name}
                  onChange={(e) => toggleCheckpointField(cp.id, 'name', e.target.value)}
                  className="bg-transparent text-sm font-medium text-white border-b border-transparent hover:border-white/20 focus:border-blue-500 focus:outline-none px-1"
                />
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => toggleCheckpointField(cp.id, 'is_active', !cp.is_active)}
                  className={`px-2.5 py-1 rounded text-[11px] font-medium transition-colors cursor-pointer whitespace-nowrap ${cp.is_active ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-gray-500/10 text-gray-400 border border-gray-500/20'}`}
                >
                  {cp.is_active ? 'Active' : 'Inactive'}
                </button>
                <button
                  onClick={() => saveCheckpoint(cp)}
                  className="px-3 py-1 bg-blue-600/20 hover:bg-blue-600/30 text-blue-400 text-xs rounded-lg transition-colors cursor-pointer whitespace-nowrap border border-blue-500/20"
                >
                  Save
                </button>
                <button
                  onClick={() => deleteCheckpoint(cp.id)}
                  className="w-7 h-7 rounded-lg hover:bg-red-500/10 flex items-center justify-center transition-colors cursor-pointer text-gray-500 hover:text-red-400"
                >
                  <i className="ri-delete-bin-line text-sm"></i>
                </button>
              </div>
            </div>
            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="block text-[11px] text-gray-500 mb-1">Location</label>
                <input
                  type="text"
                  value={cp.location_label}
                  onChange={(e) => toggleCheckpointField(cp.id, 'location_label', e.target.value)}
                  className="w-full px-2.5 py-1.5 bg-white/5 border border-white/10 rounded text-xs text-white placeholder-gray-600 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  placeholder="Location description"
                />
              </div>
              <div>
                <label className="block text-[11px] text-gray-500 mb-1">GPS Radius (m)</label>
                <input
                  type="number"
                  value={cp.allowed_radius_meters}
                  onChange={(e) => toggleCheckpointField(cp.id, 'allowed_radius_meters', parseInt(e.target.value) || 50)}
                  className="w-full px-2.5 py-1.5 bg-white/5 border border-white/10 rounded text-xs text-white focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-[11px] text-gray-500 mb-1">Frequency</label>
                <div className="relative">
                  <select
                    value={cp.patrol_frequency}
                    onChange={(e) => toggleCheckpointField(cp.id, 'patrol_frequency', e.target.value)}
                    className="w-full px-2.5 py-1.5 bg-white/5 border border-white/10 rounded text-xs text-white focus:outline-none focus:ring-1 focus:ring-blue-500 appearance-none cursor-pointer pr-6"
                  >
                    <option value="30min" className="bg-[#0b0f19]">Every 30 min</option>
                    <option value="hourly" className="bg-[#0b0f19]">Hourly</option>
                    <option value="2hourly" className="bg-[#0b0f19]">Every 2 hours</option>
                    <option value="4hourly" className="bg-[#0b0f19]">Every 4 hours</option>
                    <option value="shiftly" className="bg-[#0b0f19]">Once per shift</option>
                  </select>
                  <div className="absolute right-1.5 top-1/2 -translate-y-1/2 w-3 h-3 flex items-center justify-center pointer-events-none text-gray-500">
                    <i className="ri-arrow-down-s-line text-xs"></i>
                  </div>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-6">
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" checked={cp.requires_photo} onChange={(e) => toggleCheckpointField(cp.id, 'requires_photo', e.target.checked)} className="w-3.5 h-3.5 rounded border-white/20 bg-white/5 text-blue-500 focus:ring-blue-500" />
                <span className="text-xs text-gray-400">Photo</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" checked={cp.requires_comment} onChange={(e) => toggleCheckpointField(cp.id, 'requires_comment', e.target.checked)} className="w-3.5 h-3.5 rounded border-white/20 bg-white/5 text-blue-500 focus:ring-blue-500" />
                <span className="text-xs text-gray-400">Comment</span>
              </label>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}