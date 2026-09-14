import type { Guard } from '@/lib/useGuards';
import { getFullName } from '@/lib/useGuards';

interface Props {
  guard: Guard | null;
  onConfirm: () => Promise<void>;
  onCancel: () => void;
  processing: boolean;
}

export default function GuardDeleteDialog({ guard, onConfirm, onCancel, processing }: Props) {
  if (!guard) return null;

  return (
    <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
      <div
        role="dialog"
        aria-modal="true"
        aria-label={`Deactivate ${getFullName(guard)}`}
        className="bg-[#111827] border border-gray-800 rounded-xl w-full max-w-sm p-6"
      >
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-full bg-amber-500/10 flex items-center justify-center flex-shrink-0">
            <div className="w-5 h-5 flex items-center justify-center"><i className="ri-alert-line text-amber-400"></i></div>
          </div>
          <h2 className="text-lg font-semibold text-white">Deactivate guard?</h2>
        </div>
        <p className="text-sm text-gray-400 mb-2">
          You are about to deactivate <span className="text-gray-300 font-medium">{getFullName(guard)}</span>.
        </p>
        <p className="text-sm text-gray-500 mb-6">
          This sets their status to Inactive. Their shifts, incidents, compliance and audit history are preserved and remain available for review. No records are deleted.
        </p>
        <div className="flex flex-col gap-3">
          <button
            onClick={onConfirm}
            disabled={processing}
            className="w-full bg-amber-600/20 hover:bg-amber-600/30 text-amber-400 border border-amber-500/20 text-sm font-medium px-4 py-2.5 rounded-lg transition-colors disabled:opacity-50 cursor-pointer whitespace-nowrap inline-flex items-center justify-center gap-2"
          >
            {processing && <div className="w-4 h-4 border-2 border-amber-400/30 border-t-amber-400 rounded-full animate-spin"></div>}
            Deactivate guard
          </button>
          <button
            onClick={onCancel}
            disabled={processing}
            className="w-full px-4 py-2 text-sm text-gray-400 hover:text-white transition-colors disabled:opacity-50 cursor-pointer whitespace-nowrap"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}