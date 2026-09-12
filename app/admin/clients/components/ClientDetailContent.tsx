'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { useSuperAdminCompanies, useAdminNotes, useAdminActivity, useAdminModules } from '@/lib/useSuperAdmin';
import { useAuth } from '@/lib/auth';
import { supabase } from '@/lib/supabase';
import { StatusBadge, PlanBadge, SubscriptionStatusBadge } from '../../components/AdminUI';
import ClientAIProviders from './ClientAIProviders';

interface ClientSite {
  id: string;
  site_name: string;
  address: string | null;
  risk_level: string | null;
  status: string | null;
  created_at: string;
}

interface ClientUser {
  id: string;
  first_name: string | null;
  last_name: string | null;
  email: string | null;
  role: string;
  status: string | null;
  created_at: string;
}

export default function ClientDetailContent() {
  const searchParams = useSearchParams();
  const clientId = searchParams.get('id');
  const { companies } = useSuperAdminCompanies();
  const { profile } = useAuth();
  const { notes, addNote, refetch: refetchNotes } = useAdminNotes(clientId as string);
  const { logs, logAction, refetch: refetchLogs } = useAdminActivity(clientId as string);
  const { modules, toggleModule } = useAdminModules(clientId as string);

  const [activeTab, setActiveTab] = useState<'overview' | 'sites' | 'users' | 'billing' | 'modules' | 'ai_providers' | 'notes' | 'activity'>('overview');
  const [clientSites, setClientSites] = useState<ClientSite[]>([]);
  const [clientUsers, setClientUsers] = useState<ClientUser[]>([]);
  const [sitesLoading, setSitesLoading] = useState(false);
  const [usersLoading, setUsersLoading] = useState(false);
  const [noteText, setNoteText] = useState('');
  const [noteCategory, setNoteCategory] = useState('support');

  const company = companies.find(c => c.id === clientId);

  useEffect(() => {
    if (!clientId) return;
    if (activeTab === 'sites') {
      setSitesLoading(true);
      supabase.from('sites').select('*').eq('company_id', clientId).order('created_at', { ascending: false })
        .then(({ data }) => {
          setClientSites((data || []).map((s: any) => ({
            id: s.id,
            site_name: s.site_name,
            address: s.address,
            risk_level: s.risk_level,
            status: s.status || 'active',
            created_at: s.created_at,
          })));
          setSitesLoading(false);
        });
    }
    if (activeTab === 'users') {
      setUsersLoading(true);
      supabase.from('users').select('*').eq('company_id', clientId).order('created_at', { ascending: false })
        .then(({ data }) => {
          setClientUsers((data || []).map((u: any) => ({
            id: u.id,
            first_name: u.first_name,
            last_name: u.last_name,
            email: u.email,
            role: u.role,
            status: u.status,
            created_at: u.created_at,
          })));
          setUsersLoading(false);
        });
    }
  }, [activeTab, clientId]);

  if (!company) {
    return (
      <div className="p-6">
        <div className="text-center py-16">
          <div className="w-12 h-12 flex items-center justify-center mx-auto mb-3 text-gray-600">
            <i className="ri-briefcase-line text-2xl"></i>
          </div>
          <h3 className="text-sm font-medium text-gray-400">Client not found</h3>
          <Link href="/admin/clients" className="text-xs text-indigo-400 mt-2 inline-block hover:text-indigo-300 cursor-pointer">
            Back to clients
          </Link>
        </div>
      </div>
    );
  }

  const handleAddNote = async () => {
    if (!noteText.trim() || !profile) return;
    await addNote(noteText, noteCategory, profile.id);
    await logAction('admin_note_added', 'Admin note added', company.id, profile.id, { category: noteCategory });
    setNoteText('');
    refetchNotes();
    refetchLogs();
  };

  const tabs = [
    { key: 'overview' as const, label: 'Overview', icon: 'ri-dashboard-line' },
    { key: 'sites' as const, label: 'Sites', icon: 'ri-building-line' },
    { key: 'users' as const, label: 'Users', icon: 'ri-team-line' },
    { key: 'billing' as const, label: 'Billing', icon: 'ri-bank-card-line' },
    { key: 'modules' as const, label: 'Modules', icon: 'ri-apps-line' },
    { key: 'ai_providers' as const, label: 'AI Providers', icon: 'ri-robot-line' },
    { key: 'notes' as const, label: 'Notes', icon: 'ri-sticky-note-line' },
    { key: 'activity' as const, label: 'Activity', icon: 'ri-shield-check-line' },
  ];

  return (
    <div className="p-4 lg:p-6 max-w-7xl mx-auto">
      <div className="flex items-center gap-2 mb-1">
        <Link href="/admin/clients" className="text-xs text-gray-500 hover:text-indigo-400 cursor-pointer flex items-center gap-1">
          <i className="ri-arrow-left-line"></i> Clients
        </Link>
      </div>

      <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-white">{company.name}</h1>
          <div className="flex items-center gap-2 mt-1.5 flex-wrap">
            <StatusBadge status={company.account_status} />
            <PlanBadge plan={company.plan_name || company.subscription_plan} />
            <SubscriptionStatusBadge status={company.subscription_status} />
          </div>
        </div>
      </div>

      <div className="flex items-center gap-0.5 mb-6 border-b border-gray-800 overflow-x-auto">
        {tabs.map(tab => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`flex items-center gap-1.5 px-4 py-2.5 text-sm font-medium whitespace-nowrap border-b-2 transition-colors cursor-pointer ${
              activeTab === tab.key
                ? 'border-indigo-500 text-indigo-400'
                : 'border-transparent text-gray-500 hover:text-gray-300'
            }`}
          >
            <i className={tab.icon}></i>
            {tab.label}
          </button>
        ))}
      </div>

      {activeTab === 'overview' && (
        <div className="grid lg:grid-cols-2 gap-5">
          <div className="bg-[#111827] border border-gray-800 rounded-xl p-5">
            <h3 className="text-white font-semibold text-sm mb-4">Company Details</h3>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-500">Company Name</span>
                <span className="text-gray-300">{company.name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Contact Email</span>
                <span className="text-gray-300">{company.contact_email || '-'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Phone</span>
                <span className="text-gray-300">{company.phone || '-'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Address</span>
                <span className="text-gray-300">{company.address || '-'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Account Status</span>
                <StatusBadge status={company.account_status} />
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Onboarding Status</span>
                <span className="text-gray-300 capitalize">{company.onboarding_status || 'Unknown'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Signup Date</span>
                <span className="text-gray-300">
                  {new Date(company.created_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}
                </span>
              </div>
            </div>
          </div>

          <div className="bg-[#111827] border border-gray-800 rounded-xl p-5">
            <h3 className="text-white font-semibold text-sm mb-4">Account Summary</h3>
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-gray-800/30 rounded-lg p-3">
                <div className="text-xl font-bold text-white">{company.site_count || 0}</div>
                <div className="text-xs text-gray-500 mt-0.5">Sites</div>
              </div>
              <div className="bg-gray-800/30 rounded-lg p-3">
                <div className="text-xl font-bold text-white">{company.user_count || 0}</div>
                <div className="text-xs text-gray-500 mt-0.5">Users</div>
              </div>
              <div className="bg-gray-800/30 rounded-lg p-3">
                <div className="text-xl font-bold text-white">{company.guard_count || 0}</div>
                <div className="text-xs text-gray-500 mt-0.5">Guards</div>
              </div>
              <div className="bg-gray-800/30 rounded-lg p-3">
                <div className="text-xl font-bold text-white">
                  {new Date(company.created_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}
                </div>
                <div className="text-xs text-gray-500 mt-0.5">Signup Date</div>
              </div>
            </div>
          </div>

          <div className="bg-[#111827] border border-gray-800 rounded-xl p-5 lg:col-span-2">
            <h3 className="text-white font-semibold text-sm mb-4">Owner / Main Contact</h3>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-indigo-600/20 flex items-center justify-center text-indigo-400 text-sm font-semibold">
                {(company.owner_name || 'U').charAt(0)}
              </div>
              <div>
                <div className="text-sm text-white font-medium">{company.owner_name || 'No owner assigned'}</div>
                <div className="text-xs text-gray-500">{company.owner_email || company.contact_email || 'No email'}</div>
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'billing' && (
        <div className="bg-[#111827] border border-gray-800 rounded-xl p-5 max-w-2xl">
          <h3 className="text-white font-semibold text-sm mb-4">Subscription & Billing</h3>
          <div className="space-y-3 text-sm">
            <div className="flex justify-between border-b border-gray-800 pb-3">
              <span className="text-gray-500">Current Plan</span>
              <PlanBadge plan={company.plan_name || company.subscription_plan} />
            </div>
            <div className="flex justify-between border-b border-gray-800 pb-3">
              <span className="text-gray-500">Subscription Status</span>
              <SubscriptionStatusBadge status={company.subscription_status} />
            </div>
            <div className="flex justify-between border-b border-gray-800 pb-3">
              <span className="text-gray-500">Stripe Customer ID</span>
              <span className="text-gray-300 font-mono text-xs">{company.stripe_customer_id || 'Not connected'}</span>
            </div>
            <div className="flex justify-between border-b border-gray-800 pb-3">
              <span className="text-gray-500">Stripe Subscription ID</span>
              <span className="text-gray-300 font-mono text-xs">{company.stripe_subscription_id || 'Not connected'}</span>
            </div>
            <div className="flex justify-between border-b border-gray-800 pb-3">
              <span className="text-gray-500">Trial Ends</span>
              <span className="text-gray-300">
                {company.trial_ends_at ? new Date(company.trial_ends_at).toLocaleDateString('en-GB') : 'Not on trial'}
              </span>
            </div>
            <div className="flex justify-between border-b border-gray-800 pb-3">
              <span className="text-gray-500">Current Period Ends</span>
              <span className="text-gray-300">
                {company.subscription_period_end ? new Date(company.subscription_period_end).toLocaleDateString('en-GB') : '-'}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Cancelled At</span>
              <span className="text-gray-300">
                {company.cancelled_at ? new Date(company.cancelled_at).toLocaleDateString('en-GB') : '-'}
              </span>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'modules' && (
        <div className="bg-[#111827] border border-gray-800 rounded-xl p-5 max-w-2xl">
          <h3 className="text-white font-semibold text-sm mb-4">Enabled Modules</h3>
          {modules.length === 0 ? (
            <div className="text-sm text-gray-500 py-4">No module configuration found. All modules are enabled by default.</div>
          ) : (
            <div className="space-y-2">
              {modules.map((m: any) => (
                <div key={m.id} className="flex items-center justify-between py-2 border-b border-gray-800 last:border-0">
                  <div>
                    <div className="text-sm text-white">{m.name}</div>
                    <div className="text-xs text-gray-500">{m.description}</div>
                  </div>
                  <button
                    onClick={() => toggleModule(m.id, !m.company_enabled)}
                    className={`px-3 py-1 rounded text-xs font-medium transition-colors cursor-pointer whitespace-nowrap ${
                      m.company_enabled
                        ? 'bg-emerald-500/10 text-emerald-400'
                        : 'bg-gray-700/40 text-gray-500'
                    }`}
                  >
                    {m.company_enabled ? 'Enabled' : 'Disabled'}
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {activeTab === 'ai_providers' && (
        <ClientAIProviders companyId={company.id} />
      )}

      {activeTab === 'notes' && (
        <div className="grid lg:grid-cols-2 gap-5 max-w-5xl">
          <div className="bg-[#111827] border border-gray-800 rounded-xl p-5">
            <h3 className="text-white font-semibold text-sm mb-4">Add Admin Note</h3>
            <div className="space-y-3">
              <div>
                <label className="text-xs text-gray-500 mb-1 block">Category</label>
                <div className="flex flex-wrap gap-1">
                  {['sales', 'onboarding', 'billing', 'support', 'technical'].map(cat => (
                    <button
                      key={cat}
                      onClick={() => setNoteCategory(cat)}
                      className={`px-2.5 py-1 rounded text-xs capitalize transition-colors cursor-pointer whitespace-nowrap ${
                        noteCategory === cat
                          ? 'bg-indigo-600/20 text-indigo-400'
                          : 'bg-gray-800/40 text-gray-500 hover:text-gray-300'
                      }`}
                    >
                      {cat}
                    </button>
                  ))}
                </div>
              </div>
              <textarea
                value={noteText}
                onChange={(e) => setNoteText(e.target.value)}
                placeholder="Write an internal note..."
                maxLength={500}
                className="w-full bg-gray-800/40 border border-gray-700/60 rounded-lg px-3 py-2 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-indigo-500 min-h-[100px] resize-y"
              />
              <div className="flex items-center justify-between">
                <span className="text-xs text-gray-600">{noteText.length}/500</span>
                <button
                  onClick={handleAddNote}
                  disabled={!noteText.trim()}
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 text-white text-xs font-medium rounded-lg transition-colors cursor-pointer whitespace-nowrap"
                >
                  Add Note
                </button>
              </div>
            </div>
          </div>

          <div className="bg-[#111827] border border-gray-800 rounded-xl">
            <div className="px-5 py-4 border-b border-gray-800">
              <h3 className="text-white font-semibold text-sm">Internal Notes ({notes.length})</h3>
            </div>
            <div className="divide-y divide-gray-800 max-h-[500px] overflow-y-auto">
              {notes.length === 0 && (
                <div className="px-5 py-8 text-center text-sm text-gray-500">No admin notes yet.</div>
              )}
              {notes.map((n: any) => {
                const categoryStyles: Record<string, string> = {
                  sales: 'bg-blue-500/10 text-blue-400',
                  onboarding: 'bg-emerald-500/10 text-emerald-400',
                  billing: 'bg-amber-500/10 text-amber-400',
                  support: 'bg-purple-500/10 text-purple-400',
                  technical: 'bg-red-500/10 text-red-400',
                };
                return (
                  <div key={n.id} className="px-5 py-3">
                    <div className="flex items-center gap-2 mb-1">
                      <span className={`px-1.5 py-0.5 rounded text-[10px] font-medium uppercase ${
                        categoryStyles[String(n.category)] || 'bg-gray-500/10 text-gray-400'
                      }`}>{n.category}</span>
                      <span className="text-xs text-gray-600">
                        {n.created_by_profile ? `${n.created_by_profile.first_name} ${n.created_by_profile.last_name}` : 'Admin'}
                      </span>
                      <span className="text-xs text-gray-700">
                        {new Date(n.created_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                    <p className="text-sm text-gray-300">{n.note}</p>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {activeTab === 'activity' && (
        <div className="bg-[#111827] border border-gray-800 rounded-xl max-w-4xl">
          <div className="px-5 py-4 border-b border-gray-800">
            <h3 className="text-white font-semibold text-sm">Activity Log</h3>
          </div>
          <div className="divide-y divide-gray-800">
            {logs.length === 0 && (
              <div className="px-5 py-8 text-center text-sm text-gray-500">No activity recorded yet.</div>
            )}
            {logs.map((log: any) => (
              <div key={log.id} className="px-5 py-3 flex items-start gap-3">
                <div className="w-8 h-8 rounded-full bg-gray-800 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <div className="w-4 h-4 flex items-center justify-center text-gray-500">
                    <i className="ri-shield-check-line text-xs"></i>
                  </div>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-white font-medium capitalize">{log.action.replace(/_/g, ' ')}</span>
                    <span className="text-xs text-gray-600">
                      {new Date(log.created_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                  <p className="text-xs text-gray-500 mt-0.5">{log.description}</p>
                  {log.performed_by_profile && (
                    <p className="text-xs text-gray-600 mt-0.5">
                      By {log.performed_by_profile.first_name} {log.performed_by_profile.last_name}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeTab === 'sites' && (
        <div className="bg-[#111827] border border-gray-800 rounded-xl overflow-hidden">
          <div className="px-5 py-4 border-b border-gray-800 flex items-center justify-between">
            <h3 className="text-white font-semibold text-sm">Client Sites ({clientSites.length})</h3>
          </div>
          {sitesLoading ? (
            <div className="p-8 text-center text-sm text-gray-500">Loading sites...</div>
          ) : clientSites.length === 0 ? (
            <div className="px-5 py-8 text-center text-sm text-gray-500">No sites for this client.</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-800 text-left">
                    <th className="px-5 py-3 text-xs font-medium text-gray-500 uppercase">Name</th>
                    <th className="px-5 py-3 text-xs font-medium text-gray-500 uppercase">Address</th>
                    <th className="px-5 py-3 text-xs font-medium text-gray-500 uppercase">Risk</th>
                    <th className="px-5 py-3 text-xs font-medium text-gray-500 uppercase">Created</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-800">
                  {clientSites.map(site => (
                    <tr key={site.id} className="hover:bg-white/[0.02] transition-colors">
                      <td className="px-5 py-3 font-medium text-white">{site.site_name || 'Unnamed'}</td>
                      <td className="px-5 py-3 text-gray-400 text-xs">{site.address || '-'}</td>
                      <td className="px-5 py-3">
                        <span className={`text-xs capitalize font-medium ${
                          site.risk_level === 'high' ? 'text-red-400' :
                          site.risk_level === 'medium' ? 'text-amber-400' :
                          'text-emerald-400'
                        }`}>{site.risk_level || 'low'}</span>
                      </td>
                      <td className="px-5 py-3 text-gray-500 text-xs">
                        {new Date(site.created_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {activeTab === 'users' && (
        <div className="bg-[#111827] border border-gray-800 rounded-xl overflow-hidden">
          <div className="px-5 py-4 border-b border-gray-800 flex items-center justify-between">
            <h3 className="text-white font-semibold text-sm">Client Users ({clientUsers.length})</h3>
          </div>
          {usersLoading ? (
            <div className="p-8 text-center text-sm text-gray-500">Loading users...</div>
          ) : clientUsers.length === 0 ? (
            <div className="px-5 py-8 text-center text-sm text-gray-500">No users for this client.</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-800 text-left">
                    <th className="px-5 py-3 text-xs font-medium text-gray-500 uppercase">Name</th>
                    <th className="px-5 py-3 text-xs font-medium text-gray-500 uppercase">Email</th>
                    <th className="px-5 py-3 text-xs font-medium text-gray-500 uppercase">Role</th>
                    <th className="px-5 py-3 text-xs font-medium text-gray-500 uppercase">Last Login</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-800">
                  {clientUsers.map(user => (
                    <tr key={user.id} className="hover:bg-white/[0.02] transition-colors">
                      <td className="px-5 py-3 font-medium text-white">{user.first_name} {user.last_name}</td>
                      <td className="px-5 py-3 text-gray-400 text-xs">{user.email || '-'}</td>
                      <td className="px-5 py-3">
                        <span className="inline-flex px-2 py-0.5 rounded-md text-xs font-medium capitalize text-gray-400 bg-gray-500/10">
                          {user.role.replace(/_/g, ' ')}
                        </span>
                      </td>
                      <td className="px-5 py-3 text-gray-500 text-xs">
                        {'Never'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  );
}