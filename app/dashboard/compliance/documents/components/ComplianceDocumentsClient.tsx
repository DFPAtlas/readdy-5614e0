'use client';

import { useState } from 'react';
import { useComplianceDocuments } from '@/lib/useComplianceDocuments';
import SummaryCards from './SummaryCards';
import DocumentFilters from './DocumentFilters';
import DocumentsTable from './DocumentsTable';
import UploadReviewModal from './UploadReviewModal';
import LoadingState from './LoadingState';
import EmptyState from './EmptyState';

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

  const [search, setSearch] = useState('');
  const [entityFilter, setEntityFilter] = useState<'all' | 'guard' | 'site' | 'client' | 'company'>('all');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<'all' | 'expired' | 'expiring_7d' | 'expiring_30d' | 'active' | 'missing' | 'awaiting_review'>('all');
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [showExportModal, setShowExportModal] = useState(false);

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

      <SummaryCards summary={summary} />

      {allEmpty ? (
        <EmptyState onUpload={() => setShowUploadModal(true)} />
      ) : (
        <>
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
  );
}