'use client';

import { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';

const SOPAssistantChat = dynamic(() => import('./SOPAssistantChat'), { ssr: false });

interface SOPAssistantWidgetProps {
  siteId?: string | null;
  siteName?: string | null;
  theme?: 'dark' | 'light';
  enableVoice?: boolean;
}

export default function SOPAssistantWidget({
  siteId,
  siteName,
  theme = 'dark',
  enableVoice = false,
}: SOPAssistantWidgetProps) {
  const [open, setOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768);
    check();
    window.addEventListener('resize', check);
    return () => window.removeEventListener('resize', check);
  }, []);

  if (isMobile) {
    if (!open) return null;
    return (
      <div className="fixed inset-0 z-[100] bg-black flex flex-col">
        <SOPAssistantChat
          siteId={siteId}
          siteName={siteName}
          theme={theme}
          enableVoice={enableVoice}
          onClose={() => setOpen(false)}
        />
      </div>
    );
  }

  return (
    <>
      {/* Floating button */}
      {!open && (
        <button
          onClick={() => setOpen(true)}
          className="fixed bottom-6 right-6 z-50 w-14 h-14 rounded-full bg-[#3b82f6] shadow-lg shadow-blue-900/30 flex items-center justify-center hover:bg-blue-500 transition-all hover:scale-105 active:scale-95 cursor-pointer"
          aria-label="Open SOP Assistant"
        >
          <div className="w-6 h-6 flex items-center justify-center text-white">
            <i className="ri-sparkling-line text-xl"></i>
          </div>
        </button>
      )}

      {/* Chat window */}
      {open && (
        <div className="fixed bottom-24 right-6 z-50 w-[400px] h-[600px] shadow-2xl">
          <SOPAssistantChat
            siteId={siteId}
            siteName={siteName}
            theme={theme}
            enableVoice={enableVoice}
            onClose={() => setOpen(false)}
          />
        </div>
      )}
    </>
  );
}