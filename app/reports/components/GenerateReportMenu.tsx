'use client';

import { useEffect } from 'react';
import Link from 'next/link';

interface GenerateMenuProps {
  onClose: () => void;
}

export default function GenerateReportMenu({ onClose }: GenerateMenuProps) {
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4"
      onClick={onClose}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Generate Report"
        className="bg-[#151b27] border border-gray-800 rounded-xl w-full max-w-sm shadow-2xl p-6"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-white">Generate Report</h2>
          <button
            onClick={onClose}
            aria-label="Close generate report menu"
            className="w-8 h-8 flex items-center justify-center rounded-lg text-gray-500 hover:text-white hover:bg-gray-800 transition-colors cursor-pointer"
          >
            <i className="ri-close-line"></i>
          </button>
        </div>

        <div className="space-y-2">
          <Link
            href="/incidents"
            onClick={onClose}
            className="block w-full text-left px-4 py-3 rounded-lg bg-gray-800/50 hover:bg-gray-700/50 transition-colors cursor-pointer"
          >
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-blue-500/10 flex items-center justify-center flex-shrink-0">
                <div className="w-5 h-5 flex items-center justify-center text-blue-400"><i className="ri-file-pdf-line"></i></div>
              </div>
              <div>
                <p className="text-sm font-medium text-white">Incident Report</p>
                <p className="text-xs text-gray-500">Select an incident, then choose &ldquo;Generate Report PDF&rdquo;</p>
              </div>
            </div>
          </Link>

          <Link
            href="/reports/weekly"
            onClick={onClose}
            className="block w-full text-left px-4 py-3 rounded-lg bg-gray-800/50 hover:bg-gray-700/50 transition-colors cursor-pointer"
          >
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-amber-500/10 flex items-center justify-center flex-shrink-0">
                <div className="w-5 h-5 flex items-center justify-center text-amber-400"><i className="ri-calendar-check-line"></i></div>
              </div>
              <div>
                <p className="text-sm font-medium text-white">Weekly Site Report</p>
                <p className="text-xs text-gray-500">View drafts and generate new weekly reports</p>
              </div>
            </div>
          </Link>

          <Link
            href="/reports/compliance"
            onClick={onClose}
            className="block w-full text-left px-4 py-3 rounded-lg bg-gray-800/50 hover:bg-gray-700/50 transition-colors cursor-pointer"
          >
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-emerald-500/10 flex items-center justify-center flex-shrink-0">
                <div className="w-5 h-5 flex items-center justify-center text-emerald-400"><i className="ri-shield-check-line"></i></div>
              </div>
              <div>
                <p className="text-sm font-medium text-white">Compliance Report</p>
                <p className="text-xs text-gray-500">Document expiry, SIA status, vetting and training gaps</p>
              </div>
            </div>
          </Link>

          <Link
            href="/reports/patrol-summary"
            onClick={onClose}
            className="block w-full text-left px-4 py-3 rounded-lg bg-gray-800/50 hover:bg-gray-700/50 transition-colors cursor-pointer"
          >
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-cyan-500/10 flex items-center justify-center flex-shrink-0">
                <div className="w-5 h-5 flex items-center justify-center text-cyan-400"><i className="ri-radar-line"></i></div>
              </div>
              <div>
                <p className="text-sm font-medium text-white">Patrol Performance Summary</p>
                <p className="text-xs text-gray-500">Guard patrol completion and GPS accuracy per site</p>
              </div>
            </div>
          </Link>
        </div>

        <div className="flex justify-end mt-5">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg text-sm font-medium text-gray-400 hover:text-white transition-colors cursor-pointer whitespace-nowrap"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}