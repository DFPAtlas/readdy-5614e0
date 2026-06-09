'use client';

import { useState, useCallback, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/lib/auth';
import { addDays, format } from 'date-fns';

interface Pattern {
  site_id: string;
  day_of_week: number;
  shift_type: string;
  start_time: string;
  end_time: string;
  guards_required: number;
  site_name: string;
}

interface Props {
  weekStart: Date;
  siteId: string | null;
  onDone: () => void;
}

export default function CoverPlanGenerator({ weekStart, siteId, onDone }: Props) {
  const { companyId } = useAuth();
  const [open, setOpen] = useState(false);
  const [patterns, setPatterns] = useState<Pattern[]>([]);
  const [loading, setLoading] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
  const [createdCount, setCreatedCount] = useState(0);

  const loadPatterns = useCallback(async () => {
    if (!companyId || !open) return;
    setLoading(true);

    let query = supabase
      .from('site_shift_patterns')
      .select('site_id, day_of_week, shift_type, start_time, end_time, guards_required, sites(site_name)')
      .eq('company_id', companyId)
      .gt('guards_required', 0);

    if (siteId) {
      query = query.eq('site_id', siteId);
    }

    const { data, error } = await query.order('day_of_week');

    if (error) {
      setToast('Failed to load cover plan');
    } else {
      setPatterns(
        (data || []).map((row: any) => ({
          site_id: row.site_id,
          day_of_week: row.day_of_week,
          shift_type: row.shift_type,
          start_time: row.start_time,
          end_time: row.end_time,
          guards_required: row.guards_required,
          site_name: row.sites?.site_name || 'Unknown Site',
        }))
      );
    }
    setLoading(false);
  }, [companyId, siteId, open]);

  useEffect(() => {
    if (open) loadPatterns();
  }, [open, loadPatterns]);

  const handleGenerate = async () => {
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
          site_id: p.site_id,
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

    if (!error) {
      setCreatedCount(inserts.length);
      setToast(`Created ${inserts.length} shifts from cover plan`);
      onDone();
      setTimeout(() => {
        setOpen(false);
        setCreatedCount(0);
        setPatterns([]);
      }, 2000);
    } else {
      setToast('Failed to generate shifts: ' + error.message);
    }
    setGenerating(false);
    setTimeout(() => setToast(null), 4000);
  };

  const totalShifts = patterns.reduce((sum, p) => sum + p.guards_required, 0);
  const groupedByDay = patterns.reduce<Record<number, Pattern[]>>((acc, p) => {
    acc[p.day_of_week] = acc[p.day_of_week] || [];
    acc[p.day_of_week].push(p);
    return acc;
  }, {});

  const dayNames = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="inline-flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium border border-gray-700 bg-gray-800/60 text-gray-300 hover:text-white transition-colors cursor-pointer whitespace-nowrap"
      >
        <div className="w-4 h-4 flex items-center justify-center"><i className="ri-magic-line"></i></div>
        Generate from Cover Plan
      </button>

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/60" onClick={() => setOpen(false)} />
          <div className="relative bg-[#111827] border border-gray-800 rounded-xl shadow-2xl w-full max-w-lg max-h-[80vh] flex flex-col">
            <div className="flex items-center justify-between px-5 py-4 border-b border-gray-800">
              <h3 className="text-base font-semibold text-white">Generate Shifts from Cover Plan</h3>
              <button onClick={() => setOpen(false)} className="text-gray-400 hover:text-white cursor-pointer">
                <div className="w-5 h-5 flex items-center justify-center"><i className="ri-close-line"></i></div>
              </button>
            </div>

            <div className="px-5 py-4 overflow-y-auto flex-1">
              <p className="text-sm text-gray-400 mb-3">
                Week starting <span className="text-white font-medium">{format(weekStart, 'EEEE d MMMM yyyy')}</span>
                {siteId ? ' for selected site' : ' across all sites'}.
              </p>

              {loading && (
                <div className="flex items-center gap-3 py-6">
                  <div className="w-5 h-5 border-2 border-blue-500/30 border-t-blue-500 rounded-full animate-spin" />
                  <p className="text-sm text-gray-400">Loading cover plan...</p>
                </div>
              )}

              {!loading && patterns.length === 0 && (
                <div className="text-center py-8">
                  <div className="w-10 h-10 mx-auto mb-3 flex items-center justify-center rounded-lg bg-gray-800/50">
                    <i className="ri-calendar-todo-line text-gray-500" />
                  </div>
                  <p className="text-sm text-gray-300">No cover plan found</p>
                  <p className="text-xs text-gray-500 mt-1">
                    {siteId
                      ? 'Set up a cover plan for this site first.'
                      : 'Sites need cover plans before shifts can be auto-generated.'}
                  </p>
                </div>
              )}

              {!loading && patterns.length > 0 && (
                <div className="space-y-3">
                  {Object.entries(groupedByDay).map(([dayNum, dayPatterns]) => (
                    <div key={dayNum} className="bg-gray-800/40 rounded-lg p-3">
                      <p className="text-xs font-semibold text-gray-300 uppercase mb-2">
                        {dayNames[parseInt(dayNum)]}
                      </p>
                      <div className="space-y-1.5">
                        {dayPatterns.map((p, i) => (
                          <div key={i} className="flex items-center justify-between text-sm">
                            <div className="flex items-center gap-2">
                              <span className="w-2 h-2 rounded-full bg-blue-400" />
                              <span className="text-gray-300">
                                {p.start_time.slice(0, 5)} – {p.end_time.slice(0, 5)}
                              </span>
                              <span className="text-xs text-gray-500 capitalize">({p.shift_type})</span>
                            </div>
                            <span className="text-xs text-gray-400">
                              {p.guards_required} guard{p.guards_required > 1 ? 's' : ''} · {p.site_name}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}

                  <div className="flex items-center justify-between pt-2 border-t border-gray-800">
                    <span className="text-sm text-gray-400">Total shifts to create</span>
                    <span className="text-lg font-bold text-white">{totalShifts}</span>
                  </div>
                </div>
              )}
            </div>

            <div className="px-5 py-4 border-t border-gray-800 flex items-center justify-between">
              {toast && (
                <span className={`text-sm ${toast.includes('Failed') ? 'text-red-400' : 'text-emerald-400'}`}>
                  {toast}
                </span>
              )}
              {!toast && <span />}
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setOpen(false)}
                  className="px-4 py-2 rounded-lg text-sm font-medium text-gray-300 hover:text-white transition-colors cursor-pointer whitespace-nowrap"
                >
                  Cancel
                </button>
                <button
                  onClick={handleGenerate}
                  disabled={generating || patterns.length === 0}
                  className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors disabled:opacity-50 cursor-pointer whitespace-nowrap"
                >
                  {generating && <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />}
                  {generating ? 'Creating...' : `Create ${totalShifts} Shifts`}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}