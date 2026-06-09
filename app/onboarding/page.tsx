'use client';

import { useState, useCallback, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth';
import { supabase } from '@/lib/supabase';

const SITE_STEPS = [
  { id: 1, title: 'Site Details', icon: 'ri-building-2-line' },
  { id: 2, title: 'Risk \u0026 Settings', icon: 'ri-shield-star-line' },
  { id: 3, title: 'Review', icon: 'ri-check-double-line' },
];

const GUARD_STEPS = [
  { id: 1, title: 'Guard Info', icon: 'ri-user-line' },
  { id: 2, title: 'SIA \u0026 Skills', icon: 'ri-shield-check-line' },
  { id: 3, title: 'Contact', icon: 'ri-phone-line' },
];

function WizardHeader({ step, totalSteps, title, subtitle, icon }: { step: number; totalSteps: number; title: string; subtitle: string; icon: string }) {
  return (
    <div className="text-center mb-8">
      <div className="w-14 h-14 bg-blue-600 rounded-xl flex items-center justify-center mx-auto mb-4">
        <i className={`${icon} text-white text-2xl`} />
      </div>
      <h1 className="text-2xl font-bold text-white mb-1" style={{ fontFamily: 'var(--font-pacifico)' }}>
        GuardianHub
      </h1>
      <p className="text-gray-400 text-sm">{subtitle}</p>
      <div className="mt-4 flex items-center justify-center gap-1">
        {Array.from({ length: totalSteps }).map((_, i) => (
          <div
            key={i}
            className={`h-1.5 rounded-full transition-all duration-300 ${
              i < step ? 'w-8 bg-blue-600' : i === step ? 'w-8 bg-blue-600/40' : 'w-4 bg-white/10'
            }`}
          />
        ))}
      </div>
    </div>
  );
}

function AnimatedCard({ children, stepKey }: { children: React.ReactNode; stepKey: number }) {
  return (
    <div
      key={stepKey}
      className="bg-[#111827]/80 backdrop-blur-sm border border-white/10 rounded-xl p-6 animate-fadeSlide"
    >
      {children}
    </div>
  );
}

const RISK_LEVELS = [
  { value: 'low', label: 'Low', color: 'text-emerald-400', border: 'border-emerald-500/30', bg: 'bg-emerald-500/10' },
  { value: 'medium', label: 'Medium', color: 'text-amber-400', border: 'border-amber-500/30', bg: 'bg-amber-500/10' },
  { value: 'high', label: 'High', color: 'text-red-400', border: 'border-red-500/30', bg: 'bg-red-500/10' },
];

const INTERVALS = [
  { value: 30, label: '30 min' },
  { value: 60, label: '1 hour' },
  { value: 120, label: '2 hours' },
  { value: 240, label: '4 hours' },
];

const SKILL_OPTIONS = ['Door Supervisor', 'CCTV', 'First Aid', 'Fire Marshal', 'Keyholding', 'Patrol', 'Reception', 'Events'];

const inputBase =
  'w-full bg-white/5 border rounded-lg px-3 py-2.5 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 transition-colors';
const inputError = 'border-red-500/50';
const inputNormal = 'border-white/10';

function SiteField({
  label,
  name,
  type = 'text',
  placeholder,
  required = false,
  value,
  error,
  onChange,
}: {
  label: string;
  name: string;
  type?: string;
  placeholder?: string;
  required?: boolean;
  value: string;
  error?: string;
  onChange: (val: string) => void;
}) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-300 mb-1.5">
        {label}
        {required && <span className="text-red-400 ml-1">*</span>}
      </label>
      <input
        type={type}
        name={name}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className={`${inputBase} ${error ? inputError : inputNormal}`}
      />
      {error && <p className="mt-1 text-xs text-red-400">{error}</p>}
    </div>
  );
}

function GuardField({
  label,
  name,
  type = 'text',
  placeholder,
  required = false,
  value,
  error,
  onChange,
}: {
  label: string;
  name: string;
  type?: string;
  placeholder?: string;
  required?: boolean;
  value: string;
  error?: string;
  onChange: (val: string) => void;
}) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-300 mb-1.5">
        {label}
        {required && <span className="text-red-400 ml-1">*</span>}
      </label>
      <input
        type={type}
        name={name}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className={`${inputBase} ${error ? inputError : inputNormal}`}
      />
      {error && <p className="mt-1 text-xs text-red-400">{error}</p>}
    </div>
  );
}

export default function OnboardingPage() {
  const [phase, setPhase] = useState<'site' | 'guard'>('site');
  const [siteStep, setSiteStep] = useState(1);
  const [guardStep, setGuardStep] = useState(1);

  const [siteForm, setSiteForm] = useState({
    siteName: '',
    address: '',
    siteContactPhone: '',
    clientName: '',
    clientContactEmail: '',
    riskLevel: 'medium',
    checkCallInterval: 60,
  });
  const [guardForm, setGuardForm] = useState({
    firstName: '',
    lastName: '',
    siaLicence: '',
    siaExpiry: '',
    skills: [] as string[],
    hourlyRate: '',
    email: '',
    phone: '',
  });

  const [siteErrors, setSiteErrors] = useState<Record<string, string>>({});
  const [guardErrors, setGuardErrors] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [submitError, setSubmitError] = useState('');
  const [isDone, setIsDone] = useState(false);
  const [createdSiteName, setCreatedSiteName] = useState('');

  const { profile, company, isLoading: authLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (authLoading) return;
    if (!profile) {
      router.push('/login');
      return;
    }
    if (profile.role === 'client') {
      router.replace('/client');
    }
  }, [profile, authLoading, router]);

  const updateSiteField = useCallback((name: string, value: string | number) => {
    setSiteForm((prev) => ({ ...prev, [name]: value }));
    setSiteErrors((prev) => {
      const next = { ...prev };
      delete next[name];
      return next;
    });
  }, []);

  const updateGuardField = useCallback((name: string, value: string | string[] | boolean) => {
    setGuardForm((prev) => ({ ...prev, [name]: value }));
    setGuardErrors((prev) => {
      const next = { ...prev };
      delete next[name];
      return next;
    });
  }, []);

  const toggleSkill = useCallback((skill: string) => {
    setGuardForm((prev) => {
      const skills = prev.skills.includes(skill)
        ? prev.skills.filter((s) => s !== skill)
        : [...prev.skills, skill];
      return { ...prev, skills };
    });
  }, []);

  const validateSiteStep = useCallback(
    (s: number): boolean => {
      const nextErrors: Record<string, string> = {};
      if (s === 1) {
        if (!siteForm.siteName.trim()) nextErrors.siteName = 'Site name is required';
        if (!siteForm.address.trim()) nextErrors.address = 'Address is required';
      }
      setSiteErrors(nextErrors);
      return Object.keys(nextErrors).length === 0;
    },
    [siteForm]
  );

  const validateGuardStep = useCallback(
    (s: number): boolean => {
      const nextErrors: Record<string, string> = {};
      if (s === 1) {
        if (!guardForm.firstName.trim()) nextErrors.firstName = 'First name is required';
        if (!guardForm.lastName.trim()) nextErrors.lastName = 'Last name is required';
      }
      if (s === 2) {
        if (!guardForm.siaLicence.trim()) nextErrors.siaLicence = 'SIA licence number is required';
        if (!guardForm.siaExpiry.trim()) nextErrors.siaExpiry = 'Expiry date is required';
      }
      if (s === 3) {
        if (!guardForm.email.trim()) nextErrors.email = 'Email is required';
        else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(guardForm.email)) nextErrors.email = 'Enter a valid email';
        if (!guardForm.phone.trim()) nextErrors.phone = 'Phone is required';
        if (!guardForm.hourlyRate.trim()) nextErrors.hourlyRate = 'Hourly rate is required';
      }
      setGuardErrors(nextErrors);
      return Object.keys(nextErrors).length === 0;
    },
    [guardForm]
  );

  const goSiteNext = useCallback(() => {
    if (validateSiteStep(siteStep)) setSiteStep((s) => Math.min(s + 1, SITE_STEPS.length));
  }, [siteStep, validateSiteStep]);

  const goSiteBack = useCallback(() => {
    setSiteStep((s) => Math.max(s - 1, 1));
    setSubmitError('');
  }, []);

  const goGuardNext = useCallback(() => {
    if (validateGuardStep(guardStep)) setGuardStep((s) => Math.min(s + 1, GUARD_STEPS.length));
  }, [guardStep, validateGuardStep]);

  const goGuardBack = useCallback(() => {
    setGuardStep((s) => Math.max(s - 1, 1));
    setSubmitError('');
  }, []);

  const handleCreateSite = async () => {
    if (!validateSiteStep(1)) return;
    if (!profile?.company_id) {
      setSubmitError('No company found. Please log in again.');
      return;
    }
    setIsLoading(true);
    setSubmitError('');

    const { error } = await supabase.from('sites').insert({
      company_id: profile.company_id,
      site_name: siteForm.siteName.trim(),
      address: siteForm.address.trim(),
      site_contact_phone: siteForm.siteContactPhone.trim() || null,
      client_name: siteForm.clientName.trim() || null,
      client_contact_email: siteForm.clientContactEmail.trim() || null,
      risk_level: siteForm.riskLevel,
      check_call_interval: siteForm.checkCallInterval,
    });

    if (error) {
      setSubmitError(error.message || 'Failed to create site');
      setIsLoading(false);
    } else {
      setCreatedSiteName(siteForm.siteName.trim());
      setIsLoading(false);
      setPhase('guard');
    }
  };

  const handleCreateGuard = async () => {
    if (!validateGuardStep(3)) return;
    if (!profile?.company_id) {
      setSubmitError('No company found. Please log in again.');
      return;
    }
    setIsLoading(true);
    setSubmitError('');

    const { error } = await supabase.from('guards').insert({
      company_id: profile.company_id,
      first_name: guardForm.firstName.trim(),
      last_name: guardForm.lastName.trim(),
      sia_licence: guardForm.siaLicence.trim(),
      sia_expiry: guardForm.siaExpiry.trim(),
      skills: guardForm.skills,
      hourly_rate: parseFloat(guardForm.hourlyRate) || 0,
      email: guardForm.email.trim(),
      phone: guardForm.phone.trim(),
      status: 'active',
    });

    if (error) {
      setSubmitError(error.message || 'Failed to create guard');
      setIsLoading(false);
    } else {
      setIsLoading(false);
      setIsDone(true);
    }
  };

  const skipGuard = useCallback(() => {
    setIsDone(true);
  }, []);

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
            <i className="ri-check-line text-emerald-400 text-2xl" />
          </div>
          <h1 className="text-2xl font-bold text-white mb-2">You&apos;re all set!</h1>
          <p className="text-gray-400 mb-6">
            Your site <span className="text-white font-medium">{createdSiteName}</span> and first guard are ready to go.
          </p>
          <div className="space-y-3">
            <button
              onClick={() => {
                const dest = profile?.role === 'client' ? '/client' : '/dashboard';
                router.push(dest);
              }}
              className="w-full bg-blue-600 hover:bg-blue-500 text-white text-sm font-medium py-2.5 rounded-lg transition-colors cursor-pointer whitespace-nowrap"
            >
              Go to Dashboard <i className="ri-arrow-right-line ml-1" />
            </button>
            <button
              onClick={() => {
                setIsDone(false);
                setPhase('site');
                setSiteStep(1);
                setGuardStep(1);
                setSiteForm({
                  siteName: '',
                  address: '',
                  siteContactPhone: '',
                  clientName: '',
                  clientContactEmail: '',
                  riskLevel: 'medium',
                  checkCallInterval: 60,
                });
                setGuardForm({
                  firstName: '',
                  lastName: '',
                  siaLicence: '',
                  siaExpiry: '',
                  skills: [],
                  hourlyRate: '',
                  email: '',
                  phone: '',
                });
                setSiteErrors({});
                setGuardErrors({});
                setSubmitError('');
              }}
              className="w-full text-gray-400 hover:text-white text-sm font-medium py-2.5 rounded-lg transition-colors cursor-pointer whitespace-nowrap"
            >
              Add another site + guard
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0b0f19] flex items-center justify-center px-4 py-10">
      <style>{`
        @keyframes fadeSlide {
          from { opacity: 0; transform: translateY(12px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fadeSlide { animation: fadeSlide 0.35s ease-out both; }
      `}</style>

      <div className="w-full max-w-lg">
        {phase === 'site' && (
          <>
            <WizardHeader
              step={siteStep - 1}
              totalSteps={SITE_STEPS.length}
              title="GuardianHub"
              subtitle={company?.name ? `Welcome, ${company.name}! Let's set up your first site.` : "Let's set up your first site."}
              icon="ri-building-2-line"
            />

            {siteStep === 1 && (
              <AnimatedCard stepKey={1}>
                <h2 className="text-lg font-semibold text-white mb-1">Site Details</h2>
                <p className="text-sm text-gray-400 mb-5">Tell us about the location you want to secure.</p>
                <div className="space-y-4">
                  <SiteField label="Site Name" name="siteName" placeholder="e.g. Westfield Shopping Centre" required value={siteForm.siteName} error={siteErrors.siteName} onChange={(v) => updateSiteField('siteName', v)} />
                  <SiteField label="Address" name="address" placeholder="Full street address" required value={siteForm.address} error={siteErrors.address} onChange={(v) => updateSiteField('address', v)} />
                  <div className="grid grid-cols-2 gap-3">
                    <SiteField label="Site Contact Phone" name="siteContactPhone" type="tel" placeholder="+44 7700 900000" value={siteForm.siteContactPhone} error={siteErrors.siteContactPhone} onChange={(v) => updateSiteField('siteContactPhone', v)} />
                    <SiteField label="Client Name" name="clientName" placeholder="e.g. Westfield Ltd" value={siteForm.clientName} error={siteErrors.clientName} onChange={(v) => updateSiteField('clientName', v)} />
                  </div>
                  <SiteField label="Client Contact Email" name="clientContactEmail" type="email" placeholder="client@company.com" value={siteForm.clientContactEmail} error={siteErrors.clientContactEmail} onChange={(v) => updateSiteField('clientContactEmail', v)} />
                </div>
                <div className="mt-6 flex justify-end">
                  <button
                    onClick={goSiteNext}
                    className="bg-blue-600 hover:bg-blue-500 text-white text-sm font-medium px-6 py-2.5 rounded-lg transition-colors cursor-pointer whitespace-nowrap flex items-center gap-2"
                  >
                    Next <i className="ri-arrow-right-line" />
                  </button>
                </div>
              </AnimatedCard>
            )}

            {siteStep === 2 && (
              <AnimatedCard stepKey={2}>
                <h2 className="text-lg font-semibold text-white mb-1">Risk & Settings</h2>
                <p className="text-sm text-gray-400 mb-5">Configure how your site will be monitored.</p>

                <div className="space-y-5">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Risk Level</label>
                    <div className="grid grid-cols-3 gap-2">
                      {RISK_LEVELS.map((level) => (
                        <button
                          key={level.value}
                          onClick={() => updateSiteField('riskLevel', level.value)}
                          className={`py-2.5 rounded-lg text-sm font-medium border transition-all cursor-pointer ${
                            siteForm.riskLevel === level.value
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
                    <label className="block text-sm font-medium text-gray-300 mb-2">Guard Check-in Interval</label>
                    <p className="text-xs text-gray-500 mb-2">How often guards must check in from this site.</p>
                    <div className="grid grid-cols-4 gap-2">
                      {INTERVALS.map((interval) => (
                        <button
                          key={interval.value}
                          onClick={() => updateSiteField('checkCallInterval', interval.value)}
                          className={`py-2 rounded-lg text-sm font-medium border transition-all cursor-pointer ${
                            siteForm.checkCallInterval === interval.value
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

                <div className="mt-6 flex justify-between">
                  <button
                    onClick={goSiteBack}
                    className="text-gray-400 hover:text-white text-sm font-medium px-4 py-2.5 rounded-lg transition-colors cursor-pointer whitespace-nowrap flex items-center gap-2"
                  >
                    <i className="ri-arrow-left-line" /> Back
                  </button>
                  <button
                    onClick={goSiteNext}
                    className="bg-blue-600 hover:bg-blue-500 text-white text-sm font-medium px-6 py-2.5 rounded-lg transition-colors cursor-pointer whitespace-nowrap flex items-center gap-2"
                  >
                    Review <i className="ri-arrow-right-line" />
                  </button>
                </div>
              </AnimatedCard>
            )}

            {siteStep === 3 && (
              <AnimatedCard stepKey={3}>
                <h2 className="text-lg font-semibold text-white mb-1">Review your site</h2>
                <p className="text-sm text-gray-400 mb-5">Double-check everything before we create it.</p>

                <div className="space-y-3">
                  <div className="bg-white/5 rounded-lg p-4 border border-white/10">
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-xs font-medium text-gray-500 uppercase tracking-wider">Site Details</span>
                      <button
                        onClick={() => setSiteStep(1)}
                        className="text-blue-400 hover:text-blue-300 text-xs cursor-pointer"
                      >
                        Edit
                      </button>
                    </div>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-500">Site Name</span>
                        <span className="text-white font-medium">{siteForm.siteName}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-500">Address</span>
                        <span className="text-white font-medium text-right max-w-[60%]">{siteForm.address}</span>
                      </div>
                      {siteForm.siteContactPhone && (
                        <div className="flex justify-between">
                          <span className="text-gray-500">Phone</span>
                          <span className="text-white font-medium">{siteForm.siteContactPhone}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="bg-white/5 rounded-lg p-4 border border-white/10">
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-xs font-medium text-gray-500 uppercase tracking-wider">Settings</span>
                      <button
                        onClick={() => setSiteStep(2)}
                        className="text-blue-400 hover:text-blue-300 text-xs cursor-pointer"
                      >
                        Edit
                      </button>
                    </div>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-500">Risk Level</span>
                        <span className={`font-medium capitalize ${
                          siteForm.riskLevel === 'low' ? 'text-emerald-400' :
                          siteForm.riskLevel === 'medium' ? 'text-amber-400' : 'text-red-400'
                        }`}>{siteForm.riskLevel}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-500">Check-in Interval</span>
                        <span className="text-white font-medium">
                          {INTERVALS.find(i => i.value === siteForm.checkCallInterval)?.label}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {submitError && (
                  <div className="mt-4 p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-red-400 text-sm">
                    {submitError}
                  </div>
                )}

                <div className="mt-6 flex justify-between">
                  <button
                    onClick={goSiteBack}
                    className="text-gray-400 hover:text-white text-sm font-medium px-4 py-2.5 rounded-lg transition-colors cursor-pointer whitespace-nowrap flex items-center gap-2"
                  >
                    <i className="ri-arrow-left-line" /> Back
                  </button>
                  <button
                    onClick={handleCreateSite}
                    disabled={isLoading}
                    className="bg-blue-600 hover:bg-blue-500 text-white text-sm font-medium px-6 py-2.5 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer whitespace-nowrap flex items-center gap-2"
                  >
                    {isLoading ? (
                      <>
                        <i className="ri-loader-4-line animate-spin" /> Creating...
                      </>
                    ) : (
                      <>
                        Create Site <i className="ri-add-line" />
                      </>
                    )}
                  </button>
                </div>
              </AnimatedCard>
            )}
          </>
        )}

        {phase === 'guard' && (
          <>
            <WizardHeader
              step={guardStep - 1}
              totalSteps={GUARD_STEPS.length}
              title="GuardianHub"
              subtitle={`Add a guard to ${createdSiteName}`}
              icon="ri-shield-check-line"
            />

            {guardStep === 1 && (
              <AnimatedCard stepKey={10}>
                <h2 className="text-lg font-semibold text-white mb-1">Guard Info</h2>
                <p className="text-sm text-gray-400 mb-5">Who is your first security officer?</p>
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-3">
                    <GuardField label="First Name" name="firstName" placeholder="John" required value={guardForm.firstName} error={guardErrors.firstName} onChange={(v) => updateGuardField('firstName', v)} />
                    <GuardField label="Last Name" name="lastName" placeholder="Smith" required value={guardForm.lastName} error={guardErrors.lastName} onChange={(v) => updateGuardField('lastName', v)} />
                  </div>
                </div>
                <div className="mt-6 flex justify-between">
                  <button
                    onClick={() => setPhase('site')}
                    className="text-gray-400 hover:text-white text-sm font-medium px-4 py-2.5 rounded-lg transition-colors cursor-pointer whitespace-nowrap flex items-center gap-2"
                  >
                    <i className="ri-arrow-left-line" /> Back to Site
                  </button>
                  <button
                    onClick={goGuardNext}
                    className="bg-blue-600 hover:bg-blue-500 text-white text-sm font-medium px-6 py-2.5 rounded-lg transition-colors cursor-pointer whitespace-nowrap flex items-center gap-2"
                  >
                    Next <i className="ri-arrow-right-line" />
                  </button>
                </div>
              </AnimatedCard>
            )}

            {guardStep === 2 && (
              <AnimatedCard stepKey={11}>
                <h2 className="text-lg font-semibold text-white mb-1">SIA & Skills</h2>
                <p className="text-sm text-gray-400 mb-5">Licensing and qualifications.</p>
                <div className="space-y-4">
                  <GuardField label="SIA Licence Number" name="siaLicence" placeholder="e.g. 1234567890123" required value={guardForm.siaLicence} error={guardErrors.siaLicence} onChange={(v) => updateGuardField('siaLicence', v)} />
                  <GuardField label="SIA Expiry Date" name="siaExpiry" type="date" required value={guardForm.siaExpiry} error={guardErrors.siaExpiry} onChange={(v) => updateGuardField('siaExpiry', v)} />

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Skills & Qualifications</label>
                    <div className="flex flex-wrap gap-2">
                      {SKILL_OPTIONS.map((skill) => {
                        const active = guardForm.skills.includes(skill);
                        return (
                          <button
                            key={skill}
                            onClick={() => toggleSkill(skill)}
                            className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-all cursor-pointer ${
                              active
                                ? 'bg-blue-600/20 border-blue-500/50 text-blue-400'
                                : 'bg-white/5 border-white/10 text-gray-400 hover:border-white/20'
                            }`}
                          >
                            {active && <i className="ri-check-line mr-1" />}
                            {skill}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>
                <div className="mt-6 flex justify-between">
                  <button
                    onClick={goGuardBack}
                    className="text-gray-400 hover:text-white text-sm font-medium px-4 py-2.5 rounded-lg transition-colors cursor-pointer whitespace-nowrap flex items-center gap-2"
                  >
                    <i className="ri-arrow-left-line" /> Back
                  </button>
                  <button
                    onClick={goGuardNext}
                    className="bg-blue-600 hover:bg-blue-500 text-white text-sm font-medium px-6 py-2.5 rounded-lg transition-colors cursor-pointer whitespace-nowrap flex items-center gap-2"
                  >
                    Next <i className="ri-arrow-right-line" />
                  </button>
                </div>
              </AnimatedCard>
            )}

            {guardStep === 3 && (
              <AnimatedCard stepKey={12}>
                <h2 className="text-lg font-semibold text-white mb-1">Contact & Rate</h2>
                <p className="text-sm text-gray-400 mb-5">Final details for your guard profile.</p>
                <div className="space-y-4">
                  <GuardField label="Email" name="email" type="email" placeholder="guard@company.com" required value={guardForm.email} error={guardErrors.email} onChange={(v) => updateGuardField('email', v)} />
                  <div className="grid grid-cols-2 gap-3">
                    <GuardField label="Phone" name="phone" type="tel" placeholder="+44 7700 900000" required value={guardForm.phone} error={guardErrors.phone} onChange={(v) => updateGuardField('phone', v)} />
                    <GuardField label="Hourly Rate (GBP)" name="hourlyRate" type="number" placeholder="15.50" required value={guardForm.hourlyRate} error={guardErrors.hourlyRate} onChange={(v) => updateGuardField('hourlyRate', v)} />
                  </div>
                </div>

                {submitError && (
                  <div className="mt-4 p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-red-400 text-sm">
                    {submitError}
                  </div>
                )}

                <div className="mt-6 flex justify-between">
                  <button
                    onClick={goGuardBack}
                    className="text-gray-400 hover:text-white text-sm font-medium px-4 py-2.5 rounded-lg transition-colors cursor-pointer whitespace-nowrap flex items-center gap-2"
                  >
                    <i className="ri-arrow-left-line" /> Back
                  </button>
                  <div className="flex gap-2">
                    <button
                      onClick={skipGuard}
                      className="text-gray-500 hover:text-gray-400 text-sm font-medium px-4 py-2.5 rounded-lg transition-colors cursor-pointer whitespace-nowrap"
                    >
                      Skip
                    </button>
                    <button
                      onClick={handleCreateGuard}
                      disabled={isLoading}
                      className="bg-blue-600 hover:bg-blue-500 text-white text-sm font-medium px-6 py-2.5 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer whitespace-nowrap flex items-center gap-2"
                    >
                      {isLoading ? (
                        <>
                          <i className="ri-loader-4-line animate-spin" /> Creating...
                        </>
                      ) : (
                        <>
                          Add Guard <i className="ri-add-line" />
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </AnimatedCard>
            )}
          </>
        )}
      </div>
    </div>
  );
}