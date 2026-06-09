'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/lib/auth';

interface Pattern {
  day_of_week: number;
  shift_type: string;
  start_time: string;
  end_time: string;
  guards_required: number;
}

const dayNames = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
const fullDayNames = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

export default function SiteCoverPlan({ siteId }: { siteId: string }) {
  const { companyId } = useAuth();
  const [patterns, setPatterns] = useState<Pattern[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!siteId || !companyId) return;
    setLoading(true);
    supabase
      .from('site_shift_patterns')
      .select('day_of_week, shift_type, start_time, end_time, guards_required')
      .eq('site_id', siteId)
      .eq('company_id', companyId)
      .order('day_of_week')
      .then(({ data }) => {
        setPatterns(data || []);
        setLoading(false);
      });
  }, [siteId, companyId]);

  if (loading) {
    return (
      <div className="bg-[#111827]/60 border border-gray-800 rounded-xl p-5">
        <div className="animate-pulse space-y-3">
          <div className="h-4 w-32 bg-gray-800 rounded" />
          <div className="grid grid-cols-7 gap-2">
            {Array.from({ length: 7 }).map((_, i) => (
              <div key={i} className="h-24 bg-gray-800/50 rounded-lg" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  const shiftTypeStyle = (t: string) => {
    switch (t) {
      case 'day': return 'bg-amber-500/10 text-amber-400 border-amber-500/20';
      case 'night': return 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20';
      case '24h': return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20';
      default: return 'bg-gray-700 text-gray-400 border-gray-600';
    }
  };

  const shiftTypeDot = (t: string) => {
    switch (t) {
      case 'day': return 'bg-amber-400';
      case 'night': return 'bg-indigo-400';
      case '24h': return 'bg-emerald-400';
      default: return 'bg-gray-500';
    }
  };

  const patternsByDay = fullDayNames.map((_, i) => patterns.filter(p => p.day_of_week === i));
  const totalGuards = patterns.reduce((s, p) => s + p.guards_required, 0);
  const totalHours = patterns.reduce((s, p) => {
    const sh = parseInt(p.start_time.slice(0, 2));
    const sm = parseInt(p.start_time.slice(3, 5));
    const eh = parseInt(p.end_time.slice(0, 2));
    const em = parseInt(p.end_time.slice(3, 5));
    let hrs = eh - sh;
    let mins = em - sm;
    if (mins < 0) { hrs -= 1; mins += 60; }
    if (hrs < 0) hrs += 24;
    return s + (hrs + mins / 60) * p.guards_required;
  }, 0);
  const coveredDays = patternsByDay.filter(list => list.some(p => p.guards_required > 0)).length;

  return (
    <div className="bg-[#111827]/60 border border-gray-800 rounded-xl p-5">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
        <h2 className="text-sm font-semibold text-white flex items-center gap-2">
          <div className="w-4 h-4 flex items-center justify-center"><i className="ri-calendar-todo-line text-blue-400"></i></div>
          Weekly Cover Plan
        </h2>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-amber-400" />
            <span className="text-xs text-gray-400">Day</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-indigo-400" />
            <span className="text-xs text-gray-400">Night</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-400" />
            <span className="text-xs text-gray-400">24hr</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-7 gap-2 mb-4">
        {dayNames.map((d, i) => {
          const slots = patternsByDay[i];
          const has = slots.some(p => p.guards_required > 0);
          return (
            <div
              key={i}
              className={`rounded-lg border p-2.5 transition-colors ${
                has ? 'bg-gray-800/50 border-gray-700/60' : 'bg-gray-800/20 border-gray-800/40 text-gray-500'
              }`}
            >
              <p className="text-xs font-medium text-center text-gray-400 mb-2">{d}</p>
              {has ? (
                <div className="space-y-1.5">
                  {slots.filter(s => s.guards_required > 0).map((p, idx) => (
                    <div key={idx} className={`rounded-md border p-1.5 text-center ${shiftTypeStyle(p.shift_type)}`}>
                      <div className="flex items-center justify-center gap-1">
                        <span className={`w-1.5 h-1.5 rounded-full ${shiftTypeDot(p.shift_type)}`} />
                        <span className="text-[11px] font-medium">{p.guards_required} guard{p.guards_required > 1 ? 's' : ''}</span>
                      </div>
                      <p className="text-[10px] opacity-80 mt-0.5">{p.start_time.slice(0, 5)}–{p.end_time.slice(0, 5)}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-center text-gray-600 py-2">—</p>
              )}
            </div>
          );
        })}
      </div>

      <div className="grid grid-cols-3 gap-3">
        <div className="bg-gray-800/40 rounded-lg p-3 text-center">
          <p className="text-lg font-bold text-white">{coveredDays}/7</p>
          <p className="text-xs text-gray-400">days covered</p>
        </div>
        <div className="bg-gray-800/40 rounded-lg p-3 text-center">
          <p className="text-lg font-bold text-white">{totalGuards}</p>
          <p className="text-xs text-gray-400">guard slots / week</p>
        </div>
        <div className="bg-gray-800/40 rounded-lg p-3 text-center">
          <p className="text-lg font-bold text-white">{Math.round(totalHours)}</p>
          <p className="text-xs text-gray-400">hours / week</p>
        </div>
      </div>
    </div>
  );
}