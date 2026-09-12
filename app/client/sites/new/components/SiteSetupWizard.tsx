'use client';

import { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/lib/auth';
import { useClientAuth } from '@/lib/useClientAuth';
import { useClientPortal } from '@/lib/useClientPortal';

const STEPS = [
  { key: 'basics', label: 'Site Basics' },
  { key: 'hours', label: 'Operating Hours' },
  { key: 'security', label: 'Security Needs' },
  { key: 'patrols', label: 'Patrol Setup' },
  { key: 'compliance', label: 'Compliance' },
  { key: 'modules', label: 'Dashboard' },
  { key: 'review', label: 'Review' },
];

const SITE_TYPES = [
  'Corporate Office',
  'Retail Store',
  'Shopping Centre',
  'Industrial Site',
  'Construction Site',
  'Warehouse',
  'Residential Complex',
  'Educational Campus',
  'Healthcare Facility',
  'Event Venue',
  'Data Centre',
  'Other',
];

const COUNTRY_LIST = [
  'United Kingdom',
  'Ireland',
  'United States',
  'Canada',
  'Australia',
  'New Zealand',
];

const DASHBOARD_MODULES = [
  { key: 'live_officers', label: 'Live Officers on Site', icon: 'ri-shield-user-line', desc: 'See who is currently on duty' },
  { key: 'rota_coverage', label: 'Rota / Shift Coverage', icon: 'ri-calendar-check-line', desc: 'View upcoming and current shifts' },
  { key: 'incidents', label: 'Incidents', icon: 'ri-alarm-warning-line', desc: 'Track incidents and severity' },
  { key: 'ob', label: 'Daily Occurrence Book', icon: 'ri-book-open-line', desc: 'Daily log entries from officers' },
  { key: 'patrols', label: 'Patrol Status', icon: 'ri-route-line', desc: 'Patrol completion and checkpoints' },
  { key: 'welfare', label: 'Welfare / Check Calls', icon: 'ri-heart-pulse-line', desc: 'Lone worker and wellbeing checks' },
  { key: 'tasks', label: 'Tasks', icon: 'ri-task-line', desc: 'Site-specific task tracking' },
  { key: 'documents', label: 'Site Documents', icon: 'ri-folder-line', desc: 'Risk assessments, procedures, files' },
  { key: 'reports', label: 'Reports', icon: 'ri-file-list-3-line', desc: 'Weekly and incident reports' },
  { key: 'compliance', label: 'Compliance Score', icon: 'ri-shield-check-line', desc: 'ACS and audit readiness' },
  { key: 'cctv', label: 'CCTV Logs', icon: 'ri-camera-line', desc: 'CCTV activity and footage log' },
  { key: 'visitors', label: 'Visitor Logs', icon: 'ri-user-received-line', desc: 'Visitor sign-in records' },
];

interface WizardData {
  site_name: string;
  site_type: string;
  address_line1: string;
  address_line2: string;
  town_city: string;
  county: string;
  postcode: string;
  country: string;
  primary_contact_name: string;
  primary_contact_phone: string;
  primary_contact_email: string;

  open_247: boolean;
  normal_opening: { mon_fri: string; saturday: string; sunday: string };
  high_risk_hours: string;
  weekend_coverage: boolean;
  holiday_coverage: boolean;

  guarding: boolean;
  patrols_required: boolean;
  cctv: boolean;
  keyholding: boolean;
  alarm_response: boolean;
  lone_worker: boolean;
  visitor_management: boolean;
  incident_reporting: boolean;

  patrols_enabled: boolean;
  patrol_frequency: string;
  checkpoint_count: string;
  gps_verification: boolean;
  photo_evidence: boolean;
  comments_required: boolean;

  risk_assessment: boolean;
  assignment_instructions: boolean;
  emergency_procedures: boolean;
  fire_procedure: boolean;
  site_induction: boolean;
  gdpr_sensitive: boolean;

  enabled_modules: string[];
}

const defaultWizardData: WizardData = {
  site_name: '',
  site_type: 'Corporate Office',
  address_line1: '',
  address_line2: '',
  town_city: '',
  county: '',
  postcode: '',
  country: 'United Kingdom',
  primary_contact_name: '',
  primary_contact_phone: '',
  primary_contact_email: '',

  open_247: false,
  normal_opening: { mon_fri: '09:00-17:00', saturday: '09:00-17:00', sunday: 'Closed' },
  high_risk_hours: '',
  weekend_coverage: false,
  holiday_coverage: false,

  guarding: true,
  patrols_required: true,
  cctv: false,
  keyholding: false,
  alarm_response: false,
  lone_worker: false,
  visitor_management: false,
  incident_reporting: true,

  patrols_enabled: true,
  patrol_frequency: '2',
  checkpoint_count: '5',
  gps_verification: true,
  photo_evidence: false,
  comments_required: true,

  risk_assessment: true,
  assignment_instructions: true,
  emergency_procedures: false,
  fire_procedure: false,
  site_induction: false,
  gdpr_sensitive: false,

  enabled_modules: ['live_officers', 'rota_coverage', 'incidents', 'ob', 'reports'],
};

export default function SiteSetupWizard() {
  const router = useRouter();
  const { profile, companyId } = useAuth();
  const { clientId } = useClientAuth();
  const { refresh } = useClientPortal();

  const [step, setStep] = useState(0);
  const [data, setData] = useState<WizardData>(defaultWizardData);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [createdSiteId, setCreatedSiteId] = useState<string | null>(null);
  const topRef = useRef<HTMLDivElement>(null);

  const update = (partial: Partial<WizardData>) => {
    setData((prev) => ({ ...prev, ...partial }));
    setErrors({});
  };

  const validateStep = (): boolean => {
    const errs: Record<string, string> = {};

    if (step === 0) {
      if (!data.site_name.trim()) errs.site_name = 'Site name is required';
      if (!data.address_line1.trim()) errs.address_line1 = 'Address is required';
      if (!data.town_city.trim()) errs.town_city = 'Town/City is required';
      if (!data.postcode.trim()) errs.postcode = 'Postcode is required';
      if (data.primary_contact_email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.primary_contact_email)) {
        errs.primary_contact_email = 'Enter a valid email';
      }
    }

    if (step === 3 && data.patrols_enabled) {
      if (!data.patrol_frequency.trim() || parseInt(data.patrol_frequency) < 1) errs.patrol_frequency = 'Enter a valid frequency';
      if (!data.checkpoint_count.trim() || parseInt(data.checkpoint_count) < 1) errs.checkpoint_count = 'Enter a valid number';
    }

    if (step === 5) {
      if (data.enabled_modules.length === 0) errs.enabled_modules = 'Select at least one dashboard module';
    }

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const nextStep = () => {
    if (validateStep()) {
      setStep((s) => Math.min(s + 1, STEPS.length - 1));
      topRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const prevStep = () => {
    setStep((s) => Math.max(s - 1, 0));
    topRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const goToStep = (idx: number) => {
    if (idx < step && validateStep()) {
      setStep(idx);
      topRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const buildAddress = () => {
    const parts = [data.address_line1, data.address_line2, data.town_city, data.county, data.postcode, data.country].filter(Boolean);
    return parts.join(', ');
  };

  const handleSubmit = async () => {
    if (!validateStep()) return;
    if (!clientId || !companyId || !profile?.id) {
      setSubmitError('You must be logged in as a client to create a site.');
      return;
    }

    setSubmitting(true);
    setSubmitError(null);

    const fullAddress = buildAddress();

    const patrolSettings = {
      patrols_enabled: data.patrols_enabled,
      patrol_frequency: parseInt(data.patrol_frequency) || 2,
      checkpoint_count: parseInt(data.checkpoint_count) || 0,
      gps_verification: data.gps_verification,
      photo_evidence: data.photo_evidence,
      comments_required: data.comments_required,
    };

    const securityRequirements = {
      guarding: data.guarding,
      patrols_required: data.patrols_required,
      cctv: data.cctv,
      keyholding: data.keyholding,
      alarm_response: data.alarm_response,
      lone_worker: data.lone_worker,
      visitor_management: data.visitor_management,
      incident_reporting: data.incident_reporting,
    };

    const complianceSettings = {
      risk_assessment: data.risk_assessment,
      assignment_instructions: data.assignment_instructions,
      emergency_procedures: data.emergency_procedures,
      fire_procedure: data.fire_procedure,
      site_induction: data.site_induction,
      gdpr_sensitive: data.gdpr_sensitive,
    };

    const operatingHours = {
      open_247: data.open_247,
      normal_opening: data.normal_opening,
      high_risk_hours: data.high_risk_hours || null,
      weekend_coverage: data.weekend_coverage,
      holiday_coverage: data.holiday_coverage,
    };

    const { data: newSite, error: insertError } = await supabase
      .from('sites')
      .insert({
        client_id: clientId,
        company_id: companyId,
        site_name: data.site_name.trim(),
        address: fullAddress,
        site_type: data.site_type,
        primary_contact_name: data.primary_contact_name.trim() || null,
        primary_contact_phone: data.primary_contact_phone.trim() || null,
        primary_contact_email: data.primary_contact_email.trim() || null,
        site_contact_name: data.primary_contact_name.trim() || null,
        site_contact_email: data.primary_contact_email.trim() || null,
        site_contact_phone: data.primary_contact_phone.trim() || null,
        operating_hours: operatingHours,
        security_requirements: securityRequirements,
        patrol_settings: patrolSettings,
        patrol_enabled: data.patrols_enabled,
        patrol_interval: parseInt(data.patrol_frequency) || 2,
        compliance_settings: complianceSettings,
        setup_completed: true,
        setup_completed_at: new Date().toISOString(),
        created_by: profile.id,
        risk_level: 'low',
      })
      .select('id')
      .single();

    if (insertError) {
      setSubmitError(insertError.message || 'Failed to create site.');
      setSubmitting(false);
      return;
    }

    const siteId = newSite?.id;
    if (!siteId) {
      setSubmitError('Site was created but could not retrieve its ID.');
      setSubmitting(false);
      return;
    }

    const { error: configError } = await supabase
      .from('site_dashboard_configs')
      .insert({
        site_id: siteId,
        client_id: clientId,
        company_id: companyId,
        enabled_modules: data.enabled_modules,
        setup_status: 'active',
        created_by: profile.id,
      });

    if (configError) {
      setSubmitError('Site created but dashboard configuration failed. Please contact support.');
      setSubmitting(false);
      return;
    }

    setCreatedSiteId(siteId);
    refresh();
    setSubmitting(false);
  };

  const moduleToggle = (key: string) => {
    setData((prev) => ({
      ...prev,
      enabled_modules: prev.enabled_modules.includes(key)
        ? prev.enabled_modules.filter((m) => m !== key)
        : [...prev.enabled_modules, key],
    }));
    setErrors({});
  };

  const inputClass = (field: string) =>
    `w-full bg-white/5 border ${errors[field] ? 'border-red-500/50' : 'border-white/10'} rounded-lg px-4 py-2.5 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-blue-500/50 transition-colors`;

  const labelClass = 'block text-xs font-medium text-gray-400 mb-1.5';
  const errorClass = 'text-xs text-red-400 mt-1';

  if (createdSiteId) {
    return (
      <div ref={topRef} className="max-w-2xl mx-auto">
        <div className="bg-[#0f172a]/70 backdrop-blur-sm border border-emerald-500/20 rounded-2xl p-10 text-center">
          <div className="w-20 h-20 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center mx-auto mb-6">
            <i className="ri-check-line text-3xl text-emerald-400"></i>
          </div>
          <h1 className="text-2xl font-semibold text-white mb-2">Site Created Successfully</h1>
          <p className="text-gray-400 mb-2">
            <span className="font-medium text-white">{data.site_name}</span> has been added to your dashboard.
          </p>
          <p className="text-sm text-gray-500 mb-8">
            {data.enabled_modules.length} dashboard module{data.enabled_modules.length !== 1 ? 's' : ''} configured
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <button
              onClick={() => router.push(`/client/sites/${createdSiteId}`)}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-500 text-white text-sm font-medium rounded-lg transition-colors cursor-pointer whitespace-nowrap"
            >
              <div className="w-4 h-4 flex items-center justify-center"><i className="ri-dashboard-line"></i></div>
              Open Site Dashboard
            </button>
            <button
              onClick={() => router.push('/client/sites')}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 bg-white/10 hover:bg-white/20 text-white text-sm font-medium rounded-lg transition-colors cursor-pointer whitespace-nowrap"
            >
              <div className="w-4 h-4 flex items-center justify-center"><i className="ri-building-line"></i></div>
              Back to Your Sites
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div ref={topRef} className="max-w-3xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-white">Add New Site</h1>
        <p className="text-gray-400 text-sm mt-1">Complete the steps below to set up a new site dashboard.</p>
      </div>

      <div className="bg-[#0f172a]/70 backdrop-blur-sm border border-white/10 rounded-xl p-1.5">
        <div className="flex items-center gap-1">
          {STEPS.map((s, i) => (
            <button
              key={s.key}
              onClick={() => goToStep(i)}
              className={`flex-1 flex items-center justify-center gap-1.5 px-2 py-2 rounded-lg text-xs font-medium transition-colors cursor-pointer whitespace-nowrap ${
                i === step
                  ? 'bg-blue-600 text-white'
                  : i < step
                  ? 'text-emerald-400 hover:bg-white/5'
                  : 'text-gray-500'
              }`}
            >
              <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold ${
                i < step ? 'bg-emerald-500/20 text-emerald-400' : i === step ? 'bg-white/20 text-white' : 'bg-white/5 text-gray-500'
              }`}>
                {i < step ? (
                  <i className="ri-check-line text-xs"></i>
                ) : (
                  i + 1
                )}
              </span>
              <span className="hidden sm:inline">{s.label}</span>
            </button>
          ))}
        </div>
      </div>

      <div className="bg-[#0f172a]/70 backdrop-blur-sm border border-white/10 rounded-2xl p-6 sm:p-8">
        {step === 0 && (
          <div className="space-y-5">
            <div>
              <h2 className="text-lg font-semibold text-white">Site Basics</h2>
              <p className="text-sm text-gray-400 mt-0.5">Tell us about the site location and primary contact.</p>
            </div>

            <div className="grid sm:grid-cols-2 gap-4">
              <div className="sm:col-span-2">
                <label className={labelClass}>Site Name *</label>
                <input
                  type="text"
                  value={data.site_name}
                  onChange={(e) => update({ site_name: e.target.value })}
                  placeholder="e.g. Manchester HQ"
                  className={inputClass('site_name')}
                />
                {errors.site_name && <p className={errorClass}>{errors.site_name}</p>}
              </div>

              <div>
                <label className={labelClass}>Site Type</label>
                <div className="relative">
                  <button
                    type="button"
                    className={`w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2.5 text-sm text-white text-left flex items-center justify-between cursor-pointer whitespace-nowrap`}
                    onClick={() => {
                      const currentIdx = SITE_TYPES.indexOf(data.site_type);
                      const nextIdx = (currentIdx + 1) % SITE_TYPES.length;
                      update({ site_type: SITE_TYPES[nextIdx] });
                    }}
                  >
                    <span>{data.site_type}</span>
                    <div className="w-4 h-4 flex items-center justify-center text-gray-400"><i className="ri-arrow-down-s-line"></i></div>
                  </button>
                </div>
              </div>

              <div>
                <label className={labelClass}>Country</label>
                <div className="relative">
                  <button
                    type="button"
                    className={`w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2.5 text-sm text-white text-left flex items-center justify-between cursor-pointer whitespace-nowrap`}
                    onClick={() => {
                      const currentIdx = COUNTRY_LIST.indexOf(data.country);
                      const nextIdx = (currentIdx + 1) % COUNTRY_LIST.length;
                      update({ country: COUNTRY_LIST[nextIdx] });
                    }}
                  >
                    <span>{data.country}</span>
                    <div className="w-4 h-4 flex items-center justify-center text-gray-400"><i className="ri-arrow-down-s-line"></i></div>
                  </button>
                </div>
              </div>

              <div className="sm:col-span-2">
                <label className={labelClass}>Address Line 1 *</label>
                <input
                  type="text"
                  value={data.address_line1}
                  onChange={(e) => update({ address_line1: e.target.value })}
                  placeholder="Street address"
                  className={inputClass('address_line1')}
                />
                {errors.address_line1 && <p className={errorClass}>{errors.address_line1}</p>}
              </div>

              <div className="sm:col-span-2">
                <label className={labelClass}>Address Line 2</label>
                <input
                  type="text"
                  value={data.address_line2}
                  onChange={(e) => update({ address_line2: e.target.value })}
                  placeholder="Floor, building, etc."
                  className={inputClass('address_line2')}
                />
              </div>

              <div>
                <label className={labelClass}>Town / City *</label>
                <input
                  type="text"
                  value={data.town_city}
                  onChange={(e) => update({ town_city: e.target.value })}
                  placeholder="e.g. Manchester"
                  className={inputClass('town_city')}
                />
                {errors.town_city && <p className={errorClass}>{errors.town_city}</p>}
              </div>

              <div>
                <label className={labelClass}>County</label>
                <input
                  type="text"
                  value={data.county}
                  onChange={(e) => update({ county: e.target.value })}
                  placeholder="e.g. Greater Manchester"
                  className={inputClass('county')}
                />
              </div>

              <div>
                <label className={labelClass}>Postcode *</label>
                <input
                  type="text"
                  value={data.postcode}
                  onChange={(e) => update({ postcode: e.target.value })}
                  placeholder="e.g. M1 1AA"
                  className={inputClass('postcode')}
                />
                {errors.postcode && <p className={errorClass}>{errors.postcode}</p>}
              </div>
            </div>

            <div className="border-t border-white/10 pt-5">
              <h3 className="text-sm font-semibold text-white mb-3">Primary Contact</h3>
              <div className="grid sm:grid-cols-3 gap-4">
                <div>
                  <label className={labelClass}>Contact Name</label>
                  <input
                    type="text"
                    value={data.primary_contact_name}
                    onChange={(e) => update({ primary_contact_name: e.target.value })}
                    placeholder="Full name"
                    className={inputClass('primary_contact_name')}
                  />
                </div>
                <div>
                  <label className={labelClass}>Contact Phone</label>
                  <input
                    type="tel"
                    value={data.primary_contact_phone}
                    onChange={(e) => update({ primary_contact_phone: e.target.value })}
                    placeholder="Phone number"
                    className={inputClass('primary_contact_phone')}
                  />
                </div>
                <div>
                  <label className={labelClass}>Contact Email</label>
                  <input
                    type="email"
                    value={data.primary_contact_email}
                    onChange={(e) => update({ primary_contact_email: e.target.value })}
                    placeholder="email@example.com"
                    className={inputClass('primary_contact_email')}
                  />
                  {errors.primary_contact_email && <p className={errorClass}>{errors.primary_contact_email}</p>}
                </div>
              </div>
            </div>
          </div>
        )}

        {step === 1 && (
          <div className="space-y-5">
            <div>
              <h2 className="text-lg font-semibold text-white">Operating Hours</h2>
              <p className="text-sm text-gray-400 mt-0.5">When does this site operate and when is security cover needed?</p>
            </div>

            <label className="flex items-center gap-3 p-4 bg-white/5 rounded-xl border border-white/10 cursor-pointer hover:border-blue-500/30 transition-colors">
              <input
                type="checkbox"
                checked={data.open_247}
                onChange={(e) => update({ open_247: e.target.checked })}
                className="w-4 h-4 rounded border-white/20 bg-white/5 accent-blue-500 cursor-pointer"
              />
              <div>
                <p className="text-sm font-medium text-white">Open 24/7</p>
                <p className="text-xs text-gray-500">Site operates around the clock, every day</p>
              </div>
            </label>

            {!data.open_247 && (
              <div className="space-y-4">
                <h3 className="text-sm font-medium text-white">Normal Opening Hours</h3>
                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <label className={labelClass}>Monday – Friday</label>
                    <input
                      type="text"
                      value={data.normal_opening.mon_fri}
                      onChange={(e) => update({ normal_opening: { ...data.normal_opening, mon_fri: e.target.value } })}
                      placeholder="e.g. 09:00–17:00"
                      className={inputClass('')}
                    />
                  </div>
                  <div>
                    <label className={labelClass}>Saturday</label>
                    <input
                      type="text"
                      value={data.normal_opening.saturday}
                      onChange={(e) => update({ normal_opening: { ...data.normal_opening, saturday: e.target.value } })}
                      placeholder="e.g. 09:00–17:00"
                      className={inputClass('')}
                    />
                  </div>
                  <div>
                    <label className={labelClass}>Sunday</label>
                    <input
                      type="text"
                      value={data.normal_opening.sunday}
                      onChange={(e) => update({ normal_opening: { ...data.normal_opening, sunday: e.target.value } })}
                      placeholder="e.g. Closed"
                      className={inputClass('')}
                    />
                  </div>
                </div>
              </div>
            )}

            <div>
              <label className={labelClass}>High-Risk Hours</label>
              <input
                type="text"
                value={data.high_risk_hours}
                onChange={(e) => update({ high_risk_hours: e.target.value })}
                placeholder="e.g. 22:00–06:00 or leave blank"
                className={inputClass('')}
              />
              <p className="text-xs text-gray-500 mt-1">Times when additional security attention is needed</p>
            </div>

            <div className="space-y-3 border-t border-white/10 pt-5">
              <label className="flex items-center gap-3 p-4 bg-white/5 rounded-xl border border-white/10 cursor-pointer hover:border-blue-500/30 transition-colors">
                <input
                  type="checkbox"
                  checked={data.weekend_coverage}
                  onChange={(e) => update({ weekend_coverage: e.target.checked })}
                  className="w-4 h-4 rounded border-white/20 bg-white/5 accent-blue-500 cursor-pointer"
                />
                <div>
                  <p className="text-sm font-medium text-white">Weekend coverage needed</p>
                  <p className="text-xs text-gray-500">Security cover required on Saturdays and Sundays</p>
                </div>
              </label>

              <label className="flex items-center gap-3 p-4 bg-white/5 rounded-xl border border-white/10 cursor-pointer hover:border-blue-500/30 transition-colors">
                <input
                  type="checkbox"
                  checked={data.holiday_coverage}
                  onChange={(e) => update({ holiday_coverage: e.target.checked })}
                  className="w-4 h-4 rounded border-white/20 bg-white/5 accent-blue-500 cursor-pointer"
                />
                <div>
                  <p className="text-sm font-medium text-white">Public holiday coverage needed</p>
                  <p className="text-xs text-gray-500">Security cover required on bank holidays</p>
                </div>
              </label>
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-5">
            <div>
              <h2 className="text-lg font-semibold text-white">Security Requirements</h2>
              <p className="text-sm text-gray-400 mt-0.5">Select the security services needed at this site.</p>
            </div>

            <div className="space-y-3">
              {[
                { key: 'guarding', label: 'Guarding Required', icon: 'ri-shield-user-line', desc: 'Physical security officer presence on site' },
                { key: 'patrols_required', label: 'Patrols Required', icon: 'ri-route-line', desc: 'Scheduled internal or external patrols' },
                { key: 'cctv', label: 'CCTV Monitoring Required', icon: 'ri-camera-line', desc: 'CCTV review or active monitoring' },
                { key: 'keyholding', label: 'Keyholding Required', icon: 'ri-key-2-line', desc: 'Key holding and alarm response services' },
                { key: 'alarm_response', label: 'Alarm Response Required', icon: 'ri-alert-line', desc: 'Response to site alarm activations' },
                { key: 'lone_worker', label: 'Lone Worker Checks Required', icon: 'ri-heart-pulse-line', desc: 'Regular welfare checks for lone workers' },
                { key: 'visitor_management', label: 'Visitor Management Required', icon: 'ri-user-received-line', desc: 'Sign-in and management of site visitors' },
                { key: 'incident_reporting', label: 'Incident Reporting Required', icon: 'ri-alarm-warning-line', desc: 'Formal incident logging and reporting' },
              ].map(({ key, label, icon, desc }) => (
                <label key={key} className="flex items-center gap-3 p-4 bg-white/5 rounded-xl border border-white/10 cursor-pointer hover:border-blue-500/30 transition-colors">
                  <input
                    type="checkbox"
                    checked={(data as any)[key] === true}
                    onChange={(e) => update({ [key]: e.target.checked } as Partial<WizardData>)}
                    className="w-4 h-4 rounded border-white/20 bg-white/5 accent-blue-500 cursor-pointer"
                  />
                  <div className="w-8 h-8 flex items-center justify-center bg-white/5 rounded-lg flex-shrink-0">
                    <i className={`${icon} text-gray-400 text-sm`}></i>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-white">{label}</p>
                    <p className="text-xs text-gray-500">{desc}</p>
                  </div>
                </label>
              ))}
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="space-y-5">
            <div>
              <h2 className="text-lg font-semibold text-white">Patrol Setup</h2>
              <p className="text-sm text-gray-400 mt-0.5">Configure how patrols should work for this site.</p>
            </div>

            <label className="flex items-center gap-3 p-4 bg-white/5 rounded-xl border border-white/10 cursor-pointer hover:border-blue-500/30 transition-colors">
              <input
                type="checkbox"
                checked={data.patrols_enabled}
                onChange={(e) => update({ patrols_enabled: e.target.checked })}
                className="w-4 h-4 rounded border-white/20 bg-white/5 accent-blue-500 cursor-pointer"
              />
              <div>
                <p className="text-sm font-medium text-white">Enable Patrols</p>
                <p className="text-xs text-gray-500">Guards will perform scheduled patrols at this site</p>
              </div>
            </label>

            {data.patrols_enabled && (
              <div className="space-y-4 border-t border-white/10 pt-5">
                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <label className={labelClass}>Patrol Frequency (hours) *</label>
                    <input
                      type="number"
                      min="1"
                      max="12"
                      value={data.patrol_frequency}
                      onChange={(e) => update({ patrol_frequency: e.target.value })}
                      className={inputClass('patrol_frequency')}
                    />
                    {errors.patrol_frequency && <p className={errorClass}>{errors.patrol_frequency}</p>}
                    <p className="text-xs text-gray-500 mt-1">How often a patrol should be completed</p>
                  </div>
                  <div>
                    <label className={labelClass}>Number of Checkpoints *</label>
                    <input
                      type="number"
                      min="1"
                      max="50"
                      value={data.checkpoint_count}
                      onChange={(e) => update({ checkpoint_count: e.target.value })}
                      className={inputClass('checkpoint_count')}
                    />
                    {errors.checkpoint_count && <p className={errorClass}>{errors.checkpoint_count}</p>}
                    <p className="text-xs text-gray-500 mt-1">How many checkpoints on each patrol route</p>
                  </div>
                </div>

                <div className="space-y-3 pt-2">
                  <label className="flex items-center gap-3 p-3 bg-white/5 rounded-xl border border-white/10 cursor-pointer hover:border-blue-500/30 transition-colors">
                    <input
                      type="checkbox"
                      checked={data.gps_verification}
                      onChange={(e) => update({ gps_verification: e.target.checked })}
                      className="w-4 h-4 rounded border-white/20 bg-white/5 accent-blue-500 cursor-pointer"
                    />
                    <div>
                      <p className="text-sm font-medium text-white">GPS verification required</p>
                      <p className="text-xs text-gray-500">Confirm guard location at each checkpoint</p>
                    </div>
                  </label>

                  <label className="flex items-center gap-3 p-3 bg-white/5 rounded-xl border border-white/10 cursor-pointer hover:border-blue-500/30 transition-colors">
                    <input
                      type="checkbox"
                      checked={data.photo_evidence}
                      onChange={(e) => update({ photo_evidence: e.target.checked })}
                      className="w-4 h-4 rounded border-white/20 bg-white/5 accent-blue-500 cursor-pointer"
                    />
                    <div>
                      <p className="text-sm font-medium text-white">Photo evidence required</p>
                      <p className="text-xs text-gray-500">Guards must upload a photo at each checkpoint</p>
                    </div>
                  </label>

                  <label className="flex items-center gap-3 p-3 bg-white/5 rounded-xl border border-white/10 cursor-pointer hover:border-blue-500/30 transition-colors">
                    <input
                      type="checkbox"
                      checked={data.comments_required}
                      onChange={(e) => update({ comments_required: e.target.checked })}
                      className="w-4 h-4 rounded border-white/20 bg-white/5 accent-blue-500 cursor-pointer"
                    />
                    <div>
                      <p className="text-sm font-medium text-white">Comments required</p>
                      <p className="text-xs text-gray-500">Guards must leave a comment after each patrol</p>
                    </div>
                  </label>
                </div>
              </div>
            )}
          </div>
        )}

        {step === 4 && (
          <div className="space-y-5">
            <div>
              <h2 className="text-lg font-semibold text-white">Compliance &amp; Documents</h2>
              <p className="text-sm text-gray-400 mt-0.5">Specify what compliance documents and procedures are needed.</p>
            </div>

            <div className="space-y-3">
              {[
                { key: 'risk_assessment', label: 'Site Risk Assessment Required', icon: 'ri-file-warning-line', desc: 'Formal risk assessment to be completed and uploaded' },
                { key: 'assignment_instructions', label: 'Assignment Instructions Required', icon: 'ri-file-text-line', desc: 'Detailed guard assignment instructions for this site' },
                { key: 'emergency_procedures', label: 'Emergency Procedures Uploaded', icon: 'ri-alert-line', desc: 'Emergency response and evacuation procedures' },
                { key: 'fire_procedure', label: 'Fire Procedure Uploaded', icon: 'ri-fire-line', desc: 'Fire safety and evacuation procedure document' },
                { key: 'site_induction', label: 'Site Induction Required', icon: 'ri-clipboard-line', desc: 'Guards must complete a site induction before starting' },
                { key: 'gdpr_sensitive', label: 'GDPR / Data-Sensitive Site', icon: 'ri-lock-line', desc: 'Site handles sensitive data requiring GDPR compliance' },
              ].map(({ key, label, icon, desc }) => (
                <label key={key} className="flex items-center gap-3 p-4 bg-white/5 rounded-xl border border-white/10 cursor-pointer hover:border-blue-500/30 transition-colors">
                  <input
                    type="checkbox"
                    checked={(data as any)[key] === true}
                    onChange={(e) => update({ [key]: e.target.checked } as Partial<WizardData>)}
                    className="w-4 h-4 rounded border-white/20 bg-white/5 accent-blue-500 cursor-pointer"
                  />
                  <div className="w-8 h-8 flex items-center justify-center bg-white/5 rounded-lg flex-shrink-0">
                    <i className={`${icon} text-gray-400 text-sm`}></i>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-white">{label}</p>
                    <p className="text-xs text-gray-500">{desc}</p>
                  </div>
                </label>
              ))}
            </div>
          </div>
        )}

        {step === 5 && (
          <div className="space-y-5">
            <div>
              <h2 className="text-lg font-semibold text-white">Dashboard Modules</h2>
              <p className="text-sm text-gray-400 mt-0.5">Choose which widgets appear on the site dashboard. You can change these later.</p>
            </div>
            {errors.enabled_modules && <p className="text-sm text-red-400 bg-red-500/10 rounded-lg p-3">{errors.enabled_modules}</p>}

            <div className="grid sm:grid-cols-2 gap-3">
              {DASHBOARD_MODULES.map((mod) => {
                const isEnabled = data.enabled_modules.includes(mod.key);
                return (
                  <button
                    key={mod.key}
                    onClick={() => moduleToggle(mod.key)}
                    className={`flex items-start gap-3 p-4 rounded-xl border text-left transition-colors cursor-pointer ${
                      isEnabled
                        ? 'bg-blue-500/10 border-blue-500/30'
                        : 'bg-white/5 border-white/10 hover:border-white/20'
                    }`}
                  >
                    <div className={`w-8 h-8 flex items-center justify-center rounded-lg flex-shrink-0 ${
                      isEnabled ? 'bg-blue-500/20' : 'bg-white/5'
                    }`}>
                      <i className={`${mod.icon} text-sm ${isEnabled ? 'text-blue-400' : 'text-gray-500'}`}></i>
                    </div>
                    <div>
                      <p className={`text-sm font-medium ${isEnabled ? 'text-white' : 'text-gray-400'}`}>{mod.label}</p>
                      <p className="text-xs text-gray-500 mt-0.5">{mod.desc}</p>
                    </div>
                    {isEnabled && (
                      <div className="ml-auto w-5 h-5 flex items-center justify-center flex-shrink-0">
                        <i className="ri-checkbox-circle-fill text-blue-400 text-sm"></i>
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {step === 6 && (
          <div className="space-y-5">
            <div>
              <h2 className="text-lg font-semibold text-white">Review &amp; Create</h2>
              <p className="text-sm text-gray-400 mt-0.5">Review all information before creating the site dashboard.</p>
            </div>

            {submitError && (
              <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-4 text-sm text-red-400">
                <div className="flex items-center gap-2 mb-1">
                  <div className="w-4 h-4 flex items-center justify-center"><i className="ri-error-warning-line"></i></div>
                  <span className="font-medium">Error</span>
                </div>
                {submitError}
              </div>
            )}

            <div className="space-y-3">
              <div className="bg-white/5 rounded-xl p-4 border border-white/10">
                <h3 className="text-sm font-semibold text-white mb-2 flex items-center gap-2">
                  <div className="w-5 h-5 flex items-center justify-center text-blue-400"><i className="ri-building-line text-sm"></i></div>
                  Site Information
                </h3>
                <div className="grid sm:grid-cols-2 gap-x-6 gap-y-2 text-sm">
                  <div><span className="text-gray-500">Name:</span> <span className="text-white ml-1">{data.site_name}</span></div>
                  <div><span className="text-gray-500">Type:</span> <span className="text-white ml-1">{data.site_type}</span></div>
                  <div className="sm:col-span-2"><span className="text-gray-500">Address:</span> <span className="text-white ml-1">{buildAddress()}</span></div>
                  {data.primary_contact_name && (
                    <div className="sm:col-span-2"><span className="text-gray-500">Contact:</span> <span className="text-white ml-1">{data.primary_contact_name}{data.primary_contact_phone ? ` — ${data.primary_contact_phone}` : ''}{data.primary_contact_email ? ` — ${data.primary_contact_email}` : ''}</span></div>
                  )}
                </div>
              </div>

              <div className="bg-white/5 rounded-xl p-4 border border-white/10">
                <h3 className="text-sm font-semibold text-white mb-2 flex items-center gap-2">
                  <div className="w-5 h-5 flex items-center justify-center text-emerald-400"><i className="ri-time-line text-sm"></i></div>
                  Operating Hours
                </h3>
                <div className="text-sm text-gray-400">
                  {data.open_247 ? 'Open 24/7' : (
                    <span>Mon–Fri: {data.normal_opening.mon_fri} · Sat: {data.normal_opening.saturday} · Sun: {data.normal_opening.sunday}</span>
                  )}
                  {data.high_risk_hours && <span className="block text-amber-400 mt-0.5">High-risk: {data.high_risk_hours}</span>}
                  {data.weekend_coverage && <span className="block text-gray-300 mt-0.5">Weekend coverage</span>}
                  {data.holiday_coverage && <span className="block text-gray-300 mt-0.5">Holiday coverage</span>}
                </div>
              </div>

              <div className="bg-white/5 rounded-xl p-4 border border-white/10">
                <h3 className="text-sm font-semibold text-white mb-2 flex items-center gap-2">
                  <div className="w-5 h-5 flex items-center justify-center text-amber-400"><i className="ri-shield-check-line text-sm"></i></div>
                  Security Requirements
                </h3>
                <div className="flex flex-wrap gap-2">
                  {data.guarding && <span className="text-xs px-2.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">Guarding</span>}
                  {data.patrols_required && <span className="text-xs px-2.5 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400">Patrols</span>}
                  {data.cctv && <span className="text-xs px-2.5 py-1 rounded-full bg-purple-500/10 border border-purple-500/20 text-purple-400">CCTV</span>}
                  {data.keyholding && <span className="text-xs px-2.5 py-1 rounded-full bg-orange-500/10 border border-orange-500/20 text-orange-400">Keyholding</span>}
                  {data.alarm_response && <span className="text-xs px-2.5 py-1 rounded-full bg-red-500/10 border border-red-500/20 text-red-400">Alarm Response</span>}
                  {data.lone_worker && <span className="text-xs px-2.5 py-1 rounded-full bg-pink-500/10 border border-pink-500/20 text-pink-400">Lone Worker</span>}
                  {data.visitor_management && <span className="text-xs px-2.5 py-1 rounded-full bg-teal-500/10 border border-teal-500/20 text-teal-400">Visitors</span>}
                  {data.incident_reporting && <span className="text-xs px-2.5 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-400">Incidents</span>}
                </div>
              </div>

              {data.patrols_enabled && (
                <div className="bg-white/5 rounded-xl p-4 border border-white/10">
                  <h3 className="text-sm font-semibold text-white mb-2 flex items-center gap-2">
                    <div className="w-5 h-5 flex items-center justify-center text-blue-400"><i className="ri-route-line text-sm"></i></div>
                    Patrol Configuration
                  </h3>
                  <div className="text-sm text-gray-400 space-y-1">
                    <p>Every {data.patrol_frequency}h · {data.checkpoint_count} checkpoints</p>
                    <div className="flex flex-wrap gap-2 mt-1">
                      {data.gps_verification && <span className="text-xs px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400">GPS</span>}
                      {data.photo_evidence && <span className="text-xs px-2 py-0.5 rounded bg-blue-500/10 text-blue-400">Photos</span>}
                      {data.comments_required && <span className="text-xs px-2 py-0.5 rounded bg-purple-500/10 text-purple-400">Comments</span>}
                    </div>
                  </div>
                </div>
              )}

              <div className="bg-white/5 rounded-xl p-4 border border-white/10">
                <h3 className="text-sm font-semibold text-white mb-2 flex items-center gap-2">
                  <div className="w-5 h-5 flex items-center justify-center text-purple-400"><i className="ri-layout-grid-line text-sm"></i></div>
                  Dashboard Modules ({data.enabled_modules.length})
                </h3>
                <div className="flex flex-wrap gap-2">
                  {data.enabled_modules.map((key) => {
                    const mod = DASHBOARD_MODULES.find((m) => m.key === key);
                    return (
                      <span key={key} className="text-xs px-2.5 py-1 rounded-full bg-white/10 border border-white/10 text-gray-300">
                        {mod?.label || key}
                      </span>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        )}

        <div className="flex items-center justify-between pt-6 border-t border-white/10 mt-6">
          <div>
            {step > 0 && (
              <button
                onClick={prevStep}
                className="inline-flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-gray-400 hover:text-white bg-white/5 hover:bg-white/10 rounded-lg transition-colors cursor-pointer whitespace-nowrap"
              >
                <div className="w-4 h-4 flex items-center justify-center"><i className="ri-arrow-left-line"></i></div>
                Back
              </button>
            )}
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs text-gray-500">
              Step {step + 1} of {STEPS.length}
            </span>
            {step < STEPS.length - 1 ? (
              <button
                onClick={nextStep}
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-500 text-white text-sm font-medium rounded-lg transition-colors cursor-pointer whitespace-nowrap"
              >
                Next
                <div className="w-4 h-4 flex items-center justify-center"><i className="ri-arrow-right-line"></i></div>
              </button>
            ) : (
              <button
                onClick={handleSubmit}
                disabled={submitting}
                className="inline-flex items-center gap-2 px-6 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white text-sm font-medium rounded-lg transition-colors cursor-pointer whitespace-nowrap disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {submitting ? (
                  <>
                    <div className="w-4 h-4 flex items-center justify-center"><i className="ri-loader-4-line animate-spin"></i></div>
                    Creating...
                  </>
                ) : (
                  <>
                    <div className="w-4 h-4 flex items-center justify-center"><i className="ri-check-line"></i></div>
                    Create Site Dashboard
                  </>
                )}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}