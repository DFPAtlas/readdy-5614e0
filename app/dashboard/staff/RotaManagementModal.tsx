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
  const [toast, setToast] = useState<string | null>(null);

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
    let result = shifts.filter((s) => {
      const start = new Date(s.start_time);
      return start >= dayStart && start < dayEnd;
    });
    if (selectedGuard) {
      result.sort((a, b) => {
        const aMatch = a.guard_id === selectedGuard.id ? 1 : 0;
        const bMatch = b.guard_id === selectedGuard.id ? 1 : 0;
        return bMatch - aMatch;
      });
    }
    return result;
  }

  const isSelectedGuardShift = (s: any) => selectedGuard && s.guard_id === selectedGuard.id;

  const renderScheduleTab = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <h3 className="text-lg font-semibold text-white">Weekly Schedule</h3>
          {selectedGuard && (
            <p className="text-sm text-blue-400 flex items-center gap-1.5">
              <div className="w-4 h-4 flex items-center justify-center"><i className="ri-user-line"></i></div>
              Highlighting shifts for <span className="font-semibold">{selectedGuard.first_name} {selectedGuard.last_name}</span>
            </p>
          )}
        </div>
        <div className="flex items-center space-x-4">
          <input
            type="week"
            value={selectedWeek.toISOString().slice(0, 10)}
            onChange={(e) => setSelectedWeek(new Date(e.target.value))}
            className="px-3 py-2 border border-gray-700 bg-gray-800/60 rounded-lg text-sm text-white focus:outline-none focus:border-blue-500"
          />
          <div className="text-sm text-gray-400">
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
            const hasGuardShift = dayShifts.some((s) => isSelectedGuardShift(s));
            return (
              <div key={day} className={`rounded-lg border p-4 ${hasGuardShift ? 'border-blue-500/40 bg-blue-500/10' : 'border-gray-800 bg-gray-800/30'}`}>
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-white capitalize">{day}</span>
                    {hasGuardShift && (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium bg-blue-500/15 text-blue-300">
                        <div className="w-3 h-3 flex items-center justify-center"><i className="ri-user-star-line"></i></div>
                        {dayShifts.filter((s) => isSelectedGuardShift(s)).length} assigned
                      </span>
                    )}
                  </div>
                  <span className="text-xs text-gray-500">{dayShifts.length} shift{dayShifts.length !== 1 ? 's' : ''}</span>
                </div>
                {dayShifts.length === 0 ? (
                  <p className="text-xs text-gray-500">No shifts scheduled</p>
                ) : (
                  <div className="space-y-1.5">
                    {dayShifts.map((s) => {
                      const highlight = isSelectedGuardShift(s);
                      return (
                        <div key={s.id} className={`flex items-center gap-3 text-sm rounded px-3 py-2 border ${highlight ? 'bg-blue-500/15 border-blue-500/40 text-blue-100' : 'bg-gray-800/40 border-gray-700 text-gray-300'}`}>
                          <span className={`capitalize text-xs font-medium px-2 py-0.5 rounded ${highlight ? 'bg-blue-500/30 text-blue-200' : 'bg-blue-500/15 text-blue-300'}`}>{s.shift_type || 'day'}</span>
                          <span className={highlight ? 'font-semibold' : ''}>{new Date(s.start_time).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit', hour12: false })} — {new Date(s.end_time).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit', hour12: false })}</span>
                          <span className="text-gray-500">{s.site_name}</span>
                          <span className={`ml-auto ${highlight ? 'font-semibold text-blue-200' : 'text-gray-400'}`}>{s.guard_name || 'Unassigned'}</span>
                        </div>
                      );
                    })}
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
      <h3 className="text-lg font-semibold text-white">Team Assignments</h3>
      {sites.length === 0 ? (
        <p className="text-sm text-gray-500">No sites configured.</p>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {sites.map((site) => {
            const siteShifts = shifts.filter((s) => s.site_id === site.id);
            return (
              <div key={site.id} className="bg-gray-800/40 border border-gray-800 p-4 rounded-lg">
                <h4 className="font-medium text-white mb-3">{site.site_name}</h4>
                {siteShifts.length === 0 ? (
                  <p className="text-xs text-gray-500">No shifts this week</p>
                ) : (
                  <div className="space-y-2">
                    {siteShifts.map((s) => (
                      <div key={s.id} className="flex items-center justify-between py-2 border-b border-gray-800 last:border-b-0 text-sm">
                        <div>
                          <span className="font-medium text-gray-300">{new Date(s.start_time).toLocaleDateString('en-GB', { weekday: 'short' })}</span>
                          <span className="text-gray-500 ml-2">{new Date(s.start_time).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit', hour12: false })}</span>
                        </div>
                        <span className="text-gray-400">{s.guard_name || 'Unassigned'}</span>
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
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
      <div className="bg-[#111827] border border-gray-800 rounded-xl w-full max-w-5xl max-h-[90vh] overflow-hidden">
        <div className="border-b border-gray-800 px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold text-white">Rota Management</h2>
              {selectedGuard && (
                <p className="text-sm text-gray-400 mt-1">Viewing schedule for {selectedGuard.first_name} {selectedGuard.last_name}</p>
              )}
            </div>
            <button onClick={onClose} className="w-8 h-8 flex items-center justify-center text-gray-400 hover:text-white hover:bg-gray-800 rounded-lg transition-colors cursor-pointer">
              <div className="w-4 h-4 flex items-center justify-center"><i className="ri-close-line"></i></div>
            </button>
          </div>
        </div>

        <div className="border-b border-gray-800">
          <nav className="flex space-x-8 px-6">
            <button
              onClick={() => setActiveTab('schedule')}
              className={`py-4 px-1 border-b-2 font-medium text-sm cursor-pointer whitespace-nowrap ${activeTab === 'schedule' ? 'border-blue-500 text-blue-400' : 'border-transparent text-gray-400 hover:text-gray-200'}`}
            >
              Weekly Schedule
            </button>
            <button
              onClick={() => setActiveTab('team')}
              className={`py-4 px-1 border-b-2 font-medium text-sm cursor-pointer whitespace-nowrap ${activeTab === 'team' ? 'border-blue-500 text-blue-400' : 'border-transparent text-gray-400 hover:text-gray-200'}`}
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
          <div className="px-6 py-2 text-sm text-emerald-400 bg-emerald-500/10 border-t border-emerald-500/20">{toast}</div>
        )}

        <div className="border-t border-gray-800 px-6 py-4">
          <div className="flex justify-end space-x-4">
            <button onClick={onClose} className="px-6 py-2 text-gray-300 border border-gray-700 rounded-lg hover:bg-gray-800 transition-colors cursor-pointer whitespace-nowrap">
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}