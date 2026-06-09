'use client';

import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/lib/auth';

export interface PatrolCheckpoint {
  id: string;
  company_id: string;
  site_id: string;
  name: string;
  description: string | null;
  checkpoint_code: string;
  lat: number | null;
  lng: number | null;
  allowed_radius_meters: number;
  sop_url: string | null;
  patrol_time: string | null;
  patrol_frequency: string | null;
  is_active: boolean;
  created_at: string;
}

export interface CheckpointForm {
  site_id: string;
  name: string;
  description: string;
  checkpoint_code: string;
  lat: number | null;
  lng: number | null;
  allowed_radius_meters: number;
  sop_url: string;
  patrol_time: string;
  patrol_frequency: string;
}

export function usePatrolCheckpoints() {
  const { companyId } = useAuth();
  const [checkpoints, setCheckpoints] = useState<PatrolCheckpoint[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadCheckpoints = useCallback(async () => {
    if (!companyId) {
      setLoading(false);
      return;
    }
    setLoading(true);
    setError(null);
    const { data, error: err } = await supabase
      .from('patrol_checkpoints')
      .select('*')
      .eq('company_id', companyId)
      .order('site_id', { ascending: true })
      .order('name', { ascending: true });
    if (err) setError(err.message);
    else setCheckpoints(data || []);
    setLoading(false);
  }, [companyId]);

  useEffect(() => {
    if (!companyId) return;
    loadCheckpoints();
    const interval = setInterval(() => loadCheckpoints(), 30000);
    return () => clearInterval(interval);
  }, [companyId, loadCheckpoints]);

  const addCheckpoint = async (payload: CheckpointForm) => {
    if (!companyId) return { error: new Error('No company') };
    const { data, error } = await supabase
      .from('patrol_checkpoints')
      .insert({
        company_id: companyId,
        site_id: payload.site_id,
        name: payload.name,
        description: payload.description || null,
        checkpoint_code: payload.checkpoint_code.toUpperCase().trim(),
        lat: payload.lat,
        lng: payload.lng,
        allowed_radius_meters: payload.allowed_radius_meters || 50,
        sop_url: payload.sop_url || null,
        patrol_time: payload.patrol_time || null,
        patrol_frequency: payload.patrol_frequency || null,
        is_active: true,
      })
      .select()
      .maybeSingle();
    if (!error) loadCheckpoints();
    return { data, error };
  };

  const updateCheckpoint = async (id: string, payload: Partial<CheckpointForm>) => {
    if (!companyId) return { error: new Error('No company') };
    const updates: any = {};
    if (payload.site_id) updates.site_id = payload.site_id;
    if (payload.name) updates.name = payload.name;
    if (payload.description !== undefined) updates.description = payload.description || null;
    if (payload.checkpoint_code) updates.checkpoint_code = payload.checkpoint_code.toUpperCase().trim();
    if (payload.lat !== undefined) updates.lat = payload.lat;
    if (payload.lng !== undefined) updates.lng = payload.lng;
    if (payload.allowed_radius_meters !== undefined) updates.allowed_radius_meters = payload.allowed_radius_meters;
    if (payload.sop_url !== undefined) updates.sop_url = payload.sop_url || null;
    if (payload.patrol_time !== undefined) updates.patrol_time = payload.patrol_time || null;
    if (payload.patrol_frequency !== undefined) updates.patrol_frequency = payload.patrol_frequency || null;

    const { data, error } = await supabase
      .from('patrol_checkpoints')
      .update(updates)
      .eq('id', id)
      .eq('company_id', companyId)
      .select()
      .maybeSingle();
    if (!error) loadCheckpoints();
    return { data, error };
  };

  const deactivateCheckpoint = async (id: string) => {
    if (!companyId) return { error: new Error('No company') };
    const { data, error } = await supabase
      .from('patrol_checkpoints')
      .update({ is_active: false })
      .eq('id', id)
      .eq('company_id', companyId)
      .select()
      .maybeSingle();
    if (!error) loadCheckpoints();
    return { data, error };
  };

  const activateCheckpoint = async (id: string) => {
    if (!companyId) return { error: new Error('No company') };
    const { data, error } = await supabase
      .from('patrol_checkpoints')
      .update({ is_active: true })
      .eq('id', id)
      .eq('company_id', companyId)
      .select()
      .maybeSingle();
    if (!error) loadCheckpoints();
    return { data, error };
  };

  const deleteCheckpoint = async (id: string) => {
    if (!companyId) return { error: new Error('No company') };
    const { error } = await supabase
      .from('patrol_checkpoints')
      .delete()
      .eq('id', id)
      .eq('company_id', companyId);
    if (!error) loadCheckpoints();
    return { error };
  };

  return {
    checkpoints,
    loading,
    error,
    refetch: loadCheckpoints,
    addCheckpoint,
    updateCheckpoint,
    deactivateCheckpoint,
    activateCheckpoint,
    deleteCheckpoint,
  };
}