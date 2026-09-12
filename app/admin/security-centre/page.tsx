'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/lib/auth';
import { usePlatformAccess } from '@/lib/usePlatformAccess';

interface SecurityEvent {
  id: string;
  event_type: string;
  severity: string;
  actor_id: string | null;
  target_tenant_id: string | null;
  description: string | null;
  is_confirmed_incident: boolean;
  false_positive: boolean;
  investigation_notes: string | null;
  created_at: string;
  actor?: { first_name: string | null; last_name: string | null; email: string | null } | null;
  target_tenant?: { name: string } | null;
}

export default function SecurityCentrePage() {
  const { profile } = useAuth();
  const { can } = usePlatformAccess(profile?.id || null);
  const [events, setEvents] = useState<SecurityEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedEvent, setSelectedEvent] = useState<string | null>(null);
  const [notes, setNotes] = useState('');

  useEffect(() => {
    const load = async () => {
      const { data } = await supabase
        .from('platform_security_events')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(100);

      if (data) {
        const userIds = [...new Set(data.map((e: any) => e.actor_id).filter(Boolean))];
        const tenantIds = [...new Set(data.map((e: any) => e.target_tenant_id).filter(Boolean))];

        const [profilesRes, tenantsRes] = await Promise.all([
          userIds.length > 0 ? supabase.from('users').select('id,first_name,last_name,email').in('id', userIds) : Promise.resolve({ data: [] }),
          tenantIds.length > 0 ? supabase.from('companies').select('id,name').in('id', tenantIds) : Promise.resolve({ data: [] }),
        ]);

        const profileMap: Record<string, any> = {};
        (profilesRes.data || []).forEach((p: any) => { profileMap[p.id] = p; });
        const tenantMap: Record<string, any> = {};
        (tenantsRes.data || []).forEach((t: any) => { tenantMap[t.id] = t; });

        const enriched = data.map((e: any) => ({
          ...e,
          actor: e.actor_id ? profileMap[e.actor_id] || null : null,
          target_tenant: e.target_tenant_id ? tenantMap[e.target_tenant_id] || null : null,
        }));
        setEvents(enriched);
      }
      setLoading(false);
    };
    load();
  }, []);

  const updateEvent = async (id: string, updates: any) => {
    const { error } = await supabase.from('platform_security_events').update(updates).eq('id', id);
    if (!error) {
      setEvents(prev => prev.map(e => e.id === id ? { ...e, ...updates } : e));
    }
  };

  const severityColors: Record<string, string> = {
    low: 'bg-blue-600/15 text-blue-400',
    medium: 'bg-amber-600/15 text-amber-400',
    high: 'bg-red-600/15 text-red-400',
    critical: 'bg-red-700/20 text-red-500',
  };

  return (
    <div className="p-4 lg:p-6 max-w-7xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-white">Security Centre</h1>
          <p className="text-sm text-gray-500 mt-0.5">{events.length} events monitored</p>
        </div>
      </div>

      <div className="bg-[#111827] border border-gray-800 rounded-xl overflow-hidden">
        <div className="divide-y divide-gray-800">
          {events.length === 0 && !loading && (
            <div className="px-5 py-12 text-center">
              <div className="w-12 h-12 flex items-center justify-center mx-auto mb-3 text-emerald-400">
                <i className="ri-shield-check-line text-3xl"></i>
              </div>
              <p className="text-sm text-gray-400">All clear</p>
              <p className="text-xs text-gray-500 mt-1">No security events detected</p>
            </div>
          )}
          {events.map((e) => (
            <div key={e.id} className={`px-5 py-3 hover:bg-white/[0.02] transition-colors ${selectedEvent === e.id ? 'bg-white/[0.03]' : ''}`}>
              <div className="flex items-start justify-between gap-3 cursor-pointer" onClick={() => setSelectedEvent(selectedEvent === e.id ? null : e.id)}>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className={`px-1.5 py-0.5 rounded text-[10px] font-medium ${severityColors[e.severity] || ''}`}>{e.severity}</span>
                    {e.is_confirmed_incident && <span className="px-1.5 py-0.5 rounded text-[10px] font-medium bg-red-600/15 text-red-400">Incident</span>}
                    {e.false_positive && <span className="px-1.5 py-0.5 rounded text-[10px] font-medium bg-gray-600/15 text-gray-400">False Positive</span>}
                    <span className="text-xs text-gray-500">{e.event_type.replace(/_/g, ' ')}</span>
                  </div>
                  <p className="text-sm text-white mt-1">{e.description || 'No description'}</p>
                  <div className="flex items-center gap-3 mt-1 text-xs text-gray-500">
                    {e.actor && <span>{e.actor.first_name} {e.actor.last_name}</span>}
                    {e.target_tenant && <span>{e.target_tenant.name}</span>}
                    <span>{new Date(e.created_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}</span>
                  </div>
                </div>
              </div>
              {selectedEvent === e.id && can('security.manage') && (
                <div className="mt-3 pt-3 border-t border-gray-800">
                  {e.investigation_notes && (
                    <div className="mb-2 p-3 bg-gray-800/40 rounded-lg">
                      <p className="text-xs text-gray-500 mb-1">Investigation Notes</p>
                      <p className="text-sm text-gray-300">{e.investigation_notes}</p>
                    </div>
                  )}
                  <div className="flex items-center gap-2 flex-wrap">
                    <textarea value={notes} onChange={(ev) => setNotes(ev.target.value)} placeholder="Add investigation notes..." rows={2} className="flex-1 min-w-[200px] bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-indigo-500" />
                    <button onClick={() => { updateEvent(e.id, { investigation_notes: notes }); setNotes(''); }} className="px-3 py-2 bg-indigo-600/15 text-indigo-400 text-xs rounded-lg hover:bg-indigo-600/25 transition-colors cursor-pointer whitespace-nowrap">Save Notes</button>
                    {!e.false_positive && !e.is_confirmed_incident && (
                      <>
                        <button onClick={() => updateEvent(e.id, { is_confirmed_incident: true })} className="px-3 py-2 bg-red-600/15 text-red-400 text-xs rounded-lg hover:bg-red-600/25 transition-colors cursor-pointer whitespace-nowrap">Mark Incident</button>
                        <button onClick={() => updateEvent(e.id, { false_positive: true })} className="px-3 py-2 bg-gray-600/15 text-gray-400 text-xs rounded-lg hover:bg-gray-600/25 transition-colors cursor-pointer whitespace-nowrap">False Positive</button>
                      </>
                    )}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}