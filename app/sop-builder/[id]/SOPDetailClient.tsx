'use client';

import { useState, useEffect, useCallback } from 'react';
import { useBuiltSOPs, BuiltSOP, getSOPTypeLabel, SOPStatus } from '@/lib/useBuiltSOPs';
import { useSOPAcknowledgements } from '@/lib/useSOPAcknowledgements';
import { useAuth } from '@/lib/auth';
import { generateSOPContent } from '../lib/generateSOPContent';
import AIImprovementsPanel from '../components/AIImprovementsPanel';
import Link from 'next/link';

function statusBadge(status: SOPStatus) {
  const map: Record<string, string> = {
    draft: 'bg-gray-500/10 text-gray-400 border-gray-500/20',
    in_review: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
    approved: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
    published: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
    archived: 'bg-red-500/10 text-red-400 border-red-500/20',
  };
  return (
    <span className={`inline-flex items-center gap-1 text-[10px] px-2 py-0.5 rounded border uppercase tracking-wider font-semibold whitespace-nowrap ${map[status] || map.draft}`}>
      {status.replace(/_/g, ' ')}
    </span>
  );
}

export default function SOPDetailClient({ id }: { id: string }) {
  const { getById, updateStatus, saveContent, archiveSOP, deleteSOP, incrementVersion, refetch } = useBuiltSOPs();
  const { user, profile } = useAuth();
  const { acks, refetch: refetchAcks } = useSOPAcknowledgements(id);

  const [sop, setSop] = useState<BuiltSOP | null>(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
  const [htmlContent, setHtmlContent] = useState<string | null>(null);
  const [showDelete, setShowDelete] = useState(false);
  const [showArchive, setShowArchive] = useState(false);
  const [approvalNote, setApprovalNote] = useState('');
  const [showApprove, setShowApprove] = useState(false);
  const [showAcks, setShowAcks] = useState(false);

  const isAdmin = profile?.role === 'company_admin' || profile?.role === 'operations_manager';

  const generateSOPContentFromBuilt = useCallback((sopData: BuiltSOP): string => {
    const formData = (sopData.content_json as any) || {
      sop_type: sopData.sop_type, title: sopData.title, site_id: sopData.site_id,
      client_name: sopData.client_name, purpose: sopData.purpose, scope: sopData.scope,
      roles: sopData.roles || [], equipment: sopData.equipment || [],
      procedure_steps: sopData.procedure_steps || [], risks_controls: sopData.risks_controls || [],
      ppe: sopData.ppe, health_safety_notes: sopData.health_safety_notes,
      emergency_contacts: sopData.emergency_contacts || [], escalation_procedure: sopData.escalation_procedure,
      reporting_requirements: sopData.reporting_requirements, guard_acknowledgement_statement: sopData.guard_acknowledgement_statement,
      review_date: sopData.review_date, guard_role: sopData.guard_role, shift_type: sopData.shift_type,
    };
    return generateSOPContent(formData, {
      sopReference: sopData.sop_reference || '', version: sopData.version_number || 1,
      createdBy: sopData.created_by_name || 'GuardianHub', createdAt: sopData.created_at, status: sopData.status,
    });
  }, []);

  const load = useCallback(async () => {
    setLoading(true);
    const data = await getById(id);
    setSop(data);
    if (data) {
      const html = data.content_html || generateSOPContentFromBuilt(data);
      setHtmlContent(html);
    }
    setLoading(false);
  }, [id, getById, generateSOPContentFromBuilt]);

  useEffect(() => {
    load();
  }, [load]);

  useEffect(() => {
    refetchAcks();
  }, [id, refetchAcks]);

  const handleSave = async () => {
    if (!sop || !htmlContent) return;
    setSaving(true);
    const formData = (sop.content_json as any) || {
      sop_type: sop.sop_type, title: sop.title, site_id: sop.site_id,
      client_name: sop.client_name, purpose: sop.purpose, scope: sop.scope,
      roles: sop.roles || [], equipment: sop.equipment || [],
      procedure_steps: sop.procedure_steps || [], risks_controls: sop.risks_controls || [],
      ppe: sop.ppe, health_safety_notes: sop.health_safety_notes,
      emergency_contacts: sop.emergency_contacts || [], escalation_procedure: sop.escalation_procedure,
      reporting_requirements: sop.reporting_requirements, guard_acknowledgement_statement: sop.guard_acknowledgement_statement,
      review_date: sop.review_date, guard_role: sop.guard_role, shift_type: sop.shift_type,
    };
    await saveContent(sop.id, htmlContent, formData);
    setEditing(false);
    setSaving(false);
    setToast('SOP saved');
    setTimeout(() => setToast(null), 3000);
  };

  const handleApplyAIImprovements = async (mergedContentJson: Record<string, any>) => {
    if (!sop) return;
    const updatedSop = { ...sop, content_json: mergedContentJson };
    setSop(updatedSop);
    const html = generateSOPContent(mergedContentJson, {
      sopReference: sop.sop_reference || '', version: sop.version_number || 1,
      createdBy: sop.created_by_name || 'GuardianHub', createdAt: sop.created_at, status: sop.status,
    });
    setHtmlContent(html);
    setToast('AI improvements applied — click Save to persist');
    setTimeout(() => setToast(null), 3000);
  };

  const handleApprove = async () => {
    if (!sop || !user?.id) return;
    await updateStatus(sop.id, 'approved', {
      approved_by: user.id, approved_at: new Date().toISOString(), approval_notes: approvalNote,
    });
    setShowApprove(false);
    await load();
    setToast('SOP approved');
    setTimeout(() => setToast(null), 3000);
  };

  const handlePublish = async () => {
    if (!sop) return;
    await updateStatus(sop.id, 'published', { published_at: new Date().toISOString() });
    await load();
    setToast('SOP published to site');
    setTimeout(() => setToast(null), 3000);
  };

  const handleArchive = async () => {
    if (!sop) return;
    await archiveSOP(sop.id);
    setShowArchive(false);
    await load();
    setToast('SOP archived');
    setTimeout(() => setToast(null), 3000);
  };

  const handleDelete = async () => {
    if (!sop) return;
    await deleteSOP(sop.id);
    setShowDelete(false);
    if (typeof window !== 'undefined') {
      window.location.href = '/sop-builder';
    }
  };

  const handleSubmitForReview = async () => {
    if (!sop) return;
    await updateStatus(sop.id, 'in_review');
    await load();
    setToast('Submitted for review');
    setTimeout(() => setToast(null), 3000);
  };

  const handleNewVersion = async () => {
    if (!sop) return;
    await incrementVersion(sop.id);
    await load();
    setToast('New version created');
    setTimeout(() => setToast(null), 3000);
  };

  const handleExportPDF = () => {
    if (!htmlContent) return;
    const blob = new Blob([htmlContent], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    if (typeof window !== 'undefined') {
      const w = window.open(url, '_blank');
      if (w) w.addEventListener('load', () => w.print());
    }
  };

  const handleDownloadHTML = () => {
    if (!htmlContent || !sop) return;
    const blob = new Blob([htmlContent], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${sop.title || 'SOP'}.html`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleRegenerate = () => {
    if (!sop) return;
    const html = generateSOPContentFromBuilt(sop);
    setHtmlContent(html);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-6 h-6 flex items-center justify-center">
          <i className="ri-loader-4-line animate-spin text-blue-500 text-xl"></i>
        </div>
      </div>
    );
  }

  if (!sop) {
    return (
      <div className="text-center py-20">
        <div className="w-12 h-12 mx-auto mb-4 flex items-center justify-center rounded-xl bg-gray-800/50">
          <div className="w-6 h-6 flex items-center justify-center"><i className="ri-file-warning-line text-gray-500 text-xl"></i></div>
        </div>
        <h3 className="text-lg font-medium text-gray-300">SOP not found</h3>
        <Link href="/sop-builder" className="text-sm text-blue-400 hover:text-blue-300 mt-2 inline-block">Back to SOP Builder</Link>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full gap-4">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div className="flex items-center gap-3">
          <Link href="/sop-builder" className="w-8 h-8 flex items-center justify-center rounded-lg bg-gray-800 hover:bg-gray-700 text-gray-400 transition-colors cursor-pointer">
            <div className="w-4 h-4 flex items-center justify-center"><i className="ri-arrow-left-line text-xs"></i></div>
          </Link>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold text-white">{sop.title}</h1>
              {statusBadge(sop.status)}
            </div>
            <p className="text-sm text-gray-400 mt-0.5">
              {getSOPTypeLabel(sop.sop_type)} &middot; v{sop.version_number}
              {sop.site_name && ` &middot; ${sop.site_name}`}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          {sop.status === 'draft' && (
            <button onClick={handleSubmitForReview} className="px-3 py-2 bg-amber-600/15 hover:bg-amber-600/25 text-amber-400 text-sm font-medium rounded-lg border border-amber-500/20 transition-colors cursor-pointer whitespace-nowrap">Submit for Review</button>
          )}
          {sop.status === 'in_review' && isAdmin && (
            <button onClick={() => setShowApprove(true)} className="px-3 py-2 bg-emerald-600/15 hover:bg-emerald-600/25 text-emerald-400 text-sm font-medium rounded-lg border border-emerald-500/20 transition-colors cursor-pointer whitespace-nowrap">Approve SOP</button>
          )}
          {sop.status === 'approved' && (
            <button onClick={handlePublish} className="px-3 py-2 bg-blue-600 hover:bg-blue-500 text-white text-sm font-medium rounded-lg transition-colors cursor-pointer whitespace-nowrap">Publish to Site</button>
          )}
          {(sop.status === 'published' || sop.status === 'approved') && (
            <button onClick={handleNewVersion} className="px-3 py-2 bg-gray-800 hover:bg-gray-700 border border-gray-700 text-gray-300 text-sm font-medium rounded-lg transition-colors cursor-pointer whitespace-nowrap">New Version</button>
          )}
          <button onClick={() => setEditing(!editing)} className="px-3 py-2 bg-gray-800 hover:bg-gray-700 border border-gray-700 text-gray-300 text-sm font-medium rounded-lg transition-colors cursor-pointer whitespace-nowrap">{editing ? 'Done' : 'Edit'}</button>
          <button onClick={handleDownloadHTML} className="px-3 py-2 bg-gray-800 hover:bg-gray-700 border border-gray-700 text-gray-300 text-sm font-medium rounded-lg transition-colors cursor-pointer whitespace-nowrap">
            <div className="w-4 h-4 inline-flex items-center justify-center mr-1"><i className="ri-download-line text-xs"></i></div>HTML
          </button>
          <button onClick={handleExportPDF} className="px-3 py-2 bg-gray-800 hover:bg-gray-700 border border-gray-700 text-gray-300 text-sm font-medium rounded-lg transition-colors cursor-pointer whitespace-nowrap">
            <div className="w-4 h-4 inline-flex items-center justify-center mr-1"><i className="ri-file-pdf-line text-xs"></i></div>PDF
          </button>
          {sop.status !== 'archived' && (
            <button onClick={() => setShowArchive(true)} className="px-3 py-2 bg-gray-800 hover:bg-gray-700 border border-gray-700 text-gray-300 text-sm font-medium rounded-lg transition-colors cursor-pointer whitespace-nowrap">Archive</button>
          )}
          <button onClick={() => setShowDelete(true)} className="px-3 py-2 bg-gray-800 hover:bg-red-500/10 border border-gray-700 hover:border-red-500/20 text-gray-300 hover:text-red-400 text-sm font-medium rounded-lg transition-colors cursor-pointer whitespace-nowrap">
            <div className="w-4 h-4 inline-flex items-center justify-center"><i className="ri-delete-bin-line text-xs"></i></div>
          </button>
        </div>
      </div>

      {sop.status === 'published' && acks.length > 0 && (
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowAcks(!showAcks)}
            className="inline-flex items-center gap-2 px-3 py-1.5 bg-emerald-500/10 text-emerald-400 text-xs font-medium rounded-lg border border-emerald-500/20 cursor-pointer whitespace-nowrap"
          >
            <div className="w-4 h-4 flex items-center justify-center"><i className="ri-check-double-line text-xs"></i></div>
            {acks.length} Guard Acknowledgement{acks.length !== 1 ? 's' : ''}
          </button>
        </div>
      )}

      {showAcks && (
        <div className="bg-gray-800/40 border border-gray-700 rounded-xl p-4 space-y-2 max-h-64 overflow-y-auto">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold text-white">Acknowledgements</h3>
            <button onClick={() => setShowAcks(false)} className="w-6 h-6 flex items-center justify-center text-gray-400 hover:text-white cursor-pointer">
              <div className="w-4 h-4 flex items-center justify-center"><i className="ri-close-line text-xs"></i></div>
            </button>
          </div>
          <table className="w-full text-sm">
            <thead className="text-xs text-gray-500 uppercase"><tr><th className="text-left py-2">Guard</th><th className="text-left py-2">Version</th><th className="text-left py-2">Date</th><th className="text-left py-2">Device</th></tr></thead>
            <tbody className="divide-y divide-gray-800">
              {acks.map((ack) => (
                <tr key={ack.id}>
                  <td className="py-2 text-gray-300">{ack.guard_name || '—'}</td>
                  <td className="py-2 text-gray-400">v{ack.version_number}</td>
                  <td className="py-2 text-gray-400">{new Date(ack.acknowledged_at).toLocaleDateString('en-GB')}</td>
                  <td className="py-2 text-gray-500 text-xs truncate max-w-[150px]">{ack.device_info || '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {editing ? (
        <div className="flex-1 flex flex-col gap-3">
          <div className="flex items-center gap-2">
            <button onClick={handleSave} disabled={saving} className="px-4 py-2 bg-blue-600 hover:bg-blue-500 disabled:opacity-40 text-white text-sm font-medium rounded-lg transition-colors cursor-pointer whitespace-nowrap">{saving ? 'Saving...' : 'Save Changes'}</button>
            <button onClick={handleRegenerate} className="px-4 py-2 bg-gray-800 hover:bg-gray-700 border border-gray-700 text-gray-300 text-sm font-medium rounded-lg transition-colors cursor-pointer whitespace-nowrap">Regenerate from Data</button>
          </div>
          <AIImprovementsPanel
            sopId={sop.id}
            contentJson={(sop.content_json as Record<string, any>) || {
              sop_type: sop.sop_type, title: sop.title, site_id: sop.site_id,
              client_name: sop.client_name, purpose: sop.purpose, scope: sop.scope,
              roles: sop.roles || [], equipment: sop.equipment || [],
              procedure_steps: sop.procedure_steps || [], risks_controls: sop.risks_controls || [],
              ppe: sop.ppe, health_safety_notes: sop.health_safety_notes,
              emergency_contacts: sop.emergency_contacts || [], escalation_procedure: sop.escalation_procedure,
              reporting_requirements: sop.reporting_requirements, guard_acknowledgement_statement: sop.guard_acknowledgement_statement,
              review_date: sop.review_date, guard_role: sop.guard_role, shift_type: sop.shift_type,
            }}
            onApply={handleApplyAIImprovements}
            onRegenerate={handleRegenerate}
          />
          <textarea value={htmlContent || ''} onChange={(e) => setHtmlContent(e.target.value)} className="flex-1 min-h-[500px] bg-gray-900 border border-gray-700 rounded-xl p-4 text-xs text-gray-300 font-mono resize-none focus:outline-none focus:border-blue-500" spellCheck={false} />
        </div>
      ) : (
        <div className="flex-1 bg-white rounded-xl overflow-hidden border border-gray-800">
          <iframe srcDoc={htmlContent || ''} className="w-full h-full min-h-[700px]" style={{ border: 'none' }} />
        </div>
      )}

      {showApprove && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
          <div className="bg-[#111827] border border-gray-700 rounded-2xl p-6 w-full max-w-md space-y-4">
            <h3 className="text-lg font-bold text-white">Approve SOP</h3>
            <p className="text-sm text-gray-400">You are approving version {sop.version_number} of <strong className="text-white">{sop.title}</strong>.</p>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Approval Notes (optional)</label>
              <textarea value={approvalNote} onChange={(e) => setApprovalNote(e.target.value)} placeholder="Any notes about this approval..." rows={3} className="w-full bg-gray-800/60 border border-gray-700 rounded-lg px-4 py-2.5 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 resize-none" />
            </div>
            <div className="flex items-center justify-end gap-2">
              <button onClick={() => setShowApprove(false)} className="px-4 py-2 rounded-lg text-sm font-medium text-gray-400 hover:text-white transition-colors cursor-pointer whitespace-nowrap">Cancel</button>
              <button onClick={handleApprove} className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-sm font-medium rounded-lg transition-colors cursor-pointer whitespace-nowrap">Confirm Approval</button>
            </div>
          </div>
        </div>
      )}

      {showArchive && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
          <div className="bg-[#111827] border border-gray-700 rounded-2xl p-6 w-full max-w-md space-y-4">
            <h3 className="text-lg font-bold text-white">Archive SOP</h3>
            <p className="text-sm text-gray-400">This will archive <strong className="text-white">{sop.title}</strong>. It will no longer be visible to guards.</p>
            <div className="flex items-center justify-end gap-2">
              <button onClick={() => setShowArchive(false)} className="px-4 py-2 rounded-lg text-sm font-medium text-gray-400 hover:text-white transition-colors cursor-pointer whitespace-nowrap">Cancel</button>
              <button onClick={handleArchive} className="px-4 py-2 bg-red-600 hover:bg-red-500 text-white text-sm font-medium rounded-lg transition-colors cursor-pointer whitespace-nowrap">Archive</button>
            </div>
          </div>
        </div>
      )}

      {showDelete && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
          <div className="bg-[#111827] border border-gray-700 rounded-2xl p-6 w-full max-w-md space-y-4">
            <h3 className="text-lg font-bold text-white">Delete SOP</h3>
            <p className="text-sm text-gray-400">This will permanently delete <strong className="text-white">{sop.title}</strong>. This action cannot be undone.</p>
            <div className="flex items-center justify-end gap-2">
              <button onClick={() => setShowDelete(false)} className="px-4 py-2 rounded-lg text-sm font-medium text-gray-400 hover:text-white transition-colors cursor-pointer whitespace-nowrap">Cancel</button>
              <button onClick={handleDelete} className="px-4 py-2 bg-red-600 hover:bg-red-500 text-white text-sm font-medium rounded-lg transition-colors cursor-pointer whitespace-nowrap">Delete</button>
            </div>
          </div>
        </div>
      )}

      {toast && (
        <div className="fixed bottom-6 right-6 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-sm px-4 py-3 rounded-lg flex items-center gap-2 z-50">
          <div className="w-4 h-4 flex items-center justify-center"><i className="ri-check-line"></i></div>{toast}
        </div>
      )}
    </div>
  );
}