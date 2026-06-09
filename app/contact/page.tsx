import { Suspense } from 'react';
import ContactContent from './ContactContent';

function LoadingFallback() {
  return (
    <div className="min-h-screen bg-[#0a0e1a] flex items-center justify-center">
      <i className="ri-loader-4-line animate-spin text-blue-500 text-2xl"></i>
    </div>
  );
}

export default function ContactPage() {
  return (
    <Suspense fallback={<LoadingFallback />}>
      <ContactContent />
    </Suspense>
  );
}