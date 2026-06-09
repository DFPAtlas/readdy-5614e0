'use client';

import { useState } from 'react';
import GlassCard from '@/app/components/GlassCard';

interface Props {
  fileName: string;
  onReview: (status: 'reviewed' | 'flagged' | 'archived', notes: string, rejectionReason?: string) => void;
  onClose: () => void;
}

export default function ReviewModal({ fileName, onReview, onClose }: Props) {
  const [status, setStatus] = useState<'reviewed' | 'flagged' | 'archived'>('reviewed');
  const [notes, setNotes] = useState('');
  const [rejectionReason, setRejectionReason] = useState('');
  const [saving, setSaving] = useState(false);

  const handleSubmit = async () => {
    setSaving(true);
    await onReview(status, notes, rejectionReason);
    setSaving(false);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
      <GlassCard className="w-full max-w-md">
        <div className="p-6 space-y-5">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-white">Review Evidence</h2>
            <button onClick={onClose} className="w-8 h-8 flex items-center justify-center text-gray-400 hover:text-white cursor-pointer">
              <i className="ri-close-line text-lg"></i>
            </button>
          </div>

          <p className="text-sm text-gray-400">{fileName}</p>

          <div>
            <label className="block text-sm text-gray-400 mb-1.5">Review Status</label>
            <div className="flex gap-2">
              {[
                { key: 'reviewed' as const, label: 'Reviewed', color: 'bg-emerald-600' },
                { key: 'flagged' as const, label: 'Flagged', color: 'bg-red-600' },
                { key: 'archived' as const, label: 'Archived', color: 'bg-blue-600' },
              ].map((s) => (
                <button
                  key={s.key}
                  onClick={() => setStatus(s.key)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors whitespace-nowrap ${
                    status === s.key ? `${s.color} text-white` : 'bg-gray-800/60 text-gray-400 hover:text-white'
                  }`}
                >
                  {s.label}
                </button>
              ))}
            </div>
          </div>

          {status === 'flagged' && (
            <div>
              <label className="block text-sm text-gray-400 mb-1.5">Rejection Reason</label>
              <textarea
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                placeholder="Why is this being flagged?"
                maxLength={500}
                className="w-full bg-gray-800/60 border border-gray-700 rounded-lg px-3 py-2 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 resize-none h-20"
              />
            </div>
          )}

          <div>
            <label className="block text-sm text-gray-400 mb-1.5">Notes</label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Add review notes..."
              maxLength={500}
              className="w-full bg-gray-800/60 border border-gray-700 rounded-lg px-3 py-2 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 resize-none h-20"
            />
          </div>

          <div className="flex gap-2">
            <button
              onClick={handleSubmit}
              disabled={saving}
              className="flex-1 bg-blue-600 hover:bg-blue-500 disabled:bg-gray-700 text-white rounded-lg px-4 py-2.5 text-sm font-medium transition-colors cursor-pointer whitespace-nowrap"
            >
              {saving ? (
                <span className="flex items-center justify-center gap-2">
                  <i className="ri-loader-4-line animate-spin"></i> Saving...
                </span>
              ) : (
                'Save Review'
              )}
            </button>
            <button
              onClick={onClose}
              className="bg-gray-800/60 hover:bg-gray-700/60 text-gray-300 rounded-lg px-4 py-2.5 text-sm font-medium transition-colors cursor-pointer whitespace-nowrap"
            >
              Cancel
            </button>
          </div>
        </div>
      </GlassCard>
    </div>
  );
}