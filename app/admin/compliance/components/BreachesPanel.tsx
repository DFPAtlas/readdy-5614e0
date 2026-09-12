'use client';

import { useCompliance } from '@/lib/useCompliance';
import { Pill, Card, PanelHeader } from './ui';

function deadlineFor(b: { awareness_time: string | null; regulator_notification_deadline: string | null }): string {
  if (b.regulator_notification_deadline) return new Date(b.regulator_notification_deadline).toLocaleString();
  if (b.awareness_time) return new Date(new Date(b.awareness_time).getTime() + 72 * 3600 * 1000).toLocaleString();
  return 'Set awareness time';
}

export default function BreachesPanel() {
  const { breaches } = useCompliance();

  return (
    <div className="space-y-6">
      <Card>
        <PanelHeader
          title="Personal data breach log"
          subtitle="The 72-hour notification deadline is calculated from recorded awareness time. Human confirmation of reportability is always required."
          count={breaches.length}
        />
        {breaches.length === 0 ? (
          <p className="px-5 py-8 text-sm text-gray-500 text-center">
            No breach cases recorded. The log is retained even for events assessed as not reportable.
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-xs text-gray-500 border-b border-gray-800">
                  <th className="px-5 py-3 font-medium">Reference</th>
                  <th className="px-5 py-3 font-medium">Awareness</th>
                  <th className="px-5 py-3 font-medium">72h deadline</th>
                  <th className="px-5 py-3 font-medium">Reportability</th>
                  <th className="px-5 py-3 font-medium">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-800/60">
                {breaches.map((b) => (
                  <tr key={b.id} className="hover:bg-white/[0.02]">
                    <td className="px-5 py-3 text-white font-medium">{b.reference || '—'}</td>
                    <td className="px-5 py-3 text-gray-400">{b.awareness_time ? new Date(b.awareness_time).toLocaleString() : '—'}</td>
                    <td className="px-5 py-3 text-gray-400">{deadlineFor(b)}</td>
                    <td className="px-5 py-3"><Pill value={b.reportability_assessment} /></td>
                    <td className="px-5 py-3"><Pill value={b.status} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      <Card className="p-5 border-amber-500/20 bg-amber-500/[0.03]">
        <p className="text-sm text-gray-400 leading-relaxed">
          GuardianHub never automatically notifies the ICO, customers or affected individuals. Notification requires
          authorised human approval. A breach log is maintained even when an event is assessed as not reportable.
        </p>
      </Card>
    </div>
  );
}