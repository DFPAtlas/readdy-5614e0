'use client';

import { useEffect, useRef } from 'react';
import { usePanicMode } from './PanicModeContext';

export default function PanicModeOverlay() {
  const { panicMode, disablePanicMode } = usePanicMode();
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    if (panicMode) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [panicMode]);

  if (!panicMode) return null;

  return (
    <>
      {/* Full-screen dark overlay */}
      <div
        className="fixed inset-0 z-40 bg-black/60 backdrop-blur-[2px]"
        onClick={disablePanicMode}
      />

      {/* Panic Mode Banner */}
      <div className="fixed top-0 left-0 right-0 z-50 bg-red-950/90 border-b-2 border-red-500 animate-pulse-red-banner">
        <div className="max-w-[1600px] mx-auto px-4 lg:px-6 py-3 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <span className="relative flex h-4 w-4 shrink-0">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-500 opacity-100" />
              <span className="relative inline-flex rounded-full h-4 w-4 bg-red-500" />
            </span>
            <div>
              <h2 className="text-lg font-bold text-red-400 tracking-wider uppercase">
                Panic Mode Active
              </h2>
              <p className="text-xs text-red-300/80">
                Non-critical widgets dimmed. Focus on active incidents.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <span className="text-xs text-red-400/70 font-mono hidden sm:inline">
              Click anywhere outside critical widgets to exit
            </span>
            <button
              onClick={disablePanicMode}
              className="px-4 py-2 rounded-lg bg-red-500/20 border border-red-500/40 text-red-300 text-sm font-semibold hover:bg-red-500/30 hover:text-red-200 transition-all cursor-pointer whitespace-nowrap"
            >
              Exit Panic Mode
            </button>
          </div>
        </div>
      </div>

      {/* Edge red glow */}
      <div className="fixed inset-0 z-[35] pointer-events-none border-[6px] border-red-500/20 animate-panic-glow" />
    </>
  );
}