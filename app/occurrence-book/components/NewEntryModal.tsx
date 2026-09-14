'use client';

import { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { useAuth } from '@/lib/auth';
import { supabase } from '@/lib/supabase';
import { OB_ENTRY_TYPES, OB_ENTRY_TYPE_LABELS } from '@/lib/useOccurrenceBook';
import type { OBEntry } from '@/lib/useOccurrenceBook';

interface Props {
  editingEntry?: OBEntry | null;
  preselectedSiteId?: string | null;
  onSave: (payload: any) => void;
  onClose: () => void;
  saving: boolean;
}

export default function NewEntryModal({ editingEntry, preselectedSiteId, onSave, onClose, saving }: Props) {
  const { companyId, user } = useAuth();
  const isAdmin = user?.role === 'company_admin' || user?.role === 'super_admin' || user?.role === 'operations_manager';

  const [sites, setSites] = useState<{ id: string; site_name: string }[]>([]);
  const [guards, setGuards] = useState<{ id: string; first_name: string; last_name: string }[]>([]);
  const [siteId, setSiteId] = useState(preselectedSiteId || '');
  const [guardId, setGuardId] = useState('');
  const [entryType, setEntryType] = useState('general_note');
  const [occurredAt, setOccurredAt] = useState(format(new Date(), 'yyyy-MM-dd\'T\'HH:mm'));
  const [entryText, setEntryText] = useState('');
  const [entryTitle, setEntryTitle] = useState('');
  const [clientVisible, setClientVisible] = useState(false);
  const [visibility, setVisibility] = useState('internal');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [showAiToggle, setShowAiToggle] = useState(false);

  useEffect(() => {
    if (!companyId) return;
    supabase.from('sites').select('id, site_name').eq('company_id', companyId).order('site_name').then(({ data }) => {
      if (data) setSites(data);
    });
    supabase.from('guards').select('id, first_name, last_name').eq('company_id', companyId).eq('status', 'active').order('first_name').then(({ data }) => {
      if (data) setGuards(data);
    });
  }, [companyId]);

  useEffect(() => {
    if (editingEntry) {
      setSiteId(editingEntry.site_id || '');
      setGuardId(editingEntry.guard_id || '');
      setEntryType(editingEntry.entry_type || 'Note');
      setOccurredAt(editingEntry.occurred_at ? format(new Date(editingEntry.occurred_at), "yyyy-MM-dd'T'HH:mm") : format(new Date(), "yyyy-MM-dd'T'HH:mm"));
      setEntryText(editingEntry.entry || '');
    } else {
      setSiteId(preselectedSiteId || '');
      setGuardId('');
      setEntryType('general_note');
      setEntryTitle('');
      setClientVisible(false);
      setVisibility('internal');
      setOccurredAt(format(new Date(), "yyyy-MM-dd'T'HH:mm"));
      setEntryText('');
    }
    setErrors({});
  }, [editingEntry, preselectedSiteId]);

  const diffHours = (new Date().getTime() - new Date(occurredAt).getTime()) / (1000 * 60 * 60);
  const backdateWarning = diffHours > 1;

  const validate = (): boolean => {
    const e: Record<string, string> = {};
    if (!siteId) e.siteId = 'Site is required';
    if (!entryType) e.entryType = 'Type is required';
    if (!occurredAt) e.occurredAt = 'Time is required';
    if (!entryText || entryText.length < 10) e.entryText = 'Entry must be at least 10 characters';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSave = () => {
    if (!validate()) return;
    onSave({
      site_id: siteId,
      guard_id: guardId || null,
      entry_type: entryType,
      entry: entryText.trim(),
      title: entryTitle.trim() || null,
      occurred_at: new Date(occurredAt).toISOString(),
      client_visible: clientVisible,
      visibility: clientVisible ? 'client_visible' : visibility,
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="bg-[#151b27] border border-gray-800 rounded-xl w-full max-w-lg max-h-[90vh] overflow-y-auto shadow-2xl">
        <div className="px-6 py-4 border-b border-gray-800 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-white">{editingEntry ? 'Edit Entry' : 'New Entry'}</h2>
          <button onClick={onClose} className="w-8 h-8 flex items-center justify-center text-gray-400 hover:text-white cursor-pointer"
          >
            <div className="w-5 h-5 flex items-center justify-center"><i className="ri-close-line"></i></div>
          </button>
        </div>

        <div className="px-6 py-5 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-1">Site <span className="text-red-400">*</span></label>
            <select
              value={siteId}
              onChange={(e) => setSiteId(e.target.value)}
              className="w-full bg-gray-800/60 border border-gray-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-blue-500 cursor-pointer pr-8"
            >
              <option value="" disabled>Select site...</option>
              {sites.map((s) => <option key={s.id} value={s.id}>{s.site_name}</option>)}
            </select>
            {errors.siteId && <p className="text-red-400 text-xs mt-1">{errors.siteId}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-400 mb-1">Guard Reporting</label>
            <select
              value={guardId}
              onChange={(e) => setGuardId(e.target.value)}
              className="w-full bg-gray-800/60 border border-gray-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-blue-500 cursor-pointer pr-8"
            >
              <option value="">— (log as staff)</option>
              {guards.map((g) => <option key={g.id} value={g.id}>{g.first_name} {g.last_name}</option>)}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-400 mb-1">Entry Type <span className="text-red-400">*</span></label>
            <select
              value={entryType}
              onChange={(e) => setEntryType(e.target.value)}
              className="w-full bg-gray-800/60 border border-gray-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-blue-500 cursor-pointer pr-8"
            >
              {OB_ENTRY_TYPES.map((t) => <option key={t} value={t}>{OB_ENTRY_TYPE_LABELS[t] || t}</option>)}
            </select>
            {errors.entryType && <p className="text-red-400 text-xs mt-1">{errors.entryType}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-400 mb-1">Title</label>
            <input
              type="text"
              value={entryTitle}
              onChange={(e) => setEntryTitle(e.target.value)}
              placeholder="Short summary..."
              className="w-full bg-gray-800/60 border border-gray-700 rounded-lg px-3 py-2 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-400 mb-1">Time <span className="text-red-400">*</span></label>
            <input
              type="datetime-local"
              value={occurredAt}
              onChange={(e) => setOccurredAt(e.target.value)}
              className="w-full bg-gray-800/60 border border-gray-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-blue-500"
            />
            {backdateWarning && <p className="text-amber-400 text-xs mt-1">Warning: backdated entry ({Math.round(diffHours)}h ago)</p>}
            {errors.occurredAt && <p className="text-red-400 text-xs mt-1">{errors.occurredAt}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-400 mb-1">Entry Text <span className="text-red-400">*</span></label>
            <textarea
              value={entryText}
              onChange={(e) => setEntryText(e.target.value)}
              rows={4}
              maxLength={500}
              className="w-full bg-gray-800/60 border border-gray-700 rounded-lg px-3 py-2 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 resize-none"
              placeholder="Describe the event..."
            />
            <div className="flex items-center justify-between mt-1">
              {errors.entryText && <p className="text-red-400 text-xs">{errors.entryText}</p>}
              <div className="text-right text-xs text-gray-500 ml-auto">{entryText.length}/500</div>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={clientVisible}
                onChange={(e) => setClientVisible(e.target.checked)}
                className="w-4 h-4 rounded border-gray-600 bg-gray-800 text-blue-600 focus:ring-blue-500 cursor-pointer"
              />
              <span className="text-sm text-gray-400">Visible to client</span>
            </label>
            <button
              type="button"
              onClick={() => setShowAiToggle(!showAiToggle)}
              className="text-xs text-blue-400 hover:text-blue-300 transition-colors cursor-pointer whitespace-nowrap"
            >
              Generate AI Summary
            </button>
            {showAiToggle && <span className="text-[11px] text-gray-500">(placeholder — wired up later)</span>}
          </div>
        </div>

        <div className="px-6 py-4 border-t border-gray-800 flex items-center justify-end gap-3">
          <button onClick={onClose} className="px-4 py-2 rounded-lg text-sm font-medium text-gray-400 hover:text-white transition-colors cursor-pointer whitespace-nowrap">Cancel</button>
          <button
            onClick={handleSave}
            disabled={saving}
            className="inline-flex items-center gap-2 px-5 py-2 rounded-lg text-sm font-medium bg-blue-600 hover:bg-blue-500 text-white disabled:opacity-50 disabled:cursor-not-allowed transition-colors cursor-pointer whitespace-nowrap"
          >
            {saving && <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>}
            {editingEntry ? 'Save Changes' : 'Save Entry'}
          </button>
        </div>
      </div>
    </div>
  );
}