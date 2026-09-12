'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/lib/auth';
import { usePlatformAccess } from '@/lib/usePlatformAccess';

interface DataRequest {
  id: string;
  request_type: string;
  requester_id: string | null;
  identity_verified: boolean;
  target_tenant_id: string | null;
  status: string;
  scope: string | null;
  statutory_deadline: string | null;
  created_at: string;
  requester?: { first_name: string | null; last_name: string | null; email: string | null } | null;
  tenant?: { name: string } | null;
}

export default function DataRequestsPage() {
  const { profile } = useAuth();
  const { can } = usePlatformAccess(profile?.id || null);
  const [requests, setRequests] = useState<DataRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState('all');

  useEffect(() => {
    const load = async () => {
      const { data } = await supabase
        .from('data_requests')
        .select('*, requester:users!data_requests_requester_id_fkey(first_name,last_name,email), tenant:companies(name)')
        .order('created_at', { ascending: false });
      if (data) setRequests(data);
      setLoading(false);
    };
    load();
  }, []);

  const updateStatus = async (id: string, newStatus: string) => {
    const updates: any = { status: newStatus };
    if (newStatus === 'completed') updates.completed_at = new Date().toISOString();
    if (newStatus === 'approved') updates.approved_at = new Date().toISOString();

    const { error } = await supabase.from('data_requests').update(updates).eq('id', id);
    if (!error) {
      setRequests(prev => prev.map(r => r.id === id ? { ...r, ...updates } : r));
    }
  };

  const verifyIdentity = async (id: string) => {
    const { error } = await supabase.from('data_requests').update({
      identity_verified: true,
      verified_by: profile?.id,
      verified_at: new Date().toISOString(),
      status: 'in_progress',
    }).eq('id', id);
    if (!error) {
      setRequests(prev => prev.map(r => r.id === id ? { ...r, identity_verified: true, status: 'in_progress' } : r));
    }
  };

  const typeLabels: Record<string, string> = {
    subject_access: 'Subject Access',
    correction: 'Correction',
    portability: 'Data Portability',
    restriction: 'Restriction',
    deletion: 'Deletion',
    closure_export: 'Closure Export',
    legal_hold: 'Legal Hold',
    retention_review: 'Retention Review',
  };

  const statusColors: Record<string, string> = {
    pending: 'bg-gray-600/15 text-gray-400',
    identity_verification: 'bg-amber-600/15 text-amber-400',
    in_progress: 'bg-blue-600/15 text-blue-400',
    reviewing: 'bg-purple-600/15 text-purple-400',
    approved: 'bg-emerald-600/15 text-emerald-400',
    completed: 'bg-emerald-600/15 text-emerald-400',
    rejected: 'bg-red-600/15 text-red-400',
    cancelled: 'bg-gray-600/15 text-gray-400',
  };

  const filtered = filterStatus === 'all' ? requests : requests.filter(r => r.status === filterStatus);

  return (
    <div className="p-4 lg:p-6 max-w-7xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-white">Data & Privacy Requests</h1>
          <p className="text-sm text-gray-500 mt-0.5">{requests.length} requests</p>
        </div>
      </div>

      <div className="flex items-center gap-2 mb-4 flex-wrap">
        {['all','pending','identity_verification','in_progress','reviewing','approved','completed'].map((s) => (
          <button key={s} onClick={() => setFilterStatus(s)} className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all cursor-pointer whitespace-nowrap ${filterStatus === s ? 'bg-indigo-600/20 text-indigo-400 border border-indigo-600/30' : 'bg-gray-800 text-gray-400 border border-gray-700 hover:border-gray-600'}`}>
            {s === 'all' ? 'All' : s.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
          </button>
        ))}
      </div>

      <div className="bg-[#111827] border border-gray-800 rounded-xl overflow-hidden">
        <div className="divide-y divide-gray-800">
          {filtered.length === 0 && !loading && (
            <div className="px-5 py-12 text-center text-sm text-gray-500">No data requests found</div>
          )}
          {filtered.map((r) => (
            <div key={r.id} className="px-5 py-3 hover:bg-white/[0.02] transition-colors">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-sm font-medium text-white">{typeLabels[r.request_type] || r.request_type}</span>
                    <span className={`px-1.5 py-0.5 rounded text-[10px] font-medium ${statusColors[r.status] || ''}`}>{r.status.replace(/_/g, ' ')}</span>
                    {r.identity_verified && <span className="text-xs text-emerald-400">Verified</span>}
                    {!r.identity_verified && <span className="text-xs text-amber-400">Unverified</span>}
                  </div>
                  <div className="flex items-center gap-3 mt-1 text-xs text-gray-500">
                    {r.requester && <span>{r.requester.first_name} {r.requester.last_name}</span>}
                    {r.tenant && <span>{r.tenant.name}</span>}
                    {r.statutory_deadline && (
                      <span className={new Date(r.statutory_deadline) < new Date() ? 'text-red-400' : ''}>
                        Deadline: {new Date(r.statutory_deadline).toLocaleDateString('en-GB')}
                      </span>
                    )}
                  </div>
                  {r.scope && <p className="text-xs text-gray-500 mt-1">Scope: {r.scope}</p>}
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  {can('data_requests.manage') && (
                    <>
                      {r.status === 'pending' && (
                        <button onClick={() => updateStatus(r.id, 'identity_verification')} className="px-2 py-1 bg-blue-600/15 text-blue-400 text-xs rounded hover:bg-blue-600/25 transition-colors cursor-pointer whitespace-nowrap">
                          Start
                        </button>
                      )}
                      {r.status === 'identity_verification' && !r.identity_verified && (
                        <button onClick={() => verifyIdentity(r.id)} className="px-2 py-1 bg-emerald-600/15 text-emerald-400 text-xs rounded hover:bg-emerald-600/25 transition-colors cursor-pointer whitespace-nowrap">
                          Verify Identity
                        </button>
                      )}
                      {r.status === 'in_progress' && (
                        <button onClick={() => updateStatus(r.id, 'reviewing')} className="px-2 py-1 bg-purple-600/15 text-purple-400 text-xs rounded hover:bg-purple-600/25 transition-colors cursor-pointer whitespace-nowrap">
                          Review
                        </button>
                      )}
                      {r.status === 'reviewing' && (
                        <>
                          <button onClick={() => updateStatus(r.id, 'approved')} className="px-2 py-1 bg-emerald-600/15 text-emerald-400 text-xs rounded hover:bg-emerald-600/25 transition-colors cursor-pointer whitespace-nowrap">
                            Approve
                          </button>
                          <button onClick={() => updateStatus(r.id, 'rejected')} className="px-2 py-1 bg-red-600/15 text-red-400 text-xs rounded hover:bg-red-600/25 transition-colors cursor-pointer whitespace-nowrap">
                            Reject
                          </button>
                        </>
                      )}
                      {r.status === 'approved' && (
                        <button onClick={() => updateStatus(r.id, 'completed')} className="px-2 py-1 bg-emerald-600/15 text-emerald-400 text-xs rounded hover:bg-emerald-600/25 transition-colors cursor-pointer whitespace-nowrap">
                          Complete
                        </button>
                      )}
                    </>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}