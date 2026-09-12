'use client';

import { useCompliance } from '@/lib/useCompliance';
import { Pill, Card, PanelHeader } from './ui';

export default function ProvidersPanel() {
  const { subprocessors } = useCompliance();

  return (
    <div className="space-y-6">
      <Card>
        <PanelHeader
          title="Subprocessor register"
          subtitle="Published on the Trust Centre. Transfer mechanisms require legal review."
          count={subprocessors.length}
        />
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-xs text-gray-500 border-b border-gray-800">
                <th className="px-5 py-3 font-medium">Provider</th>
                <th className="px-5 py-3 font-medium">Service</th>
                <th className="px-5 py-3 font-medium">Data processed</th>
                <th className="px-5 py-3 font-medium">Location / transfer</th>
                <th className="px-5 py-3 font-medium">Contract</th>
                <th className="px-5 py-3 font-medium">Security review</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-800/60">
              {subprocessors.map((s) => (
                <tr key={s.id} className="hover:bg-white/[0.02]">
                  <td className="px-5 py-3 text-white font-medium">{s.provider_name}</td>
                  <td className="px-5 py-3 text-gray-400">{s.service}</td>
                  <td className="px-5 py-3 text-gray-400 max-w-xs truncate">{s.data_processed}</td>
                  <td className="px-5 py-3 text-gray-400">
                    <p>{s.processing_location}</p>
                    <p className="text-xs text-gray-500">Transfer: {s.transfer_countries || 'TBD'}</p>
                  </td>
                  <td className="px-5 py-3"><Pill value={s.contract_status} /></td>
                  <td className="px-5 py-3"><Pill value={s.security_review_status} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      <Card className="p-5">
        <div className="flex items-start gap-3">
          <div className="w-8 h-8 rounded-lg bg-amber-500/15 flex items-center justify-center flex-shrink-0">
            <div className="w-4 h-4 flex items-center justify-center">
              <i className="ri-alert-line text-amber-400"></i>
            </div>
          </div>
          <p className="text-sm text-gray-400 leading-relaxed">
            Some subprocessors may process data outside the UK. GuardianHub does not assume UK-only processing.
            Transfer mechanisms and risk assessments must be confirmed by legal review before reliance is placed on them.
          </p>
        </div>
      </Card>
    </div>
  );
}