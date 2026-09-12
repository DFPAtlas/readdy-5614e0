'use client';

import { useState, useEffect, useCallback, createContext, useContext, createElement } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/lib/auth';

export interface AuthorizedSite {
  id: string;
  site_name: string;
  address: string;
  postcode: string | null;
  risk_level: string;
  status: string | null;
  latitude: number | null;
  longitude: number | null;
  assignment_instructions: string | null;
  client_id: string;
  company_id: string;
  site_type: string | null;
  primary_contact_name: string | null;
  primary_contact_phone: string | null;
  primary_contact_email: string | null;
  site_contact_name: string | null;
  site_contact_phone: string | null;
  site_contact_email: string | null;
  emergency_contact: string | null;
  patrol_enabled: boolean | null;
  patrol_interval: number | null;
  security_requirements: any | null;
}

export interface AuthorizedClientSiteResult {
  site: AuthorizedSite | null;
  siteIds: string[];
  clientId: string | null;
  clientUserId: string | null;
  clientRole: 'admin' | 'manager' | 'viewer' | null;
  companyId: string | null;
  isClientUser: boolean;
  loading: boolean;
  accessDenied: boolean;
  notFound: boolean;
  error: string | null;
  refresh: () => void;
}

function useAuthorizedClientSiteHook(siteId: string): AuthorizedClientSiteResult {
  const { profile, companyId } = useAuth();

  const [site, setSite] = useState<AuthorizedSite | null>(null);
  const [siteIds, setSiteIds] = useState<string[]>([]);
  const [clientId, setClientId] = useState<string | null>(null);
  const [clientUserId, setClientUserId] = useState<string | null>(null);
  const [clientRole, setClientRole] = useState<'admin' | 'manager' | 'viewer' | null>(null);

  const [loading, setLoading] = useState(true);
  const [accessDenied, setAccessDenied] = useState(false);
  const [notFound, setNotFound] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isClientUser = !!clientId;

  const resolve = useCallback(async () => {
    if (!profile?.id || !companyId) {
      setLoading(false);
      return;
    }

    setLoading(true);
    setAccessDenied(false);
    setNotFound(false);
    setError(null);

    try {
      const { data: cu } = await supabase
        .from('client_users')
        .select('id, client_id, role')
        .eq('user_id', profile.id)
        .eq('company_id', companyId)
        .maybeSingle();

      if (!cu?.client_id) {
        setLoading(false);
        setAccessDenied(true);
        return;
      }

      setClientId(cu.client_id);
      setClientUserId(cu.id);
      setClientRole(cu.role);

      const { data: allSites } = await supabase
        .from('sites')
        .select('id')
        .eq('client_id', cu.client_id)
        .eq('company_id', companyId);

      const ids = (allSites || []).map((s) => s.id);
      setSiteIds(ids);

      if (!ids.includes(siteId)) {
        setLoading(false);
        setAccessDenied(true);
        return;
      }

      const { data: siteData } = await supabase
        .from('sites')
        .select('id, site_name, address, postcode, risk_level, status, latitude, longitude, assignment_instructions, client_id, company_id, site_type, primary_contact_name, primary_contact_phone, primary_contact_email, site_contact_name, site_contact_phone, site_contact_email, emergency_contact, patrol_enabled, patrol_interval, security_requirements')
        .eq('id', siteId)
        .eq('client_id', cu.client_id)
        .eq('company_id', companyId)
        .maybeSingle();

      if (!siteData) {
        setLoading(false);
        setNotFound(true);
        return;
      }

      setSite(siteData as AuthorizedSite);
    } catch (err: any) {
      setError(err.message || 'Failed to load site data');
    } finally {
      setLoading(false);
    }
  }, [profile?.id, companyId, siteId]);

  useEffect(() => {
    resolve();
  }, [resolve]);

  return {
    site,
    siteIds,
    clientId,
    clientUserId,
    clientRole,
    companyId,
    isClientUser,
    loading,
    accessDenied,
    notFound,
    error,
    refresh: resolve,
  };
}

export function useAuthorizedClientSite(siteId: string): AuthorizedClientSiteResult {
  return useAuthorizedClientSiteHook(siteId);
}