'use client';

import { useCompliance } from '@/lib/useCompliance';
import { Pill, Card, PanelHeader } from './ui';

const PROHIBITED = [
  'Dismiss workers',
  'Reject applicants',
  'Determine guilt',
  'Diagnose health',
  'Close SOS events',
  'Final disciplinary decisions',
  'Solely automated high-impact decisions',
];

export default function AiRegisterPanel() {
  const { aiRegister } = useCompliance();

  return (
    <div className="space-y-6">
      <Card>
        <PanelHeader
          title="AI and automation register"
          subtitle="All systems require human review. No system is independently authorised to make high-impact decisions."
          count={aiRegister.length}
        />
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-xs text-gray-500 border-b border-gray-800">
                <th className="px-5 py-3 font-medium">System</th>
                <th className="px-5 py-3 font-medium">Decision type</th>
                <th className="px-5 py-3 font-medium">Human involvement</th>
                <th className="px-5 py-3 font-medium">Impact</th>
                <th className="px-5 py-3 font-medium">Approval</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-800/60">
              {aiRegister.map((a) => (
                <tr key={a.id} className="hover:bg-white/[0.02]">
                  <td className="px-5 py-3 text-white font-medium">{a.system_name}</td>
                  <td className="px-5 py-3 text-gray-400">{a.decision_type}</td>
                  <td className="px-5 py-3 text-gray-400 max-w-xs">{a.human_involvement}</td>
                  <td className="px-5 py-3"><Pill value={a.impact_on_individuals} /></td>
                  <td className="px-5 py-3"><Pill value={a.approval_status} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      <Card className="p-5">
        <h3 className="text-sm font-semibold text-white mb-3">Agents must never independently</h3>
        <div className="grid md:grid-cols-2 gap-2">
          {PROHIBITED.map((p) => (
            <div key={p} className="flex items-center gap-2.5 text-sm text-gray-300">
              <div className="w-4 h-4 flex items-center justify-center flex-shrink-0">
                <i className="ri-close-circle-line text-red-400"></i>
              </div>
              {p}
            </div>
          ))}
        </div>
        <p className="text-xs text-gray-500 mt-4">
          A human-review and challenge route is provided for every automated recommendation.
        </p>
      </Card>
    </div>
  );
}