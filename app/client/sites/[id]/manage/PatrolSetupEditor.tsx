'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';

interface CheckpointRow {
  id?: string;
  name: string;
  location_label: string;
  lat: string;
  lng: string;
  is_active: boolean;
  requires_photo: boolean;
  requires_comment: boolean;
  order_index: number;
  isNew: boolean;
}

interface PatrolSetupEditorProps {
  siteId: string;
  auth: any;
  onSaved: () => void;
  showToast: (msg: string, type?: 'success' | 'error') => void;
}

export default function PatrolSetupEditor({ siteId, auth, onSaved, showToast }: PatrolSetupEditorProps) {
  const [saving, setSaving] = useState(false);
  const [checkpoints, setCheckpoints] = useState<CheckpointRow[]>([]);

  useEffect(() => {
    if (!auth.site || !auth.companyId) return;
    supabase
      .from('patrol_checkpoints')
      .select('id, name, location_label, lat, lng, is_active, requires_photo, requires_comment, order_index')
      .eq('site_id', siteId)
      .eq('company_id', auth.companyId)
      .order('order_index')
      .then(({ data }) => {
        if (data && data.length > 0) {
          setCheckpoints(data.map((cp: any) => ({
            id: cp.id,
            name: cp.name || '',
            location_label: cp.location_label || '',
            lat: cp.lat ? String(cp.lat) : '',
            lng: cp.lng ? String(cp.lng) : '',
            is_active: cp.is_active ?? true,
            requires_photo: cp.requires_photo ?? false,
            requires_comment: cp.requires_comment ?? false,
            order_index: cp.order_index ?? 0,
            isNew: false,
          })));
        } else {
          setCheckpoints([{ name: '', location_label: '', lat: '', lng: '', is_active: true, requires_photo: false, requires_comment: false, order_index: 1, isNew: true }]);
        }
      });
  }, [auth.site, auth.companyId, siteId]);

  const updateRow = (idx: number, field: string, value: any) => {
    setCheckpoints((prev) => prev.map((cp, i) => i === idx ? { ...cp, [field]: value } : cp));
  };

  const addRow = () => {
    setCheckpoints((prev) => [...prev, {
      name: '', location_label: '', lat: '', lng: '', is_active: true, requires_photo: false, requires_comment: false, order_index: prev.length + 1, isNew: true,
    }]);
  };

  const removeRow = (idx: number) => {
    setCheckpoints((prev) => prev.filter((_, i) => i !== idx));
  };

  const handleSave = async () => {
    const valid = checkpoints.filter((cp) => cp.name.trim());
    if (valid.length === 0) {
      showToast('Add at least one checkpoint with a name', 'error');
      return;
    }

    setSaving(true);
    const companyId = auth.companyId;
    const clientId = auth.clientId;

    const existingIds = checkpoints.filter((cp) => cp.id && !cp.isNew).map((cp) => cp.id!);
    if (existingIds.length > 0) {
      await supabase.from('patrol_checkpoints').delete().eq('site_id', siteId).not('id', 'in', `(${existingIds.join(',')})`);
    } else {
      await supabase.from('patrol_checkpoints').delete().eq('site_id', siteId);
    }

    const upserts = valid.map((cp, i) => ({
      id: cp.id && !cp.isNew ? cp.id : undefined,
      site_id: siteId,
      company_id: companyId,
      client_id: clientId,
      name: cp.name.trim(),
      location_label: cp.location_label || null,
      lat: cp.lat ? parseFloat(cp.lat) : null,
      lng: cp.lng ? parseFloat(cp.lng) : null,
      is_active: cp.is_active,
      requires_photo: cp.requires_photo,
      requires_comment: cp.requires_comment,
      order_index: i + 1,
      checkpoint_code: cp.name.trim().toUpperCase().replace(/\s+/g, '-').slice(0, 12) + '-' + (i + 1),
    }));

    const { error } = await supabase.from('patrol_checkpoints').upsert(upserts, { onConflict: 'id' });

    setSaving(false);
    if (error) { showToast(error.message, 'error'); return; }
    onSaved();
  };

  const inputClass = 'w-full bg-white/5 border border-white/10 rounded-lg px-2.5 py-1.5 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-blue-500/50 transition-colors';

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between mb-2">
        <div>
          <h3 className="text-sm font-semibold text-white">Patrol Setup</h3>
          <p className="text-xs text-gray-400">Configure checkpoints and patrol requirements</p>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={addRow} className="px-3 py-1.5 bg-white/5 hover:bg-white/10 border border-white/10 text-gray-300 text-xs font-medium rounded-lg cursor-pointer whitespace-nowrap transition-colors flex items-center gap-1">
            <div className="w-3 h-3 flex items-center justify-center"><i className="ri-add-line"></i></div>
            Add Checkpoint
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-medium rounded-lg cursor-pointer whitespace-nowrap disabled:opacity-50 transition-colors flex items-center gap-1.5"
          >
            <div className="w-3.5 h-3.5 flex items-center justify-center">
              <i className={saving ? 'ri-loader-4-line animate-spin' : 'ri-check-line'}></i>
            </div>
            {saving ? 'Saving...' : 'Save Patrol Setup'}
          </button>
        </div>
      </div>

      {checkpoints.length === 0 ? (
        <div className="text-center py-10 bg-white/[0.02] rounded-xl border border-white/5">
          <div className="w-12 h-12 flex items-center justify-center bg-white/5 rounded-full mx-auto mb-3">
            <i className="ri-route-line text-gray-500 text-xl"></i>
          </div>
          <p className="text-sm text-gray-400 mb-4">No checkpoints configured</p>
          <button onClick={addRow} className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-medium rounded-lg cursor-pointer whitespace-nowrap transition-colors">
            Add First Checkpoint
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {checkpoints.map((cp, idx) => (
            <div key={idx} className="bg-white/[0.02] border border-white/10 rounded-xl p-4">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-medium text-gray-300">Checkpoint #{idx + 1}</span>
                <button onClick={() => removeRow(idx)} className="w-6 h-6 flex items-center justify-center bg-red-500/10 hover:bg-red-500/20 rounded text-red-400 cursor-pointer transition-colors">
                  <i className="ri-close-line text-xs"></i>
                </button>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                <div className="sm:col-span-2 lg:col-span-1">
                  <label className="text-[10px] text-gray-500 block mb-1">Checkpoint Name *</label>
                  <input type="text" className={inputClass} value={cp.name} onChange={(e) => updateRow(idx, 'name', e.target.value)} placeholder="e.g. Main Entrance" />
                </div>
                <div>
                  <label className="text-[10px] text-gray-500 block mb-1">Location Label</label>
                  <input type="text" className={inputClass} value={cp.location_label} onChange={(e) => updateRow(idx, 'location_label', e.target.value)} placeholder="e.g. Front gate" />
                </div>
                <div>
                  <label className="text-[10px] text-gray-500 block mb-1">Latitude</label>
                  <input type="text" className={inputClass} value={cp.lat} onChange={(e) => updateRow(idx, 'lat', e.target.value)} placeholder="51.5074" />
                </div>
                <div>
                  <label className="text-[10px] text-gray-500 block mb-1">Longitude</label>
                  <input type="text" className={inputClass} value={cp.lng} onChange={(e) => updateRow(idx, 'lng', e.target.value)} placeholder="-0.1278" />
                </div>
                <div className="flex items-center gap-4 col-span-full mt-1">
                  <label className="flex items-center gap-1.5 cursor-pointer">
                    <input type="checkbox" checked={cp.is_active} onChange={(e) => updateRow(idx, 'is_active', e.target.checked)} className="w-3.5 h-3.5 rounded accent-blue-500" />
                    <span className="text-xs text-gray-400">Active</span>
                  </label>
                  <label className="flex items-center gap-1.5 cursor-pointer">
                    <input type="checkbox" checked={cp.requires_photo} onChange={(e) => updateRow(idx, 'requires_photo', e.target.checked)} className="w-3.5 h-3.5 rounded accent-blue-500" />
                    <span className="text-xs text-gray-400">Photo required</span>
                  </label>
                  <label className="flex items-center gap-1.5 cursor-pointer">
                    <input type="checkbox" checked={cp.requires_comment} onChange={(e) => updateRow(idx, 'requires_comment', e.target.checked)} className="w-3.5 h-3.5 rounded accent-blue-500" />
                    <span className="text-xs text-gray-400">Comment required</span>
                  </label>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}