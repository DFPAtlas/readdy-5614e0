'use client';

import { useEffect, useState } from 'react';

const MANIFEST_CONTENT = {
  name: 'GuardianHub Guard',
  short_name: 'GuardianHub',
  description: 'Security operations mobile portal — patrols, SOS, lone worker, check-ins',
  start_url: '/guard',
  scope: '/guard',
  display: 'standalone',
  orientation: 'portrait',
  theme_color: '#000000',
  background_color: '#000000',
  categories: ['security', 'productivity', 'utilities'],
  icons: [
    {
      src: 'https://readdy.ai/api/search-image?query=dark%20blue%20shield%20icon%20minimalist%20security%20guard%20logo%20design%20on%20pure%20black%20background%20simple%20sleek%20geometric%20app%20icon%20style%20mobile%20pwa&width=192&height=192&seq=guardianhub-pwa-192&orientation=squarish',
      sizes: '192x192',
      type: 'image/png',
      purpose: 'any maskable',
    },
    {
      src: 'https://readdy.ai/api/search-image?query=dark%20blue%20shield%20icon%20minimalist%20security%20guard%20logo%20design%20on%20pure%20black%20background%20simple%20sleek%20geometric%20app%20icon%20style%20mobile%20pwa%20high%20resolution&width=512&height=512&seq=guardianhub-pwa-512&orientation=squarish',
      sizes: '512x512',
      type: 'image/png',
      purpose: 'any maskable',
    },
  ],
  shortcuts: [
    {
      name: 'Clock In',
      short_name: 'Clock In',
      description: 'Quick clock in to your shift',
      url: '/guard',
      icons: [{ src: '', sizes: '96x96' }],
    },
    {
      name: 'Patrol',
      short_name: 'Patrol',
      description: 'Start a patrol',
      url: '/guard/patrol',
      icons: [{ src: '', sizes: '96x96' }],
    },
    {
      name: 'SOS',
      short_name: 'SOS',
      description: 'Emergency panic alarm',
      url: '/guard/sos',
      icons: [{ src: '', sizes: '96x96' }],
    },
  ],
  related_applications: [],
  prefer_related_applications: false,
};

const SW_CONTENT = `
const CACHE_NAME = 'guardianhub-guard-v1';

const STATIC_SHELL = [
  '/guard',
  '/guard/patrol',
  '/guard/sos',
  '/guard/shifts',
  '/guard/lone-worker',
  '/guard/ob',
  '/guard/incident',
  '/guard/notices',
  '/guard/messages',
  '/guard/wellbeing',
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(STATIC_SHELL).catch(() => {}))
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k)))
    )
  );
  self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);
  if (url.pathname.startsWith('/guard') && event.request.method === 'GET') {
    event.respondWith(
      caches.match(event.request).then((cached) => {
        const network = fetch(event.request).then((response) => {
          if (response.ok && response.type === 'basic') {
            const clone = response.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(event.request, clone));
          }
          return response;
        }).catch(() => cached || new Response('Offline', { status: 503, headers: { 'Content-Type': 'text/plain' } }));
        return cached || network;
      })
    );
    return;
  }
  if (event.request.method !== 'GET') return;
  event.respondWith(
    fetch(event.request).catch(() => {
      if (event.request.destination === 'document') {
        return caches.match('/guard').then((r) => r || new Response('Offline', { status: 503 }));
      }
      return new Response(null, { status: 503 });
    })
  );
});

self.addEventListener('message', (event) => {
  if (event.data === 'CLEAR_USER_CACHE') {
    caches.delete(CACHE_NAME);
  }
});
`;

export default function PwaSetup({ children }: { children: React.ReactNode }) {
  const [updateAvailable, setUpdateAvailable] = useState(false);
  const [swRegistered, setSwRegistered] = useState(false);

  useEffect(() => {
    const manifestBlob = new Blob([JSON.stringify(MANIFEST_CONTENT)], { type: 'application/json' });
    const manifestUrl = URL.createObjectURL(manifestBlob);

    const link = document.createElement('link');
    link.rel = 'manifest';
    link.href = manifestUrl;
    document.head.appendChild(link);

    const themeMeta = document.createElement('meta');
    themeMeta.name = 'theme-color';
    themeMeta.content = '#000000';
    document.head.appendChild(themeMeta);

    const appleMeta = document.createElement('meta');
    appleMeta.name = 'apple-mobile-web-app-capable';
    appleMeta.content = 'yes';
    document.head.appendChild(appleMeta);

    const appleStatus = document.createElement('meta');
    appleStatus.name = 'apple-mobile-web-app-status-bar-style';
    appleStatus.content = 'black';
    document.head.appendChild(appleStatus);

    return () => {
      document.head.removeChild(link);
      document.head.removeChild(themeMeta);
      document.head.removeChild(appleMeta);
      document.head.removeChild(appleStatus);
    };
  }, []);

  useEffect(() => {
    if (!('serviceWorker' in navigator)) return;

    const swBlob = new Blob([SW_CONTENT], { type: 'application/javascript' });
    const swUrl = URL.createObjectURL(swBlob);

    let registration: ServiceWorkerRegistration;

    navigator.serviceWorker
      .register(swUrl, { scope: '/guard' })
      .then((reg) => {
        registration = reg;
        setSwRegistered(true);

        reg.addEventListener('updatefound', () => {
          const newWorker = reg.installing;
          if (!newWorker) return;
          newWorker.addEventListener('statechange', () => {
            if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
              setUpdateAvailable(true);
            }
          });
        });
      })
      .catch(() => {});

    navigator.serviceWorker.addEventListener('controllerchange', () => {
      window.location.reload();
    });

    return () => {
      URL.revokeObjectURL(swUrl);
    };
  }, []);

  const handleUpdate = () => {
    if (navigator.serviceWorker.controller) {
      navigator.serviceWorker.controller.postMessage('SKIP_WAITING');
    }
  };

  return (
    <>
      {children}
      {updateAvailable && (
        <div className="fixed bottom-24 left-4 right-4 z-50 bg-[#1a1a1a] border border-[#3b82f6]/30 rounded-2xl p-4 shadow-2xl max-w-lg mx-auto">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#3b82f6]/15 flex items-center justify-center shrink-0">
              <i className="ri-refresh-line text-[#3b82f6] text-lg"></i>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-white">Update Available</p>
              <p className="text-xs text-gray-400">A new version is ready. Update now for the latest features and fixes.</p>
            </div>
            <button
              onClick={handleUpdate}
              className="h-10 px-5 bg-[#3b82f6] hover:bg-blue-500 text-white text-sm font-semibold rounded-xl transition-colors cursor-pointer whitespace-nowrap shrink-0"
            >
              Update
            </button>
          </div>
        </div>
      )}
    </>
  );
}