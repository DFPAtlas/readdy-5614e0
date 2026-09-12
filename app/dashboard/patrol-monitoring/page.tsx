'use client';

import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/lib/auth';
import { useSites } from '@/lib/useSites';
import { supabase } from '@/lib/supabase';
import { FeatureGate } from '@/lib/useEntitlements';

interface PatrolScanSummary {
  id: string;
  site_id: string;
  site_name: string;
  checkpoint_id: string;
  checkpoint_name: string;
  checkpoint_code: string;
  guard_id: string;
  guard_name: string;
  scanned_at: string;
  phone_latitude: number | null;
  phone_longitude: number | null;
  distance_from_checkpoint: number | null;
  gps_status: string | null;
  gps_verified: boolean;
  scan_status: string | null;
  status: string;
  scheduled_patrol_time: string | null;
  sop_url: string | null;
  photo_url: string | null;
  comment: string | null;
}

function gpsStatusBadge(status: string | null) {
  if (!status) return { label: '—', color: 'text-gray-400', bg: 'bg-gray-500/10', border: 'border-gray-500/20' };
  switch (status) {
    case 'verified': return { label: 'Verified', color: 'text-emerald-400', bg: 'bg-emerald-500/10', border: 'border-emerald-500/20' };
    case 'outside_radius': return { label: 'Out Radius', color: 'text-amber-400', bg: 'bg-amber-500/10', border: 'border-amber-500/20' };
    case 'gps_unavailable': return { label: 'No GPS', color: 'text-red-400', bg: 'bg-red-500/10', border: 'border-red-500/20' };
    case 'gps_permission_denied': case 'error': return { label: 'GPS Denied', color: 'text-red-400', bg: 'bg-red-500/10', border: 'border-red-500/20' };
    case 'gps_low_accuracy': return { label: 'Low Acc', color: 'text-amber-400', bg: 'bg-amber-500/10', border: 'border-amber-500/20' };
    case 'checkpoint_not_approved': return { label: 'Not Approved', color: 'text-red-400', bg: 'bg-red-500/10', border: 'border-red-500/20' };
    case 'manual_review_required': return { label: 'Review', color: 'text-blue-400', bg: 'bg-blue-500/10', border: 'border-blue-500/20' };
    default: return { label: status, color: 'text-gray-400', bg: 'bg-gray-500/10', border: 'border-gray-500/20' };
  }
}

function scanStatusBadge(status: string | null) {
  if (!status) return { label: '—', color: 'text-gray-400', bg: 'bg-gray-500/10', border: 'border-gray-500/20' };
  switch (status) {
    case 'valid': case 'completed': return { label: 'Valid', color: 'text-emerald-400', bg: 'bg-emerald-500/10', border: 'border-emerald-500/20' };
    case 'late': return { label: 'Late', color: 'text-amber-400', bg: 'bg-amber-500/10', border: 'border-amber-500/20' };
    case 'missed': return { label: 'Missed', color: 'text-red-400', bg: 'bg-red-500/10', border: 'border-red-500/20' };
    case 'manual_review': return { label: 'Review', color: 'text-blue-400', bg: 'bg-blue-500/10', border: 'border-blue-500/20' };
    case 'duplicate': return { label: 'Duplicate', color: 'text-gray-400', bg: 'bg-gray-500/10', border: 'border-gray-500/20' };
    case 'unassigned_site': return { label: 'Wrong Site', color: 'text-red-400', bg: 'bg-red-500/10', border: 'border-red-500/20' };
    case 'invalid_checkpoint': return { label: 'Invalid CP', color: 'text-red-400', bg: 'bg-red-500/10', border: 'border-red-500/20' };
    default: return { label: status, color: 'text-gray-400', bg: 'bg-gray-500/10', border: 'border-gray-500/20' };
  }
}

function formatScanTime(dateStr: string) {
  const d = new Date(dateStr);
  return d.toLocaleString('en-GB', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' });
}

export default function DashboardPatrolMonitoringPage() {
  const { companyId } = useAuth();
  const { sites } = useSites();
  const [scans, setScans] = useState<PatrolScanSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [filterSiteId, setFilterSiteId] = useState<string>('');
  const [filterGps, setFilterGps] = useState<string>('all');
  const [dateRange, setDateRange] = useState<'today' | 'week' | 'month'>('today');

  const loadScans = useCallback(async () => {
    if (!companyId) { setLoading(false); return; }
    setLoading(true);
    let startDate = new Date();
    startDate.setHours(0, 0, 0, 0);
    if (dateRange === 'week') startDate = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    if (dateRange === 'month') startDate = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);

    let query = supabase
      .from('patrol_scans')
      .select(`id,site_id,checkpoint_id,guard_id,scanned_at,phone_latitude,phone_longitude,distance_from_checkpoint,status,gps_status,gps_verified,scan_status,photo_url,comment,patrol_checkpoints(name,checkpoint_code,sop_url,patrol_time),guards(first_name,last_name),sites(site_name)`)
      .eq('company_id', companyId)
      .gte('scanned_at', startDate.toISOString())
      .order('scanned_at', { ascending: false })
      .limit(500);
    if (filterSiteId) query = query.eq('site_id', filterSiteId);
    if (filterStatus !== 'all') query = query.eq('scan_status', filterStatus);
    if (filterGps !== 'all') query = query.eq('gps_status', filterGps);
    const { data } = await query;
    setScans((data || []).map((row: any) => ({
      id: row.id, site_id: row.site_id, site_name: row.sites?.site_name || '',
      checkpoint_id: row.checkpoint_id, checkpoint_name: row.patrol_checkpoints?.name || '',
      checkpoint_code: row.patrol_checkpoints?.checkpoint_code || '', guard_id: row.guard_id,
      guard_name: row.guards?.first_name && row.guards?.last_name ? `${row.guards.first_name} ${row.guards.last_name}` : row.guards?.first_name || 'Unknown',
      scanned_at: row.scanned_at, phone_latitude: row.phone_latitude, phone_longitude: row.phone_longitude,
      distance_from_checkpoint: row.distance_from_checkpoint, status: row.status,
      gps_status: row.gps_status, gps_verified: row.gps_verified, scan_status: row.scan_status,
      scheduled_patrol_time: row.patrol_checkpoints?.patrol_time || null,
      sop_url: row.patrol_checkpoints?.sop_url || null, photo_url: row.photo_url, comment: row.comment,
    })));
    setLoading(false);
  }, [companyId, filterSiteId, filterStatus, filterGps, dateRange]);

  useEffect(() => { loadScans(); const i = setInterval(loadScans, 60000); return () => clearInterval(i); }, [loadScans]);

  const verifiedCount = scans.filter(s => s.gps_verified).length;
  const outsideCount = scans.filter(s => s.gps_status === 'outside_radius').length;
  const noGpsCount = scans.filter(s => s.gps_status === 'gps_unavailable' || s.gps_status === 'gps_permission_denied').length;
  const notApprovedCount = scans.filter(s => s.gps_status === 'checkpoint_not_approved').length;
  const reviewCount = scans.filter(s => s.scan_status === 'manual_review').length;

  function exportCSV() {
    const headers = ['Site','Checkpoint','Code','Guard','Scheduled','Scanned At','GPS Lat','GPS Lng','Distance','GPS Status','Scan Status','Photo','Comment','SOP URL'];
    const rows = scans.map(s => [s.site_name,s.checkpoint_name,s.checkpoint_code,s.guard_name,s.scheduled_patrol_time||'',new Date(s.scanned_at).toISOString(),s.phone_latitude??'',s.phone_longitude??'',s.distance_from_checkpoint!=null?Math.round(s.distance_from_checkpoint):'',s.gps_status||'',s.scan_status||'',s.photo_url?'Yes':'',s.comment||'',s.sop_url||'']);
    const csv = [headers.join(','),...rows.map(r=>r.map(c=>`"${String(c).replace(/"/g,'""')}"`).join(','))].join('\n');
    const blob = new Blob([csv],{type:'text/csv'});
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a'); a.href = url; a.download = `patrol-scans-${new Date().toISOString().slice(0,10)}.csv`; a.click(); URL.revokeObjectURL(url);
  }

  return (
    <FeatureGate feature="hasPatrolManagement">
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div><h1 className="text-2xl font-bold text-white">Patrol Monitoring</h1><p className="text-gray-400 text-sm mt-1">Company-wide patrol tracking with GPS verification</p></div>
        <button onClick={exportCSV} className="inline-flex items-center gap-2 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white text-sm font-medium rounded-lg transition-colors cursor-pointer whitespace-nowrap"><div className="w-4 h-4 flex items-center justify-center"><i className="ri-download-line"></i></div>Export CSV</button>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-6 gap-4">
        <div className="bg-[#0f172a]/70 backdrop-blur-sm border border-white/10 rounded-xl p-5"><div className="flex items-center gap-2 text-gray-400 text-sm mb-2"><div className="w-4 h-4 flex items-center justify-center"><i className="ri-route-line"></i></div>Total</div><div className="text-3xl font-bold text-white">{scans.length}</div></div>
        <div className="bg-emerald-500/[0.08] backdrop-blur-sm border border-emerald-500/20 rounded-xl p-5"><div className="flex items-center gap-2 text-emerald-300 text-sm mb-2"><div className="w-4 h-4 flex items-center justify-center"><i className="ri-check-double-line"></i></div>GPS Verified</div><div className="text-3xl font-bold text-emerald-400">{verifiedCount}</div></div>
        <div className="bg-amber-500/[0.08] backdrop-blur-sm border border-amber-500/20 rounded-xl p-5"><div className="flex items-center gap-2 text-amber-300 text-sm mb-2"><div className="w-4 h-4 flex items-center justify-center"><i className="ri-map-pin-line"></i></div>Out Radius</div><div className="text-3xl font-bold text-amber-400">{outsideCount}</div></div>
        <div className="bg-red-500/[0.08] backdrop-blur-sm border border-red-500/20 rounded-xl p-5"><div className="flex items-center gap-2 text-red-300 text-sm mb-2"><div className="w-4 h-4 flex items-center justify-center"><i className="ri-close-circle-line"></i></div>No GPS</div><div className="text-3xl font-bold text-red-400">{noGpsCount}</div></div>
        <div className="bg-red-500/[0.08] backdrop-blur-sm border border-red-500/20 rounded-xl p-5"><div className="flex items-center gap-2 text-red-300 text-sm mb-2"><div className="w-4 h-4 flex items-center justify-center"><i className="ri-error-warning-line"></i></div>Not Approved</div><div className="text-3xl font-bold text-red-400">{notApprovedCount}</div></div>
        <div className="bg-blue-500/[0.08] backdrop-blur-sm border border-blue-500/20 rounded-xl p-5"><div className="flex items-center gap-2 text-blue-300 text-sm mb-2"><div className="w-4 h-4 flex items-center justify-center"><i className="ri-eye-line"></i></div>Needs Review</div><div className="text-3xl font-bold text-blue-400">{reviewCount}</div></div>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <select value={filterSiteId} onChange={e=>setFilterSiteId(e.target.value)} className="bg-[#0f172a]/70 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-blue-500"><option value="">All Sites</option>{sites.map(s=><option key={s.id} value={s.id}>{s.site_name}</option>)}</select>
        <select value={filterStatus} onChange={e=>setFilterStatus(e.target.value)} className="bg-[#0f172a]/70 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-blue-500"><option value="all">All Statuses</option><option value="valid">Valid</option><option value="manual_review">Needs Review</option><option value="late">Late</option><option value="missed">Missed</option></select>
        <select value={filterGps} onChange={e=>setFilterGps(e.target.value)} className="bg-[#0f172a]/70 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-blue-500"><option value="all">All GPS</option><option value="verified">Verified</option><option value="outside_radius">Outside Radius</option><option value="gps_unavailable">No GPS</option><option value="checkpoint_not_approved">Not Approved</option></select>
        <div className="flex bg-[#0f172a]/70 border border-white/10 rounded-lg overflow-hidden">{(['today','week','month'] as const).map(range=><button key={range} onClick={()=>setDateRange(range)} className={`px-3 py-2 text-sm font-medium transition-colors cursor-pointer whitespace-nowrap ${dateRange===range?'bg-blue-600 text-white':'text-gray-400 hover:text-white'}`}>{range==='today'?'Today':range==='week'?'7 Days':'30 Days'}</button>)}</div>
      </div>

      {loading?(<div className="flex items-center justify-center h-64"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div></div>):scans.length===0?(<div className="bg-[#0f172a]/70 backdrop-blur-sm border border-white/10 rounded-xl p-12 text-center"><div className="w-16 h-16 flex items-center justify-center bg-white/5 rounded-full mx-auto mb-4"><i className="ri-route-line text-gray-500 text-2xl"></i></div><p className="text-gray-400 font-medium">No patrol scans yet</p><p className="text-sm text-gray-500 mt-1">Scans will appear once guards start patrolling.</p></div>):(
        <div className="bg-[#0f172a]/70 backdrop-blur-sm border border-white/10 rounded-xl overflow-hidden"><div className="overflow-x-auto"><table className="w-full"><thead><tr className="border-b border-white/10"><th className="text-left px-3 py-3 text-xs font-medium text-gray-400 uppercase tracking-wider">GPS</th><th className="text-left px-3 py-3 text-xs font-medium text-gray-400 uppercase tracking-wider">Scan</th><th className="text-left px-3 py-3 text-xs font-medium text-gray-400 uppercase tracking-wider">Site</th><th className="text-left px-3 py-3 text-xs font-medium text-gray-400 uppercase tracking-wider">Checkpoint</th><th className="text-left px-3 py-3 text-xs font-medium text-gray-400 uppercase tracking-wider">Guard</th><th className="text-left px-3 py-3 text-xs font-medium text-gray-400 uppercase tracking-wider">Scheduled</th><th className="text-left px-3 py-3 text-xs font-medium text-gray-400 uppercase tracking-wider">Scanned</th><th className="text-left px-3 py-3 text-xs font-medium text-gray-400 uppercase tracking-wider">Distance</th><th className="text-left px-3 py-3 text-xs font-medium text-gray-400 uppercase tracking-wider">Media</th></tr></thead><tbody className="divide-y divide-white/5">{scans.map(scan=>{const gs=gpsStatusBadge(scan.gps_status);const ss=scanStatusBadge(scan.scan_status || scan.status);return(<tr key={scan.id} className="hover:bg-white/[0.02] transition-colors"><td className="px-3 py-3"><span className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-medium border ${gs.bg} ${gs.border} ${gs.color}`}>{gs.label}</span></td><td className="px-3 py-3"><span className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-medium border ${ss.bg} ${ss.border} ${ss.color}`}>{ss.label}</span></td><td className="px-3 py-3 text-sm text-white">{scan.site_name}</td><td className="px-3 py-3"><p className="text-sm text-white">{scan.checkpoint_name}</p><p className="text-[10px] text-gray-500 font-mono">{scan.checkpoint_code}</p></td><td className="px-3 py-3 text-sm text-gray-400">{scan.guard_name}</td><td className="px-3 py-3 text-sm text-gray-400">{scan.scheduled_patrol_time||'—'}</td><td className="px-3 py-3 text-sm text-gray-400">{formatScanTime(scan.scanned_at)}</td><td className="px-3 py-3 text-sm text-gray-400">{scan.distance_from_checkpoint!=null?(<span className={scan.distance_from_checkpoint>25?'text-amber-400':'text-emerald-400'}>{Math.round(scan.distance_from_checkpoint)}m</span>):'—'}</td><td className="px-3 py-3"><div className="flex items-center gap-2">{scan.photo_url?<a href={scan.photo_url} target="_blank" rel="noopener noreferrer" className="text-blue-400 cursor-pointer"><div className="w-4 h-4 flex items-center justify-center"><i className="ri-camera-line text-sm"></i></div></a>:<span className="text-gray-600 text-[10px]">—</span>}{scan.comment?<span className="text-blue-400 cursor-pointer" title={scan.comment}><div className="w-4 h-4 flex items-center justify-center"><i className="ri-chat-1-line text-sm"></i></div></span>:<span className="text-gray-600 text-[10px]">—</span>}</div></td></tr>);})}</tbody></table></div></div>
      )}
    </div>
    </FeatureGate>
  );
}