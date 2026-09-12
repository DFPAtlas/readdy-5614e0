'use client';

import { useState, useEffect, useCallback, createContext, useContext, createElement } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/lib/auth';

export interface ClientIdentity {
  clientId: string | null;
  clientUserId: string | null;
  clientRole: 'admin' | 'manager' | 'viewer' | null;
  isClientUser: boolean;
  siteIds: string[];
  loading: boolean;
  error: string | null;
  refresh: () => void;
}

const ClientAuthCtx = createContext<ClientIdentity>({
  clientId: null,
  clientUserId: null,
  clientRole: null,
  isClientUser: false,
  siteIds: [],
  loading: true,
  error: null,
  refresh: () => {},
});

export function ClientAuthProvider({ children }: { children: React.ReactNode }) {
  const { currentUser, companyId } = useAuth();
  const [clientId, setClientId] = useState<string | null>(null);
  const [clientUserId, setClientUserId] = useState<string | null>(null);
  const [clientRole, setClientRole] = useState<'admin' | 'manager' | 'viewer' | null>(null);
  const [siteIds, setSiteIds] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const resolve = useCallback(async () => {
    if (!currentUser || !companyId) {
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    const { data: cu } = await supabase
      .from('client_users')
      .select('id, client_id, role')
      .eq('user_id', currentUser.id)
      .eq('company_id', companyId)
      .maybeSingle();

    if (!cu) {
      setClientId(null);
      setClientUserId(null);
      setClientRole(null);
      setSiteIds([]);
      setLoading(false);
      return;
    }

    setClientId(cu.client_id);
    setClientUserId(cu.id);
    setClientRole(cu.role);

    const { data: siteRows } = await supabase
      .from('sites')
      .select('id')
      .eq('client_id', cu.client_id)
      .eq('company_id', companyId);

    setSiteIds((siteRows || []).map((s) => s.id));
    setLoading(false);
  }, [currentUser, companyId]);

  useEffect(() => {
    resolve();
  }, [resolve]);

  return createElement(
    ClientAuthCtx.Provider,
    { value: { clientId, clientUserId, clientRole, isClientUser: !!clientId, siteIds, loading, error, refresh: resolve } },
    children
  );
}

export function useClientAuth() {
  return useContext(ClientAuthCtx);
}