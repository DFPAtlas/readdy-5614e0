'use client';

import { useState } from 'react';
import { AuditFinding } from '@/lib/useACSCompliance';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/lib/auth';

const SEVERITY_COLORS: Record<string, string> = {
  critical: 'bg-red-500/10 text-red-400 border-red-500/20',
  high: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
  medium: 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20',
  low: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
};

const STATUS_COLORS: Record<string, string> = {
  open: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
  in_progress: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
  resolved: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
  closed: 'bg-gray-500/10 text-gray-400 border-gray-500/20',
};

export default function ActionCentre({ findings, onRefresh }: { findings: AuditFinding[]; onRefresh: () => void }) {
  const { profile } = useAuth();
  const [filter, setFilter] = useState<'all' | 'open' | 'resolved'>('open');
  const [severityFilter, setSeverityFilter] = useState<string>('all');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [notes, setNotes] = useState('');

  const filtered = findings.filter((f) => {
    if (filter !== 'all' && (filter === 'open' ? f.status === 'resolved' || f.status === 'closed' : f.status !== 'resolved' && f.status !== 'closed')) return false;
    if (severityFilter !== 'all' && f.severity !== severityFilter) return false;
    return true;
  });

  async function resolveFinding(id: string) {
    if (!profile?.id) return;
    await supabase.from('acs_audit_findings').update({
      status: 'resolved',
      resolution_notes: notes || null,
      resolved_at: new Date().toISOString(),
    }).eq('id', id);
    setEditingId(null);
    setNotes('');
    onRefresh();
  }

  async function updateStatus(id: string, newStatus: string) {
    await supabase.from('acs_audit_findings').update({ status: newStatus }).eq('id', id);
    onRefresh();
  }

  const openCount = findings.filter((f) => f.status === 'open').length;
  const criticalOpen = findings.filter((f) => f.severity === 'critical' && f.status === 'open').length;

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-4 gap-3">
        <div className="bg-[#0f172a]/70 backdrop-blur-sm border border-white/10 rounded-xl p-4 text-center">
          <div className="text-2xl font-bold text-white">{findings.length}</div>
          <div className="text-xs text-gray-500">Total Findings</div>
        </div>
        <div className="bg-[#0f172a]/70 backdrop-blur-sm border border-red-500/20 rounded-xl p-4 text-center">
          <div className="text-2xl font-bold text-red-400">{criticalOpen}</div>
          <div className="text-xs text-gray-500">Critical Open</div>
        </div>
        <div className="bg-[#0f172a]/70 backdrop-blur-sm border border-amber-500/20 rounded-xl p-4 text-center">
          <div className="text-2xl font-bold text-amber-400">{openCount}</div>
          <div className="text-xs text-gray-500">Open</div>
        </div>
        <div className="bg-[#0f172a]/70 backdrop-blur-sm border border-emerald-500/20 rounded-xl p-4 text-center">
          <div className="text-2xl font-bold text-emerald-400">{findings.filter((f) => f.status === 'resolved' || f.status === 'closed').length}</div>
          <div className="text-xs text-gray-500">Resolved</div>
        </div>
      </div>

      <div className="bg-[#0f172a]/70 backdrop-blur-sm border border-white/10 rounded-xl p-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 flex items-center justify-center bg-amber-500/10 rounded-lg">
              <i className="ri-alert-line text-amber-400"></i>
            </div>
            <div>
              <h2 className="text-base font-semibold text-white">ACS Action Centre</h2>
              <p className="text-xs text-gray-500">Remediation dashboard — assign and track corrective actions</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <select value={severityFilter} onChange={(e) => setSeverityFilter(e.target.value)} className="bg-white/5 border border-white/10 rounded-lg px-3 py-1.5 text-sm text-gray-300 focus:outline-none focus:border-amber-500/50 pr-8">
              <option value="all">All Severity</option>
              <option value="critical">Critical</option>
              <option value="high">High</option>
              <option value="medium">Medium</option>
              <option value="low">Low</option>
            </select>
            <div className="flex bg-white/5 rounded-lg p-0.5">
              <button onClick={() => setFilter('open')} className={`px-3 py-1.5 text-xs rounded-md cursor-pointer ${filter === 'open' ? 'bg-amber-500/20 text-amber-400' : 'text-gray-400'}`}>Open</button>
              <button onClick={() => setFilter('resolved')} className={`px-3 py-1.5 text-xs rounded-md cursor-pointer ${filter === 'resolved' ? 'bg-emerald-500/20 text-emerald-400' : 'text-gray-400'}`}>Resolved</button>
              <button onClick={() => setFilter('all')} className={`px-3 py-1.5 text-xs rounded-md cursor-pointer ${filter === 'all' ? 'bg-blue-500/20 text-blue-400' : 'text-gray-400'}`}>All</button>
            </div>
          </div>
        </div>

        {filtered.length === 0 ? (
          <p className="text-sm text-gray-500 py-8 text-center">No findings match your filters. Run an AI audit to generate findings.</p>
        ) : (
          <div className="space-y-2">
            {filtered.map((f) => (
              <div key={f.id} className="bg-white/5 rounded-lg border border-white/5 overflow-hidden">
                <div className="flex items-start justify-between p-3">
                  <div className="flex items-start gap-3 flex-1">
                    <span className={`text-xs px-1.5 py-0.5 rounded font-medium border whitespace-nowrap ${SEVERITY_COLORS[f.severity] || SEVERITY_COLORS.medium}`}>
                      {f.severity}
                    </span>
                    <div className="flex-1">
                      <p className="text-sm text-gray-200">{f.finding}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-xs text-gray-500">{f.category}</span>
                        {f.due_date && (
                          <span className={`text-xs ${new Date(f.due_date) < new Date() ? 'text-red-400' : 'text-gray-500'}`}>
                            Due: {new Date(f.due_date).toLocaleDateString('en-GB')}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`text-xs px-2 py-0.5 rounded-full border whitespace-nowrap ${STATUS_COLORS[f.status] || STATUS_COLORS.open}`}>
                      {f.status.replace(/_/g, ' ')}
                    </span>
                    {f.status === 'open' && (
                      <button
                        onClick={() => updateStatus(f.id, 'in_progress')}
                        className="text-xs text-blue-400 hover:text-blue-300 cursor-pointer whitespace-nowrap"
                      >
                        Start
                      </button>
                    )}
                    {f.status === 'in_progress' && (
                      <button
                        onClick={() => { setEditingId(f.id); setNotes(''); }}
                        className="text-xs text-emerald-400 hover:text-emerald-300 cursor-pointer whitespace-nowrap"
                      >
                        Resolve
                      </button>
                    )}
                  </div>
                </div>
                {f.resolution_notes && (
                  <div className="px-3 pb-3">
                    <p className="text-xs text-gray-400 bg-white/5 rounded p-2">{f.resolution_notes}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {editingId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
          <div className="bg-[#0f172a] border border-white/10 rounded-xl w-full max-w-md">
            <div className="p-5 border-b border-white/10">
              <h3 className="text-base font-semibold text-white">Resolve Finding</h3>
            </div>
            <div className="p-5">
              <label className="text-xs text-gray-400 block mb-1">Resolution Notes</label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={4}
                maxLength={500}
                className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-amber-500/50 resize-none"
                placeholder="Describe how this issue was resolved..."
              />
            </div>
            <div className="flex items-center justify-end gap-3 p-5 border-t border-white/10">
              <button onClick={() => setEditingId(null)} className="px-4 py-2 text-sm text-gray-400 hover:text-white cursor-pointer">Cancel</button>
              <button onClick={() => resolveFinding(editingId)} className="px-4 py-2 bg-amber-600 hover:bg-amber-500 text-white text-sm font-medium rounded-lg cursor-pointer whitespace-nowrap">Resolve</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}