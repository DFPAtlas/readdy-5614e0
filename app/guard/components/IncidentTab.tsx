'use client';

import { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import type { GuardShift } from '@/lib/useGuardPortal';

interface IncidentTabProps {
  todayShift: GuardShift | null;
  guardId: string | null;
  companyId: string | null;
  onSubmitted: () => void;
}

const incidentTypes = [
  'Trespassing',
  'Theft / Burglary',
  'Vandalism',
  'Suspicious Activity',
  'Fire / Safety',
  'Medical Emergency',
  'Accident / Injury',
  'Equipment Fault',
  'Disturbance',
  'Environmental',
  'Other',
];

const severities = [
  { value: 'low', label: 'Low', color: 'text-gray-400' },
  { value: 'medium', label: 'Medium', color: 'text-amber-400' },
  { value: 'high', label: 'High', color: 'text-orange-400' },
  { value: 'critical', label: 'Critical', color: 'text-red-400' },
];

export default function IncidentTab({ todayShift, guardId, companyId, onSubmitted }: IncidentTabProps) {
  const router = useRouter();
  const [type, setType] = useState('');
  const [severity, setSeverity] = useState('low');
  const [description, setDescription] = useState('');
  const [actionsTaken, setActionsTaken] = useState('');
  const [photoUrls, setPhotoUrls] = useState<string[]>([]);
  const [uploading, setUploading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!todayShift || !guardId || !companyId) {
    return (
      <div className="flex flex-col items-center justify-center min-h-full px-4 pb-24">
        <div className="w-20 h-20 bg-red-500/5 rounded-2xl flex items-center justify-center mb-4">
          <i className="ri-alert-line text-red-400/50 text-3xl"></i>
        </div>
        <h2 className="text-xl font-semibold text-white mb-2">Report Incident</h2>
        <p className="text-sm text-gray-400 text-center">You need an active shift to log an incident.</p>
        <button
          onClick={() => router.push('/guard')}
          className="mt-6 h-14 px-8 bg-[#3b82f6] hover:bg-blue-500 text-white font-semibold rounded-xl cursor-pointer transition-colors"
        >
          Go to Clock In
        </button>
      </div>
    );
  }

  async function handlePhotoUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file || !companyId) return;
    setUploading(true);

    const path = `${companyId}/incidents/${Date.now()}_${file.name}`;
    const { data, error } = await supabase.storage.from('incident-media').upload(path, file);

    if (error || !data) {
      setUploading(false);
      return;
    }

    const { data: urlData } = await supabase.storage.from('incident-media').createSignedUrl(data.path, 3600);
    if (urlData) setPhotoUrls((prev) => [...prev, urlData.signedUrl]);
    setUploading(false);
  }

  async function handleSubmit() {
    if (!type || !description || !companyId || !todayShift) return;
    setSubmitting(true);

    const { data: incidentData, error } = await supabase
      .from('incidents')
      .insert({
        company_id: companyId,
        site_id: todayShift.site_id,
        guard_id: guardId,
        incident_type: type,
        severity,
        description,
        status: 'open',
      })
      .select()
      .maybeSingle();

    if (error || !incidentData) {
      setSubmitting(false);
      return;
    }

    if (actionsTaken) {
      await supabase.from('incident_comments').insert({
        company_id: companyId,
        incident_id: incidentData.id,
        user_id: guardId,
        comment: `Actions taken: ${actionsTaken}`,
      });
    }

    await supabase.from('occurrence_books').insert({
      company_id: companyId,
      site_id: todayShift.site_id,
      guard_id: guardId,
      entry_type: 'Incident',
      entry: `${type} (${severity}) reported: ${description.slice(0, 100)}`,
    });

    for (const url of photoUrls) {
      await supabase.from('incident_media').insert({
        company_id: companyId,
        incident_id: incidentData.id,
        file_url: url,
        file_type: 'image',
      });
    }

    if (navigator.vibrate) navigator.vibrate(200);
    setSubmitting(false);
    setSuccess(true);
    onSubmitted();
    setTimeout(() => {
      setSuccess(false);
      setType('');
      setSeverity('low');
      setDescription('');
      setActionsTaken('');
      setPhotoUrls([]);
      router.push('/guard');
    }, 2000);
  }

  if (success) {
    return (
      <div className="flex flex-col items-center justify-center min-h-full px-4 pb-24">
        <div className="w-20 h-20 bg-emerald-500/10 rounded-2xl flex items-center justify-center mb-4">
          <i className="ri-check-line text-emerald-400 text-3xl"></i>
        </div>
        <h2 className="text-xl font-semibold text-white mb-2">Incident Reported</h2>
        <p className="text-sm text-gray-400 text-center">Control room notified. Stay safe.</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col pb-24">
      <div className="px-4 pt-4 pb-2">
        <p className="text-gray-400 text-sm">At {todayShift.site?.site_name || 'Site'}</p>
        <h2 className="text-2xl font-bold text-white mt-0.5">Report Incident</h2>
      </div>

      <div className="px-4 py-2 space-y-4">
        <div>
          <label className="text-xs text-gray-400 uppercase tracking-wider mb-2 block">Type</label>
          <div className="grid grid-cols-2 gap-2">
            {incidentTypes.map((t) => (
              <button
                key={t}
                onClick={() => setType(t)}
                className={`h-12 rounded-lg text-sm font-medium px-3 border transition-all cursor-pointer whitespace-nowrap ${
                  type === t
                    ? 'bg-[#3b82f6]/20 border-[#3b82f6]/40 text-[#3b82f6]'
                    : 'bg-[#1a1a1a] border-white/5 text-gray-300 hover:border-white/10'
                }`}
              >
                {t}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="text-xs text-gray-400 uppercase tracking-wider mb-2 block">Severity</label>
          <div className="flex gap-2">
            {severities.map((s) => (
              <button
                key={s.value}
                onClick={() => setSeverity(s.value)}
                className={`flex-1 h-12 rounded-lg text-sm font-medium border transition-all cursor-pointer ${
                  severity === s.value
                    ? 'bg-[#3b82f6]/20 border-[#3b82f6]/40 text-white'
                    : 'bg-[#1a1a1a] border-white/5 text-gray-400 hover:border-white/10'
                }`}
              >
                {s.label}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="text-xs text-gray-400 uppercase tracking-wider mb-2 block">What happened?</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={4}
            placeholder="Describe the incident clearly..."
            className="w-full bg-[#1a1a1a] border border-white/10 rounded-xl px-4 py-3 text-white text-base placeholder-gray-500 focus:outline-none focus:border-[#3b82f6]/40 transition-colors"
          />
        </div>

        <div>
          <label className="text-xs text-gray-400 uppercase tracking-wider mb-2 block">Actions taken</label>
          <textarea
            value={actionsTaken}
            onChange={(e) => setActionsTaken(e.target.value)}
            rows={3}
            placeholder="What did you do?"
            className="w-full bg-[#1a1a1a] border border-white/10 rounded-xl px-4 py-3 text-white text-base placeholder-gray-500 focus:outline-none focus:border-[#3b82f6]/40 transition-colors"
          />
        </div>

        <div>
          <label className="text-xs text-gray-400 uppercase tracking-wider mb-2 block">Photos</label>
          <div className="flex flex-wrap gap-2">
            {photoUrls.map((url, i) => (
              <div key={i} className="w-20 h-20 rounded-lg bg-cover bg-center border border-white/10" style={{ backgroundImage: `url(${url})` }} />
            ))}
            <button
              onClick={() => fileInputRef.current?.click()}
              disabled={uploading}
              className="w-20 h-20 rounded-lg bg-[#1a1a1a] border border-white/10 border-dashed flex items-center justify-center text-gray-400 hover:border-[#3b82f6]/40 transition-colors cursor-pointer"
            >
              {uploading ? (
                <i className="ri-loader-4-line animate-spin"></i>
              ) : (
                <i className="ri-camera-line text-lg"></i>
              )}
            </button>
            <input ref={fileInputRef} type="file" accept="image/*" capture="environment" onChange={handlePhotoUpload} className="hidden" />
          </div>
        </div>
      </div>

      <div className="mt-auto px-4 pb-6">
        <button
          onClick={handleSubmit}
          disabled={!type || !description || submitting}
          className="w-full h-14 bg-red-600 hover:bg-red-500 disabled:opacity-30 text-white font-semibold rounded-xl transition-all active:scale-[0.98] cursor-pointer flex items-center justify-center gap-2"
        >
          {submitting ? (
            <i className="ri-loader-4-line animate-spin text-lg"></i>
          ) : (
            <>
              <div className="w-5 h-5 flex items-center justify-center">
                <i className="ri-send-plane-line"></i>
              </div>
              Submit Report
            </>
          )}
        </button>
      </div>
    </div>
  );
}