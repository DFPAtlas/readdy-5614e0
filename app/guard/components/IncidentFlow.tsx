'use client';

import { useState, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import type { GuardShift } from '@/lib/useGuardPortal';
import { triggerNotificationForAllAdmins } from '@/lib/triggerNotification';

interface IncidentFlowProps {
  todayShift: GuardShift | null;
  guardId: string | null;
  companyId: string | null;
  guardName: string;
  onSubmitted: () => void;
}

type Step = 'severity' | 'type' | 'description' | 'confirm' | 'success';

const severityOptions = [
  { value: 'low' as const, label: 'Low', sub: 'Minor, no action needed', color: 'from-gray-600 to-gray-700', border: 'border-gray-500/30', icon: 'ri-checkbox-circle-line', iconColor: 'text-gray-400' },
  { value: 'medium' as const, label: 'Medium', sub: 'Needs reporting', color: 'from-amber-600 to-amber-700', border: 'border-amber-500/30', icon: 'ri-error-warning-line', iconColor: 'text-amber-400' },
  { value: 'high' as const, label: 'High', sub: 'Needs attention now', color: 'from-orange-600 to-orange-700', border: 'border-orange-500/30', icon: 'ri-alarm-warning-line', iconColor: 'text-orange-400' },
  { value: 'critical' as const, label: 'Critical', sub: 'Emergency', color: 'from-red-600 to-red-700', border: 'border-red-500/30', icon: 'ri-alarm-warning-line', iconColor: 'text-red-400' },
];

const incidentTypesMain = [
  { label: 'Trespass', icon: 'ri-user-forbid-line' },
  { label: 'Theft', icon: 'ri-hand-coin-line' },
  { label: 'Assault', icon: 'ri-hammer-line' },
  { label: 'Medical', icon: 'ri-heart-pulse-line' },
  { label: 'Fire', icon: 'ri-fire-line' },
  { label: 'Suspicious', icon: 'ri-eye-line' },
];

const incidentTypesMore = [
  'Vandalism', 'Equipment Fault', 'Disturbance', 'Vehicle', 'Drugs', 'Weapons',
  'Flood', 'Power Outage', 'Intruder', 'Animal', 'Noise', 'Other',
];

export default function IncidentFlow({ todayShift, guardId, companyId, guardName, onSubmitted }: IncidentFlowProps) {
  const router = useRouter();
  const [step, setStep] = useState<Step>('severity');
  const [severity, setSeverity] = useState<'low' | 'medium' | 'high' | 'critical'>('low');
  const [incidentType, setIncidentType] = useState('');
  const [description, setDescription] = useState('');
  const [actionsTaken, setActionsTaken] = useState('');
  const [showMoreTypes, setShowMoreTypes] = useState(false);
  const [photoUrls, setPhotoUrls] = useState<string[]>([]);
  const [photoPaths, setPhotoPaths] = useState<string[]>([]);
  const [uploading, setUploading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [gps, setGps] = useState<{ lat: number | null; lng: number | null }>({ lat: null, lng: null });
  const [listening, setListening] = useState(false);
  const [listenError, setListenError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const recognitionRef = useRef<any>(null);

  const getLocation = useCallback((): Promise<{ lat: number | null; lng: number | null }> => {
    return new Promise((resolve) => {
      if (!navigator.geolocation) { resolve({ lat: null, lng: null }); return; }
      navigator.geolocation.getCurrentPosition(
        (pos) => resolve({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
        () => resolve({ lat: null, lng: null }),
        { enableHighAccuracy: true, timeout: 8000 }
      );
    });
  }, []);

  async function handlePhotoUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files || []);
    if (!files.length || !companyId) return;
    setUploading(true);

    for (const file of files) {
      const path = `${companyId}/incidents/${Date.now()}_${Math.random().toString(36).slice(2)}_${file.name}`;
      const { data, error } = await supabase.storage.from('incident-media').upload(path, file);
      if (error || !data) continue;
      const { data: urlData } = await supabase.storage.from('incident-media').createSignedUrl(data.path, 60 * 60 * 24 * 7);
      if (urlData) {
        setPhotoUrls((prev) => [...prev, urlData.signedUrl]);
        setPhotoPaths((prev) => [...prev, data.path]);
      }
    }
    setUploading(false);
    if (fileInputRef.current) fileInputRef.current.value = '';
  }

  function startVoiceInput() {
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
      setListenError('Voice input not supported on this device');
      return;
    }
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    const recognition = new SpeechRecognition();
    recognition.lang = 'en-GB';
    recognition.continuous = true;
    recognition.interimResults = true;
    recognitionRef.current = recognition;

    recognition.onstart = () => { setListening(true); setListenError(null); };
    recognition.onresult = (event: any) => {
      let final = '';
      let interim = '';
      for (let i = event.resultIndex; i < event.results.length; i++) {
        if (event.results[i].isFinal) final += event.results[i][0].transcript;
        else interim += event.results[i][0].transcript;
      }
      setDescription((prev) => {
        const base = prev.replace(/\s*\[listening\.\.\.\]\s*/, '');
        return base + (base && !base.endsWith(' ') ? ' ' : '') + final + (interim ? ` [listening...] ${interim}` : '');
      });
    };
    recognition.onerror = (event: any) => {
      if (event.error !== 'no-speech') setListenError('Could not hear clearly. Try again or type instead.');
      setListening(false);
    };
    recognition.onend = () => {
      setDescription((prev) => prev.replace(/\s*\[listening\.\.\.\]\s*.*$/, '').trim());
      setListening(false);
    };
    recognition.start();
  }

  function stopVoiceInput() {
    if (recognitionRef.current) { recognitionRef.current.stop(); }
  }

  async function handleSubmit() {
    if (!incidentType || !description || !companyId || !todayShift || !guardId) return;
    setSubmitting(true);

    const location = await getLocation();
    setGps(location);

    const { data: { user } } = await supabase.auth.getUser();
    const userId = user?.id || null;

    const { data: incidentData, error } = await supabase
      .from('incidents')
      .insert({
        company_id: companyId,
        site_id: todayShift.site_id,
        guard_id: guardId,
        user_id: userId,
        shift_id: todayShift.id || null,
        incident_type: incidentType,
        severity,
        title: incidentType,
        description,
        location: location.lat && location.lng ? `${location.lat.toFixed(5)}, ${location.lng.toFixed(5)}` : null,
        gps_latitude: location.lat,
        gps_longitude: location.lng,
        status: 'open',
        client_visible: true,
        requires_follow_up: severity === 'critical' || severity === 'high',
        occurred_at: new Date().toISOString(),
        reported_at: new Date().toISOString(),
      })
      .select()
      .maybeSingle();

    if (error || !incidentData) {
      setSubmitting(false);
      return;
    }

    if (actionsTaken) {
      await supabase.from('incident_comments').insert({
        incident_id: incidentData.id,
        user_id: userId,
        comment: `Actions taken: ${actionsTaken}`,
      });
    }

    await supabase.from('occurrence_books').insert({
      company_id: companyId,
      site_id: todayShift.site_id,
      guard_id: guardId,
      entry_type: 'Incident',
      entry: `${incidentType} (${severity}) reported by ${guardName}: ${description.slice(0, 120)}`,
    });

    for (const path of photoPaths) {
      const { data: signed } = await supabase.storage.from('incident-media').createSignedUrl(path, 60 * 60 * 24 * 7);
      const mediaUrl = signed?.signedUrl || path;
      const { data: mediaRow } = await supabase.from('incident_media')
        .insert({
          incident_id: incidentData.id,
          file_url: mediaUrl,
          media_type: 'image',
          filename: path.split('/').pop(),
          storage_path: path,
          uploaded_by: guardId,
          client_visible: true,
        })
        .select()
        .maybeSingle();

      if (mediaRow) {
        await supabase.from('evidence_files').insert({
          company_id: companyId,
          site_id: todayShift.site_id,
          incident_id: incidentData.id,
          file_name: path.split('/').pop() || 'image',
          file_url: mediaUrl,
          file_type: 'image',
          storage_bucket: 'incident-media',
          storage_path: path,
          uploaded_by: userId,
          uploaded_by_guard: guardId,
          linked_to_incident: true,
          review_status: 'pending',
        });
      }
    }

    await supabase.from('incidents').update({
      linked_evidence_count: photoPaths.length,
    }).eq('id', incidentData.id);

    if (severity === 'critical') {
      await triggerNotificationForAllAdmins(companyId, {
        type: 'incident_critical',
        title: `Critical incident: ${incidentType}`,
        body: `${guardName} reported ${incidentType} at ${todayShift.site?.site_name || 'site'}. Incident #${incidentData.incident_number}`,
        link: `/incidents/detail?id=${incidentData.id}`,
        relatedId: incidentData.id,
        relatedType: 'incident',
        severity: 'critical',
      });
    }

    if (navigator.vibrate) navigator.vibrate([100, 50, 200]);
    setSubmitting(false);
    setStep('success');
    onSubmitted();
  }

  if (!todayShift || !guardId || !companyId) {
    return (
      <div className="flex flex-col items-center justify-center min-h-full px-4 pb-24">
        <div className="w-20 h-20 bg-red-500/5 rounded-2xl flex items-center justify-center mb-4">
          <i className="ri-alert-line text-red-400/50 text-3xl"></i>
        </div>
        <h2 className="text-xl font-semibold text-white mb-2">Report Incident</h2>
        <p className="text-sm text-gray-400 text-center">You need an active shift to log an incident.</p>
        <button onClick={() => router.push('/guard')} className="mt-6 h-14 px-8 bg-[#3b82f6] hover:bg-blue-500 text-white font-semibold rounded-xl cursor-pointer transition-colors whitespace-nowrap">
          Go to Clock In
        </button>
      </div>
    );
  }

  if (step === 'success') {
    return (
      <div className="flex flex-col items-center justify-center min-h-full px-4 pb-24">
        <div className="w-24 h-24 bg-emerald-500/10 rounded-2xl flex items-center justify-center mb-6">
          <i className="ri-check-line text-emerald-400 text-4xl"></i>
        </div>
        <h2 className="text-2xl font-bold text-white mb-2">Incident Logged</h2>
        <p className="text-base text-gray-400 text-center mb-2">Operations has been notified.</p>
        {severity === 'critical' && (
          <p className="text-sm text-red-400 text-center">Critical alert sent to control room.</p>
        )}
        <button
          onClick={() => {
            setStep('severity');
            setSeverity('low');
            setIncidentType('');
            setDescription('');
            setActionsTaken('');
            setPhotoUrls([]);
            setPhotoPaths([]);
            setGps({ lat: null, lng: null });
            router.push('/guard');
          }}
          className="mt-8 w-full max-w-xs h-14 bg-[#3b82f6] hover:bg-blue-500 text-white font-semibold rounded-xl transition-all active:scale-[0.98] cursor-pointer whitespace-nowrap"
        >
          Done
        </button>
      </div>
    );
  }

  if (step === 'severity') {
    return (
      <div className="flex flex-col min-h-full px-4 pb-24">
        <div className="pt-6 pb-2">
          <p className="text-gray-400 text-sm">{todayShift.site?.site_name || 'Site'}</p>
          <h2 className="text-2xl font-bold text-white mt-1">How serious is this?</h2>
        </div>
        <div className="flex-1 flex flex-col gap-3 pt-4">
          {severityOptions.map((s) => (
            <button
              key={s.value}
              onClick={() => { setSeverity(s.value); setStep('type'); }}
              className={`w-full h-20 rounded-2xl bg-gradient-to-r ${s.color} border ${s.border} flex items-center gap-4 px-5 transition-all active:scale-[0.97] cursor-pointer`}
            >
              <div className={`w-10 h-10 flex items-center justify-center ${s.iconColor}`}>
                <i className={`${s.icon} text-2xl`}></i>
              </div>
              <div className="text-left">
                <p className="text-lg font-bold text-white">{s.label}</p>
                <p className="text-sm text-white/60">{s.sub}</p>
              </div>
              <div className="ml-auto w-8 h-8 flex items-center justify-center">
                <i className="ri-arrow-right-s-line text-white/40 text-xl"></i>
              </div>
            </button>
          ))}
        </div>
        <button
          onClick={() => router.push('/guard')}
          className="mt-4 h-12 text-gray-400 text-sm font-medium cursor-pointer whitespace-nowrap"
        >
          Cancel
        </button>
      </div>
    );
  }

  if (step === 'type') {
    return (
      <div className="flex flex-col min-h-full px-4 pb-24">
        <div className="pt-6 pb-2 flex items-center gap-3">
          <button onClick={() => setStep('severity')} className="w-8 h-8 flex items-center justify-center text-gray-400 cursor-pointer">
            <i className="ri-arrow-left-line text-xl"></i>
          </button>
          <div>
            <p className="text-gray-400 text-sm">{todayShift.site?.site_name || 'Site'}</p>
            <h2 className="text-2xl font-bold text-white mt-0.5">What happened?</h2>
          </div>
        </div>
        <div className="pt-4 grid grid-cols-2 gap-3">
          {incidentTypesMain.map((t) => (
            <button
              key={t.label}
              onClick={() => { setIncidentType(t.label); setStep('description'); }}
              className={`h-24 rounded-2xl border flex flex-col items-center justify-center gap-2 transition-all active:scale-[0.97] cursor-pointer ${
                incidentType === t.label
                  ? 'bg-[#3b82f6]/20 border-[#3b82f6]/40'
                  : 'bg-[#1a1a1a] border-white/5 hover:border-white/15'
              }`}
            >
              <div className="w-8 h-8 flex items-center justify-center text-white/80">
                <i className={`${t.icon} text-2xl`}></i>
              </div>
              <span className="text-sm font-semibold text-white whitespace-nowrap">{t.label}</span>
            </button>
          ))}
        </div>
        {!showMoreTypes && (
          <button
            onClick={() => setShowMoreTypes(true)}
            className="mt-4 h-12 text-[#3b82f6] text-sm font-medium cursor-pointer whitespace-nowrap"
          >
            Other incident type...
          </button>
        )}
        {showMoreTypes && (
          <div className="mt-3 flex flex-wrap gap-2">
            {incidentTypesMore.map((t) => (
              <button
                key={t}
                onClick={() => { setIncidentType(t); setStep('description'); }}
                className="h-10 px-4 rounded-full bg-[#1a1a1a] border border-white/5 text-sm text-gray-300 hover:border-[#3b82f6]/40 hover:text-white transition-all cursor-pointer whitespace-nowrap"
              >
                {t}
              </button>
            ))}
          </div>
        )}
      </div>
    );
  }

  if (step === 'description') {
    const displayDescription = description.replace(/\s*\[listening\.\.\.\]\s*.*$/, '').trim();
    return (
      <div className="flex flex-col min-h-full px-4 pb-24">
        <div className="pt-6 pb-2 flex items-center gap-3">
          <button onClick={() => setStep('type')} className="w-8 h-8 flex items-center justify-center text-gray-400 cursor-pointer">
            <i className="ri-arrow-left-line text-xl"></i>
          </button>
          <div>
            <p className="text-gray-400 text-sm">{todayShift.site?.site_name || 'Site'}</p>
            <h2 className="text-2xl font-bold text-white mt-0.5">Tell us what happened</h2>
          </div>
        </div>

        <div className="pt-4 flex-1 flex flex-col">
          <div className="relative flex-1">
            <textarea
              value={displayDescription}
              onChange={(e) => setDescription(e.target.value)}
              rows={5}
              placeholder="Describe the incident clearly..."
              className="w-full h-full bg-[#1a1a1a] border border-white/10 rounded-2xl px-4 py-4 text-white text-base placeholder-gray-500 focus:outline-none focus:border-[#3b82f6]/40 transition-colors resize-none"
            />
            <button
              onClick={listening ? stopVoiceInput : startVoiceInput}
              className={`absolute bottom-3 right-3 w-11 h-11 rounded-full flex items-center justify-center transition-all cursor-pointer ${
                listening ? 'bg-red-500/20 border border-red-500/30' : 'bg-white/5 border border-white/10 hover:bg-white/10'
              }`}
            >
              {listening ? (
                <span className="relative flex items-center justify-center w-full h-full">
                  <span className="absolute w-3 h-3 bg-red-400 rounded-full animate-ping"></span>
                  <span className="relative w-3 h-3 bg-red-400 rounded-full"></span>
                </span>
              ) : (
                <div className="w-5 h-5 flex items-center justify-center text-gray-400">
                  <i className="ri-mic-line text-lg"></i>
                </div>
              )}
            </button>
          </div>

          {listening && (
            <p className="text-sm text-red-400 mt-2 flex items-center gap-2">
              <span className="w-2 h-2 bg-red-400 rounded-full animate-pulse"></span>
              Listening...
            </p>
          )}
          {listenError && (
            <p className="text-sm text-amber-400 mt-2 flex items-center gap-1.5">
              <i className="ri-error-warning-line"></i>
              {listenError}
            </p>
          )}

          <div className="mt-4">
            <label className="text-xs text-gray-400 uppercase tracking-wider mb-2 block">Actions taken</label>
            <textarea
              value={actionsTaken}
              onChange={(e) => setActionsTaken(e.target.value)}
              rows={3}
              placeholder="What did you do?"
              className="w-full bg-[#1a1a1a] border border-white/10 rounded-2xl px-4 py-3 text-white text-base placeholder-gray-500 focus:outline-none focus:border-[#3b82f6]/40 transition-colors"
            />
          </div>

          <div className="mt-4">
            <label className="text-xs text-gray-400 uppercase tracking-wider mb-2 block">Photos / Videos</label>
            <div className="flex flex-wrap gap-2">
              {photoUrls.map((url, i) => (
                <div key={i} className="w-20 h-20 rounded-xl bg-cover bg-center border border-white/10 relative">
                  <img src={url} alt="" className="w-full h-full object-cover rounded-xl" />
                  <button
                    onClick={() => { setPhotoUrls((p) => p.filter((_, idx) => idx !== i)); setPhotoPaths((p) => p.filter((_, idx) => idx !== i)); }}
                    className="absolute -top-1 -right-1 w-5 h-5 bg-black/70 rounded-full flex items-center justify-center text-xs text-white cursor-pointer"
                  >
                    <i className="ri-close-line"></i>
                  </button>
                </div>
              ))}
              <button
                onClick={() => fileInputRef.current?.click()}
                disabled={uploading}
                className="w-20 h-20 rounded-xl bg-[#1a1a1a] border border-white/10 border-dashed flex items-center justify-center text-gray-400 hover:border-[#3b82f6]/40 transition-colors cursor-pointer"
              >
                {uploading ? (
                  <i className="ri-loader-4-line animate-spin text-lg"></i>
                ) : (
                  <div className="w-6 h-6 flex items-center justify-center">
                    <i className="ri-camera-line text-lg"></i>
                  </div>
                )}
              </button>
              <input ref={fileInputRef} type="file" accept="image/*,video/*" multiple capture="environment" onChange={handlePhotoUpload} className="hidden" />
            </div>
          </div>
        </div>

        <div className="mt-6">
          <button
            onClick={() => setStep('confirm')}
            disabled={!displayDescription.trim()}
            className="w-full h-14 bg-[#3b82f6] hover:bg-blue-500 disabled:opacity-30 text-white font-semibold rounded-xl transition-all active:scale-[0.98] cursor-pointer flex items-center justify-center gap-2 whitespace-nowrap"
          >
            <div className="w-5 h-5 flex items-center justify-center">
              <i className="ri-arrow-right-line"></i>
            </div>
            Review & Submit
          </button>
        </div>
      </div>
    );
  }

  if (step === 'confirm') {
    const displayDescription = description.replace(/\s*\[listening\.\.\.\]\s*.*$/, '').trim();
    const severityLabel = severityOptions.find((s) => s.value === severity);
    return (
      <div className="flex flex-col min-h-full px-4 pb-24">
        <div className="pt-6 pb-2 flex items-center gap-3">
          <button onClick={() => setStep('description')} className="w-8 h-8 flex items-center justify-center text-gray-400 cursor-pointer">
            <i className="ri-arrow-left-line text-xl"></i>
          </button>
          <div>
            <p className="text-gray-400 text-sm">{todayShift.site?.site_name || 'Site'}</p>
            <h2 className="text-2xl font-bold text-white mt-0.5">Confirm & Submit</h2>
          </div>
        </div>

        <div className="mt-4 bg-[#1a1a1a] border border-white/5 rounded-2xl p-4 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-400">Severity</span>
            <span className={`text-sm font-bold ${severityLabel?.iconColor || 'text-white'}`}>{severityLabel?.label}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-400">Type</span>
            <span className="text-sm font-bold text-white">{incidentType}</span>
          </div>
          <div>
            <span className="text-sm text-gray-400 block mb-1">Description</span>
            <p className="text-sm text-white leading-relaxed">{displayDescription}</p>
          </div>
          {actionsTaken && (
            <div>
              <span className="text-sm text-gray-400 block mb-1">Actions taken</span>
              <p className="text-sm text-white">{actionsTaken}</p>
            </div>
          )}
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-400">Photos</span>
            <span className="text-sm text-white">{photoUrls.length}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-400">Location</span>
            <span className="text-sm text-white">{gps.lat ? 'GPS captured' : '—'}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-400">Time</span>
            <span className="text-sm text-white">{new Date().toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-400">Officer</span>
            <span className="text-sm text-white">{guardName}</span>
          </div>
        </div>

        {severity === 'critical' && (
          <div className="mt-3 bg-red-500/10 border border-red-500/20 rounded-xl p-3 flex items-start gap-2">
            <div className="w-5 h-5 flex items-center justify-center text-red-400 flex-shrink-0 mt-0.5">
              <i className="ri-alarm-warning-line"></i>
            </div>
            <p className="text-sm text-red-400">This is a critical incident. Operations will be immediately notified.</p>
          </div>
        )}

        <div className="mt-auto pt-6">
          <button
            onClick={handleSubmit}
            disabled={submitting}
            className="w-full h-16 bg-red-600 hover:bg-red-500 disabled:opacity-40 text-white font-bold rounded-xl transition-all active:scale-[0.98] cursor-pointer flex items-center justify-center gap-2 whitespace-nowrap text-lg"
          >
            {submitting ? (
              <i className="ri-loader-4-line animate-spin text-xl"></i>
            ) : (
              <>
                <div className="w-6 h-6 flex items-center justify-center">
                  <i className="ri-send-plane-line text-xl"></i>
                </div>
                Submit Incident
              </>
            )}
          </button>
          <button
            onClick={() => setStep('description')}
            disabled={submitting}
            className="mt-3 w-full h-12 bg-white/5 hover:bg-white/10 text-gray-400 font-medium rounded-xl transition-colors cursor-pointer whitespace-nowrap"
          >
            Go back
          </button>
        </div>
      </div>
    );
  }

  return null;
}