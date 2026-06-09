'use client';

import { useState, useCallback, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/lib/auth';
import { addDays, format } from 'date-fns';

interface Pattern {
  day_of_week: number;
  shift_type: string;
  start_time: string;
  end_time: string;
  guards_required: number;
}

interface Props {
  siteId: string;
  siteName: string;
  weekStart: Date;
  weekEnd: Date;
  existingShiftCount: number;
  onDone: () => void;
}

export default function BuildRotaBanner({ siteId, siteName, weekStart, weekEnd, existingShiftCount, onDone }: Props) {
  const { companyId } = useAuth();
  const [patterns, setPatterns] = useState<Pattern[]>([]);
  const [loading, setLoading] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [clearing, setClearing] = useState(false);
  const [confirmClear, setConfirmClear] = useState(false);

  const loadPatterns = useCallback(async () => {
    if (!companyId || !siteId) return;
    setLoading(true);
    const { data } = await supabase
      .from('site_shift_patterns')
      .select('day_of_week, shift_type, start_time, end_time, guards_required')
      .eq('company_id', companyId)
      .eq('site_id', siteId)
      .gt('guards_required', 0)
      .order('day_of_week');
    setPatterns(data || []);
    setLoading(false);
  }, [companyId, siteId]);

  useEffect(() => {
    loadPatterns();
  }, [loadPatterns]);

  const handleBuild = async () => {
    if (!companyId || patterns.length === 0) return;
    setGenerating(true);

    const base = new Date(format(weekStart, 'yyyy-MM-dd') + 'T00:00:00');
    const inserts: any[] = [];

    patterns.forEach((p) => {
      const dateStr = format(addDays(base, p.day_of_week), 'yyyy-MM-dd');
      for (let i = 0; i < p.guards_required; i++) {
        const sDate = new Date(`${dateStr}T${p.start_time.slice(0, 5)}:00`);
        let eDate = new Date(`${dateStr}T${p.end_time.slice(0, 5)}:00`);
        if (eDate <= sDate) eDate.setDate(eDate.getDate() + 1);

        inserts.push({
          company_id: companyId,
          site_id: siteId,
          guard_id: null,
          start_time: sDate.toISOString(),
          end_time: eDate.toISOString(),
          shift_type: p.shift_type,
          status: 'scheduled',
          notes: `Auto-generated from cover plan`,
        });
      }
    });

    const { error } = await supabase.from('shifts').insert(inserts);
    setGenerating(false);

    if (!error) {
      onDone();
    }
  };

  const handleClear = async () => {
    if (!companyId || !siteId) return;
    setClearing(true);
    const { error } = await supabase
      .from('shifts')
      .delete()
      .eq('company_id', companyId)
      .eq('site_id', siteId)
      .gte('start_time', weekStart.toISOString())
      .lt('start_time', weekEnd.toISOString());
    setClearing(false);
    setConfirmClear(false);

    if (!error) {
      onDone();
    }
  };

  const handleRebuild = async () => {
    await handleClear();
    await handleBuild();
  };

  const totalPlanned = patterns.reduce((sum, p) => sum + p.guards_required, 0);

  // Shifts exist — show compact status bar with clear/rebuild
  if (existingShiftCount > 0) {
    return (
      <div className="flex items-center justify-between bg-gray-800/40 border border-gray-800 rounded-xl px-4 py-3">
        <div className="flex items-center gap-2 text-sm">
          <div className="w-2 h-2 rounded-full bg-emerald-400" />
          <span className="text-gray-300">
            {existingShiftCount} shift{existingShiftCount > 1 ? 's' : ''} scheduled for {siteName}
          </span>
          {totalPlanned > 0 && (
            <span className="text-xs text-gray-500">
              (cover plan: {totalPlanned})
            </span>
          )}
        </div>
        <div className="flex items-center gap-2">
          {totalPlanned > 0 && (
            <button
              onClick={handleRebuild}
              disabled={clearing || generating}
              className="text-xs text-blue-400 hover:text-blue-300 transition-colors cursor-pointer whitespace-nowrap"
            >
              {generating ? 'Rebuilding...' : 'Rebuild'}
            </button>
          )}
          <button
            onClick={() => setConfirmClear(true)}
            disabled={clearing}
            className="text-xs text-red-400 hover:text-red-300 transition-colors cursor-pointer whitespace-nowrap"
          >
            {clearing ? 'Clearing...' : 'Clear All'}
          </button>
        </div>

        {confirmClear && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/60" onClick={() => setConfirmClear(false)} />
            <div className="relative bg-[#111827] border border-gray-800 rounded-xl p-5 w-full max-w-sm">
              <h3 className="text-sm font-semibold text-white mb-1">Clear all shifts?</h3>
              <p className="text-xs text-gray-400">
                This will permanently delete {existingShiftCount} shift{existingShiftCount > 1 ? 's' : ''} for {siteName} in the current week. Guards will be unassigned.
              </p>
              <div className="flex justify-end gap-2 mt-4">
                <button
                  onClick={() => setConfirmClear(false)}
                  className="px-3 py-1.5 text-sm text-gray-300 hover:text-white cursor-pointer whitespace-nowrap"
                >
                  Cancel
                </button>
                <button
                  onClick={handleClear}
                  disabled={clearing}
                  className="px-3 py-1.5 text-sm bg-red-600 hover:bg-red-500 text-white rounded-lg cursor-pointer whitespace-nowrap disabled:opacity-50"
                >
                  {clearing ? 'Clearing...' : 'Clear All'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  // No shifts — show build prompt or no-cover-plan message
  if (loading) {
    return (
      <div className="bg-blue-500/10 border border-blue-500/20 rounded-xl p-4 flex items-center gap-3">
        <div className="w-4 h-4 border-2 border-blue-500/30 border-t-blue-500 rounded-full animate-spin" />
        <p className="text-sm text-gray-400">Checking cover plan for {siteName}...</p>
      </div>
    );
  }

  if (patterns.length === 0) {
    return (
      <div className="bg-amber-500/10 border border-amber-500/20 rounded-xl p-4 flex items-start gap-3">
        <div className="w-5 h-5 flex items-center justify-center text-amber-400 shrink-0 mt-0.5">
          <i className="ri-alert-line" />
        </div>
        <div>
          <p className="text-sm font-medium text-white">{siteName} has no cover plan</p>
          <p className="text-xs text-gray-400 mt-0.5">Set up a cover plan first to auto-build shifts.</p>
        </div>
      </div>
    );
  }

  const totalShifts = patterns.reduce((sum, p) => sum + p.guards_required, 0);
  const daysCovered = new Set(patterns.map((p) => p.day_of_week)).size;

  return (
    <div className="bg-blue-500/10 border border-blue-500/20 rounded-xl p-4 flex flex-col sm:flex-row sm:items-center gap-4">
      <div className="flex items-start gap-3 flex-1">
        <div className="w-10 h-10 rounded-lg bg-blue-500/20 flex items-center justify-center shrink-0 mt-0.5">
          <div className="w-5 h-5 flex items-center justify-center">
            <i className="ri-calendar-event-line text-blue-400" />
          </div>
        </div>
        <div>
          <p className="text-sm font-medium text-white">
            {siteName} has no shifts for {format(weekStart, 'd MMM')} – {format(weekEnd, 'd MMM')}
          </p>
          <p className="text-xs text-gray-400 mt-0.5">
            Cover plan ready: {totalShifts} shift{totalShifts > 1 ? 's' : ''} across {daysCovered} day{daysCovered > 1 ? 's' : ''}. Build the rota now and fill with guards.
          </p>
        </div>
      </div>
      <button
        onClick={handleBuild}
        disabled={generating}
        className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white text-sm font-medium px-4 py-2.5 rounded-lg transition-colors disabled:opacity-50 cursor-pointer whitespace-nowrap shrink-0"
      >
        {generating && <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />}
        {generating ? 'Building...' : `Build ${totalShifts} Shifts`}
      </button>
    </div>
  );
}