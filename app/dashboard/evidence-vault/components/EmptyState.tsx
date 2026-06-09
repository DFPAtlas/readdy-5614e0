import GlassCard from '@/app/components/GlassCard';

interface Props {
  onUpload: () => void;
}

export default function EmptyState({ onUpload }: Props) {
  return (
    <GlassCard className="p-12 text-center">
      <div className="w-16 h-16 flex items-center justify-center mx-auto mb-4 bg-white/5 rounded-2xl">
        <i className="ri-folder-5-line text-gray-400 text-3xl"></i>
      </div>
      <h3 className="text-lg font-semibold text-white mb-2">No evidence files yet</h3>
      <p className="text-sm text-gray-400 max-w-md mx-auto mb-6">
        Upload images, videos, PDFs, or audio notes from patrols, incidents, or site reports.
      </p>
      <button
        onClick={onUpload}
        className="bg-blue-600 hover:bg-blue-500 text-white rounded-lg px-6 py-2.5 text-sm font-medium transition-colors cursor-pointer whitespace-nowrap"
      >
        <span className="flex items-center justify-center gap-2">
          <i className="ri-upload-cloud-line"></i>
          Upload First File
        </span>
      </button>
    </GlassCard>
  );
}