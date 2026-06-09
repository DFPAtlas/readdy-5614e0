'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/lib/auth';
import SwipeableItem from '../components/SwipeableItem';
import GuardBottomNav from '../components/GuardBottomNav';

interface ReportItem {
  id: string;
  type: string;
  title: string;
  description: string;
  site_name: string;
  created_at: string;
  status: string;
  severity: string | null;
}

export default function GuardReportsPage() {
  const { currentUser, profile, company, isLoading: authLoading } = useAuth();
  const router = useRouter();
  const [reports, setReports] = useState<ReportItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'incident' | 'patrol' | 'ob'>('all');

  useEffect(() => {
    if (!authLoading && !currentUser) {
      router.replace('/login/guard');
    }
    if (!authLoading && profile && profile.role !== 'guard') {
      router.replace('/dashboard');
    }
  }, [currentUser, profile, authLoading, router]);

  const loadReports = useCallback(async () => {
    if (!currentUser || !company?.id) { setLoading(false); return; }

    const { data: guardData } = await supabase.from('guards').select('id').eq('user_id', currentUser.id).maybeSingle();
    const guardId = guardData?.id;
    if (!guardId) { setLoading(false); return; }

    const [incidentsRes, patrolsRes, obRes] = await Promise.all([
      supabase.from('incidents').select('id, incident_type, description, site:sites!inner(site_name), created_at, status, severity').eq('guard_id', guardId).order('created_at', { ascending: false }).limit(25),
      supabase.from('patrol_logs').select('id, status, checkpoints_total, checkpoints_completed, site:sites!inner(site_name), start_time, end_time').eq('guard_id', guardId).order('start_time', { ascending: false }).limit(15),
      supabase.from('occurrence_books').select('id, entry_type, entry, site:sites!inner(site_name), created_at').eq('guard_id', guardId).order('created_at', { ascending: false }).limit(15),
    ]);

    const items: ReportItem[] = [];

    (incidentsRes.data || []).forEach((r: any) => {
      items.push({
        id: `inc-${r.id}`,
        type: 'incident',
        title: r.incident_type,
        description: r.description || '',
        site_name: r.site?.site_name || 'Unknown',
        created_at: r.created_at,
        status: r.status,
        severity: r.severity,
      });
    });

    (patrolsRes.data || []).forEach((r: any) => {
      items.push({
        id: `pat-${r.id}`,
        type: 'patrol',
        title: `Patrol — ${r.checkpoints_completed}/${r.checkpoints_total || '?'} checkpoints`,
        description: r.status === 'active' ? 'Patrol in progress' : 'Patrol completed',
        site_name: r.site?.site_name || 'Unknown',
        created_at: r.start_time,
        status: r.status,
        severity: null,
      });
    });

    (obRes.data || []).forEach((r: any) => {
      items.push({
        id: `ob-${r.id}`,
        type: 'ob',
        title: r.entry_type,
        description: r.entry || '',
        site_name: r.site?.site_name || 'Unknown',
        created_at: r.created_at,
        status: 'logged',
        severity: null,
      });
    });

    items.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
    setReports(items);
    setLoading(false);
  }, [currentUser, company?.id]);

  useEffect(() => {
    if (currentUser) loadReports();
  }, [currentUser, loadReports]);

  const filtered = filter === 'all' ? reports : reports.filter((r) => r.type === filter);

  function formatTimeAgo(iso: string) {
    const diff = Date.now() - new Date(iso).getTime();
    const m = Math.floor(diff / 60000);
    const h = Math.floor(diff / 3600000);
    const d = Math.floor(diff / 86400000);
    if (m < 1) return 'Just now';
    if (m < 60) return `${m}m ago`;
    if (h < 24) return `${h}h ago`;
    if (d < 7) return `${d}d ago`;
    return new Date(iso).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' });
  }

  const typeIcon = (type: string, status: string) => {
    if (type === 'incident') return status === 'open' ? 'ri-alert-line text-red-400' : 'ri-alert-line text-gray-500';
    if (type === 'patrol') return status === 'active' ? 'ri-walk-line text-[#3b82f6]' : 'ri-walk-line text-gray-500';
    return 'ri-book-line text-amber-400';
  };

  const typeColor = (type: string) => {
    if (type === 'incident') return 'bg-red-500/5 border-red-500/10';
    if (type === 'patrol') return 'bg-[#3b82f6]/5 border-[#3b82f6]/10';
    return 'bg-amber-500/5 border-amber-500/10';
  };

  if (authLoading || !currentUser) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <i className="ri-loader-4-line animate-spin text-[#3b82f6] text-2xl"></i>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white flex flex-col">
      <main className="flex-1 pt-4 pb-[72px] overflow-y-auto max-w-lg mx-auto w-full">
        <div className="px-4 pt-5 pb-2">
          <h1 className="text-2xl font-bold text-white">Reports</h1>
          <p className="text-sm text-gray-400 mt-1">Your activity log</p>
        </div>

        {/* Filter Pills */}
        <div className="flex gap-2 px-4 py-2 overflow-x-auto">
          {([
            { key: 'all', label: 'All' },
            { key: 'incident', label: 'Incidents' },
            { key: 'patrol', label: 'Patrols' },
            { key: 'ob', label: 'OB Entries' },
          ] as const).map((f) => (
            <button
              key={f.key}
              onClick={() => setFilter(f.key)}
              className={`h-9 px-4 rounded-full text-sm font-medium border transition-all cursor-pointer whitespace-nowrap ${
                filter === f.key
                  ? 'bg-[#3b82f6]/20 border-[#3b82f6]/40 text-[#3b82f6]'
                  : 'bg-[#1a1a1a] border-white/5 text-gray-400 hover:border-white/10'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>

        {/* Report List */}
        <div className="px-4 py-3 space-y-2">
          {loading ? (
            <div className="flex justify-center py-12">
              <i className="ri-loader-4-line animate-spin text-gray-500 text-xl"></i>
            </div>
          ) : filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16">
              <div className="w-16 h-16 bg-white/5 rounded-2xl flex items-center justify-center mb-3">
                <i className="ri-file-list-line text-gray-500 text-2xl"></i>
              </div>
              <p className="text-sm text-gray-400">No reports yet</p>
              <p className="text-xs text-gray-500 mt-1">Start a shift to create reports</p>
            </div>
          ) : (
            filtered.map((r) => (
              <SwipeableItem
                key={r.id}
                actions={[
                  {
                    label: 'Share',
                    icon: 'ri-share-line',
                    color: 'bg-[#3b82f6]/20 text-[#3b82f6]',
                    onClick: () => {
                      if (navigator.share) {
                        navigator.share({ title: r.title, text: r.description });
                      }
                    },
                  },
                ]}
              >
                <div className={`rounded-2xl border p-4 ${typeColor(r.type)}`}>
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center flex-shrink-0">
                      <i className={`${typeIcon(r.type, r.status)} text-lg`}></i>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <p className="text-sm font-semibold text-white truncate">{r.title}</p>
                        <span className="text-[10px] text-gray-500 whitespace-nowrap ml-2">{formatTimeAgo(r.created_at)}</span>
                      </div>
                      <p className="text-xs text-gray-400 mt-0.5 line-clamp-2">{r.description}</p>
                      <div className="flex items-center gap-2 mt-2">
                        <span className="text-[10px] text-gray-500">{r.site_name}</span>
                        {r.severity && (
                          <span className={`text-[10px] px-1.5 py-0.5 rounded ${
                            r.severity === 'critical' ? 'bg-red-500/15 text-red-400' :
                            r.severity === 'high' ? 'bg-orange-500/15 text-orange-400' :
                            r.severity === 'medium' ? 'bg-amber-500/15 text-amber-400' :
                            'bg-gray-500/15 text-gray-400'
                          }`}>
                            {r.severity}
                          </span>
                        )}
                        {r.status === 'active' && (
                          <span className="text-[10px] px-1.5 py-0.5 bg-[#3b82f6]/15 text-[#3b82f6] rounded">Active</span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </SwipeableItem>
            ))
          )}
        </div>
      </main>
      <GuardBottomNav />
    </div>
  );
}