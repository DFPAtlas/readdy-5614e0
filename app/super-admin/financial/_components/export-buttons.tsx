'use client';

import Link from "next/link";

export function ExportButtons({ type }: { type: string }) {
  const base = "https://kbefthyqlfrwixmkcqhu.supabase.co/functions/v1";

  const handleDownload = async (format: 'csv' | 'pdf') => {
    const token = localStorage.getItem('sb-kbefthyqlfrwixmkcqhu-supabase-auth-token');
    let authToken = '';
    if (token) {
      try {
        const parsed = JSON.parse(token);
        authToken = parsed.access_token || '';
      } catch {}
    }

    const url = `${base}/financial-export-${format}?type=${encodeURIComponent(type)}`;
    const res = await fetch(url, {
      headers: authToken ? { authorization: `Bearer ${authToken}` } : {},
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({ error: 'Download failed' }));
      alert(err.error || 'Download failed');
      return;
    }

    const blob = await res.blob();
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    const cd = res.headers.get('content-disposition');
    const match = cd?.match(/filename="([^"]+)"/);
    link.download = match?.[1] || `export.${format}`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(link.href);
  };

  return (
    <div className="flex items-center gap-2">
      <button
        onClick={() => handleDownload('csv')}
        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-gray-800/40 border border-gray-700/60 text-gray-300 hover:text-white hover:border-gray-600 transition-all cursor-pointer whitespace-nowrap"
      >
        <div className="w-4 h-4 flex items-center justify-center"><i className="ri-download-line"></i></div>
        CSV
      </button>
      <button
        onClick={() => handleDownload('pdf')}
        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-gray-800/40 border border-gray-700/60 text-gray-300 hover:text-white hover:border-gray-600 transition-all cursor-pointer whitespace-nowrap"
      >
        <div className="w-4 h-4 flex items-center justify-center"><i className="ri-file-pdf-line"></i></div>
        PDF
      </button>
    </div>
  );
}