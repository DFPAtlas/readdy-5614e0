'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/lib/auth';

interface OverdueTraining {
  id: string;
  guard_name: string;
  module_title: string;
  module_category: string | null;
  score: number | null;
  expires_at: string;
  days_overdue: number;
}

export default function TrainingOverduePanel() {
  const { companyId } = useAuth();
  const [overdue, setOverdue] = useState<OverdueTraining[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!companyId) { setLoading(false); return; }
    const fetchOverdue = async () => {
      const { data: comps } = await supabase
        .from('training_completions')
        .select('id, module_id, guard_id, score, expires_at')
        .eq('company_id', companyId)
        .eq('passed', true)
        .not('expires_at', 'is', null);

      if (!comps || comps.length === 0) { setOverdue([]); setLoading(false); return; }

      const now = new Date();
      const overdueItems = comps.filter((c) => new Date(c.expires_at) < now);
      if (overdueItems.length === 0) { setOverdue([]); setLoading(false); return; }

      const guardIds = [...new Set(overdueItems.map((c) => c.guard_id))];
      const moduleIds = [...new Set(overdueItems.map((c) => c.module_id))];

      const [{ data: guards }, { data: mods }] = await Promise.all([
        supabase.from('guards').select('id, first_name, last_name').in('id', guardIds),
        supabase.from('training_modules').select('id, title, category').in('id', moduleIds),
      ]);

      const guardMap = new Map((guards || []).map((g) => [g.id, `${g.first_name || ''} ${g.last_name || ''}`.trim()]));
      const modMap = new Map((mods || []).map((m) => [m.id, m]));

      const result: OverdueTraining[] = overdueItems.map((c) => ({
        id: c.id,
        guard_name: guardMap.get(c.guard_id) || 'Unknown',
        module_title: modMap.get(c.module_id)?.title || 'Unknown',
        module_category: modMap.get(c.module_id)?.category || null,
        score: c.score,
        expires_at: c.expires_at,
        days_overdue: Math.ceil((now.getTime() - new Date(c.expires_at).getTime()) / (1000 * 60 * 60 * 24)),
      }));

      setOverdue(result);
      setLoading(false);
    };
    fetchOverdue();
  }, [companyId]);

  if (loading) {
    return (
      <div className="bg-[#0f172a]/70 backdrop-blur-sm border border-white/10 rounded-xl p-5">
        <div className="animate-pulse space-y-3">
          <div className="h-5 w-40 bg-white/5 rounded"></div>
          <div className="h-8 w-full bg-white/5 rounded"></div>
          <div className="h-8 w-full bg-white/5 rounded"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-[#0f172a]/70 backdrop-blur-sm border border-white/10 rounded-xl p-5">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-semibold text-white flex items-center gap-2">
          <div className="w-4 h-4 flex items-center justify-center"><i className="ri-graduation-cap-line text-amber-400"></i></div>
          Training Expiry
        </h3>
        {overdue.length > 0 && (
          <span className="text-xs px-2 py-0.5 rounded-full bg-red-500/10 text-red-400 font-medium">{overdue.length} overdue</span>
        )}
      </div>

      {overdue.length === 0 ? (
        <div className="flex items-center gap-2 p-3 bg-emerald-500/5 rounded-lg">
          <div className="w-4 h-4 flex items-center justify-center"><i className="ri-check-fill text-emerald-400"></i></div>
          <span className="text-xs text-emerald-400">All training certificates up to date.</span>
        </div>
      ) : (
        <div className="space-y-2 max-h-64 overflow-y-auto">
          {overdue.slice(0, 10).map((item) => (
            <div key={item.id} className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
              <div className="min-w-0 flex-1">
                <p className="text-xs font-medium text-white truncate">{item.guard_name}</p>
                <p className="text-[11px] text-gray-500 truncate">{item.module_title}</p>
              </div>
              <div className="flex items-center gap-2 flex-shrink-0 ml-3">
                {item.module_category && (
                  <span className="text-[10px] px-1.5 py-0.5 rounded bg-white/10 text-gray-400">{item.module_category}</span>
                )}
                <span className="text-xs font-bold text-red-400">{item.days_overdue}d</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}