'use client';

import { useEffect } from 'react';
import Link from 'next/link';

interface UpgradeRequiredModalProps {
  isOpen: boolean;
  onClose: () => void;
  featureName?: string;
}

export default function UpgradeRequiredModal({ isOpen, onClose, featureName }: UpgradeRequiredModalProps) {

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-[100] p-4">
      <div className="bg-[#111827] border border-gray-700 rounded-2xl w-full max-w-md shadow-2xl">
        <div className="p-6 text-center">
          <div className="w-14 h-14 flex items-center justify-center rounded-full bg-amber-500/10 border border-amber-500/20 mx-auto mb-4">
            <i className="ri-lock-line text-2xl text-amber-400"></i>
          </div>
          <h2 className="text-xl font-bold text-white mb-2">Upgrade Required</h2>
          <p className="text-gray-400 text-sm leading-relaxed">
            {featureName
              ? `"${featureName}" is not available on your current subscription plan.`
              : 'This feature is not available on your current subscription plan.'}
          </p>
        </div>
        <div className="flex items-center gap-3 px-6 pb-6">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2.5 rounded-lg text-sm font-medium text-gray-400 hover:text-white hover:bg-gray-800 border border-gray-700 transition-colors cursor-pointer whitespace-nowrap"
          >
            Close
          </button>
          <Link
            href="/pricing"
            onClick={onClose}
            className="flex-1 px-4 py-2.5 rounded-lg text-sm font-medium bg-blue-600 hover:bg-blue-500 text-white transition-colors cursor-pointer whitespace-nowrap text-center"
          >
            Upgrade Now
          </Link>
        </div>
      </div>
    </div>
  );
}