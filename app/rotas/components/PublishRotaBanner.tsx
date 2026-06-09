'use client';

import { useState } from 'react';

interface Props {
  published: boolean;
  publishedByName?: string;
  publishedAt?: string;
  isAdmin: boolean;
  onPublish: () => void;
  onUnpublish: () => void;
  publishing: boolean;
}

export default function PublishRotaBanner({
  published,
  publishedByName,
  publishedAt,
  isAdmin,
  onPublish,
  onUnpublish,
  publishing,
}: Props) {
  const [unpublishConfirm, setUnpublishConfirm] = useState(false);

  if (published) {
    return (
      <div className="bg-amber-500/10 border border-amber-500/20 rounded-xl px-5 py-3 flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-amber-500/15 flex items-center justify-center flex-shrink-0">
            <div className="w-4 h-4 flex items-center justify-center text-amber-400">
              <i className="ri-lock-line text-sm"></i>
            </div>
          </div>
          <div>
            <p className="text-sm font-semibold text-amber-300">
              This rota is published and locked
            </p>
            <p className="text-xs text-amber-400/70 mt-0.5">
              Published by {publishedByName || 'manager'} on {publishedAt ? new Date(publishedAt).toLocaleDateString() : '—'}
              {'. '}
              AI suggestions are disabled. Only admin can unpublish.
            </p>
          </div>
        </div>
        {isAdmin ? (
          <div className="flex items-center gap-2">
            {!unpublishConfirm ? (
              <button
                onClick={() => setUnpublishConfirm(true)}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-amber-600 hover:bg-amber-500 text-white text-sm font-medium transition-colors cursor-pointer whitespace-nowrap"
              >
                <div className="w-4 h-4 flex items-center justify-center">
                  <i className="ri-lock-unlock-line text-xs"></i>
                </div>
                Unpublish
              </button>
            ) : (
              <div className="flex items-center gap-2">
                <span className="text-xs text-amber-300 whitespace-nowrap">Unpublish this rota?</span>
                <button
                  onClick={() => { onUnpublish(); setUnpublishConfirm(false); }}
                  className="text-xs font-medium px-3 py-1.5 rounded bg-amber-600 hover:bg-amber-500 text-white transition-colors cursor-pointer whitespace-nowrap"
                >
                  Yes, unlock
                </button>
                <button
                  onClick={() => setUnpublishConfirm(false)}
                  className="text-xs font-medium px-3 py-1.5 rounded bg-gray-700 hover:bg-gray-600 text-gray-300 transition-colors cursor-pointer whitespace-nowrap"
                >
                  Cancel
                </button>
              </div>
            )}
          </div>
        ) : (
          <span className="text-xs text-amber-400/60 whitespace-nowrap">Contact admin to edit</span>
        )}
      </div>
    );
  }

  return (
    <div className="bg-emerald-500/5 border border-emerald-500/15 rounded-xl px-5 py-3 flex items-center justify-between gap-4">
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 rounded-lg bg-emerald-500/10 flex items-center justify-center flex-shrink-0">
          <div className="w-4 h-4 flex items-center justify-center text-emerald-400">
            <i className="ri-lock-unlock-line text-sm"></i>
          </div>
        </div>
        <div>
          <p className="text-sm font-semibold text-gray-300">Rota is in draft mode</p>
          <p className="text-xs text-gray-500 mt-0.5">
            AI suggestions are enabled. Publish when ready to lock and send to guards.
          </p>
        </div>
      </div>
      <button
        onClick={onPublish}
        disabled={publishing}
        className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 disabled:bg-emerald-600/40 text-white text-sm font-medium transition-colors cursor-pointer whitespace-nowrap"
      >
        {publishing ? (
          <div className="w-4 h-4 flex items-center justify-center">
            <i className="ri-loader-4-line animate-spin text-xs"></i>
          </div>
        ) : (
          <div className="w-4 h-4 flex items-center justify-center">
            <i className="ri-check-double-line text-xs"></i>
          </div>
        )}
        Publish Rota
      </button>
    </div>
  );
}