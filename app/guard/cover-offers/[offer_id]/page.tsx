import { Suspense } from 'react';
import CoverOfferDetailPage from './CoverOfferDetail';

export async function generateStaticParams() {
  return [{ offer_id: '1' }, { offer_id: '2' }, { offer_id: '3' }];
}

export default function Page() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-black flex items-center justify-center">
        <i className="ri-loader-4-line animate-spin text-[#3b82f6] text-2xl"></i>
      </div>
    }>
      <CoverOfferDetailPage />
    </Suspense>
  );
}