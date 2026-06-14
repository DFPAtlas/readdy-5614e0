'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/lib/auth';

interface RotaManagementModalProps {
  onClose: () => void;
  selectedGuard?: any;
}

export default function RotaManagementModal({ onClose, selectedGuard }: RotaManagementModalProps) {
  const { companyId } = useAuth();
  const [activeTab, setActiveTab] = useState('schedule');
  const [selectedWeek, setSelectedWeek] = useState(new Date());
  const [sites, setSites] = useState<any[]>([]);
  const [guards, setGuards] = useState<any[]>([]);
  const [shifts, setShifts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState<string | null>(null);

  const shiftTypes = [
    { id: 'day', name: 'Day Shift', time: '06:00 - 18:00' },
    { id: 'night', name: 'Night Shift', time: '18:00 - 06:00' },
    { id: 'early', name: 'Early Shift', time: '06:00 - 14:00' },
    { id: 'late', name: 'Late Shift', time: '14:00 - 22:00' },
  ];

  useEffect(() => {
    if (!companyId) return;
    async function load() {
      setLoading(true);
      const weekStart = new Date(selectedWeek);
      weekStart.setDate(weekStart.getDate() - weekStart.getDay() + 1);
      const weekEnd = new Date(weekStart);
      weekEnd.setDate(weekEnd.getDate() + 7);

      const [sitesRes, guardsRes, shiftsRes] = await Promise.all([
        supabase.from('sites').select('id, site_name').eq('company_id', companyId).order('site_name'),
        supabase.from('guards').select('id, first_name, last_name').eq('company_id', companyId).eq('status', 'active').order('first_name'),
        supabase.from('shifts').select('id, site_id, guard_id, start_time, end_time, shift_type, status, sites(site_name), guards(first_name, last_name)').eq('company_id', companyId).gte('start_time', weekStart.toISOString()).lt('start_time', weekEnd.toISOString()).order('start_time'),
      ]);

      setSites(sitesRes.data || []);
      setGuards(guardsRes.data || []);
      setShifts((shiftsRes.data || []).map((s: any) => ({
        ...s,
        site_name: s.sites?.site_name || 'Unknown',
        guard_name: s.guards ? `${s.guards.first_name || ''} ${s.guards.last_name || ''}`.trim() : null,
      })));
      setLoading(false);
    }
    load();
  }, [companyId, selectedWeek]);

  const daysOfWeek = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];

  function getDayShifts(dayIndex: number) {
    const dayStart = new Date(selectedWeek);
    dayStart.setDate(dayStart.getDate() - dayStart.getDay() + 1 + dayIndex);
    dayStart.setHours(0, 0, 0, 0);
    const dayEnd = new Date(dayStart);
    dayEnd.setDate(dayEnd.getDate() + 1);
    return shifts.filter((s) => {
      const start = new Date(s.start_time);
      return start >= dayStart && start < dayEnd;
    });
  }

  const renderScheduleTab = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-900">Weekly Schedule</h3>
        <div className="flex items-center space-x-4">
          <input
            type="week"
            value={selectedWeek.toISOString().slice(0, 10)}
            onChange={(e) => setSelectedWeek(new Date(e.target.value))}
            className="px-3 py-2 border border-gray-300 rounded-md text-sm"
          />
          <div className="text-sm text-gray-600">
            {shifts.length} shifts this week
          </div>
        </div>
      </div>

      {loading ? (
        <div className="py-12 flex items-center justify-center">
          <i className="ri-loader-4-line animate-spin text-blue-500 text-2xl"></i>
        </div>
      ) : (
        <div className="space-y-3">
          {daysOfWeek.map((day, i) => {
            const dayShifts = getDayShifts(i);
            return (
              <div key={day} className="bg-gray-50 p-4 rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-medium text-gray-900 capitalize">{day}</span>
                  <span className="text-xs text-gray-500">{dayShifts.length} shift{dayShifts.length !== 1 ? 's' : ''}</span>
                </div>
                {dayShifts.length === 0 ? (
                  <p className="text-xs text-gray-400">No shifts scheduled</p>
                ) : (
                  <div className="space-y-1.5">
                    {dayShifts.map((s) => (
                      <div key={s.id} className="flex items-center gap-3 text-sm text-gray-700 bg-white rounded px-3 py-2 border border-gray-200">
                        <span className="capitalize text-xs font-medium px-2 py-0.5 bg-blue-50 text-blue-700 rounded">{s.shift_type || 'day'}</span>
                        <span>{new Date(s.start_time).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit', hour12: false })} — {new Date(s.end_time).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit', hour12: false })}</span>
                        <span className="text-gray-400">{s.site_name}</span>
                        <span className="ml-auto text-gray-500">{s.guard_name || 'Unassigned'}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );

  const renderTeamTab = () => (
    <div className="space-y-6">
      <h3 className="text-lg font-semibold text-gray-900">Team Assignments</h3>
      {sites.length === 0 ? (
        <p className="text-sm text-gray-500">No sites configured.</p>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {sites.map((site) => {
            const siteShifts = shifts.filter((s) => s.site_id === site.id);
            return (
              <div key={site.id} className="bg-gray-50 p-4 rounded-lg">
                <h4 className="font-medium text-gray-900 mb-3">{site.site_name}</h4>
                {siteShifts.length === 0 ? (
                  <p className="text-xs text-gray-400">No shifts this week</p>
                ) : (
                  <div className="space-y-2">
                    {siteShifts.map((s) => (
                      <div key={s.id} className="flex items-center justify-between py-2 border-b border-gray-200 last:border-b-0 text-sm">
                        <div>
                          <span className="font-medium text-gray-700">{new Date(s.start_time).toLocaleDateString('en-GB', { weekday: 'short' })}</span>
                          <span className="text-gray-500 ml-2">{new Date(s.start_time).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit', hour12: false })}</span>
                        </div>
                        <span className="text-gray-500">{s.guard_name || 'Unassigned'}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg w-full max-w-5xl max-h-[90vh] overflow-hidden">
        <div className="border-b border-gray-200 px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold text-gray-900">Rota Management</h2>
              {selectedGuard && (
                <p className="text-sm text-gray-600 mt-1">Viewing schedule for {selectedGuard.first_name} {selectedGuard.last_name}</p>
              )}
            </div>
            <button onClick={onClose} className="w-8 h-8 flex items-center justify-center hover:bg-gray-100 rounded transition-colors cursor-pointer">
              <i className="ri-close-line text-gray-500"></i>
            </button>
          </div>
        </div>

        <div className="border-b border-gray-200">
          <nav className="flex space-x-8 px-6">
            <button
              onClick={() => setActiveTab('schedule')}
              className={`py-4 px-1 border-b-2 font-medium text-sm cursor-pointer whitespace-nowrap ${activeTab === 'schedule' ? 'border-blue-500 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
            >
              Weekly Schedule
            </button>
            <button
              onClick={() => setActiveTab('team')}
              className={`py-4 px-1 border-b-2 font-medium text-sm cursor-pointer whitespace-nowrap ${activeTab === 'team' ? 'border-blue-500 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
            >
              Team Assignments
            </button>
          </nav>
        </div>

        <div className="p-6 max-h-[60vh] overflow-y-auto">
          {activeTab === 'schedule' && renderScheduleTab()}
          {activeTab === 'team' && renderTeamTab()}
        </div>

        {toast && (
          <div className="px-6 py-2 text-sm text-emerald-600 bg-emerald-50 border-t border-emerald-200">{toast}</div>
        )}

        <div className="border-t border-gray-200 px-6 py-4">
          <div className="flex justify-end space-x-4">
            <button onClick={onClose} className="px-6 py-2 text-gray-700 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors cursor-pointer whitespace-nowrap">
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}