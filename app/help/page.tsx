import { Suspense } from 'react';
import HelpClient from './HelpClient';

export default function HelpPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#0a0e1a] flex items-center justify-center"><div className="w-8 h-8 border-2 border-blue-500/30 border-t-blue-500 rounded-full animate-spin"></div></div>}>
      <HelpClient />
    </Suspense>
  );
}