'use client';

import { useState } from 'react';
import { useAuth } from '@/lib/auth';
import { useSiteOptions } from '@/lib/useSiteOptions';

export default function MaintenanceRequestForm() {
  const { companyId } = useAuth();
  const { sites } = useSiteOptions(companyId);
  const [status, setStatus] = useState<'idle'|'submitting'|'success'|'error'>('idle');
  const [priority, setPriority] = useState('medium');
  const [siteOpen, setSiteOpen] = useState(false);

  const priorities = [
    { value: 'low', label: 'Low', color: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' },
    { value: 'medium', label: 'Medium', color: 'bg-amber-500/10 text-amber-400 border-amber-500/20' },
    { value: 'high', label: 'High', color: 'bg-orange-500/10 text-orange-400 border-orange-500/20' },
    { value: 'urgent', label: 'Urgent', color: 'bg-red-500/10 text-red-400 border-red-500/20' },
  ];

  const types = [
    'Lighting', 'Door / Lock', 'CCTV', 'Alarm System', 'Fence / Gate',
    'Flooring', 'Plumbing', 'HVAC', 'Electrical', 'Fire Safety', 'Other',
  ];

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setStatus('submitting');
    const fd = new FormData(e.currentTarget);
    const data: Record<string, any> = {};
    fd.forEach((v, k) => { if (v) data[k] = v; });
    data.priority = priority;

    try {
      const res = await fetch('https://readdy.ai/api/form/d7vkns64oug4kst80q9g', {
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
        <h3 className="text-lg font-semibold text-white mb-1">Request Submitted</h3>
        <p className="text-sm text-gray-400 mb-6">Maintenance request has been logged.</p>
        <button onClick={() => setStatus('idle')} className="text-sm text-blue-400 hover:text-blue-300 transition-colors cursor-pointer whitespace-nowrap">
          Submit Another Request
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} data-readdy-form="maintenance-request" className="space-y-5">
      <div>
        <label className="block text-sm font-medium text-gray-300 mb-2">Issue Title</label>
        <input name="title" required placeholder="Short description of the issue"
          className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2.5 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-blue-500" />
      </div>

      <div className="relative">
        <label className="block text-sm font-medium text-gray-300 mb-2">Site</label>
        <button type="button" onClick={() => setSiteOpen(!siteOpen)}
          className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2.5 text-sm text-left text-white focus:outline-none focus:border-blue-500 flex items-center justify-between cursor-pointer">
          <span className="text-gray-400" id="mr-site-label">Select site...</span>
          <input type="hidden" name="site" id="mr-site-input" />
          <div className="w-4 h-4 flex items-center justify-center text-gray-500"><i className="ri-arrow-down-s-line"></i></div>
        </button>
        {siteOpen && (
          <div className="absolute z-20 mt-1 w-full bg-[#1a2234] border border-white/10 rounded-lg shadow-lg max-h-48 overflow-y-auto">
            {sites.map((s) => (
              <button key={s.id} type="button"
                onClick={() => {
                  document.getElementById('mr-site-label')!.textContent = s.name;
                  (document.getElementById('mr-site-input') as HTMLInputElement).value = s.id;
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
        <label className="block text-sm font-medium text-gray-300 mb-2">Type</label>
        <div className="grid grid-cols-2 gap-2">
          {types.map((t) => (
            <label key={t} className="flex items-center gap-2.5 bg-white/5 border border-white/10 rounded-lg px-3 py-2 cursor-pointer hover:bg-white/10 transition-colors">
              <input type="radio" name="type" value={t} required
                className="w-4 h-4 border-white/20 bg-white/5 text-blue-500 focus:ring-blue-500" />
              <span className="text-sm text-gray-300">{t}</span>
            </label>
          ))}
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-300 mb-2">Priority</label>
        <div className="flex gap-2">
          {priorities.map((p) => (
            <button key={p.value} type="button" onClick={() => setPriority(p.value)}
              className={`flex-1 text-xs font-medium py-2 rounded-lg border transition-colors cursor-pointer whitespace-nowrap ${
                priority === p.value ? p.color : 'bg-white/5 text-gray-400 border-white/10 hover:bg-white/10'
              }`}>
              {p.label}
            </button>
          ))}
        </div>
        <input type="hidden" name="priority" value={priority} />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-300 mb-2">Location / Area</label>
        <input name="location" required placeholder="e.g. Building A, Ground Floor, Room 12"
          className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2.5 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-blue-500" />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-300 mb-2">Description</label>
        <textarea name="description" required rows={4} maxLength={500} placeholder="Describe the fault, when it started, and any immediate safety concerns..."
          className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2.5 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 resize-none"
          onChange={(e) => { if (e.target.value.length > 500) e.target.value = e.target.value.slice(0, 500); }} />
        <p className="text-xs text-gray-500 mt-1">Maximum 500 characters</p>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-300 mb-2">Reported By</label>
        <input name="reported_by" required placeholder="Your name"
          className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2.5 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-blue-500" />
      </div>

      <button type="submit" disabled={status === 'submitting'}
        className="w-full bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white text-sm font-medium py-2.5 rounded-lg transition-colors cursor-pointer whitespace-nowrap">
        {status === 'submitting' ? (
          <span className="flex items-center justify-center gap-2">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
            Submitting...
          </span>
        ) : 'Submit Maintenance Request'}
      </button>

      {status === 'error' && (
        <p className="text-sm text-red-400 text-center">Something went wrong. Please try again.</p>
      )}
    </form>
  );
}