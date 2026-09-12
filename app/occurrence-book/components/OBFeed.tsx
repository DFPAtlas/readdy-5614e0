'use client';

import { useState, useEffect, useRef } from 'react';
import { format, isSameDay, isToday, isYesterday } from 'date-fns';
import { OBEntry, OB_TYPE_ICON, OB_TYPE_COLOR } from '@/lib/useOccurrenceBook';
import { useAuth } from '@/lib/auth';

interface Props {
  entries: OBEntry[];
  newestFirst: boolean;
  onEdit: (entry: OBEntry) => void;
  onDelete: (entry: OBEntry) => void;
  hasMore: boolean;
  loadingMore: boolean;
  onLoadMore: () => void;
  onSummariseAll: () => void;
  summarisingAll: boolean;
  siteName: string;
  onDailyDigest: () => void;
  digestLoading: boolean;
  summarisingIds: Set<string>;
}

function groupByDay(entries: OBEntry[], newestFirst: boolean) {
  const groups: Record<string, OBEntry[]> = {};
  const order = newestFirst ? [...entries] : [...entries].reverse();
  order.forEach((entry) => {
    const date = entry.occurred_at || entry.created_at;
    if (!date) return;
    const day = format(new Date(date), 'yyyy-MM-dd');
    if (!groups[day]) groups[day] = [];
    groups[day].push(entry);
  });
  const days = Object.keys(groups).sort((a, b) => newestFirst ? b.localeCompare(a) : a.localeCompare(b));
  return days.map((day) => ({ day, label: dayLabel(day), entries: groups[day] }));
}

function dayLabel(dayStr: string) {
  const d = new Date(dayStr + 'T00:00:00');
  if (isToday(d)) return 'Today';
  if (isYesterday(d)) return 'Yesterday';
  return format(d, 'EEE d MMM yyyy');
}

export default function OBFeed({ entries, newestFirst, onEdit, onDelete, hasMore, loadingMore, onLoadMore, onSummariseAll, summarisingAll, siteName, onDailyDigest, digestLoading, summarisingIds }: Props) {
  const observerRef = useRef<HTMLDivElement | null>(null);
  const groups = groupByDay(entries, newestFirst);

  useEffect(() => {
    if (!hasMore || loadingMore) return;
    const el = observerRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      (entries) => { if (entries[0].isIntersecting) onLoadMore(); },
      { rootMargin: '200px' }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [hasMore, loadingMore, onLoadMore]);

  const needsSummary = entries.filter((e) => (e.entry?.length || 0) > 200 && !e.ai_summary);

  return (
    <div className="space-y-6">
      {/* AI actions bar */}
      {entries.length > 0 && (
        <div className="flex items-center gap-2 flex-wrap">
          {needsSummary.length > 0 && (
            <button
              onClick={onSummariseAll}
              disabled={summarisingAll}
              className="inline-flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-medium border border-blue-500/30 bg-blue-600/10 text-blue-400 hover:bg-blue-600/20 transition-colors cursor-pointer whitespace-nowrap disabled:opacity-50"
            >
              {summarisingAll ? (
                <div className="w-3.5 h-3.5 border border-blue-400/30 border-t-blue-400 rounded-full animate-spin" />
              ) : (
                <div className="w-3.5 h-3.5 flex items-center justify-center"><i className="ri-sparkling-line" /></div>
              )}
              Summarise all ({needsSummary.length})
            </button>
          )}

          <button
            onClick={onDailyDigest}
            disabled={digestLoading}
            className="inline-flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-medium border border-gray-700 bg-gray-800/60 text-gray-300 hover:text-white hover:bg-gray-700/50 transition-colors cursor-pointer whitespace-nowrap disabled:opacity-50"
          >
            {digestLoading ? (
              <div className="w-3.5 h-3.5 border border-gray-400/30 border-t-gray-400 rounded-full animate-spin" />
            ) : (
              <div className="w-3.5 h-3.5 flex items-center justify-center"><i className="ri-article-line" /></div>
            )}
            Today's summary at {siteName}
          </button>
        </div>
      )}

      {groups.map((group) => (
        <div key={group.day}>
          <div className="flex items-center gap-3 mb-3">
            <div className="flex-1 h-px bg-gray-800"></div>
            <span className="text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">{group.label}</span>
            <div className="flex-1 h-px bg-gray-800"></div>
          </div>
          <div className="space-y-0">
            {group.entries.map((entry, idx) => (
              <OBEntryRow
                key={entry.id}
                entry={entry}
                isLast={idx === group.entries.length - 1}
                onEdit={onEdit}
                onDelete={onDelete}
                summarisingIds={summarisingIds}
              />
            ))}
          </div>
        </div>
      ))}
      {hasMore && (
        <div ref={observerRef} className="flex items-center justify-center py-6">
          {loadingMore ? (
            <div className="w-6 h-6 border-2 border-blue-500/30 border-t-blue-500 rounded-full animate-spin"></div>
          ) : (
            <div className="h-px w-full bg-gray-800"></div>
          )}
        </div>
      )}
    </div>
  );
}

function OBEntryRow({ entry, isLast, onEdit, onDelete, summarisingIds }: { entry: OBEntry; isLast: boolean; onEdit: (e: OBEntry) => void; onDelete: (e: OBEntry) => void; summarisingIds: Set<string>; }) {
  const { user } = useAuth();
  const isAdmin = user?.role === 'company_admin' || user?.role === 'super_admin';
  const type = entry.entry_type || 'Note';
  const color = OB_TYPE_COLOR[type] || OB_TYPE_COLOR['Note'];
  const icon = OB_TYPE_ICON[type] || 'ri-sticky-note-line';
  const time = entry.occurred_at ? format(new Date(entry.occurred_at), 'HH:mm') : '—';
  const canEdit = isAdmin && entry.created_at && (Date.now() - new Date(entry.created_at).getTime()) < 24 * 60 * 60 * 1000;

  const [expanded, setExpanded] = useState(false);
  const isGenerating = summarisingIds.has(entry.id);
  const isLong = (entry.entry?.length || 0) > 200;

  return (
    <div className="flex gap-3">
      <div className="flex flex-col items-center flex-shrink-0 w-8">
        <div className={`w-2.5 h-2.5 rounded-full ${color.dot} mt-1.5`}></div>
        {!isLast && <div className="w-px flex-1 bg-gray-800 my-1"></div>}
      </div>
      <div className="flex-1 pb-5">
        <div className="bg-[#111827]/60 border border-gray-800 rounded-xl p-3.5 hover:border-gray-700 transition-colors">
          <div className="flex items-start justify-between gap-3 mb-2">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-lg font-bold text-white tabular-nums">{time}</span>
              <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[11px] font-medium ${color.bg} ${color.text}`}>
                <div className="w-3 h-3 flex items-center justify-center">
                  <i className={icon}></i>
                </div>
                {type}
              </span>
              {entry.edited_at && (
                <span className="text-[11px] text-gray-500 italic">(edited)</span>
              )}
            </div>
            <div className="flex items-center gap-1 flex-shrink-0">
              {canEdit && (
                <>
                  <button onClick={() => onEdit(entry)} className="w-7 h-7 flex items-center justify-center rounded-md text-gray-500 hover:text-white hover:bg-gray-800/50 transition-colors cursor-pointer">
                    <div className="w-4 h-4 flex items-center justify-center"><i className="ri-pencil-line"></i></div>
                  </button>
                  <button onClick={() => onDelete(entry)} title="Permanently delete entry" className="w-7 h-7 flex items-center justify-center rounded-md text-gray-500 hover:text-red-400 hover:bg-red-500/10 border border-transparent hover:border-red-500/30 transition-colors cursor-pointer">
                    <div className="w-4 h-4 flex items-center justify-center"><i className="ri-delete-bin-line"></i></div>
                  </button>
                </>
              )}
              <div className="flex items-center gap-1.5 ml-1">
                <div className="w-6 h-6 rounded-full bg-gray-700 flex items-center justify-center text-gray-300 text-[10px] font-bold">
                  {(entry.reporter_name || 'S').split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2)}
                </div>
                <span className="text-xs text-gray-400 hidden sm:inline">{entry.reporter_name || 'Staff'}</span>
              </div>
            </div>
          </div>

          {/* AI Summary */}
          {entry.ai_summary && (
            <div className="mb-2.5 bg-blue-600/5 border border-blue-500/15 rounded-lg px-3 py-2">
              <div className="flex items-center gap-1.5 mb-1">
                <div className="w-3.5 h-3.5 flex items-center justify-center text-blue-400">
                  <i className="ri-sparkling-line text-xs"></i>
                </div>
                <span className="text-[10px] font-semibold uppercase tracking-wider text-blue-400">AI Summary</span>
              </div>
              <p className="text-xs text-blue-300/80 leading-relaxed">{entry.ai_summary}</p>
            </div>
          )}

          {isGenerating && (
            <div className="flex items-center gap-2 mb-2.5">
              <div className="w-3 h-3 border border-blue-400/30 border-t-blue-400 rounded-full animate-spin"></div>
              <span className="text-xs text-gray-500 italic">Generating summary...</span>
            </div>
          )}

          {!entry.ai_summary && isLong && !isGenerating && (
            <div className="flex items-center gap-2 mb-2.5">
              <div className="w-3 h-3 flex items-center justify-center text-gray-600">
                <i className="ri-sparkling-line text-xs"></i>
              </div>
              <span className="text-xs text-gray-600 italic">Waiting for AI summary...</span>
            </div>
          )}

          {/* Entry text — truncated to 3 lines unless expanded */}
          <div className={expanded ? '' : 'line-clamp-3'}>
            <p className="text-sm text-gray-300 leading-relaxed whitespace-pre-wrap">{entry.entry}</p>
          </div>

          {(entry.entry?.length || 0) > 180 && (
            <button
              onClick={() => setExpanded(!expanded)}
              className="text-xs text-blue-400 hover:text-blue-300 mt-1.5 transition-colors cursor-pointer whitespace-nowrap"
            >
              {expanded ? 'Read less' : 'Read more'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}