'use client';

import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/lib/auth';

export type SOPStatus = 'draft' | 'in_review' | 'approved' | 'published' | 'archived';

export interface BuiltSOP {
  id: string;
  company_id: string;
  site_id: string | null;
  client_name: string | null;
  title: string;
  sop_type: string;
  sop_reference: string | null;
  version_number: number;
  status: SOPStatus;
  purpose: string | null;
  scope: string | null;
  roles: any;
  equipment: any;
  procedure_steps: any;
  risks_controls: any;
  ppe: string | null;
  health_safety_notes: string | null;
  emergency_contacts: any;
  escalation_procedure: string | null;
  reporting_requirements: string | null;
  guard_acknowledgement_statement: string | null;
  approval_notes: string | null;
  approved_by: string | null;
  approved_at: string | null;
  published_at: string | null;
  review_date: string | null;
  created_by: string | null;
  created_at: string;
  updated_at: string;
  guard_role: string | null;
  shift_type: string | null;
  content_html: string | null;
  content_json: any;
  is_active: boolean;
  site_name?: string;
  approved_by_name?: string;
  created_by_name?: string;
}

export interface SOPFormData {
  sop_type: string;
  site_id: string | null;
  client_name: string;
  title: string;
  purpose: string;
  scope: string;
  roles: { role: string; responsibility: string }[];
  equipment: string[];
  procedure_steps: { step: number; instruction: string; expectedOutcome: string }[];
  risks_controls: { risk: string; control: string }[];
  ppe: string;
  health_safety_notes: string;
  emergency_contacts: { name: string; role: string; phone: string }[];
  escalation_procedure: string;
  reporting_requirements: string;
  guard_acknowledgement_statement: string;
  review_date: string;
  guard_role: string;
  shift_type: string;
}

const SOP_TYPE_LABELS: Record<string, string> = {
  site_opening: 'Site Opening',
  site_lock_up: 'Site Lock-Up',
  patrol_procedure: 'Patrol Procedure',
  fire_evacuation: 'Fire Evacuation',
  alarm_activation: 'Alarm Activation Response',
  cctv_monitoring: 'CCTV Monitoring',
  visitor_management: 'Visitor Management',
  key_holding: 'Key Holding',
  lone_worker: 'Lone Worker Procedure',
  incident_reporting: 'Incident Reporting',
  assignment_instructions: 'Assignment Instructions',
  emergency_response: 'Emergency Response',
};

export function getSOPTypeLabel(type: string): string {
  return SOP_TYPE_LABELS[type] || type;
}

export function useBuiltSOPs() {
  const { companyId, user } = useAuth();
  const [sops, setSops] = useState<BuiltSOP[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    if (!companyId) { setLoading(false); return; }
    setLoading(true);
    setError(null);

    const { data, error: err } = await supabase
      .from('built_sops')
      .select('*, sites:site_id(site_name)')
      .eq('company_id', companyId)
      .eq('is_active', true)
      .order('created_at', { ascending: false });

    if (err) {
      setError(err.message);
    } else {
      const mapped = (data || []).map((d: any) => ({
        ...d,
        site_name: d.sites?.site_name,
      }));
      setSops(mapped);
    }
    setLoading(false);
  }, [companyId]);

  useEffect(() => {
    if (!companyId) return;
    load();
  }, [companyId, load]);

  const getById = useCallback(async (id: string): Promise<BuiltSOP | null> => {
    const { data, error: err } = await supabase
      .from('built_sops')
      .select('*, sites:site_id(site_name), approved_by_user:approved_by(first_name,last_name), created_by_user:created_by(first_name,last_name)')
      .eq('id', id)
      .maybeSingle();

    if (err || !data) return null;
    return {
      ...data,
      site_name: data.sites?.site_name,
      approved_by_name: data.approved_by_user ? `${data.approved_by_user.first_name} ${data.approved_by_user.last_name}` : null,
      created_by_name: data.created_by_user ? `${data.created_by_user.first_name} ${data.created_by_user.last_name}` : null,
    };
  }, []);

  const createSOP = async (formData: SOPFormData) => {
    if (!companyId || !user?.id) return { error: new Error('Not authenticated') };

    const sopRef = `SOP-${formData.sop_type.toUpperCase().replace(/_/g, '-')}-${Date.now().toString().slice(-4)}`;

    const { data, error: err } = await supabase
      .from('built_sops')
      .insert({
        company_id: companyId,
        site_id: formData.site_id,
        client_name: formData.client_name || null,
        title: formData.title,
        sop_type: formData.sop_type,
        sop_reference: sopRef,
        version_number: 1,
        status: 'draft',
        purpose: formData.purpose || null,
        scope: formData.scope || null,
        roles: formData.roles.length > 0 ? formData.roles : null,
        equipment: formData.equipment.length > 0 ? formData.equipment : null,
        procedure_steps: formData.procedure_steps.length > 0 ? formData.procedure_steps : null,
        risks_controls: formData.risks_controls.length > 0 ? formData.risks_controls : null,
        ppe: formData.ppe || null,
        health_safety_notes: formData.health_safety_notes || null,
        emergency_contacts: formData.emergency_contacts.length > 0 ? formData.emergency_contacts : null,
        escalation_procedure: formData.escalation_procedure || null,
        reporting_requirements: formData.reporting_requirements || null,
        guard_acknowledgement_statement: formData.guard_acknowledgement_statement || null,
        review_date: formData.review_date || null,
        guard_role: formData.guard_role || null,
        shift_type: formData.shift_type || null,
        created_by: user.id,
        content_json: formData,
        is_active: true,
      })
      .select()
      .maybeSingle();

    if (!err) await load();
    return { data, error: err };
  };

  const updateSOP = async (id: string, updates: Partial<BuiltSOP>) => {
    const { data, error: err } = await supabase
      .from('built_sops')
      .update(updates)
      .eq('id', id)
      .select()
      .maybeSingle();

    if (!err) await load();
    return { data, error: err };
  };

  const updateStatus = async (id: string, status: SOPStatus, extra?: { approved_by?: string; approved_at?: string; published_at?: string; approval_notes?: string }) => {
    const update: any = { status, updated_at: new Date().toISOString() };
    if (extra?.approved_by) update.approved_by = extra.approved_by;
    if (extra?.approved_at) update.approved_at = extra.approved_at;
    if (extra?.published_at) update.published_at = extra.published_at;
    if (extra?.approval_notes) update.approval_notes = extra.approval_notes;

    const { error: err } = await supabase.from('built_sops').update(update).eq('id', id);
    if (!err) await load();
    return { error: err };
  };

  const saveContent = async (id: string, contentHtml: string, contentJson: any) => {
    const { error: err } = await supabase
      .from('built_sops')
      .update({ content_html: contentHtml, content_json: contentJson, updated_at: new Date().toISOString() })
      .eq('id', id);
    if (!err) await load();
    return { error: err };
  };

  const archiveSOP = async (id: string) => {
    const { error: err } = await supabase
      .from('built_sops')
      .update({ status: 'archived', is_active: false, updated_at: new Date().toISOString() })
      .eq('id', id);
    if (!err) await load();
    return { error: err };
  };

  const deleteSOP = async (id: string) => {
    const { error: err } = await supabase.from('built_sops').delete().eq('id', id);
    if (!err) await load();
    return { error: err };
  };

  const incrementVersion = async (id: string) => {
    const sop = await getById(id);
    if (!sop) return { error: new Error('SOP not found') };

    const newVersion = (sop.version_number || 1) + 1;
    const { data, error: err } = await supabase
      .from('built_sops')
      .update({ version_number: newVersion, status: 'draft', updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .maybeSingle();

    if (!err) await load();
    return { data, error: err };
  };

  return {
    sops, loading, error, refetch: load,
    getById, createSOP, updateSOP, updateStatus,
    saveContent, archiveSOP, deleteSOP, incrementVersion,
  };
}