'use client';

import { useState, useMemo, useEffect, useCallback } from 'react';
import { format, subDays } from 'date-fns';
import { useAuth } from '@/lib/auth';
import { useOccurrenceBook, type OBEntry } from '@/lib/useOccurrenceBook';
import { useAISummary } from '@/lib/useAISummary';
import { supabase } from '@/lib/supabase';
import SiteSelector from './components/SiteSelector';
import OBFeed from './components/OBFeed';
import NewEntryModal from './components/NewEntryModal';
import QuickEntryBar from './components/QuickEntryBar';
import DailyDigestModal from './components/DailyDigestModal';
import Toast from '@/app/sites/components/Toast';

export default function OccurrenceBookPage() {
  const { companyId, user } = useAuth();
  const isAdmin = user?.role === 'company_admin' || user?.role === 'super_admin' || user?.role === 'operations_manager';

  const [selectedSite, setSelectedSite] = useState<string | null>(null);
  const [guardFilter, setGuardFilter] = useState('');
  const [entryTypeFilter, setEntryTypeFilter] = useState('');
  const [fromDate, setFromDate] = useState(format(subDays(new Date(), 7), 'yyyy-MM-dd'));
  const [toDate, setToDate] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [search, setSearch] = useState('');
  const [newestFirst, setNewestFirst] = useState(true);

  const [modalOpen, setModalOpen] = useState(false);
  const [editingEntry, setEditingEntry] = useState<OBEntry | null>(null);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
  const [loadingMore, setLoadingMore] = useState(false);

  const [digestOpen, setDigestOpen] = useState(false);
  const [digestText, setDigestText] = useState('');
  const [digestDate, setDigestDate] = useState('');
  const [summarisingAll, setSummarisingAll] = useState(false);
  const [aiUsageWarning, setAiUsageWarning] = useState<string | null>(null);

  const {
    entries, loading, error, hasMore, refetch, loadMore, addEntry, updateEntry, deleteEntry,
  } = useOccurrenceBook(
    selectedSite,
    {
      entryType: entryTypeFilter || undefined,
      guardId: guardFilter || undefined,
      search: search || undefined,
      from: fromDate || undefined,
      to: toDate || undefined,
    }
  );

  const {
    summarisingIds, summarisingDay, summarizeEntry, summarizeDay, fetchAIUsage,
  } = useAISummary();

  // Auto-trigger summaries for new entries > 200 chars
  const maybeSummarise = useCallback(async (entryId: string, entryText: string) => {
    if (!entryText || entryText.length <= 200) return;
    // Fire and forget — summary will appear via realtime
    summarizeEntry(entryId).catch(() => {});
  }, [summarizeEntry]);

  // Check AI usage on company change
  useEffect(() => {
    if (!companyId) return;
    fetchAIUsage(companyId).then((usage) => {
      if (usage.limit !== Infinity && usage.count >= usage.limit * 0.9) {
        setAiUsageWarning(`AI usage this month: ${usage.count}/${usage.limit}. Upgrade plan to unlock more.`);
      } else {
        setAiUsageWarning(null);
      }
    });
  }, [companyId, fetchAIUsage]);

  // Realtime subscription for ai_summary updates
  useEffect(() => {
    if (!selectedSite) return;
    const channel = supabase
      .channel(`ob-ai-${selectedSite}`)
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'occurrence_books',
          filter: `site_id=eq.${selectedSite}`,
        },
        (payload) => {
          if (payload.new && 'ai_summary' in payload.new) {
            refetch();
          }
        }
      )
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [selectedSite, refetch]);

  const handleAddEntry = async (payload: any) => {
    setSaving(true);
    const { data, error } = await addEntry(payload);
    if (!error) {
      setToast('Entry saved');
      setModalOpen(false);
      refetch();
      const newId = data?.id;
      if (newId && payload.entry && payload.entry.length > 200) {
        maybeSummarise(newId, payload.entry);
      }
    } else {
      setToast('Failed to save entry');
    }
    setSaving(false);
  };

  const handleQuickAdd = async (text: string) => {
    if (!selectedSite) return;
    setSaving(true);
    const { data, error } = await addEntry({
      site_id: selectedSite,
      guard_id: null,
      entry_type: 'Note',
      entry: text,
      occurred_at: new Date().toISOString(),
    });
    if (!error) {
      setToast('Entry saved');
      refetch();
      const newId = data?.id;
      if (newId && text.length > 200) {
        maybeSummarise(newId, text);
      }
    } else {
      setToast('Failed to save entry');
    }
    setSaving(false);
  };

  const handleEdit = async (payload: any) => {
    if (!editingEntry) return;
    setSaving(true);
    const { error } = await updateEntry(editingEntry.id, payload);
    if (!error) {
      setToast('Entry updated');
      setModalOpen(false);
      setEditingEntry(null);
      refetch();
      if (payload.entry && payload.entry.length > 200 && !editingEntry.ai_summary) {
        maybeSummarise(editingEntry.id, payload.entry);
      }
    } else {
      setToast('Failed to update entry');
    }
    setSaving(false);
  };

  const handleDelete = async (entry: OBEntry) => {
    const confirmed = window.confirm('Delete this occurrence book entry?\n\nIn production, OB entries should never be deleted as they are legal evidence. This action is allowed for dev/testing only.');
    if (!confirmed) return;
    const { error } = await deleteEntry(entry.id);
    if (!error) { setToast('Entry deleted'); refetch(); }
    else setToast('Failed to delete entry');
  };

  const handleExportCSV = () => {
    if (!entries.length) return;
    const rows = [
      ['timestamp', 'type', 'guard', 'entry_text'],
      ...entries.map((e) => [
        e.occurred_at || e.created_at || '',
        e.entry_type || '',
        e.reporter_name || '',
        e.entry,
      ]),
    ];
    const csv = rows.map((r) => r.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `occurrence-book-${selectedSite}-${format(new Date(), 'yyyy-MM-dd')}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    setToast('CSV exported');
  };

  const handleSummariseAll = async () => {
    const targets = entries
      .filter((e) => (e.entry?.length || 0) > 200 && !e.ai_summary)
      .slice(0, 25);
    if (targets.length === 0) return;
    setSummarisingAll(true);
    const results = await Promise.allSettled(
      targets.map((e) => summarizeEntry(e.id))
    );
    const succeeded = results.filter((r) => r.status === 'fulfilled').length;
    setToast(`Summarised ${succeeded} of ${targets.length} entries`);
    setSummarisingAll(false);
    refetch();
  };

  const handleDailyDigest = async () => {
    if (!selectedSite) return;
    const today = format(new Date(), 'yyyy-MM-dd');
    setDigestDate(today);
    const result = await summarizeDay(selectedSite, today);
    if (result.summary) {
      setDigestText(result.summary);
      setDigestOpen(true);
    } else {
      setToast(result.error || 'Failed to generate daily summary');
    }
  };

  const selectedSiteName = useMemo(() => {
    const site = entries.find((e) => e.site_id === selectedSite);
    return site?.site_name || 'Site';
  }, [entries, selectedSite]);

  const uniqueGuards = useMemo(() => {
    const seen = new Map<string, { id: string; name: string }>();
    entries.forEach((e) => {
      if (e.guard_id && !seen.has(e.guard_id)) {
        seen.set(e.guard_id, { id: e.guard_id, name: e.reporter_name || 'Staff' });
      }
    });
    return Array.from(seen.values());
  }, [entries]);

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white">Occurrence Book</h1>
          <p className="text-gray-400 text-sm mt-1">Live activity log across all your sites</p>
        </div>
        <div className="flex items-center gap-2">
          {selectedSite && (
            <>
              <button
                onClick={handleExportCSV}
                className="inline-flex items-center gap-2 bg-gray-800/60 hover:bg-gray-700/50 border border-gray-700 text-white text-sm font-medium px-3 py-2.5 rounded-lg transition-colors cursor-pointer whitespace-nowrap"
              >
                <div className="w-4 h-4 flex items-center justify-center"><i className="ri-download-2-line"></i></div>
                Export CSV
              </button>
              <button
                onClick={() => { setEditingEntry(null); setModalOpen(true); }}
                className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white text-sm font-medium px-4 py-2.5 rounded-lg transition-colors cursor-pointer whitespace-nowrap"
              >
                <div className="w-4 h-4 flex items-center justify-center"><i className="ri-add-line"></i></div>
                New Entry
              </button>
            </>
          )}
        </div>
      </div>

      {/* AI usage warning */}
      {aiUsageWarning && (
        <div className="bg-amber-500/10 border border-amber-500/20 text-amber-400 text-sm px-4 py-3 rounded-lg flex items-center gap-2">
          <div className="w-4 h-4 flex items-center justify-center"><i className="ri-error-warning-line"></i></div>
          {aiUsageWarning}
        </div>
      )}

      {/* Site selector empty state */}
      {!selectedSite && (
        <SiteSelector siteId={selectedSite} onSelect={setSelectedSite} />
      )}

      {selectedSite && (
        <>
          {/* Filters */}
          <div className="bg-[#111827]/60 border border-gray-800 rounded-xl p-4 space-y-3">
            <div className="flex flex-col lg:flex-row lg:items-center gap-3">
              <select
                value={selectedSite || ''}
                onChange={(e) => setSelectedSite(e.target.value || null)}
                className="bg-gray-800/60 border border-gray-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-blue-500 cursor-pointer pr-8 flex-shrink-0"
              >
                <option value="">Change site...</option>
                <option disabled>—</option>
                <option value="">(choose from list)</option>
              </select>

              <div className="relative flex-1 max-w-sm">
                <div className="w-5 h-5 flex items-center justify-center absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">
                  <i className="ri-search-line text-sm"></i>
                </div>
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search entries..."
                  className="w-full bg-gray-800/60 border border-gray-700 rounded-lg pl-10 pr-4 py-2 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-blue-500"
                />
              </div>

              <select
                value={entryTypeFilter}
                onChange={(e) => setEntryTypeFilter(e.target.value)}
                className="bg-gray-800/60 border border-gray-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-blue-500 cursor-pointer pr-8"
              >
                <option value="">All types</option>
                <option value="Shift Start">Shift Start</option>
                <option value="Shift End">Shift End</option>
                <option value="Patrol Check">Patrol Check</option>
                <option value="Visitor">Visitor</option>
                <option value="Delivery">Delivery</option>
                <option value="Incident">Incident</option>
                <option value="Maintenance">Maintenance</option>
                <option value="Communication">Communication</option>
                <option value="Health & Safety">Health & Safety</option>
                <option value="Lost Property">Lost Property</option>
                <option value="Note">Note</option>
                <option value="Other">Other</option>
              </select>

              <select
                value={guardFilter}
                onChange={(e) => setGuardFilter(e.target.value)}
                className="bg-gray-800/60 border border-gray-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-blue-500 cursor-pointer pr-8"
              >
                <option value="">All guards</option>
                {uniqueGuards.map((g) => <option key={g.id} value={g.id}>{g.name}</option>)}
              </select>
            </div>

            <div className="flex flex-col sm:flex-row sm:items-center gap-3">
              <div className="flex items-center gap-2">
                <label className="text-xs text-gray-500 whitespace-nowrap">From</label>
                <input
                  type="date"
                  value={fromDate}
                  onChange={(e) => setFromDate(e.target.value)}
                  className="bg-gray-800/60 border border-gray-700 rounded-lg px-3 py-1.5 text-sm text-white focus:outline-none focus:border-blue-500"
                />
              </div>
              <div className="flex items-center gap-2">
                <label className="text-xs text-gray-500 whitespace-nowrap">To</label>
                <input
                  type="date"
                  value={toDate}
                  onChange={(e) => setToDate(e.target.value)}
                  className="bg-gray-800/60 border border-gray-700 rounded-lg px-3 py-1.5 text-sm text-white focus:outline-none focus:border-blue-500"
                />
              </div>
              <div className="flex items-center gap-2 ml-auto">
                <div className="flex items-center gap-1.5 px-2 py-1 rounded-lg bg-emerald-500/10 border border-emerald-500/20">
                  <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
                  <span className="text-xs text-emerald-400 font-medium">Live</span>
                </div>
                <button
                  onClick={() => setNewestFirst(!newestFirst)}
                  className="text-xs text-gray-400 hover:text-white transition-colors cursor-pointer whitespace-nowrap"
                >
                  {newestFirst ? 'Newest first' : 'Oldest first'}
                </button>
              </div>
            </div>
          </div>

          {/* Feed */}
          {error && (
            <div className="bg-red-500/10 border border-red-500/20 text-red-400 text-sm px-4 py-3 rounded-lg flex items-center gap-2">
              <div className="w-4 h-4 flex items-center justify-center"><i className="ri-error-warning-line"></i></div>
              {error}
            </div>
          )}

          {loading && entries.length === 0 ? (
            <div className="flex items-center justify-center py-16">
              <div className="w-8 h-8 border-2 border-blue-500/30 border-t-blue-500 rounded-full animate-spin"></div>
            </div>
          ) : entries.length === 0 ? (
            <div className="text-center py-16">
              <div className="w-12 h-12 mx-auto flex items-center justify-center text-gray-600 mb-3">
                <i className="ri-book-open-line text-2xl"></i>
              </div>
              <p className="text-sm text-gray-500">No entries for this site and date range.</p>
            </div>
          ) : (
            <OBFeed
              entries={entries}
              newestFirst={newestFirst}
              onEdit={(entry) => { setEditingEntry(entry); setModalOpen(true); }}
              onDelete={handleDelete}
              hasMore={hasMore}
              loadingMore={loadingMore}
              onLoadMore={async () => { setLoadingMore(true); await loadMore(); setLoadingMore(false); }}
              onSummariseAll={handleSummariseAll}
              summarisingAll={summarisingAll}
              siteName={selectedSiteName}
              onDailyDigest={handleDailyDigest}
              digestLoading={summarisingDay}
              summarisingIds={summarisingIds}
            />
          )}
        </>
      )}

      {/* Quick entry bar */}
      <QuickEntryBar
        siteId={selectedSite}
        onAdd={handleQuickAdd}
        onOpenModal={() => { setEditingEntry(null); setModalOpen(true); }}
        saving={saving}
      />

      {/* Modal */}
      {modalOpen && (
        <NewEntryModal
          editingEntry={editingEntry}
          preselectedSiteId={selectedSite}
          onSave={editingEntry ? handleEdit : handleAddEntry}
          onClose={() => { setModalOpen(false); setEditingEntry(null); }}
          saving={saving}
        />
      )}

      {digestOpen && (
        <DailyDigestModal
          summary={digestText}
          siteName={selectedSiteName}
          date={digestDate}
          onClose={() => setDigestOpen(false)}
        />
      )}

      {toast && <Toast message={toast} onDismiss={() => setToast(null)} />}
    </div>
  );
}