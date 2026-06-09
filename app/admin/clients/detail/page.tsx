import { Suspense } from 'react';
import ClientDetailContent from '../components/ClientDetailContent';

export default function Page() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-[#0B0F1E] flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-500" />
      </div>
    }>
      <ClientDetailContent />
    </Suspense>
  );
}