'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useGuardAuth } from '@/lib/useGuardAuth';
import { useCoverOffers } from '@/lib/useCoverOffers';
import GuardTopBar from '../components/GuardTopBar';
import GuardBottomNav from '../components/GuardBottomNav';

function formatTime(iso: string) {
  const d = new Date(iso);
  return d.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit', hour12: false });
}

function formatDay(iso: string) {
  const d = new Date(iso);
  return d.toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric', month: 'short' });
}

function countdown(deadline: string): string {
  const diff = new Date(deadline).getTime() - Date.now();
  if (diff <= 0) return 'Expired';
  const m = Math.floor(diff / 60000);
  const h = Math.floor(m / 60);
  const min = m % 60;
  if (h > 0) return `${h}h ${min}m left`;
  return `${min}m left`;
}

export default function GuardCoverOffersPage() {
  const g = useGuardAuth();
  const { offers, loading, actionLoading, acceptOffer, declineOffer } = useCoverOffers(
    g.currentUser?.id || null,
    g.companyId
  );

  const [toast, setToast] = useState<string | null>(null);
  const [toastType, setToastType] = useState<'success' | 'error'>('success');
  const [activeOffer, setActiveOffer] = useState<string | null>(null);
  const [responseNote, setResponseNote] = useState('');
  const [now, setNow] = useState(Date.now());

  useEffect(() => {
    const t = setInterval(() => setNow(Date.now()), 30000);
    return () => clearInterval(t);
  }, []);

  const handleAccept = async (offerId: string) => {
    const { error } = await acceptOffer(offerId, responseNote);
    setActiveOffer(null);
    setResponseNote('');
    if (error) {
      setToastType('error');
      setToast('Failed to accept offer. Please try again.');
    } else {
      setToastType('success');
      setToast('Cover accepted! The shift is now yours.');
    }
    setTimeout(() => setToast(null), 4000);
  };

  const handleDecline = async (offerId: string) => {
    const { error } = await declineOffer(offerId, responseNote);
    setActiveOffer(null);
    setResponseNote('');
    if (error) {
      setToastType('error');
      setToast('Failed to decline offer. Please try again.');
    } else {
      setToastType('success');
      setToast('Cover offer declined.');
    }
    setTimeout(() => setToast(null), 4000);
  };

  if (g.loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <i className="ri-loader-4-line animate-spin text-[#3b82f6] text-2xl"></i>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white flex flex-col">
      <GuardTopBar siteName="Cover Offers" />
      <main className="flex-1 pt-14 pb-[72px] overflow-y-auto max-w-lg mx-auto w-full">
        {toast && (
          <div className="px-4 pt-4">
            <div
              className={`rounded-xl px-4 py-3 text-sm font-medium flex items-center gap-2 border ${
                toastType === 'error'
                  ? 'bg-red-500/10 border-red-500/20 text-red-400'
                  : 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400'
              }`}
            >
              <div className="w-5 h-5 flex items-center justify-center">
                <i className={toastType === 'error' ? 'ri-error-warning-line' : 'ri-check-line'}></i>
              </div>
              {toast}
            </div>
          </div>
        )}

        <div className="px-4 pt-4 pb-2">
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <div className="w-5 h-5 flex items-center justify-center">
              <i className="ri-hand-heart-line text-[#3b82f6]"></i>
            </div>
            Cover Offers
          </h2>
          <p className="text-xs text-gray-500 mt-1">
            Shifts other guards need covered
          </p>
        </div>

        {loading ? (
          <div className="px-4 py-8 flex items-center justify-center">
            <i className="ri-loader-4-line animate-spin text-[#3b82f6] text-2xl"></i>
          </div>
        ) : offers.length === 0 ? (
          <div className="px-4 py-8 text-center">
            <div className="w-14 h-14 bg-white/5 rounded-2xl flex items-center justify-center mx-auto mb-3">
              <i className="ri-hand-heart-line text-gray-500 text-2xl"></i>
            </div>
            <p className="text-sm text-gray-400">No cover offers</p>
            <p className="text-xs text-gray-600 mt-1">
              When another guard requests leave, you may be asked to cover their shift
            </p>
          </div>
        ) : (
          <div className="px-4 space-y-3">
            {offers.map((offer) => {
              const isActive = activeOffer === offer.id;
              const isExpired = new Date(offer.response_deadline).getTime() <= now;

              return (
                <div
                  key={offer.id}
                  className={`bg-[#1a1a1a] border rounded-2xl p-4 ${
                    isExpired ? 'border-white/5 opacity-50' : 'border-white/5'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-semibold text-white truncate">
                        {offer.site_name || 'Unknown Site'}
                      </p>
                      <p className="text-xs text-gray-400 mt-1">
                        {formatDay(offer.shift_start)} · {formatTime(offer.shift_start)} — {formatTime(offer.shift_end)}
                      </p>
                      <div className="flex items-center gap-2 mt-2">
                        <span className="text-[10px] px-2 py-0.5 rounded border font-medium bg-violet-500/15 text-violet-400 border-violet-500/20 capitalize">
                          {offer.reason || 'Leave'}
                        </span>
                        {!isExpired && (
                          <span className="text-[10px] text-amber-400 flex items-center gap-1">
                            <i className="ri-time-line"></i>
                            {countdown(offer.response_deadline)}
                          </span>
                        )}
                        {isExpired && (
                          <span className="text-[10px] text-gray-500">Expired</span>
                        )}
                      </div>
                      {offer.requesting_guard_name && (
                        <p className="text-[11px] text-gray-500 mt-1">
                          Requested by {offer.requesting_guard_name}
                        </p>
                      )}
                    </div>
                  </div>

                  {!isActive && !isExpired && (
                    <div className="flex gap-2 mt-3">
                      <button
                        onClick={() => setActiveOffer(offer.id)}
                        className="flex-1 h-11 bg-emerald-500/15 hover:bg-emerald-500/25 border border-emerald-500/20 rounded-xl text-xs font-semibold text-emerald-400 transition-colors cursor-pointer whitespace-nowrap flex items-center justify-center gap-1.5"
                      >
                        <div className="w-4 h-4 flex items-center justify-center">
                          <i className="ri-check-line"></i>
                        </div>
                        Accept
                      </button>
                      <button
                        onClick={() => setActiveOffer(offer.id)}
                        className="flex-1 h-11 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-xs font-medium text-gray-400 transition-colors cursor-pointer whitespace-nowrap flex items-center justify-center gap-1.5"
                      >
                        <div className="w-4 h-4 flex items-center justify-center">
                          <i className="ri-close-line"></i>
                        </div>
                        Decline
                      </button>
                    </div>
                  )}

                  {isActive && (
                    <div className="mt-3 space-y-3">
                      <textarea
                        value={responseNote}
                        onChange={(e) => setResponseNote(e.target.value)}
                        placeholder="Optional note..."
                        maxLength={200}
                        rows={2}
                        className="w-full bg-black/40 border border-white/10 rounded-xl px-3 py-2.5 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-[#3b82f6]/40 transition-colors resize-none"
                      />
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleDecline(offer.id)}
                          disabled={actionLoading === offer.id}
                          className="flex-1 h-11 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-xs font-medium text-gray-400 transition-colors cursor-pointer whitespace-nowrap"
                        >
                          {actionLoading === offer.id ? (
                            <i className="ri-loader-4-line animate-spin"></i>
                          ) : (
                            'Decline'
                          )}
                        </button>
                        <button
                          onClick={() => handleAccept(offer.id)}
                          disabled={actionLoading === offer.id}
                          className="flex-1 h-11 bg-emerald-500 hover:bg-emerald-400 disabled:opacity-40 text-white text-xs font-semibold rounded-xl transition-all active:scale-[0.98] cursor-pointer whitespace-nowrap flex items-center justify-center gap-1.5"
                        >
                          {actionLoading === offer.id ? (
                            <i className="ri-loader-4-line animate-spin"></i>
                          ) : (
                            <>
                              <div className="w-4 h-4 flex items-center justify-center">
                                <i className="ri-check-line"></i>
                              </div>
                              Accept Cover
                            </>
                          )}
                        </button>
                      </div>
                      <button
                        onClick={() => { setActiveOffer(null); setResponseNote(''); }}
                        className="w-full text-[11px] text-gray-500 hover:text-gray-400 transition-colors cursor-pointer"
                      >
                        Cancel
                      </button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </main>

      <GuardBottomNav />
    </div>
  );
}