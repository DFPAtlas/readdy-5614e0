'use client';

import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/lib/auth';

export interface CompanyFormData {
  name: string;
  contact_person: string;
  phone: string;
  email: string;
  address: string;
  logo_url?: string;
}

export interface SiteFormData {
  site_name: string;
  address: string;
  client_contact_name: string;
  client_contact_phone: string;
  emergency_contact: string;
  site_instructions: string;
  risk_level: string;
  check_call_interval: number;
}

export interface GuardFormData {
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  sia_licence: string;
  sia_expiry: string;
  role: string;
  hourly_rate: string;
  skills: string[];
}

export interface RotaFormData {
  site_id: string;
  guard_id: string;
  shift_date: string;
  shift_start: string;
  shift_end: string;
  notes: string;
}

export interface ComplianceFormData {
  insurance_file?: File;
  assignment_instructions_file?: File;
  risk_assessment_file?: File;
  acs_evidence_file?: File;
  insurance_uploaded: boolean;
  assignment_instructions_uploaded: boolean;
  risk_assessment_uploaded: boolean;
  acs_evidence_uploaded: boolean;
  insurance_name: string;
  assignment_instructions_name: string;
  risk_assessment_name: string;
  acs_evidence_name: string;
}

export interface SetupProgress {
  id: string;
  company_id: string;
  current_step: number;
  company_data: CompanyFormData;
  site_data: SiteFormData;
  guards_data: GuardFormData[];
  rota_data: RotaFormData;
  compliance_data: ComplianceFormData;
  is_completed: boolean;
  completed_at: string | null;
  updated_at: string;
}

export function useSetupWizard() {
  const { profile, company, companyId } = useAuth();
  const [progress, setProgress] = useState<SetupProgress | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const loadProgress = useCallback(async () => {
    if (!companyId) {
      setLoading(false);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const { data, error: err } = await supabase
        .from('company_setup_progress')
        .select('*')
        .eq('company_id', companyId)
        .maybeSingle();
      if (err) {
        setError(err.message);
      } else if (data) {
        setProgress(data as SetupProgress);
      } else {
        setProgress(null);
      }
    } catch (e: any) {
      setError(e?.message || 'Failed to load setup progress');
      setProgress(null);
    }
    setLoading(false);
  }, [companyId]);

  useEffect(() => {
    if (!companyId) {
      setLoading(false);
      return;
    }
    loadProgress();
  }, [companyId, loadProgress]);

  const saveProgress = useCallback(
    async (step: number, data: Partial<SetupProgress>) => {
      if (!companyId) return { error: new Error('No company') };
      setSaving(true);
      try {
        const payload: any = {
          current_step: step,
          ...data,
        };
        if (progress?.id) {
          const { data: updated, error: err } = await supabase
            .from('company_setup_progress')
            .update(payload)
            .eq('id', progress.id)
            .select()
            .maybeSingle();
          if (err || !updated) {
            setSaving(false);
            return { error: err || new Error('Failed to update progress') };
          }
          setProgress(updated as SetupProgress);
        } else {
          const { data: created, error: err } = await supabase
            .from('company_setup_progress')
            .insert({ company_id: companyId, ...payload })
            .select()
            .maybeSingle();
          if (err || !created) {
            setSaving(false);
            return { error: err || new Error('Failed to create progress') };
          }
          setProgress(created as SetupProgress);
        }
      } catch (e: any) {
        setSaving(false);
        return { error: e || new Error('Unexpected error saving progress') };
      }
      setSaving(false);
      return { error: null };
    },
    [companyId, progress]
  );

  const saveCompanyProfile = useCallback(
    async (formData: CompanyFormData) => {
      if (!companyId) return { error: new Error('No company') };
      setSaving(true);
      try {
        const { error: err } = await supabase.from('companies').update({
          name: formData.name.trim(),
          contact_email: formData.email.trim(),
          phone: formData.phone.trim() || null,
          address: formData.address.trim() || null,
        }).eq('id', companyId);
        if (err) {
          setSaving(false);
          return { error: err };
        }
        const res = await saveProgress(1, { company_data: formData as any });
        setSaving(false);
        return res;
      } catch (e: any) {
        setSaving(false);
        return { error: e || new Error('Failed to save company profile') };
      }
    },
    [companyId, saveProgress]
  );

  const saveFirstSite = useCallback(
    async (formData: SiteFormData) => {
      if (!companyId) return { error: new Error('No company') };
      setSaving(true);
      try {
        const { data: site, error: err } = await supabase.from('sites').insert({
          company_id: companyId,
          site_name: formData.site_name.trim(),
          address: formData.address.trim(),
          site_contact_name: formData.client_contact_name.trim() || null,
          site_contact_phone: formData.client_contact_phone.trim() || null,
          emergency_contact: formData.emergency_contact.trim() || null,
          assignment_instructions: formData.site_instructions.trim() || null,
          risk_level: formData.risk_level,
          check_call_interval: formData.check_call_interval,
        }).select('id').maybeSingle();
        if (err || !site) {
          setSaving(false);
          return { error: err || new Error('Failed to create site') };
        }
        await saveProgress(2, { site_data: { ...formData, id: site.id } as any });
        setSaving(false);
        return { error: null, siteId: site.id };
      } catch (e: any) {
        setSaving(false);
        return { error: e || new Error('Failed to save site') };
      }
    },
    [companyId, saveProgress]
  );

  const saveFirstGuards = useCallback(
    async (guards: GuardFormData[]) => {
      if (!companyId) return { error: new Error('No company') };
      setSaving(true);
      try {
        const inserts = guards.map((g) => ({
          company_id: companyId,
          first_name: g.first_name.trim(),
          last_name: g.last_name.trim(),
          email: g.email.trim(),
          phone: g.phone.trim() || null,
          sia_licence: g.sia_licence.trim() || null,
          sia_expiry: g.sia_expiry || null,
          status: 'active',
          skills: g.skills,
          hourly_rate: parseFloat(g.hourly_rate) || 0,
        }));
        const { data: created, error: err } = await supabase.from('guards').insert(inserts).select('id');
        if (err) {
          setSaving(false);
          return { error: err };
        }
        await saveProgress(3, {
          guards_data: guards.map((g, i) => ({ ...g, id: created?.[i]?.id })) as any,
        });
        setSaving(false);
        return { error: null, guardIds: created?.map((g) => g.id) || [] };
      } catch (e: any) {
        setSaving(false);
        return { error: e || new Error('Failed to save guards') };
      }
    },
    [companyId, saveProgress]
  );

  const saveFirstRota = useCallback(
    async (formData: RotaFormData) => {
      if (!companyId) return { error: new Error('No company') };
      setSaving(true);
      try {
        const { error: err } = await supabase.from('shifts').insert({
          company_id: companyId,
          site_id: formData.site_id,
          guard_id: formData.guard_id,
          start_time: new Date(`${formData.shift_date}T${formData.shift_start}`).toISOString(),
          end_time: new Date(`${formData.shift_date}T${formData.shift_end}`).toISOString(),
          status: 'scheduled',
          notes: formData.notes.trim() || null,
        });
        if (err) {
          setSaving(false);
          return { error: err };
        }
        const res = await saveProgress(4, { rota_data: formData as any });
        setSaving(false);
        return res;
      } catch (e: any) {
        setSaving(false);
        return { error: e || new Error('Failed to save rota') };
      }
    },
    [companyId, saveProgress]
  );

  const saveCompliance = useCallback(
    async (formData: ComplianceFormData) => {
      if (!companyId) return { error: new Error('No company') };
      setSaving(true);
      try {
        const uploads: any[] = [];
        const bucket = 'compliance-documents';
        if (formData.insurance_file) {
          const path = `${companyId}/insurance-${Date.now()}-${formData.insurance_file.name}`;
          uploads.push(supabase.storage.from(bucket).upload(path, formData.insurance_file));
        }
        if (formData.assignment_instructions_file) {
          const path = `${companyId}/assignment-${Date.now()}-${formData.assignment_instructions_file.name}`;
          uploads.push(supabase.storage.from(bucket).upload(path, formData.assignment_instructions_file));
        }
        if (formData.risk_assessment_file) {
          const path = `${companyId}/risk-${Date.now()}-${formData.risk_assessment_file.name}`;
          uploads.push(supabase.storage.from(bucket).upload(path, formData.risk_assessment_file));
        }
        if (formData.acs_evidence_file) {
          const path = `${companyId}/acs-${Date.now()}-${formData.acs_evidence_file.name}`;
          uploads.push(supabase.storage.from(bucket).upload(path, formData.acs_evidence_file));
        }
        await Promise.all(uploads);
        const res = await saveProgress(5, { compliance_data: formData as any });
        setSaving(false);
        return res;
      } catch (e: any) {
        setSaving(false);
        return { error: e || new Error('Failed to save compliance data') };
      }
    },
    [companyId, saveProgress]
  );

  const finishSetup = useCallback(async () => {
    if (!companyId) return { error: new Error('No company') };
    setSaving(true);

    try {
      const { data: existingSites } = await supabase
        .from('sites')
        .select('id')
        .eq('company_id', companyId)
        .limit(1);

      if (!existingSites || existingSites.length === 0) {
        const { error: siteErr } = await supabase.from('sites').insert({
          company_id: companyId,
          site_name: 'Default Site',
          address: company?.address || '',
          risk_level: 'medium',
          check_call_interval: 60,
        });
        if (siteErr) {
          console.warn('Failed to create default site during setup:', siteErr.message);
        }
      }

      const { error: err } = await supabase.from('companies').update({
        onboarding_status: 'completed',
        account_status: company?.account_status === 'trial' ? 'trial' : (company?.account_status || 'active'),
      }).eq('id', companyId);

      if (err) {
        setSaving(false);
        return { error: err };
      }

      const { data: existingModules } = await supabase
        .from('company_enabled_modules')
        .select('module_id')
        .eq('company_id', companyId);

      const existingIds = new Set((existingModules || []).map((m: any) => m.module_id));

      const { data: allModules } = await supabase
        .from('modules')
        .select('id')
        .eq('is_enabled', true);

      const newModules = (allModules || [])
        .filter((m: any) => !existingIds.has(m.id))
        .map((m: any) => ({
          company_id: companyId,
          module_id: m.id,
          enabled: true,
          enabled_at: new Date().toISOString(),
        }));

      if (newModules.length > 0) {
        await supabase.from('company_enabled_modules').insert(newModules);
      }

      const { data: existingPrefs } = await supabase
        .from('notification_preferences')
        .select('id')
        .eq('company_id', companyId)
        .limit(1);

      if (!existingPrefs || existingPrefs.length === 0) {
        await supabase.from('notification_preferences').insert({
          company_id: companyId,
          email_alerts: true,
          sms_alerts: false,
          push_alerts: true,
          incident_alert: true,
          check_call_alert: true,
          patrol_alert: false,
          billing_alert: true,
          system_alert: true,
        });
      }

      const res = await saveProgress(6, { is_completed: true, completed_at: new Date().toISOString() });
      setSaving(false);
      return res;
    } catch (e: any) {
      setSaving(false);
      return { error: e || new Error('Failed to finish setup') };
    }
  }, [companyId, company, saveProgress]);

  return {
    progress,
    loading,
    saving,
    error,
    company,
    profile,
    companyId,
    refetch: loadProgress,
    saveCompanyProfile,
    saveFirstSite,
    saveFirstGuards,
    saveFirstRota,
    saveCompliance,
    finishSetup,
  };
}