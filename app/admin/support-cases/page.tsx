'use client';

import { useState } from 'react';
import { useAuth } from '@/lib/auth';
import { useSupportCases } from '@/lib/useSupportCases';
import { usePlatformAccess } from '@/lib/usePlatformAccess';

export default function SupportCasesPage() {
  const { profile } = useAuth();
  const { can } = usePlatformAccess(profile?.id || null);
  const { cases, loading, createCase, updateStatus, assignCase } = useSupportCases(profile?.id || null);
  const [selectedCase, setSelectedCase] = useState<string | null>(null);
  const [showNew, setShowNew] = useState(false);
  const [newSubject, setNewSubject] = useState('');
  const [newDesc, setNewDesc] = useState('');
  const [newCategory, setNewCategory] = useState('general');
  const [newPriority, setNewPriority] = useState('medium');
  const [filterStatus, setFilterStatus] = useState('all');
  const [message, setMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  const filtered = filterStatus === 'all' ? cases : cases.filter(c => c.status === filterStatus || (filterStatus === 'open' && ['new','triaged','investigating','awaiting_customer','awaiting_internal','reopened'].includes(c.status)));

  const handleCreate = async () => {
    if (!newSubject.trim() || !newDesc.trim()) return;
    const { error } = await createCase({
      subject: newSubject,
      description: newDesc,
      category: newCategory,
      priority: newPriority,
    });
    if (error) {
      setMessage({ text: 'Failed to create case', type: 'error' });
    } else {
      setMessage({ text: 'Case created', type: 'success' });
      setShowNew(false);
      setNewSubject(''); setNewDesc('');
    }
  };

  const priorityColors: Record<string, string> = {
    low: 'bg-gray-600/15 text-gray-400',
    medium: 'bg-blue-600/15 text-blue-400',
    high: 'bg-amber-600/15 text-amber-400',
    urgent: 'bg-red-600/15 text-red-400',
  };

  const statusColors: Record<string, string> = {
    new: 'bg-blue-600/15 text-blue-400',
    triaged: 'bg-indigo-600/15 text-indigo-400',
    investigating: 'bg-purple-600/15 text-purple-400',
    awaiting_customer: 'bg-amber-600/15 text-amber-400',
    awaiting_internal: 'bg-amber-600/15 text-amber-400',
    resolved: 'bg-emerald-600/15 text-emerald-400',
    closed: 'bg-gray-600/15 text-gray-400',
    reopened: 'bg-red-600/15 text-red-400',
  };

  const selectedCaseData = cases.find(c => c.id === selectedCase);

  return (
    <div className="p-4 lg:p-6 max-w-7xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-white">Support Cases</h1>
          <p className="text-sm text-gray-500 mt-0.5">{cases.length} cases total</p>
        </div>
        <button onClick={() => setShowNew(true)} className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-medium rounded-lg transition-colors whitespace-nowrap cursor-pointer">
          <div className="w-4 h-4 flex items-center justify-center"><i className="ri-add-line"></i></div>
          New Case
        </button>
      </div>

      {message && (
        <div className={`mb-4 p-3 rounded-lg text-sm ${message.type === 'success' ? 'bg-emerald-600/10 border border-emerald-600/20 text-emerald-400' : 'bg-red-600/10 border border-red-600/20 text-red-400'}`}>
          {message.text}
          <button onClick={() => setMessage(null)} className="ml-2 text-xs underline cursor-pointer">Dismiss</button>
        </div>
      )}

      {showNew && (
        <div className="mb-6 bg-[#111827] border border-gray-800 rounded-xl p-5">
          <h3 className="text-white font-semibold text-sm mb-4">New Support Case</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <label className="block text-xs text-gray-500 mb-1">Subject</label>
              <input type="text" value={newSubject} onChange={(e) => setNewSubject(e.target.value)} className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-indigo-500" placeholder="Brief description of the issue" />
            </div>
            <div className="md:col-span-2">
              <label className="block text-xs text-gray-500 mb-1">Description</label>
              <textarea value={newDesc} onChange={(e) => setNewDesc(e.target.value)} rows={3} className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-indigo-500" placeholder="Detailed description..." />
            </div>
            <div>
              <label className="block text-xs text-gray-500 mb-1">Category</label>
              <select value={newCategory} onChange={(e) => setNewCategory(e.target.value)} className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-indigo-500 pr-8">
                <option value="general">General</option>
                <option value="billing">Billing</option>
                <option value="technical">Technical</option>
                <option value="account">Account</option>
                <option value="security">Security</option>
                <option value="compliance">Compliance</option>
              </select>
            </div>
            <div>
              <label className="block text-xs text-gray-500 mb-1">Priority</label>
              <select value={newPriority} onChange={(e) => setNewPriority(e.target.value)} className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-indigo-500 pr-8">
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
                <option value="urgent">Urgent</option>
              </select>
            </div>
          </div>
          <div className="flex items-center gap-3 mt-4">
            <button onClick={handleCreate} className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-medium rounded-lg transition-colors whitespace-nowrap cursor-pointer">Create Case</button>
            <button onClick={() => setShowNew(false)} className="px-4 py-2 bg-gray-800 hover:bg-gray-700 text-gray-300 text-sm rounded-lg transition-colors whitespace-nowrap cursor-pointer">Cancel</button>
          </div>
        </div>
      )}

      <div className="flex items-center gap-2 mb-4 flex-wrap">
        {['all','open','new','investigating','awaiting_customer','resolved','closed'].map((s) => (
          <button key={s} onClick={() => setFilterStatus(s)} className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all cursor-pointer whitespace-nowrap ${filterStatus === s ? 'bg-indigo-600/20 text-indigo-400 border border-indigo-600/30' : 'bg-gray-800 text-gray-400 border border-gray-700 hover:border-gray-600'}`}>
            {s === 'open' ? 'Open' : s.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
          </button>
        ))}
      </div>

      <div className="bg-[#111827] border border-gray-800 rounded-xl overflow-hidden">
        <div className="divide-y divide-gray-800">
          {filtered.length === 0 && (
            <div className="px-5 py-12 text-center text-sm text-gray-500">No cases found</div>
          )}
          {filtered.map((c) => (
            <div key={c.id} className={`px-5 py-3 hover:bg-white/[0.02] transition-colors cursor-pointer ${selectedCase === c.id ? 'bg-white/[0.03]' : ''}`} onClick={() => setSelectedCase(selectedCase === c.id ? null : c.id)}>
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-gray-500 font-mono">{c.case_ref}</span>
                    <span className={`px-1.5 py-0.5 rounded text-[10px] font-medium ${statusColors[c.status] || ''}`}>{c.status.replace(/_/g, ' ')}</span>
                    <span className={`px-1.5 py-0.5 rounded text-[10px] font-medium ${priorityColors[c.priority] || ''}`}>{c.priority}</span>
                  </div>
                  <p className="text-sm text-white mt-1 truncate">{c.subject}</p>
                  <div className="flex items-center gap-3 mt-1 text-xs text-gray-500">
                    <span>{c.category}</span>
                    {c.company?.name && <span>{c.company.name}</span>}
                    <span>{c.message_count || 0} messages</span>
                    <span>{new Date(c.created_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}</span>
                  </div>
                </div>
              </div>
              {selectedCase === c.id && (
                <div className="mt-3 pt-3 border-t border-gray-800">
                  <p className="text-sm text-gray-400 mb-2">{c.description || 'No description'}</p>
                  {c.resolution && (
                    <p className="text-sm text-emerald-400 mb-2">Resolution: {c.resolution}</p>
                  )}
                  <div className="flex items-center gap-2 mt-2 flex-wrap">
                    {can('support.manage') && c.status !== 'resolved' && c.status !== 'closed' && (
                      <button onClick={(e) => { e.stopPropagation(); updateStatus(c.id, 'resolved', 'Resolved by platform support'); }} className="px-3 py-1.5 bg-emerald-600/15 text-emerald-400 text-xs rounded-lg hover:bg-emerald-600/25 transition-colors cursor-pointer whitespace-nowrap">
                        Resolve
                      </button>
                    )}
                    {can('support.manage') && c.status === 'resolved' && (
                      <button onClick={(e) => { e.stopPropagation(); updateStatus(c.id, 'closed'); }} className="px-3 py-1.5 bg-gray-600/15 text-gray-400 text-xs rounded-lg hover:bg-gray-600/25 transition-colors cursor-pointer whitespace-nowrap">
                        Close
                      </button>
                    )}
                    {can('support.manage') && (c.status === 'resolved' || c.status === 'closed') && (
                      <button onClick={(e) => { e.stopPropagation(); updateStatus(c.id, 'reopened'); }} className="px-3 py-1.5 bg-red-600/15 text-red-400 text-xs rounded-lg hover:bg-red-600/25 transition-colors cursor-pointer whitespace-nowrap">
                        Reopen
                      </button>
                    )}
                    {can('support.manage') && c.status === 'new' && (
                      <button onClick={(e) => { e.stopPropagation(); updateStatus(c.id, 'triaged'); }} className="px-3 py-1.5 bg-indigo-600/15 text-indigo-400 text-xs rounded-lg hover:bg-indigo-600/25 transition-colors cursor-pointer whitespace-nowrap">
                        Triage
                      </button>
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