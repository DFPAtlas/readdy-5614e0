'use client';

import { useState, useCallback, useEffect } from 'react';
import { format, startOfWeek } from 'date-fns';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/lib/auth';

export interface PublishedWeek {
  id: string;
  company_id: string;
  week_start: string;
  published_by: string;
  published_at: string;
  published_by_name?: string;
  isAdmin: boolean;
}

export function useRotaPublish() {
  const { companyId, profile } = useAuth();
  const [published, setPublished] = useState<PublishedWeek | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isAdmin = profile?.role === 'super_admin' || profile?.role === 'company_admin';

  const fetchPublished = useCallback(async (weekStart: Date) => {
    if (!companyId) return;
    setLoading(true);
    setError(null);
    try {
      const weekKey = format(weekStart, 'yyyy-MM-dd');
      const { data, error: err } = await supabase
        .from('rota_published_weeks')
        .select('*, profiles(full_name)')
        .eq('company_id', companyId)
        .eq('week_start', weekKey)
        .is('unpublished_at', null)
        .maybeSingle();

      if (err) {
        setError(err.message);
        setPublished(null);
      } else if (data) {
        setPublished({
          id: data.id,
          company_id: data.company_id,
          week_start: data.week_start,
          published_by: data.published_by,
          published_at: data.published_at,
          published_by_name: data.profiles?.full_name,
          isAdmin,
        });
      } else {
        setPublished(null);
      }
    } catch (err: any) {
      setError(err.message);
      setPublished(null);
    } finally {
      setLoading(false);
    }
  }, [companyId, isAdmin]);

  const publish = useCallback(async (weekStart: Date) => {
    if (!companyId || !profile?.id) return { error: 'Missing company or user' };
    setLoading(true);
    setError(null);
    try {
      const weekKey = format(weekStart, 'yyyy-MM-dd');

      // Mark any existing record for this week as unpublished first
      await supabase
        .from('rota_published_weeks')
        .update({
          unpublished_at: new Date().toISOString(),
          unpublished_by: profile.id,
        })
        .eq('company_id', companyId)
        .eq('week_start', weekKey)
        .is('unpublished_at', null);

      const { data, error: err } = await supabase
        .from('rota_published_weeks')
        .insert({
          company_id: companyId,
          week_start: weekKey,
          published_by: profile.id,
          published_at: new Date().toISOString(),
        })
        .select('*, profiles(full_name)')
        .maybeSingle();

      if (err) {
        setError(err.message);
        return { error: err.message };
      }

      setPublished({
        id: data.id,
        company_id: data.company_id,
        week_start: data.week_start,
        published_by: data.published_by,
        published_at: data.published_at,
        published_by_name: data.profiles?.full_name,
        isAdmin,
      });

      return { error: null };
    } catch (err: any) {
      const msg = err.message || 'Failed to publish rota';
      setError(msg);
      return { error: msg };
    } finally {
      setLoading(false);
    }
  }, [companyId, profile?.id, isAdmin]);

  const unpublish = useCallback(async () => {
    if (!companyId || !profile?.id || !published) return { error: 'No published week to unpublish' };
    setLoading(true);
    setError(null);
    try {
      const { error: err } = await supabase
        .from('rota_published_weeks')
        .update({
          unpublished_at: new Date().toISOString(),
          unpublished_by: profile.id,
        })
        .eq('id', published.id);

      if (err) {
        setError(err.message);
        return { error: err.message };
      }

      setPublished(null);
      return { error: null };
    } catch (err: any) {
      const msg = err.message || 'Failed to unpublish rota';
      setError(msg);
      return { error: msg };
    } finally {
      setLoading(false);
    }
  }, [companyId, profile?.id, published]);

  return {
    published,
    loading,
    error,
    isAdmin,
    fetchPublished,
    publish,
    unpublish,
  };
}