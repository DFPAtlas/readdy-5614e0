'use client';

import { useState } from 'react';
import { useGuardAcknowledgements } from '@/lib/useGuardAcknowledgements';
import type { FirstRunPolicy } from '@/lib/useGuardAcknowledgements';

function policyIcon(title: string): string {
  const t = title.toLowerCase();
  if (t.includes('emergency')) return 'ri-alarm-warning-line';
  if (t.includes('location')) return 'ri-map-pin-2-line';
  if (t.includes('acceptable') || t.includes('use')) return 'ri-shield-check-line';
  return 'ri-file-text-line';
}

function PolicyCard({
  policy,
  checked,
  onToggle,
}: {
  policy: FirstRunPolicy;
  checked: boolean;
  onToggle: () => void;
}) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-[#3b82f6]/10 flex items-center justify-center flex-shrink-0">
          <div className="w-5 h-5 flex items-center justify-center text-[#3b82f6]">
            <i className={policyIcon(policy.title)}></i>
          </div>
        </div>
        <div className="min-w-0">
          <h3 className="text-sm font-semibold text-white">{policy.title}</h3>
          {policy.description && (
            <p className="text-xs text-gray-400 mt-0.5">{policy.description}</p>
          )}
        </div>
      </div>

      {policy.content_text && (
        <div className="mt-3 max-h-44 overflow-y-auto rounded-xl bg-black/30 border border-white/5 p-3">
          <p className="text-[13px] leading-relaxed text-gray-300 whitespace-pre-wrap">
            {policy.content_text}
          </p>
        </div>
      )}

      <button
        onClick={onToggle}
        className={`mt-3 w-full flex items-center gap-3 rounded-xl border px-3 py-2.5 text-left transition-colors cursor-pointer ${
          checked
            ? 'border-[#3b82f6]/40 bg-[#3b82f6]/10'
            : 'border-white/10 bg-white/[0.02] hover:bg-white/[0.05]'
        }`}
      >
        <div
          className={`w-5 h-5 rounded-md flex items-center justify-center flex-shrink-0 border ${
            checked ? 'bg-[#3b82f6] border-[#3b82f6]' : 'border-gray-600'
          }`}
        >
          {checked && (
            <div className="w-3 h-3 flex items-center justify-center text-white">
              <i className="ri-check-line text-sm"></i>
            </div>
          )}
        </div>
        <span className="text-[13px] font-medium text-gray-200">
          I have read and understood this
        </span>
      </button>
    </div>
  );
}

export default function GuardFirstRunAcknowledgements() {
  const { pending, loading, acknowledgeAll, error } = useGuardAcknowledgements();
  const [checked, setChecked] = useState<Record<string, boolean>>({});
  const [dismissed, setDismissed] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);

  if (loading || dismissed || pending.length === 0) return null;

  const allChecked = pending.every((p) => checked[p.policy_id]);
  const checkedCount = pending.filter((p) => checked[p.policy_id]).length;

  const toggle = (id: string) => {
    setChecked((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const handleConfirm = async () => {
    if (!allChecked || submitting) return;
    setSubmitting(true);
    setLocalError(null);
    const ok = await acknowledgeAll();
    setSubmitting(false);
    if (!ok) {
      setLocalError(error || 'Could not save your acknowledgements. Please try again.');
    }
  };

  return (
    <div className="fixed inset-0 z-[100] bg-[#0a0a0a] flex flex-col">
      <div className="flex-1 overflow-y-auto">
        <div className="max-w-lg mx-auto px-5 pt-10 pb-6">
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-xl bg-[#3b82f6]/15 flex items-center justify-center">
              <div className="w-5 h-5 flex items-center justify-center text-[#3b82f6]">
                <i className="ri-shield-star-line"></i>
              </div>
            </div>
            <span className="text-xs font-semibold tracking-wide text-gray-400 uppercase">
              GuardianHub
            </span>
          </div>

          <h1 className="text-2xl font-bold text-white mt-6">Welcome to GuardianHub</h1>
          <p className="text-sm text-gray-400 mt-2 leading-relaxed">
            Before you start, please review and acknowledge the following. They help keep you,
            your colleagues and the people you protect safe.
          </p>

          <div className="mt-5 text-xs font-medium text-gray-500">
            {checkedCount} of {pending.length} acknowledged
          </div>

          <div className="mt-3 space-y-4">
            {pending.map((p) => (
              <PolicyCard
                key={p.policy_id}
                policy={p}
                checked={!!checked[p.policy_id]}
                onToggle={() => toggle(p.policy_id)}
              />
            ))}
          </div>

          {localError && (
            <div className="mt-4 rounded-xl border border-red-500/30 bg-red-500/10 p-3 text-sm text-red-300">
              {localError}
            </div>
          )}
        </div>
      </div>

      <div className="border-t border-white/10 bg-[#0a0a0a] p-4">
        <div className="max-w-lg mx-auto space-y-2">
          <button
            onClick={handleConfirm}
            disabled={!allChecked || submitting}
            className={`w-full flex items-center justify-center gap-2 rounded-xl px-4 py-3.5 text-sm font-semibold transition-colors whitespace-nowrap ${
              allChecked && !submitting
                ? 'bg-[#3b82f6] hover:bg-[#2f6fe0] text-white cursor-pointer'
                : 'bg-white/5 text-gray-500 cursor-not-allowed'
            }`}
          >
            {submitting ? (
              <>
                <i className="ri-loader-4-line animate-spin"></i>
                Saving...
              </>
            ) : (
              'I acknowledge all of the above'
            )}
          </button>
          <button
            onClick={() => setDismissed(true)}
            disabled={submitting}
            className="w-full text-center text-xs text-gray-500 hover:text-gray-300 py-1 transition-colors cursor-pointer whitespace-nowrap"
          >
            Not now — I&apos;ll review later
          </button>
        </div>
      </div>
    </div>
  );
}