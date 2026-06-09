'use client';

import { useState } from 'react';

interface ExportBarProps {
  onExportPDF: () => void;
  onExportCSV: () => void;
  onEmailReport: () => void;
}

export default function ExportBar({ onExportPDF, onExportCSV, onEmailReport }: ExportBarProps) {
  const [showEmail, setShowEmail] = useState(false);
  const [email, setEmail] = useState('');
  const [emailSent, setEmailSent] = useState(false);

  const handleEmail = () => {
    if (!email.trim()) return;
    onEmailReport();
    setEmailSent(true);
    setTimeout(() => {
      setEmailSent(false);
      setShowEmail(false);
      setEmail('');
    }, 2000);
  };

  return (
    <div className="flex items-center gap-2 flex-wrap">
      <button
        onClick={onExportPDF}
        className="flex items-center gap-2 px-3 py-2 bg-gray-800/60 border border-gray-700 rounded-lg text-sm text-gray-300 hover:text-white hover:bg-gray-700/60 transition-colors cursor-pointer whitespace-nowrap"
      >
        <div className="w-4 h-4 flex items-center justify-center">
          <i className="ri-file-pdf-line text-sm"></i>
        </div>
        PDF
      </button>
      <button
        onClick={onExportCSV}
        className="flex items-center gap-2 px-3 py-2 bg-gray-800/60 border border-gray-700 rounded-lg text-sm text-gray-300 hover:text-white hover:bg-gray-700/60 transition-colors cursor-pointer whitespace-nowrap"
      >
        <div className="w-4 h-4 flex items-center justify-center">
          <i className="ri-file-text-line text-sm"></i>
        </div>
        CSV
      </button>
      <div className="relative">
        <button
          onClick={() => setShowEmail(!showEmail)}
          className="flex items-center gap-2 px-3 py-2 bg-gray-800/60 border border-gray-700 rounded-lg text-sm text-gray-300 hover:text-white hover:bg-gray-700/60 transition-colors cursor-pointer whitespace-nowrap"
        >
          <div className="w-4 h-4 flex items-center justify-center">
            <i className="ri-mail-send-line text-sm"></i>
          </div>
          Email
        </button>
        {showEmail && (
          <div className="absolute right-0 mt-2 w-72 bg-[#0f172a] rounded-lg shadow-lg border border-white/10 z-50 p-3">
            <p className="text-xs text-gray-400 mb-2">Email report to client</p>
            <div className="flex items-center gap-2">
              <input
                type="email"
                placeholder="client@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="flex-1 bg-gray-800/60 border border-gray-700 rounded-lg px-3 py-1.5 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-blue-500"
              />
              <button
                onClick={handleEmail}
                className="px-3 py-1.5 bg-blue-600 hover:bg-blue-500 rounded-lg text-sm text-white transition-colors cursor-pointer whitespace-nowrap"
              >
                {emailSent ? 'Sent!' : 'Send'}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}