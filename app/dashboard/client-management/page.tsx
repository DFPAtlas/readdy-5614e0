'use client';

import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/lib/auth';
import Link from 'next/link';

interface Client {
  id: string;
  name: string;
  trading_name: string | null;
  reference: string | null;
  contact_person: string | null;
  contact_email: string | null;
  contact_phone: string | null;
  status: string;
  portal_enabled: boolean;
  created_at: string;
}

type Tab = 'clients' | 'contracts' | 'requests' | 'publications' | 'branding';

const TABS: { id: Tab; label: string; icon: string }[] = [
  { id: 'clients', label: 'Clients', icon: 'ri-building-2-line' },
  { id: 'contracts', label: 'Contracts', icon: 'ri-file-text-line' },
  { id: 'requests', label: 'Service Requests', icon: 'ri-question-answer-line' },
  { id: 'publications', label: 'Publications', icon: 'ri-eye-line' },
  { id: 'branding', label: 'Branding', icon: 'ri-palette-line' },
];

export default function ClientManagementPage() {
  const { profile, companyId } = useAuth();
  const [activeTab, setActiveTab] = useState<Tab>('clients');
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchClients = useCallback(async () => {
    if (!companyId) return;
    const { data } = await supabase.from('clients').select('*').eq('company_id', companyId).order('name');
    setClients(data || []);
    setLoading(false);
  }, [companyId]);

  useEffect(() => { fetchClients(); }, [fetchClients]);

  if (loading) {
    return <div className="flex items-center justify-center h-64"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div></div>;
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-white">Client Management</h1>
        <p className="text-gray-400 mt-1">Manage client organisations, contracts, requests and portal settings</p>
      </div>

      <div className="flex items-center gap-1 bg-[#0f172a]/50 border border-white/10 rounded-xl p-1 overflow-x-auto">
        {TABS.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-colors cursor-pointer whitespace-nowrap ${
              activeTab === tab.id ? 'bg-white/10 text-white' : 'text-gray-400 hover:text-white hover:bg-white/5'
            }`}
          >
            <div className="w-4 h-4 flex items-center justify-center"><i className={tab.icon}></i></div>
            {tab.label}
          </button>
        ))}
      </div>

      {/* CLIENTS TAB */}
      {activeTab === 'clients' && (
        <ClientsTab clients={clients} onRefresh={fetchClients} companyId={companyId} profileId={profile?.id} />
      )}

      {/* CONTRACTS TAB */}
      {activeTab === 'contracts' && <ContractsTab companyId={companyId} clients={clients} profileId={profile?.id} />}

      {/* SERVICE REQUESTS TAB */}
      {activeTab === 'requests' && <RequestsTab companyId={companyId} clients={clients} />}

      {/* PUBLICATIONS TAB */}
      {activeTab === 'publications' && <PublicationsTab companyId={companyId} />}

      {/* BRANDING TAB */}
      {activeTab === 'branding' && <BrandingTab companyId={companyId} clients={clients} profileId={profile?.id} />}
    </div>
  );
}

function ClientsTab({ clients, onRefresh, companyId, profileId }: { clients: Client[]; onRefresh: () => void; companyId: string | null; profileId: string | undefined }) {
  const [editOpen, setEditOpen] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [form, setForm] = useState({ name: '', trading_name: '', reference: '', contact_person: '', contact_email: '', contact_phone: '', status: 'active' });
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState<{ msg: string; type: 'success' | 'error' } | null>(null);

  const openCreate = () => { setEditId(null); setForm({ name: '', trading_name: '', reference: '', contact_person: '', contact_email: '', contact_phone: '', status: 'active' }); setEditOpen(true); };
  const openEdit = (c: Client) => { setEditId(c.id); setForm({ name: c.name, trading_name: c.trading_name || '', reference: c.reference || '', contact_person: c.contact_person || '', contact_email: c.contact_email || '', contact_phone: c.contact_phone || '', status: c.status || 'active' }); setEditOpen(true); };

  const handleSave = async () => {
    if (!form.name.trim()) return;
    setSaving(true);
    const payload = { ...form, company_id: companyId, updated_at: new Date().toISOString() };
    let error;
    if (editId) {
      ({ error } = await supabase.from('clients').update(payload).eq('id', editId));
    } else {
      ({ error } = await supabase.from('clients').insert({ ...payload, created_at: new Date().toISOString() }));
    }
    setSaving(false);
    if (error) { setToast({ msg: 'Failed to save', type: 'error' }); return; }
    setToast({ msg: editId ? 'Client updated' : 'Client created', type: 'success' });
    setEditOpen(false);
    onRefresh();
    setTimeout(() => setToast(null), 3000);
  };

  return (
    <div className="animate-fadeSlide space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-sm text-gray-400">{clients.length} client{clients.length !== 1 ? 's' : ''}</p>
        <button onClick={openCreate} className="inline-flex items-center gap-1.5 px-3 py-2 bg-blue-600 hover:bg-blue-500 text-white text-sm font-medium rounded-lg transition-colors cursor-pointer whitespace-nowrap">
          <div className="w-4 h-4 flex items-center justify-center"><i className="ri-add-line"></i></div>
          New Client
        </button>
      </div>

      {editOpen && (
        <div className="bg-[#0f172a]/70 backdrop-blur-sm border border-white/10 rounded-xl p-5 space-y-4">
          <h3 className="text-sm font-semibold text-white">{editId ? 'Edit Client' : 'New Client'}</h3>
          <div className="grid md:grid-cols-2 gap-4">
            <div><label className="block text-xs text-gray-400 mb-1">Name *</label><input type="text" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2.5 text-sm text-white focus:outline-none focus:border-blue-500" /></div>
            <div><label className="block text-xs text-gray-400 mb-1">Trading Name</label><input type="text" value={form.trading_name} onChange={(e) => setForm({ ...form, trading_name: e.target.value })} className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2.5 text-sm text-white focus:outline-none focus:border-blue-500" /></div>
            <div><label className="block text-xs text-gray-400 mb-1">Reference</label><input type="text" value={form.reference} onChange={(e) => setForm({ ...form, reference: e.target.value })} className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2.5 text-sm text-white focus:outline-none focus:border-blue-500" /></div>
            <div><label className="block text-xs text-gray-400 mb-1">Status</label><div className="flex gap-1.5">{['active','inactive','archived'].map((s) => (<button key={s} onClick={() => setForm({ ...form, status: s })} className={`px-3 py-1.5 text-xs font-medium rounded-lg border cursor-pointer capitalize whitespace-nowrap ${form.status === s ? 'bg-blue-600/20 border-blue-500/50 text-blue-400' : 'bg-white/5 border-white/10 text-gray-400'}`}>{s}</button>))}</div></div>
            <div><label className="block text-xs text-gray-400 mb-1">Contact Person</label><input type="text" value={form.contact_person} onChange={(e) => setForm({ ...form, contact_person: e.target.value })} className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2.5 text-sm text-white focus:outline-none focus:border-blue-500" /></div>
            <div><label className="block text-xs text-gray-400 mb-1">Contact Email</label><input type="email" value={form.contact_email} onChange={(e) => setForm({ ...form, contact_email: e.target.value })} className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2.5 text-sm text-white focus:outline-none focus:border-blue-500" /></div>
            <div><label className="block text-xs text-gray-400 mb-1">Contact Phone</label><input type="tel" value={form.contact_phone} onChange={(e) => setForm({ ...form, contact_phone: e.target.value })} className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2.5 text-sm text-white focus:outline-none focus:border-blue-500" /></div>
          </div>
          <div className="flex gap-2">
            <button onClick={handleSave} disabled={saving} className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white text-sm font-medium rounded-lg transition-colors disabled:opacity-50 cursor-pointer whitespace-nowrap">{saving ? 'Saving...' : 'Save'}</button>
            <button onClick={() => setEditOpen(false)} className="px-4 py-2 text-sm font-medium text-gray-400 hover:text-white rounded-lg transition-colors cursor-pointer whitespace-nowrap">Cancel</button>
          </div>
        </div>
      )}

      {clients.length === 0 ? (
        <div className="bg-[#0f172a]/70 border border-white/10 rounded-xl p-12 text-center">
          <div className="w-12 h-12 flex items-center justify-center bg-white/10 rounded-full mx-auto mb-3"><i className="ri-building-2-line text-gray-500 text-xl"></i></div>
          <p className="text-gray-400 font-medium">No clients yet</p>
          <p className="text-sm text-gray-500 mt-1">Create your first client organisation</p>
        </div>
      ) : (
        <div className="bg-[#0f172a]/70 backdrop-blur-sm border border-white/10 rounded-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead><tr className="border-b border-white/10">{['Name','Reference','Contact','Status','Created',''].map((h) => (<th key={h} className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">{h}</th>))}</tr></thead>
              <tbody className="divide-y divide-white/5">
                {clients.map((c) => (
                  <tr key={c.id} className="hover:bg-white/5 transition-colors">
                    <td className="px-4 py-3"><span className="text-white font-medium">{c.name}</span>{c.trading_name && <p className="text-xs text-gray-500">{c.trading_name}</p>}</td>
                    <td className="px-4 py-3 text-gray-400 text-xs font-mono">{c.reference || '—'}</td>
                    <td className="px-4 py-3"><p className="text-gray-300 text-xs">{c.contact_person || '—'}</p><p className="text-gray-500 text-xs">{c.contact_email || ''}</p></td>
                    <td className="px-4 py-3"><span className={`text-[10px] px-2 py-0.5 rounded-full border font-medium capitalize ${c.status === 'active' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : c.status === 'inactive' ? 'bg-amber-500/10 text-amber-400 border-amber-500/20' : 'bg-gray-500/10 text-gray-400 border-gray-500/20'}`}>{c.status}</span></td>
                    <td className="px-4 py-3 text-gray-400 text-xs">{new Date(c.created_at).toLocaleDateString('en-GB')}</td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button onClick={() => openEdit(c)} className="w-7 h-7 flex items-center justify-center text-gray-400 hover:text-white rounded-lg hover:bg-white/5 cursor-pointer" title="Edit"><i className="ri-edit-line text-xs"></i></button>
                        <Link href={`/dashboard/clients/${c.id}/users`} className="w-7 h-7 flex items-center justify-center text-gray-400 hover:text-white rounded-lg hover:bg-white/5 cursor-pointer" title="Users"><i className="ri-team-line text-xs"></i></Link>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {toast && <Toast msg={toast.msg} type={toast.type} onDismiss={() => setToast(null)} />}
    </div>
  );
}

function ContractsTab({ companyId, clients, profileId }: { companyId: string | null; clients: Client[]; profileId: string | undefined }) {
  const [contracts, setContracts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [composeOpen, setComposeOpen] = useState(false);
  const [form, setForm] = useState({ client_id: '', reference: '', contract_name: '', start_date: '', end_date: '', status: 'draft', service_description: '', renewal_type: 'auto', notice_period_days: 30 });
  const [saving, setSaving] = useState(false);

  const fetchContracts = useCallback(async () => {
    if (!companyId) return;
    setLoading(true);
    const { data } = await supabase.from('service_contracts').select('*').eq('company_id', companyId).order('created_at', { ascending: false });
    setContracts(data || []);
    setLoading(false);
  }, [companyId]);

  useEffect(() => { fetchContracts(); }, [fetchContracts]);

  const handleSave = async () => {
    if (!form.client_id || !form.reference || !form.contract_name) return;
    setSaving(true);
    const { error } = await supabase.from('service_contracts').insert({ company_id: companyId, ...form, created_by: profileId });
    setSaving(false);
    if (error) return;
    setComposeOpen(false);
    setForm({ client_id: '', reference: '', contract_name: '', start_date: '', end_date: '', status: 'draft', service_description: '', renewal_type: 'auto', notice_period_days: 30 });
    fetchContracts();
  };

  const updateStatus = async (id: string, newStatus: string) => {
    await supabase.from('service_contracts').update({ status: newStatus, updated_at: new Date().toISOString() }).eq('id', id);
    fetchContracts();
  };

  const STATUS_STYLES: Record<string, string> = {
    draft: 'bg-gray-500/10 text-gray-400 border-gray-500/20',
    awaiting_internal_approval: 'bg-purple-500/10 text-purple-400 border-purple-500/20',
    awaiting_client_acknowledgment: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
    active: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
    suspended: 'bg-orange-500/10 text-orange-400 border-orange-500/20',
    expired: 'bg-red-500/10 text-red-400 border-red-500/20',
    terminated: 'bg-red-500/10 text-red-400 border-red-500/20',
    archived: 'bg-gray-500/10 text-gray-400 border-gray-500/20',
  };

  if (loading) return <div className="flex items-center justify-center h-40"><div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500"></div></div>;

  return (
    <div className="animate-fadeSlide space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-sm text-gray-400">{contracts.length} contract{contracts.length !== 1 ? 's' : ''}</p>
        <button onClick={() => setComposeOpen(!composeOpen)} className="inline-flex items-center gap-1.5 px-3 py-2 bg-blue-600 hover:bg-blue-500 text-white text-sm font-medium rounded-lg transition-colors cursor-pointer whitespace-nowrap">
          <div className="w-4 h-4 flex items-center justify-center"><i className={composeOpen ? 'ri-close-line' : 'ri-add-line'}></i></div>
          {composeOpen ? 'Cancel' : 'New Contract'}
        </button>
      </div>

      {composeOpen && (
        <div className="bg-[#0f172a]/70 border border-white/10 rounded-xl p-5 space-y-4">
          <h3 className="text-sm font-semibold text-white">New Contract</h3>
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs text-gray-400 mb-1">Client *</label>
              <div className="flex flex-wrap gap-1.5">
                {clients.map((c) => (<button key={c.id} onClick={() => setForm({ ...form, client_id: c.id })} className={`px-3 py-1.5 text-xs font-medium rounded-lg border cursor-pointer whitespace-nowrap ${form.client_id === c.id ? 'bg-blue-600/20 border-blue-500/50 text-blue-400' : 'bg-white/5 border-white/10 text-gray-400'}`}>{c.name}</button>))}
              </div>
            </div>
            <div><label className="block text-xs text-gray-400 mb-1">Reference *</label><input type="text" value={form.reference} onChange={(e) => setForm({ ...form, reference: e.target.value })} className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2.5 text-sm text-white focus:outline-none focus:border-blue-500" placeholder="e.g. CON-2025-001" /></div>
            <div><label className="block text-xs text-gray-400 mb-1">Contract Name *</label><input type="text" value={form.contract_name} onChange={(e) => setForm({ ...form, contract_name: e.target.value })} className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2.5 text-sm text-white focus:outline-none focus:border-blue-500" placeholder="Security Services Agreement" /></div>
            <div><label className="block text-xs text-gray-400 mb-1">Renewal</label><div className="flex gap-1.5">{['auto','manual','none'].map((r) => (<button key={r} onClick={() => setForm({ ...form, renewal_type: r })} className={`px-3 py-1.5 text-xs font-medium rounded-lg border cursor-pointer capitalize whitespace-nowrap ${form.renewal_type === r ? 'bg-blue-600/20 border-blue-500/50 text-blue-400' : 'bg-white/5 border-white/10 text-gray-400'}`}>{r}</button>))}</div></div>
            <div><label className="block text-xs text-gray-400 mb-1">Start Date</label><input type="date" value={form.start_date} onChange={(e) => setForm({ ...form, start_date: e.target.value })} className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2.5 text-sm text-white focus:outline-none focus:border-blue-500" /></div>
            <div><label className="block text-xs text-gray-400 mb-1">End Date</label><input type="date" value={form.end_date} onChange={(e) => setForm({ ...form, end_date: e.target.value })} className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2.5 text-sm text-white focus:outline-none focus:border-blue-500" /></div>
            <div className="md:col-span-2"><label className="block text-xs text-gray-400 mb-1">Service Description</label><textarea value={form.service_description} onChange={(e) => setForm({ ...form, service_description: e.target.value })} rows={3} className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2.5 text-sm text-white focus:outline-none focus:border-blue-500 resize-none" /></div>
          </div>
          <button onClick={handleSave} disabled={saving} className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white text-sm font-medium rounded-lg transition-colors disabled:opacity-50 cursor-pointer whitespace-nowrap">{saving ? 'Creating...' : 'Create Contract'}</button>
        </div>
      )}

      {contracts.length === 0 ? (
        <div className="bg-[#0f172a]/70 border border-white/10 rounded-xl p-12 text-center">
          <div className="w-12 h-12 flex items-center justify-center bg-white/10 rounded-full mx-auto mb-3"><i className="ri-file-text-line text-gray-500 text-xl"></i></div>
          <p className="text-gray-400 font-medium">No contracts yet</p>
        </div>
      ) : (
        <div className="space-y-3">
          {contracts.map((c) => {
            const clientName = clients.find((cl) => cl.id === c.client_id)?.name || 'Unknown';
            return (
              <div key={c.id} className="bg-[#0f172a]/70 backdrop-blur-sm border border-white/10 rounded-xl p-5">
                <div className="flex items-start justify-between gap-4">
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="text-sm font-semibold text-white">{c.contract_name}</h3>
                      <span className={`text-[10px] px-2 py-0.5 rounded-full border font-medium capitalize ${STATUS_STYLES[c.status] || STATUS_STYLES.draft}`}>{c.status.replace(/_/g, ' ')}</span>
                    </div>
                    <p className="text-xs text-gray-500 mt-1">{clientName} · Ref: {c.reference} · v{c.version}</p>
                    {c.start_date && <p className="text-xs text-gray-500 mt-0.5">{c.start_date} — {c.end_date || 'Ongoing'} · {c.renewal_type} renewal · {c.notice_period_days}d notice</p>}
                    {c.service_description && <p className="text-sm text-gray-400 mt-2 line-clamp-2">{c.service_description}</p>}
                  </div>
                  <div className="flex items-center gap-1 flex-shrink-0">
                    {c.status === 'draft' && <button onClick={() => updateStatus(c.id, 'awaiting_internal_approval')} className="px-2 py-1 text-[10px] font-medium text-purple-400 bg-purple-500/10 rounded border border-purple-500/20 hover:bg-purple-500/20 cursor-pointer whitespace-nowrap">Submit</button>}
                    {c.status === 'awaiting_internal_approval' && <button onClick={() => updateStatus(c.id, 'awaiting_client_acknowledgment')} className="px-2 py-1 text-[10px] font-medium text-amber-400 bg-amber-500/10 rounded border border-amber-500/20 hover:bg-amber-500/20 cursor-pointer whitespace-nowrap">Send to Client</button>}
                    {c.status === 'awaiting_client_acknowledgment' && <button onClick={() => updateStatus(c.id, 'active')} className="px-2 py-1 text-[10px] font-medium text-emerald-400 bg-emerald-500/10 rounded border border-emerald-500/20 hover:bg-emerald-500/20 cursor-pointer whitespace-nowrap">Acknowledge</button>}
                    {(c.status === 'active' || c.status === 'suspended') && <button onClick={() => updateStatus(c.id, c.status === 'active' ? 'suspended' : 'active')} className="px-2 py-1 text-[10px] font-medium text-orange-400 bg-orange-500/10 rounded border border-orange-500/20 hover:bg-orange-500/20 cursor-pointer whitespace-nowrap">{c.status === 'active' ? 'Suspend' : 'Resume'}</button>}
                    <button onClick={() => updateStatus(c.id, 'archived')} className="px-2 py-1 text-[10px] font-medium text-gray-400 bg-white/5 rounded border border-white/10 hover:bg-white/10 cursor-pointer whitespace-nowrap">Archive</button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

function RequestsTab({ companyId, clients }: { companyId: string | null; clients: Client[] }) {
  const [requests, setRequests] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('all');

  const fetchRequests = useCallback(async () => {
    if (!companyId) return;
    setLoading(true);
    const { data } = await supabase.from('service_requests').select('*').eq('company_id', companyId).order('created_at', { ascending: false }).limit(100);
    setRequests(data || []);
    setLoading(false);
  }, [companyId]);

  useEffect(() => { fetchRequests(); }, [fetchRequests]);

  const updateStatus = async (id: string, newStatus: string, resolution?: string) => {
    const updates: any = { status: newStatus, updated_at: new Date().toISOString() };
    if (newStatus === 'completed' || newStatus === 'closed') updates.closed_at = new Date().toISOString();
    if (resolution) updates.resolution = resolution;
    await supabase.from('service_requests').update(updates).eq('id', id);
    fetchRequests();
  };

  const filtered = statusFilter === 'all' ? requests : requests.filter((r) => r.status === statusFilter);
  const statusCounts: Record<string, number> = {};
  requests.forEach((r) => { statusCounts[r.status] = (statusCounts[r.status] || 0) + 1; });

  const STATUS_STYLES: Record<string, string> = {
    submitted: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
    acknowledged: 'bg-purple-500/10 text-purple-400 border-purple-500/20',
    under_review: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
    awaiting_client: 'bg-orange-500/10 text-orange-400 border-orange-500/20',
    approved: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
    declined: 'bg-red-500/10 text-red-400 border-red-500/20',
    scheduled: 'bg-teal-500/10 text-teal-400 border-teal-500/20',
    completed: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
    closed: 'bg-gray-500/10 text-gray-400 border-gray-500/20',
    canceled: 'bg-gray-500/10 text-gray-400 border-gray-500/20',
  };

  if (loading) return <div className="flex items-center justify-center h-40"><div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500"></div></div>;

  return (
    <div className="animate-fadeSlide space-y-4">
      <div className="flex items-center gap-1.5 flex-wrap">
        <button onClick={() => setStatusFilter('all')} className={`px-3 py-1.5 text-xs font-medium rounded-lg cursor-pointer whitespace-nowrap ${statusFilter === 'all' ? 'bg-white/10 text-white' : 'bg-white/5 text-gray-400'}`}>All ({requests.length})</button>
        {Object.keys(STATUS_STYLES).filter((s) => statusCounts[s]).map((s) => (<button key={s} onClick={() => setStatusFilter(s)} className={`px-3 py-1.5 text-xs font-medium rounded-lg border cursor-pointer whitespace-nowrap capitalize ${statusFilter === s ? STATUS_STYLES[s] + ' ring-1 ring-white/20' : 'bg-white/5 border-white/10 text-gray-400'}`}>{s.replace(/_/g, ' ')} ({statusCounts[s]})</button>))}
      </div>

      {filtered.length === 0 ? (
        <div className="bg-[#0f172a]/70 border border-white/10 rounded-xl p-12 text-center"><p className="text-gray-400 font-medium">No requests found</p></div>
      ) : (
        <div className="space-y-3">
          {filtered.map((r) => {
            const clientName = clients.find((c) => c.id === r.client_id)?.name || 'Unknown';
            return (
              <div key={r.id} className="bg-[#0f172a]/70 backdrop-blur-sm border border-white/10 rounded-xl p-5">
                <div className="flex items-start justify-between gap-4">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 flex-wrap mb-1">
                      <span className="text-sm font-semibold text-white capitalize">{r.request_type.replace(/_/g, ' ')}</span>
                      <span className={`text-[10px] px-2 py-0.5 rounded-full border font-medium capitalize ${STATUS_STYLES[r.status] || STATUS_STYLES.submitted}`}>{r.status.replace(/_/g, ' ')}</span>
                      <span className={`text-[10px] px-2 py-0.5 rounded-full border font-medium capitalize ${r.priority === 'urgent' ? 'bg-red-500/10 text-red-400 border-red-500/20' : r.priority === 'high' ? 'bg-amber-500/10 text-amber-400 border-amber-500/20' : 'bg-blue-500/10 text-blue-400 border-blue-500/20'}`}>{r.priority}</span>
                    </div>
                    <p className="text-sm text-gray-400 line-clamp-2">{r.description}</p>
                    <p className="text-xs text-gray-500 mt-1.5">{clientName} · {new Date(r.created_at).toLocaleDateString('en-GB')}</p>
                    {r.resolution && <p className="text-xs text-emerald-400 mt-1">Resolution: {r.resolution}</p>}
                  </div>
                  <div className="flex items-center gap-1 flex-shrink-0 flex-wrap">
                    {r.status === 'submitted' && <button onClick={() => updateStatus(r.id, 'acknowledged')} className="px-2 py-1 text-[10px] font-medium text-purple-400 bg-purple-500/10 rounded border border-purple-500/20 hover:bg-purple-500/20 cursor-pointer whitespace-nowrap">Acknowledge</button>}
                    {r.status === 'acknowledged' && <button onClick={() => updateStatus(r.id, 'under_review')} className="px-2 py-1 text-[10px] font-medium text-amber-400 bg-amber-500/10 rounded border border-amber-500/20 hover:bg-amber-500/20 cursor-pointer whitespace-nowrap">Review</button>}
                    {r.status === 'under_review' && <><button onClick={() => updateStatus(r.id, 'approved')} className="px-2 py-1 text-[10px] font-medium text-emerald-400 bg-emerald-500/10 rounded border border-emerald-500/20 hover:bg-emerald-500/20 cursor-pointer whitespace-nowrap">Approve</button><button onClick={() => updateStatus(r.id, 'declined')} className="px-2 py-1 text-[10px] font-medium text-red-400 bg-red-500/10 rounded border border-red-500/20 hover:bg-red-500/20 cursor-pointer whitespace-nowrap">Decline</button></>}
                    {(r.status === 'approved' || r.status === 'scheduled') && <button onClick={() => updateStatus(r.id, 'completed', 'Service delivered as requested.')} className="px-2 py-1 text-[10px] font-medium text-emerald-400 bg-emerald-500/10 rounded border border-emerald-500/20 hover:bg-emerald-500/20 cursor-pointer whitespace-nowrap">Complete</button>}
                    <button onClick={() => updateStatus(r.id, 'closed')} className="px-2 py-1 text-[10px] font-medium text-gray-400 bg-white/5 rounded border border-white/10 hover:bg-white/10 cursor-pointer whitespace-nowrap">Close</button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

function PublicationsTab({ companyId }: { companyId: string | null }) {
  const [publications, setPublications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchPubs = useCallback(async () => {
    if (!companyId) return;
    setLoading(true);
    const { data } = await supabase.from('record_publications').select('*').eq('company_id', companyId).order('created_at', { ascending: false }).limit(50);
    setPublications(data || []);
    setLoading(false);
  }, [companyId]);

  useEffect(() => { fetchPubs(); }, [fetchPubs]);

  const withdraw = async (pubId: string, recordType: string, recordId: string) => {
    const session = await supabase.auth.getSession();
    const token = session.data.session?.access_token;
    await fetch(`${process.env.NEXT_PUBLIC_SUPABASE_URL}/functions/v1/publish-record`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify({ action: 'withdraw', record_type: recordType, record_id: recordId, withdraw_reason: 'Manual withdrawal' }),
    });
    fetchPubs();
  };

  const publish = async (recordType: string, recordId: string) => {
    const session = await supabase.auth.getSession();
    const token = session.data.session?.access_token;
    await fetch(`${process.env.NEXT_PUBLIC_SUPABASE_URL}/functions/v1/publish-record`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify({ action: 'publish', record_type: recordType, record_id: recordId }),
    });
    fetchPubs();
  };

  const VIS_STYLES: Record<string, string> = {
    internal: 'bg-gray-500/10 text-gray-400 border-gray-500/20',
    pending_review: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
    approved_for_client: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
    withdrawn: 'bg-red-500/10 text-red-400 border-red-500/20',
  };

  if (loading) return <div className="flex items-center justify-center h-40"><div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500"></div></div>;

  return (
    <div className="animate-fadeSlide space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-sm text-gray-400">{publications.length} publication record{publications.length !== 1 ? 's' : ''}</p>
        <button onClick={fetchPubs} className="flex items-center gap-1.5 px-3 py-1.5 text-sm text-gray-400 hover:text-white bg-white/5 rounded-lg cursor-pointer whitespace-nowrap">
          <div className="w-4 h-4 flex items-center justify-center"><i className="ri-refresh-line"></i></div>
          Refresh
        </button>
      </div>

      {publications.length === 0 ? (
        <div className="bg-[#0f172a]/70 border border-white/10 rounded-xl p-12 text-center">
          <div className="w-12 h-12 flex items-center justify-center bg-white/10 rounded-full mx-auto mb-3"><i className="ri-eye-line text-gray-500 text-xl"></i></div>
          <p className="text-gray-400 font-medium">No publications yet</p>
          <p className="text-sm text-gray-500 mt-1">Publish incidents, OB entries or reports using the publish-record edge function</p>
        </div>
      ) : (
        <div className="space-y-2">
          {publications.map((p) => (
            <div key={p.id} className="bg-[#0f172a]/70 backdrop-blur-sm border border-white/10 rounded-xl p-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className={`text-[10px] px-2 py-0.5 rounded-full border font-medium capitalize ${VIS_STYLES[p.visibility] || VIS_STYLES.internal}`}>{p.visibility.replace(/_/g, ' ')}</span>
                <span className="text-sm text-white font-medium capitalize">{p.record_type.replace(/_/g, ' ')}</span>
                <span className="text-xs text-gray-500 font-mono">{p.record_id.slice(0, 8)}...</span>
                {p.published_at && <span className="text-xs text-gray-500">Published {new Date(p.published_at).toLocaleDateString('en-GB')}</span>}
                {p.withdrawn_at && <span className="text-xs text-red-400">Withdrawn {new Date(p.withdrawn_at).toLocaleDateString('en-GB')}</span>}
              </div>
              <div className="flex items-center gap-1">
                {p.visibility === 'internal' && <button onClick={() => publish(p.record_type, p.record_id)} className="px-2 py-1 text-[10px] font-medium text-emerald-400 bg-emerald-500/10 rounded border border-emerald-500/20 hover:bg-emerald-500/20 cursor-pointer whitespace-nowrap">Publish</button>}
                {p.visibility === 'approved_for_client' && <button onClick={() => withdraw(p.id, p.record_type, p.record_id)} className="px-2 py-1 text-[10px] font-medium text-red-400 bg-red-500/10 rounded border border-red-500/20 hover:bg-red-500/20 cursor-pointer whitespace-nowrap">Withdraw</button>}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function BrandingTab({ companyId, clients, profileId }: { companyId: string | null; clients: Client[]; profileId: string | undefined }) {
  const [selectedClient, setSelectedClient] = useState<string>('');
  const [branding, setBranding] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({ primary_color: '#2563eb', accent_color: '#14b8a6', support_email: '', support_phone: '', welcome_message: '' });
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState<{ msg: string; type: 'success' | 'error' } | null>(null);

  const loadBranding = useCallback(async () => {
    if (!companyId || !selectedClient) return;
    setLoading(true);
    const { data } = await supabase.from('client_branding').select('*').eq('company_id', companyId).eq('client_id', selectedClient).maybeSingle();
    setBranding(data);
    if (data) setForm({ primary_color: data.primary_color || '#2563eb', accent_color: data.accent_color || '#14b8a6', support_email: data.support_email || '', support_phone: data.support_phone || '', welcome_message: data.welcome_message || '' });
    setLoading(false);
  }, [companyId, selectedClient]);

  useEffect(() => { loadBranding(); }, [loadBranding]);

  const handleSave = async () => {
    if (!selectedClient) return;
    setSaving(true);
    let error;
    if (branding) {
      ({ error } = await supabase.from('client_branding').update({ ...form, updated_at: new Date().toISOString() }).eq('id', branding.id));
    } else {
      ({ error } = await supabase.from('client_branding').insert({ company_id: companyId, client_id: selectedClient, ...form }));
    }
    setSaving(false);
    if (error) { setToast({ msg: 'Failed to save', type: 'error' }); return; }
    setToast({ msg: 'Branding saved', type: 'success' });
    loadBranding();
    setTimeout(() => setToast(null), 3000);
  };

  return (
    <div className="animate-fadeSlide space-y-4 max-w-2xl">
      <div>
        <label className="block text-xs text-gray-400 mb-2">Select Client</label>
        <div className="flex flex-wrap gap-1.5">
          {clients.map((c) => (<button key={c.id} onClick={() => setSelectedClient(c.id)} className={`px-3 py-1.5 text-xs font-medium rounded-lg border cursor-pointer whitespace-nowrap ${selectedClient === c.id ? 'bg-blue-600/20 border-blue-500/50 text-blue-400' : 'bg-white/5 border-white/10 text-gray-400'}`}>{c.name}</button>))}
        </div>
      </div>

      {loading ? <div className="flex justify-center py-10"><div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500"></div></div> : selectedClient ? (
        <div className="bg-[#0f172a]/70 border border-white/10 rounded-xl p-5 space-y-4">
          <h3 className="text-sm font-semibold text-white">Portal Branding</h3>
          <div className="grid md:grid-cols-2 gap-4">
            <div><label className="block text-xs text-gray-400 mb-1">Primary Color</label><div className="flex items-center gap-2"><input type="color" value={form.primary_color} onChange={(e) => setForm({ ...form, primary_color: e.target.value })} className="w-10 h-10 rounded border border-white/10 bg-transparent cursor-pointer" /><input type="text" value={form.primary_color} onChange={(e) => setForm({ ...form, primary_color: e.target.value })} className="flex-1 bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white font-mono" /></div></div>
            <div><label className="block text-xs text-gray-400 mb-1">Accent Color</label><div className="flex items-center gap-2"><input type="color" value={form.accent_color} onChange={(e) => setForm({ ...form, accent_color: e.target.value })} className="w-10 h-10 rounded border border-white/10 bg-transparent cursor-pointer" /><input type="text" value={form.accent_color} onChange={(e) => setForm({ ...form, accent_color: e.target.value })} className="flex-1 bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white font-mono" /></div></div>
            <div><label className="block text-xs text-gray-400 mb-1">Support Email</label><input type="email" value={form.support_email} onChange={(e) => setForm({ ...form, support_email: e.target.value })} className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2.5 text-sm text-white focus:outline-none focus:border-blue-500" /></div>
            <div><label className="block text-xs text-gray-400 mb-1">Support Phone</label><input type="tel" value={form.support_phone} onChange={(e) => setForm({ ...form, support_phone: e.target.value })} className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2.5 text-sm text-white focus:outline-none focus:border-blue-500" /></div>
            <div className="md:col-span-2"><label className="block text-xs text-gray-400 mb-1">Welcome Message</label><textarea value={form.welcome_message} onChange={(e) => setForm({ ...form, welcome_message: e.target.value })} rows={3} className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2.5 text-sm text-white focus:outline-none focus:border-blue-500 resize-none" /></div>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={handleSave} disabled={saving} className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white text-sm font-medium rounded-lg transition-colors disabled:opacity-50 cursor-pointer whitespace-nowrap">{saving ? 'Saving...' : 'Save Branding'}</button>
            <div className="flex items-center gap-2 ml-4">
              <span className="text-xs text-gray-500">Preview:</span>
              <div className="w-6 h-6 rounded" style={{ backgroundColor: form.primary_color }}></div>
              <div className="w-6 h-6 rounded" style={{ backgroundColor: form.accent_color }}></div>
            </div>
          </div>
        </div>
      ) : (
        <div className="bg-[#0f172a]/70 border border-white/10 rounded-xl p-8 text-center">
          <p className="text-gray-400 text-sm">Select a client to configure branding</p>
        </div>
      )}

      {toast && <Toast msg={toast.msg} type={toast.type} onDismiss={() => setToast(null)} />}
    </div>
  );
}

function Toast({ msg, type, onDismiss }: { msg: string; type: 'success' | 'error'; onDismiss: () => void }) {
  return (
    <div className={`fixed bottom-6 right-6 z-50 px-4 py-3 rounded-xl border shadow-lg flex items-center gap-2 ${
      type === 'success' ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400' : 'bg-red-500/10 border-red-500/30 text-red-400'
    }`}>
      <div className="w-4 h-4 flex items-center justify-center"><i className={type === 'success' ? 'ri-check-line' : 'ri-error-warning-line'}></i></div>
      <span className="text-sm font-medium">{msg}</span>
      <button onClick={onDismiss} className="ml-2 w-5 h-5 flex items-center justify-center hover:bg-white/5 rounded cursor-pointer"><i className="ri-close-line text-xs"></i></button>
    </div>
  );
}