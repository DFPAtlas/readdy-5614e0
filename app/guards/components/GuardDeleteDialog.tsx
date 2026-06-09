import type { Guard } from '@/lib/useGuards';
import { getFullName } from '@/lib/useGuards';

interface Props {
  guard: Guard | null;
  onSetInactive: () => Promise<void>;
  onDelete: () => Promise<void>;
  onCancel: () => void;
  processing: boolean;
}

export default function GuardDeleteDialog({ guard, onSetInactive, onDelete, onCancel, processing }: Props) {
  if (!guard) return null;

  return (
    <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
      <div className="bg-[#111827] border border-gray-800 rounded-xl w-full max-w-sm p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-full bg-amber-500/10 flex items-center justify-center flex-shrink-0">
            <div className="w-5 h-5 flex items-center justify-center"><i className="ri-alert-line text-amber-400"></i></div>
          </div>
          <h2 className="text-lg font-semibold text-white">Remove guard?</h2>
        </div>
        <p className="text-sm text-gray-400 mb-6">
          You are about to remove <span className="text-gray-300 font-medium">{getFullName(guard)}</span>. This will delete all their records. Consider setting them to Inactive instead to keep history.
        </p>
        <div className="flex flex-col gap-3">
          <button
            onClick={onSetInactive}
            disabled={processing}
            className="w-full bg-amber-600/20 hover:bg-amber-600/30 text-amber-400 border border-amber-500/20 text-sm font-medium px-4 py-2.5 rounded-lg transition-colors disabled:opacity-50 cursor-pointer whitespace-nowrap inline-flex items-center justify-center gap-2"
          >
            {processing && <div className="w-4 h-4 border-2 border-amber-400/30 border-t-amber-400 rounded-full animate-spin"></div>}
            Set to Inactive (recommended)
          </button>
          <button
            onClick={onDelete}
            disabled={processing}
            className="w-full bg-red-600 hover:bg-red-500 text-white text-sm font-medium px-4 py-2.5 rounded-lg transition-colors disabled:opacity-50 cursor-pointer whitespace-nowrap inline-flex items-center justify-center gap-2"
          >
            {processing && <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>}
            Delete permanently
          </button>
          <button
            onClick={onCancel}
            className="w-full px-4 py-2 text-sm text-gray-400 hover:text-white transition-colors cursor-pointer whitespace-nowrap"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}