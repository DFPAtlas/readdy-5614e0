'use client';

import { useState, useEffect, useCallback } from 'react';
import { format } from 'date-fns';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/lib/auth';
import { OB_TYPE_ICON, OB_TYPE_COLOR, OB_ENTRY_TYPE_LABELS } from '@/lib/useOccurrenceBook';
import type { DashboardSite, RecentIncident, PatrolSummary, LiveOccurrence, GuardOnShift } from '@/lib/useDashboard';

interface SiteActivityTimelineProps {
  sites: DashboardSite[];
  incidents: RecentIncident[];
  patrolSummary: PatrolSummary[];
  guardsOnShift: GuardOnShift[];
  liveOccurrences: LiveOccurrence[];
}

interface TimelineItem {
  id: string;
  type: 'ob' | 'incident' | 'patrol' | 'attendance' | 'visitor' | 'sos' | 'lone_worker';
  title: string;
  description: string;
  timestamp: string;
  site_name: string;
  guard_name?: string;
  severity?: string;
  status?: string;
  entry_type?: string;
  icon: string;
  color: { bg: string; text: string };
}

function formatTime(iso: string) {
  const d = new Date(iso);
  const now = new Date();
  const diff = Math.floor((now.getTime() - d.getTime()) / 1000);
  if (diff < 60) return 'Just now';
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return format(d, 'd MMM HH:mm');
}

function getIncidentColor(severity: string) {
  switch (severity) {
    case 'critical': return { bg: 'bg-red-500/10', text: 'text-red-400' };
    case 'high': return { bg: 'bg-orange-500/10', text: 'text-orange-400' };
    case 'medium': return { bg: 'bg-amber-500/10', text: 'text-amber-400' };
    default: return { bg: 'bg-emerald-500/10', text: 'text-emerald-400' };
  }
}

export default function SiteActivityTimeline({ sites, incidents, patrolSummary, guardsOnShift, liveOccurrences }: SiteActivityTimelineProps) {
  const { companyId } = useAuth();
  const [items, setItems] = useState<TimelineItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedSite, setSelectedSite] = useState<string>('');
  const [typeFilter, setTypeFilter] = useState<string>('');

  const fetchData = useCallback(async () => {
    if (!companyId) return;
    setLoading(true);

    const items: TimelineItem[] = [];

    incidents.forEach((inc) => {
      items.push({
        id: `inc-${inc.id}`,
        type: 'incident',
        title: inc.incident_type || 'Incident',
        description: inc.site_name || '',
        timestamp: inc.occurred_at || inc.created_at,
        site_name: inc.site_name || '',
        severity: inc.severity,
        status: inc.status,
        icon: 'ri-alarm-warning-line',
        color: getIncidentColor(inc.severity),
      });
    });

    liveOccurrences.forEach((occ) => {
      const type = occ.entry_type || 'other';
      const colors = OB_TYPE_COLOR[type] || OB_TYPE_COLOR['other'];
      items.push({
        id: `ob-${occ.id}`,
        type: 'ob',
        title: OB_ENTRY_TYPE_LABELS[type] || type,
        description: occ.site_name || '',
        timestamp: occ.occurred_at || occ.created_at,
        site_name: occ.site_name || '',
        entry_type: type,
        icon: OB_TYPE_ICON[type] || 'ri-sticky-note-line',
        color: { bg: colors.bg, text: colors.text },
      });
    });

    patrolSummary.forEach((p) => {
      const statusText = p.status === 'completed' ? 'Patrol Completed' : p.status === 'partial' ? 'Patrol Partial' : p.status === 'missed' ? 'Patrol Missed' : 'Patrol';
      items.push({
        id: `patrol-${p.site_id || '0'}`,
        type: 'patrol',
        title: statusText,
        description: `${p.site_name} - ${p.checkpoints_completed}/${p.checkpoints_total} checkpoints`,
        timestamp: new Date().toISOString(),
        site_name: p.site_name || '',
        status: p.status,
        icon: 'ri-route-line',
        color: p.status === 'completed' ? { bg: 'bg-emerald-500/10', text: 'text-emerald-400' } : p.status === 'partial' ? { bg: 'bg-amber-500/10', text: 'text-amber-400' } : { bg: 'bg-red-500/10', text: 'text-red-400' },
      });
    });

    items.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
    setItems(items.slice(0, 50));
    setLoading(false);
  }, [companyId, incidents, liveOccurrences, patrolSummary]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const filteredItems = items.filter((item) => {
    if (selectedSite && item.site_name !== selectedSite) return false;
    if (typeFilter && item.type !== typeFilter) return false;
    return true;
  });

  const siteNames = [...new Set(items.map((i) => i.site_name).filter(Boolean))];
  const types = [
    { value: '', label: 'All Types' },
    { value: 'ob', label: 'OB Entries' },
    { value: 'incident', label: 'Incidents' },
    { value: 'patrol', label: 'Patrols' },
  ];

  if (loading && items.length === 0) {
    return (
      <div className="bg-[#0f172a]/70 backdrop-blur-sm border border-white/10 shadow-sm rounded-xl p-5">
        <div className="flex items-center gap-2 mb-4">
          <div className="w-5 h-5 flex items-center justify-center text-blue-400">
            <i className="ri-timeline-view text-sm"></i>
          </div>
          <h3 className="text-sm font-semibold text-white">Site Activity Timeline</h3>
        </div>
        <div className="flex items-center justify-center py-10">
          <div className="w-6 h-6 border-2 border-blue-500/30 border-t-blue-500 rounded-full animate-spin"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-[#0f172a]/70 backdrop-blur-sm border border-white/10 shadow-sm rounded-xl p-5">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className="w-5 h-5 flex items-center justify-center text-blue-400">
            <i className="ri-timeline-view text-sm"></i>
          </div>
          <h3 className="text-sm font-semibold text-white">Site Activity Timeline</h3>
        </div>
        <div className="flex items-center gap-2">
          <div className="relative">
            <div className="w-4 h-4 flex items-center justify-center absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-500">
              <i className="ri-building-line text-xs"></i>
            </div>
            <select
              value={selectedSite}
              onChange={(e) => setSelectedSite(e.target.value)}
              className="bg-gray-800/60 border border-gray-700 rounded-lg pl-8 pr-3 py-1.5 text-xs text-white focus:outline-none focus:border-blue-500 cursor-pointer appearance-none"
            >
              <option value="">All Sites</option>
              {siteNames.map((name) => (
                <option key={name} value={name}>{name}</option>
              ))}
            </select>
          </div>
          <div className="flex items-center gap-0.5 bg-gray-800/40 rounded-lg p-0.5">
            {types.map((t) => (
              <button
                key={t.value}
                onClick={() => setTypeFilter(t.value)}
                className={`px-2.5 py-1 rounded-md text-xs font-medium transition-colors cursor-pointer whitespace-nowrap ${
                  typeFilter === t.value
                    ? 'bg-blue-600/30 text-blue-400'
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {filteredItems.length === 0 ? (
        <div className="text-center py-10">
          <div className="w-10 h-10 mx-auto flex items-center justify-center text-gray-600 mb-3">
            <i className="ri-history-line text-xl"></i>
          </div>
          <p className="text-sm text-gray-500">No activity to display for the selected filters.</p>
        </div>
      ) : (
        <div className="relative">
          <div className="absolute left-[19px] top-0 bottom-0 w-px bg-gray-800"></div>
          <div className="space-y-1">
            {filteredItems.map((item, idx) => (
              <div key={item.id} className="flex gap-3 py-2 pl-1">
                <div className={`relative z-10 w-2.5 h-2.5 rounded-full mt-1.5 flex-shrink-0 ${
                  item.type === 'incident' ? (item.severity === 'critical' ? 'bg-red-500' : item.severity === 'high' ? 'bg-orange-500' : 'bg-amber-500') :
                  item.type === 'patrol' ? (item.status === 'completed' ? 'bg-emerald-500' : item.status === 'partial' ? 'bg-amber-500' : 'bg-red-500') :
                  'bg-blue-500'
                }`}></div>
                <div className="flex-1 min-w-0 bg-gray-900/30 rounded-lg px-3 py-2 border border-gray-800/50">
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2 min-w-0">
                      <span className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-medium ${item.color.bg} ${item.color.text}`}>
                        <div className="w-3 h-3 flex items-center justify-center">
                          <i className={item.icon}></i>
                        </div>
                        {item.title}
                      </span>
                    </div>
                    <span className="text-[11px] text-gray-500 flex-shrink-0">{formatTime(item.timestamp)}</span>
                  </div>
                  <p className="text-xs text-gray-400 mt-1">{item.description}</p>
                  {item.severity && (
                    <span className={`text-[10px] px-1 rounded mt-1 inline-block ${
                      item.severity === 'critical' ? 'text-red-400 bg-red-500/10' :
                      item.severity === 'high' ? 'text-orange-400 bg-orange-500/10' :
                      'text-amber-400 bg-amber-500/10'
                    }`}>{item.severity}</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}