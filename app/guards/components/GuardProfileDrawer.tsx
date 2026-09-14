'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import type { Guard } from '@/lib/useGuards';
import { getFullName, getInitials, getDaysUntil, getSIAStatus } from '@/lib/useGuards';
import { supabase } from '@/lib/supabase';
import SkillsChips from './SkillsChips';
import GuardAvailabilityEditor from './GuardAvailabilityEditor';
import GuardTimeOffEditor from './GuardTimeOffEditor';

function avatarGradient(id: string) {
  const gradients = [
    'bg-gradient-to-br from-blue-500/20 to-cyan-500/20 text-blue-300',
    'bg-gradient-to-br from-emerald-500/20 to-teal-500/20 text-emerald-300',
    'bg-gradient-to-br from-violet-500/20 to-fuchsia-500/20 text-violet-300',
    'bg-gradient-to-br from-orange-500/20 to-red-500/20 text-orange-300',
    'bg-gradient-to-br from-sky-500/20 to-indigo-500/20 text-sky-300',
    'bg-gradient-to-br from-rose-500/20 to-pink-500/20 text-rose-300',
  ];
  let hash = 0;
  for (let i = 0; i < id.length; i++) hash = (hash * 31 + id.charCodeAt(i)) % gradients.length;
  return gradients[Math.abs(hash)];
}

interface Props {
  guard: Guard | null;
  onClose: () => void;
  onEdit: (guard: Guard) => void;
}

interface GuardShift {
  id: string;
  start_time: string;
  end_time: string;
  status: string | null;
  shift_type: string | null;
  sites: { site_name: string | null } | null;
}

interface GuardIncident {
  id: string;
  incident_number: string | null;
  title: string | null;
  incident_type: string | null;
  severity: string | null;
  status: string | null;
  occurred_at: string | null;
  created_at: string | null;
  sites: { site_name: string | null } | null;
}

interface GuardDocument {
  id: string;
  document_title: string;
  document_type: string;
  status: string | null;
  review_status: string | null;
  expiry_date: string | null;
  file_url: string | null;
}

const formatDateTime = (value: string | null) => value
  ? new Intl.DateTimeFormat('en-GB', { dateStyle: 'medium', timeStyle: 'short' }).format(new Date(value))
  : 'Not recorded';

const badgeTone = (value: string | null) => {
  const status = (value || '').toLowerCase();
  if (['active', 'completed', 'closed', 'approved', 'valid'].includes(status)) return 'bg-emerald-500/10 text-emerald-400';
  if (['critical', 'expired', 'rejected', 'cancelled'].includes(status)) return 'bg-red-500/10 text-red-400';
  if (['pending', 'open', 'reviewing', 'scheduled', 'awaiting_review'].includes(status)) return 'bg-amber-500/10 text-amber-400';
  return 'bg-gray-500/10 text-gray-400';
};

export default function GuardProfileDrawer({ guard, onClose, onEdit }: Props) {
  const [tab, setTab] = useState<'overview' | 'shifts' | 'incidents' | 'documents' | 'availability' | 'timeoff'>('overview');
  const [shifts, setShifts] = useState<GuardShift[]>([]);
  const [incidents, setIncidents] = useState<GuardIncident[]>([]);
  const [documents, setDocuments] = useState<GuardDocument[]>([]);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [historyError, setHistoryError] = useState<string | null>(null);

  useEffect(() => {
    if (!guard) return;
    let active = true;
    setTab('overview');
    setHistoryLoading(true);
    setHistoryError(null);

    Promise.all([
      supabase
        .from('shifts')
        .select('id, start_time, end_time, status, shift_type, sites(site_name)')
        .eq('guard_id', guard.id)
        .order('start_time', { ascending: false })
        .limit(20),
      supabase
        .from('incidents')
        .select('id, incident_number, title, incident_type, severity, status, occurred_at, created_at, sites(site_name)')
        .eq('guard_id', guard.id)
        .order('occurred_at', { ascending: false })
        .limit(20),
      supabase
        .from('compliance_documents')
        .select('id, document_title, document_type, status, review_status, expiry_date, file_url')
        .eq('entity_type', 'guard')
        .eq('entity_id', guard.id)
        .order('created_at', { ascending: false }),
    ]).then(([shiftResult, incidentResult, documentResult]) => {
      if (!active) return;
      const firstError = shiftResult.error || incidentResult.error || documentResult.error;
      if (firstError) setHistoryError(firstError.message);
      setShifts((shiftResult.data || []) as unknown as GuardShift[]);
      setIncidents((incidentResult.data || []) as unknown as GuardIncident[]);
      setDocuments((documentResult.data || []) as GuardDocument[]);
      setHistoryLoading(false);
    });

    return () => { active = false; };
  }, [guard?.id]);

  if (!guard) return null;

  const daysLeft = getDaysUntil(guard.sia_expiry);
  const siaStatus = getSIAStatus(guard.sia_expiry);

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      <div className="absolute inset-0 bg-black/50" onClick={onClose}></div>
      <div className="relative w-full max-w-md bg-[#111827] border-l border-gray-800 h-full overflow-y-auto">
        <div className="sticky top-0 bg-[#111827] border-b border-gray-800 px-5 py-4 flex items-center justify-between z-10">
          <h2 className="text-lg font-semibold text-white">Guard Profile</h2>
          <button onClick={onClose} className="w-8 h-8 flex items-center justify-center text-gray-400 hover:text-white rounded-lg transition-colors cursor-pointer">
            <div className="w-4 h-4 flex items-center justify-center"><i className="ri-close-line"></i></div>
          </button>
        </div>

        <div className="px-5 py-6">
          <div className="flex items-center gap-4 mb-6">
            <div className={`w-14 h-14 rounded-full flex items-center justify-center text-lg font-bold ${avatarGradient(guard.id)}`}>
              {getInitials(guard)}
            </div>
            <div>
              <h3 className="text-lg font-semibold text-white">{getFullName(guard)}</h3>
              <div className="flex items-center gap-2 mt-1">
                <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${(guard.status || 'active') === 'active' ? 'bg-emerald-500/10 text-emerald-400' : (guard.status || 'active') === 'suspended' ? 'bg-amber-500/10 text-amber-400' : 'bg-gray-500/10 text-gray-400'}`}>
                  {(guard.status || 'active').charAt(0).toUpperCase() + (guard.status || 'active').slice(1)}
                </span>
                <span className="text-xs text-gray-500">{guard.email || 'No email'}</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-1 bg-gray-800/40 rounded-lg p-1 mb-6 overflow-x-auto">
            {(['overview', 'shifts', 'incidents', 'documents', 'availability', 'timeoff'] as const).map((t) => (
              <button
                key={t}
                onClick={() => setTab(t)}
                className={`flex-1 min-w-fit text-xs font-medium px-3 py-1.5 rounded-md transition-colors cursor-pointer whitespace-nowrap ${tab === t ? 'bg-gray-700 text-white' : 'text-gray-400 hover:text-white'}`}
              >
                {t === 'timeoff' ? 'Time Off' : t.charAt(0).toUpperCase() + t.slice(1)}
              </button>
            ))}
          </div>

          {tab === 'overview' && (
            <div className="space-y-5">
              <div className="bg-gray-800/40 border border-gray-800 rounded-xl p-4">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="text-sm font-medium text-white flex items-center gap-2">
                    <div className="w-4 h-4 flex items-center justify-center"><i className="ri-shield-check-line text-blue-400"></i></div>
                    SIA Licence
                  </h4>
                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${siaStatus === 'expired' ? 'bg-red-500/10 text-red-400' : siaStatus === 'expiring_soon' ? 'bg-amber-500/10 text-amber-400' : 'bg-emerald-500/10 text-emerald-400'}`}>
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
                  <div>
                    <p className="text-xs text-gray-500 mb-0.5">Hourly Rate</p>
                    <p className="text-gray-300">{guard.hourly_rate != null ? `£${Number(guard.hourly_rate).toFixed(2)}/hr` : '—'}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 mb-0.5">Phone</p>
                    <p className="text-gray-300">{guard.phone || '—'}</p>
                  </div>
                </div>
                {guard.sia_expiry && (
                  <div className="mt-3">
                    <div className="w-full bg-gray-700 rounded-full h-2">
                      <div
                        className={`h-2 rounded-full ${daysLeft != null && daysLeft < 0 ? 'bg-red-500' : daysLeft != null && daysLeft <= 60 ? 'bg-amber-500' : 'bg-emerald-500'}`}
                        style={{ width: `${Math.max(0, Math.min(100, (daysLeft != null ? Math.max(0, daysLeft) : 365) / 365 * 100))}%` }}
                      ></div>
                    </div>
                    <p className="text-xs text-gray-500 mt-1">
                      {daysLeft != null && daysLeft < 0 ? `${Math.abs(daysLeft)} days overdue` : `${daysLeft} days remaining until expiry`}
                    </p>
                  </div>
                )}
              </div>

              <div>
                <h4 className="text-sm font-medium text-white mb-2">Skills</h4>
                <SkillsChips skills={guard.skills} showAll />
                {(!guard.skills || guard.skills.length === 0) && (
                  <p className="text-sm text-gray-500">No skills recorded.</p>
                )}
              </div>

              <button
                onClick={() => { onEdit(guard); onClose(); }}
                className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-500 text-white text-sm font-medium rounded-lg transition-colors cursor-pointer"
              >
                <div className="w-4 h-4 flex items-center justify-center"><i className="ri-edit-line"></i></div>
                Edit Guard
              </button>
            </div>
          )}

          {tab === 'shifts' && (
            <HistoryState loading={historyLoading} error={historyError} empty={shifts.length === 0} icon="ri-calendar-event-line" emptyText="No shifts recorded for this guard.">
              <div className="space-y-2">
                {shifts.map((shift) => (
                  <div key={shift.id} className="rounded-xl border border-gray-800 bg-gray-800/30 p-3">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="text-sm font-medium text-white">{shift.sites?.site_name || 'Unassigned site'}</p>
                        <p className="text-xs text-gray-500 mt-1">{formatDateTime(shift.start_time)}</p>
                        <p className="text-xs text-gray-500">to {formatDateTime(shift.end_time)}</p>
                      </div>
                      <span className={`text-[11px] px-2 py-0.5 rounded-full font-medium capitalize ${badgeTone(shift.status)}`}>{shift.status || 'Unknown'}</span>
                    </div>
                    {shift.shift_type && <p className="text-xs text-gray-400 mt-2 capitalize">{shift.shift_type.replace(/_/g, ' ')}</p>}
                  </div>
                ))}
              </div>
            </HistoryState>
          )}

          {tab === 'incidents' && (
            <HistoryState loading={historyLoading} error={historyError} empty={incidents.length === 0} icon="ri-alarm-warning-line" emptyText="No incidents recorded for this guard.">
              <div className="space-y-2">
                {incidents.map((incident) => (
                  <Link key={incident.id} href={`/incidents/${incident.id}`} onClick={onClose} className="block rounded-xl border border-gray-800 bg-gray-800/30 p-3 hover:border-gray-700 hover:bg-gray-800/50 transition-colors">
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <p className="text-sm font-medium text-white truncate">{incident.title || incident.incident_type || 'Incident'}</p>
                        <p className="text-xs text-gray-500 mt-1">{incident.incident_number || incident.sites?.site_name || 'No reference'}</p>
                        <p className="text-xs text-gray-500">{formatDateTime(incident.occurred_at || incident.created_at)}</p>
                      </div>
                      <div className="flex flex-col items-end gap-1">
                        <span className={`text-[11px] px-2 py-0.5 rounded-full font-medium capitalize ${badgeTone(incident.severity)}`}>{incident.severity || 'Unrated'}</span>
                        <span className={`text-[11px] capitalize ${badgeTone(incident.status)} px-2 py-0.5 rounded-full`}>{incident.status || 'Unknown'}</span>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </HistoryState>
          )}

          {tab === 'documents' && (
            <HistoryState loading={historyLoading} error={historyError} empty={documents.length === 0} icon="ri-file-list-line" emptyText="No compliance documents uploaded for this guard.">
              <div className="space-y-2">
                {documents.map((document) => {
                  const content = (
                    <div className="rounded-xl border border-gray-800 bg-gray-800/30 p-3 hover:border-gray-700 transition-colors">
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <p className="text-sm font-medium text-white truncate">{document.document_title}</p>
                          <p className="text-xs text-gray-500 mt-1 capitalize">{document.document_type.replace(/_/g, ' ')}</p>
                          <p className="text-xs text-gray-500">Expires: {document.expiry_date ? new Intl.DateTimeFormat('en-GB', { dateStyle: 'medium' }).format(new Date(document.expiry_date)) : 'No expiry'}</p>
                        </div>
                        <span className={`text-[11px] px-2 py-0.5 rounded-full font-medium capitalize ${badgeTone(document.review_status || document.status)}`}>{(document.review_status || document.status || 'Unknown').replace(/_/g, ' ')}</span>
                      </div>
                    </div>
                  );
                  return document.file_url
                    ? <a key={document.id} href={document.file_url} target="_blank" rel="noreferrer">{content}</a>
                    : <div key={document.id}>{content}</div>;
                })}
                <Link href="/dashboard/compliance/documents" onClick={onClose} className="inline-flex items-center gap-2 text-xs text-blue-400 hover:text-blue-300 mt-2">
                  Manage all compliance documents <i className="ri-arrow-right-line"></i>
                </Link>
              </div>
            </HistoryState>
          )}

          {tab === 'availability' && (
            <div>
              <h4 className="text-sm font-medium text-white mb-3 flex items-center gap-2">
                <div className="w-4 h-4 flex items-center justify-center"><i className="ri-calendar-check-line text-blue-400"></i></div>
                Weekly Availability
              </h4>
              <GuardAvailabilityEditor guardId={guard.id} />
            </div>
          )}

          {tab === 'timeoff' && (
            <div>
              <h4 className="text-sm font-medium text-white mb-3 flex items-center gap-2">
                <div className="w-4 h-4 flex items-center justify-center"><i className="ri-time-line text-amber-400"></i></div>
                Time Off
              </h4>
              <GuardTimeOffEditor guardId={guard.id} />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function HistoryState({ loading, error, empty, icon, emptyText, children }: { loading: boolean; error: string | null; empty: boolean; icon: string; emptyText: string; children: React.ReactNode }) {
  if (loading) return <div className="flex justify-center py-10"><div className="w-7 h-7 border-2 border-blue-500/30 border-t-blue-500 rounded-full animate-spin"></div></div>;
  if (error) return <div className="rounded-xl border border-red-500/20 bg-red-500/5 p-4 text-sm text-red-300">Unable to load this history. {error}</div>;
  if (empty) return (
    <div className="text-center py-8">
      <div className="w-10 h-10 mx-auto mb-3 flex items-center justify-center text-gray-600"><i className={`${icon} text-2xl`}></i></div>
      <p className="text-sm text-gray-500">{emptyText}</p>
    </div>
  );
  return <>{children}</>;
}
