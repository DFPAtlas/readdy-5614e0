'use client';

import { useState } from 'react';
import { useAuth } from '@/lib/auth';
import { useSiteOptions } from '@/lib/useSiteOptions';
import { useGuardOptions } from '@/lib/useGuardOptions';

export default function IncidentReportForm() {
  const { companyId } = useAuth();
  const { sites } = useSiteOptions(companyId);
  const { guards } = useGuardOptions(companyId);

  const [status, setStatus] = useState<'idle'|'submitting'|'success'|'error'>('idle');
  const [severity, setSeverity] = useState('low');
  const [siteOpen, setSiteOpen] = useState(false);
  const [guardOpen, setGuardOpen] = useState(false);

  const severities = [
    { value: 'low', label: 'Low', color: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' },
    { value: 'medium', label: 'Medium', color: 'bg-amber-500/10 text-amber-400 border-amber-500/20' },
    { value: 'high', label: 'High', color: 'bg-orange-500/10 text-orange-400 border-orange-500/20' },
    { value: 'critical', label: 'Critical', color: 'bg-red-500/10 text-red-400 border-red-500/20' },
  ];

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setStatus('submitting');
    const fd = new FormData(e.currentTarget);
    const data: Record<string, any> = {};
    fd.forEach((v, k) => { if (v) data[k] = v; });
    data.severity = severity;

    try {
      const res = await fetch('https://readdy.ai/api/form/d7vkns64oug4kst80q70', {
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
        <h3 className="text-lg font-semibold text-white mb-1">Incident Report Submitted</h3>
        <p className="text-sm text-gray-400 mb-6">The report has been logged successfully.</p>
        <button onClick={() => setStatus('idle')} className="text-sm text-blue-400 hover:text-blue-300 transition-colors cursor-pointer whitespace-nowrap">
          Submit Another Report
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} data-readdy-form="incident-report" className="space-y-5">
      <div>
        <label className="block text-sm font-medium text-gray-300 mb-2">Incident Title</label>
        <input name="title" required placeholder="e.g. Security Breach at Main Gate"
          className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2.5 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-blue-500" />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="relative">
          <label className="block text-sm font-medium text-gray-300 mb-2">Site</label>
          <button type="button" onClick={() => setSiteOpen(!siteOpen)}
            className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2.5 text-sm text-left text-white focus:outline-none focus:border-blue-500 flex items-center justify-between cursor-pointer">
            <span className="text-gray-400" id="site-label">Select site...</span>
            <input type="hidden" name="site" id="site-input" />
            <div className="w-4 h-4 flex items-center justify-center text-gray-500"><i className="ri-arrow-down-s-line"></i></div>
          </button>
          {siteOpen && (
            <div className="absolute z-20 mt-1 w-full bg-[#1a2234] border border-white/10 rounded-lg shadow-lg max-h-48 overflow-y-auto">
              {sites.map((s) => (
                <button key={s.id} type="button"
                  onClick={() => {
                    document.getElementById('site-label')!.textContent = s.name;
                    (document.getElementById('site-input') as HTMLInputElement).value = s.id;
                    setSiteOpen(false);
                  }}
                  className="w-full text-left px-3 py-2 text-sm text-gray-300 hover:bg-white/5 cursor-pointer">
                  {s.name}
                </button>
              ))}
              {sites.length === 0 && <p className="px-3 py-2 text-xs text-gray-500">No sites available</p>}
            </div>
          )}
        </div>

        <div className="relative">
          <label className="block text-sm font-medium text-gray-300 mb-2">Reporting Guard</label>
          <button type="button" onClick={() => setGuardOpen(!guardOpen)}
            className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2.5 text-sm text-left text-white focus:outline-none focus:border-blue-500 flex items-center justify-between cursor-pointer">
            <span className="text-gray-400" id="guard-label">Select guard...</span>
            <input type="hidden" name="guard" id="guard-input" />
            <div className="w-4 h-4 flex items-center justify-center text-gray-500"><i className="ri-arrow-down-s-line"></i></div>
          </button>
          {guardOpen && (
            <div className="absolute z-20 mt-1 w-full bg-[#1a2234] border border-white/10 rounded-lg shadow-lg max-h-48 overflow-y-auto">
              {guards.map((g) => (
                <button key={g.id} type="button"
                  onClick={() => {
                    document.getElementById('guard-label')!.textContent = `${g.first_name} ${g.last_name}`;
                    (document.getElementById('guard-input') as HTMLInputElement).value = g.id;
                    setGuardOpen(false);
                  }}
                  className="w-full text-left px-3 py-2 text-sm text-gray-300 hover:bg-white/5 cursor-pointer">
                  {g.first_name} {g.last_name}
                </button>
              ))}
              {guards.length === 0 && <p className="px-3 py-2 text-xs text-gray-500">No guards available</p>}
            </div>
          )}
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-300 mb-2">Severity</label>
        <div className="flex gap-2">
          {severities.map((s) => (
            <button key={s.value} type="button" onClick={() => setSeverity(s.value)}
              className={`flex-1 text-xs font-medium py-2 rounded-lg border transition-colors cursor-pointer whitespace-nowrap ${
                severity === s.value ? s.color : 'bg-white/5 text-gray-400 border-white/10 hover:bg-white/10'
              }`}>
              {s.label}
            </button>
          ))}
        </div>
        <input type="hidden" name="severity" value={severity} />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">Date of Incident</label>
          <input type="date" name="date" required
            className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2.5 text-sm text-white focus:outline-none focus:border-blue-500" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">Time</label>
          <input type="time" name="time" required
            className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2.5 text-sm text-white focus:outline-none focus:border-blue-500" />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-300 mb-2">Description</label>
        <textarea name="description" required rows={4} maxLength={500} placeholder="Describe what happened, who was involved, and any immediate actions taken..."
          className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2.5 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 resize-none"
          onChange={(e) => { if (e.target.value.length > 500) e.target.value = e.target.value.slice(0, 500); }} />
        <p className="text-xs text-gray-500 mt-1">Maximum 500 characters</p>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-300 mb-2">Witnesses</label>
        <input name="witnesses" placeholder="Names of any witnesses (optional)"
          className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2.5 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-blue-500" />
      </div>

      <button type="submit" disabled={status === 'submitting'}
        className="w-full bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white text-sm font-medium py-2.5 rounded-lg transition-colors cursor-pointer whitespace-nowrap">
        {status === 'submitting' ? (
          <span className="flex items-center justify-center gap-2">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
            Submitting...
          </span>
        ) : 'Submit Incident Report'}
      </button>

      {status === 'error' && (
        <p className="text-sm text-red-400 text-center">Something went wrong. Please try again.</p>
      )}
    </form>
  );
}