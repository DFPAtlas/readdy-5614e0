'use client';

import { useState } from 'react';
import { type ClientSite, type SiteAISummary, type ClientDocument, type ClientContact } from '@/lib/useClientInfo';

interface Props {
  sites: ClientSite[];
  summaries: SiteAISummary[];
  documents: ClientDocument[];
  contacts: ClientContact[];
  canEdit: boolean;
  saving: boolean;
  onGenerate: (siteId: string) => Promise<{ data: SiteAISummary | null; error: any }>;
  onUpdate: (summaryId: string, data: Partial<SiteAISummary>) => Promise<{ error: any }>;
}

const FIELDS: Array<{ key: keyof SiteAISummary; label: string; rows: number }> = [
  { key: 'site_overview', label: 'Site Overview', rows: 4 },
  { key: 'key_contacts', label: 'Key Contacts', rows: 3 },
  { key: 'important_procedures', label: 'Important Procedures', rows: 4 },
  { key: 'risks', label: 'Risks', rows: 3 },
  { key: 'emergency_notes', label: 'Emergency Notes', rows: 3 },
  { key: 'guard_briefing_summary', label: 'Guard Briefing Summary', rows: 5 },
];

export default function SiteSummarySection({ sites, summaries, documents, contacts, canEdit, saving, onGenerate, onUpdate }: Props) {
  const [selectedSiteId, setSelectedSiteId] = useState<string>('');
  const [generatingId, setGeneratingId] = useState<string | null>(null);
  const [editingSummary, setEditingSummary] = useState<SiteAISummary | null>(null);
  const [editForm, setEditForm] = useState<Partial<SiteAISummary>>();
  const [toast, setToast] = useState<string | null>(null);

  const selectedSite = sites.find((s) => s.id === selectedSiteId);
  const siteSummary = summaries.find((s) => s.site_id === selectedSiteId);
  const siteDocs = documents.filter((d) => d.site_id === selectedSiteId);
  const siteContacts = contacts.filter((c) => c.site_id === selectedSiteId);

  const handleGenerate = async () => {
    if (!selectedSiteId) { setToast('Select a site first'); setTimeout(() => setToast(null), 3000); return; }
    setGeneratingId(selectedSiteId);
    const { error } = await onGenerate(selectedSiteId);
    setToast(error ? 'AI generation failed' : 'Site summary generated');
    setGeneratingId(null);
    setTimeout(() => setToast(null), 3000);
  };

  const startEdit = (sum: SiteAISummary) => {
    setEditingSummary(sum);
    setEditForm({
      site_overview: sum.site_overview || '',
      key_contacts: sum.key_contacts || '',
      important_procedures: sum.important_procedures || '',
      risks: sum.risks || '',
      emergency_notes: sum.emergency_notes || '',
      guard_briefing_summary: sum.guard_briefing_summary || '',
    });
  };

  const handleSaveEdit = async () => {
    if (!editingSummary) return;
    const { error } = await onUpdate(editingSummary.id, editForm);
    setToast(error ? 'Failed to save' : 'Summary updated');
    if (!error) setEditingSummary(null);
    setTimeout(() => setToast(null), 3000);
  };

  return (
    <div className="space-y-5">
      {toast && (
        <div className={`px-4 py-2.5 rounded-lg text-sm font-medium ${toast.includes('failed') ? 'bg-red-500/10 text-red-400 border border-red-500/20' : 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'}`}>
          {toast}
        </div>
      )}

      {/* Site Selector + Generate */}
      <div className="flex items-center gap-3 flex-wrap">
        <div className="relative min-w-[240px]">
          <select
            value={selectedSiteId}
            onChange={(e) => setSelectedSiteId(e.target.value)}
            className="w-full bg-gray-800/60 border border-gray-700 rounded-lg px-3 py-2.5 text-sm text-white focus:outline-none pr-8"
          >
            <option value="">Select a site...</option>
            {sites.map((s) => (
              <option key={s.id} value={s.id}>{s.site_name}</option>
            ))}
          </select>
        </div>
        {canEdit && selectedSiteId && (
          <button
            onClick={handleGenerate}
            disabled={generatingId === selectedSiteId || saving}
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-violet-600 hover:bg-violet-500 text-white text-sm font-medium rounded-lg transition-colors disabled:opacity-50 cursor-pointer whitespace-nowrap"
          >
            {generatingId === selectedSiteId && <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>}
            <div className="w-4 h-4 flex items-center justify-center"><i className="ri-sparkling-line text-sm"></i></div>
            Generate Site Summary
          </button>
        )}
      </div>

      {/* Site Context */}
      {selectedSite && (
        <div className="bg-gray-800/40 border border-gray-800 rounded-xl p-4">
          <div className="flex items-center gap-2 mb-2">
            <h4 className="text-sm font-semibold text-white">{selectedSite.site_name}</h4>
            <span className={`text-[10px] px-2 py-0.5 rounded-full border font-medium ${
              selectedSite.risk_level === 'High' ? 'bg-red-500/10 text-red-400 border-red-500/20' :
              selectedSite.risk_level === 'Medium' ? 'bg-amber-500/10 text-amber-400 border-amber-500/20' :
              'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
            }`}>
              {selectedSite.risk_level || 'Medium'} Risk
            </span>
          </div>
          {selectedSite.site_address && <p className="text-xs text-gray-400">{selectedSite.site_address}</p>}
          <div className="flex items-center gap-4 mt-3 text-xs text-gray-500">
            <span>{siteDocs.length} document{siteDocs.length !== 1 ? 's' : ''}</span>
            <span>{siteContacts.length} contact{siteContacts.length !== 1 ? 's' : ''}</span>
            {siteSummary && <span className="text-emerald-400">Summary generated</span>}
          </div>
        </div>
      )}

      {/* Summary Display / Edit */}
      {siteSummary && !editingSummary && (
        <div className="bg-gray-800/40 border border-gray-800 rounded-xl p-5 space-y-4">
          <div className="flex items-center justify-between">
            <h4 className="text-sm font-semibold text-white flex items-center gap-2">
              <div className="w-4 h-4 flex items-center justify-center text-violet-400"><i className="ri-sparkling-line text-xs"></i></div>
              AI Generated Summary
            </h4>
            {canEdit && (
              <button
                onClick={() => startEdit(siteSummary)}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-gray-800/60 hover:bg-gray-800 text-gray-300 border border-gray-700 rounded-lg text-xs font-medium transition-colors cursor-pointer whitespace-nowrap"
              >
                <div className="w-3.5 h-3.5 flex items-center justify-center"><i className="ri-edit-line text-xs"></i></div>
                Edit Summary
              </button>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {FIELDS.map((f) => {
              const value = siteSummary[f.key];
              if (!value) return null;
              return (
                <div key={f.key} className="bg-gray-800/60 rounded-lg p-4">
                  <h5 className="text-xs font-medium text-gray-400 uppercase tracking-wider mb-2">{f.label}</h5>
                  <p className="text-sm text-gray-300 whitespace-pre-wrap">{value}</p>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Edit Mode */}
      {editingSummary && (
        <div className="bg-gray-800/40 border border-gray-800 rounded-xl p-5 space-y-4">
          <div className="flex items-center justify-between">
            <h4 className="text-sm font-semibold text-white">Edit AI Summary</h4>
            <button
              onClick={() => setEditingSummary(null)}
              className="text-xs text-gray-400 hover:text-white cursor-pointer"
            >
              Cancel
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {FIELDS.map((f) => (
              <div key={f.key}>
                <label className="block text-xs text-gray-400 mb-1.5">{f.label}</label>
                <textarea
                  value={(editForm[f.key] as string) || ''}
                  onChange={(e) => setEditForm({ ...editForm, [f.key]: e.target.value })}
                  rows={f.rows}
                  maxLength={2000}
                  className="w-full bg-gray-800/60 border border-gray-700 rounded-lg px-3 py-2.5 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-blue-500/50 resize-none"
                />
              </div>
            ))}
          </div>

          <div className="flex items-center justify-end pt-2">
            <button
              onClick={handleSaveEdit}
              disabled={saving}
              className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white text-sm font-medium rounded-lg transition-colors disabled:opacity-50 cursor-pointer whitespace-nowrap"
            >
              {saving && <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>}
              <div className="w-4 h-4 flex items-center justify-center"><i className="ri-save-line text-sm"></i></div>
              Save Changes
            </button>
          </div>
        </div>
      )}

      {/* No summary yet */}
      {selectedSiteId && !siteSummary && !generatingId && (
        <div className="text-center py-10 bg-gray-800/20 border border-gray-800 rounded-xl">
          <div className="w-12 h-12 mx-auto mb-3 flex items-center justify-center bg-violet-500/10 rounded-full">
            <i className="ri-sparkling-line text-violet-400 text-xl"></i>
          </div>
          <p className="text-sm text-gray-400">No AI summary yet for this site.</p>
          {canEdit && (
            <p className="text-xs text-gray-500 mt-1">Click "Generate Site Summary" to create one.</p>
          )}
        </div>
      )}

      {/* All summaries list */}
      {!selectedSiteId && summaries.length > 0 && (
        <div className="space-y-3">
          <h4 className="text-sm font-semibold text-white">All Generated Summaries</h4>
          {summaries.map((sum) => {
            const s = sites.find((site) => site.id === sum.site_id);
            return (
              <button
                key={sum.id}
                onClick={() => setSelectedSiteId(sum.site_id)}
                className="w-full text-left bg-gray-800/40 border border-gray-800 rounded-xl p-4 hover:border-gray-700 transition-colors cursor-pointer"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <h5 className="text-sm font-medium text-white">{s?.site_name || 'Unknown Site'}</h5>
                    <span className="text-[10px] text-violet-300 bg-violet-500/10 px-1.5 py-0.5 rounded border border-violet-500/20">AI Summary</span>
                  </div>
                  <span className="text-xs text-gray-500">{new Date(sum.updated_at).toLocaleDateString('en-GB')}</span>
                </div>
                {sum.guard_briefing_summary && (
                  <p className="text-xs text-gray-500 mt-2 line-clamp-2">{sum.guard_briefing_summary}</p>
                )}
              </button>
            );
          })}
        </div>
      )}

      {!selectedSiteId && summaries.length === 0 && (
        <div className="text-center py-10">
          <div className="w-12 h-12 mx-auto mb-3 flex items-center justify-center bg-gray-800 rounded-full">
            <i className="ri-sparkling-line text-gray-500 text-xl"></i>
          </div>
          <p className="text-sm text-gray-500">No AI summaries generated yet.</p>
          <p className="text-xs text-gray-600 mt-1">Select a site and click Generate to create one.</p>
        </div>
      )}
    </div>
  );
}