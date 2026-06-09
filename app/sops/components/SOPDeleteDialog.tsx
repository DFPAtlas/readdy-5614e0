import type { SOPLibraryDocument } from '@/lib/useSOPLibrary';

interface Props {
  doc: SOPLibraryDocument | null;
  onConfirm: () => Promise<void>;
  onCancel: () => void;
  deleting: boolean;
}

export default function SOPDeleteDialog({ doc, onConfirm, onCancel, deleting }: Props) {
  if (!doc) return null;
  return (
    <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
      <div className="bg-[#111827] border border-gray-800 rounded-xl w-full max-w-sm p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-full bg-red-500/10 flex items-center justify-center flex-shrink-0">
            <div className="w-5 h-5 flex items-center justify-center"><i className="ri-alert-line text-red-400"></i></div>
          </div>
          <h2 className="text-lg font-semibold text-white">Delete document?</h2>
        </div>
        <p className="text-sm text-gray-400 mb-6">
          You are about to delete <span className="text-gray-300 font-medium">{doc.title}</span>. This will also remove the file from storage and all AI index chunks. This action cannot be undone.
        </p>
        <div className="flex justify-end gap-3">
          <button onClick={onCancel} className="px-4 py-2 text-sm text-gray-400 hover:text-white transition-colors cursor-pointer whitespace-nowrap">
            Cancel
          </button>
          <button
            onClick={onConfirm}
            disabled={deleting}
            className="bg-red-600 hover:bg-red-500 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors disabled:opacity-50 cursor-pointer whitespace-nowrap inline-flex items-center gap-2"
          >
            {deleting && <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>}
            {deleting ? 'Deleting...' : 'Delete'}
          </button>
        </div>
      </div>
    </div>
  );
}