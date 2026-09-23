'use client';

import { useState } from 'react';
import Link from 'next/link';
import type { ComplianceDoc, GuardCert, GuardVetting, ACSEvidence, ClientDoc } from '@/lib/useComplianceDocuments';
import { getDaysUntilExpiry, getDocStatus } from '@/lib/useComplianceDocuments';
import { supabase } from '@/lib/supabase';

interface UnifiedDoc {
  id: string;
  source: string;
  entityType: string;
  entityName: string;
  entityId: string;
  documentType: string;
  documentTitle: string;
  fileUrl?: string | null;
  fileName?: string | null;
  expiryDate?: string | null;
  issueDate?: string | null;
  status: string;
  reviewStatus: string;
  rejectionReason?: string | null;
  reviewedAt?: string | null;
  createdAt: string;
}

interface DocumentsTableProps {
  complianceDocs: ComplianceDoc[];
  guardCerts: GuardCert[];
  guardVetting: GuardVetting[];
  acsEvidence: ACSEvidence[];
  clientDocs: ClientDoc[];
  search: string;
  entityFilter: string;
  typeFilter: string;
  statusFilter: string;
  onRefresh: () => void;
}

const statusBadge: Record<string, { label: string; color: string; bg: string }> = {
  active: { label: 'Valid', color: 'text-emerald-400', bg: 'bg-emerald-500/10' },
  expiring_7d: { label: '7 Days', color: 'text-amber-400', bg: 'bg-amber-500/10' },
  expiring_30d: { label: '30 Days', color: 'text-orange-400', bg: 'bg-orange-500/10' },
  expired: { label: 'Expired', color: 'text-red-400', bg: 'bg-red-500/10' },
  missing: { label: 'Missing', color: 'text-gray-400', bg: 'bg-gray-500/10' },
  rejected: { label: 'Rejected', color: 'text-rose-400', bg: 'bg-rose-500/10' },
  awaiting_review: { label: 'Awaiting', color: 'text-blue-400', bg: 'bg-blue-500/10' },
};

const docTypeLabel: Record<string, string> = {
  sia_licence: 'SIA Licence',
  right_to_work: 'Right to Work',
  first_aid: 'First Aid',
  training_certificate: 'Training Certificate',
  insurance: 'Insurance',
  site_assignment: 'Site Assignment',
  acs_evidence: 'ACS Evidence',
  risk_assessment: 'Risk Assessment',
  assignment_instructions: 'Assignment Instructions',
  health_safety: 'Health & Safety',
};

function buildUnifiedDocs(props: DocumentsTableProps): UnifiedDoc[] {
  const { complianceDocs, guardCerts, guardVetting, acsEvidence, clientDocs } = props;
  const docs: UnifiedDoc[] = [];

  complianceDocs.forEach((d) => {
    docs.push({
      id: d.id,
      source: 'compliance',
      entityType: d.entity_type,
      entityName: d.entity_name || 'Unknown',
      entityId: d.entity_id,
      documentType: d.document_type,
      documentTitle: d.document_title,
      fileUrl: d.file_url,
      fileName: d.file_name,
      expiryDate: d.expiry_date,
      issueDate: d.issue_date,
      status: getDocStatus(d.expiry_date, d.status),
      reviewStatus: d.review_status,
      rejectionReason: d.rejection_reason,
      reviewedAt: d.reviewed_at,
      createdAt: d.created_at,
    });
  });

  guardCerts.forEach((c) => {
    docs.push({
      id: `cert-${c.id}`,
      source: 'guard_cert',
      entityType: 'guard',
      entityName: c.guard_name || 'Unknown',
      entityId: c.guard_id,
      documentType: c.cert_type === 'sia' ? 'sia_licence' : 'training_certificate',
      documentTitle: c.cert_name,
      fileUrl: c.document_url,
      fileName: null,
      expiryDate: c.expiry_date,
      issueDate: c.issue_date,
      status: getDocStatus(c.expiry_date, c.status),
      reviewStatus: 'approved',
      createdAt: c.created_at,
    });
  });

  guardVetting.forEach((v) => {
    if (v.rtw_expiry || v.rtw_document_url) {
      docs.push({
        id: `rtw-${v.id}`,
        source: 'guard_vetting',
        entityType: 'guard',
        entityName: v.guard_name || 'Unknown',
        entityId: v.guard_id,
        documentType: 'right_to_work',
        documentTitle: 'Right to Work',
        fileUrl: v.rtw_document_url,
        fileName: null,
        expiryDate: v.rtw_expiry,
        issueDate: null,
        status: getDocStatus(v.rtw_expiry, v.vetting_status),
        reviewStatus: v.rtw_verified ? 'approved' : 'pending',
        createdAt: v.created_at,
      });
    }
    if (v.dbs_document_url) {
      docs.push({
        id: `dbs-${v.id}`,
        source: 'guard_vetting',
        entityType: 'guard',
        entityName: v.guard_name || 'Unknown',
        entityId: v.guard_id,
        documentType: 'training_certificate',
        documentTitle: 'DBS Check',
        fileUrl: v.dbs_document_url,
        fileName: null,
        expiryDate: v.vetting_expires_at,
        issueDate: v.dbs_issue_date,
        status: getDocStatus(v.vetting_expires_at, v.vetting_status),
        reviewStatus: v.dbs_verified_at ? 'approved' : 'pending',
        createdAt: v.created_at,
      });
    }
  });

  acsEvidence.forEach((e) => {
    docs.push({
      id: `acs-${e.id}`,
      source: 'acs',
      entityType: 'company',
      entityName: 'Company',
      entityId: e.company_id,
      documentType: 'acs_evidence',
      documentTitle: e.title,
      fileUrl: e.file_url,
      fileName: e.file_name,
      expiryDate: e.expiry_date,
      issueDate: null,
      status: getDocStatus(e.expiry_date, e.status),
      reviewStatus: e.status === 'approved' ? 'approved' : 'pending',
      createdAt: e.created_at,
    });
  });

  clientDocs.forEach((d) => {
    docs.push({
      id: `client-${d.id}`,
      source: 'client_doc',
      entityType: 'client',
      entityName: d.client_name || 'Unknown',
      entityId: d.client_id,
      documentType: d.document_category || 'site_assignment',
      documentTitle: d.file_name,
      fileUrl: d.storage_path,
      fileName: d.file_name,
      expiryDate: null,
      issueDate: d.upload_date,
      status: 'active',
      reviewStatus: 'approved',
      createdAt: d.created_at,
    });
  });

  return docs;
}

function filterDocs(docs: UnifiedDoc[], search: string, entityFilter: string, typeFilter: string, statusFilter: string): UnifiedDoc[] {
  return docs.filter((d) => {
    const matchesSearch = !search ||
      d.documentTitle.toLowerCase().includes(search.toLowerCase()) ||
      d.entityName.toLowerCase().includes(search.toLowerCase()) ||
      d.documentType.toLowerCase().includes(search.toLowerCase());

    const matchesEntity = entityFilter === 'all' || d.entityType === entityFilter;
    const matchesType = typeFilter === 'all' || d.documentType === typeFilter;
    const matchesStatus = statusFilter === 'all' || d.status === statusFilter || (statusFilter === 'awaiting_review' && d.reviewStatus === 'pending');

    return matchesSearch && matchesEntity && matchesType && matchesStatus;
  });
}

function formatDate(date: string | null | undefined): string {
  if (!date) return '—';
  return new Date(date).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
}

function daysRemainingText(date: string | null): string {
  const days = getDaysUntilExpiry(date);
  if (days === null) return '';
  if (days < 0) return `${Math.abs(days)}d overdue`;
  if (days === 0) return 'Today';
  return `${days}d left`;
}

export default function DocumentsTable(props: DocumentsTableProps) {
  const { search, entityFilter, typeFilter, statusFilter, onRefresh } = props;
  const [reviewDoc, setReviewDoc] = useState<UnifiedDoc | null>(null);
  const [reviewReason, setReviewReason] = useState('');
  const [reviewLoading, setReviewLoading] = useState(false);
  const [selectedRows, setSelectedRows] = useState<Set<string>>(new Set());

  const allDocs = buildUnifiedDocs(props);
  const filtered = filterDocs(allDocs, search, entityFilter, typeFilter, statusFilter);

  const handleApprove = async (doc: UnifiedDoc) => {
    if (doc.source === 'compliance') {
      setReviewLoading(true);
      await supabase.from('compliance_documents').update({
        review_status: 'approved',
        reviewed_at: new Date().toISOString(),
        status: 'active',
      }).eq('id', doc.id);
      setReviewLoading(false);
      onRefresh();
    }
    setReviewDoc(null);
  };

  const handleReject = async (doc: UnifiedDoc) => {
    if (doc.source === 'compliance') {
      setReviewLoading(true);
      await supabase.from('compliance_documents').update({
        review_status: 'rejected',
        reviewed_at: new Date().toISOString(),
        rejection_reason: reviewReason,
        status: 'rejected',
      }).eq('id', doc.id);
      setReviewLoading(false);
      onRefresh();
    }
    setReviewDoc(null);
    setReviewReason('');
  };

  const toggleSelect = (id: string) => {
    const next = new Set(selectedRows);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    setSelectedRows(next);
  };

  const toggleSelectAll = () => {
    if (selectedRows.size === filtered.length) {
      setSelectedRows(new Set());
    } else {
      setSelectedRows(new Set(filtered.map((d) => d.id)));
    }
  };

  const handleBulkExport = () => {
    const selected = filtered.filter((d) => selectedRows.has(d.id));
    const csv = [
      'Document,Entity,Type,Status,Expiry Date,Review Status',
      ...selected.map((d) =>
        `"${d.documentTitle}","${d.entityName}","${docTypeLabel[d.documentType] || d.documentType}","${d.status}","${d.expiryDate || ''}","${d.reviewStatus}"`
      ),
    ].join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `compliance-export-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="bg-[#0f172a]/70 backdrop-blur-sm border border-white/10 rounded-xl overflow-hidden">
      <div className="flex items-center justify-between px-4 py-3 border-b border-white/10">
        <div className="flex items-center gap-2">
          <h3 className="text-sm font-semibold text-white">Documents</h3>
          <span className="text-xs text-gray-500">({filtered.length} of {allDocs.length})</span>
        </div>
        {selectedRows.size > 0 && (
          <button
            onClick={handleBulkExport}
            className="flex items-center gap-2 px-2.5 py-1 rounded-lg bg-blue-500/10 text-blue-400 text-xs font-medium border border-blue-500/20 hover:bg-blue-500/20 transition-all cursor-pointer whitespace-nowrap"
          >
            <div className="w-4 h-4 flex items-center justify-center">
              <i className="ri-download-line text-xs"></i>
            </div>
            Export {selectedRows.size}
          </button>
        )}
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left">
          <thead>
            <tr className="border-b border-white/10">
              <th className="px-4 py-2.5 w-8">
                <button onClick={toggleSelectAll} className="cursor-pointer">
                  <div className="w-4 h-4 flex items-center justify-center">
                    <i className={`${selectedRows.size === filtered.length && filtered.length > 0 ? 'ri-checkbox-fill text-blue-400' : 'ri-checkbox-blank-line text-gray-600'} text-sm`}></i>
                  </div>
                </button>
              </th>
              <th className="px-4 py-2.5 text-xs font-medium text-gray-400 uppercase tracking-wider">Document</th>
              <th className="px-4 py-2.5 text-xs font-medium text-gray-400 uppercase tracking-wider">Entity</th>
              <th className="px-4 py-2.5 text-xs font-medium text-gray-400 uppercase tracking-wider">Type</th>
              <th className="px-4 py-2.5 text-xs font-medium text-gray-400 uppercase tracking-wider">Status</th>
              <th className="px-4 py-2.5 text-xs font-medium text-gray-400 uppercase tracking-wider">Expiry</th>
              <th className="px-4 py-2.5 text-xs font-medium text-gray-400 uppercase tracking-wider">Review</th>
              <th className="px-4 py-2.5 text-xs font-medium text-gray-400 uppercase tracking-wider w-24">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={8} className="px-4 py-8 text-center text-xs text-gray-500">
                  No documents match your filters.
                </td>
              </tr>
            ) : (
              filtered.map((doc) => {
                const s = statusBadge[doc.status] || statusBadge.active;
                const days = daysRemainingText(doc.expiryDate);
                const selected = selectedRows.has(doc.id);
                return (
                  <tr key={doc.id} className={`border-b border-white/5 hover:bg-white/5 transition-all ${selected ? 'bg-blue-500/5' : ''}`}>
                    <td className="px-4 py-3">
                      <button onClick={() => toggleSelect(doc.id)} className="cursor-pointer">
                        <div className="w-4 h-4 flex items-center justify-center">
                          <i className={`${selected ? 'ri-checkbox-fill text-blue-400' : 'ri-checkbox-blank-line text-gray-600'} text-sm`}></i>
                        </div>
                      </button>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        {doc.fileUrl ? (
                          <div className="w-7 h-7 rounded-lg bg-blue-500/10 flex items-center justify-center shrink-0">
                            <div className="w-4 h-4 flex items-center justify-center text-blue-400">
                              <i className="ri-file-text-line text-xs"></i>
                            </div>
                          </div>
                        ) : (
                          <div className="w-7 h-7 rounded-lg bg-gray-500/10 flex items-center justify-center shrink-0">
                            <div className="w-4 h-4 flex items-center justify-center text-gray-500">
                              <i className="ri-file-close-line text-xs"></i>
                            </div>
                          </div>
                        )}
                        <div className="min-w-0">
                          <p className="text-sm font-medium text-white truncate">{doc.documentTitle}</p>
                          <p className="text-[10px] text-gray-500">{formatDate(doc.createdAt)}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-xs text-gray-400">{doc.entityName}</span>
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-xs text-gray-400">{docTypeLabel[doc.documentType] || doc.documentType}</span>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium ${s.bg} ${s.color}`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${s.color.replace('text-', 'bg-')}`}></span>
                        {s.label}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="text-xs text-gray-400">{formatDate(doc.expiryDate)}</div>
                      {days && <div className="text-[10px] text-gray-600 mt-0.5">{days}</div>}
                    </td>
                    <td className="px-4 py-3">
                      <span className={`text-[10px] font-medium px-1.5 py-0.5 rounded ${
                        doc.reviewStatus === 'approved' ? 'bg-emerald-500/10 text-emerald-400' :
                        doc.reviewStatus === 'rejected' ? 'bg-red-500/10 text-red-400' :
                        'bg-blue-500/10 text-blue-400'
                      }`}>
                        {doc.reviewStatus}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1">
                        {doc.fileUrl && (
                          <button
                            onClick={() => {
                              if (typeof window !== 'undefined') {
                                window.open(doc.fileUrl!, '_blank');
                              }
                            }}
                            className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-white/10 text-gray-400 hover:text-white transition-all cursor-pointer"
                          >
                            <div className="w-4 h-4 flex items-center justify-center">
                              <i className="ri-eye-line text-xs"></i>
                            </div>
                          </button>
                        )}
                        {doc.reviewStatus === 'pending' && doc.source === 'compliance' && (
                          <button
                            onClick={() => setReviewDoc(doc)}
                            className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-white/10 text-gray-400 hover:text-white transition-all cursor-pointer"
                          >
                            <div className="w-4 h-4 flex items-center justify-center">
                              <i className="ri-check-double-line text-xs"></i>
                            </div>
                          </button>
                        )}
                        {doc.entityType === 'guard' && doc.entityId && (
                          <Link
                            href={`/guards`}
                            className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-white/10 text-gray-400 hover:text-white transition-all cursor-pointer"
                          >
                            <div className="w-4 h-4 flex items-center justify-center">
                              <i className="ri-arrow-right-up-line text-xs"></i>
                            </div>
                          </Link>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {reviewDoc && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
          <div className="bg-[#0f172a] border border-white/10 rounded-xl shadow-xl max-w-lg w-full p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-white">Review Document</h3>
              <button onClick={() => { setReviewDoc(null); setReviewReason(''); }} className="cursor-pointer text-gray-500 hover:text-white">
                <div className="w-5 h-5 flex items-center justify-center">
                  <i className="ri-close-line"></i>
                </div>
              </button>
            </div>
            <div className="space-y-3 mb-4">
              <p className="text-sm text-gray-400"><span className="text-white font-medium">Document:</span> {reviewDoc.documentTitle}</p>
              <p className="text-sm text-gray-400"><span className="text-white font-medium">Entity:</span> {reviewDoc.entityName}</p>
              <p className="text-sm text-gray-400"><span className="text-white font-medium">Type:</span> {docTypeLabel[reviewDoc.documentType] || reviewDoc.documentType}</p>
            </div>
            <div className="mb-4">
              <label className="text-xs text-gray-500 block mb-1.5">Rejection Reason (optional)</label>
              <textarea
                value={reviewReason}
                onChange={(e) => setReviewReason(e.target.value)}
                placeholder="Enter reason if rejecting..."
                className="w-full bg-gray-800/60 border border-gray-700 rounded-lg px-3 py-2 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 resize-none"
                rows={3}
                maxLength={500}
              />
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => handleApprove(reviewDoc)}
                disabled={reviewLoading}
                className="flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-sm text-white transition-all cursor-pointer whitespace-nowrap"
              >
                <div className="w-4 h-4 flex items-center justify-center">
                  <i className="ri-check-line text-xs"></i>
                </div>
                Approve
              </button>
              <button
                onClick={() => handleReject(reviewDoc)}
                disabled={reviewLoading}
                className="flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-lg bg-red-600 hover:bg-red-500 text-sm text-white transition-all cursor-pointer whitespace-nowrap"
              >
                <div className="w-4 h-4 flex items-center justify-center">
                  <i className="ri-close-line text-xs"></i>
                </div>
                Reject
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}