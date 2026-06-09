'use client';

import { useEffect, useState, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/lib/auth';
import { startOfWeek, addDays, format, addWeeks } from 'date-fns';
import { useRouter } from 'next/navigation';

interface Pattern {
  day_of_week: number;
  shift_type: string;
  start_time: string;
  end_time: string;
  guards_required: number;
}

interface GuardOption {
  id: string;
  name: string;
  sia_status: string;
}

interface ShiftSlot {
  day_of_week: number;
  date: string;
  shift_type: string;
  start_time: string;
  end_time: string;
  guard_id: string | null;
}

const fullDayNames = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

export default function AutoShiftGenerator({ siteId, siteName }: { siteId: string; siteName: string }) {
  const { companyId } = useAuth();
  const router = useRouter();

  const [patterns, setPatterns] = useState<Pattern[]>([]);
  const [guards, setGuards] = useState<GuardOption[]>([]);
  const [weekStart, setWeekStart] = useState('');
  const [slots, setSlots] = useState<ShiftSlot[]>([]);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
  const [createdCount, setCreatedCount] = useState(0);

  useEffect(() => {
    const nextMonday = startOfWeek(addWeeks(new Date(), 1), { weekStartsOn: 1 });
    setWeekStart(format(nextMonday, 'yyyy-MM-dd'));
  }, []);

  const loadData = useCallback(async () => {
    if (!siteId || !companyId) return;
    setLoading(true);

    const [{ data: pData }, { data: gData }] = await Promise.all([
      supabase
        .from('site_shift_patterns')
        .select('day_of_week, shift_type, start_time, end_time, guards_required')
        .eq('site_id', siteId)
        .eq('company_id', companyId)
        .order('day_of_week'),
      supabase
        .from('guards')
        .select('id, first_name, last_name, sia_expiry')
        .eq('company_id', companyId)
        .eq('status', 'active')
        .order('first_name'),
    ]);

    setPatterns(pData || []);

    const guardList = (gData || []).map((g: any) => {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const exp = g.sia_expiry ? new Date(g.sia_expiry) : null;
      let status = 'valid';
      if (!exp) status = 'unknown';
      else if (exp < today) status = 'expired';
      else {
        const days = Math.ceil((exp.getTime() - today.getTime()) / (86400000));
        if (days <= 60) status = 'expiring_soon';
      }
      return {
        id: g.id,
        name: `${g.first_name || ''} ${g.last_name || ''}`.trim() || 'Unnamed',
        sia_status: status,
      };
    });
    setGuards(guardList);
    setLoading(false);
  }, [siteId, companyId]);

  useEffect(() => { loadData(); }, [loadData]);

  useEffect(() => {
    if (!weekStart || patterns.length === 0) { setSlots([]); return; }
    const base = new Date(weekStart + 'T00:00:00');
    const newSlots: ShiftSlot[] = [];
    patterns.forEach(p => {
      if (p.guards_required <= 0) return;
      const date = format(addDays(base, p.day_of_week), 'yyyy-MM-dd');
      for (let i = 0; i < p.guards_required; i++) {
        newSlots.push({
          day_of_week: p.day_of_week,
          date,
          shift_type: p.shift_type,
          start_time: p.start_time.slice(0, 5),
          end_time: p.end_time.slice(0, 5),
          guard_id: null,
        });
      }
    });
    setSlots(newSlots);
    setCreatedCount(0);
  }, [weekStart, patterns]);

  const updateSlotGuard = (index: number, guardId: string | null) => {
    setSlots(prev => prev.map((s, i) => i === index ? { ...s, guard_id: guardId } : s));
  };

  const handleGenerate = async () => {
    if (!companyId || slots.length === 0) return;
    setGenerating(true);

    const inserts = slots.map(s => {
      const sDate = new Date(`${s.date}T${s.start_time}:00`);
      let eDate = new Date(`${s.date}T${s.end_time}:00`);
      if (eDate <= sDate) eDate.setDate(eDate.getDate() + 1);
      return {
        company_id: companyId,
        site_id: siteId,
        guard_id: s.guard_id,
        start_time: sDate.toISOString(),
        end_time: eDate.toISOString(),
        shift_type: s.shift_type,
        status: 'scheduled',
        notes: `Auto-generated for ${siteName}`,
      };
    });

    const { error } = await supabase.from('shifts').insert(inserts);
    if (!error) {
      setCreatedCount(inserts.length);
      setToast(`Created ${inserts.length} shifts successfully`);
      setSlots(prev => prev.map(s => ({ ...s, guard_id: null })));
    } else {
      setToast('Failed to create shifts');
    }
    setGenerating(false);
    setTimeout(() => setToast(null), 3000);
  };

  const shiftTypeDot = (t: string) => {
    if (t === 'day') return 'bg-amber-400';
    if (t === 'night') return 'bg-indigo-400';
    return 'bg-emerald-400';
  };

  if (loading) {
    return (
      <div className="animate-pulse space-y-4">
        <div className="h-10 w-48 bg-gray-800 rounded-lg" />
        <div className="h-64 bg-gray-800/50 rounded-xl" />
      </div>
    );
  }

  if (patterns.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="w-12 h-12 mx-auto mb-4 flex items-center justify-center rounded-xl bg-gray-800/50">
          <i className="ri-calendar-todo-line text-gray-500 text-xl" />
        </div>
        <h3 className="text-sm font-medium text-gray-300 mb-1">No cover plan found</h3>
        <p className="text-sm text-gray-500">Set up a cover plan for this site first to auto-generate shifts.</p>
      </div>
    );
  }

  const totalGuards = slots.length;
  const assignedCount = slots.filter(s => s.guard_id).length;
  const totalHours = slots.reduce((sum, s) => {
    const sh = parseInt(s.start_time.slice(0, 2));
    const sm = parseInt(s.start_time.slice(3, 5));
    const eh = parseInt(s.end_time.slice(0, 2));
    const em = parseInt(s.end_time.slice(3, 5));
    let hrs = eh - sh;
    let mins = em - sm;
    if (mins < 0) { hrs -= 1; mins += 60; }
    if (hrs < 0) hrs += 24;
    return sum + hrs + mins / 60;
  }, 0);

  return (
    <div className="space-y-5">
      {toast && (
        <div className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-sm px-4 py-3 rounded-lg flex items-center gap-2">
          <div className="w-4 h-4 flex items-center justify-center"><i className="ri-check-line" /></div>
          {toast}
        </div>
      )}

      <div className="flex flex-col sm:flex-row sm:items-center gap-4">
        <div>
          <label className="block text-xs text-gray-500 mb-1">Week Starting (Monday)</label>
          <input
            type="date"
            value={weekStart}
            onChange={(e) => {
              const d = new Date(e.target.value + 'T00:00:00');
              const day = d.getDay();
              const monday = addDays(d, day === 0 ? -6 : -(day - 1));
              setWeekStart(format(monday, 'yyyy-MM-dd'));
            }}
            className="bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-blue-500"
          />
        </div>
        <div className="flex items-center gap-3 ml-auto">
          <div className="text-right">
            <p className="text-lg font-bold text-white">{totalGuards}</p>
            <p className="text-xs text-gray-500">shifts</p>
          </div>
          <div className="text-right">
            <p className="text-lg font-bold text-white">{Math.round(totalHours)}</p>
            <p className="text-xs text-gray-500">hours</p>
          </div>
          <div className="text-right">
            <p className="text-lg font-bold text-white">{assignedCount}</p>
            <p className="text-xs text-gray-500">assigned</p>
          </div>
        </div>
      </div>

      <div className="bg-[#111827]/60 border border-gray-800 rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-800/40">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase">Day</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase">Shift</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase">Time</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase">Assign Guard</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-800">
              {slots.map((slot, i) => (
                <tr key={i} className="hover:bg-gray-800/20 transition-colors">
                  <td className="px-4 py-3">
                    <p className="text-sm font-medium text-white">{fullDayNames[slot.day_of_week]}</p>
                    <p className="text-xs text-gray-500">{slot.date}</p>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <span className={`w-2 h-2 rounded-full ${shiftTypeDot(slot.shift_type)}`} />
                      <span className="text-sm text-gray-300 capitalize">{slot.shift_type === '24h' ? '24hr' : slot.shift_type}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-300 font-mono">
                    {slot.start_time} – {slot.end_time}
                  </td>
                  <td className="px-4 py-3">
                    <GuardDropdown
                      guards={guards}
                      value={slot.guard_id}
                      onChange={(id) => updateSlotGuard(i, id)}
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="flex items-center justify-between">
        <p className="text-xs text-gray-500">
          {assignedCount} of {totalGuards} shifts have a guard assigned. Unassigned shifts will be created as open slots.
        </p>
        <button
          onClick={handleGenerate}
          disabled={generating || slots.length === 0}
          className="bg-blue-600 hover:bg-blue-500 text-white text-sm font-medium px-5 py-2.5 rounded-lg transition-colors disabled:opacity-50 cursor-pointer whitespace-nowrap inline-flex items-center gap-2"
        >
          {generating && <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />}
          {generating ? 'Creating...' : `Create ${slots.length} Shifts`}
        </button>
      </div>

      {createdCount > 0 && (
        <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-3 flex items-center gap-3">
          <div className="w-8 h-8 flex items-center justify-center rounded-lg bg-blue-500/20">
            <i className="ri-calendar-check-line text-blue-400 text-sm" />
          </div>
          <div>
            <p className="text-sm font-medium text-white">{createdCount} shifts created</p>
            <p className="text-xs text-gray-400">View them on the Rotas page</p>
          </div>
          <button
            onClick={() => router.push('/rotas')}
            className="ml-auto text-xs text-blue-400 hover:text-blue-300 cursor-pointer whitespace-nowrap"
          >
            View Rotas →
          </button>
        </div>
      )}
    </div>
  );
}

function GuardDropdown({ guards, value, onChange }: { guards: GuardOption[]; value: string | null; onChange: (id: string | null) => void }) {
  const [open, setOpen] = useState(false);
  const selected = guards.find(g => g.id === value);

  return (
    <div className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="w-full text-left bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-blue-500 flex items-center justify-between gap-2 min-w-[180px]"
      >
        <span className={selected ? 'text-white' : 'text-gray-500'}>
          {selected ? selected.name : 'Select guard...'}
        </span>
        <div className="w-4 h-4 flex items-center justify-center shrink-0">
          <i className={`ri-arrow-down-s-line text-gray-500 transition-transform ${open ? 'rotate-180' : ''}`} />
        </div>
      </button>
      {open && (
        <div className="absolute z-20 mt-1 w-full bg-[#1f2937] border border-gray-700 rounded-lg shadow-lg max-h-56 overflow-y-auto">
          <button
            onClick={() => { onChange(null); setOpen(false); }}
            className="w-full text-left px-3 py-2 text-sm text-gray-400 hover:bg-gray-800/50 hover:text-white transition-colors cursor-pointer"
          >
            — Leave unassigned
          </button>
          {guards.map(g => (
            <button
              key={g.id}
              onClick={() => { onChange(g.id); setOpen(false); }}
              className="w-full text-left px-3 py-2 text-sm hover:bg-gray-800/50 transition-colors cursor-pointer flex items-center gap-2"
            >
              <span className={g.sia_status === 'expired' ? 'text-red-400' : g.sia_status === 'expiring_soon' ? 'text-amber-400' : 'text-white'}>
                {g.name}
              </span>
              {g.sia_status === 'expired' && <span className="text-[10px] bg-red-500/20 text-red-400 px-1.5 py-0.5 rounded">SIA expired</span>}
              {g.sia_status === 'expiring_soon' && <span className="text-[10px] bg-amber-500/20 text-amber-400 px-1.5 py-0.5 rounded">SIA expiring</span>}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}