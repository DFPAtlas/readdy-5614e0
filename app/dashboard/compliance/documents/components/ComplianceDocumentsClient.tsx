'use client';

import { useState, useEffect, useCallback } from 'react';
import { useComplianceDocuments } from '@/lib/useComplianceDocuments';
import { useAuth } from '@/lib/auth';
import { callAgent, logWebhookEvent } from '@/lib/guardianhubAgents';
import AgentStatusBar from '@/components/AgentStatusBar';
import WidgetBoundary from '@/components/dashboard/WidgetBoundary';
import SummaryCards from './SummaryCards';
import DocumentFilters from './DocumentFilters';
import DocumentsTable from './DocumentsTable';
import UploadReviewModal from './UploadReviewModal';
import LoadingState from './LoadingState';
import EmptyState from './EmptyState';
import { FeatureGate } from '@/lib/useEntitlements';
import TrainingOverduePanel from './TrainingOverduePanel';
import PolicyReviewPanel from './PolicyReviewPanel';

export default function ComplianceDocumentsClient() {
  const {
    complianceDocs,
    guardCerts,
    guardVetting,
    acsEvidence,
    clientDocs,
    summary,
    loading,
    error,
    refetch,
  } = useComplianceDocuments();

  const { profile, companyId } = useAuth();

  const [search, setSearch] = useState('');
  const [entityFilter, setEntityFilter] = useState<'all' | 'guard' | 'site' | 'client' | 'company'>('all');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<'all' | 'expired' | 'expiring_7d' | 'expiring_30d' | 'active' | 'missing' | 'awaiting_review'>('all');
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [showExportModal, setShowExportModal] = useState(false);

  const [agentLoading, setAgentLoading] = useState(false);
  const [agentError, setAgentError] = useState<string | null>(null);
  const [agentData, setAgentData] = useState<any>(null);

  const fetchAgent = useCallback(async () => {
    if (!profile?.id || !companyId) return;
    setAgentLoading(true);
    setAgentError(null);
    try {
      const result = await callAgent(
        'compliance',
        {
          expired: summary?.expired || 0,
          expiring_soon: summary?.expiring7Days || 0,
          total_docs: summary?.total || 0,
        },
        {
          clientId: companyId,
          userId: profile.id,
          requestedPage: '/dashboard/compliance/documents',
          requestedFeature: 'compliance',
        }
      );
      if (result.error) setAgentError(result.error);
      setAgentData(result.data);
      if (summary?.expired > 0) {
        logWebhookEvent('compliance', 'compliance_warning', {
          expired_count: summary.expired,
          expiring_soon: summary.expiring7Days,
        }, companyId);
      }
    } catch (err: any) {
      setAgentError(err.message || 'Agent call failed');
    } finally {
      setAgentLoading(false);
    }
  }, [profile?.id, companyId, summary?.expired, summary?.expiring7Days, summary?.total]);

  useEffect(() => {
    if (profile?.id && !loading) fetchAgent();
  }, [profile?.id, loading]);

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-white">Document Expiry Centre</h1>
        </div>
        <LoadingState />
      </div>
    );
  }

  const allEmpty =
    complianceDocs.length === 0 &&
    guardCerts.length === 0 &&
    guardVetting.length === 0 &&
    acsEvidence.length === 0 &&
    clientDocs.length === 0;

  return (
    <FeatureGate feature="hasCompliance">
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white">Document Expiry Centre</h1>
          <p className="text-sm text-gray-500 mt-1">Track compliance documents and expiry dates across your organisation.</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowExportModal(true)}
            className="flex items-center gap-2 px-3 py-2 rounded-lg bg-gray-800/60 border border-gray-700 text-sm text-gray-300 hover:text-white hover:bg-gray-700/60 transition-all cursor-pointer whitespace-nowrap"
          >
            <div className="w-4 h-4 flex items-center justify-center">
              <i className="ri-download-line text-sm"></i>
            </div>
            Export
          </button>
          <button
            onClick={() => setShowUploadModal(true)}
            className="flex items-center gap-2 px-3 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 border border-blue-500 text-sm text-white transition-all cursor-pointer whitespace-nowrap"
          >
            <div className="w-4 h-4 flex items-center justify-center">
              <i className="ri-upload-cloud-line text-sm"></i>
            </div>
            Upload Document
          </button>
          <button
            onClick={refetch}
            className="w-9 h-9 flex items-center justify-center rounded-lg bg-gray-800/60 border border-gray-700 text-gray-400 hover:text-white hover:bg-gray-700/60 transition-all cursor-pointer"
          >
            <div className="w-4 h-4 flex items-center justify-center">
              <i className="ri-refresh-line text-sm"></i>
            </div>
          </button>
        </div>
      </div>

      <WidgetBoundary widgetName="ComplianceAgent" pagePath="/dashboard/compliance/documents" clientId={companyId || undefined} userId={profile?.id || undefined}>
        <AgentStatusBar
          agentKey="compliance"
          loading={agentLoading}
          error={agentError}
          data={agentData}
          onRetry={fetchAgent}
        />
      </WidgetBoundary>

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

      <WidgetBoundary widgetName="ComplianceSummaryCards" pagePath="/dashboard/compliance/documents" clientId={companyId || undefined} userId={profile?.id || undefined}>
        <SummaryCards summary={summary} />
      </WidgetBoundary>

      <div className="grid lg:grid-cols-2 gap-6">
        <WidgetBoundary widgetName="PolicyReviewPanel" pagePath="/dashboard/compliance/documents" clientId={companyId || undefined} userId={profile?.id || undefined}>
          <PolicyReviewPanel />
        </WidgetBoundary>
        <WidgetBoundary widgetName="TrainingOverduePanel" pagePath="/dashboard/compliance/documents" clientId={companyId || undefined} userId={profile?.id || undefined}>
          <TrainingOverduePanel />
        </WidgetBoundary>
      </div>

      {allEmpty ? (
        <EmptyState onUpload={() => setShowUploadModal(true)} />
      ) : (
        <>
          <WidgetBoundary widgetName="DocumentFilters" pagePath="/dashboard/compliance/documents" clientId={companyId || undefined} userId={profile?.id || undefined}>
            <DocumentFilters
              search={search}
              onSearchChange={setSearch}
              entityFilter={entityFilter}
              onEntityChange={setEntityFilter}
              typeFilter={typeFilter}
              onTypeChange={setTypeFilter}
              statusFilter={statusFilter}
              onStatusChange={setStatusFilter}
            />
          </WidgetBoundary>
          <WidgetBoundary widgetName="DocumentsTable" pagePath="/dashboard/compliance/documents" clientId={companyId || undefined} userId={profile?.id || undefined}>
            <DocumentsTable
              complianceDocs={complianceDocs}
              guardCerts={guardCerts}
              guardVetting={guardVetting}
              acsEvidence={acsEvidence}
              clientDocs={clientDocs}
              search={search}
              entityFilter={entityFilter}
              typeFilter={typeFilter}
              statusFilter={statusFilter}
              onRefresh={refetch}
            />
          </WidgetBoundary>
        </>
      )}

      {showUploadModal && (
        <UploadReviewModal
          mode="upload"
          onClose={() => setShowUploadModal(false)}
          onRefresh={refetch}
        />
      )}
      {showExportModal && (
        <UploadReviewModal
          mode="export"
          onClose={() => setShowExportModal(false)}
          onRefresh={refetch}
        />
      )}
    </div>
    </FeatureGate>
  );
}