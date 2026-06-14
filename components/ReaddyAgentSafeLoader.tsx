'use client';

import { useEffect, useRef } from 'react';

export default function ReaddyAgentSafeLoader() {
  const mountedRef = useRef(false);
  const cancelledRef = useRef(false);

  useEffect(() => {
    if (mountedRef.current) return;
    mountedRef.current = true;
    cancelledRef.current = false;

    const enabled = process.env.NEXT_PUBLIC_ENABLE_READDY_AGENT === 'true';
    if (!enabled) return;

    if (typeof window === 'undefined') return;

    const script = document.createElement('script');
    script.src = `https://readdy.ai/api/public/assistant/widget?projectId=${process.env.NEXT_PUBLIC_READDY_PROJECT_ID || ''}`;
    script.async = true;
    script.setAttribute('strategy', 'afterInteractive');
    script.setAttribute('mode', 'hybrid');
    script.setAttribute('voice-show-transcript', 'true');
    script.setAttribute('theme', 'light');
    script.setAttribute('size', 'compact');
    script.setAttribute('accent-color', '#14B8A6');
    script.setAttribute('button-base-color', '#000000');
    script.setAttribute('button-accent-color', '#FFFFFF');

    script.onerror = () => {
      if (!cancelledRef.current && process.env.NODE_ENV === 'development') {
        console.warn('[ReaddyAgent] Script failed to load');
      }
    };

    document.body.appendChild(script);

    return () => {
      cancelledRef.current = true;
      try {
        if (document.body.contains(script)) {
          document.body.removeChild(script);
        }
        const widget = document.querySelector('#vapi-widget-floating-button');
        if (widget) widget.remove();
      } catch {}
    };
  }, []);

  return null;
}