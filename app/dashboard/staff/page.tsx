'use client';

import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/lib/auth';
import AddGuardModal from './AddGuardModal';
import CreateTemplateModal from './CreateTemplateModal';
import AITooledOperationsCopilot from '@/app/dashboard/components/AITooledOperationsCopilot';

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

export default function StaffManagement() {
  const { companyId } = useAuth();
  const [showAddGuard, setShowAddGuard] = useState(false);
  const [showRotaModal, setShowRotaModal] = useState(false);
  const [showTemplateModal, setShowTemplateModal] = useState(false);
  const [selectedGuard, setSelectedGuard] = useState<any>(null);
  const [showGuardDetails, setShowGuardDetails] = useState(false);
  const [guards, setGuards] = useState<Guard[]>([]);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState<string | null>(null);

  const loadGuards = useCallback(async () => {
    if (!companyId) return;
    setLoading(true);
    const { data } = await supabase
      .from('guards')
      .select('*, shifts!guard_id(site_id, sites(site_name))')
      .eq('company_id', companyId)
      .order('created_at', { ascending: false });

    setGuards((data || []).map((g: any) => {
      const siteNames = [...new Set((g.shifts || []).map((s: any) => s.sites?.site_name).filter(Boolean))];
      return {
        ...g,
        site_name: siteNames.length > 0 ? siteNames.join(', ') : 'Unassigned',
      };
    }));
    setLoading(false);
  }, [companyId]);

  useEffect(() => {
    loadGuards();
  }, [loadGuards]);

  const handleEditGuard = (guard: Guard) => {
    setSelectedGuard(guard);
    setShowAddGuard(true);
  };

  const handleViewGuard = (guard: Guard) => {
    setSelectedGuard(guard);
    setShowGuardDetails(true);
  };

  const handleDeleteGuard = async (guardId: string) => {
    if (!window.confirm('Are you sure you want to delete this guard? All related shifts, incidents, attendance logs and patrol logs will also be removed.')) return;
    setLoading(true);
    try {
      await supabase.from('shifts').delete().eq('guard_id', guardId);
      await supabase.from('incidents').delete().eq('guard_id', guardId);
      await supabase.from('attendance_logs').delete().eq('guard_id', guardId);
      await supabase.from('patrol_logs').delete().eq('guard_id', guardId);
      await supabase.from('guard_availability').delete().eq('guard_id', guardId);
      await supabase.from('guard_time_off').delete().eq('guard_id', guardId);
      await supabase.from('leave_requests').delete().eq('guard_id', guardId);
      await supabase.from('guard_site_assignments').delete().eq('guard_id', guardId);

      const { error } = await supabase.from('guards').delete().eq('id', guardId);
      if (error) throw error;

      setToast('Guard and all related records deleted');
      loadGuards();
    } catch {
      setToast('Failed to delete guard');
    } finally {
      setLoading(false);
      setTimeout(() => setToast(null), 3000);
    }
  };

  const activeGuards = guards.filter((g) => g.status === 'active').length;
  const totalHours = activeGuards * 40;

  const handleTemplateCreated = () => {
    setShowTemplateModal(false);
    setToast('Template saved');
    setTimeout(() => setToast(null), 3000);
  };

  return (
    <div className="min-h-screen bg-[#0a0e1a]">
      <div className="max-w-7xl mx-auto px-6 lg:px-8 py-8">
        {toast && (
          <div className="mb-4 px-4 py-2 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-sm">
            {toast}
          </div>
        )}

        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold text-white">Staff Management</h1>
          <div className="flex space-x-4">
            <button
              onClick={() => setShowTemplateModal(true)}
              className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors cursor-pointer whitespace-nowrap flex items-center text-sm"
            >
              <i className="ri-add-line mr-2"></i>Create Template
            </button>
            <button
              onClick={() => { setSelectedGuard(null); setShowAddGuard(true); }}
              className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors cursor-pointer whitespace-nowrap"
            >
              <i className="ri-add-line mr-2"></i>
              Add New Guard
            </button>
          </div>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
            <div className="flex items-center">
              <div className="w-12 h-12 bg-blue-600 rounded-lg flex items-center justify-center">
                <i className="ri-user-line text-white text-xl"></i>
              </div>
              <div className="ml-4">
                <p className="text-sm text-blue-600 font-medium">Total Guards</p>
                <p className="text-2xl font-bold text-blue-900">{guards.length}</p>
              </div>
            </div>
          </div>

          <div className="bg-green-50 border border-green-200 rounded-lg p-6">
            <div className="flex items-center">
              <div className="w-12 h-12 bg-green-600 rounded-lg flex items-center justify-center">
                <i className="ri-shield-check-line text-white text-xl"></i>
              </div>
              <div className="ml-4">
                <p className="text-sm text-green-600 font-medium">Active Guards</p>
                <p className="text-2xl font-bold text-green-900">{activeGuards}</p>
              </div>
            </div>
          </div>

          <div className="bg-purple-50 border border-purple-200 rounded-lg p-6">
            <div className="flex items-center">
              <div className="w-12 h-12 bg-purple-600 rounded-lg flex items-center justify-center">
                <i className="ri-time-line text-white text-xl"></i>
              </div>
              <div className="ml-4">
                <p className="text-sm text-purple-600 font-medium">Weekly Hours</p>
                <p className="text-2xl font-bold text-purple-900">{totalHours}h</p>
              </div>
            </div>
          </div>
        </div>

        {/* Staff Table */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-900">Staff Members</h2>
            <span className="text-sm text-gray-500">{guards.length} guards</span>
          </div>

          {loading ? (
            <div className="p-12 flex items-center justify-center">
              <i className="ri-loader-4-line animate-spin text-blue-500 text-2xl"></i>
            </div>
          ) : guards.length === 0 ? (
            <div className="p-12 text-center">
              <div className="w-16 h-16 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <i className="ri-user-line text-gray-400 text-2xl"></i>
              </div>
              <p className="text-gray-500 font-medium">No guards yet</p>
              <p className="text-sm text-gray-400 mt-1">Add your first security guard to get started.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Guard</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Contact</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">SIA Licence</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Rate</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {guards.map((guard) => {
                    const initials = `${(guard.first_name || '')[0]}${(guard.last_name || '')[0]}`;
                    return (
                      <tr key={guard.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 font-bold text-sm">
                              {initials || 'G'}
                            </div>
                            <div className="ml-4">
                              <div className="text-sm font-medium text-gray-900">{guard.first_name} {guard.last_name}</div>
                              <div className="text-sm text-gray-500">{guard.sia_licence || 'No SIA'}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">{guard.phone || '—'}</div>
                          <div className="text-sm text-gray-500">{guard.email || '—'}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">{guard.sia_licence || '—'}</div>
                          {guard.sia_expiry && (
                            <div className="text-xs text-gray-500">Exp: {new Date(guard.sia_expiry).toLocaleDateString('en-GB')}</div>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                            guard.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                          }`}>
                            {guard.status || 'unknown'}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {guard.hourly_rate ? `£${guard.hourly_rate}/hr` : '—'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                          <div className="flex items-center space-x-2">
                            <button
                              onClick={() => handleViewGuard(guard)}
                              className="text-blue-600 hover:text-blue-800 text-sm cursor-pointer"
                            >
                              <i className="ri-eye-line"></i>
                            </button>
                            <button
                              onClick={() => handleEditGuard(guard)}
                              className="text-blue-600 hover:text-blue-900 cursor-pointer whitespace-nowrap"
                            >
                              <i className="ri-edit-line"></i>
                            </button>
                            <button
                              onClick={() => handleDeleteGuard(guard.id)}
                              className="text-red-600 hover:text-red-900 cursor-pointer whitespace-nowrap"
                            >
                              <i className="ri-delete-bin-line"></i>
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {showAddGuard && (
        <AddGuardModal
          onClose={() => { setShowAddGuard(false); loadGuards(); }}
          onSubmit={async () => { setShowAddGuard(false); loadGuards(); }}
          existingGuard={selectedGuard}
          isEdit={!!selectedGuard}
        />
      )}
      {showTemplateModal && (
        <CreateTemplateModal
          onClose={() => setShowTemplateModal(false)}
          onCreated={handleTemplateCreated}
        />
      )}
      {showGuardDetails && selectedGuard && (
        <GuardDetailsModal
          guard={selectedGuard}
          onClose={() => {
            setShowGuardDetails(false);
            setSelectedGuard(null);
          }}
          onDelete={async (id) => {
            await handleDeleteGuard(id);
            setShowGuardDetails(false);
            setSelectedGuard(null);
          }}
        />
      )}

      <AITooledOperationsCopilot />
    </div>
  );
}

function GuardDetailsModal({ guard, onClose, onDelete }: { guard: Guard; onClose: () => void; onDelete: (id: string) => void }) {
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

  const performanceMetrics = [
    { label: 'Total Shifts', value: String(recentShifts.length), trend: '', color: 'blue' },
    { label: 'Completed', value: String(recentShifts.filter((s: any) => s.status === 'completed').length), trend: '', color: 'green' },
    { label: 'Incidents', value: String(guardIncidents.length), trend: '', color: 'red' },
    { label: 'Status', value: guard.status || 'unknown', trend: '', color: guard.status === 'active' ? 'green' : 'yellow' },
  ];

  const initials = `${(guard.first_name || '')[0]}${(guard.last_name || '')[0]}`;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-xl max-w-3xl w-full max-h-[90vh] overflow-hidden">
        <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-6 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center">
              <span className="text-2xl font-bold text-blue-600">{initials || 'G'}</span>
            </div>
            <div>
              <h2 className="text-2xl font-bold text-white">{guard.first_name} {guard.last_name}</h2>
              <p className="text-blue-100">{guard.sia_licence || 'No SIA'} · {guard.status}</p>
            </div>
          </div>
          <button onClick={onClose} className="w-8 h-8 flex items-center justify-center text-white hover:bg-white/20 rounded-lg transition-colors cursor-pointer">
            <i className="ri-close-line text-xl"></i>
          </button>
        </div>

        <div className="border-b border-gray-200 px-6">
          <div className="flex items-center space-x-1">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center space-x-2 px-4 py-3 text-sm font-medium transition-colors cursor-pointer whitespace-nowrap ${
                  activeTab === tab.id ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                <i className={tab.icon}></i>
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
                  <div className="grid md:grid-cols-2 gap-4">
                    {performanceMetrics.map((metric, i) => (
                      <div key={i} className="p-4 bg-gray-50 border border-gray-200 rounded-lg">
                        <div className="text-sm text-gray-600">{metric.label}</div>
                        <div className="text-2xl font-bold text-gray-900 capitalize">{metric.value}</div>
                      </div>
                    ))}
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-3">Contact</h3>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between"><span className="text-gray-600">Email</span><span className="font-medium">{guard.email || '—'}</span></div>
                      <div className="flex justify-between"><span className="text-gray-600">Phone</span><span className="font-medium">{guard.phone || '—'}</span></div>
                      <div className="flex justify-between"><span className="text-gray-600">Rate</span><span className="font-medium">{guard.hourly_rate ? `£${guard.hourly_rate}/hr` : '—'}</span></div>
                      <div className="flex justify-between"><span className="text-gray-600">Joined</span><span className="font-medium">{guard.created_at ? new Date(guard.created_at).toLocaleDateString('en-GB') : '—'}</span></div>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'schedule' && (
                <div className="space-y-6">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-3">Upcoming Shifts</h3>
                    {upcomingShifts.length === 0 ? (
                      <p className="text-sm text-gray-500">No upcoming shifts.</p>
                    ) : (
                      <div className="space-y-2">
                        {upcomingShifts.map((s: any) => (
                          <div key={s.id} className="flex items-center justify-between p-3 bg-blue-50 border border-blue-200 rounded-lg">
                            <div className="flex items-center gap-3">
                              <i className="ri-calendar-line text-blue-600"></i>
                              <div>
                                <div className="font-medium text-gray-900">{s.site_name || 'Unknown Site'}</div>
                                <div className="text-sm text-gray-600">{formatShift(s.start_time)} — {formatShift(s.end_time)}</div>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-3">Recent Shifts</h3>
                    {recentShifts.length === 0 ? (
                      <p className="text-sm text-gray-500">No shift history.</p>
                    ) : (
                      <div className="space-y-2">
                        {recentShifts.slice(0, 8).map((s: any) => (
                          <div key={s.id} className="flex items-center justify-between p-2 border-b border-gray-100 text-sm">
                            <span>{s.site_name || 'Unknown'}</span>
                            <span className="text-gray-500">{formatShift(s.start_time)}</span>
                            <span className={`px-2 py-0.5 rounded text-xs ${s.status === 'completed' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'}`}>{s.status}</span>
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
                      <div key={inc.id} className="p-4 bg-white border border-gray-200 rounded-lg">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-3">
                            <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${inc.severity === 'high' || inc.severity === 'critical' ? 'bg-red-100' : inc.severity === 'medium' ? 'bg-yellow-100' : 'bg-blue-100'}`}>
                              <i className={`ri-alert-line ${inc.severity === 'high' || inc.severity === 'critical' ? 'text-red-600' : inc.severity === 'medium' ? 'text-yellow-600' : 'text-blue-600'}`}></i>
                            </div>
                            <div>
                              <div className="font-medium text-gray-900">{inc.incident_type || 'Incident'}</div>
                              <div className="text-sm text-gray-600">{inc.occurred_at ? new Date(inc.occurred_at).toLocaleDateString('en-GB') : '—'}</div>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${inc.severity === 'high' || inc.severity === 'critical' ? 'bg-red-100 text-red-700' : inc.severity === 'medium' ? 'bg-yellow-100 text-yellow-700' : 'bg-blue-100 text-blue-700'}`}>{inc.severity}</span>
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${inc.status === 'open' ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}>{inc.status}</span>
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

        <div className="border-t border-gray-200 px-6 py-4 flex items-center justify-between">
          <button
            onClick={async () => {
              setDeleting(true);
              await onDelete(guard.id);
              setDeleting(false);
            }}
            disabled={deleting}
            className="px-4 py-2 bg-red-50 text-red-600 border border-red-200 rounded-lg hover:bg-red-100 transition-colors cursor-pointer whitespace-nowrap disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
          >
            {deleting ? <i className="ri-loader-4-line animate-spin"></i> : <i className="ri-delete-bin-line"></i>}
            <span>{deleting ? 'Deleting...' : 'Delete Guard'}</span>
          </button>
          <button onClick={onClose} className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors cursor-pointer whitespace-nowrap">
            Close
          </button>
        </div>
      </div>
    </div>
  );
}