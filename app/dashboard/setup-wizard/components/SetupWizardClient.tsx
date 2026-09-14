'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth';
import { useSetupWizard } from '@/lib/useSetupWizard';
import { callAgent, logWebhookEvent } from '@/lib/guardianhubAgents';
import StepIndicator from './StepIndicator';
import CompanyProfileStep, { CompanyFormData } from './CompanyProfileStep';
import FirstSiteStep, { SiteFormData } from './FirstSiteStep';
import FirstGuardsStep, { GuardFormData } from './FirstGuardsStep';
import FirstRotaStep, { RotaFormData } from './FirstRotaStep';
import ComplianceStep, { ComplianceFormData } from './ComplianceStep';
import FinishScreen from './FinishScreen';

const STEPS = [
  { id: 1, title: 'Company', icon: 'ri-building-2-line' },
  { id: 2, title: 'Site', icon: 'ri-map-pin-line' },
  { id: 3, title: 'Guards', icon: 'ri-shield-user-line' },
  { id: 4, title: 'Rota', icon: 'ri-calendar-event-line' },
  { id: 5, title: 'Compliance', icon: 'ri-file-shield-line' },
  { id: 6, title: 'Finish', icon: 'ri-check-double-line' },
];

const emptyCompany: CompanyFormData = {
  name: '',
  contact_person: '',
  phone: '',
  email: '',
  address: '',
  logo_url: '',
};

const emptySite: SiteFormData = {
  site_name: '',
  address: '',
  client_contact_name: '',
  client_contact_phone: '',
  emergency_contact: '',
  site_instructions: '',
  risk_level: 'medium',
  check_call_interval: 60,
};

const emptyRota: RotaFormData = {
  site_id: '',
  guard_id: '',
  shift_date: '',
  shift_start: '08:00',
  shift_end: '20:00',
  notes: '',
};

const emptyCompliance: ComplianceFormData = {
  insurance_uploaded: false,
  assignment_instructions_uploaded: false,
  risk_assessment_uploaded: false,
  acs_evidence_uploaded: false,
  insurance_name: '',
  assignment_instructions_name: '',
  risk_assessment_name: '',
  acs_evidence_name: '',
};

const inputBase = 'w-full bg-white/5 border rounded-lg px-3 py-2.5 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 transition-colors';
const inputNormal = 'border-white/10';

export default function SetupWizardClient() {
  const { profile, company, isLoading: authLoading } = useAuth();
  const router = useRouter();
  const {
    progress,
    loading: wizardLoading,
    saving,
    error: wizardError,
    companyId,
    saveCompanyProfile,
    saveFirstSite,
    saveFirstGuards,
    saveFirstRota,
    saveCompliance,
    finishSetup,
  } = useSetupWizard();

  const [step, setStep] = useState(1);
  const [error, setError] = useState('');
  const [completedSteps, setCompletedSteps] = useState<number[]>([]);
  const [isFinished, setIsFinished] = useState(false);
  const [redirecting, setRedirecting] = useState(false);
  const [finishError, setFinishError] = useState('');

  const [companyData, setCompanyData] = useState<CompanyFormData>(emptyCompany);
  const [siteData, setSiteData] = useState<SiteFormData>(emptySite);
  const [guardsData, setGuardsData] = useState<GuardFormData[]>([{ first_name: '', last_name: '', email: '', phone: '', sia_licence: '', sia_expiry: '', role: 'Security Officer', hourly_rate: '', skills: [] }]);
  const [rotaData, setRotaData] = useState<RotaFormData>(emptyRota);
  const [complianceData, setComplianceData] = useState<ComplianceFormData>(emptyCompliance);

  // Load saved progress
  useEffect(() => {
    if (!progress) return;
    if (progress.company_data) {
      setCompanyData({ ...emptyCompany, ...progress.company_data });
    }
    if (progress.site_data) {
      setSiteData({ ...emptySite, ...progress.site_data });
    }
    if (progress.guards_data && Array.isArray(progress.guards_data) && progress.guards_data.length > 0) {
      setGuardsData(progress.guards_data);
    }
    if (progress.rota_data) {
      setRotaData({ ...emptyRota, ...progress.rota_data });
    }
    if (progress.compliance_data) {
      setComplianceData({ ...emptyCompliance, ...progress.compliance_data });
    }
    if (progress.is_completed) {
      setIsFinished(true);
    }
    setStep(progress.current_step || 1);
    const done: number[] = [];
    if (progress.company_data?.name) done.push(1);
    if (progress.site_data?.site_name) done.push(2);
    if (progress.guards_data?.length > 0) done.push(3);
    if (progress.rota_data?.site_id) done.push(4);
    if (progress.compliance_data) done.push(5);
    if (progress.is_completed) done.push(6);
    setCompletedSteps(done);
  }, [progress]);

  useEffect(() => {
    if (authLoading) return;
    if (!profile) {
      try { router.replace('/login'); } catch { window.location.href = '/login'; }
      return;
    }
    if (profile.role === 'client') {
      try { router.replace('/client'); } catch { window.location.href = '/client'; }
      return;
    }
    if (profile.role === 'guard') {
      try { router.replace('/guard'); } catch { window.location.href = '/guard'; }
      return;
    }
  }, [profile, authLoading, router]);

  useEffect(() => {
    if (isFinished) {
      setRedirecting(true);
      const doRedirect = () => {
        router.push('/dashboard');
        setTimeout(() => {
          window.location.href = '/dashboard';
        }, 800);
      };
      const timer = setTimeout(doRedirect, 1800);
      return () => clearTimeout(timer);
    }
  }, [isFinished, router]);

  const validateStep = useCallback((s: number): boolean => {
    setError('');
    if (s === 1) {
      if (!companyData.name.trim()) { setError('Company name is required'); return false; }
      if (!companyData.contact_person.trim()) { setError('Contact person is required'); return false; }
      if (!companyData.email.trim()) { setError('Email is required'); return false; }
      if (!companyData.phone.trim()) { setError('Phone is required'); return false; }
      if (!companyData.address.trim()) { setError('Address is required'); return false; }
    }
    if (s === 2) {
      if (!siteData.site_name.trim()) { setError('Site name is required'); return false; }
      if (!siteData.address.trim()) { setError('Site address is required'); return false; }
      if (!siteData.client_contact_name.trim()) { setError('Client contact name is required'); return false; }
      if (!siteData.client_contact_phone.trim()) { setError('Client contact phone is required'); return false; }
    }
    if (s === 3) {
      for (const g of guardsData) {
        if (!g.first_name.trim()) { setError('All guards must have a first name'); return false; }
        if (!g.last_name.trim()) { setError('All guards must have a last name'); return false; }
        if (!g.email.trim()) { setError('All guards must have an email'); return false; }
        if (!g.phone.trim()) { setError('All guards must have a phone'); return false; }
      }
    }
    if (s === 4) {
      if (!rotaData.site_id) { setError('Please select a site'); return false; }
      if (!rotaData.guard_id) { setError('Please select a guard'); return false; }
      if (!rotaData.shift_date) { setError('Shift date is required'); return false; }
      if (!rotaData.shift_start) { setError('Start time is required'); return false; }
      if (!rotaData.shift_end) { setError('End time is required'); return false; }
    }
    return true;
  }, [companyData, siteData, guardsData, rotaData]);

  const handleNext = async () => {
    if (!validateStep(step)) return;
    setError('');

    let res;
    if (step === 1) {
      res = await saveCompanyProfile(companyData);
    } else if (step === 2) {
      res = await saveFirstSite(siteData);
    } else if (step === 3) {
      res = await saveFirstGuards(guardsData);
    } else if (step === 4) {
      res = await saveFirstRota(rotaData);
    } else if (step === 5) {
      res = await saveCompliance(complianceData);
    } else if (step === 6) {
      res = await finishSetup();
      if (res.error) {
        setFinishError(res.error.message || 'Failed to finalise setup');
        return;
      }
      callAgent(
        'setup_wizard',
        {
          client_id: companyId,
          user_id: profile?.id,
          company_name: companyData.name || company?.name,
          selected_plan: company?.subscription_plan || 'none',
          sites: [siteData.site_name].filter(Boolean),
          guards: guardsData.length,
          billing_status: company?.subscription_status || 'unknown',
          timestamp: new Date().toISOString(),
          source: 'guardianhub_web_app',
        },
        {
          clientId: companyId,
          userId: profile?.id,
          requestedPage: '/dashboard/setup-wizard',
          requestedFeature: 'setup_wizard',
        }
      ).then(() => {
        logWebhookEvent('setup_wizard', 'setup_wizard_completed', {
          company_name: companyData.name || company?.name,
          plan: company?.subscription_plan,
          sites_created: siteData.site_name ? 1 : 0,
          guards_created: guardsData.length,
        }, companyId);
      }).catch(() => {});
      setIsFinished(true);
      return;
    }

    if (res?.error) {
      setError(res.error.message || 'Failed to save');
      return;
    }

    setCompletedSteps((prev) => {
      const next = new Set(prev);
      next.add(step);
      return Array.from(next);
    });

    if (step < STEPS.length) {
      setStep((s) => s + 1);
    }
  };

  const handleBack = () => {
    if (step > 1) setStep((s) => s - 1);
    setError('');
  };

  const handleSkip = () => {
    if (step < STEPS.length) {
      setStep((s) => s + 1);
    } else {
      handleNext();
    }
  };

  const handleRestart = () => {
    setStep(1);
    setIsFinished(false);
    setCompletedSteps([]);
    setCompanyData(emptyCompany);
    setSiteData(emptySite);
    setGuardsData([{ first_name: '', last_name: '', email: '', phone: '', sia_licence: '', sia_expiry: '', role: 'Security Officer', hourly_rate: '', skills: [] }]);
    setRotaData(emptyRota);
    setComplianceData(emptyCompliance);
  };

  if (authLoading || wizardLoading) {
    return (
      <div className="min-h-screen bg-[#0b0f19] flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (isFinished) {
    return (
      <div className="min-h-screen bg-[#0b0f19] flex items-center justify-center px-4 py-10">
        <div className="w-full max-w-lg">
          <div className="text-center mb-8">
            <div className="w-14 h-14 bg-emerald-600 rounded-xl flex items-center justify-center mx-auto mb-4">
              <i className="ri-check-double-line text-white text-2xl" />
            </div>
            <h1 className="text-2xl font-bold text-white mb-1">Setup Complete</h1>
            <p className="text-gray-400 text-sm">
              {company?.name || 'Your company'} is ready. Taking you to your dashboard...
            </p>
          </div>
          <div className="bg-[#111827]/80 backdrop-blur-sm border border-white/10 rounded-xl p-6 animate-fadeSlide">
            {redirecting ? (
              <div className="flex flex-col items-center gap-4 py-6">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
                <p className="text-sm text-gray-400">Loading your dashboard...</p>
              </div>
            ) : (
              <FinishScreen
                companyName={company?.name || null}
                stepsCompleted={completedSteps.length}
                totalSteps={STEPS.length}
                onRestart={handleRestart}
              />
            )}
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
            <i className={`${currentStep.icon} text-white text-2xl`} />
          </div>
          <h1 className="text-2xl font-bold text-white mb-1">Setup Wizard</h1>
          <p className="text-gray-400 text-sm">
            {company?.name ? `Welcome, ${company.name}` : "Let's get your operation ready."}
          </p>
          <div className="mt-6">
            <StepIndicator steps={STEPS} currentStep={step} completedSteps={completedSteps} />
          </div>
        </div>

        {/* Step Card */}
        <div className="bg-[#111827]/80 backdrop-blur-sm border border-white/10 rounded-xl p-6 animate-fadeSlide" key={step}>
          <h2 className="text-lg font-semibold text-white mb-1">{currentStep.title}</h2>
          <p className="text-sm text-gray-400 mb-5">
            {step === 1 && 'Confirm your company profile and contact details.'}
            {step === 2 && 'Add your first site location and contact information.'}
            {step === 3 && 'Add your first security guards to the system.'}
            {step === 4 && 'Create your first shift rota.'}
            {step === 5 && 'Upload compliance documents (optional).'}
            {step === 6 && 'Review your setup and finish.'}
          </p>

          {(error || wizardError || finishError) && (
            <div className="mb-4 p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-red-400 text-sm flex items-start gap-2">
              <i className="ri-error-warning-line mt-0.5" />
              {error || wizardError || finishError}
            </div>
          )}

          {step === 1 && (
            <CompanyProfileStep
              data={companyData}
              onChange={setCompanyData}
              companyName={company?.name}
              companyEmail={company?.contact_email}
              companyPhone={company?.phone}
              companyAddress={company?.address}
            />
          )}

          {step === 2 && <FirstSiteStep data={siteData} onChange={setSiteData} />}

          {step === 3 && <FirstGuardsStep guards={guardsData} onChange={setGuardsData} />}

          {step === 4 && <FirstRotaStep data={rotaData} onChange={setRotaData} companyId={companyId} />}

          {step === 5 && <ComplianceStep data={complianceData} onChange={setComplianceData} />}

          {step === 6 && (
            <div className="space-y-4">
              <div className="p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-lg">
                <div className="flex items-center gap-2 text-emerald-400 text-sm font-medium mb-2">
                  <i className="ri-check-line" />
                  Ready to go live
                </div>
                <p className="text-sm text-gray-400">
                  Here's what you've configured for {company?.name || 'your company'}:
                </p>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between p-3 bg-white/5 rounded-lg border border-white/10">
                  <span className="text-sm text-gray-400">Company</span>
                  <span className="text-sm text-white font-medium">{companyData.name || company?.name || 'Not set'}</span>
                </div>
                <div className="flex items-center justify-between p-3 bg-white/5 rounded-lg border border-white/10">
                  <span className="text-sm text-gray-400">Contact</span>
                  <span className="text-sm text-white font-medium">{companyData.contact_person || 'Not set'}</span>
                </div>
                <div className="flex items-center justify-between p-3 bg-white/5 rounded-lg border border-white/10">
                  <span className="text-sm text-gray-400">Site</span>
                  <span className="text-sm text-white font-medium">{siteData.site_name || 'Not set'}</span>
                </div>
                <div className="flex items-center justify-between p-3 bg-white/5 rounded-lg border border-white/10">
                  <span className="text-sm text-gray-400">Guards</span>
                  <span className="text-sm text-white font-medium">{guardsData.length} added</span>
                </div>
                <div className="flex items-center justify-between p-3 bg-white/5 rounded-lg border border-white/10">
                  <span className="text-sm text-gray-400">Shift</span>
                  <span className="text-sm text-white font-medium">
                    {rotaData.shift_date ? `${rotaData.shift_date} ${rotaData.shift_start}–${rotaData.shift_end}` : 'Not set'}
                  </span>
                </div>
                <div className="flex items-center justify-between p-3 bg-white/5 rounded-lg border border-white/10">
                  <span className="text-sm text-gray-400">Documents</span>
                  <span className="text-sm text-white font-medium">
                    {[
                      complianceData.insurance_uploaded && 'Insurance',
                      complianceData.assignment_instructions_uploaded && 'Assignment',
                      complianceData.risk_assessment_uploaded && 'Risk',
                      complianceData.acs_evidence_uploaded && 'ACS',
                    ].filter(Boolean).join(', ') || 'None uploaded'}
                  </span>
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
                  disabled={saving}
                  className="text-gray-400 hover:text-white text-sm font-medium px-4 py-2.5 rounded-lg transition-colors cursor-pointer whitespace-nowrap flex items-center gap-2"
                >
                  <i className="ri-arrow-left-line" /> Back
                </button>
              )}
              {step < STEPS.length && (
                <button
                  onClick={handleSkip}
                  disabled={saving}
                  className="text-gray-500 hover:text-gray-400 text-sm font-medium px-4 py-2.5 rounded-lg transition-colors cursor-pointer whitespace-nowrap"
                >
                  Skip
                </button>
              )}
            </div>
            <button
              onClick={handleNext}
              disabled={saving}
              className="bg-blue-600 hover:bg-blue-500 text-white text-sm font-medium px-6 py-2.5 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer whitespace-nowrap flex items-center gap-2"
            >
              {saving ? (
                <>
                  <i className="ri-loader-4-line animate-spin" /> Saving...
                </>
              ) : step === STEPS.length ? (
                <>
                  Finish Setup <i className="ri-check-line" />
                </>
              ) : (
                <>
                  Next <i className="ri-arrow-right-line" />
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}