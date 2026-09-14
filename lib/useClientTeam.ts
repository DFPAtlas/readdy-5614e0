'use client';

import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/lib/auth';

export interface TeamMember {
  id: string;
  client_id: string;
  user_id: string;
  role: 'admin' | 'manager' | 'viewer';
  created_at: string;
  user?: {
    id: string;
    first_name: string | null;
    last_name: string | null;
    email: string | null;
  } | null;
}

export interface AssignedGuard {
  id: string;
  first_name: string | null;
  last_name: string | null;
  phone: string | null;
  sia_licence: string | null;
  status: string;
  skills: string[] | null;
  assigned_sites: {
    site_id: string;
    site_name: string;
    risk_level: string;
  }[];
}

export function useClientTeam() {
  const { currentUser, companyId } = useAuth();
  const [members, setMembers] = useState<TeamMember[]>([]);
  const [guards, setGuards] = useState<AssignedGuard[]>([]);
  const [loading, setLoading] = useState(true);
  const [membersError, setMembersError] = useState<string | null>(null);
  const [guardsError, setGuardsError] = useState<string | null>(null);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
  const [clientId, setClientId] = useState<string | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);

  const fetchTeam = useCallback(async () => {
    if (!currentUser || !companyId) {
      setLoading(false);
      return;
    }
    setLoading(true);
    setMembersError(null);
    setGuardsError(null);

    const { data: me } = await supabase
      .from('client_users')
      .select('client_id, role')
      .eq('user_id', currentUser.id)
      .maybeSingle();

    const cid = me?.client_id || null;
    const myRole = me?.role || 'viewer';
    setClientId(cid);
    setIsAdmin(myRole === 'admin');

    if (!cid) {
      setMembers([]);
      setGuards([]);
      setLoading(false);
      return;
    }

    const { data: cuData, error: cuError } = await supabase
      .from('client_users')
      .select('id, client_id, user_id, role, created_at, users:user_id (id, first_name, last_name, email)')
      .eq('client_id', cid)
      .eq('company_id', companyId);

    if (cuError) {
      setMembers([]);
      setMembersError(cuError.message);
    } else {
      const mapped: TeamMember[] = (cuData || []).map((item: any) => ({
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
            }
          : null,
      }));
      setMembers(mapped);
      setMembersError(null);
    }

    // Fetch assigned guards
    const { data: sitesData, error: sitesError } = await supabase
      .from('sites')
      .select('id, site_name, risk_level')
      .eq('client_id', cid)
      .eq('company_id', companyId);

    if (sitesError) {
      setGuards([]);
      setGuardsError(sitesError.message);
      setLoading(false);
      return;
    }

    const mySites = sitesData || [];
    const siteIds = mySites.map((s) => s.id);

    if (siteIds.length === 0) {
      setGuards([]);
      setLoading(false);
      return;
    }

    const { data: shiftsData, error: shiftsError } = await supabase
      .from('shifts')
      .select('guard_id, site_id')
      .in('site_id', siteIds)
      .eq('status', 'active');

    if (shiftsError) {
      setGuards([]);
      setGuardsError(shiftsError.message);
      setLoading(false);
      return;
    }

    const guardSitePairs = shiftsData || [];
    const uniqueGuardIds = [...new Set(guardSitePairs.map((s) => s.guard_id).filter(Boolean))];

    if (uniqueGuardIds.length === 0) {
      setGuards([]);
      setLoading(false);
      return;
    }

    const { data: guardsData, error: guardsErrorRes } = await supabase
      .from('guards')
      .select('id, first_name, last_name, phone, sia_licence, status, skills')
      .in('id', uniqueGuardIds)
      .order('first_name', { ascending: true });

    if (guardsErrorRes) {
      setGuards([]);
      setGuardsError(guardsErrorRes.message);
      setLoading(false);
      return;
    }

    const mappedGuards: AssignedGuard[] = (guardsData || []).map((g) => {
      const gSites = guardSitePairs
        .filter((pair) => pair.guard_id === g.id)
        .map((pair) => {
          const site = mySites.find((s) => s.id === pair.site_id);
          return {
            site_id: pair.site_id,
            site_name: site?.site_name || 'Unknown site',
            risk_level: site?.risk_level || 'low',
          };
        })
        .filter((s, i, arr) => arr.findIndex((t) => t.site_id === s.site_id) === i);

      return {
        ...g,
        assigned_sites: gSites,
      };
    });

    setGuards(mappedGuards);
    setGuardsError(null);
    setLoading(false);
  }, [currentUser, companyId]);

  useEffect(() => {
    if (currentUser && companyId) {
      fetchTeam();
    }
  }, [currentUser, companyId, fetchTeam]);

  const inviteMember = async (data: {
    email: string;
    firstName: string;
    lastName: string;
    role: 'admin' | 'manager' | 'viewer';
  }) => {
    if (!isAdmin) {
      setToast({ message: 'Only admin users can invite team members', type: 'error' });
      return { error: new Error('Unauthorized') };
    }

    try {
      const session = await supabase.auth.getSession();
      const token = session.data.session?.access_token;
      if (!token) {
        setToast({ message: 'Not authenticated', type: 'error' });
        return { error: new Error('Not authenticated') };
      }

      const res = await fetch(
        `${process.env.NEXT_PUBLIC_SUPABASE_URL}/functions/v1/client-invite-user`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            action: 'invite',
            email: data.email,
            firstName: data.firstName,
            lastName: data.lastName,
            role: data.role,
          }),
        }
      );

      const result = await res.json();
      if (!res.ok) {
        setToast({ message: result.error || 'Failed to invite user', type: 'error' });
        return { error: new Error(result.error) };
      }

      setToast({ message: 'Invitation sent successfully', type: 'success' });
      await fetchTeam();
      return { error: null };
    } catch (err: any) {
      setToast({ message: err.message || 'Failed to invite user', type: 'error' });
      return { error: err };
    }
  };

  const removeMember = async (clientUserId: string) => {
    if (!isAdmin) {
      setToast({ message: 'Only admin users can remove team members', type: 'error' });
      return { error: new Error('Unauthorized') };
    }

    try {
      const session = await supabase.auth.getSession();
      const token = session.data.session?.access_token;
      if (!token) {
        setToast({ message: 'Not authenticated', type: 'error' });
        return { error: new Error('Not authenticated') };
      }

      const res = await fetch(
        `${process.env.NEXT_PUBLIC_SUPABASE_URL}/functions/v1/client-invite-user`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ action: 'remove', clientUserId }),
        }
      );

      const result = await res.json();
      if (!res.ok) {
        setToast({ message: result.error || 'Failed to remove user', type: 'error' });
        return { error: new Error(result.error) };
      }

      setToast({ message: 'Team member removed', type: 'success' });
      await fetchTeam();
      return { error: null };
    } catch (err: any) {
      setToast({ message: err.message || 'Failed to remove user', type: 'error' });
      return { error: err };
    }
  };

  const dismissToast = () => setToast(null);

  return {
    members,
    guards,
    loading,
    membersError,
    guardsError,
    toast,
    isAdmin,
    clientId,
    inviteMember,
    removeMember,
    refresh: fetchTeam,
    dismissToast,
  };
}