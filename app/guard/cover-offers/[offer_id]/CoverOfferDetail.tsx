'use client';

import { useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useAuth } from '@/lib/auth';
import { useCoverOffers } from '@/lib/useCoverOffers';
import GuardTopBar from '../../components/GuardTopBar';
import GuardBottomNav from '../../components/GuardBottomNav';

function formatTime(iso: string) {
  const d = new Date(iso);
  return d.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit', hour12: false });
}

function formatDay(iso: string) {
  const d = new Date(iso);
  return d.toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' });
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

export default function CoverOfferDetail() {
  const params = useParams();
  const offerId = params?.offer_id as string;
  const { currentUser, profile } = useAuth();
  const { offers, loading, actionLoading, acceptOffer, declineOffer } = useCoverOffers(
    currentUser?.id || null,
    profile?.company_id || null
  );
  const router = useRouter();

  const [responseNote, setResponseNote] = useState('');
  const [toast, setToast] = useState<string | null>(null);
  const [toastType, setToastType] = useState<'success' | 'error'>('success');

  const offer = offers.find((o) => o.id === offerId);

  const handleAccept = async () => {
    const { error } = await acceptOffer(offerId, responseNote);
    if (error) {
      setToastType('error');
      setToast('Failed to accept offer. Please try again.');
    } else {
      setToastType('success');
      setToast('Cover accepted! The shift is now yours.');
      setTimeout(() => router.push('/guard/cover-offers'), 1500);
    }
    setTimeout(() => setToast(null), 4000);
  };

  const handleDecline = async () => {
    const { error } = await declineOffer(offerId, responseNote);
    if (error) {
      setToastType('error');
      setToast('Failed to decline offer. Please try again.');
    } else {
      setToastType('success');
      setToast('Cover offer declined.');
      setTimeout(() => router.push('/guard/cover-offers'), 1500);
    }
    setTimeout(() => setToast(null), 4000);
  };

  const isExpired = offer ? new Date(offer.response_deadline).getTime() <= Date.now() : false;

  return (
    <div className="min-h-screen bg-black text-white flex flex-col">
      <GuardTopBar siteName="Cover Offer" />
      <main className="flex-1 pt-14 pb-[72px] overflow-y-auto max-w-lg mx-auto w-full">
        {toast && (
          <div className="px-4 pt-4">
            <div className={`rounded-xl px-4 py-3 text-sm font-medium flex items-center gap-2 border ${
              toastType === 'error'
                ? 'bg-red-500/10 border-red-500/20 text-red-400'
                : 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400'
            }`}>
              <div className="w-5 h-5 flex items-center justify-center">
                <i className={toastType === 'error' ? 'ri-error-warning-line' : 'ri-check-line'}></i>
              </div>
              {toast}
            </div>
          </div>
        )}

        {loading ? (
          <div className="px-4 py-8 flex items-center justify-center">
            <i className="ri-loader-4-line animate-spin text-[#3b82f6] text-2xl"></i>
          </div>
        ) : !offer ? (
          <div className="px-4 py-8 text-center">
            <div className="w-14 h-14 bg-white/5 rounded-2xl flex items-center justify-center mx-auto mb-3">
              <i className="ri-hand-heart-line text-gray-500 text-2xl"></i>
            </div>
            <p className="text-sm text-gray-400">Offer not found or expired</p>
            <button
              onClick={() => router.push('/guard/cover-offers')}
              className="mt-4 h-10 px-4 bg-[#3b82f6]/15 text-[#3b82f6] text-xs font-medium rounded-xl cursor-pointer whitespace-nowrap"
            >
              Back to Cover Offers
            </button>
          </div>
        ) : (
          <div className="px-4 py-4 space-y-4">
            <div className="bg-[#1a1a1a] border border-white/5 rounded-2xl p-5">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 rounded-xl bg-[#3b82f6]/15 flex items-center justify-center">
                  <i className="ri-hand-heart-line text-[#3b82f6] text-xl"></i>
                </div>
                <div>
                  <h2 className="text-lg font-bold text-white">Shift Cover Offer</h2>
                  <p className="text-xs text-gray-400">{offer.site_name || 'Unknown Site'}</p>
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex items-center justify-between py-2 border-b border-white/5">
                  <span className="text-sm text-gray-400">Date</span>
                  <span className="text-sm text-white">{formatDay(offer.shift_start)}</span>
                </div>
                <div className="flex items-center justify-between py-2 border-b border-white/5">
                  <span className="text-sm text-gray-400">Time</span>
                  <span className="text-sm text-white">{formatTime(offer.shift_start)} — {formatTime(offer.shift_end)}</span>
                </div>
                <div className="flex items-center justify-between py-2 border-b border-white/5">
                  <span className="text-sm text-gray-400">Reason</span>
                  <span className="text-sm text-white capitalize">{offer.reason || 'Leave'}</span>
                </div>
                {offer.requesting_guard_name && (
                  <div className="flex items-center justify-between py-2 border-b border-white/5">
                    <span className="text-sm text-gray-400">Requested by</span>
                    <span className="text-sm text-white">{offer.requesting_guard_name}</span>
                  </div>
                )}
                <div className="flex items-center justify-between py-2">
                  <span className="text-sm text-gray-400">Response deadline</span>
                  <span className={`text-sm font-medium ${isExpired ? 'text-gray-500' : 'text-amber-400'}`}>
                    {countdown(offer.response_deadline)}
                  </span>
                </div>
              </div>
            </div>

            {!isExpired && (
              <div className="bg-[#1a1a1a] border border-white/5 rounded-2xl p-5 space-y-4">
                <label className="text-xs text-gray-400 block">Optional Note</label>
                <textarea
                  value={responseNote}
                  onChange={(e) => setResponseNote(e.target.value)}
                  placeholder="Add a note when accepting or declining..."
                  maxLength={200}
                  rows={3}
                  className="w-full bg-black/40 border border-white/10 rounded-xl px-3 py-2.5 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-[#3b82f6]/40 transition-colors resize-none"
                />
                <div className="flex gap-3">
                  <button
                    onClick={handleDecline}
                    disabled={actionLoading === offerId}
                    className="flex-1 h-14 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-sm font-medium text-gray-400 transition-colors cursor-pointer whitespace-nowrap flex items-center justify-center gap-2"
                  >
                    {actionLoading === offerId ? (
                      <i className="ri-loader-4-line animate-spin"></i>
                    ) : (
                      <>
                        <div className="w-4 h-4 flex items-center justify-center"><i className="ri-close-line"></i></div>
                        Decline
                      </>
                    )}
                  </button>
                  <button
                    onClick={handleAccept}
                    disabled={actionLoading === offerId}
                    className="flex-1 h-14 bg-emerald-500 hover:bg-emerald-400 disabled:opacity-40 text-white text-sm font-semibold rounded-xl transition-all active:scale-[0.98] cursor-pointer flex items-center justify-center gap-2 whitespace-nowrap"
                  >
                    {actionLoading === offerId ? (
                      <i className="ri-loader-4-line animate-spin text-lg"></i>
                    ) : (
                      <>
                        <div className="w-5 h-5 flex items-center justify-center"><i className="ri-check-line text-lg"></i></div>
                        Accept Cover
                      </>
                    )}
                  </button>
                </div>
              </div>
            )}

            {isExpired && (
              <div className="bg-gray-800/30 border border-white/5 rounded-2xl p-5 text-center">
                <div className="w-10 h-10 bg-gray-700/50 rounded-full flex items-center justify-center mx-auto mb-3">
                  <i className="ri-time-line text-gray-500 text-xl"></i>
                </div>
                <p className="text-sm text-gray-400">This offer has expired</p>
              </div>
            )}
          </div>
        )}
      </main>
      <GuardBottomNav />
    </div>
  );
}