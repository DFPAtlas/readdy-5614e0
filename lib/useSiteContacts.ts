'use client';

import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabase';

export interface SiteContact {
  id: string;
  contact_type: string;
  contact_name: string;
  contact_phone: string | null;
  contact_email: string | null;
  notes: string | null;
  is_primary: boolean;
}

export function useSiteContacts(siteId: string, companyId: string | null, enabled: boolean) {
  const [contacts, setContacts] = useState<SiteContact[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchContacts = useCallback(async () => {
    if (!siteId || !companyId) {
      setLoading(false);
      return;
    }

    try {
      const { data, error: err } = await supabase
        .from('site_contacts')
        .select('id, contact_type, contact_name, contact_phone, contact_email, notes, is_primary')
        .eq('site_id', siteId)
        .order('is_primary', { ascending: false })
        .order('contact_type');

      if (err) throw err;

      setContacts((data || []) as SiteContact[]);
      setError(null);
    } catch (e: any) {
      setError(e.message || 'Failed to load contacts');
    } finally {
      setLoading(false);
    }
  }, [siteId, companyId]);

  useEffect(() => {
    if (!enabled) return;
    setLoading(true);
    fetchContacts();
  }, [enabled, fetchContacts]);

  return { contacts, loading, error, refresh: fetchContacts };
}