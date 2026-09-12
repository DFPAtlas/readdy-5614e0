'use client';

import { useState } from 'react';
import { useAuth } from '@/lib/auth';
import { usePlatformAccess } from '@/lib/usePlatformAccess';
import { useReleaseControl } from '@/lib/useReleaseControl';
import OverviewPanel from './components/OverviewPanel';
import TestExecutionPanel from './components/TestExecutionPanel';
import DefectsPanel from './components/DefectsPanel';
import ApprovalsPanel from './components/ApprovalsPanel';
import AgentReadinessPanel from './components/AgentReadinessPanel';
import LaunchChecklistPanel from './components/LaunchChecklistPanel';
import DeploymentPanel from './components/DeploymentPanel';
import PostLaunchWatchPanel from './components/PostLaunchWatchPanel';
import AuditLogPanel from './components/AuditLogPanel';
import { Badge, Tone } from './components/ui';

const TABS = [
  { key: 'overview', label: 'Overview' },
  { key: 'tests', label: 'Test Execution' },
  { key: 'defects', label: 'Defects' },
  { key: 'approvals', label: 'Approvals' },
  { key: 'agents', label: 'Agents' },
  { key: 'checklist', label: 'Launch Checklist' },
  { key: 'deployment', label: 'Deployment' },
  { key: 'postlaunch', label: 'Post-Launch' },
  { key: 'audit', label: 'Audit Log' },
];

function recTone(rec: string): Tone {
  if (rec === 'GO') return 'green';
  if (rec === 'CONDITIONAL GO') return 'amber';
  return 'red';
}

function statusTone(status: string): Tone {
  if (['approved', 'released'].includes(status)) return 'green';
  if (['blocked', 'rolled_back', 'cancelled'].includes(status)) return 'red';
  if (['awaiting_approval', 'deploying'].includes(status)) return 'amber';
  return 'grey';
}

export default function ReleaseControlPage() {
  const { profile } = useAuth();
  const { can } = usePlatformAccess(profile?.id || null);
  const rc = useReleaseControl();

  const [tab, setTab] = useState('overview');

  const isSuperAdmin = profile?.role === 'super_admin';
  const canApprove = isSuperAdmin || can('release_control', 'approve');
  const canEdit = isSuperAdmin || can('release_control', 'create');

  const { state, version } = rc;

  const rec = state.recommendation;
  const recColor = rec === 'GO' ? '#34d399' : rec === 'CONDITIONAL GO' ? '#fbbf24' : '#f87171';

  return (
    <div className="p-4 lg:p-6 max-w-7xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-white">Release Control</h1>
        <p className="text-sm text-gray-500 mt-0.5">Go/No-Go decision centre for GuardianHub production releases</p>
      </div>

      {rc.loading ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="bg-[#111827] border border-gray-800 rounded-xl p-6 animate-pulse">
              <div className="h-4 bg-gray-800/60 rounded w-1/3 mb-4" />
              <div className="h-8 bg-gray-800/40 rounded w-1/2" />
            </div>
          ))}
        </div>
      ) : (
        <>
          <div className="bg-[#111827] border border-gray-800 rounded-xl p-6 mb-6">
            <div className="flex flex-col lg:flex-row lg:items-center gap-6">
              <div className="relative w-28 h-28 rounded-full flex-shrink-0" style={{ background: `conic-gradient(${recColor} ${state.readiness}%, #1f2937 ${state.readiness}%)` }}>
                <div className="absolute inset-2 rounded-full bg-[#111827] flex flex-col items-center justify-center">
                  <span className="text-2xl font-bold text-white">{state.readiness}%</span>
                  <span className="text-[9px] text-gray-500 uppercase">readiness</span>
                </div>
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex flex-wrap items-center gap-2 mb-2">
                  <Badge tone={recTone(rec)}>{rec}</Badge>
                  {version && <Badge tone={statusTone(version.status)}>{version.status.replace(/_/g, ' ')}</Badge>}
                  <Badge tone="grey">{version?.environment || 'staging'}</Badge>
                </div>
                <div className="text-lg font-semibold text-white">
                  {version ? `Release ${version.version}` : 'No release version'}
                </div>
                {version?.release_notes && <p className="text-sm text-gray-500 mt-1">{version.release_notes}</p>}
                {version?.target_release_date && (
                  <p className="text-xs text-gray-500 mt-1">Target: {new Date(version.target_release_date).toLocaleDateString('en-GB')}</p>
                )}
              </div>

              <div className="grid grid-cols-3 gap-3 flex-shrink-0">
                <div className="text-center">
                  <div className="text-2xl font-bold text-white">{rc.suites.length}</div>
                  <div className="text-[10px] text-gray-500 uppercase">Suites</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-white">{rc.cases.length}</div>
                  <div className="text-[10px] text-gray-500 uppercase">Cases</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-white">{rc.defects.filter((d) => ['open', 'investigating', 'in_progress', 'ready_for_retest'].includes(d.status)).length}</div>
                  <div className="text-[10px] text-gray-500 uppercase">Defects</div>
                </div>
              </div>
            </div>
          </div>

          <div className="flex flex-wrap gap-1.5 mb-5">
            {TABS.map((t) => (
              <button
                key={t.key}
                onClick={() => setTab(t.key)}
                className={`px-3.5 py-2 rounded-lg text-sm font-medium border cursor-pointer whitespace-nowrap ${tab === t.key ? 'bg-indigo-600/20 text-indigo-300 border-indigo-500/40' : 'text-gray-400 border-gray-700 hover:text-white'}`}
              >
                {t.label}
              </button>
            ))}
          </div>

          {tab === 'overview' && (
            <OverviewPanel
              version={version}
              state={state}
              defects={rc.defects}
              approvals={rc.approvals}
              agents={rc.agents}
              canApprove={canApprove}
              onRecordDecision={(decision, conditions) => rc.recordDecision(decision, conditions, { blockers: state.noGoConditions.filter((c) => c.triggered).map((c) => c.label) }, profile?.id || '')}
            />
          )}
          {tab === 'tests' && (
            <TestExecutionPanel suites={rc.suites} cases={rc.cases} latestResults={state.latestResults} recordResult={rc.recordResult} canEdit={canEdit} />
          )}
          {tab === 'defects' && (
            <DefectsPanel defects={rc.defects} createDefect={rc.createDefect} updateDefect={rc.updateDefect} canEdit={canEdit} />
          )}
          {tab === 'approvals' && (
            <ApprovalsPanel approvals={rc.approvals} recordApproval={rc.recordApproval} canApprove={canApprove} approverId={profile?.id || ''} />
          )}
          {tab === 'agents' && (
            <AgentReadinessPanel agents={rc.agents} updateAgent={rc.updateAgent} canEdit={canEdit} />
          )}
          {tab === 'checklist' && (
            <LaunchChecklistPanel checklists={rc.checklists} items={rc.checklistItems} updateChecklistItem={rc.updateChecklistItem} canEdit={canEdit} />
          )}
          {tab === 'deployment' && (
            <DeploymentPanel deployments={rc.deployments} rollbacks={rc.rollbacks} recordDeployment={rc.recordDeployment} recordRollback={rc.recordRollback} canEdit={canEdit} />
          )}
          {tab === 'postlaunch' && (
            <PostLaunchWatchPanel metrics={rc.launchMetrics} updateMetric={rc.updateMetric} canEdit={canEdit} />
          )}
          {tab === 'audit' && <AuditLogPanel auditEvents={rc.auditEvents} />}
        </>
      )}
    </div>
  );
}