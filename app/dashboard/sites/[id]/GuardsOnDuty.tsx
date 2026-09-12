'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';

interface GuardsOnDutyProps {
  onOpenModal: (type: string) => void;
  siteId: string;
}

export default function GuardsOnDuty({ onOpenModal, siteId }: GuardsOnDutyProps) {
  const [guards, setGuards] = useState<any[]>([]);
  const [assignedCount, setAssignedCount] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      setLoading(true);

      const [shiftsRes, assignmentsRes] = await Promise.all([
        supabase
          .from('shifts')
          .select(`
            id, guard_id, status,
            guards:guard_id(first_name, last_name, phone, email)
          `)
          .eq('site_id', siteId)
          .in('status', ['active', 'scheduled'])
          .order('start_time', { ascending: true })
          .limit(10),
        supabase
          .from('guard_site_assignments')
          .select('id')
          .eq('site_id', siteId)
          .eq('is_blocked', false),
      ]);

      const unique = new Map();
      (shiftsRes.data || []).forEach((s: any) => {
        if (s.guard_id && !unique.has(s.guard_id)) {
          unique.set(s.guard_id, {
            id: s.guard_id,
            first_name: s.guards?.first_name || '',
            last_name: s.guards?.last_name || '',
            phone: s.guards?.phone || '',
            email: s.guards?.email || '',
            status: s.status === 'active' ? 'Active' : 'Scheduled',
          });
        }
      });

      setGuards(Array.from(unique.values()));
      setAssignedCount(assignmentsRes.count || 0);
      setLoading(false);
    }
    load();
  }, [siteId]);

  if (loading) {
    return (
      <div className="bg-[#0f172a]/70 backdrop-blur-sm border border-white/10 rounded-xl overflow-hidden">
        <div className="px-5 py-4 border-b border-white/10">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-blue-500/10 border border-blue-500/20 flex items-center justify-center">
              <i className="ri-shield-user-line text-blue-400 text-sm"></i>
            </div>
            <h2 className="text-sm font-semibold text-white">Guards on Duty</h2>
          </div>
        </div>
        <div className="p-5 space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="flex items-center gap-3 animate-pulse">
              <div className="w-10 h-10 rounded-full bg-white/5"></div>
              <div className="flex-1 space-y-2">
                <div className="h-3 bg-white/5 rounded w-24"></div>
                <div className="h-2 bg-white/5 rounded w-16"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-[#0f172a]/70 backdrop-blur-sm border border-white/10 rounded-xl overflow-hidden">
      <div className="px-5 py-4 border-b border-white/10 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-blue-500/10 border border-blue-500/20 flex items-center justify-center">
            <i className="ri-shield-user-line text-blue-400 text-sm"></i>
          </div>
          <div>
            <h2 className="text-sm font-semibold text-white">Guards on Duty</h2>
            <p className="text-[11px] text-gray-400">{guards.length} on shift · {assignedCount} assigned</p>
          </div>
        </div>
      </div>

      <div className="p-4">
        {guards.length === 0 ? (
          <div className="text-center py-6">
            <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center mx-auto mb-2">
              <i className="ri-user-line text-gray-500"></i>
            </div>
            <p className="text-xs text-gray-400">No guards on shift</p>
            {assignedCount > 0 && (
              <p className="text-[10px] text-gray-500 mt-0.5">{assignedCount} assigned</p>
            )}
          </div>
        ) : (
          <div className="space-y-2.5">
            {guards.map((guard) => {
              const initials = `${(guard.first_name || '')[0]}${(guard.last_name || '')[0]}`;
              return (
                <div key={guard.id} className="flex items-center gap-3 p-2.5 rounded-lg hover:bg-white/[0.03] transition-colors">
                  <div className={`w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0 ${guard.status === 'Active' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-amber-500/20 text-amber-400'}`}>
                    <span className="text-xs font-medium">{initials || 'G'}</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-white truncate">{guard.first_name} {guard.last_name}</p>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className={`w-1.5 h-1.5 rounded-full ${guard.status === 'Active' ? 'bg-emerald-500' : 'bg-amber-500'}`}></span>
                      <span className={`text-[11px] ${guard.status === 'Active' ? 'text-emerald-400' : 'text-amber-400'}`}>
                        {guard.status}
                      </span>
                    </div>
                  </div>
                  <button
                    onClick={() => onOpenModal('contact')}
                    className="w-7 h-7 rounded-lg bg-white/5 hover:bg-white/10 flex items-center justify-center transition-colors cursor-pointer"
                    title="Contact"
                  >
                    <i className="ri-phone-line text-gray-400 text-xs"></i>
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}