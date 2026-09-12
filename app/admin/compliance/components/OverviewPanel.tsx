'use client';

import { useCompliance } from '@/lib/useCompliance';
import { Pill, Card } from './ui';

export default function OverviewPanel() {
  const { frameworks, reviewTasks, policies, dpias, breaches, aiRegister, activities, subprocessors } = useCompliance();

  const openTasks = reviewTasks.filter((t) => t.status === 'open');
  const highPriority = openTasks.filter((t) => t.priority === 'high');
  const publishedPolicies = policies.filter((p) => p.is_published);
  const approvedDpias = dpias.filter((d) => d.approval_status === 'approved');
  const openBreaches = breaches.filter((b) => b.status !== 'closed');
  const notApprovedAi = aiRegister.filter((a) => a.approval_status !== 'approved');
  const legalReviewActivities = activities.filter((a) => a.status === 'legal_review');

  const stats = [
    { label: 'Frameworks', value: frameworks.length, icon: 'ri-scales-3-line' },
    { label: 'Subprocessors', value: subprocessors.length, icon: 'ri-organization-chart' },
    { label: 'Policy documents', value: policies.length, icon: 'ri-file-text-line' },
    { label: 'Processing activities', value: activities.length, icon: 'ri-flow-chart' },
    { label: 'DPIA assessments', value: dpias.length, icon: 'ri-shield-cross-line' },
    { label: 'AI / automation', value: aiRegister.length, icon: 'ri-robot-line' },
  ];

  const blockers = [
    ...highPriority.map((t) => `Review: ${t.title}`),
    ...(openBreaches.length ? [`${openBreaches.length} open breach case(s)`] : []),
    ...(approvedDpias.length === 0 ? ['No DPIA has reached approved status'] : []),
    ...(notApprovedAi.length ? [`${notApprovedAi.length} automation systems not approved`] : []),
    ...(publishedPolicies.length === 0 ? ['No legal document has been published'] : []),
    ...(legalReviewActivities.length ? [`${legalReviewActivities.length} processing activities awaiting legal review`] : []),
  ];

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-4">
        {stats.map((s) => (
          <Card key={s.label} className="p-4">
            <div className="w-8 h-8 rounded-lg bg-indigo-500/15 flex items-center justify-center mb-3">
              <div className="w-4 h-4 flex items-center justify-center">
                <i className={`${s.icon} text-indigo-400 text-sm`}></i>
              </div>
            </div>
            <p className="text-2xl font-bold text-white">{s.value}</p>
            <p className="text-xs text-gray-500 mt-1">{s.label}</p>
          </Card>
        ))}
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <Card>
          <div className="px-5 py-4 border-b border-gray-800">
            <h3 className="text-sm font-semibold text-white">Legal review required</h3>
            <p className="text-xs text-gray-500 mt-0.5">Items that must be resolved by a solicitor, DPO or regulator before production publication.</p>
          </div>
          <div className="p-5">
            {blockers.length === 0 ? (
              <p className="text-sm text-gray-500">No outstanding review items.</p>
            ) : (
              <ul className="space-y-2.5">
                {blockers.map((b, i) => (
                  <li key={i} className="flex items-start gap-2.5 text-sm text-gray-300">
                    <div className="w-4 h-4 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <i className="ri-alert-line text-amber-400"></i>
                    </div>
                    <span>{b}</span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </Card>

        <Card>
          <div className="px-5 py-4 border-b border-gray-800">
            <h3 className="text-sm font-semibold text-white">Compliance frameworks</h3>
            <p className="text-xs text-gray-500 mt-0.5">Mapping requires legal confirmation.</p>
          </div>
          <div className="divide-y divide-gray-800/60">
            {frameworks.map((f) => (
              <div key={f.id} className="px-5 py-3 flex items-center justify-between gap-4">
                <div className="min-w-0">
                  <p className="text-sm text-white truncate">{f.name}</p>
                  <p className="text-xs text-gray-500 truncate">{f.description}</p>
                </div>
                <Pill value={f.status} />
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}