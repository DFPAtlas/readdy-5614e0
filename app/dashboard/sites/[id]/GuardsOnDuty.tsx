'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';

interface GuardsOnDutyProps {
  onOpenModal: (type: string) => void;
  siteId: string;
}

export default function GuardsOnDuty({ onOpenModal, siteId }: GuardsOnDutyProps) {
  const [guards, setGuards] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      setLoading(true);
      const { data } = await supabase
        .from('shifts')
        .select(`
          id, guard_id, status,
          guards:guard_id(first_name, last_name, phone, email)
        `)
        .eq('site_id', siteId)
        .in('status', ['active', 'scheduled'])
        .order('start_time', { ascending: true })
        .limit(10);

      const unique = new Map();
      (data || []).forEach((s: any) => {
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
      setLoading(false);
    }
    load();
  }, [siteId]);

  if (loading) {
    return (
      <div className="bg-slate-600 rounded-lg p-6 text-white">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold">Guards on Duty</h2>
        </div>
        <p className="text-sm text-gray-400">Loading guards...</p>
      </div>
    );
  }

  return (
    <div className="bg-slate-600 rounded-lg p-6 text-white">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold">Guards on Duty</h2>
        <span className="text-sm text-gray-300">{guards.length} Active</span>
      </div>

      {guards.length === 0 ? (
        <p className="text-sm text-gray-400 mb-4">No guards currently assigned to this site.</p>
      ) : (
        <div className="space-y-4">
          {guards.map((guard) => {
            const initials = `${(guard.first_name || '')[0]}${(guard.last_name || '')[0]}`;
            return (
              <div key={guard.id} className="bg-slate-700 rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center">
                      <span className="text-sm font-medium">{initials || 'G'}</span>
                    </div>
                    <div>
                      <div className="font-medium text-white">{guard.first_name} {guard.last_name}</div>
                      <div className="text-xs text-gray-300">Security Officer</div>
                    </div>
                  </div>
                  <div className={`w-3 h-3 rounded-full ${guard.status === 'Active' ? 'bg-green-500' : 'bg-yellow-500'}`}></div>
                </div>

                <div className="text-sm space-y-1">
                  <div className="flex justify-between">
                    <span className="text-gray-300">Status:</span>
                    <span className={guard.status === 'Active' ? 'text-green-400' : 'text-yellow-400'}>{guard.status}</span>
                  </div>
                  {guard.phone && (
                    <div className="flex justify-between">
                      <span className="text-gray-300">Phone:</span>
                      <span className="text-white">{guard.phone}</span>
                    </div>
                  )}
                </div>

                <div className="flex justify-between mt-3 pt-3 border-t border-slate-600">
                  <button
                    onClick={() => onOpenModal('contact')}
                    className="px-3 py-1 bg-blue-600 text-white text-xs rounded hover:bg-blue-700 transition-colors cursor-pointer whitespace-nowrap"
                  >
                    Contact
                  </button>
                  <button
                    onClick={() => onOpenModal('patrol-log')}
                    className="px-3 py-1 bg-green-600 text-white text-xs rounded hover:bg-green-700 transition-colors cursor-pointer whitespace-nowrap"
                  >
                    Patrol Log
                  </button>
                  <button
                    onClick={() => onOpenModal('details')}
                    className="px-3 py-1 bg-gray-600 text-white text-xs rounded hover:bg-gray-700 transition-colors cursor-pointer whitespace-nowrap"
                  >
                    Details
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      <div className="mt-6 grid grid-cols-2 gap-3">
        <button
          onClick={() => onOpenModal('risk-assessment')}
          className="px-4 py-2 bg-orange-600 text-white text-sm rounded hover:bg-orange-700 transition-colors cursor-pointer whitespace-nowrap"
        >
          Risk Assessment
        </button>
        <button
          onClick={() => onOpenModal('incident-report')}
          className="px-4 py-2 bg-red-600 text-white text-sm rounded hover:bg-red-700 transition-colors cursor-pointer whitespace-nowrap"
        >
          Incident Report
        </button>
      </div>
    </div>
  );
}