'use client';

import { useState, useRef, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/lib/auth';
import { useSites } from '@/lib/useSites';
import { QRCodeSVG } from 'qrcode.react';
import { FeatureGate } from '@/lib/useEntitlements';

interface CheckpointFormData {
  site_id: string;
  name: string;
  description: string;
  checkpoint_code: string;
  location_label: string;
  lat: number | null;
  lng: number | null;
  expected_radius_meters: number;
  sop_url: string;
  patrol_time: string;
  patrol_frequency: string;
  requires_photo: boolean;
  requires_comment: boolean;
}

interface PatrolCheckpoint {
  id: string;
  site_id: string;
  name: string;
  description: string | null;
  checkpoint_code: string;
  location_label: string | null;
  lat: number | null;
  lng: number | null;
  expected_radius_meters: number;
  allowed_radius_meters: number;
  sop_url: string | null;
  patrol_time: string | null;
  patrol_frequency: string | null;
  is_active: boolean;
  requires_photo: boolean;
  requires_comment: boolean;
  gps_capture_status: string;
  approved_latitude: number | null;
  approved_longitude: number | null;
  approved_at: string | null;
  created_at: string;
}

function generateCode() {
  return Math.random().toString(36).substring(2, 8).toUpperCase();
}

function getScanUrl(code: string) {
  if (typeof window === 'undefined') return '';
  return `${window.location.origin}/guard/patrol/scan/${code}`;
}

function gpsStatusBadge(status: string) {
  switch (status) {
    case 'approved': return { label: 'GPS Approved', color: 'text-emerald-400', bg: 'bg-emerald-500/10', border: 'border-emerald-500/20' };
    case 'pending': return { label: 'Pending GPS', color: 'text-amber-400', bg: 'bg-amber-500/10', border: 'border-amber-500/20' };
    case 'needs_recapture': return { label: 'Needs Recapture', color: 'text-red-400', bg: 'bg-red-500/10', border: 'border-red-500/20' };
    default: return { label: status || 'Pending', color: 'text-gray-400', bg: 'bg-gray-500/10', border: 'border-gray-500/20' };
  }
}

function getScanStatusBadge(status: string) {
  switch (status) {
    case 'valid': case 'completed': return { label: 'OK', color: 'text-emerald-400', bg: 'bg-emerald-500/10' };
    case 'manual_review': return { label: 'Review', color: 'text-blue-400', bg: 'bg-blue-500/10' };
    case 'outside_radius': return { label: 'Out Radius', color: 'text-amber-400', bg: 'bg-amber-500/10' };
    case 'gps_unavailable': return { label: 'No GPS', color: 'text-red-400', bg: 'bg-red-500/10' };
    case 'checkpoint_not_approved': return { label: 'Not Activated', color: 'text-red-400', bg: 'bg-red-500/10' };
    default: return { label: status, color: 'text-gray-400', bg: 'bg-gray-500/10' };
  }
}

export default function PatrolCheckpointsPage() {
  const { companyId } = useAuth();
  const { sites, loading: sitesLoading } = useSites();
  const [checkpoints, setCheckpoints] = useState<PatrolCheckpoint[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedSiteId, setSelectedSiteId] = useState<string>('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showQRModal, setShowQRModal] = useState(false);
  const [showPrintAllModal, setShowPrintAllModal] = useState(false);
  const [showHistoryModal, setShowHistoryModal] = useState(false);
  const [editingCheckpoint, setEditingCheckpoint] = useState<PatrolCheckpoint | null>(null);
  const [qrCheckpoint, setQrCheckpoint] = useState<PatrolCheckpoint | null>(null);
  const [historyCheckpoint, setHistoryCheckpoint] = useState<PatrolCheckpoint | null>(null);
  const [scanHistory, setScanHistory] = useState<any[]>([]);
  const [formData, setFormData] = useState<CheckpointFormData>({
    site_id: '',
    name: '',
    description: '',
    checkpoint_code: generateCode(),
    location_label: '',
    lat: null,
    lng: null,
    expected_radius_meters: 25,
    sop_url: '',
    patrol_time: '',
    patrol_frequency: 'hourly',
    requires_photo: false,
    requires_comment: false,
  });
  const [formError, setFormError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [markNeedsRecapture, setMarkNeedsRecapture] = useState(false);
  const qrRef = useRef<HTMLDivElement>(null);
  const printAllRef = useRef<HTMLDivElement>(null);

  const loadCheckpoints = useCallback(async (siteId?: string) => {
    if (!companyId) { setLoading(false); return; }
    setLoading(true);
    let query = supabase
      .from('patrol_checkpoints')
      .select('*')
      .eq('company_id', companyId)
      .order('name', { ascending: true });
    if (siteId) query = query.eq('site_id', siteId);
    const { data } = await query;
    setCheckpoints(data || []);
    setLoading(false);
  }, [companyId]);

  const loadScanHistory = async (checkpointId: string) => {
    const { data } = await supabase
      .from('patrol_scans')
      .select(`*, guards(first_name, last_name)`)
      .eq('checkpoint_id', checkpointId)
      .eq('company_id', companyId)
      .order('scanned_at', { ascending: false })
      .limit(50);
    setScanHistory((data || []).map((row: any) => ({
      ...row,
      guard_name: row.guards?.first_name && row.guards?.last_name
        ? `${row.guards.first_name} ${row.guards.last_name}`
        : row.guards?.first_name || 'Unknown',
    })));
  };

  const handleCreate = async () => {
    if (!companyId || !formData.site_id || !formData.name || !formData.checkpoint_code) {
      setFormError('Site, name and code are required');
      return;
    }
    setSaving(true);
    setFormError(null);
    const { error } = await supabase.from('patrol_checkpoints').insert({
      company_id: companyId,
      site_id: formData.site_id,
      name: formData.name,
      description: formData.description || null,
      checkpoint_code: formData.checkpoint_code.toUpperCase().trim(),
      location_label: formData.location_label || null,
      lat: formData.lat,
      lng: formData.lng,
      expected_radius_meters: formData.expected_radius_meters || 25,
      allowed_radius_meters: formData.expected_radius_meters || 25,
      sop_url: formData.sop_url || null,
      patrol_time: formData.patrol_time || null,
      patrol_frequency: formData.patrol_frequency || 'hourly',
      requires_photo: formData.requires_photo,
      requires_comment: formData.requires_comment,
      is_active: true,
      gps_capture_status: 'pending',
    });
    if (error) setFormError(error.message);
    else {
      setShowCreateModal(false);
      setFormData({
        site_id: '',
        name: '',
        description: '',
        checkpoint_code: generateCode(),
        location_label: '',
        lat: null,
        lng: null,
        expected_radius_meters: 25,
        sop_url: '',
        patrol_time: '',
        patrol_frequency: 'hourly',
        requires_photo: false,
        requires_comment: false,
      });
      loadCheckpoints(selectedSiteId || undefined);
    }
    setSaving(false);
  };

  const handleUpdate = async () => {
    if (!editingCheckpoint || !formData.name || !formData.checkpoint_code) {
      setFormError('Name and code are required');
      return;
    }
    setSaving(true);
    setFormError(null);
    const updateData: any = {
      site_id: formData.site_id,
      name: formData.name,
      description: formData.description || null,
      checkpoint_code: formData.checkpoint_code.toUpperCase().trim(),
      location_label: formData.location_label || null,
      lat: formData.lat,
      lng: formData.lng,
      expected_radius_meters: formData.expected_radius_meters || 25,
      allowed_radius_meters: formData.expected_radius_meters || 25,
      sop_url: formData.sop_url || null,
      patrol_time: formData.patrol_time || null,
      patrol_frequency: formData.patrol_frequency || null,
      requires_photo: formData.requires_photo,
      requires_comment: formData.requires_comment,
    };
    if (markNeedsRecapture) {
      updateData.gps_capture_status = 'needs_recapture';
      updateData.approved_latitude = null;
      updateData.approved_longitude = null;
      updateData.approved_at = null;
      updateData.approved_by = null;
    }
    const { error } = await supabase
      .from('patrol_checkpoints')
      .update(updateData)
      .eq('id', editingCheckpoint.id)
      .eq('company_id', companyId);
    if (error) setFormError(error.message);
    else {
      setShowEditModal(false);
      setEditingCheckpoint(null);
      setMarkNeedsRecapture(false);
      loadCheckpoints(selectedSiteId || undefined);
    }
    setSaving(false);
  };

  const handleToggleActive = async (cp: PatrolCheckpoint) => {
    await supabase
      .from('patrol_checkpoints')
      .update({ is_active: !cp.is_active })
      .eq('id', cp.id)
      .eq('company_id', companyId);
    loadCheckpoints(selectedSiteId || undefined);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this checkpoint? This cannot be undone.')) return;
    await supabase.from('patrol_checkpoints').delete().eq('id', id).eq('company_id', companyId);
    loadCheckpoints(selectedSiteId || undefined);
  };

  const openEdit = (cp: PatrolCheckpoint) => {
    setEditingCheckpoint(cp);
    setFormData({
      site_id: cp.site_id,
      name: cp.name,
      description: cp.description || '',
      checkpoint_code: cp.checkpoint_code,
      location_label: cp.location_label || '',
      lat: cp.lat,
      lng: cp.lng,
      expected_radius_meters: cp.expected_radius_meters || cp.allowed_radius_meters || 25,
      sop_url: cp.sop_url || '',
      patrol_time: cp.patrol_time || '',
      patrol_frequency: cp.patrol_frequency || 'hourly',
      requires_photo: cp.requires_photo || false,
      requires_comment: cp.requires_comment || false,
    });
    setMarkNeedsRecapture(false);
    setFormError(null);
    setShowEditModal(true);
  };

  const openQR = (cp: PatrolCheckpoint) => {
    setQrCheckpoint(cp);
    setShowQRModal(true);
  };

  const openHistory = async (cp: PatrolCheckpoint) => {
    setHistoryCheckpoint(cp);
    await loadScanHistory(cp.id);
    setShowHistoryModal(true);
  };

  const filteredCheckpoints = selectedSiteId
    ? checkpoints.filter((c) => c.site_id === selectedSiteId)
    : checkpoints;

  const activeCount = filteredCheckpoints.filter((c) => c.is_active).length;
  const inactiveCount = filteredCheckpoints.filter((c) => !c.is_active).length;
  const gpsApprovedCount = filteredCheckpoints.filter((c) => c.gps_capture_status === 'approved').length;
  const gpsPendingCount = filteredCheckpoints.filter((c) => c.gps_capture_status === 'pending').length;
  const printAllSite = sites.find((s) => s.id === selectedSiteId);

  function downloadQRCanvas(el: HTMLDivElement, filename: string) {
    const svg = el.querySelector('svg');
    if (!svg) return;
    const svgData = new XMLSerializer().serializeToString(svg);
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const img = new Image();
    img.onload = () => {
      canvas.width = img.width;
      canvas.height = img.height + 140;
      ctx!.fillStyle = '#ffffff';
      ctx!.fillRect(0, 0, canvas.width, canvas.height);
      ctx!.drawImage(img, 0, 0);
      ctx!.font = 'bold 24px sans-serif';
      ctx!.fillStyle = '#111827';
      ctx!.textAlign = 'center';
      const cpName = el.getAttribute('data-cp-name') || '';
      ctx!.fillText(cpName, canvas.width / 2, img.height + 40);
      ctx!.font = '16px sans-serif';
      ctx!.fillStyle = '#6b7280';
      ctx!.fillText(el.getAttribute('data-site-name') || '', canvas.width / 2, img.height + 65);
      ctx!.font = '14px monospace';
      ctx!.fillStyle = '#9ca3af';
      ctx!.fillText(`ID: ${el.getAttribute('data-cp-code') || ''}`, canvas.width / 2, img.height + 90);
      ctx!.font = '13px sans-serif';
      ctx!.fillStyle = '#6b7280';
      ctx!.fillText('Install at checkpoint. Scan with GuardianHub to activate GPS.', canvas.width / 2, img.height + 115);
      const link = document.createElement('a');
      link.download = filename;
      link.href = canvas.toDataURL('image/png');
      link.click();
    };
    img.src = 'data:image/svg+xml;base64,' + btoa(svgData);
  }

  return (
    <FeatureGate feature="hasPatrolManagement">
    <div className="min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-2xl font-bold text-white">Patrol Checkpoints</h1>
            <p className="text-gray-400 text-sm mt-1">Create and manage QR-enabled patrol checkpoints with GPS verification</p>
          </div>
          <div className="flex items-center gap-3">
            {selectedSiteId && filteredCheckpoints.length > 0 && (
              <button
                onClick={() => setShowPrintAllModal(true)}
                className="inline-flex items-center gap-2 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white text-sm font-medium rounded-lg transition-colors cursor-pointer whitespace-nowrap"
              >
                <div className="w-4 h-4 flex items-center justify-center"><i className="ri-printer-line"></i></div>
                Print All QR Codes
              </button>
            )}
            <button
              onClick={() => {
                setFormData({
                  site_id: selectedSiteId || '',
                  name: '',
                  description: '',
                  checkpoint_code: generateCode(),
                  location_label: '',
                  lat: null,
                  lng: null,
                  expected_radius_meters: 25,
                  sop_url: '',
                  patrol_time: '',
                  patrol_frequency: 'hourly',
                  requires_photo: false,
                  requires_comment: false,
                });
                setFormError(null);
                setShowCreateModal(true);
              }}
              className="inline-flex items-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-500 text-white text-sm font-medium rounded-lg transition-colors cursor-pointer whitespace-nowrap"
            >
              <div className="w-4 h-4 flex items-center justify-center"><i className="ri-add-line"></i></div>
              Create Checkpoint
            </button>
          </div>
        </div>

        <div className="flex items-center gap-3 mb-6">
          <div className="w-5 h-5 flex items-center justify-center text-gray-500">
            <i className="ri-building-line text-sm"></i>
          </div>
          <select
            value={selectedSiteId}
            onChange={(e) => {
              setSelectedSiteId(e.target.value);
              loadCheckpoints(e.target.value || undefined);
            }}
            className="bg-[#0f172a]/70 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-blue-500 min-w-[200px]"
          >
            <option value="">All Sites</option>
            {sites.map((s) => (
              <option key={s.id} value={s.id}>{s.site_name}</option>
            ))}
          </select>
          <span className="text-sm text-gray-500">
            {activeCount} active · {inactiveCount} inactive · {gpsApprovedCount} GPS approved · {gpsPendingCount} pending
          </span>
        </div>

        {loading ? (
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
          </div>
        ) : filteredCheckpoints.length === 0 ? (
          <div className="bg-[#0f172a]/70 backdrop-blur-sm border border-white/10 rounded-xl p-12 text-center">
            <div className="w-16 h-16 flex items-center justify-center bg-white/5 rounded-full mx-auto mb-4">
              <i className="ri-qr-code-line text-gray-500 text-2xl"></i>
            </div>
            <p className="text-gray-400 font-medium">No checkpoints yet</p>
            <p className="text-sm text-gray-500 mt-1">Create your first patrol checkpoint to start tracking</p>
          </div>
        ) : (
          <div className="bg-[#0f172a]/70 backdrop-blur-sm border border-white/10 rounded-xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-white/10">
                    <th className="text-left px-4 py-3 text-xs font-medium text-gray-400 uppercase tracking-wider">Checkpoint</th>
                    <th className="text-left px-4 py-3 text-xs font-medium text-gray-400 uppercase tracking-wider">Site</th>
                    <th className="text-left px-4 py-3 text-xs font-medium text-gray-400 uppercase tracking-wider">Code</th>
                    <th className="text-left px-4 py-3 text-xs font-medium text-gray-400 uppercase tracking-wider">GPS Status</th>
                    <th className="text-left px-4 py-3 text-xs font-medium text-gray-400 uppercase tracking-wider">GPS / Radius</th>
                    <th className="text-left px-4 py-3 text-xs font-medium text-gray-400 uppercase tracking-wider">Schedule</th>
                    <th className="text-left px-4 py-3 text-xs font-medium text-gray-400 uppercase tracking-wider">Photo / Comment</th>
                    <th className="text-left px-4 py-3 text-xs font-medium text-gray-400 uppercase tracking-wider">Status</th>
                    <th className="text-right px-4 py-3 text-xs font-medium text-gray-400 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {filteredCheckpoints.map((cp) => {
                    const site = sites.find((s) => s.id === cp.site_id);
                    const gpsBadge = gpsStatusBadge(cp.gps_capture_status || 'pending');
                    const activeStatus = cp.is_active
                      ? { label: 'Active', color: 'text-emerald-400', bg: 'bg-emerald-500/10', border: 'border-emerald-500/20' }
                      : { label: 'Inactive', color: 'text-gray-400', bg: 'bg-gray-500/10', border: 'border-gray-500/20' };
                    return (
                      <tr key={cp.id} className="hover:bg-white/[0.02] transition-colors">
                        <td className="px-4 py-3">
                          <p className="text-sm font-medium text-white">{cp.name}</p>
                          {cp.location_label && <p className="text-xs text-gray-500 mt-0.5">{cp.location_label}</p>}
                          {cp.description && <p className="text-xs text-gray-600">{cp.description}</p>}
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-400">{site?.site_name || '—'}</td>
                        <td className="px-4 py-3">
                          <span className="inline-flex items-center gap-1 px-2 py-1 bg-blue-500/10 border border-blue-500/20 rounded text-xs font-mono text-blue-400">
                            <i className="ri-qr-code-line text-[10px]"></i>
                            {cp.checkpoint_code}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium border ${gpsBadge.bg} ${gpsBadge.border} ${gpsBadge.color}`}>
                            {gpsBadge.label}
                          </span>
                          {cp.approved_at && (
                            <p className="text-[10px] text-gray-600 mt-0.5">{new Date(cp.approved_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}</p>
                          )}
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-400">
                          {cp.approved_latitude != null && cp.approved_longitude != null ? (
                            <span className="text-xs text-emerald-400">{cp.approved_latitude.toFixed(5)}, {cp.approved_longitude.toFixed(5)}<br/><span className="text-gray-500">±{cp.expected_radius_meters || cp.allowed_radius_meters || 25}m</span></span>
                          ) : cp.lat != null && cp.lng != null ? (
                            <span className="text-xs text-amber-400">{cp.lat.toFixed(5)}, {cp.lng.toFixed(5)}<br/><span className="text-gray-500">(not approved) ±{cp.expected_radius_meters || cp.allowed_radius_meters || 25}m</span></span>
                          ) : (
                            <span className="text-xs text-gray-600">No GPS set</span>
                          )}
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-400">
                          {cp.patrol_time ? (
                            <span className="text-xs">{cp.patrol_time}<br/>{cp.patrol_frequency}</span>
                          ) : (
                            <span className="text-xs text-gray-600">—</span>
                          )}
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-1.5">
                            {cp.requires_photo && <span className="text-[10px] text-blue-400"><i className="ri-camera-line"></i></span>}
                            {cp.requires_comment && <span className="text-[10px] text-blue-400"><i className="ri-chat-1-line"></i></span>}
                            {!cp.requires_photo && !cp.requires_comment && <span className="text-[10px] text-gray-600">—</span>}
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium border ${activeStatus.bg} ${activeStatus.border} ${activeStatus.color}`}>
                            {activeStatus.label}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center justify-end gap-1">
                            <button onClick={() => openQR(cp)} className="w-8 h-8 flex items-center justify-center text-blue-400 hover:bg-blue-500/10 rounded-lg transition-colors cursor-pointer" title="QR Code">
                              <i className="ri-qr-code-line text-sm"></i>
                            </button>
                            <button onClick={() => openHistory(cp)} className="w-8 h-8 flex items-center justify-center text-gray-400 hover:bg-white/5 rounded-lg transition-colors cursor-pointer" title="Scan History">
                              <i className="ri-history-line text-sm"></i>
                            </button>
                            <button onClick={() => openEdit(cp)} className="w-8 h-8 flex items-center justify-center text-gray-400 hover:bg-white/5 rounded-lg transition-colors cursor-pointer" title="Edit">
                              <i className="ri-edit-line text-sm"></i>
                            </button>
                            <button onClick={() => handleToggleActive(cp)} className="w-8 h-8 flex items-center justify-center text-gray-400 hover:bg-white/5 rounded-lg transition-colors cursor-pointer" title={cp.is_active ? 'Deactivate' : 'Activate'}>
                              <i className={`${cp.is_active ? 'ri-eye-off-line' : 'ri-eye-line'} text-sm`}></i>
                            </button>
                            <button onClick={() => handleDelete(cp.id)} className="w-8 h-8 flex items-center justify-center text-red-400 hover:bg-red-500/10 rounded-lg transition-colors cursor-pointer" title="Delete">
                              <i className="ri-delete-bin-line text-sm"></i>
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* Create Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-black/70" onClick={() => setShowCreateModal(false)}></div>
          <div className="relative bg-[#0f172a] border border-white/10 rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto shadow-2xl">
            <div className="flex items-center justify-between p-5 border-b border-white/10">
              <h2 className="text-lg font-semibold text-white">Create Checkpoint</h2>
              <button onClick={() => setShowCreateModal(false)} className="w-8 h-8 flex items-center justify-center text-gray-400 hover:text-white cursor-pointer">
                <i className="ri-close-line"></i>
              </button>
            </div>
            <div className="p-5 space-y-4">
              {formError && (
                <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-3 text-sm text-red-400">{formError}</div>
              )}
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1.5">Site *</label>
                <select value={formData.site_id} onChange={(e) => setFormData({ ...formData, site_id: e.target.value })} className="w-full bg-[#0a0e1a] border border-white/10 rounded-lg px-3 py-2.5 text-sm text-white focus:outline-none focus:border-blue-500">
                  <option value="">Select a site</option>
                  {sites.map((s) => (<option key={s.id} value={s.id}>{s.site_name}</option>))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1.5">Checkpoint Name *</label>
                <input type="text" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} className="w-full bg-[#0a0e1a] border border-white/10 rounded-lg px-3 py-2.5 text-sm text-white focus:outline-none focus:border-blue-500" placeholder="e.g. Main Gate North" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1.5">Location Label</label>
                <input type="text" value={formData.location_label} onChange={(e) => setFormData({ ...formData, location_label: e.target.value })} className="w-full bg-[#0a0e1a] border border-white/10 rounded-lg px-3 py-2.5 text-sm text-white focus:outline-none focus:border-blue-500" placeholder="e.g. Near the staff entrance, left wall" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1.5">Description</label>
                <input type="text" value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} className="w-full bg-[#0a0e1a] border border-white/10 rounded-lg px-3 py-2.5 text-sm text-white focus:outline-none focus:border-blue-500" placeholder="What to check at this checkpoint" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1.5">Checkpoint Code *</label>
                <div className="flex gap-2">
                  <input type="text" value={formData.checkpoint_code} onChange={(e) => setFormData({ ...formData, checkpoint_code: e.target.value.toUpperCase() })} className="flex-1 bg-[#0a0e1a] border border-white/10 rounded-lg px-3 py-2.5 text-sm text-white font-mono focus:outline-none focus:border-blue-500" placeholder="AUTO-GENERATED" />
                  <button onClick={() => setFormData({ ...formData, checkpoint_code: generateCode() })} className="px-3 py-2.5 bg-white/5 border border-white/10 rounded-lg text-sm text-gray-400 hover:text-white transition-colors cursor-pointer whitespace-nowrap">Regenerate</button>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1.5">Expected GPS Radius (meters)</label>
                <input type="number" value={formData.expected_radius_meters} onChange={(e) => setFormData({ ...formData, expected_radius_meters: parseInt(e.target.value) || 25 })} className="w-full bg-[#0a0e1a] border border-white/10 rounded-lg px-3 py-2.5 text-sm text-white focus:outline-none focus:border-blue-500" />
                <p className="text-[10px] text-gray-600 mt-1">GPS will be captured when admin scans the QR at this location. This radius is the allowable distance.</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1.5">Patrol Time</label>
                <input type="time" value={formData.patrol_time} onChange={(e) => setFormData({ ...formData, patrol_time: e.target.value })} className="w-full bg-[#0a0e1a] border border-white/10 rounded-lg px-3 py-2.5 text-sm text-white focus:outline-none focus:border-blue-500" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1.5">Patrol Frequency</label>
                <select value={formData.patrol_frequency} onChange={(e) => setFormData({ ...formData, patrol_frequency: e.target.value })} className="w-full bg-[#0a0e1a] border border-white/10 rounded-lg px-3 py-2.5 text-sm text-white focus:outline-none focus:border-blue-500">
                  <option value="hourly">Hourly</option><option value="every_2_hours">Every 2 Hours</option><option value="every_4_hours">Every 4 Hours</option><option value="every_6_hours">Every 6 Hours</option><option value="daily">Daily</option><option value="shift_start">Shift Start</option><option value="custom">Custom</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1.5">SOP URL</label>
                <input type="url" value={formData.sop_url} onChange={(e) => setFormData({ ...formData, sop_url: e.target.value })} className="w-full bg-[#0a0e1a] border border-white/10 rounded-lg px-3 py-2.5 text-sm text-white focus:outline-none focus:border-blue-500" placeholder="https://..." />
              </div>
              <div className="flex items-center gap-6">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" checked={formData.requires_photo} onChange={(e) => setFormData({ ...formData, requires_photo: e.target.checked })} className="rounded bg-[#0a0e1a] border-white/20 text-blue-600 focus:ring-blue-600" />
                  <span className="text-sm text-gray-400">Require photo</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" checked={formData.requires_comment} onChange={(e) => setFormData({ ...formData, requires_comment: e.target.checked })} className="rounded bg-[#0a0e1a] border-white/20 text-blue-600 focus:ring-blue-600" />
                  <span className="text-sm text-gray-400">Require comment</span>
                </label>
              </div>
            </div>
            <div className="flex items-center justify-end gap-3 p-5 border-t border-white/10">
              <button onClick={() => setShowCreateModal(false)} className="px-4 py-2 text-sm text-gray-400 hover:text-white transition-colors cursor-pointer whitespace-nowrap">Cancel</button>
              <button onClick={handleCreate} disabled={saving} className="px-4 py-2 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white text-sm font-medium rounded-lg transition-colors cursor-pointer whitespace-nowrap">{saving ? 'Creating...' : 'Create Checkpoint'}</button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {showEditModal && editingCheckpoint && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-black/70" onClick={() => setShowEditModal(false)}></div>
          <div className="relative bg-[#0f172a] border border-white/10 rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto shadow-2xl">
            <div className="flex items-center justify-between p-5 border-b border-white/10">
              <h2 className="text-lg font-semibold text-white">Edit Checkpoint</h2>
              <button onClick={() => setShowEditModal(false)} className="w-8 h-8 flex items-center justify-center text-gray-400 hover:text-white cursor-pointer">
                <i className="ri-close-line"></i>
              </button>
            </div>
            <div className="p-5 space-y-4">
              {formError && (
                <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-3 text-sm text-red-400">{formError}</div>
              )}
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1.5">Site *</label>
                <select value={formData.site_id} onChange={(e) => setFormData({ ...formData, site_id: e.target.value })} className="w-full bg-[#0a0e1a] border border-white/10 rounded-lg px-3 py-2.5 text-sm text-white focus:outline-none focus:border-blue-500">
                  <option value="">Select a site</option>
                  {sites.map((s) => (<option key={s.id} value={s.id}>{s.site_name}</option>))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1.5">Checkpoint Name *</label>
                <input type="text" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} className="w-full bg-[#0a0e1a] border border-white/10 rounded-lg px-3 py-2.5 text-sm text-white focus:outline-none focus:border-blue-500" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1.5">Location Label</label>
                <input type="text" value={formData.location_label} onChange={(e) => setFormData({ ...formData, location_label: e.target.value })} className="w-full bg-[#0a0e1a] border border-white/10 rounded-lg px-3 py-2.5 text-sm text-white focus:outline-none focus:border-blue-500" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1.5">Description</label>
                <input type="text" value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} className="w-full bg-[#0a0e1a] border border-white/10 rounded-lg px-3 py-2.5 text-sm text-white focus:outline-none focus:border-blue-500" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1.5">Checkpoint Code *</label>
                <input type="text" value={formData.checkpoint_code} onChange={(e) => setFormData({ ...formData, checkpoint_code: e.target.value.toUpperCase() })} className="w-full bg-[#0a0e1a] border border-white/10 rounded-lg px-3 py-2.5 text-sm text-white font-mono focus:outline-none focus:border-blue-500" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1.5">Expected GPS Radius (meters)</label>
                <input type="number" value={formData.expected_radius_meters} onChange={(e) => setFormData({ ...formData, expected_radius_meters: parseInt(e.target.value) || 25 })} className="w-full bg-[#0a0e1a] border border-white/10 rounded-lg px-3 py-2.5 text-sm text-white focus:outline-none focus:border-blue-500" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1.5">Patrol Time</label>
                <input type="time" value={formData.patrol_time} onChange={(e) => setFormData({ ...formData, patrol_time: e.target.value })} className="w-full bg-[#0a0e1a] border border-white/10 rounded-lg px-3 py-2.5 text-sm text-white focus:outline-none focus:border-blue-500" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1.5">Patrol Frequency</label>
                <select value={formData.patrol_frequency} onChange={(e) => setFormData({ ...formData, patrol_frequency: e.target.value })} className="w-full bg-[#0a0e1a] border border-white/10 rounded-lg px-3 py-2.5 text-sm text-white focus:outline-none focus:border-blue-500">
                  <option value="hourly">Hourly</option><option value="every_2_hours">Every 2 Hours</option><option value="every_4_hours">Every 4 Hours</option><option value="every_6_hours">Every 6 Hours</option><option value="daily">Daily</option><option value="shift_start">Shift Start</option><option value="custom">Custom</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1.5">SOP URL</label>
                <input type="url" value={formData.sop_url} onChange={(e) => setFormData({ ...formData, sop_url: e.target.value })} className="w-full bg-[#0a0e1a] border border-white/10 rounded-lg px-3 py-2.5 text-sm text-white focus:outline-none focus:border-blue-500" />
              </div>
              <div className="flex items-center gap-6">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" checked={formData.requires_photo} onChange={(e) => setFormData({ ...formData, requires_photo: e.target.checked })} className="rounded bg-[#0a0e1a] border-white/20 text-blue-600 focus:ring-blue-600" />
                  <span className="text-sm text-gray-400">Require photo</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" checked={formData.requires_comment} onChange={(e) => setFormData({ ...formData, requires_comment: e.target.checked })} className="rounded bg-[#0a0e1a] border-white/20 text-blue-600 focus:ring-blue-600" />
                  <span className="text-sm text-gray-400">Require comment</span>
                </label>
              </div>
              {editingCheckpoint.gps_capture_status === 'approved' && (
                <div className="bg-amber-500/10 border border-amber-500/20 rounded-lg p-4">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input type="checkbox" checked={markNeedsRecapture} onChange={(e) => setMarkNeedsRecapture(e.target.checked)} className="rounded bg-[#0a0e1a] border-amber-500/30 text-amber-600 focus:ring-amber-600" />
                    <span className="text-sm text-amber-400">Mark GPS as needs recapture (clears approved location)</span>
                  </label>
                </div>
              )}
            </div>
            <div className="flex items-center justify-end gap-3 p-5 border-t border-white/10">
              <button onClick={() => setShowEditModal(false)} className="px-4 py-2 text-sm text-gray-400 hover:text-white transition-colors cursor-pointer whitespace-nowrap">Cancel</button>
              <button onClick={handleUpdate} disabled={saving} className="px-4 py-2 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white text-sm font-medium rounded-lg transition-colors cursor-pointer whitespace-nowrap">{saving ? 'Saving...' : 'Save Changes'}</button>
            </div>
          </div>
        </div>
      )}

      {/* Single QR Code Modal */}
      {showQRModal && qrCheckpoint && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-black/70" onClick={() => setShowQRModal(false)}></div>
          <div className="relative bg-white rounded-2xl w-full max-w-sm shadow-2xl overflow-hidden">
            <div className="flex items-center justify-between p-4 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900">Checkpoint QR</h2>
              <button onClick={() => setShowQRModal(false)} className="w-8 h-8 flex items-center justify-center text-gray-500 hover:text-gray-900 cursor-pointer">
                <i className="ri-close-line"></i>
              </button>
            </div>
            <div className="p-6 text-center" ref={qrRef}>
              <div className="inline-block bg-white p-4 rounded-xl border-2 border-gray-200">
                <QRCodeSVG value={getScanUrl(qrCheckpoint.checkpoint_code)} size={220} level="H" includeMargin={true} />
              </div>
              <div className="mt-4 space-y-1">
                <p className="text-lg font-bold text-gray-900">{qrCheckpoint.name}</p>
                <p className="text-sm text-gray-500">{sites.find((s) => s.id === qrCheckpoint.site_id)?.site_name}</p>
                <p className="text-xs font-mono text-gray-400 mt-2">ID: {qrCheckpoint.checkpoint_code}</p>
                <p className="text-xs text-gray-500 mt-1">Install at checkpoint. Scan with GuardianHub to activate GPS.</p>
              </div>
            </div>
            <div className="p-4 border-t border-gray-200 bg-gray-50">
              <button
                onClick={() => downloadQRCanvas(qrRef.current!, `checkpoint-${qrCheckpoint.checkpoint_code}.png`)}
                className="w-full py-2.5 bg-blue-600 hover:bg-blue-500 text-white text-sm font-medium rounded-lg transition-colors cursor-pointer whitespace-nowrap"
              >
                <div className="w-4 h-4 flex items-center justify-center inline-block mr-1.5"><i className="ri-download-line"></i></div>
                Download QR Code
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Print All QR Codes Modal */}
      {showPrintAllModal && selectedSiteId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-black/70" onClick={() => setShowPrintAllModal(false)}></div>
          <div className="relative bg-white rounded-2xl w-full max-w-4xl max-h-[85vh] overflow-y-auto shadow-2xl" ref={printAllRef}>
            <div className="flex items-center justify-between p-5 border-b border-gray-200 sticky top-0 bg-white z-10">
              <div>
                <h2 className="text-lg font-semibold text-gray-900">Print All QR Codes</h2>
                <p className="text-sm text-gray-500">{printAllSite?.site_name} — {filteredCheckpoints.length} checkpoints</p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    const container = printAllRef.current;
                    if (!container) return;
                    const qrDivs = container.querySelectorAll('[data-qr-print]');
                    qrDivs.forEach((div, i) => {
                      setTimeout(() => {
                        downloadQRCanvas(div as HTMLDivElement, `checkpoint-${div.getAttribute('data-cp-code')}.png`);
                      }, i * 300);
                    });
                  }}
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-sm font-medium rounded-lg transition-colors cursor-pointer whitespace-nowrap"
                >
                  <i className="ri-download-line mr-1.5"></i>Download All
                </button>
                <button onClick={() => setShowPrintAllModal(false)} className="w-8 h-8 flex items-center justify-center text-gray-500 hover:text-gray-900 cursor-pointer">
                  <i className="ri-close-line"></i>
                </button>
              </div>
            </div>
            <div className="p-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredCheckpoints.map((cp, idx) => (
                <div key={cp.id} className="text-center border-2 border-gray-200 rounded-xl p-4" data-qr-print data-cp-name={cp.name} data-cp-code={cp.checkpoint_code} data-site-name={printAllSite?.site_name || ''}>
                  <div className="bg-white p-2 rounded-lg inline-block mb-3">
                    <QRCodeSVG value={getScanUrl(cp.checkpoint_code)} size={140} level="H" includeMargin={true} />
                  </div>
                  <p className="text-sm font-bold text-gray-900">{cp.name}</p>
                  <p className="text-xs text-gray-500">{cp.checkpoint_code}</p>
                  <p className="text-[10px] text-gray-400 mt-1">#{idx + 1} · {printAllSite?.site_name}</p>
                  <p className="text-[10px] text-gray-400 mt-2">Install at checkpoint location. Scan with GuardianHub to activate GPS.</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* History Modal */}
      {showHistoryModal && historyCheckpoint && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-black/70" onClick={() => setShowHistoryModal(false)}></div>
          <div className="relative bg-[#0f172a] border border-white/10 rounded-2xl w-full max-w-2xl max-h-[80vh] overflow-hidden shadow-2xl">
            <div className="flex items-center justify-between p-5 border-b border-white/10">
              <div>
                <h2 className="text-lg font-semibold text-white">Scan History</h2>
                <p className="text-sm text-gray-400">{historyCheckpoint.name} · {historyCheckpoint.checkpoint_code}</p>
              </div>
              <button onClick={() => setShowHistoryModal(false)} className="w-8 h-8 flex items-center justify-center text-gray-400 hover:text-white cursor-pointer">
                <i className="ri-close-line"></i>
              </button>
            </div>
            <div className="overflow-y-auto max-h-[60vh]">
              {scanHistory.length === 0 ? (
                <div className="p-12 text-center">
                  <div className="w-12 h-12 flex items-center justify-center bg-white/5 rounded-full mx-auto mb-3">
                    <i className="ri-history-line text-gray-500 text-xl"></i>
                  </div>
                  <p className="text-gray-400 text-sm">No scans yet</p>
                </div>
              ) : (
                <table className="w-full">
                  <thead className="sticky top-0 bg-[#0f172a]">
                    <tr className="border-b border-white/10">
                      <th className="text-left px-4 py-3 text-xs font-medium text-gray-400 uppercase">Guard</th>
                      <th className="text-left px-4 py-3 text-xs font-medium text-gray-400 uppercase">Scanned At</th>
                      <th className="text-left px-4 py-3 text-xs font-medium text-gray-400 uppercase">GPS Status</th>
                      <th className="text-left px-4 py-3 text-xs font-medium text-gray-400 uppercase">Distance</th>
                      <th className="text-left px-4 py-3 text-xs font-medium text-gray-400 uppercase">Scan Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {scanHistory.map((scan) => {
                      const ssBadge = getScanStatusBadge(scan.gps_status || scan.scan_status || scan.status);
                      return (
                        <tr key={scan.id}>
                          <td className="px-4 py-3 text-sm text-white">{scan.guard_name}</td>
                          <td className="px-4 py-3 text-sm text-gray-400">
                            {new Date(scan.scanned_at).toLocaleString('en-GB', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}
                          </td>
                          <td className="px-4 py-3">
                            <span className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-medium ${ssBadge.bg} ${ssBadge.color}`}>
                              {ssBadge.label}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-sm text-gray-400">
                            {scan.distance_from_checkpoint != null ? `${Math.round(scan.distance_from_checkpoint)}m` : '—'}
                          </td>
                          <td className="px-4 py-3">
                            {scan.scan_status || scan.status === 'completed' ? (
                              <span className="text-[10px] text-emerald-400">OK</span>
                            ) : scan.status === 'completed_outside_radius' ? (
                              <span className="text-[10px] text-amber-400">Out Radius</span>
                            ) : (
                              <span className="text-[10px] text-gray-400">{scan.scan_status || scan.status}</span>
                            )}
                            {scan.photo_url && (
                              <span className="ml-1 text-[10px] text-blue-400"><i className="ri-camera-line"></i></span>
                            )}
                            {scan.comment && (
                              <span className="ml-1 text-[10px] text-blue-400"><i className="ri-chat-1-line"></i></span>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
    </FeatureGate>
  );
}