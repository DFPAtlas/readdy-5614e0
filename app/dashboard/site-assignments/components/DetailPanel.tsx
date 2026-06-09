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

export default function DetailPanel({ guard, site, cell, onClose, onRefresh }: DetailPanelProps) {
  const { updateAssignment, removeAssignment, addAssignment } = useSiteAssignments();
  const { guards } = useGuards();
  const [note, setNote] = useState(cell.notes || '');
  const [saving, setSaving] = useState(false);

  const guardRecord = guards.find((g) => g.id === guard.guard_id);
  const siaDays = guard.sia_expiry
    ? Math.ceil((new Date(guard.sia_expiry).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))
    : null;

  const statusColors: Record<string, string> = {
    assigned: 'bg-emerald-500 text-white',
    approved: 'bg-blue-500 text-white',
    not_trained: 'bg-orange-500 text-white',
    blocked: 'bg-red-500 text-white',
    expired_docs: 'bg-rose-500 text-white',
    available: 'bg-gray-500 text-white',
  };

  const statusLabels: Record<string, string> = {
    assigned: 'Assigned',
    approved: 'Approved',
    not_trained: 'Not Trained',
    blocked: 'Blocked',
    expired_docs: 'Expired Docs',
    available: 'Available',
  };

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
      <div className="relative w-full max-w-md h-full bg-[#0f172a] border-l border-white/10 overflow-y-auto">
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

          <div className="flex items-center gap-3 mb-6">
            <div className="w-12 h-12 rounded-full bg-blue-600/20 flex items-center justify-center text-blue-400 font-semibold">
              {guard.guard_initials}
            </div>
            <div>
              <div className="font-medium text-white">{guard.guard_name}</div>
              <div className="text-sm text-gray-500">{site.site_name}</div>
            </div>
          </div>

          <div className="mb-6">
            <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium ${statusColors[cell.status] || 'bg-gray-500 text-white'}`}>
              <div className="w-3 h-3 flex items-center justify-center">
                <i className={`${
                  cell.status === 'assigned' ? 'ri-check-line' :
                  cell.status === 'blocked' ? 'ri-forbid-line' :
                  cell.status === 'not_trained' ? 'ri-alert-line' :
                  cell.status === 'expired_docs' ? 'ri-file-warning-line' :
                  cell.status === 'approved' ? 'ri-shield-check-line' :
                  'ri-question-line'
                } text-xs`}></i>
              </div>
              {statusLabels[cell.status] || 'Unknown'}
            </span>
          </div>

          <div className="space-y-4 mb-6">
            <div className="bg-white/5 rounded-xl p-4 border border-white/10">
              <div className="text-xs text-gray-500 mb-2 font-medium uppercase tracking-wide">SIA Licence</div>
              <div className="flex items-center gap-2">
                <div className={`w-2 h-2 rounded-full ${
                  guard.sia_status === 'valid' ? 'bg-emerald-400' :
                  guard.sia_status === 'expiring' ? 'bg-orange-400' : 'bg-red-400'
                }`} />
                <span className="text-sm text-white">
                  {guard.sia_status === 'valid' ? 'Valid' : guard.sia_status === 'expiring' ? 'Expiring' : 'Expired'}
                </span>
                {siaDays !== null && (
                  <span className="text-xs text-gray-500 ml-auto">
                    {siaDays < 0 ? `${Math.abs(siaDays)} days expired` : `${siaDays} days left`}
                  </span>
                )}
              </div>
              {guard.sia_expiry && (
                <div className="text-xs text-gray-500 mt-1">Expires: {new Date(guard.sia_expiry).toLocaleDateString()}</div>
              )}
            </div>

            <div className="bg-white/5 rounded-xl p-4 border border-white/10">
              <div className="text-xs text-gray-500 mb-2 font-medium uppercase tracking-wide">Site Induction</div>
              <div className="text-sm text-white">{cell.induction_status === 'complete' ? 'Complete' : 'Not Started'}</div>
            </div>

            <div className="bg-white/5 rounded-xl p-4 border border-white/10">
              <div className="text-xs text-gray-500 mb-2 font-medium uppercase tracking-wide">Last Worked</div>
              <div className="text-sm text-white">
                {cell.last_worked_at
                  ? new Date(cell.last_worked_at).toLocaleDateString()
                  : 'Never'}
              </div>
              {cell.shift_count && cell.shift_count > 0 && (
                <div className="text-xs text-gray-500 mt-1">{cell.shift_count} shifts in last 30 days</div>
              )}
            </div>

            <div className="bg-white/5 rounded-xl p-4 border border-white/10">
              <div className="text-xs text-gray-500 mb-2 font-medium uppercase tracking-wide">Skills</div>
              <div className="flex flex-wrap gap-1.5">
                {(guard.skills || []).map((skill) => (
                  <span key={skill} className="text-xs bg-white/10 text-gray-300 px-2 py-0.5 rounded-full">
                    {skill}
                  </span>
                ))}
                {(!guard.skills || guard.skills.length === 0) && (
                  <span className="text-xs text-gray-500">No skills listed</span>
                )}
              </div>
            </div>

            <div className="bg-white/5 rounded-xl p-4 border border-white/10">
              <div className="text-xs text-gray-500 mb-2 font-medium uppercase tracking-wide">Site Requirements</div>
              <div className="flex flex-wrap gap-1.5">
                {(site.required_skills || []).map((skill) => (
                  <span
                    key={skill}
                    className={`text-xs px-2 py-0.5 rounded-full ${
                      (guard.skills || []).includes(skill)
                        ? 'bg-emerald-500/10 text-emerald-400'
                        : 'bg-red-500/10 text-red-400'
                    }`}
                  >
                    {skill}
                  </span>
                ))}
                {(!site.required_skills || site.required_skills.length === 0) && (
                  <span className="text-xs text-gray-500">No required skills</span>
                )}
              </div>
            </div>

            {cell.block_reason && (
              <div className="bg-red-500/5 rounded-xl p-4 border border-red-500/20">
                <div className="text-xs text-red-400 mb-1 font-medium uppercase tracking-wide">Block Reason</div>
                <div className="text-sm text-red-300">{cell.block_reason}</div>
              </div>
            )}
          </div>

          <div className="mb-6">
            <div className="text-xs text-gray-500 mb-2 font-medium uppercase tracking-wide">Notes</div>
            <textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="Add notes about this assignment..."
              className="w-full bg-white/5 border border-white/10 rounded-lg p-3 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-blue-500 min-h-[80px] resize-none"
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
                className="flex items-center justify-center gap-2 bg-white/5 hover:bg-white/10 border border-white/10 text-gray-400 rounded-lg px-3 py-2.5 text-sm transition-colors disabled:opacity-50 cursor-pointer"
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