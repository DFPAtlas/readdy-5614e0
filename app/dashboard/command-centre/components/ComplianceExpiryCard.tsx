'use client';

import Link from 'next/link';
import type { ComplianceExpiry } from '@/lib/useCommandCentreExtended';

const typeIcons: Record<string, string> = {
  certification: 'ri-award-line',
  insurance: 'ri-shield-check-line',
  training: 'ri-book-open-line',
  license: 'ri-id-card-line',
  contract: 'ri-file-text-line',
  policy: 'ri-file-shield-line',
};

interface Props {
  expiries: ComplianceExpiry[];
}

export default function ComplianceExpiryCard({ expiries }: Props) {
  const critical = expiries.filter(e => e.days_remaining <= 7);
  const warning = expiries.filter(e => e.days_remaining > 7 && e.days_remaining <= 30);

  return (
    <div className="bg-[#0f172a]/70 backdrop-blur-sm border border-white/10 rounded-xl p-4 h-full flex flex-col">
      <div className="flex items-center gap-2 mb-3">
        <div className="w-5 h-5 flex items-center justify-center text-orange-400">
          <i className="ri-file-warning-line text-sm"></i>
        </div>
        <h3 className="text-sm font-semibold text-white">Compliance Expiry</h3>
        <div className="ml-auto flex items-center gap-1.5">
          {critical.length > 0 && (
            <span className="px-1.5 py-0.5 rounded bg-red-500/10 text-red-400 text-[10px] font-semibold">{critical.length} soon</span>
          )}
          <span className="text-xs text-gray-500">{expiries.length} expiring</span>
        </div>
      </div>

      {expiries.length === 0 ? (
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <div className="w-8 h-8 rounded-full bg-emerald-500/10 flex items-center justify-center mx-auto mb-2">
              <div className="w-4 h-4 flex items-center justify-center text-emerald-400">
                <i className="ri-check-line text-sm"></i>
              </div>
            </div>
            <p className="text-xs text-gray-500">No documents expiring within 30 days</p>
          </div>
        </div>
      ) : (
        <div className="flex-1 space-y-1 overflow-y-auto">
          {critical.map(e => {
            const icon = typeIcons[e.document_type] || 'ri-file-line';
            return (
              <Link key={e.id} href="/dashboard/compliance/documents" className="flex items-center gap-2 p-2 rounded-lg bg-red-500/5 border border-red-500/10 hover:bg-red-500/10 transition-colors cursor-pointer">
                <div className="w-4 h-4 flex items-center justify-center text-red-400">
                  <i className={`${icon} text-xs`}></i>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-medium text-white truncate">{e.document_title}</p>
                  <p className="text-[10px] text-gray-500">{e.entity_type} · {e.document_type}</p>
                </div>
                <span className="text-[10px] text-red-400 font-semibold shrink-0">{e.days_remaining}d</span>
              </Link>
            );
          })}
          {warning.slice(0, 4 - critical.length).map(e => {
            const icon = typeIcons[e.document_type] || 'ri-file-line';
            return (
              <Link key={e.id} href="/dashboard/compliance/documents" className="flex items-center gap-2 p-2 rounded-lg hover:bg-white/5 transition-colors cursor-pointer">
                <div className="w-4 h-4 flex items-center justify-center text-amber-400">
                  <i className={`${icon} text-xs`}></i>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-medium text-white truncate">{e.document_title}</p>
                  <p className="text-[10px] text-gray-500">{e.entity_type}</p>
                </div>
                <span className="text-[10px] text-amber-400 shrink-0">{e.days_remaining}d</span>
              </Link>
            );
          })}
          {expiries.length > 8 && (
            <p className="text-[10px] text-gray-600 text-center pt-1">+{expiries.length - 8} more documents</p>
          )}
        </div>
      )}
    </div>
  );
}