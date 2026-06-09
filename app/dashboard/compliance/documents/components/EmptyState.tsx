interface EmptyStateProps {
  onUpload: () => void;
}

export default function EmptyState({ onUpload }: EmptyStateProps) {
  return (
    <div className="bg-[#0f172a]/70 backdrop-blur-sm border border-white/10 rounded-xl p-12 text-center">
      <div className="w-16 h-16 rounded-full bg-blue-500/10 flex items-center justify-center mx-auto mb-4">
        <div className="w-8 h-8 flex items-center justify-center text-blue-400">
          <i className="ri-file-shield-line text-xl"></i>
        </div>
      </div>
      <h3 className="text-lg font-semibold text-white mb-2">No Compliance Documents</h3>
      <p className="text-sm text-gray-500 mb-6 max-w-md mx-auto">
        Start tracking your compliance documents by uploading SIA licences, right-to-work checks, insurance certificates, and more.
      </p>
      <button
        onClick={onUpload}
        className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-sm text-white transition-all cursor-pointer whitespace-nowrap"
      >
        <div className="w-4 h-4 flex items-center justify-center">
          <i className="ri-upload-cloud-line text-sm"></i>
        </div>
        Upload Your First Document
      </button>
    </div>
  );
}