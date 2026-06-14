'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/lib/auth';

export default function VisitorLogPage() {
  const { profile, company } = useAuth();
  const router = useRouter();
  const [guardId, setGuardId] = useState<string | null>(null);
  const [siteId, setSiteId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [visitors, setVisitors] = useState<any[]>([]);
  const [toast, setToast] = useState<string | null>(null);
  const [form, setForm] = useState({
    visitor_name: '',
    company_name: '',
    person_visiting: '',
    purpose: '',
    badge_number: '',
    vehicle_reg: '',
    notes: '',
  });

  useEffect(() => {
    if (!profile?.id || !company?.id) return;
    loadGuardInfo();
  }, [profile?.id, company?.id]);

  const loadGuardInfo = async () => {
    const { data: guardData } = await supabase
      .from('guards')
      .select('id')
      .eq('user_id', profile!.id)
      .maybeSingle();

    if (guardData) {
      setGuardId(guardData.id);

      const { data: shiftData } = await supabase
        .from('shifts')
        .select('site_id')
        .eq('guard_id', guardData.id)
        .eq('status', 'active')
        .maybeSingle();

      if (shiftData) setSiteId(shiftData.site_id);

      await loadVisitors(guardData.id);
    }
    setLoading(false);
  };

  const loadVisitors = async (gid: string) => {
    const { data } = await supabase
      .from('visitor_logs')
      .select('*')
      .eq('guard_id', gid)
      .order('time_in', { ascending: false })
      .limit(30);
    setVisitors(data || []);
  };

  const handleSubmit = async () => {
    if (!form.visitor_name.trim()) {
      setToast('Visitor name is required');
      setTimeout(() => setToast(null), 3000);
      return;
    }
    if (!guardId || !company?.id) {
      setToast('Unable to identify guard or company');
      setTimeout(() => setToast(null), 3000);
      return;
    }

    setSubmitting(true);
    const { error } = await supabase.from('visitor_logs').insert({
      company_id: company.id,
      site_id: siteId,
      guard_id: guardId,
      visitor_name: form.visitor_name.trim(),
      company_name: form.company_name.trim() || null,
      person_visiting: form.person_visiting.trim() || null,
      purpose: form.purpose.trim() || null,
      badge_number: form.badge_number.trim() || null,
      vehicle_reg: form.vehicle_reg.trim() || null,
      notes: form.notes.trim() || null,
    });

    if (!error) {
      setToast('Visitor logged successfully');
      setForm({ visitor_name: '', company_name: '', person_visiting: '', purpose: '', badge_number: '', vehicle_reg: '', notes: '' });
      loadVisitors(guardId);
    } else {
      setToast('Failed to log visitor');
    }
    setSubmitting(false);
    setTimeout(() => setToast(null), 3000);
  };

  const handleSignOut = async (id: string) => {
    await supabase.from('visitor_logs').update({ time_out: new Date().toISOString() }).eq('id', id);
    loadVisitors(guardId!);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white flex flex-col">
      <div className="flex items-center px-4 h-14 border-b border-white/5">
        <button onClick={() => router.back()} className="w-9 h-9 flex items-center justify-center text-gray-400 hover:text-white cursor-pointer">
          <i className="ri-arrow-left-line"></i>
        </button>
        <h1 className="text-base font-semibold ml-2">Visitor Log</h1>
      </div>

      <div className="flex-1 overflow-y-auto pb-24">
        {toast && (
          <div className="px-4 pt-3">
            <div className={`rounded-xl px-4 py-3 text-sm font-medium flex items-center gap-2 ${
              toast.includes('Failed') || toast.includes('required')
                ? 'bg-red-500/10 border border-red-500/20 text-red-400'
                : 'bg-emerald-500/10 border border-emerald-500/20 text-emerald-400'
            }`}>
              <div className="w-5 h-5 flex items-center justify-center">
                <i className={toast.includes('Failed') || toast.includes('required') ? 'ri-error-warning-line' : 'ri-check-line'}></i>
              </div>
              {toast}
            </div>
          </div>
        )}

        <div className="px-4 pt-4 space-y-4">
          <div className="bg-[#1a1a1a] border border-white/5 rounded-2xl p-5 space-y-4">
            <h3 className="text-base font-semibold text-white flex items-center gap-2">
              <div className="w-5 h-5 flex items-center justify-center">
                <i className="ri-user-add-line text-blue-400"></i>
              </div>
              Sign In Visitor
            </h3>

            <div>
              <label className="text-xs text-gray-400 mb-1.5 block">Visitor Name *</label>
              <input
                type="text"
                value={form.visitor_name}
                onChange={(e) => setForm({ ...form, visitor_name: e.target.value })}
                className="w-full bg-black/40 border border-white/10 rounded-xl px-3 py-2.5 text-sm text-white focus:outline-none focus:border-blue-500/40"
                placeholder="Full name"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs text-gray-400 mb-1.5 block">Company</label>
                <input
                  type="text"
                  value={form.company_name}
                  onChange={(e) => setForm({ ...form, company_name: e.target.value })}
                  className="w-full bg-black/40 border border-white/10 rounded-xl px-3 py-2.5 text-sm text-white focus:outline-none focus:border-blue-500/40"
                  placeholder="Organisation"
                />
              </div>
              <div>
                <label className="text-xs text-gray-400 mb-1.5 block">Visiting</label>
                <input
                  type="text"
                  value={form.person_visiting}
                  onChange={(e) => setForm({ ...form, person_visiting: e.target.value })}
                  className="w-full bg-black/40 border border-white/10 rounded-xl px-3 py-2.5 text-sm text-white focus:outline-none focus:border-blue-500/40"
                  placeholder="Person to see"
                />
              </div>
            </div>

            <div>
              <label className="text-xs text-gray-400 mb-1.5 block">Purpose</label>
              <input
                type="text"
                value={form.purpose}
                onChange={(e) => setForm({ ...form, purpose: e.target.value })}
                className="w-full bg-black/40 border border-white/10 rounded-xl px-3 py-2.5 text-sm text-white focus:outline-none focus:border-blue-500/40"
                placeholder="e.g. Meeting, Delivery, Inspection"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs text-gray-400 mb-1.5 block">Badge/Pass #</label>
                <input
                  type="text"
                  value={form.badge_number}
                  onChange={(e) => setForm({ ...form, badge_number: e.target.value })}
                  className="w-full bg-black/40 border border-white/10 rounded-xl px-3 py-2.5 text-sm text-white focus:outline-none focus:border-blue-500/40"
                  placeholder="Visitor pass"
                />
              </div>
              <div>
                <label className="text-xs text-gray-400 mb-1.5 block">Vehicle Reg</label>
                <input
                  type="text"
                  value={form.vehicle_reg}
                  onChange={(e) => setForm({ ...form, vehicle_reg: e.target.value })}
                  className="w-full bg-black/40 border border-white/10 rounded-xl px-3 py-2.5 text-sm text-white focus:outline-none focus:border-blue-500/40"
                  placeholder="Optional"
                />
              </div>
            </div>

            <div>
              <label className="text-xs text-gray-400 mb-1.5 block">Notes</label>
              <input
                type="text"
                value={form.notes}
                onChange={(e) => setForm({ ...form, notes: e.target.value })}
                className="w-full bg-black/40 border border-white/10 rounded-xl px-3 py-2.5 text-sm text-white focus:outline-none focus:border-blue-500/40"
                placeholder="Any additional notes"
              />
            </div>

            <button
              onClick={handleSubmit}
              disabled={submitting}
              className="w-full h-14 bg-blue-600 hover:bg-blue-500 disabled:opacity-30 text-white font-semibold rounded-xl transition-all active:scale-[0.98] cursor-pointer flex items-center justify-center gap-2"
            >
              {submitting ? (
                <i className="ri-loader-4-line animate-spin text-lg"></i>
              ) : (
                <>
                  <div className="w-5 h-5 flex items-center justify-center">
                    <i className="ri-check-line"></i>
                  </div>
                  Sign In Visitor
                </>
              )}
            </button>
          </div>

          {visitors.length > 0 && (
            <div>
              <h4 className="text-xs text-gray-400 uppercase tracking-wider mb-3 px-1">Recent Visitors</h4>
              <div className="space-y-2">
                {visitors.map((v) => (
                  <div key={v.id} className="bg-[#1a1a1a] border border-white/5 rounded-xl p-4">
                    <div className="flex items-center justify-between mb-1">
                      <p className="text-sm font-medium text-white">{v.visitor_name}</p>
                      {!v.time_out ? (
                        <span className="text-[10px] px-2 py-0.5 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded-full font-medium">
                          On Site
                        </span>
                      ) : (
                        <span className="text-[10px] px-2 py-0.5 bg-gray-500/10 text-gray-400 border border-gray-500/20 rounded-full font-medium">
                          Signed Out
                        </span>
                      )}
                    </div>
                    {v.company_name && <p className="text-xs text-gray-400">{v.company_name}{v.person_visiting ? ` · Visiting ${v.person_visiting}` : ''}</p>}
                    <div className="flex items-center justify-between mt-2">
                      <p className="text-[11px] text-gray-500">
                        In: {new Date(v.time_in).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })}
                        {v.time_out ? ` · Out: ${new Date(v.time_out).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })}` : ''}
                      </p>
                      {!v.time_out && (
                        <button
                          onClick={() => handleSignOut(v.id)}
                          className="text-[11px] text-blue-400 hover:text-blue-300 font-medium cursor-pointer"
                        >
                          Sign Out
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {visitors.length === 0 && (
            <div className="text-center py-10">
              <div className="w-14 h-14 bg-white/5 rounded-2xl flex items-center justify-center mx-auto mb-3">
                <i className="ri-user-line text-gray-500 text-2xl"></i>
              </div>
              <p className="text-sm text-gray-400">No visitors logged yet</p>
              <p className="text-xs text-gray-600 mt-1">Use the form above to sign in visitors</p>
            </div>
          )}
        </div>
      </div>

      <nav className="fixed bottom-0 left-0 right-0 z-50 bg-[#0a0a0a]/95 backdrop-blur-lg border-t border-white/5">
        <div className="flex items-center h-[72px] max-w-lg mx-auto px-4">
          <button onClick={() => router.push('/guard')} className="flex-1 flex flex-col items-center justify-center gap-1 text-gray-500 cursor-pointer">
            <div className="w-9 h-9 flex items-center justify-center">
              <i className="ri-arrow-left-line text-xl"></i>
            </div>
            <span className="text-[11px] font-medium whitespace-nowrap">Back</span>
          </button>
        </div>
      </nav>
    </div>
  );
}