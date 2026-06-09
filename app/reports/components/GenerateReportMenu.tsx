'use client';

import Link from 'next/link';

interface GenerateMenuProps {
  onClose: () => void;
}

export default function GenerateReportMenu({ onClose }: GenerateMenuProps) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4" onClick={onClose}>
      <div className="bg-[#151b27] border border-gray-800 rounded-xl w-full max-w-sm shadow-2xl p-6" onClick={(e) => e.stopPropagation()}>
        <h2 className="text-lg font-semibold text-white mb-4">Generate Report</h2>
        <div className="space-y-2">
          <button className="w-full text-left px-4 py-3 rounded-lg bg-gray-800/50 hover:bg-gray-700/50 transition-colors flex items-center gap-3 cursor-pointer">
            <div className="w-9 h-9 rounded-lg bg-blue-500/10 flex items-center justify-center">
              <div className="w-5 h-5 flex items-center justify-center text-blue-400"><i className="ri-file-pdf-line"></i></div>
            </div>
            <div>
              <p className="text-sm font-medium text-white">Incident Report</p>
              <p className="text-xs text-gray-500">From any open or closed incident</p>
            </div>
          </button>
          <Link href="/reports/weekly" onClick={onClose} className="block w-full text-left px-4 py-3 rounded-lg bg-gray-800/50 hover:bg-gray-700/50 transition-colors flex items-center gap-3 cursor-pointer">
            <div className="w-9 h-9 rounded-lg bg-amber-500/10 flex items-center justify-center">
              <div className="w-5 h-5 flex items-center justify-center text-amber-400"><i className="ri-building-line"></i></div>
            </div>
            <div>
              <p className="text-sm font-medium text-white">Weekly Site Report</p>
              <p className="text-xs text-gray-500">View drafts and generate new weekly reports</p>
            </div>
          </Link>
          <button disabled className="w-full text-left px-4 py-3 rounded-lg bg-gray-800/30 text-gray-500 flex items-center gap-3 cursor-not-allowed">
            <div className="w-9 h-9 rounded-lg bg-emerald-500/10 flex items-center justify-center">
              <div className="w-5 h-5 flex items-center justify-center text-emerald-500/50"><i className="ri-bar-chart-line"></i></div>
            </div>
            <div>
              <p className="text-sm font-medium">Monthly Company</p>
              <p className="text-xs">Coming soon</p>
            </div>
          </button>
          <button disabled className="w-full text-left px-4 py-3 rounded-lg bg-gray-800/30 text-gray-500 flex items-center gap-3 cursor-not-allowed">
            <div className="w-9 h-9 rounded-lg bg-purple-500/10 flex items-center justify-center">
              <div className="w-5 h-5 flex items-center justify-center text-purple-500/50"><i className="ri-file-edit-line"></i></div>
            </div>
            <div>
              <p className="text-sm font-medium">Custom Report</p>
              <p className="text-xs">Coming soon</p>
            </div>
          </button>
        </div>
        <div className="flex justify-end mt-5">
          <button onClick={onClose} className="px-4 py-2 rounded-lg text-sm font-medium text-gray-400 hover:text-white transition-colors cursor-pointer whitespace-nowrap">
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}