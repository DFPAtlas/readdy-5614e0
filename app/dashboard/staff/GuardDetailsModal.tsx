'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { getDaysUntil, getSIAStatus } from '@/lib/useGuards';

interface Guard {
  id: string;
  first_name: string | null;
  last_name: string | null;
  email: string | null;
  phone: string | null;
  sia_licence: string | null;
  sia_expiry: string | null;
  hourly_rate: number | null;
  skills: string[] | null;
  status: string | null;
  created_at: string | null;
  site_name?: string | null;
}

interface GuardDetailsModalProps {
  guard: Guard;
  onClose: () => void;
  onDelete: (id: string) => void;
}

export default function GuardDetailsModal({ guard, onClose, onDelete }: GuardDetailsModalProps) {
  const [activeTab, setActiveTab] = useState('overview');
  const [recentShifts, setRecentShifts] = useState<any[]>([]);
  const [upcomingShifts, setUpcomingShifts] = useState<any[]>([]);
  const [guardIncidents, setGuardIncidents] = useState<any[]>([]);
  const [loadingData, setLoadingData] = useState(true);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    async function load() {
      setLoadingData(true);
      const [shiftsRes, upcomingRes, incidentsRes] = await Promise.all([
        supabase.from('shifts').select('id, start_time, end_time, status, site_name:sites(site_name)').eq('guard_id', guard.id).order('start_time', { ascending: false }).limit(10),
        supabase.from('shifts').select('id, start_time, end_time, site_name:sites(site_name)').eq('guard_id', guard.id).gte('start_time', new Date().toISOString()).order('start_time', { ascending: true }).limit(5),
        supabase.from('incidents').select('id, incident_type, severity, status, occurred_at').eq('guard_id', guard.id).order('occurred_at', { ascending: false }).limit(5),
      ]);
      setRecentShifts(shiftsRes.data || []);
      setUpcomingShifts(upcomingRes.data || []);
      setGuardIncidents(incidentsRes.data || []);
      setLoadingData(false);
    }
    load();
  }, [guard.id]);

  const tabs = [
    { id: 'overview', label: 'Overview', icon: 'ri-user-line' },
    { id: 'schedule', label: 'Schedule', icon: 'ri-calendar-line' },
    { id: 'incidents', label: 'Incidents', icon: 'ri-alert-line' },
  ];

  function formatShift(iso: string) {
    return new Date(iso).toLocaleString('en-GB', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit', hour12: false });
  }

  const daysLeft = getDaysUntil(guard.sia_expiry);
  const siaStatus = getSIAStatus(guard.sia_expiry);
  const initials = `${(guard.first_name || '')[0]}${(guard.last_name || '')[0]}`.toUpperCase();

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
      <div className="bg-[#111827] rounded-xl shadow-xl max-w-3xl w-full max-h-[90vh] overflow-hidden border border-gray-800">
        <div className="bg-[#111827] border-b border-gray-800 px-6 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="w-14 h-14 rounded-full bg-gray-800 border border-gray-700 flex items-center justify-center">
              <span className="text-xl font-bold text-blue-400">{initials || 'G'}</span>
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">{guard.first_name} {guard.last_name}</h2>
              <div className="flex items-center gap-2 mt-0.5">
                <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium ${
                  guard.status === 'active' ? 'bg-emerald-500/10 text-emerald-400' :
                  guard.status === 'suspended' ? 'bg-amber-500/10 text-amber-400' :
                  'bg-gray-500/10 text-gray-400'
                }`}>
                  {guard.status || 'Unknown'}
                </span>
                <span className="text-xs text-gray-500">{guard.site_name || 'Unassigned'}</span>
              </div>
            </div>
          </div>
          <button onClick={onClose} className="w-8 h-8 flex items-center justify-center text-gray-400 hover:text-white hover:bg-gray-800 rounded-lg transition-colors cursor-pointer">
            <div className="w-4 h-4 flex items-center justify-center"><i className="ri-close-line"></i></div>
          </button>
        </div>

        <div className="border-b border-gray-800 px-6">
          <div className="flex items-center space-x-1">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center space-x-2 px-4 py-3 text-sm font-medium transition-colors cursor-pointer whitespace-nowrap ${
                  activeTab === tab.id ? 'text-blue-400 border-b-2 border-blue-500' : 'text-gray-400 hover:text-gray-200'
                }`}
              >
                <div className="w-4 h-4 flex items-center justify-center"><i className={tab.icon}></i></div>
                <span>{tab.label}</span>
              </button>
            ))}
          </div>
        </div>

        <div className="p-6 overflow-y-auto max-h-[calc(90vh-200px)]">
          {loadingData ? (
            <div className="flex items-center justify-center py-12">
              <i className="ri-loader-4-line animate-spin text-blue-500 text-2xl"></i>
            </div>
          ) : (
            <>
              {activeTab === 'overview' && (
                <div className="space-y-6">
                  <div className="bg-gray-800/40 border border-gray-800 rounded-xl p-4">
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="text-sm font-medium text-white flex items-center gap-2">
                        <div className="w-4 h-4 flex items-center justify-center"><i className="ri-shield-check-line text-blue-400"></i></div>
                        SIA Licence
                      </h3>
                      <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium ${
                        siaStatus === 'expired' ? 'bg-red-500/10 text-red-400' :
                        siaStatus === 'expiring_soon' ? 'bg-amber-500/10 text-amber-400' :
                        'bg-emerald-500/10 text-emerald-400'
                      }`}>
                        {siaStatus === 'expired' ? 'Expired' : siaStatus === 'expiring_soon' ? (daysLeft != null && daysLeft >= 0 ? `Expiring in ${daysLeft} days` : 'Expiring soon') : 'Valid'}
                      </span>
                    </div>
                    <div className="grid grid-cols-2 gap-3 text-sm">
                      <div>
                        <p className="text-xs text-gray-500 mb-0.5">Licence Number</p>
                        <p className="text-gray-300 font-mono">{guard.sia_licence ? `****${guard.sia_licence.slice(-4)}` : '—'}</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500 mb-0.5">Expires</p>
                        <p className="text-gray-300">{guard.sia_expiry || '—'}</p>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-sm font-semibold text-white mb-3">Contact & Pay</h3>
                    <div className="bg-gray-800/40 border border-gray-800 rounded-xl divide-y divide-gray-800">
                      <div className="flex justify-between px-4 py-3 text-sm"><span className="text-gray-400">Email</span><span className="font-medium text-gray-200">{guard.email || '—'}</span></div>
                      <div className="flex justify-between px-4 py-3 text-sm"><span className="text-gray-400">Phone</span><span className="font-medium text-gray-200">{guard.phone || '—'}</span></div>
                      <div className="flex justify-between px-4 py-3 text-sm"><span className="text-gray-400">Hourly Rate</span><span className="font-medium text-gray-200">{guard.hourly_rate ? `£${Number(guard.hourly_rate).toFixed(2)}/hr` : '—'}</span></div>
                      <div className="flex justify-between px-4 py-3 text-sm"><span className="text-gray-400">Joined</span><span className="font-medium text-gray-200">{guard.created_at ? new Date(guard.created_at).toLocaleDateString('en-GB') : '—'}</span></div>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'schedule' && (
                <div className="space-y-6">
                  <div>
                    <h3 className="text-sm font-semibold text-white mb-3">Upcoming Shifts</h3>
                    {upcomingShifts.length === 0 ? (
                      <p className="text-sm text-gray-500">No upcoming shifts.</p>
                    ) : (
                      <div className="space-y-2">
                        {upcomingShifts.map((s: any) => (
                          <div key={s.id} className="flex items-center justify-between p-3 bg-blue-500/10 border border-blue-500/20 rounded-lg">
                            <div className="flex items-center gap-3">
                              <div className="w-4 h-4 flex items-center justify-center"><i className="ri-calendar-line text-blue-400"></i></div>
                              <div>
                                <div className="font-medium text-gray-200">{s.site_name || 'Unknown Site'}</div>
                                <div className="text-sm text-gray-400">{formatShift(s.start_time)} — {formatShift(s.end_time)}</div>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold text-white mb-3">Recent Shifts</h3>
                    {recentShifts.length === 0 ? (
                      <p className="text-sm text-gray-500">No shift history.</p>
                    ) : (
                      <div className="space-y-2">
                        {recentShifts.slice(0, 8).map((s: any) => (
                          <div key={s.id} className="flex items-center justify-between p-2 border-b border-gray-800 text-sm">
                            <span className="text-gray-300">{s.site_name || 'Unknown'}</span>
                            <span className="text-gray-500">{formatShift(s.start_time)}</span>
                            <span className={`px-2 py-0.5 rounded text-xs ${s.status === 'completed' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-gray-800 text-gray-400'}`}>{s.status}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              )}

              {activeTab === 'incidents' && (
                <div className="space-y-4">
                  {guardIncidents.length === 0 ? (
                    <p className="text-sm text-gray-500 py-8 text-center">No incidents recorded for this guard.</p>
                  ) : (
                    guardIncidents.map((inc: any) => (
                      <div key={inc.id} className="p-4 bg-gray-800/40 border border-gray-800 rounded-lg">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-3">
                            <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${inc.severity === 'high' || inc.severity === 'critical' ? 'bg-red-500/10' : inc.severity === 'medium' ? 'bg-amber-500/10' : 'bg-blue-500/10'}`}>
                              <div className="w-4 h-4 flex items-center justify-center">
                                <i className={`ri-alert-line ${inc.severity === 'high' || inc.severity === 'critical' ? 'text-red-400' : inc.severity === 'medium' ? 'text-amber-400' : 'text-blue-400'}`}></i>
                              </div>
                            </div>
                            <div>
                              <div className="font-medium text-gray-200">{inc.incident_type || 'Incident'}</div>
                              <div className="text-sm text-gray-400">{inc.occurred_at ? new Date(inc.occurred_at).toLocaleDateString('en-GB') : '—'}</div>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${inc.severity === 'high' || inc.severity === 'critical' ? 'bg-red-500/10 text-red-400' : inc.severity === 'medium' ? 'bg-amber-500/10 text-amber-400' : 'bg-blue-500/10 text-blue-400'}`}>{inc.severity}</span>
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${inc.status === 'open' ? 'bg-red-500/10 text-red-400' : 'bg-emerald-500/10 text-emerald-400'}`}>{inc.status}</span>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              )}
            </>
          )}
        </div>

        <div className="border-t border-gray-800 px-6 py-4 flex items-center justify-between">
          <button
            onClick={async () => {
              setDeleting(true);
              await onDelete(guard.id);
              setDeleting(false);
            }}
            disabled={deleting}
            className="px-4 py-2 bg-red-600 text-white border border-red-500 rounded-lg hover:bg-red-500 transition-colors cursor-pointer whitespace-nowrap disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
          >
            {deleting ? <i className="ri-loader-4-line animate-spin"></i> : <i className="ri-delete-bin-line"></i>}
            <span>{deleting ? 'Deleting...' : 'Permanent Delete'}</span>
          </button>
          <button onClick={onClose} className="px-4 py-2 bg-gray-800 text-gray-300 rounded-lg hover:bg-gray-700 transition-colors cursor-pointer whitespace-nowrap">
            Close
          </button>
        </div>
      </div>
    </div>
  );
}