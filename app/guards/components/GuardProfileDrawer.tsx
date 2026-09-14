'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import type { Guard } from '@/lib/useGuards';
import { getFullName, getInitials, getDaysUntil } from '@/lib/useGuards';
import { SEVERITY_COLORS } from '@/lib/useIncidents';
import { useGuardProfile } from '@/lib/useGuardProfile';
import type { GuardShift, GuardIncident, GuardDoc } from '@/lib/useGuardProfile';
import SkillsChips from './SkillsChips';
import GuardAvailabilityEditor from './GuardAvailabilityEditor';
import GuardTimeOffEditor from './GuardTimeOffEditor';

type Tab = 'overview' | 'shifts' | 'incidents' | 'documents' | 'availability' | 'timeoff';

const TABS: { key: Tab; label: string }[] = [
  { key: 'overview', label: 'Overview' },
  { key: 'shifts', label: 'Shift History' },
  { key: 'incidents', label: 'Incidents' },
  { key: 'documents', label: 'Documents' },
  { key: 'availability', label: 'Availability' },
  { key: 'timeoff', label: 'Time Off' },
];

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

function formatUKDate(value: string | null): string {
  if (!value) return '';
  const d = new Date(value);
  if (isNaN(d.getTime())) return '';
  return d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
}

function formatUKDateTime(value: string | null): string {
  if (!value) return '—';
  const d = new Date(value);
  if (isNaN(d.getTime())) return '—';
  return (
    d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) +
    ', ' +
    d.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })
  );
}

function friendlyLabel(value: string | null | undefined): string {
  if (!value) return '—';
  return value.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
}

function shiftState(shift: GuardShift): { label: string; tone: string } {
  const now = Date.now();
  const start = new Date(shift.start_time).getTime();
  const end = new Date(shift.end_time).getTime();
  if (shift.status === 'cancelled') return { label: 'Cancelled', tone: 'bg-gray-500/10 text-gray-400' };
  if (now < start) return { label: 'Upcoming', tone: 'bg-blue-500/10 text-blue-400' };
  if (now > end) return { label: 'Completed', tone: 'bg-emerald-500/10 text-emerald-400' };
  return { label: 'Active', tone: 'bg-amber-500/10 text-amber-400' };
}

const INCIDENT_STATUS_TONE: Record<string, string> = {
  open: 'bg-amber-500/10 text-amber-400',
  in_progress: 'bg-blue-500/10 text-blue-400',
  resolved: 'bg-emerald-500/10 text-emerald-400',
  closed: 'bg-emerald-500/10 text-emerald-400',
};

function incidentStatusTone(status: string | null): string {
  return INCIDENT_STATUS_TONE[(status || '').toLowerCase()] || 'bg-gray-500/10 text-gray-400';
}

function docStatus(doc: GuardDoc): { label: string; tone: string } {
  if ((doc.status || '').toLowerCase() === 'rejected') return { label: 'Rejected', tone: 'bg-red-500/10 text-red-400' };
  if ((doc.review_status || '').toLowerCase() === 'pending') return { label: 'Awaiting review', tone: 'bg-amber-500/10 text-amber-400' };
  const days = doc.expiry_date ? getDaysUntil(doc.expiry_date) : null;
  if (days === null) return { label: 'No expiry', tone: 'bg-gray-500/10 text-gray-400' };
  if (days < 0) return { label: 'Expired', tone: 'bg-red-500/10 text-red-400' };
  if (days <= 30) return { label: 'Expiring soon', tone: 'bg-amber-500/10 text-amber-400' };
  return { label: 'Active', tone: 'bg-emerald-500/10 text-emerald-400' };
}

function LoadingBlock() {
  return (
    <div className="py-10 flex flex-col items-center justify-center gap-2">
      <div className="w-6 h-6 border-2 border-gray-700 border-t-blue-500 rounded-full animate-spin"></div>
      <p className="text-xs text-gray-500">Loading…</p>
    </div>
  );
}

function ErrorBlock({ message, onRetry }: { message: string; onRetry: () => void }) {
  return (
    <div className="py-8 text-center">
      <div className="w-10 h-10 mx-auto mb-3 flex items-center justify-center rounded-xl bg-red-500/10 text-red-400">
        <i className="ri-error-warning-line text-xl"></i>
      </div>
      <p className="text-sm text-gray-300 mb-1">Couldn&apos;t load this data</p>
      <p className="text-xs text-gray-500 mb-3">{message}</p>
      <button
        onClick={onRetry}
        className="inline-flex items-center gap-2 px-3 py-1.5 text-xs font-medium bg-gray-800 hover:bg-gray-700 text-gray-200 rounded-lg transition-colors cursor-pointer"
      >
        <div className="w-4 h-4 flex items-center justify-center"><i className="ri-refresh-line"></i></div>
        Retry
      </button>
    </div>
  );
}

function EmptyBlock({ icon, label }: { icon: string; label: string }) {
  return (
    <div className="py-8 text-center">
      <div className="w-10 h-10 mx-auto mb-3 flex items-center justify-center rounded-xl bg-gray-800/60 text-gray-500">
        <i className={`${icon} text-xl`}></i>
      </div>
      <p className="text-sm text-gray-500">{label}</p>
    </div>
  );
}

interface Props {
  guard: Guard | null;
  onClose: () => void;
  onEdit: (guard: Guard) => void;
  canEdit?: boolean;
  canViewIncidents?: boolean;
}

export default function GuardProfileDrawer({ guard, onClose, onEdit, canEdit = false, canViewIncidents = false }: Props) {
  const [tab, setTab] = useState<Tab>('overview');
  const drawerRef = useRef<HTMLDivElement>(null);
  const previousFocusRef = useRef<HTMLElement | null>(null);

  const {
    shifts,
    incidents,
    docs,
    shiftsLoading,
    incidentsLoading,
    docsLoading,
    shiftsError,
    incidentsError,
    docsError,
    refetchShifts,
    refetchIncidents,
    refetchDocs,
  } = useGuardProfile(guard?.id ?? null);

  useEffect(() => {
    if (!guard) return;
    previousFocusRef.current = document.activeElement as HTMLElement | null;
    document.body.style.overflow = 'hidden';
    const closeBtn = drawerRef.current?.querySelector<HTMLElement>('[data-drawer-close]');
    closeBtn?.focus();
    return () => {
      document.body.style.overflow = '';
      previousFocusRef.current?.focus?.();
    };
  }, [guard]);

  useEffect(() => {
    if (!guard) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        onClose();
        return;
      }
      if (e.key !== 'Tab') return;
      const container = drawerRef.current;
      if (!container) return;
      const focusable = Array.from(
        container.querySelectorAll<HTMLElement>('button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])')
      ).filter((el) => el.offsetParent !== null);
      if (focusable.length === 0) return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [guard, onClose]);

  if (!guard) return null;

  const daysLeft = getDaysUntil(guard.sia_expiry);
  const hasLicence = !!guard.sia_licence;
  const hasExpiry = !!guard.sia_expiry;

  let siaBadge: { label: string; tone: string };
  if (!hasLicence && !hasExpiry) siaBadge = { label: 'Not recorded', tone: 'bg-gray-500/10 text-gray-400' };
  else if (!hasExpiry) siaBadge = { label: 'No expiry date', tone: 'bg-gray-500/10 text-gray-400' };
  else if (daysLeft === null) siaBadge = { label: 'No expiry date', tone: 'bg-gray-500/10 text-gray-400' };
  else if (daysLeft < 0) siaBadge = { label: 'Expired', tone: 'bg-red-500/10 text-red-400' };
  else if (daysLeft <= 60) siaBadge = { label: daysLeft >= 0 ? `Expiring in ${daysLeft} days` : 'Expiring soon', tone: 'bg-amber-500/10 text-amber-400' };
  else siaBadge = { label: 'Valid', tone: 'bg-emerald-500/10 text-emerald-400' };

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} aria-hidden="true"></div>
      <div
        ref={drawerRef}
        role="dialog"
        aria-modal="true"
        aria-label={`Guard profile for ${getFullName(guard)}`}
        className="relative w-full max-w-md bg-[#111827] border-l border-gray-800 h-full overflow-y-auto"
      >
        <div className="sticky top-0 bg-[#111827] border-b border-gray-800 px-5 py-4 flex items-center justify-between z-10">
          <h2 className="text-lg font-semibold text-white">Guard Profile</h2>
          <button
            data-drawer-close
            onClick={onClose}
            aria-label="Close guard profile"
            className="w-8 h-8 flex items-center justify-center text-gray-400 hover:text-white rounded-lg transition-colors cursor-pointer"
          >
            <div className="w-4 h-4 flex items-center justify-center"><i className="ri-close-line"></i></div>
          </button>
        </div>

        <div className="px-5 py-6">
          <div className="flex items-center gap-4 mb-5">
            <div className={`w-14 h-14 rounded-full flex items-center justify-center text-lg font-bold ${avatarGradient(guard.id)}`}>
              {getInitials(guard)}
            </div>
            <div className="min-w-0">
              <h3 className="text-lg font-semibold text-white truncate">{getFullName(guard)}</h3>
              <div className="flex items-center gap-2 mt-1 flex-wrap">
                <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${(guard.status || 'active') === 'active' ? 'bg-emerald-500/10 text-emerald-400' : (guard.status || 'active') === 'suspended' ? 'bg-amber-500/10 text-amber-400' : 'bg-gray-500/10 text-gray-400'}`}>
                  {(guard.status || 'active').charAt(0).toUpperCase() + (guard.status || 'active').slice(1)}
                </span>
                <span className="text-xs text-gray-500 truncate">{guard.email || 'No email'}</span>
              </div>
            </div>
          </div>

          <div className="overflow-x-auto -mx-5 px-5 mb-6" role="tablist" aria-label="Guard profile sections">
            <div className="flex items-center gap-1 bg-gray-800/40 rounded-lg p-1 w-max">
              {TABS.map((t) => (
                <button
                  key={t.key}
                  role="tab"
                  aria-selected={tab === t.key}
                  onClick={() => setTab(t.key)}
                  className={`flex-none text-xs font-medium px-3 py-1.5 rounded-md transition-colors cursor-pointer whitespace-nowrap ${tab === t.key ? 'bg-gray-700 text-white' : 'text-gray-400 hover:text-white'}`}
                >
                  {t.label}
                </button>
              ))}
            </div>
          </div>

          {tab === 'overview' && (
            <div className="space-y-5">
              <div className="bg-gray-800/40 border border-gray-800 rounded-xl p-4">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="text-sm font-medium text-white flex items-center gap-2">
                    <div className="w-4 h-4 flex items-center justify-center"><i className="ri-shield-check-line text-blue-400"></i></div>
                    SIA Licence
                  </h4>
                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${siaBadge.tone}`}>
                    {siaBadge.label}
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div>
                    <p className="text-xs text-gray-500 mb-0.5">Licence Number</p>
                    <p className="text-gray-300 font-mono">{hasLicence ? `•••• ${guard.sia_licence!.slice(-4)}` : '—'}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 mb-0.5">Expires</p>
                    <p className="text-gray-300">{hasExpiry ? formatUKDate(guard.sia_expiry) : '—'}</p>
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
                {hasExpiry && daysLeft !== null && (
                  <div className="mt-3">
                    <div className="w-full bg-gray-700 rounded-full h-2">
                      <div
                        className={`h-2 rounded-full ${daysLeft < 0 ? 'bg-red-500' : daysLeft <= 60 ? 'bg-amber-500' : 'bg-emerald-500'}`}
                        style={{ width: `${Math.max(0, Math.min(100, (Math.max(0, daysLeft) / 365) * 100))}%` }}
                      ></div>
                    </div>
                    <p className="text-xs text-gray-500 mt-1">
                      {daysLeft < 0 ? `${Math.abs(daysLeft)} days overdue` : `${daysLeft} days remaining until expiry`}
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

              {canEdit && (
                <button
                  onClick={() => { onEdit(guard); onClose(); }}
                  className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-500 text-white text-sm font-medium rounded-lg transition-colors cursor-pointer"
                >
                  <div className="w-4 h-4 flex items-center justify-center"><i className="ri-edit-line"></i></div>
                  Edit Guard
                </button>
              )}
            </div>
          )}

          {tab === 'shifts' && (
            <ShiftHistory
              shifts={shifts}
              loading={shiftsLoading}
              error={shiftsError}
              onRetry={refetchShifts}
            />
          )}

          {tab === 'incidents' && (
            <IncidentHistory
              incidents={incidents}
              loading={incidentsLoading}
              error={incidentsError}
              onRetry={refetchIncidents}
              canView={canViewIncidents}
            />
          )}

          {tab === 'documents' && (
            <ComplianceDocs
              docs={docs}
              loading={docsLoading}
              error={docsError}
              onRetry={refetchDocs}
              canManage={canEdit}
            />
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

function ShiftHistory({ shifts, loading, error, onRetry }: { shifts: GuardShift[]; loading: boolean; error: string | null; onRetry: () => void }) {
  if (loading) return <LoadingBlock />;
  if (error) return <ErrorBlock message={error} onRetry={onRetry} />;
  if (shifts.length === 0) return <EmptyBlock icon="ri-calendar-event-line" label="No shifts recorded for this guard." />;

  return (
    <div className="space-y-2">
      {shifts.map((s) => {
        const st = shiftState(s);
        return (
          <div key={s.id} className="bg-gray-800/40 border border-gray-800 rounded-lg p-3">
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0">
                <p className="text-sm font-medium text-white truncate">{s.site_name || 'Unassigned site'}</p>
                <p className="text-xs text-gray-500 mt-0.5">
                  {formatUKDateTime(s.start_time)} — {formatUKDateTime(s.end_time)}
                </p>
                <p className="text-xs text-gray-400 mt-1">{friendlyLabel(s.shift_type)}</p>
              </div>
              <span className={`flex-none text-xs px-2 py-0.5 rounded-full font-medium ${st.tone}`}>{st.label}</span>
            </div>
          </div>
        );
      })}
    </div>
  );
}

function IncidentHistory({ incidents, loading, error, onRetry, canView }: { incidents: GuardIncident[]; loading: boolean; error: string | null; onRetry: () => void; canView: boolean }) {
  if (loading) return <LoadingBlock />;
  if (error) return <ErrorBlock message={error} onRetry={onRetry} />;
  if (incidents.length === 0) return <EmptyBlock icon="ri-alarm-warning-line" label="No incidents recorded for this guard." />;

  return (
    <div className="space-y-2">
      {incidents.map((inc) => {
        const sev = SEVERITY_COLORS[(inc.severity || '').toLowerCase()] || { bg: 'bg-gray-500/10', text: 'text-gray-400', dot: 'bg-gray-500' };
        const stTone = incidentStatusTone(inc.status);
        const title = inc.title || inc.incident_type || 'Incident';
        return (
          <div key={inc.id} className="bg-gray-800/40 border border-gray-800 rounded-lg p-3">
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0">
                <p className="text-xs text-gray-500 font-mono">{inc.incident_number || '—'}</p>
                <p className="text-sm font-medium text-white truncate mt-0.5">{title}</p>
                <p className="text-xs text-gray-500 mt-0.5">
                  {inc.site_name || 'Unknown site'} · {formatUKDateTime(inc.occurred_at)}
                </p>
              </div>
              <span className={`flex-none text-xs px-2 py-0.5 rounded-full font-medium ${stTone}`}>
                {friendlyLabel(inc.status)}
              </span>
            </div>
            <div className="flex items-center justify-between mt-2">
              <span className={`inline-flex items-center gap-1.5 text-xs font-medium px-2 py-0.5 rounded-full ${sev.bg} ${sev.text}`}>
                <span className={`w-1.5 h-1.5 rounded-full ${sev.dot}`}></span>
                {friendlyLabel(inc.severity)}
              </span>
              {canView && (
                <Link
                  href={`/incidents/${inc.id}`}
                  className="inline-flex items-center gap-1 text-xs font-medium text-blue-400 hover:text-blue-300 transition-colors cursor-pointer"
                >
                  View
                  <div className="w-3 h-3 flex items-center justify-center"><i className="ri-arrow-right-line"></i></div>
                </Link>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}

function ComplianceDocs({ docs, loading, error, onRetry, canManage }: { docs: GuardDoc[]; loading: boolean; error: string | null; onRetry: () => void; canManage: boolean }) {
  if (loading) return <LoadingBlock />;
  if (error) return <ErrorBlock message={error} onRetry={onRetry} />;

  return (
    <div className="space-y-3">
      {docs.length === 0 ? (
        <EmptyBlock icon="ri-file-list-line" label="No compliance documents recorded for this guard." />
      ) : (
        <div className="space-y-2">
          {docs.map((d) => {
            const st = docStatus(d);
            return (
              <div key={d.id} className="bg-gray-800/40 border border-gray-800 rounded-lg p-3">
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-white truncate">{d.document_title}</p>
                    <p className="text-xs text-gray-500 mt-0.5">{friendlyLabel(d.document_type)}</p>
                    <p className="text-xs text-gray-500 mt-0.5">
                      Expires {d.expiry_date ? formatUKDate(d.expiry_date) : '—'}
                    </p>
                  </div>
                  <span className={`flex-none text-xs px-2 py-0.5 rounded-full font-medium ${st.tone}`}>{st.label}</span>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {canManage && (
        <Link
          href="/dashboard/compliance/documents"
          className="inline-flex items-center gap-2 text-xs font-medium text-blue-400 hover:text-blue-300 transition-colors cursor-pointer"
        >
          <div className="w-4 h-4 flex items-center justify-center"><i className="ri-external-link-line"></i></div>
          Manage compliance documents
        </Link>
      )}
    </div>
  );
}