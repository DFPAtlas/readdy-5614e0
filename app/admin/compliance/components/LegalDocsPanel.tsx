'use client';

import { useState } from 'react';
import { useCompliance } from '@/lib/useCompliance';
import { Pill, Card, PanelHeader } from './ui';

export default function LegalDocsPanel() {
  const { policies } = useCompliance();
  const [openSlug, setOpenSlug] = useState<string | null>(null);

  return (
    <div className="space-y-6">
      <Card>
        <PanelHeader
          title="Legal and policy documents"
          subtitle="All documents are version-controlled drafts pending professional review. Nothing here is solicitor-approved."
          count={policies.length}
        />
        <div className="divide-y divide-gray-800/60">
          {policies.map((p) => (
            <div key={p.id} className="px-5 py-3">
              <button
                onClick={() => setOpenSlug(openSlug === p.slug ? null : p.slug)}
                className="w-full flex items-center justify-between gap-4 text-left cursor-pointer"
              >
                <div className="min-w-0">
                  <p className="text-sm text-white truncate">{p.title}</p>
                  <p className="text-xs text-gray-500">
                    v{p.version} · {p.category} · {p.change_summary}
                  </p>
                </div>
                <div className="flex items-center gap-3 flex-shrink-0">
                  <Pill value={p.status} />
                  <div className="w-4 h-4 flex items-center justify-center text-gray-500">
                    <i className={openSlug === p.slug ? 'ri-arrow-up-s-line' : 'ri-arrow-down-s-line'}></i>
                  </div>
                </div>
              </button>
              {openSlug === p.slug && (
                <div className="mt-3 bg-[#0f1629] border border-gray-800 rounded-lg p-4">
                  <p className="text-sm text-gray-400 leading-relaxed">{p.body}</p>
                </div>
              )}
            </div>
          ))}
        </div>
      </Card>

      <Card className="p-5 border-red-500/20 bg-red-500/[0.03]">
        <div className="flex items-start gap-3">
          <div className="w-8 h-8 rounded-lg bg-red-500/15 flex items-center justify-center flex-shrink-0">
            <div className="w-4 h-4 flex items-center justify-center">
              <i className="ri-error-warning-line text-red-400"></i>
            </div>
          </div>
          <div>
            <p className="text-sm text-white font-medium mb-1">Not legally reviewed</p>
            <p className="text-sm text-gray-400 leading-relaxed">
              These drafts are generated templates for structure only. They must be reviewed and approved by a
              qualified solicitor or DPO before publication. GuardianHub does not present generated text as
              solicitor-approved.
            </p>
          </div>
        </div>
      </Card>
    </div>
  );
}