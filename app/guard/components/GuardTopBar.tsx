'use client';

import { useState, useEffect, useRef } from 'react';
import { useAuth } from '@/lib/auth';
import Link from 'next/link';
import { GuardNotificationBell } from '@/app/components/GuardNotificationBell';
import { useCoverOffers } from '@/lib/useCoverOffers';

export default function GuardTopBar({ siteName }: { siteName?: string }) {
  const { profile, signOut } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);
  const [syncStatus, setSyncStatus] = useState<'online' | 'syncing' | 'offline'>('online');
  const [gpsStatus, setGpsStatus] = useState<'ready' | 'searching' | 'error'>('searching');
  const { offers } = useCoverOffers(profile?.id || null, profile?.company_id || null);

  useEffect(() => {
    const handleOnline = () => setSyncStatus('online');
    const handleOffline = () => setSyncStatus('offline');
    setSyncStatus(navigator.onLine ? 'online' : 'offline');
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        () => setGpsStatus('ready'),
        () => setGpsStatus('error'),
        { enableHighAccuracy: true, timeout: 8000 }
      );
    } else {
      setGpsStatus('error');
    }

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const initials = `${profile?.first_name?.[0] || ''}${profile?.last_name?.[0] || ''}`.toUpperCase() || 'G';

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-[#0a0a0a]/95 backdrop-blur-lg border-b border-white/5">
      <div className="h-14 flex items-center justify-between px-4 max-w-lg mx-auto">
        <div className="flex items-center gap-3 min-w-0">
          <img
            src="https://storage.readdy-site.link/project_files/18288eee-63fa-4165-a658-6aa7ab020255/0f55097c-53e5-494b-b419-876152a51ee7_edited_image_d3fb89d4-4c94-480b-911a-a4f5576d177c_0.png?v=4a5cb4d0eb32cb9bee8b5acd1d9f9fa6"
            alt="GuardianHub"
            className="h-6 w-auto flex-shrink-0"
          />
          {siteName && (
            <div className="flex items-center gap-1.5 text-xs text-gray-400 min-w-0">
              <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 flex-shrink-0" />
              <span className="truncate">{siteName}</span>
            </div>
          )}
        </div>
        <div className="flex items-center gap-2.5 flex-shrink-0">
          {/* GPS Indicator */}
          <div className="w-6 h-6 flex items-center justify-center">
            {gpsStatus === 'ready' ? (
              <i className="ri-map-pin-2-line text-emerald-400 text-sm" title="GPS Ready"></i>
            ) : gpsStatus === 'searching' ? (
              <i className="ri-map-pin-2-line text-amber-400 text-sm animate-pulse" title="GPS Searching..."></i>
            ) : (
              <i className="ri-map-pin-2-line text-red-400 text-sm" title="GPS Unavailable"></i>
            )}
          </div>
          {/* Network */}
          <div className="w-6 h-6 flex items-center justify-center">
            {syncStatus === 'online' ? (
              <i className="ri-wifi-line text-emerald-400 text-sm"></i>
            ) : syncStatus === 'syncing' ? (
              <i className="ri-loader-4-line text-amber-400 text-sm animate-spin"></i>
            ) : (
              <i className="ri-wifi-off-line text-amber-400 text-sm"></i>
            )}
          </div>
          {/* Notifications */}
          <GuardNotificationBell userId={profile?.id || null} />
          {/* Cover Offers Badge */}
          {offers.length > 0 && (
            <Link
              href="/guard/cover-offers"
              className="relative w-8 h-8 flex items-center justify-center text-[#3b82f6] transition-colors cursor-pointer"
            >
              <div className="w-5 h-5 flex items-center justify-center">
                <i className="ri-hand-heart-line text-sm"></i>
              </div>
              <span className="absolute -top-1 -right-1 w-4 h-4 bg-[#3b82f6] rounded-full text-[9px] font-bold text-white flex items-center justify-center">
                {offers.length > 9 ? '9+' : offers.length}
              </span>
            </Link>
          )}
          {/* Profile Menu */}
          <div className="relative">
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              className="w-9 h-9 rounded-full bg-gradient-to-br from-[#3b82f6]/20 to-[#3b82f6]/5 border border-[#3b82f6]/20 flex items-center justify-center text-[#3b82f6] text-xs font-bold cursor-pointer active:scale-95 transition-transform"
            >
              {initials}
            </button>
            {menuOpen && (
              <div className="absolute right-0 top-11 w-52 bg-[#1a1a1a] border border-white/10 rounded-2xl shadow-2xl overflow-hidden z-50">
                <div className="px-4 py-3 border-b border-white/5">
                  <p className="text-sm font-semibold text-white">{profile?.first_name} {profile?.last_name}</p>
                  <p className="text-xs text-gray-400">{profile?.email}</p>
                </div>
                <div className="py-1">
                  <Link href="/guard/menu" onClick={() => setMenuOpen(false)} className="block px-4 py-3 text-sm text-gray-300 hover:bg-white/5 transition-colors cursor-pointer">
                    Profile & History
                  </Link>
                  <Link href="/guard/shifts" onClick={() => setMenuOpen(false)} className="block px-4 py-3 text-sm text-gray-300 hover:bg-white/5 transition-colors cursor-pointer">
                    My Shifts
                  </Link>
                  <Link href="/guard/cover-offers" onClick={() => setMenuOpen(false)} className="block px-4 py-3 text-sm text-gray-300 hover:bg-white/5 transition-colors cursor-pointer">
                    Cover Offers
                  </Link>
                  <Link href="/dashboard/settings" onClick={() => setMenuOpen(false)} className="block px-4 py-3 text-sm text-gray-300 hover:bg-white/5 transition-colors cursor-pointer">
                    Settings
                  </Link>
                  <button
                    onClick={async () => {
                      setMenuOpen(false);
                      await signOut();
                    }}
                    className="w-full text-left px-4 py-3 text-sm text-red-400 hover:bg-white/5 transition-colors cursor-pointer"
                  >
                    Sign Out
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
      {menuOpen && (
        <div className="fixed inset-0 z-40" onClick={() => setMenuOpen(false)}></div>
      )}
    </header>
  );
}