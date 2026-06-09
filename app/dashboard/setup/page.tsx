'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth';
import { supabase } from '@/lib/supabase';

const STEPS = [
  { id: 1, title: 'Company Details', icon: 'ri-building-2-line', description: 'Confirm your company information' },
  { id: 2, title: 'First Site', icon: 'ri-map-pin-line', description: 'Add your first site location' },
  { id: 3, title: 'Site Contacts', icon: 'ri-contacts-line', description: 'Add site contact details' },
  { id: 4, title: 'Guards & Staff', icon: 'ri-shield-user-line', description: 'Add your first security officer' },
  { id: 5, title: 'Rota & Check-Calls', icon: 'ri-calendar-check-line', description: 'Set shift and check-in rules' },
  { id: 6, title: 'Documents', icon: 'ri-file-upload-line', description: 'Upload SOPs and site documents' },
  { id: 7, title: 'Confirm Setup', icon: 'ri-check-double-line', description: 'Review and finish' },
];

const RISK_LEVELS = [
  { value: 'low', label: 'Low', color: 'text-emerald-400', border: 'border-emerald-500/30', bg: 'bg-emerald-500/10' },
  { value: 'medium', label: 'Medium', color: 'text-amber-400', border: 'border-amber-500/30', bg: 'bg-amber-500/10' },
  { value: 'high', label: 'High', color: 'text-red-400', border: 'border-red-500/30', bg: 'bg-red-500/10' },
];

const CHECK_INTERVALS = [
  { value: 30, label: '30 min' },
  { value: 60, label: '1 hour' },
  { value: 120, label: '2 hours' },
  { value: 240, label: '4 hours' },
];

const SKILL_OPTIONS = ['Door Supervisor', 'CCTV', 'First Aid', 'Fire Marshal', 'Keyholding', 'Patrol', 'Reception', 'Events'];

const inputBase = 'w-full bg-white/5 border rounded-lg px-3 py-2.5 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 transition-colors';
const inputNormal = 'border-white/10';

export default function SetupWizardPage() {
  const [step, setStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [isDone, setIsDone] = useState(false);
  const [savedData, setSavedData] = useState<Record<string, any>>();

  const [companyForm, setCompanyForm] = useState({
    name: '',
    contact_email: '',
    phone: '',
    address: '',
  });

  const [siteForm, setSiteForm] = useState({
    site_name: '',
    address: '',
    risk_level: 'medium',
    check_call_interval: 60,
  });

  const [contactForm, setContactForm] = useState({
    contact_name: '',
    contact_phone: '',
    contact_email: '',
    emergency_contact: '',
  });

  const [guardForm, setGuardForm] = useState({
    first_name: '',
    last_name: '',
    email: '',
    phone: '',
    sia_licence: '',
    sia_expiry: '',
    skills: [] as string[],
    hourly_rate: '',
  });

  const [rotaForm, setRotaForm] = useState({
    shift_start: '08:00',
    shift_end: '20:00',
    check_call_enabled: true,
    patrol_enabled: true,
    patrol_interval: 60,
  });

  const [docForm, setDocForm] = useState({
    sop_name: '',
    doc_type: 'sop',
  });

  const { profile, company, isLoading: authLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (authLoading) return;
    if (!profile) {
      router.replace('/login');
      return;
    }
    if (profile.role === 'client') {
      router.replace('/client');
      return;
    }
    if (profile.role === 'guard') {
      router.replace('/guard');
      return;
    }
    if (company) {
      setCompanyForm({
        name: company.name || '',
        contact_email: company.contact_email || '',
        phone: company.phone || '',
        address: company.address || '',
      });
    }
  }, [profile, company, authLoading, router]);

  const validateStep = useCallback((s: number): boolean => {
    setError('');
    if (s === 1) {
      if (!companyForm.name.trim()) { setError('Company name is required'); return false; }
      if (!companyForm.contact_email.trim()) { setError('Contact email is required'); return false; }
    }
    if (s === 2) {
      if (!siteForm.site_name.trim()) { setError('Site name is required'); return false; }
      if (!siteForm.address.trim()) { setError('Site address is required'); return false; }
    }
    if (s === 3) {
      if (!contactForm.contact_name.trim()) { setError('Contact name is required'); return false; }
      if (!contactForm.contact_phone.trim()) { setError('Contact phone is required'); return false; }
    }
    if (s === 4) {
      if (!guardForm.first_name.trim()) { setError('First name is required'); return false; }
      if (!guardForm.last_name.trim()) { setError('Last name is required'); return false; }
      if (!guardForm.email.trim()) { setError('Email is required'); return false; }
    }
    return true;
  }, [companyForm, siteForm, contactForm, guardForm]);

  const saveStep = async (s: number) => {
    if (!profile?.company_id) { setError('No company found'); return false; }
    setIsLoading(true);
    setError('');

    try {
      if (s === 1) {
        const { error: err } = await supabase.from('companies').update({
          name: companyForm.name.trim(),
          contact_email: companyForm.contact_email.trim(),
          phone: companyForm.phone.trim() || null,
          address: companyForm.address.trim() || null,
        }).eq('id', profile.company_id);
        if (err) throw err;
        setSavedData(prev => ({ ...prev, company: companyForm }));
      }
      if (s === 2) {
        const { data, error: err } = await supabase.from('sites').insert({
          company_id: profile.company_id,
          site_name: siteForm.site_name.trim(),
          address: siteForm.address.trim(),
          risk_level: siteForm.risk_level,
          check_call_interval: siteForm.check_call_interval,
        }).select('id').single();
        if (err) throw err;
        setSavedData(prev => ({ ...prev, site: { ...siteForm, id: data?.id } }));
      }
      if (s === 3) {
        const siteId = savedData.site?.id;
        if (siteId) {
          const { error: err } = await supabase.from('sites').update({
            site_contact_name: contactForm.contact_name.trim(),
            site_contact_phone: contactForm.contact_phone.trim(),
            site_contact_email: contactForm.contact_email.trim() || null,
            emergency_contact: contactForm.emergency_contact.trim() || null,
          }).eq('id', siteId);
          if (err) throw err;
        }
        setSavedData(prev => ({ ...prev, contacts: contactForm }));
      }
      if (s === 4) {
        const { data, error: err } = await supabase.from('guards').insert({
          company_id: profile.company_id,
          first_name: guardForm.first_name.trim(),
          last_name: guardForm.last_name.trim(),
          email: guardForm.email.trim(),
          phone: guardForm.phone.trim() || null,
          sia_licence: guardForm.sia_licence.trim() || null,
          sia_expiry: guardForm.sia_expiry || null,
          skills: guardForm.skills,
          hourly_rate: parseFloat(guardForm.hourly_rate) || 0,
          status: 'active',
        }).select('id').single();
        if (err) throw err;
        setSavedData(prev => ({ ...prev, guard: { ...guardForm, id: data?.id } }));
      }
      if (s === 5) {
        const siteId = savedData.site?.id;
        if (siteId) {
          await supabase.from('sites').update({
            check_call_interval: siteForm.check_call_interval,
            patrol_enabled: rotaForm.patrol_enabled,
            patrol_interval: rotaForm.patrol_interval,
          }).eq('id', siteId);
        }
        setSavedData(prev => ({ ...prev, rota: rotaForm }));
      }
      if (s === 6) {
        if (docForm.sop_name.trim()) {
          await supabase.from('sop_documents').insert({
            company_id: profile.company_id,
            title: docForm.sop_name.trim(),
            type: docForm.doc_type,
            status: 'draft',
          });
        }
        setSavedData(prev => ({ ...prev, doc: docForm }));
      }
      setIsLoading(false);
      return true;
    } catch (e: any) {
      setError(e.message || 'Failed to save');
      setIsLoading(false);
      return false;
    }
  };

  const handleNext = async () => {
    if (!validateStep(step)) return;
    const ok = await saveStep(step);
    if (!ok) return;
    if (step < STEPS.length) {
      setStep(s => s + 1);
    } else {
      await finishSetup();
    }
  };

  const handleBack = () => {
    if (step > 1) setStep(s => s - 1);
    setError('');
  };

  const finishSetup = async () => {
    if (!profile?.company_id) return;
    setIsLoading(true);
    await supabase.from('companies').update({
      onboarding_status: 'completed',
      account_status: 'active',
    }).eq('id', profile.company_id);
    setIsLoading(false);
    setIsDone(true);
  };

  const skipStep = () => {
    if (step < STEPS.length) {
      setStep(s => s + 1);
    } else {
      finishSetup();
    }
  };

  if (authLoading) {
    return (
      <div className="min-h-screen bg-[#0b0f19] flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (isDone) {
    return (
      <div className="min-h-screen bg-[#0b0f19] flex items-center justify-center px-4">
        <div className="w-full max-w-md text-center">
          <div className="w-16 h-16 bg-emerald-500/20 border border-emerald-500/30 rounded-full flex items-center justify-center mx-auto mb-6">
            <i className="ri-check-line text-emerald-400 text-2xl"></i>
          </div>
          <h1 className="text-2xl font-bold text-white mb-2">Setup Complete</h1>
          <p className="text-gray-400 mb-6">
            {company?.name} is ready to go. Your dashboard is waiting.
          </p>
          <div className="space-y-3">
            <button
              onClick={() => router.replace('/dashboard')}
              className="w-full bg-blue-600 hover:bg-blue-500 text-white text-sm font-medium py-2.5 rounded-lg transition-colors cursor-pointer whitespace-nowrap"
            >
              Go to Dashboard <i className="ri-arrow-right-line ml-1"></i>
            </button>
          </div>
        </div>
      </div>
    );
  }

  const currentStep = STEPS[step - 1];

  return (
    <div className="min-h-screen bg-[#0b0f19] flex items-center justify-center px-4 py-10">
      <style>{`
        @keyframes fadeSlide {
          from { opacity: 0; transform: translateY(12px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fadeSlide { animation: fadeSlide 0.35s ease-out both; }
      `}</style>

      <div className="w-full max-w-2xl">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-14 h-14 bg-blue-600 rounded-xl flex items-center justify-center mx-auto mb-4">
            <i className={`${currentStep.icon} text-white text-2xl`}></i>
          </div>
          <h1 className="text-2xl font-bold text-white mb-1">Setup Wizard</h1>
          <p className="text-gray-400 text-sm">
            {company?.name ? `Welcome, ${company.name}` : "Let's get your operation ready."}
          </p>

          {/* Progress */}
          <div className="mt-6 flex items-center justify-center gap-2">
            {STEPS.map((s, i) => (
              <div key={s.id} className="flex items-center gap-2">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold transition-all ${
                  i + 1 < step ? 'bg-emerald-600 text-white' :
                  i + 1 === step ? 'bg-blue-600 text-white' :
                  'bg-white/10 text-gray-500'
                }`}>
                  {i + 1 < step ? <i className="ri-check-line"></i> : s.id}
                </div>
                {i < STEPS.length - 1 && (
                  <div className={`w-8 h-0.5 rounded-full ${i + 1 < step ? 'bg-emerald-600' : 'bg-white/10'}`}></div>
                )}
              </div>
            ))}
          </div>
          <p className="text-xs text-gray-500 mt-2">Step {step} of {STEPS.length}: {currentStep.title}</p>
        </div>

        {/* Step Card */}
        <div className="bg-[#111827]/80 backdrop-blur-sm border border-white/10 rounded-xl p-6 animate-fadeSlide" key={step}>
          <h2 className="text-lg font-semibold text-white mb-1">{currentStep.title}</h2>
          <p className="text-sm text-gray-400 mb-5">{currentStep.description}</p>

          {error && (
            <div className="mb-4 p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-red-400 text-sm flex items-start gap-2">
              <i className="ri-error-warning-line mt-0.5"></i>
              {error}
            </div>
          )}

          {/* Step 1: Company Details */}
          {step === 1 && (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1.5">Company Name <span className="text-red-400">*</span></label>
                <input
                  type="text"
                  value={companyForm.name}
                  onChange={(e) => setCompanyForm(prev => ({ ...prev, name: e.target.value }))}
                  className={`${inputBase} ${inputNormal}`}
                  placeholder="e.g. Shield Security Ltd"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1.5">Contact Email <span className="text-red-400">*</span></label>
                  <input
                    type="email"
                    value={companyForm.contact_email}
                    onChange={(e) => setCompanyForm(prev => ({ ...prev, contact_email: e.target.value }))}
                    className={`${inputBase} ${inputNormal}`}
                    placeholder="ops@company.com"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1.5">Phone</label>
                  <input
                    type="tel"
                    value={companyForm.phone}
                    onChange={(e) => setCompanyForm(prev => ({ ...prev, phone: e.target.value }))}
                    className={`${inputBase} ${inputNormal}`}
                    placeholder="+44 7700 900000"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1.5">Address</label>
                <input
                  type="text"
                  value={companyForm.address}
                  onChange={(e) => setCompanyForm(prev => ({ ...prev, address: e.target.value }))}
                  className={`${inputBase} ${inputNormal}`}
                  placeholder="Company headquarters address"
                />
              </div>
            </div>
          )}

          {/* Step 2: First Site */}
          {step === 2 && (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1.5">Site Name <span className="text-red-400">*</span></label>
                <input
                  type="text"
                  value={siteForm.site_name}
                  onChange={(e) => setSiteForm(prev => ({ ...prev, site_name: e.target.value }))}
                  className={`${inputBase} ${inputNormal}`}
                  placeholder="e.g. Westfield Shopping Centre"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1.5">Site Address <span className="text-red-400">*</span></label>
                <input
                  type="text"
                  value={siteForm.address}
                  onChange={(e) => setSiteForm(prev => ({ ...prev, address: e.target.value }))}
                  className={`${inputBase} ${inputNormal}`}
                  placeholder="Full street address"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Risk Level</label>
                <div className="grid grid-cols-3 gap-2">
                  {RISK_LEVELS.map((level) => (
                    <button
                      key={level.value}
                      onClick={() => setSiteForm(prev => ({ ...prev, risk_level: level.value }))}
                      className={`py-2.5 rounded-lg text-sm font-medium border transition-all cursor-pointer ${
                        siteForm.risk_level === level.value
                          ? `${level.bg} ${level.border} ${level.color}`
                          : 'bg-white/5 border-white/10 text-gray-400 hover:border-white/20'
                      }`}
                    >
                      {level.label}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Check-in Interval</label>
                <div className="grid grid-cols-4 gap-2">
                  {CHECK_INTERVALS.map((interval) => (
                    <button
                      key={interval.value}
                      onClick={() => setSiteForm(prev => ({ ...prev, check_call_interval: interval.value }))}
                      className={`py-2 rounded-lg text-sm font-medium border transition-all cursor-pointer ${
                        siteForm.check_call_interval === interval.value
                          ? 'bg-blue-600/20 border-blue-500/50 text-blue-400'
                          : 'bg-white/5 border-white/10 text-gray-400 hover:border-white/20'
                      }`}
                    >
                      {interval.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Step 3: Site Contacts */}
          {step === 3 && (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1.5">Site Contact Name <span className="text-red-400">*</span></label>
                <input
                  type="text"
                  value={contactForm.contact_name}
                  onChange={(e) => setContactForm(prev => ({ ...prev, contact_name: e.target.value }))}
                  className={`${inputBase} ${inputNormal}`}
                  placeholder="Primary contact person"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1.5">Contact Phone <span className="text-red-400">*</span></label>
                  <input
                    type="tel"
                    value={contactForm.contact_phone}
                    onChange={(e) => setContactForm(prev => ({ ...prev, contact_phone: e.target.value }))}
                    className={`${inputBase} ${inputNormal}`}
                    placeholder="+44 7700 900000"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1.5">Contact Email</label>
                  <input
                    type="email"
                    value={contactForm.contact_email}
                    onChange={(e) => setContactForm(prev => ({ ...prev, contact_email: e.target.value }))}
                    className={`${inputBase} ${inputNormal}`}
                    placeholder="contact@site.com"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1.5">Emergency Contact</label>
                <input
                  type="text"
                  value={contactForm.emergency_contact}
                  onChange={(e) => setContactForm(prev => ({ ...prev, emergency_contact: e.target.value }))}
                  className={`${inputBase} ${inputNormal}`}
                  placeholder="Emergency contact number"
                />
              </div>
            </div>
          )}

          {/* Step 4: Guards & Staff */}
          {step === 4 && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1.5">First Name <span className="text-red-400">*</span></label>
                  <input
                    type="text"
                    value={guardForm.first_name}
                    onChange={(e) => setGuardForm(prev => ({ ...prev, first_name: e.target.value }))}
                    className={`${inputBase} ${inputNormal}`}
                    placeholder="John"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1.5">Last Name <span className="text-red-400">*</span></label>
                  <input
                    type="text"
                    value={guardForm.last_name}
                    onChange={(e) => setGuardForm(prev => ({ ...prev, last_name: e.target.value }))}
                    className={`${inputBase} ${inputNormal}`}
                    placeholder="Smith"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1.5">Email <span className="text-red-400">*</span></label>
                  <input
                    type="email"
                    value={guardForm.email}
                    onChange={(e) => setGuardForm(prev => ({ ...prev, email: e.target.value }))}
                    className={`${inputBase} ${inputNormal}`}
                    placeholder="guard@company.com"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1.5">Phone</label>
                  <input
                    type="tel"
                    value={guardForm.phone}
                    onChange={(e) => setGuardForm(prev => ({ ...prev, phone: e.target.value }))}
                    className={`${inputBase} ${inputNormal}`}
                    placeholder="+44 7700 900000"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1.5">SIA Licence</label>
                  <input
                    type="text"
                    value={guardForm.sia_licence}
                    onChange={(e) => setGuardForm(prev => ({ ...prev, sia_licence: e.target.value }))}
                    className={`${inputBase} ${inputNormal}`}
                    placeholder="e.g. 1234567890123"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1.5">SIA Expiry</label>
                  <input
                    type="date"
                    value={guardForm.sia_expiry}
                    onChange={(e) => setGuardForm(prev => ({ ...prev, sia_expiry: e.target.value }))}
                    className={`${inputBase} ${inputNormal}`}
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1.5">Hourly Rate (GBP)</label>
                <input
                  type="number"
                  value={guardForm.hourly_rate}
                  onChange={(e) => setGuardForm(prev => ({ ...prev, hourly_rate: e.target.value }))}
                  className={`${inputBase} ${inputNormal}`}
                  placeholder="15.50"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Skills</label>
                <div className="flex flex-wrap gap-2">
                  {SKILL_OPTIONS.map((skill) => {
                    const active = guardForm.skills.includes(skill);
                    return (
                      <button
                        key={skill}
                        onClick={() => setGuardForm(prev => ({
                          ...prev,
                          skills: active ? prev.skills.filter(s => s !== skill) : [...prev.skills, skill]
                        }))}
                        className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-all cursor-pointer ${
                          active
                            ? 'bg-blue-600/20 border-blue-500/50 text-blue-400'
                            : 'bg-white/5 border-white/10 text-gray-400 hover:border-white/20'
                        }`}
                      >
                        {active && <i className="ri-check-line mr-1"></i>}
                        {skill}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* Step 5: Rota & Check-Calls */}
          {step === 5 && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1.5">Default Shift Start</label>
                  <input
                    type="time"
                    value={rotaForm.shift_start}
                    onChange={(e) => setRotaForm(prev => ({ ...prev, shift_start: e.target.value }))}
                    className={`${inputBase} ${inputNormal}`}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1.5">Default Shift End</label>
                  <input
                    type="time"
                    value={rotaForm.shift_end}
                    onChange={(e) => setRotaForm(prev => ({ ...prev, shift_end: e.target.value }))}
                    className={`${inputBase} ${inputNormal}`}
                  />
                </div>
              </div>
              <div className="flex items-center gap-3 p-3 bg-white/5 rounded-lg border border-white/10">
                <input
                  type="checkbox"
                  id="checkCall"
                  checked={rotaForm.check_call_enabled}
                  onChange={(e) => setRotaForm(prev => ({ ...prev, check_call_enabled: e.target.checked }))}
                  className="w-4 h-4 rounded border-gray-600 bg-gray-800 text-blue-600 cursor-pointer"
                />
                <label htmlFor="checkCall" className="text-sm text-gray-300 cursor-pointer">
                  Enable check-call alerts
                </label>
              </div>
              <div className="flex items-center gap-3 p-3 bg-white/5 rounded-lg border border-white/10">
                <input
                  type="checkbox"
                  id="patrol"
                  checked={rotaForm.patrol_enabled}
                  onChange={(e) => setRotaForm(prev => ({ ...prev, patrol_enabled: e.target.checked }))}
                  className="w-4 h-4 rounded border-gray-600 bg-gray-800 text-blue-600 cursor-pointer"
                />
                <label htmlFor="patrol" className="text-sm text-gray-300 cursor-pointer">
                  Enable patrol tracking
                </label>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Patrol Interval</label>
                <div className="grid grid-cols-4 gap-2">
                  {CHECK_INTERVALS.map((interval) => (
                    <button
                      key={interval.value}
                      onClick={() => setRotaForm(prev => ({ ...prev, patrol_interval: interval.value }))}
                      className={`py-2 rounded-lg text-sm font-medium border transition-all cursor-pointer ${
                        rotaForm.patrol_interval === interval.value
                          ? 'bg-blue-600/20 border-blue-500/50 text-blue-400'
                          : 'bg-white/5 border-white/10 text-gray-400 hover:border-white/20'
                      }`}
                    >
                      {interval.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Step 6: Documents */}
          {step === 6 && (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1.5">Document Name</label>
                <input
                  type="text"
                  value={docForm.sop_name}
                  onChange={(e) => setDocForm(prev => ({ ...prev, sop_name: e.target.value }))}
                  className={`${inputBase} ${inputNormal}`}
                  placeholder="e.g. Site Access Control SOP"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Document Type</label>
                <div className="grid grid-cols-3 gap-2">
                  {['sop', 'risk_assessment', 'assignment_instruction'].map((type) => (
                    <button
                      key={type}
                      onClick={() => setDocForm(prev => ({ ...prev, doc_type: type }))}
                      className={`py-2 rounded-lg text-sm font-medium border transition-all cursor-pointer capitalize ${
                        docForm.doc_type === type
                          ? 'bg-blue-600/20 border-blue-500/50 text-blue-400'
                          : 'bg-white/5 border-white/10 text-gray-400 hover:border-white/20'
                      }`}
                    >
                      {type.replace('_', ' ')}
                    </button>
                  ))}
                </div>
              </div>
              <div className="p-4 bg-white/5 rounded-lg border border-white/10 border-dashed text-center">
                <div className="w-10 h-10 flex items-center justify-center bg-white/5 rounded-full mx-auto mb-2">
                  <i className="ri-upload-cloud-line text-gray-400 text-lg"></i>
                </div>
                <p className="text-sm text-gray-400">Document upload will be available after setup</p>
                <p className="text-xs text-gray-500 mt-1">You can upload files from your dashboard later</p>
              </div>
            </div>
          )}

          {/* Step 7: Confirm */}
          {step === 7 && (
            <div className="space-y-4">
              <div className="p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-lg">
                <div className="flex items-center gap-2 text-emerald-400 text-sm font-medium mb-2">
                  <i className="ri-check-line"></i>
                  Ready to go live
                </div>
                <p className="text-sm text-gray-400">
                  Here's what you've configured for {company?.name || 'your company'}:
                </p>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between p-3 bg-white/5 rounded-lg border border-white/10">
                  <span className="text-sm text-gray-400">Company</span>
                  <span className="text-sm text-white font-medium">{companyForm.name || company?.name}</span>
                </div>
                <div className="flex items-center justify-between p-3 bg-white/5 rounded-lg border border-white/10">
                  <span className="text-sm text-gray-400">Site</span>
                  <span className="text-sm text-white font-medium">{siteForm.site_name || 'Not set'}</span>
                </div>
                <div className="flex items-center justify-between p-3 bg-white/5 rounded-lg border border-white/10">
                  <span className="text-sm text-gray-400">Contacts</span>
                  <span className="text-sm text-white font-medium">{contactForm.contact_name || 'Not set'}</span>
                </div>
                <div className="flex items-center justify-between p-3 bg-white/5 rounded-lg border border-white/10">
                  <span className="text-sm text-gray-400">Guard</span>
                  <span className="text-sm text-white font-medium">{guardForm.first_name ? `${guardForm.first_name} ${guardForm.last_name}` : 'Not set'}</span>
                </div>
                <div className="flex items-center justify-between p-3 bg-white/5 rounded-lg border border-white/10">
                  <span className="text-sm text-gray-400">Shift Times</span>
                  <span className="text-sm text-white font-medium">{rotaForm.shift_start} – {rotaForm.shift_end}</span>
                </div>
                <div className="flex items-center justify-between p-3 bg-white/5 rounded-lg border border-white/10">
                  <span className="text-sm text-gray-400">Documents</span>
                  <span className="text-sm text-white font-medium">{docForm.sop_name || 'None added'}</span>
                </div>
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="mt-6 flex items-center justify-between">
            <div className="flex items-center gap-2">
              {step > 1 && (
                <button
                  onClick={handleBack}
                  disabled={isLoading}
                  className="text-gray-400 hover:text-white text-sm font-medium px-4 py-2.5 rounded-lg transition-colors cursor-pointer whitespace-nowrap flex items-center gap-2"
                >
                  <i className="ri-arrow-left-line"></i> Back
                </button>
              )}
              {step < STEPS.length && (
                <button
                  onClick={skipStep}
                  disabled={isLoading}
                  className="text-gray-500 hover:text-gray-400 text-sm font-medium px-4 py-2.5 rounded-lg transition-colors cursor-pointer whitespace-nowrap"
                >
                  Skip
                </button>
              )}
            </div>
            <button
              onClick={handleNext}
              disabled={isLoading}
              className="bg-blue-600 hover:bg-blue-500 text-white text-sm font-medium px-6 py-2.5 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer whitespace-nowrap flex items-center gap-2"
            >
              {isLoading ? (
                <>
                  <i className="ri-loader-4-line animate-spin"></i> Saving...
                </>
              ) : step === STEPS.length ? (
                <>
                  Finish Setup <i className="ri-check-line"></i>
                </>
              ) : (
                <>
                  Next <i className="ri-arrow-right-line"></i>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}