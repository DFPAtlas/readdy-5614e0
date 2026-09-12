'use client';
import { useState } from 'react';
import Link from 'next/link';

interface ACSEvidencePackPreviewProps {
  hasAccess: boolean;
  loading?: boolean;
  lastGeneratedAt?: string | null;
  packCount?: number;
  onGenerate?: () => Promise<any> | void;
}

export default function ACSEvidencePackPreview({ hasAccess, loading, lastGeneratedAt, packCount, onGenerate }: ACSEvidencePackPreviewProps) {
  const [generating, setGenerating] = useState(false);
  const [downloadUrl, setDownloadUrl] = useState<string | null>(null);

  const handleGenerate = async () => {
    if (!onGenerate) return;
    setGenerating(true);
    try {
      const result = await onGenerate();
      if (result?.url) {
        setDownloadUrl(result.url);
      }
    } finally {
      setGenerating(false);
    }
  };

  if (loading) {
    return (
      <div className="bg-[#0f172a]/70 backdrop-blur-sm border border-white/10 rounded-xl p-5 animate-pulse">
        <div className="h-4 w-36 bg-white/5 rounded mb-4"></div>
        <div className="h-24 bg-white/5 rounded-lg"></div>
      </div>
    );
  }

  if (!hasAccess) {
    return (
      <div className="bg-[#0f172a]/70 backdrop-blur-sm border border-white/10 rounded-xl p-5">
        <div className="flex items-center gap-2 mb-3">
          <h3 className="text-sm font-semibold text-white">Evidence Pack Export</h3>
          <span className="w-3.5 h-3.5 flex items-center justify-center text-amber-400">
            <i className="ri-lock-line text-[10px]"></i>
          </span>
        </div>
        <div className="flex flex-col items-center py-4 gap-2">
          <div className="w-10 h-10 flex items-center justify-center rounded-full bg-amber-500/10 border border-amber-500/20">
            <i className="ri-file-zip-line text-amber-400 text-lg"></i>
          </div>
          <p className="text-xs text-gray-500 text-center">Evidence pack generation requires the Titan plan.</p>
          <Link
            href="/pricing"
            className="mt-1 px-4 py-1.5 bg-amber-600/20 hover:bg-amber-600/30 border border-amber-500/20 rounded-lg text-xs font-medium text-amber-400 transition-colors cursor-pointer whitespace-nowrap"
          >
            Upgrade to Titan
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-[#0f172a]/70 backdrop-blur-sm border border-white/10 rounded-xl p-5">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-semibold text-white">Evidence Pack Export</h3>
        {packCount !== undefined && packCount > 0 && (
          <span className="text-[10px] text-gray-500">{packCount} generated</span>
        )}
      </div>
      <div className="flex flex-col items-center py-3 gap-3">
        <div className="w-10 h-10 flex items-center justify-center rounded-full bg-indigo-500/10 border border-indigo-500/20">
          <i className="ri-file-zip-line text-indigo-400 text-lg"></i>
        </div>
        {lastGeneratedAt ? (
          <p className="text-xs text-gray-400">Last generated: {new Date(lastGeneratedAt).toLocaleDateString('en-GB')}</p>
        ) : (
          <p className="text-xs text-gray-500">Generate a complete ACS audit evidence pack for your next assessment.</p>
        )}
        {generating ? (
          <div className="flex items-center gap-2 px-4 py-1.5 bg-indigo-600/50 text-white text-xs font-medium rounded-lg whitespace-nowrap">
            <div className="w-3.5 h-3.5 flex items-center justify-center animate-spin">
              <i className="ri-loader-4-line"></i>
            </div>
            Generating PDF...
          </div>
        ) : (
          <button
            onClick={handleGenerate}
            className="px-4 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-medium rounded-lg transition-colors cursor-pointer whitespace-nowrap"
          >
            Generate Evidence Pack
          </button>
        )}
        {downloadUrl && (
          <a
            href={downloadUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 text-xs text-indigo-400 hover:text-indigo-300 transition-colors cursor-pointer whitespace-nowrap"
          >
            <div className="w-3.5 h-3.5 flex items-center justify-center">
              <i className="ri-download-line"></i>
            </div>
            Download PDF
          </a>
        )}
      </div>
    </div>
  );
}