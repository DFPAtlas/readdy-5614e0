'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/lib/auth';
import { supabase } from '@/lib/supabase';

interface Props {
  siteId: string | null;
  onSelect: (id: string) => void;
}

export default function SiteSelector({ siteId, onSelect }: Props) {
  const { companyId } = useAuth();
  const [sites, setSites] = useState<any[]>([]);
  const [counts, setCounts] = useState<Record<string, number>>({});
  const [lastEntry, setLastEntry] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!companyId) return;
    const today = new Date().toISOString().split('T')[0];
    supabase.from('sites')
      .select('id, site_name, risk_level')
      .eq('company_id', companyId)
      .order('site_name')
      .then(({ data: sitesData }) => {
        if (!sitesData) { setLoading(false); return; }
        setSites(sitesData);
        Promise.all(
          sitesData.map((s) =>
            supabase.from('occurrence_books')
              .select('created_at', { count: 'exact', head: true })
              .eq('site_id', s.id)
              .gte('created_at', `${today}T00:00:00Z`)
              .then(({ count }) => ({ id: s.id, count: count || 0 }))
          )
        ).then((results) => {
          const c: Record<string, number> = {};
          results.forEach((r) => { c[r.id] = r.count; });
          setCounts(c);
        }).catch(() => setCounts({}));

        Promise.all(
          sitesData.map((s) =>
            supabase.from('occurrence_books')
              .select('created_at')
              .eq('site_id', s.id)
              .order('created_at', { ascending: false })
              .limit(1)
              .maybeSingle()
              .then(({ data }) => ({ id: s.id, ts: data?.created_at || '' }))
          )
        ).then((results) => {
          const l: Record<string, string> = {};
          results.forEach((r) => { l[r.id] = r.ts; });
          setLastEntry(l);
        }).catch(() => setLastEntry({})).finally(() => setLoading(false));
      });
  }, [companyId]);

  if (loading) {
    return (
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="bg-[#111827]/60 border border-gray-800 rounded-xl p-4 animate-pulse">
            <div className="h-4 bg-gray-800/60 rounded w-3/4 mb-3"></div>
            <div className="h-3 bg-gray-800/60 rounded w-1/2"></div>
          </div>
        ))}
      </div>
    );
  }

  if (sites.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="w-10 h-10 mx-auto flex items-center justify-center text-gray-600 mb-2">
          <i className="ri-building-line text-2xl"></i>
        </div>
        <p className="text-sm text-gray-500">No sites available.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="text-center">
        <div className="w-12 h-12 mx-auto flex items-center justify-center text-gray-600 mb-3">
          <i className="ri-book-open-line text-3xl"></i>
        </div>
        <h2 className="text-lg font-semibold text-white mb-1">Select a site to view its occurrence book</h2>
        <p className="text-sm text-gray-500">Choose from your managed sites below</p>
      </div>
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {sites.map((site) => (
          <button
            key={site.id}
            onClick={() => onSelect(site.id)}
            className={`text-left bg-[#111827]/60 border rounded-xl p-4 hover:border-blue-500/50 hover:bg-[#111827]/80 transition-all cursor-pointer ${siteId === site.id ? 'border-blue-500/50 ring-1 ring-blue-500/20' : 'border-gray-800'}`}
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-white truncate">{site.site_name}</span>
              <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-medium ${
                site.risk_level === 'high' ? 'bg-red-500/10 text-red-400' :
                site.risk_level === 'medium' ? 'bg-amber-500/10 text-amber-400' :
                'bg-emerald-500/10 text-emerald-400'
              }`}>
                {site.risk_level || 'low'}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-xs text-gray-500">
                {(counts?.[site.id] || 0)} entries today
              </span>
              <span className="text-[11px] text-gray-600 tabular-nums">
                {lastEntry?.[site.id] ? new Date(lastEntry[site.id]).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' }) : '—'}
              </span>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}