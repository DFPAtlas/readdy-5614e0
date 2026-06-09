'use client';

import { useState } from 'react';
import { useAuth } from '@/lib/auth';
import { useSiteOptions } from '@/lib/useSiteOptions';

export default function VisitorSignInForm() {
  const { companyId } = useAuth();
  const { sites } = useSiteOptions(companyId);
  const [status, setStatus] = useState<'idle'|'submitting'|'success'|'error'>('idle');
  const [siteOpen, setSiteOpen] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setStatus('submitting');
    const fd = new FormData(e.currentTarget);
    const data: Record<string, any> = {};
    fd.forEach((v, k) => { if (v) data[k] = v; });

    try {
      const res = await fetch('https://readdy.ai/api/form/d7vkns64oug4kst80q7g', {
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
        <h3 className="text-lg font-semibold text-white mb-1">Visitor Signed In</h3>
        <p className="text-sm text-gray-400 mb-6">Entry has been recorded successfully.</p>
        <button onClick={() => setStatus('idle')} className="text-sm text-blue-400 hover:text-blue-300 transition-colors cursor-pointer whitespace-nowrap">
          Sign In Another Visitor
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} data-readdy-form="visitor-sign-in" className="space-y-5">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">First Name</label>
          <input name="first_name" required placeholder="Visitor first name"
            className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2.5 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-blue-500" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">Last Name</label>
          <input name="last_name" required placeholder="Visitor last name"
            className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2.5 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-blue-500" />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">Company</label>
          <input name="company" required placeholder="Visitor company"
            className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2.5 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-blue-500" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">Vehicle Reg</label>
          <input name="vehicle_reg" placeholder="Vehicle registration"
            className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2.5 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-blue-500" />
        </div>
      </div>

      <div className="relative">
        <label className="block text-sm font-medium text-gray-300 mb-2">Site</label>
        <button type="button" onClick={() => setSiteOpen(!siteOpen)}
          className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2.5 text-sm text-left text-white focus:outline-none focus:border-blue-500 flex items-center justify-between cursor-pointer">
          <span className="text-gray-400" id="vs-site-label">Select site...</span>
          <input type="hidden" name="site" id="vs-site-input" />
          <div className="w-4 h-4 flex items-center justify-center text-gray-500"><i className="ri-arrow-down-s-line"></i></div>
        </button>
        {siteOpen && (
          <div className="absolute z-20 mt-1 w-full bg-[#1a2234] border border-white/10 rounded-lg shadow-lg max-h-48 overflow-y-auto">
            {sites.map((s) => (
              <button key={s.id} type="button"
                onClick={() => {
                  document.getElementById('vs-site-label')!.textContent = s.name;
                  (document.getElementById('vs-site-input') as HTMLInputElement).value = s.id;
                  setSiteOpen(false);
                }}
                className="w-full text-left px-3 py-2 text-sm text-gray-300 hover:bg-white/5 cursor-pointer">
                {s.name}
              </button>
            ))}
          </div>
        )}
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-300 mb-2">Purpose of Visit</label>
        <input name="purpose" required placeholder="e.g. Maintenance, Delivery, Meeting"
          className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2.5 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-blue-500" />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-300 mb-2">Host / Contact Person</label>
        <input name="host" placeholder="Person they are visiting"
          className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2.5 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-blue-500" />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-300 mb-2">Time In</label>
        <input type="time" name="time_in" required
          className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2.5 text-sm text-white focus:outline-none focus:border-blue-500" />
      </div>

      <button type="submit" disabled={status === 'submitting'}
        className="w-full bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white text-sm font-medium py-2.5 rounded-lg transition-colors cursor-pointer whitespace-nowrap">
        {status === 'submitting' ? (
          <span className="flex items-center justify-center gap-2">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
            Submitting...
          </span>
        ) : 'Sign In Visitor'}
      </button>

      {status === 'error' && (
        <p className="text-sm text-red-400 text-center">Something went wrong. Please try again.</p>
      )}
    </form>
  );
}