'use client';

import { ReleaseState, ReleaseVersion, ReleaseDefect, ReleaseApproval, ReleaseAgent } from '@/lib/useReleaseControl';
import { Badge, Dot, PanelCard, StatCard, severityTone, Tone } from './ui';

const CATEGORY_LABELS: Record<string, string> = {
  security: 'Security',
  core_operations: 'Core operations',
  tenant_isolation: 'Tenant isolation',
  guard_safety: 'Guard safety & SOS',
  payments: 'Payments & entitlements',
  reliability: 'Reliability & recovery',
  ux: 'UX & accessibility',
};

const WEIGHTS: Record<string, number> = {
  security: 25,
  core_operations: 20,
  tenant_isolation: 15,
  guard_safety: 15,
  payments: 10,
  reliability: 10,
  ux: 5,
};

function recTone(rec: string): Tone {
  if (rec === 'GO') return 'green';
  if (rec === 'CONDITIONAL GO') return 'amber';
  return 'red';
}

export default function OverviewPanel({
  version,
  state,
  defects,
  approvals,
  canApprove,
  onRecordDecision,
}: {
  version: ReleaseVersion | null;
  state: ReleaseState;
  defects: ReleaseDefect[];
  approvals: ReleaseApproval[];
  agents: ReleaseAgent[];
  canApprove: boolean;
  onRecordDecision: (decision: string, conditions: string) => void;
}) {
  const openBySeverity = { critical: 0, high: 0, medium: 0, low: 0 };
  defects.forEach((d) => {
    if (['open', 'investigating', 'in_progress', 'ready_for_retest'].includes(d.status)) {
      openBySeverity[d.severity as keyof typeof openBySeverity] = (openBySeverity[d.severity as keyof typeof openBySeverity] || 0) + 1;
    }
  });

  const blockers = state.noGoConditions.filter((c) => c.triggered);
  const approvedCount = approvals.filter((a) => a.decision === 'approved').length;

  const decisionBlocked = blockers.length > 0;

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <StatCard label="Open critical" value={openBySeverity.critical} tone={openBySeverity.critical > 0 ? 'red' : 'grey'} />
        <StatCard label="Open high" value={openBySeverity.high} tone={openBySeverity.high > 0 ? 'amber' : 'grey'} />
        <StatCard label="Open medium/low" value={openBySeverity.medium + openBySeverity.low} tone="indigo" />
        <StatCard label="Approvals" value={`${approvedCount}/6`} tone={state.allApproved ? 'green' : 'grey'} />
      </div>

      <PanelCard title="Readiness score" subtitle="Weighted by release category. Transparent and recalculated live.">
        <div className="p-5 space-y-4">
          {Object.entries(CATEGORY_LABELS).map(([cat, label]) => {
            const s = state.categoryScores[cat];
            const weight = WEIGHTS[cat];
            const tone: Tone = s.score >= 100 ? 'green' : s.score >= 70 ? 'indigo' : s.score > 0 ? 'amber' : 'grey';
            return (
              <div key={cat}>
                <div className="flex items-center justify-between mb-1.5">
                  <div className="flex items-center gap-2">
                    <Dot tone={tone} />
                    <span className="text-sm text-gray-300">{label}</span>
                    <span className="text-[10px] text-gray-500">({weight}%)</span>
                  </div>
                  <span className="text-sm font-semibold text-white">{s.score}%</span>
                </div>
                <div className="h-1.5 bg-gray-800 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full ${s.score >= 100 ? 'bg-emerald-400' : s.score >= 70 ? 'bg-indigo-400' : s.score > 0 ? 'bg-amber-400' : 'bg-gray-700'}`}
                    style={{ width: `${Math.max(s.score, 2)}%` }}
                  />
                </div>
                <div className="text-[10px] text-gray-500 mt-0.5">{s.passed} passed of {s.total} run</div>
              </div>
            );
          })}
        </div>
      </PanelCard>

      <PanelCard
        title="Automatic NO-GO conditions"
        subtitle={blockers.length > 0 ? `${blockers.length} blocking condition(s) active` : 'No critical blockers detected'}
        right={blockers.length > 0 ? <Badge tone="red">Blocked</Badge> : <Badge tone="green">Clear</Badge>}
      >
        <div className="divide-y divide-gray-800">
          {state.noGoConditions.map((c) => (
            <div key={c.key} className="px-5 py-3 flex items-start gap-3">
              <div className="mt-0.5"><Dot tone={c.triggered ? 'red' : 'green'} /></div>
              <div className="min-w-0">
                <div className={`text-sm ${c.triggered ? 'text-red-300 font-medium' : 'text-gray-300'}`}>{c.label}</div>
                <div className="text-xs text-gray-500">{c.detail}</div>
              </div>
            </div>
          ))}
        </div>
      </PanelCard>

      <PanelCard title="Record final decision" subtitle="Only authorised release approvers may record a decision">
        <div className="p-5">
          <div className="flex items-center gap-3 mb-4">
            <Badge tone={recTone(state.recommendation)}>{state.recommendation}</Badge>
            <span className="text-xs text-gray-500">
              {decisionBlocked
                ? 'GO and CONDITIONAL GO are disabled while critical blockers are active.'
                : 'Recommendation based on current test, defect and approval data.'}
            </span>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              disabled={!canApprove || decisionBlocked}
              onClick={() => onRecordDecision('go', '')}
              className="px-4 py-2 rounded-lg text-sm font-medium bg-emerald-600/15 text-emerald-300 border border-emerald-600/30 hover:bg-emerald-600/25 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer whitespace-nowrap"
            >
              Record GO
            </button>
            <button
              disabled={!canApprove || decisionBlocked}
              onClick={() => onRecordDecision('conditional_go', '')}
              className="px-4 py-2 rounded-lg text-sm font-medium bg-amber-600/15 text-amber-300 border border-amber-600/30 hover:bg-amber-600/25 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer whitespace-nowrap"
            >
              Record CONDITIONAL GO
            </button>
            <button
              disabled={!canApprove}
              onClick={() => onRecordDecision('no_go', '')}
              className="px-4 py-2 rounded-lg text-sm font-medium bg-red-600/15 text-red-300 border border-red-600/30 hover:bg-red-600/25 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer whitespace-nowrap"
            >
              Record NO-GO
            </button>
          </div>
          {!canApprove && <p className="text-xs text-gray-500 mt-3">You do not have release approval permission.</p>}
        </div>
      </PanelCard>
    </div>
  );
}