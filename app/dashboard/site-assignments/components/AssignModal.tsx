'use client';

import { useState } from 'react';
import { useSiteAssignments } from '@/lib/useSiteAssignments';

interface AssignModalProps {
  guardId: string;
  guardName: string;
  siteId: string;
  siteName: string;
  onClose: () => void;
  onRefresh: () => void;
}

export default function AssignModal({ guardId, guardName, siteId, siteName, onClose, onRefresh }: AssignModalProps) {
  const { addAssignment } = useSiteAssignments();
  const [saving, setSaving] = useState(false);
  const [induction, setInduction] = useState(false);
  const [notes, setNotes] = useState('');

  const handleAssign = async () => {
    setSaving(true);
    await addAssignment(guardId, siteId, {
      status: 'assigned',
      induction_status: induction ? 'complete' : 'not_started',
      induction_date: induction ? new Date().toISOString().split('T')[0] : null,
      notes,
    });
    setSaving(false);
    onRefresh();
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/60" onClick={onClose} />
      <div className="relative w-full max-w-md bg-[#0f172a] rounded-2xl border border-white/10 p-6 mx-4">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-white">Assign Guard to Site</h3>
          <button onClick={onClose} className="w-8 h-8 flex items-center justify-center text-gray-400 hover:text-white cursor-pointer">
            <i className="ri-close-line"></i>
          </button>
        </div>

        <div className="space-y-4 mb-6">
          <div className="bg-white/5 rounded-xl p-4 border border-white/10">
            <div className="text-xs text-gray-500 mb-1">Guard</div>
            <div className="text-sm text-white font-medium">{guardName}</div>
          </div>
          <div className="bg-white/5 rounded-xl p-4 border border-white/10">
            <div className="text-xs text-gray-500 mb-1">Site</div>
            <div className="text-sm text-white font-medium">{siteName}</div>
          </div>
        </div>

        <div className="mb-4">
          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={induction}
              onChange={(e) => setInduction(e.target.checked)}
              className="w-4 h-4 rounded border-gray-600 bg-white/5 text-blue-500 focus:ring-blue-500"
            />
            <span className="text-sm text-gray-300">Induction already complete</span>
          </label>
        </div>

        <div className="mb-6">
          <div className="text-xs text-gray-500 mb-2 font-medium uppercase tracking-wide">Notes</div>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Optional notes..."
            className="w-full bg-white/5 border border-white/10 rounded-lg p-3 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-blue-500 min-h-[80px] resize-none"
          />
        </div>

        <div className="flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 py-2.5 text-sm text-gray-400 hover:text-white transition-colors cursor-pointer"
          >
            Cancel
          </button>
          <button
            onClick={handleAssign}
            disabled={saving}
            className="flex-1 py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-sm font-medium transition-colors disabled:opacity-50 cursor-pointer"
          >
            {saving ? 'Assigning...' : 'Assign Guard'}
          </button>
        </div>
      </div>
    </div>
  );
}