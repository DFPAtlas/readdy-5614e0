'use client';

import { useState } from 'react';
import { useSiteAssignments } from '@/lib/useSiteAssignments';
import { useGuards } from '@/lib/useGuards';

interface DetailPanelProps {
  guard: {
    guard_id: string;
    guard_name: string;
    guard_initials: string;
    sia_status: string;
    sia_expiry: string | null;
    skills: string[] | null;
    guard_status: string | null;
  };
  site: {
    id: string;
    site_name: string;
    client_name: string | null;
    required_skills: string[] | null;
  };
  cell: {
    status: string;
    induction_status?: string;
    last_worked_at?: string | null;
    is_blocked?: boolean;
    block_reason?: string | null;
    notes?: string | null;
    shift_count?: number;
    assignment_id?: string | null;
  };
  onClose: () => void;
  onRefresh: () => void;
}

const statusColors: Record<string, string> = {
  assigned: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30',
  approved: 'bg-blue-500/15 text-blue-400 border-blue-500/30',
  not_trained: 'bg-amber-500/15 text-amber-400 border-amber-500/30',
  blocked: 'bg-red-500/15 text-red-400 border-red-500/30',
  expired_docs: 'bg-rose-500/15 text-rose-400 border-rose-500/30',
  available: 'bg-sky-500/15 text-sky-400 border-sky-500/30',
};

const statusLabels: Record<string, string> = {
  assigned: 'Assigned',
  approved: 'Approved',
  not_trained: 'Not Trained',
  blocked: 'Blocked',
  expired_docs: 'Expired Docs',
  available: 'Available',
};

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="bg-[#1a1f2e] border border-gray-800 rounded-xl p-4">
      <div className="text-[11px] text-gray-500 mb-2.5 font-semibold uppercase tracking-wider">{title}</div>
      {children}
    </div>
  );
}

export default function DetailPanel({ guard, site, cell, onClose, onRefresh }: DetailPanelProps) {
  const { updateAssignment, removeAssignment, addAssignment } = useSiteAssignments();
  const { guards } = useGuards();
  const [note, setNote] = useState(cell.notes || '');
  const [saving, setSaving] = useState(false);

  const guardRecord = guards.find((g) => g.id === guard.guard_id);
  const siaDays = guard.sia_expiry
    ? Math.ceil((new Date(guard.sia_expiry).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))
    : null;

  const missingSkills = (site.required_skills || []).filter((skill) => !(guard.skills || []).includes(skill));

  const handleApprove = async () => {
    setSaving(true);
    if (cell.assignment_id) {
      await updateAssignment(cell.assignment_id, { status: 'approved', is_blocked: false, block_reason: null });
    } else {
      await addAssignment(guard.guard_id, site.id, { status: 'approved', induction_status: 'not_started' });
    }
    setSaving(false);
    onRefresh();
  };

  const handleBlock = async () => {
    setSaving(true);
    if (cell.assignment_id) {
      await updateAssignment(cell.assignment_id, { is_blocked: true, block_reason: note || 'Flagged as not suitable' });
    } else {
      await addAssignment(guard.guard_id, site.id, {
        status: 'blocked',
        is_blocked: true,
        block_reason: note || 'Flagged as not suitable',
      });
    }
    setSaving(false);
    onRefresh();
  };

  const handleRemove = async () => {
    if (!cell.assignment_id) return;
    setSaving(true);
    await removeAssignment(cell.assignment_id);
    setSaving(false);
    onRefresh();
  };

  const handleInductionComplete = async () => {
    setSaving(true);
    if (cell.assignment_id) {
      await updateAssignment(cell.assignment_id, { induction_status: 'complete', induction_date: new Date().toISOString().split('T')[0] });
    } else {
      await addAssignment(guard.guard_id, site.id, { status: 'assigned', induction_status: 'complete', induction_date: new Date().toISOString().split('T')[0] });
    }
    setSaving(false);
    onRefresh();
  };

  const handleSaveNote = async () => {
    if (!cell.assignment_id) return;
    setSaving(true);
    await updateAssignment(cell.assignment_id, { notes: note });
    setSaving(false);
    onRefresh();
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      <div className="absolute inset-0 bg-black/60" onClick={onClose} />
      <div className="relative w-full max-w-md h-full bg-[#0f172a] border-l border-gray-800 overflow-y-auto">
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold text-white">Guard-Site Detail</h2>
            <button
              onClick={onClose}
              className="w-8 h-8 flex items-center justify-center text-gray-400 hover:text-white cursor-pointer"
            >
              <i className="ri-close-line"></i>
            </button>
          </div>

          <div className="flex items-center gap-3 mb-5">
            <div className="w-12 h-12 rounded-full bg-blue-600/20 flex items-center justify-center text-blue-400 font-semibold">
              {guard.guard_initials}
            </div>
            <div className="min-w-0">
              <div className="font-medium text-white">{guard.guard_name}</div>
              <div className="text-sm text-gray-500">{site.site_name}</div>
            </div>
            <div className="ml-auto">
              <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border ${statusColors[cell.status] || statusColors.available}`}>
                {statusLabels[cell.status] || 'Unknown'}
              </span>
            </div>
          </div>

          <div className="space-y-3 mb-5">
            <Section title="Guard">
              <div className="text-sm text-white">{guard.guard_name}</div>
              <div className="text-xs text-gray-500 mt-1">{guardRecord?.phone || '—'} · {guardRecord?.email || '—'}</div>
              {guard.guard_status && (
                <div className="text-xs text-gray-400 mt-1 capitalize">Status: {guard.guard_status}</div>
              )}
            </Section>

            <Section title="Site">
              <div className="text-sm text-white">{site.site_name}</div>
              <div className="text-xs text-gray-500 mt-1">{site.client_name || 'No client'}</div>
            </Section>

            <Section title="Eligibility">
              <div className="flex items-center gap-2">
                <div className={`w-2 h-2 rounded-full ${
                  guard.sia_status === 'valid' ? 'bg-emerald-400' :
                  guard.sia_status === 'expiring' ? 'bg-amber-400' : 'bg-red-400'
                }`} />
                <span className="text-sm text-white">
                  {guard.sia_status === 'valid' ? 'SIA Valid' : guard.sia_status === 'expiring' ? 'SIA Expiring' : 'SIA Expired'}
                </span>
                {siaDays !== null && (
                  <span className="text-xs text-gray-500 ml-auto">
                    {siaDays < 0 ? `${Math.abs(siaDays)} days expired` : `${siaDays} days left`}
                  </span>
                )}
              </div>
              <div className="flex flex-wrap gap-1.5 mt-3">
                {(guard.skills || []).map((skill) => (
                  <span key={skill} className="text-xs bg-gray-800/60 text-gray-300 px-2 py-0.5 rounded-full">
                    {skill}
                  </span>
                ))}
                {(!guard.skills || guard.skills.length === 0) && (
                  <span className="text-xs text-gray-500">No skills listed</span>
                )}
              </div>
            </Section>

            {(cell.block_reason || missingSkills.length > 0) && (
              <Section title="Blockers">
                {cell.block_reason && (
                  <div className="text-sm text-red-300">{cell.block_reason}</div>
                )}
                {missingSkills.length > 0 && (
                  <div className="mt-2">
                    <div className="text-xs text-gray-500 mb-1">Missing required skills:</div>
                    <div className="flex flex-wrap gap-1.5">
                      {missingSkills.map((skill) => (
                        <span key={skill} className="text-xs bg-red-500/10 text-red-400 px-2 py-0.5 rounded-full">
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </Section>
            )}

            <Section title="Current Assignment">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <div className="text-[10px] text-gray-500 uppercase tracking-wider mb-0.5">Induction</div>
                  <div className="text-sm text-white">{cell.induction_status === 'complete' ? 'Complete' : 'Not Started'}</div>
                </div>
                <div>
                  <div className="text-[10px] text-gray-500 uppercase tracking-wider mb-0.5">Last Worked</div>
                  <div className="text-sm text-white">
                    {cell.last_worked_at ? new Date(cell.last_worked_at).toLocaleDateString() : 'Never'}
                  </div>
                </div>
              </div>
              {cell.shift_count != null && cell.shift_count > 0 && (
                <div className="text-xs text-gray-500 mt-2">{cell.shift_count} shifts in last 30 days</div>
              )}
            </Section>
          </div>

          <div className="mb-5">
            <div className="text-xs text-gray-500 mb-2 font-medium uppercase tracking-wide">Notes</div>
            <textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="Add notes about this assignment..."
              className="w-full bg-gray-800/60 border border-gray-700 rounded-lg p-3 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-blue-500 min-h-[80px] resize-none"
            />
            <button
              onClick={handleSaveNote}
              disabled={saving || !cell.assignment_id}
              className="mt-2 text-sm text-blue-400 hover:text-blue-300 transition-colors disabled:text-gray-600 cursor-pointer"
            >
              {saving ? 'Saving...' : 'Save Note'}
            </button>
          </div>

          <div className="grid grid-cols-2 gap-2">
            {cell.status !== 'blocked' && (
              <button
                onClick={handleBlock}
                disabled={saving}
                className="flex items-center justify-center gap-2 bg-red-500/10 hover:bg-red-500/20 border border-red-500/30 text-red-400 rounded-lg px-3 py-2.5 text-sm transition-colors disabled:opacity-50 cursor-pointer"
              >
                <div className="w-4 h-4 flex items-center justify-center">
                  <i className="ri-forbid-line text-sm"></i>
                </div>
                Flag Not Suitable
              </button>
            )}
            {cell.assignment_id && (
              <button
                onClick={handleRemove}
                disabled={saving}
                className="flex items-center justify-center gap-2 bg-gray-800/60 hover:bg-gray-800 border border-gray-700 text-gray-400 rounded-lg px-3 py-2.5 text-sm transition-colors disabled:opacity-50 cursor-pointer"
              >
                <div className="w-4 h-4 flex items-center justify-center">
                  <i className="ri-close-line text-sm"></i>
                </div>
                Remove
              </button>
            )}
            <button
              onClick={handleApprove}
              disabled={saving}
              className="flex items-center justify-center gap-2 bg-blue-500/10 hover:bg-blue-500/20 border border-blue-500/30 text-blue-400 rounded-lg px-3 py-2.5 text-sm transition-colors disabled:opacity-50 cursor-pointer"
            >
              <div className="w-4 h-4 flex items-center justify-center">
                <i className="ri-check-line text-sm"></i>
              </div>
              {cell.assignment_id ? 'Approve' : 'Assign & Approve'}
            </button>
            {cell.induction_status !== 'complete' && (
              <button
                onClick={handleInductionComplete}
                disabled={saving}
                className="flex items-center justify-center gap-2 bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 rounded-lg px-3 py-2.5 text-sm transition-colors disabled:opacity-50 cursor-pointer"
              >
                <div className="w-4 h-4 flex items-center justify-center">
                  <i className="ri-graduation-cap-line text-sm"></i>
                </div>
                Mark Induction Complete
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}