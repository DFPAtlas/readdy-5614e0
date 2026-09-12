'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/lib/auth';
import { usePlatformAccess } from '@/lib/usePlatformAccess';

interface AuditEntry {
  id: string;
  actor_id: string | null;
  effective_actor_id: string | null;
  target_tenant_id: string | null;
  action: string;
  resource_type: string;
  resource_id: string | null;
  reason: string | null;
  correlation_id: string | null;
  created_at: string;
  actor?: { first_name: string | null; last_name: string | null } | null;
  effective_actor?: { first_name: string | null; last_name: string | null } | null;
  tenant?: { name: string } | null;
}

export default function AuditLogPage() {
  const { profile } = useAuth();
  const { can } = usePlatformAccess(profile?.id || null);
  const [entries, setEntries] = useState<AuditEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    const load = async () => {
      const { data } = await supabase
        .from('platform_audit_log')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(200);

      if (data) {
        const userIds = [...new Set(data.map((e: any) => [e.actor_id, e.effective_actor_id]).flat().filter(Boolean))];
        const tenantIds = [...new Set(data.map((e: any) => e.target_tenant_id).filter(Boolean))];

        const [profilesRes, tenantsRes] = await Promise.all([
          userIds.length > 0 ? supabase.from('users').select('id,first_name,last_name').in('id', userIds) : Promise.resolve({ data: [] }),
          tenantIds.length > 0 ? supabase.from('companies').select('id,name').in('id', tenantIds) : Promise.resolve({ data: [] }),
        ]);

        const profileMap: Record<string, any> = {};
        (profilesRes.data || []).forEach((p: any) => { profileMap[p.id] = p; });
        const tenantMap: Record<string, any> = {};
        (tenantsRes.data || []).forEach((t: any) => { tenantMap[t.id] = t; });

        const enriched = data.map((e: any) => ({
          ...e,
          actor: e.actor_id ? profileMap[e.actor_id] || null : null,
          effective_actor: e.effective_actor_id ? profileMap[e.effective_actor_id] || null : null,
          tenant: e.target_tenant_id ? tenantMap[e.target_tenant_id] || null : null,
        }));
        setEntries(enriched);
      }
      setLoading(false);
    };
    load();
  }, []);

  const uniqueActions = [...new Set(entries.map(e => e.resource_type))];

  const filtered = filter === 'all' ? entries : entries.filter(e => e.resource_type === filter);

  return (
    <div className="p-4 lg:p-6 max-w-7xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-white">Platform Audit Log</h1>
          <p className="text-sm text-gray-500 mt-0.5">{entries.length} entries (immutable)</p>
        </div>
      </div>

      <div className="flex items-center gap-2 mb-4 flex-wrap">
        <button onClick={() => setFilter('all')} className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all cursor-pointer whitespace-nowrap ${filter === 'all' ? 'bg-indigo-600/20 text-indigo-400 border border-indigo-600/30' : 'bg-gray-800 text-gray-400 border border-gray-700 hover:border-gray-600'}`}>
          All
        </button>
        {uniqueActions.slice(0, 15).map((action) => (
          <button key={action} onClick={() => setFilter(action)} className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all cursor-pointer whitespace-nowrap ${filter === action ? 'bg-indigo-600/20 text-indigo-400 border border-indigo-600/30' : 'bg-gray-800 text-gray-400 border border-gray-700 hover:border-gray-600'}`}>
            {action.replace(/_/g, ' ')}
          </button>
        ))}
      </div>

      <div className="bg-[#111827] border border-gray-800 rounded-xl overflow-hidden">
        <div className="divide-y divide-gray-800">
          {filtered.length === 0 && !loading && (
            <div className="px-5 py-12 text-center text-sm text-gray-500">No audit entries</div>
          )}
          {filtered.map((e) => (
            <div key={e.id} className="px-5 py-3 hover:bg-white/[0.02] transition-colors">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="px-1.5 py-0.5 rounded text-[10px] font-medium bg-gray-600/15 text-gray-400 capitalize">{e.action.replace(/_/g, ' ')}</span>
                    <span className="text-xs text-gray-500">{e.resource_type.replace(/_/g, ' ')}</span>
                  </div>
                  <div className="flex items-center gap-2 mt-1 text-xs">
                    {e.actor && <span className="text-gray-400">By: {e.actor.first_name} {e.actor.last_name}</span>}
                    {e.effective_actor && e.effective_actor_id !== e.actor_id && <span className="text-amber-400">(as {e.effective_actor.first_name} {e.effective_actor.last_name})</span>}
                    {e.tenant && <span className="text-gray-500">Tenant: {e.tenant.name}</span>}
                  </div>
                  {e.reason && <p className="text-xs text-gray-500 mt-0.5">Reason: {e.reason}</p>}
                </div>
                <div className="text-right flex-shrink-0">
                  <p className="text-xs text-gray-600">{new Date(e.created_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}</p>
                  <p className="text-[10px] text-gray-700">{new Date(e.created_at).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}