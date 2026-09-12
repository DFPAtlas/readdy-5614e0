import { useState } from 'react';
import Link from 'next/link';
import CoverPlanGenerator from './CoverPlanGenerator';

interface Props {
  weekRange: string;
  weekStart: Date;
  onPrev: () => void;
  onNext: () => void;
  onToday: () => void;
  view: 'week' | 'month';
  onToggleView: () => void;
  onAddShift: () => void;
  sites: { id: string; site_name: string; risk_level: string | null }[];
  selectedSiteId: string | null;
  onSelectSite: (siteId: string | null) => void;
  onGenerateDone?: () => void;
  onOpenTemplates?: () => void;
  onOpenShiftBuilder?: () => void;
  canUndo?: boolean;
  onUndo?: () => void;
  undoLabel?: string | null;
  undoCount?: number;
  onClearShifts?: () => void;
}

export default function RotaHeader({
  weekRange,
  weekStart,
  onPrev,
  onNext,
  onToday,
  view,
  onToggleView,
  onAddShift,
  sites,
  selectedSiteId,
  onSelectSite,
  onGenerateDone,
  onOpenTemplates,
  onOpenShiftBuilder,
  canUndo,
  onUndo,
  undoLabel,
  undoCount,
  onClearShifts,
}: Props) {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [clearConfirm, setClearConfirm] = useState(false);

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-start justify-between gap-4 flex-wrap">
        {/* LEFT — title + period + undo */}
        <div className="flex items-center gap-3">
          <div>
            <h1 className="text-2xl font-bold text-white">Rotas</h1>
            <p className="text-gray-400 text-sm mt-1">{weekRange}</p>
          </div>
          {canUndo && onUndo && (
            <div className="relative group mt-1">
              <button
                onClick={onUndo}
                className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium border border-gray-700 bg-gray-800/60 text-amber-300 hover:text-amber-200 hover:bg-gray-800 transition-colors cursor-pointer whitespace-nowrap"
                title={undoLabel ? `Undo: ${undoLabel}` : 'Undo last change'}
              >
                <div className="w-4 h-4 flex items-center justify-center"><i className="ri-arrow-go-back-line"></i></div>
                Undo
                {typeof undoCount === 'number' && undoCount > 1 && (
                  <span className="text-[10px] text-gray-500 bg-gray-700/60 px-1 rounded ml-0.5">{undoCount}</span>
                )}
              </button>
              {undoLabel && (
                <div className="absolute right-0 top-full mt-1 hidden group-hover:block bg-[#1e2433] border border-gray-700 rounded-lg px-2.5 py-1 text-[11px] text-gray-300 shadow-xl whitespace-nowrap z-50">
                  {undoLabel}
                </div>
              )}
            </div>
          )}
        </div>

        {/* CENTRE — date navigation + view toggle */}
        <div className="flex items-center gap-2">
          <div className="flex items-center bg-gray-800/60 border border-gray-700 rounded-lg overflow-hidden">
            <button
              onClick={onPrev}
              className="px-3 py-2 text-gray-400 hover:text-white transition-colors cursor-pointer"
              title="Previous"
            >
              <div className="w-4 h-4 flex items-center justify-center"><i className="ri-arrow-left-s-line"></i></div>
            </button>
            <button
              onClick={onToday}
              className="px-3 py-2 text-sm font-medium text-gray-300 hover:text-white transition-colors border-x border-gray-700 cursor-pointer whitespace-nowrap"
            >
              Today
            </button>
            <button
              onClick={onNext}
              className="px-3 py-2 text-gray-400 hover:text-white transition-colors cursor-pointer"
              title="Next"
            >
              <div className="w-4 h-4 flex items-center justify-center"><i className="ri-arrow-right-s-line"></i></div>
            </button>
          </div>

          <div className="flex items-center bg-gray-800/60 border border-gray-700 rounded-full p-1">
            <button
              onClick={onToggleView}
              className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors cursor-pointer whitespace-nowrap ${
                view === 'week' ? 'bg-blue-600 text-white' : 'text-gray-400 hover:text-white'
              }`}
            >
              Week
            </button>
            <button
              onClick={onToggleView}
              className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors cursor-pointer whitespace-nowrap ${
                view === 'month' ? 'bg-blue-600 text-white' : 'text-gray-400 hover:text-white'
              }`}
            >
              Month
            </button>
          </div>
        </div>

        {/* RIGHT — site filter + actions */}
        <div className="flex items-center gap-2 flex-wrap">
          {sites.length > 0 && (
            <div className="relative">
              <button
                onClick={() => setDropdownOpen((v) => !v)}
                className="inline-flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium border border-gray-700 bg-gray-800/60 text-gray-300 hover:text-white transition-colors cursor-pointer whitespace-nowrap"
              >
                <div className="w-4 h-4 flex items-center justify-center"><i className="ri-building-line"></i></div>
                {selectedSiteId
                  ? sites.find((s) => s.id === selectedSiteId)?.site_name || 'All Sites'
                  : 'All Sites'}
                <div className="w-3.5 h-3.5 flex items-center justify-center text-gray-500">
                  <i className={dropdownOpen ? 'ri-arrow-up-s-line' : 'ri-arrow-down-s-line'}></i>
                </div>
              </button>

              {dropdownOpen && (
                <>
                  <div className="fixed inset-0 z-40" onClick={() => setDropdownOpen(false)} />
                  <div className="absolute right-0 top-full mt-1 z-50 w-56 bg-[#1a1f2e] border border-gray-700 rounded-lg shadow-xl overflow-hidden">
                    <button
                      onClick={() => { onSelectSite(null); setDropdownOpen(false); }}
                      className={`w-full text-left px-4 py-2.5 text-sm cursor-pointer transition-colors ${
                        selectedSiteId === null ? 'bg-blue-600/20 text-blue-300' : 'text-gray-300 hover:bg-gray-800/40'
                      }`}
                    >
                      All Sites
                    </button>
                    {sites.map((site) => (
                      <button
                        key={site.id}
                        onClick={() => { onSelectSite(site.id); setDropdownOpen(false); }}
                        className={`w-full text-left px-4 py-2.5 text-sm cursor-pointer transition-colors flex items-center justify-between ${
                          selectedSiteId === site.id ? 'bg-blue-600/20 text-blue-300' : 'text-gray-300 hover:bg-gray-800/40'
                        }`}
                      >
                        <span className="truncate">{site.site_name}</span>
                        <span className="text-[10px] uppercase font-medium ml-2 shrink-0">
                          {site.risk_level || 'medium'}
                        </span>
                      </button>
                    ))}
                  </div>
                </>
              )}
            </div>
          )}

          <Link
            href="/dashboard/site-assignments"
            className="inline-flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium border border-gray-700 bg-gray-800/60 text-gray-300 hover:text-white transition-colors cursor-pointer whitespace-nowrap"
          >
            <div className="w-4 h-4 flex items-center justify-center"><i className="ri-grid-line"></i></div>
            Site Eligibility
          </Link>

          <MoreActionsDropdown
            onAddShift={onAddShift}
            onOpenTemplates={onOpenTemplates}
            onOpenShiftBuilder={onOpenShiftBuilder}
          />

          {onAddShift && (
            <button
              onClick={onAddShift}
              className="inline-flex items-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-500 text-white text-sm font-medium rounded-lg transition-colors whitespace-nowrap cursor-pointer"
            >
              <div className="w-4 h-4 flex items-center justify-center"><i className="ri-add-line"></i></div>
              Add Shift
            </button>
          )}

          <CoverPlanGenerator
            weekStart={weekStart}
            siteId={selectedSiteId}
            onDone={onGenerateDone || onAddShift}
          />

          {onClearShifts && (
            <div className="relative">
              {!clearConfirm ? (
                <button
                  onClick={() => setClearConfirm(true)}
                  className="inline-flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium border border-red-500/30 bg-red-500/10 text-red-400 hover:text-red-300 hover:bg-red-500/15 transition-colors cursor-pointer whitespace-nowrap"
                  title="Remove all shifts for the current view"
                >
                  <div className="w-4 h-4 flex items-center justify-center"><i className="ri-eraser-line"></i></div>
                  Clear
                </button>
              ) : (
                <div className="flex items-center gap-2 bg-[#1a1f2e] border border-red-500/30 rounded-lg px-3 py-2 shadow-xl">
                  <span className="text-xs text-red-300 whitespace-nowrap">Clear all shifts?</span>
                  <button
                    onClick={() => { onClearShifts(); setClearConfirm(false); }}
                    className="text-xs font-medium px-2 py-1 rounded bg-red-600 hover:bg-red-500 text-white transition-colors cursor-pointer whitespace-nowrap"
                  >
                    Yes
                  </button>
                  <button
                    onClick={() => setClearConfirm(false)}
                    className="text-xs font-medium px-2 py-1 rounded bg-gray-700 hover:bg-gray-600 text-gray-300 transition-colors cursor-pointer whitespace-nowrap"
                  >
                    Cancel
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function MoreActionsDropdown({
  onAddShift,
  onOpenTemplates,
  onOpenShiftBuilder,
}: {
  onAddShift?: () => void;
  onOpenTemplates?: () => void;
  onOpenShiftBuilder?: () => void;
}) {
  const [open, setOpen] = useState(false);

  if (!onOpenTemplates && !onOpenShiftBuilder) return null;

  return (
    <div className="relative">
      <button
        onClick={() => setOpen((v) => !v)}
        className="inline-flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium border border-gray-700 bg-gray-800/60 text-gray-300 hover:text-white transition-colors cursor-pointer whitespace-nowrap"
      >
        <div className="w-4 h-4 flex items-center justify-center"><i className="ri-tools-line"></i></div>
        Tools
        <div className="w-3.5 h-3.5 flex items-center justify-center text-gray-500">
          <i className={open ? 'ri-arrow-up-s-line' : 'ri-arrow-down-s-line'}></i>
        </div>
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
          <div className="absolute right-0 top-full mt-1 z-50 w-56 bg-[#1a1f2e] border border-gray-700 rounded-lg shadow-xl overflow-hidden">
            {onOpenShiftBuilder && (
              <button
                onClick={() => { onOpenShiftBuilder(); setOpen(false); }}
                className="w-full text-left px-4 py-2.5 text-sm text-gray-300 hover:bg-gray-800/40 cursor-pointer transition-colors flex items-center gap-2"
              >
                <div className="w-4 h-4 flex items-center justify-center"><i className="ri-stack-line text-blue-400"></i></div>
                Build from Pattern
              </button>
            )}
            {onOpenTemplates && (
              <button
                onClick={() => { onOpenTemplates(); setOpen(false); }}
                className="w-full text-left px-4 py-2.5 text-sm text-gray-300 hover:bg-gray-800/40 cursor-pointer transition-colors flex items-center gap-2"
              >
                <div className="w-4 h-4 flex items-center justify-center"><i className="ri-folders-line text-violet-400"></i></div>
                Manage Templates
              </button>
            )}
          </div>
        </>
      )}
    </div>
  );
}