'use client';

import { useState } from 'react';
import { useAuth } from '@/lib/auth';
import { useSiteOptions } from '@/lib/useSiteOptions';

export default function DailyOccurrenceForm() {
  const { companyId } = useAuth();
  const { sites } = useSiteOptions(companyId);
  const [status, setStatus] = useState<'idle'|'submitting'|'success'|'error'>('idle');
  const [category, setCategory] = useState('general');
  const [siteOpen, setSiteOpen] = useState(false);

  const categories = [
    { value: 'general', label: 'General', color: 'bg-gray-500/10 text-gray-400 border-gray-500/20' },
    { value: 'suspicious', label: 'Suspicious Activity', color: 'bg-amber-500/10 text-amber-400 border-amber-500/20' },
    { value: 'maintenance', label: 'Maintenance', color: 'bg-blue-500/10 text-blue-400 border-blue-500/20' },
    { value: 'delivery', label: 'Delivery', color: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' },
    { value: 'noise', label: 'Noise Complaint', color: 'bg-rose-500/10 text-rose-400 border-rose-500/20' },
  ];

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setStatus('submitting');
    const fd = new FormData(e.currentTarget);
    const data: Record<string, any> = {};
    fd.forEach((v, k) => { if (v) data[k] = v; });
    data.category = category;

    try {
      const res = await fetch('https://readdy.ai/api/form/d7vkns64oug4kst80q90', {
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
        <h3 className="text-lg font-semibold text-white mb-1">Entry Logged</h3>
        <p className="text-sm text-gray-400 mb-6">Daily occurrence record saved successfully.</p>
        <button onClick={() => setStatus('idle')} className="text-sm text-blue-400 hover:text-blue-300 transition-colors cursor-pointer whitespace-nowrap">
          Add Another Entry
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} data-readdy-form="daily-occurrence" className="space-y-5">
      <div className="relative">
        <label className="block text-sm font-medium text-gray-300 mb-2">Site</label>
        <button type="button" onClick={() => setSiteOpen(!siteOpen)}
          className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2.5 text-sm text-left text-white focus:outline-none focus:border-blue-500 flex items-center justify-between cursor-pointer">
          <span className="text-gray-400" id="do-site-label">Select site...</span>
          <input type="hidden" name="site" id="do-site-input" />
          <div className="w-4 h-4 flex items-center justify-center text-gray-500"><i className="ri-arrow-down-s-line"></i></div>
        </button>
        {siteOpen && (
          <div className="absolute z-20 mt-1 w-full bg-[#1a2234] border border-white/10 rounded-lg shadow-lg max-h-48 overflow-y-auto">
            {sites.map((s) => (
              <button key={s.id} type="button"
                onClick={() => {
                  document.getElementById('do-site-label')!.textContent = s.name;
                  (document.getElementById('do-site-input') as HTMLInputElement).value = s.id;
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
        <label className="block text-sm font-medium text-gray-300 mb-2">Category</label>
        <div className="flex flex-wrap gap-2">
          {categories.map((c) => (
            <button key={c.value} type="button" onClick={() => setCategory(c.value)}
              className={`text-xs font-medium py-2 px-3 rounded-lg border transition-colors cursor-pointer whitespace-nowrap ${
                category === c.value ? c.color : 'bg-white/5 text-gray-400 border-white/10 hover:bg-white/10'
              }`}>
              {c.label}
            </button>
          ))}
        </div>
        <input type="hidden" name="category" value={category} />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">Date</label>
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
        <label className="block text-sm font-medium text-gray-300 mb-2">Entry</label>
        <textarea name="entry" required rows={5} maxLength={500} placeholder="Describe the occurrence, who was involved, and any action taken..."
          className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2.5 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 resize-none"
          onChange={(e) => { if (e.target.value.length > 500) e.target.value = e.target.value.slice(0, 500); }} />
        <p className="text-xs text-gray-500 mt-1">Maximum 500 characters</p>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-300 mb-2">Logged By</label>
        <input name="logged_by" required placeholder="Guard or staff member name"
          className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2.5 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-blue-500" />
      </div>

      <button type="submit" disabled={status === 'submitting'}
        className="w-full bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white text-sm font-medium py-2.5 rounded-lg transition-colors cursor-pointer whitespace-nowrap">
        {status === 'submitting' ? (
          <span className="flex items-center justify-center gap-2">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
            Submitting...
          </span>
        ) : 'Log Daily Occurrence'}
      </button>

      {status === 'error' && (
        <p className="text-sm text-red-400 text-center">Something went wrong. Please try again.</p>
      )}
    </form>
  );
}