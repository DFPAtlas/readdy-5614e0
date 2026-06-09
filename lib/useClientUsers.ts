'use client';

import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/lib/auth';

export interface ClientUser {
  id: string;
  client_id: string;
  user_id: string;
  role: 'viewer' | 'manager' | 'admin';
  created_at: string;
  user: {
    id: string;
    first_name: string | null;
    last_name: string | null;
    email: string | null;
    role: string | null;
  } | null;
}

export interface CompanyUser {
  id: string;
  first_name: string | null;
  last_name: string | null;
  email: string | null;
  role: string | null;
}

export function useClientUsers(clientId: string | null) {
  const { companyId, profile } = useAuth();
  const [clientUsers, setClientUsers] = useState<ClientUser[]>([]);
  const [companyUsers, setCompanyUsers] = useState<CompanyUser[]>([]);
  const [clientName, setClientName] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  const isAdmin = profile && ['super_admin', 'company_admin', 'operations_manager'].includes(profile.role);

  const fetchClientUsers = useCallback(async () => {
    if (!clientId || !companyId) {
      setLoading(false);
      return;
    }
    setLoading(true);
    setError(null);

    const { data: clientData } = await supabase
      .from('clients')
      .select('name')
      .eq('id', clientId)
      .eq('company_id', companyId)
      .maybeSingle();
    setClientName(clientData?.name || 'Client');

    const { data: cuData, error: cuError } = await supabase
      .from('client_users')
      .select('id, client_id, user_id, role, created_at, users:user_id (id, first_name, last_name, email, role)')
      .eq('client_id', clientId);

    if (cuError) {
      setError(cuError.message);
    } else {
      const mapped: ClientUser[] = (cuData || []).map((item: any) => ({
        id: item.id,
        client_id: item.client_id,
        user_id: item.user_id,
        role: item.role,
        created_at: item.created_at,
        user: item.users
          ? {
              id: item.users.id,
              first_name: item.users.first_name,
              last_name: item.users.last_name,
              email: item.users.email,
              role: item.users.role,
            }
          : null,
      }));
      setClientUsers(mapped);
    }

    setLoading(false);
  }, [clientId, companyId]);

  const fetchCompanyUsers = useCallback(async () => {
    if (!companyId) return;
    const { data } = await supabase
      .from('users')
      .select('id, first_name, last_name, email, role')
      .eq('company_id', companyId);
    setCompanyUsers(data || []);
  }, [companyId]);

  useEffect(() => {
    if (clientId && companyId) {
      fetchClientUsers();
      fetchCompanyUsers();
    }
  }, [clientId, companyId, fetchClientUsers, fetchCompanyUsers]);

  const addClientUser = async (userId: string, role: string) => {
    if (!isAdmin) {
      setToast({ message: 'You do not have permission to manage client users.', type: 'error' });
      return { error: new Error('Unauthorized') };
    }
    if (!companyId || !clientId) {
      setToast({ message: 'Missing company or client context.', type: 'error' });
      return { error: new Error('Missing context') };
    }

    const user = companyUsers.find((u) => u.id === userId);
    if (!user) {
      setToast({ message: 'Selected user does not belong to your company.', type: 'error' });
      return { error: new Error('User not in company') };
    }

    const { error } = await supabase.from('client_users').insert({
      company_id: companyId,
      client_id,
      user_id: userId,
      role,
    });

    if (error) {
      if (error.code === '42501') {
        setToast({ message: 'Permission denied by security policy.', type: 'error' });
      } else if (error.code === '23505') {
        setToast({ message: 'This user is already linked to this client.', type: 'error' });
      } else {
        setToast({ message: error.message, type: 'error' });
      }
      return { error };
    }

    setToast({ message: 'Client user added successfully.', type: 'success' });
    await fetchClientUsers();
    return { error: null };
  };

  const updateClientUserRole = async (clientUserId: string, newRole: string) => {
    if (!isAdmin) {
      setToast({ message: 'You do not have permission to manage client users.', type: 'error' });
      return { error: new Error('Unauthorized') };
    }

    const { error } = await supabase.from('client_users').update({ role: newRole }).eq('id', clientUserId);

    if (error) {
      if (error.code === '42501') {
        setToast({ message: 'Permission denied by security policy.', type: 'error' });
      } else {
        setToast({ message: error.message, type: 'error' });
      }
      return { error };
    }

    setToast({ message: 'Role updated successfully.', type: 'success' });
    await fetchClientUsers();
    return { error: null };
  };

  const removeClientUser = async (clientUserId: string) => {
    if (!isAdmin) {
      setToast({ message: 'You do not have permission to manage client users.', type: 'error' });
      return { error: new Error('Unauthorized') };
    }

    const { error } = await supabase.from('client_users').delete().eq('id', clientUserId);

    if (error) {
      if (error.code === '42501') {
        setToast({ message: 'Permission denied by security policy.', type: 'error' });
      } else {
        setToast({ message: error.message, type: 'error' });
      }
      return { error };
    }

    setToast({ message: 'Client user removed successfully.', type: 'success' });
    await fetchClientUsers();
    return { error: null };
  };

  const dismissToast = () => setToast(null);

  return {
    clientUsers,
    companyUsers,
    clientName,
    loading,
    error,
    toast,
    isAdmin,
    addClientUser,
    updateClientUserRole,
    removeClientUser,
    refetch: fetchClientUsers,
    dismissToast,
  };
}