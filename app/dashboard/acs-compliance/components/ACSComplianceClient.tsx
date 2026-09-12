'use client';

import { useState } from 'react';
import { useACSCompliance } from '@/lib/useACSCompliance';
import { useEntitlements } from '@/lib/useEntitlements';
import { getACSEntitlements, isACSTierSufficient } from '@/lib/entitlements';
import ComplianceScoreRing from './ComplianceScoreRing';
import AreaBreakdown from './AreaBreakdown';
import CriticalIssuesPanel from './CriticalIssuesPanel';
import GovernancePanel from './GovernancePanel';
import PersonnelCompliancePanel from './PersonnelCompliancePanel';
import SiteCompliancePanel from './SiteCompliancePanel';
import HealthSafetyPanel from './HealthSafetyPanel';
import CustomerServicePanel from './CustomerServicePanel';
import AIAuditorPanel from './AIAuditorPanel';
import ActionCentre from './ActionCentre';
import AuditWizard from './AuditWizard';
import ACSReadinessScoreCard from './ACSReadinessScoreCard';
import ACSCategoryScoreGrid from './ACSCategoryScoreGrid';
import ACSCriticalFindings from './ACSCriticalFindings';
import ACSRecentAuditRuns from './ACSRecentAuditRuns';
import ACSActionCentrePreview from './ACSActionCentrePreview';
import ACSEvidencePackPreview from './ACSEvidencePackPreview';

const TABS = [
  { key: 'overview', label: 'Overview', icon: 'ri-dashboard-3-line', minTier: 'basic-checklist' as const },
  { key: 'governance', label: 'Governance', icon: 'ri-government-line', minTier: 'document-tracking' as const },
  { key: 'personnel', label: 'Personnel', icon: 'ri-user-settings-line', minTier: 'document-tracking' as const },
  { key: 'sites', label: 'Sites', icon: 'ri-building-3-line', minTier: 'document-tracking' as const },
  { key: 'hns', label: 'H&S', icon: 'ri-heart-pulse-line', minTier: 'document-tracking' as const },
  { key: 'customer', label: 'Customer', icon: 'ri-customer-service-2-line', minTier: 'document-tracking' as const },
  { key: 'ai-audit', label: 'AI Audit', icon: 'ri-sparkling-line', minTier: 'titan-audit' as const },
  { key: 'actions', label: 'Actions', icon: 'ri-alert-line', minTier: 'full-acs' as const },
  { key: 'wizard', label: 'Wizard', icon: 'ri-list-check', minTier: 'full-acs' as const },
];

export default function ACSComplianceClient() {
  const [activeTab, setActiveTab] = useState('overview');
  const {
    overallScore, areaScores, auditFindings, guardProfiles,
    governanceItems, siteComplianceItems, healthSafetyItems,
    customerServiceItems, auditRuns, loading, error,
    aiLoading, aiResult, refetch, runAIAudit,
    generateEvidencePack, packLoading, evidencePacks,
  } = useACSCompliance();
  const { currentPlanSlug } = useEntitlements();
  const acsEntitlements = getACSEntitlements(currentPlanSlug);

  const status = overallScore >= 85 ? 'green' : overallScore >= 60 ? 'amber' : 'red';

  const criticalFindings = auditFindings.filter((f) => f.severity === 'critical');
  const highFindings = auditFindings.filter((f) => f.severity === 'high');
  const openFindings = auditFindings.filter((f) => f.status === 'open');

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-white">ACS Compliance Centre</h1>
            <p className="text-sm text-gray-500 mt-1">SIA Approved Contractor Scheme readiness</p>
          </div>
        </div>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-amber-500"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white">ACS Compliance Centre</h1>
          <p className="text-sm text-gray-500 mt-1">Monitor and manage SIA ACS assessment readiness</p>
        </div>
        <div className="flex items-center gap-3">
          {acsEntitlements.hasAIAuditor && (
            <button
              onClick={() => runAIAudit()}
              disabled={aiLoading}
              className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-medium rounded-lg transition-colors cursor-pointer whitespace-nowrap disabled:opacity-50"
            >
              <div className={`w-4 h-4 flex items-center justify-center ${aiLoading ? 'animate-spin' : ''}`}>
                <i className={aiLoading ? 'ri-loader-4-line' : 'ri-sparkling-line'}></i>
              </div>
              {aiLoading ? 'Running AI Audit...' : 'Run AI Audit'}
            </button>
          )}
          <button
            onClick={refetch}
            className="w-9 h-9 flex items-center justify-center rounded-lg bg-white/5 border border-white/10 text-gray-400 hover:text-white hover:bg-white/8 transition-all cursor-pointer"
          >
            <div className="w-4 h-4 flex items-center justify-center">
              <i className="ri-refresh-line"></i>
            </div>
          </button>
        </div>
      </div>

      {error && (
        <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-4 text-red-400 text-sm">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 flex items-center justify-center">
              <i className="ri-error-warning-line"></i>
            </div>
            {error}
          </div>
        </div>
      )}

      <div className="flex items-center gap-0.5 overflow-x-auto pb-1 bg-[#0f172a]/50 border border-white/10 rounded-xl p-1">
        {TABS.map((tab) => {
          const isLocked = !isACSTierSufficient(acsEntitlements.tier, tab.minTier);
          if (isLocked) {
            return (
              <button
                key={tab.key}
                disabled
                title={`${tab.label} requires ${tab.minTier === 'titan-audit' ? 'Titan' : tab.minTier === 'full-acs' ? 'Command' : 'Sentinel'} plan`}
                className="flex-shrink-0 px-3 py-2 rounded-lg text-sm font-medium transition-colors whitespace-nowrap flex items-center gap-1.5 opacity-30 cursor-not-allowed text-gray-500"
              >
                <div className="w-4 h-4 flex items-center justify-center">
                  <i className={tab.icon}></i>
                </div>
                {tab.label}
                <span className="w-3 h-3 flex items-center justify-center text-amber-500/50">
                  <i className="ri-lock-line text-[9px]"></i>
                </span>
              </button>
            );
          }
          return (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`flex-shrink-0 px-3 py-2 rounded-lg text-sm font-medium transition-colors cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
                activeTab === tab.key
                  ? 'bg-amber-500/15 text-amber-400 border border-amber-500/20'
                  : 'text-gray-400 hover:text-white hover:bg-white/5'
              }`}
            >
              <div className="w-4 h-4 flex items-center justify-center">
                <i className={tab.icon}></i>
              </div>
              {tab.label}
            </button>
          );
        })}
      </div>

      {activeTab === 'overview' && (
        <div className="space-y-6">
          <div className="grid lg:grid-cols-3 gap-6">
            <div className="lg:col-span-1">
              <ComplianceScoreRing score={overallScore} status={status} />
            </div>
            <div className="lg:col-span-2">
              <AreaBreakdown areaScores={areaScores} />
            </div>
          </div>

          <div className="grid lg:grid-cols-3 gap-6">
            <CriticalIssuesPanel
              criticalFindings={criticalFindings}
              highFindings={highFindings}
              openFindings={openFindings}
            />
            <ACSRecentAuditRuns auditRuns={auditRuns} />
            <div className="space-y-4">
              <ACSReadinessScoreCard score={overallScore} status={status} />
              <div className="grid grid-cols-2 gap-2">
                <button onClick={() => setActiveTab('governance')} className="flex items-center gap-2 p-2.5 bg-white/5 rounded-lg hover:bg-white/8 transition-colors cursor-pointer text-sm text-gray-300">
                  <div className="w-4 h-4 flex items-center justify-center text-amber-400"><i className="ri-government-line"></i></div>
                  Governance
                </button>
                <button onClick={() => setActiveTab('personnel')} className="flex items-center gap-2 p-2.5 bg-white/5 rounded-lg hover:bg-white/8 transition-colors cursor-pointer text-sm text-gray-300">
                  <div className="w-4 h-4 flex items-center justify-center text-blue-400"><i className="ri-user-settings-line"></i></div>
                  Personnel
                </button>
                <button onClick={() => setActiveTab('sites')} className="flex items-center gap-2 p-2.5 bg-white/5 rounded-lg hover:bg-white/8 transition-colors cursor-pointer text-sm text-gray-300">
                  <div className="w-4 h-4 flex items-center justify-center text-emerald-400"><i className="ri-building-3-line"></i></div>
                  Sites
                </button>
                <button onClick={() => setActiveTab('hns')} className="flex items-center gap-2 p-2.5 bg-white/5 rounded-lg hover:bg-white/8 transition-colors cursor-pointer text-sm text-gray-300">
                  <div className="w-4 h-4 flex items-center justify-center text-red-400"><i className="ri-heart-pulse-line"></i></div>
                  H&S
                </button>
                <button onClick={() => setActiveTab('customer')} className="flex items-center gap-2 p-2.5 bg-white/5 rounded-lg hover:bg-white/8 transition-colors cursor-pointer text-sm text-gray-300">
                  <div className="w-4 h-4 flex items-center justify-center text-purple-400"><i className="ri-customer-service-2-line"></i></div>
                  Customer
                </button>
                <button onClick={() => setActiveTab('wizard')} className="flex items-center gap-2 p-2.5 bg-white/5 rounded-lg hover:bg-white/8 transition-colors cursor-pointer text-sm text-gray-300">
                  <div className="w-4 h-4 flex items-center justify-center text-amber-400"><i className="ri-list-check"></i></div>
                  Audit Wizard
                </button>
              </div>
            </div>
          </div>

          <div className="grid lg:grid-cols-2 gap-6">
            <ACSActionCentrePreview findings={auditFindings} />
            <ACSCategoryScoreGrid areaScores={areaScores} />
          </div>

          <div className="grid lg:grid-cols-2 gap-6">
            <ACSCriticalFindings findings={auditFindings} />
            <ACSEvidencePackPreview
              hasAccess={acsEntitlements.hasEvidencePacks}
              loading={packLoading}
              lastGeneratedAt={evidencePacks[0]?.generated_at || null}
              packCount={evidencePacks.length}
              onGenerate={generateEvidencePack}
            />
          </div>
        </div>
      )}

      {activeTab === 'governance' && (
        <GovernancePanel items={governanceItems} onRefresh={refetch} />
      )}

      {activeTab === 'personnel' && (
        <PersonnelCompliancePanel profiles={guardProfiles} />
      )}

      {activeTab === 'sites' && (
        <SiteCompliancePanel items={siteComplianceItems} />
      )}

      {activeTab === 'hns' && (
        <HealthSafetyPanel items={healthSafetyItems} />
      )}

      {activeTab === 'customer' && (
        <CustomerServicePanel items={customerServiceItems} />
      )}

      {activeTab === 'ai-audit' && (
        <AIAuditorPanel
          aiResult={aiResult}
          aiLoading={aiLoading}
          onRunAudit={runAIAudit}
          auditRuns={auditRuns}
          findings={auditFindings}
        />
      )}

      {activeTab === 'actions' && (
        <ActionCentre findings={auditFindings} onRefresh={refetch} />
      )}

      {activeTab === 'wizard' && (
        <AuditWizard
          governanceItems={governanceItems}
          guardProfiles={guardProfiles}
          siteComplianceItems={siteComplianceItems}
          healthSafetyItems={healthSafetyItems}
          customerServiceItems={customerServiceItems}
          onRefresh={refetch}
        />
      )}
    </div>
  );
}