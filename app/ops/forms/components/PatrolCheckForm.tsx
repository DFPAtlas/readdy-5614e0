'use client';

import { useState } from 'react';
import { useAuth } from '@/lib/auth';
import { useSiteOptions } from '@/lib/useSiteOptions';
import { useGuardOptions } from '@/lib/useGuardOptions';

export default function PatrolCheckForm() {
  const { companyId } = useAuth();
  const { sites } = useSiteOptions(companyId);
  const { guards } = useGuardOptions(companyId);
  const [status, setStatus] = useState<'idle'|'submitting'|'success'|'error'>('idle');
  const [siteOpen, setSiteOpen] = useState(false);
  const [guardOpen, setGuardOpen] = useState(false);

  const checkpoints = [
    'Main Entrance', 'Rear Gate', 'Perimeter Fence', 'CCTV Room',
    'Loading Bay', 'Car Park', 'Server Room', 'Fire Exits',
  ];

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setStatus('submitting');
    const fd = new FormData(e.currentTarget);
    const data: Record<string, any> = {};
    fd.forEach((v, k) => { if (v) data[k] = v; });
    const checked = Array.from(e.currentTarget.querySelectorAll<HTMLInputElement>('input[name="checkpoints"]:checked')).map((c) => c.value);
    data.checkpoints = checked.join(', ');

    try {
      const res = await fetch('https://readdy.ai/api/form/d7vkns64oug4kst80q80', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams(data as Record<string, string>),
      });
      if (res.ok) setStatus('success'); else setStatus('error');
    } catch {
      setStatus('error');
    }
  };

  if (status === 'success') {
    return (
      <div className="text-center py-10">
        <div className="w-14 h-14 mx-auto mb-4 rounded-full bg-emerald-500/10 flex items-center justify-center">
          <div className="w-6 h-6 flex items-center justify-center text-emerald-400"><i className="ri-check-line text-xl"></i></div>
        </div>
        <h3 className="text-lg font-semibold text-white mb-1">Patrol Check Logged</h3>
        <p className="text-sm text-gray-400 mb-6">Patrol record saved successfully.</p>
        <button onClick={() => setStatus('idle')} className="text-sm text-blue-400 hover:text-blue-300 transition-colors cursor-pointer whitespace-nowrap">
          Log Another Patrol
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} data-readdy-form="patrol-check" className="space-y-5">
      <div className="grid grid-cols-2 gap-4">
        <div className="relative">
          <label className="block text-sm font-medium text-gray-300 mb-2">Site</label>
          <button type="button" onClick={() => setSiteOpen(!siteOpen)}
            className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2.5 text-sm text-left text-white focus:outline-none focus:border-blue-500 flex items-center justify-between cursor-pointer">
            <span className="text-gray-400" id="pc-site-label">Select site...</span>
            <input type="hidden" name="site" id="pc-site-input" />
            <div className="w-4 h-4 flex items-center justify-center text-gray-500"><i className="ri-arrow-down-s-line"></i></div>
          </button>
          {siteOpen && (
            <div className="absolute z-20 mt-1 w-full bg-[#1a2234] border border-white/10 rounded-lg shadow-lg max-h-48 overflow-y-auto">
              {sites.map((s) => (
                <button key={s.id} type="button"
                  onClick={() => {
                    document.getElementById('pc-site-label')!.textContent = s.name;
                    (document.getElementById('pc-site-input') as HTMLInputElement).value = s.id;
                    setSiteOpen(false);
                  }}
                  className="w-full text-left px-3 py-2 text-sm text-gray-300 hover:bg-white/5 cursor-pointer">
                  {s.name}
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="relative">
          <label className="block text-sm font-medium text-gray-300 mb-2">Patrolling Guard</label>
          <button type="button" onClick={() => setGuardOpen(!guardOpen)}
            className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2.5 text-sm text-left text-white focus:outline-none focus:border-blue-500 flex items-center justify-between cursor-pointer">
            <span className="text-gray-400" id="pc-guard-label">Select guard...</span>
            <input type="hidden" name="guard" id="pc-guard-input" />
            <div className="w-4 h-4 flex items-center justify-center text-gray-500"><i className="ri-arrow-down-s-line"></i></div>
          </button>
          {guardOpen && (
            <div className="absolute z-20 mt-1 w-full bg-[#1a2234] border border-white/10 rounded-lg shadow-lg max-h-48 overflow-y-auto">
              {guards.map((g) => (
                <button key={g.id} type="button"
                  onClick={() => {
                    document.getElementById('pc-guard-label')!.textContent = `${g.first_name} ${g.last_name}`;
                    (document.getElementById('pc-guard-input') as HTMLInputElement).value = g.id;
                    setGuardOpen(false);
                  }}
                  className="w-full text-left px-3 py-2 text-sm text-gray-300 hover:bg-white/5 cursor-pointer">
                  {g.first_name} {g.last_name}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-300 mb-2">Checkpoints Visited</label>
        <div className="grid grid-cols-2 gap-2">
          {checkpoints.map((cp) => (
            <label key={cp} className="flex items-center gap-2.5 bg-white/5 border border-white/10 rounded-lg px-3 py-2.5 cursor-pointer hover:bg-white/10 transition-colors">
              <input type="checkbox" name="checkpoints" value={cp}
                className="w-4 h-4 rounded border-white/20 bg-white/5 text-blue-500 focus:ring-blue-500" />
              <span className="text-sm text-gray-300">{cp}</span>
            </label>
          ))}
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-300 mb-2">Observations</label>
        <textarea name="observations" rows={3} maxLength={500} placeholder="Any unusual observations or issues found during patrol..."
          className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2.5 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 resize-none"
          onChange={(e) => { if (e.target.value.length > 500) e.target.value = e.target.value.slice(0, 500); }} />
        <p className="text-xs text-gray-500 mt-1">Maximum 500 characters</p>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">Patrol Time</label>
          <input type="time" name="time" required
            className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2.5 text-sm text-white focus:outline-none focus:border-blue-500" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">Duration (minutes)</label>
          <input type="number" name="duration" min="1" placeholder="e.g. 30"
            className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2.5 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-blue-500" />
        </div>
      </div>

      <button type="submit" disabled={status === 'submitting'}
        className="w-full bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white text-sm font-medium py-2.5 rounded-lg transition-colors cursor-pointer whitespace-nowrap">
        {status === 'submitting' ? (
          <span className="flex items-center justify-center gap-2">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
            Submitting...
          </span>
        ) : 'Log Patrol Check'}
      </button>

      {status === 'error' && (
        <p className="text-sm text-red-400 text-center">Something went wrong. Please try again.</p>
      )}
    </form>
  );
}