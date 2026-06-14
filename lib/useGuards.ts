import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/lib/auth';

export interface Guard {
  id: string;
  company_id: string | null;
  user_id: string | null;
  first_name: string | null;
  last_name: string | null;
  email: string | null;
  phone: string | null;
  sia_licence: string | null;
  sia_expiry: string | null;
  hourly_rate: number | null;
  skills: string[] | null;
  availability: Record<string, any> | null;
  status: string | null;
  created_at: string;
}

export interface GuardForm {
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  sia_licence: string;
  sia_expiry: string;
  hourly_rate: number;
  skills: string[];
  status: string;
}

export function useGuards() {
  const { companyId } = useAuth();
  const [guards, setGuards] = useState<Guard[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadGuards = useCallback(async () => {
    if (!companyId) {
      setLoading(false);
      return;
    }
    setLoading(true);
    setError(null);
    const { data, error: err } = await supabase
      .from('guards')
      .select('*')
      .eq('company_id', companyId)
      .order('created_at', { ascending: false });
    if (err) setError(err.message);
    else setGuards(data || []);
    setLoading(false);
  }, [companyId]);

  useEffect(() => {
    if (!companyId) return;
    loadGuards();

    // Poll every 30s instead of realtime — avoids Supabase channel lifecycle bugs
    const interval = setInterval(() => {
      loadGuards();
    }, 30000);

    return () => {
      clearInterval(interval);
    };
  }, [companyId, loadGuards]);

  const addGuard = async (payload: GuardForm) => {
    if (!companyId) return { error: new Error('No company') };
    const { data, error } = await supabase
      .from('guards')
      .insert({
        company_id: companyId,
        first_name: payload.first_name,
        last_name: payload.last_name,
        email: payload.email,
        phone: payload.phone,
        sia_licence: payload.sia_licence,
        sia_expiry: payload.sia_expiry,
        hourly_rate: payload.hourly_rate,
        skills: payload.skills,
        status: payload.status,
      })
      .select()
      .maybeSingle();
    return { data, error };
  };

  const updateGuard = async (id: string, payload: Partial<GuardForm>) => {
    const { data, error } = await supabase
      .from('guards')
      .update(payload)
      .eq('id', id)
      .select()
      .maybeSingle();
    return { data, error };
  };

  const deleteGuard = async (id: string) => {
    const { error } = await supabase.from('guards').delete().eq('id', id);
    return { error };
  };

  const setGuardStatus = async (id: string, status: string) => {
    const { data, error } = await supabase
      .from('guards')
      .update({ status })
      .eq('id', id)
      .select()
      .maybeSingle();
    return { data, error };
  };

  return {
    guards,
    loading,
    error,
    refetch: loadGuards,
    addGuard,
    updateGuard,
    deleteGuard,
    setGuardStatus,
  };
}

export function getDaysUntil(dateStr: string | null) {
  if (!dateStr) return null;
  const target = new Date(dateStr);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const diff = Math.ceil((target.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
  return diff;
}

export function getSIAStatus(dateStr: string | null) {
  const days = getDaysUntil(dateStr);
  if (days === null) return 'unknown';
  if (days < 0) return 'expired';
  if (days <= 60) return 'expiring_soon';
  return 'valid';
}

export function getInitials(guard: Guard) {
  return `${(guard.first_name || '')[0]}${(guard.last_name || '')[0]}`.toUpperCase();
}

export function getFullName(guard: Guard) {
  return `${guard.first_name || ''} ${guard.last_name || ''}`.trim() || 'Unnamed Guard';
}

export const SKILL_OPTIONS = [
  'CCTV',
  'Door Supervision',
  'Close Protection',
  'Public Space Surveillance',
  'Vehicle Immobilisation',
  'First Aid',
  'Conflict Management',
  'Search & Frisk',
  'Manned Guarding',
  'Mobile Patrol',
];