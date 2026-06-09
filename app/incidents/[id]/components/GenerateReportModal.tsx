'use client';

import { useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/lib/auth';
import { format } from 'date-fns';

interface GenerateReportModalProps {
  incidentId: string;
  incidentType: string;
  siteName: string;
  hasAiReport: boolean;
  onClose: () => void;
  onGenerated: () => void;
}

const EDGE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL + '/functions/v1/generate-incident-pdf';

export default function GenerateReportModal({ incidentId, incidentType, siteName, hasAiReport, onClose, onGenerated }: GenerateReportModalProps) {
  const { currentUser } = useAuth();
  const [generating, setGenerating] = useState(false);

  const handleGenerate = async () => {
    setGenerating(true);
    try {
      const { data: sessionData } = await supabase.auth.getSession();
      const token = sessionData.session?.access_token;

      const resp = await fetch(EDGE_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ incident_id: incidentId }),
      });

      const result = await resp.json();
      if (resp.ok && result.url) {
        if (typeof window !== 'undefined') {
          window.open(result.url, '_blank');
        }
        onGenerated();
      } else {
        alert('Failed to generate PDF: ' + (result.error || 'Unknown error'));
      }
    } catch (err: any) {
      alert('Failed to generate PDF: ' + err.message);
    } finally {
      setGenerating(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="bg-[#151b27] border border-gray-800 rounded-xl w-full max-w-md shadow-2xl p-6">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-10 h-10 rounded-full bg-blue-500/10 flex items-center justify-center flex-shrink-0">
            <div className="w-5 h-5 flex items-center justify-center text-blue-400">
              <i className="ri-file-pdf-line"></i>
            </div>
          </div>
          <h2 className="text-lg font-semibold text-white">Generate Incident Report PDF?</h2>
        </div>

        <p className="text-sm text-gray-400 mb-4">
          This will create a professional A4 PDF report for{' '}
          <span className="text-white font-medium">{incidentType || 'Incident'}</span> at{' '}
          <span className="text-white font-medium">{siteName || 'Unknown site'}</span>.
        </p>

        {!hasAiReport && (
          <div className="flex items-start gap-2 mb-4 p-3 rounded-lg bg-amber-500/5 border border-amber-500/20">
            <div className="w-5 h-5 flex items-center justify-center text-amber-400 flex-shrink-0 mt-0.5">
              <i className="ri-lightbulb-line"></i>
            </div>
            <p className="text-xs text-amber-300">
              Run AI Rewrite first for a more polished, external-ready report.
            </p>
          </div>
        )}

        <div className="flex items-center justify-end gap-3">
          <button
            onClick={onClose}
            disabled={generating}
            className="px-4 py-2 rounded-lg text-sm font-medium text-gray-400 hover:text-white transition-colors cursor-pointer whitespace-nowrap"
          >
            Cancel
          </button>
          <button
            onClick={handleGenerate}
            disabled={generating}
            className="px-4 py-2 rounded-lg text-sm font-medium bg-blue-600 hover:bg-blue-500 text-white disabled:opacity-50 transition-colors cursor-pointer whitespace-nowrap flex items-center gap-2"
          >
            {generating ? (
              <>
                <div className="w-4 h-4 border border-white/30 border-t-white rounded-full animate-spin"></div>
                Generating PDF...
              </>
            ) : (
              <>
                <div className="w-4 h-4 flex items-center justify-center">
                  <i className="ri-file-download-line"></i>
                </div>
                Generate
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}