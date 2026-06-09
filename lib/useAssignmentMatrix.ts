import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/lib/auth';
import { GuardSiteAssignment } from '@/lib/useSiteAssignments';

export interface AssignmentMatrixRow {
  guard_id: string;
  guard_name: string;
  guard_initials: string;
  sia_status: string;
  sia_expiry: string | null;
  skills: string[] | null;
  guard_status: string | null;
  cells: Record<string, {
    status: 'assigned' | 'approved' | 'not_trained' | 'blocked' | 'expired_docs' | 'available';
    induction_status?: string;
    last_worked_at?: string | null;
    is_blocked?: boolean;
    block_reason?: string | null;
    notes?: string | null;
    shift_count?: number;
    assignment_id?: string | null;
  }>;
}

export interface SiteColumn {
  id: string;
  site_name: string;
  client_name: string | null;
  client_id: string | null;
  required_skills: string[] | null;
  banned_guard_ids: string[] | null;
  preferred_guard_ids: string[] | null;
}

export function useAssignmentMatrix() {
  const { companyId } = useAuth();
  const [rows, setRows] = useState<AssignmentMatrixRow[]>([]);
  const [columns, setColumns] = useState<SiteColumn[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadMatrix = async () => {
    if (!companyId) {
      setLoading(false);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const { data: guardsData, error: guardsErr } = await supabase
        .from('guards')
        .select('id,first_name,last_name,sia_licence,sia_expiry,skills,status')
        .eq('company_id', companyId)
        .eq('status', 'active')
        .order('last_name', { ascending: true });
      if (guardsErr) throw guardsErr;

      const { data: sitesData, error: sitesErr } = await supabase
        .from('sites')
        .select('id,site_name,client_id,client_name,required_skills,banned_guard_ids,preferred_guard_ids')
        .eq('company_id', companyId)
        .order('site_name', { ascending: true });
      if (sitesErr) throw sitesErr;

      const { data: assignmentsData, error: assignmentsErr } = await supabase
        .from('guard_site_assignments')
        .select('*')
        .eq('company_id', companyId);
      if (assignmentsErr) throw assignmentsErr;

      const { data: shiftsData, error: shiftsErr } = await supabase
        .from('shifts')
        .select('guard_id,site_id,start_time')
        .eq('company_id', companyId)
        .gte('start_time', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString());
      if (shiftsErr) throw shiftsErr;

      const { data: certsData, error: certsErr } = await supabase
        .from('guard_certifications')
        .select('guard_id,cert_type,expiry_date,status')
        .eq('company_id', companyId);
      if (certsErr) throw certsErr;

      const guards = guardsData || [];
      const sites = sitesData || [];
      const assignments = assignmentsData || [];
      const shifts = shiftsData || [];
      const certs = certsData || [];

      const colMap: SiteColumn[] = sites.map((s) => ({
        id: s.id,
        site_name: s.site_name,
        client_name: s.client_name,
        client_id: s.client_id || null,
        required_skills: s.required_skills || [],
        banned_guard_ids: s.banned_guard_ids || [],
        preferred_guard_ids: s.preferred_guard_ids || [],
      }));

      const shiftCounts: Record<string, Record<string, number>> = {};
      const lastShiftDates: Record<string, Record<string, string>> = {};
      shifts.forEach((sh) => {
        const key = `${sh.guard_id}-${sh.site_id}`;
        shiftCounts[key] = (shiftCounts[key] || 0) + 1;
        if (!lastShiftDates[key] || sh.start_time > lastShiftDates[key]) {
          lastShiftDates[key] = sh.start_time;
        }
      });

      const certLookup: Record<string, { cert_type: string; expiry_date: string | null; status: string }[]> = {};
      certs.forEach((c) => {
        if (!certLookup[c.guard_id]) certLookup[c.guard_id] = [];
        certLookup[c.guard_id].push(c);
      });

      const assignmentLookup: Record<string, GuardSiteAssignment> = {};
      assignments.forEach((a) => {
        assignmentLookup[`${a.guard_id}-${a.site_id}`] = a;
      });

      const now = new Date();
      const rowData: AssignmentMatrixRow[] = guards.map((g) => {
        const cells: Record<string, any> = {};
        colMap.forEach((site) => {
          const key = `${g.id}-${site.id}`;
          const assignment = assignmentLookup[key];
          const shiftCount = shiftCounts[key] || 0;
          const lastShift = lastShiftDates[key] || null;
          const isBanned = site.banned_guard_ids?.includes(g.id) || false;
          const isPreferred = site.preferred_guard_ids?.includes(g.id) || false;
          const hasExpiredCerts = (certLookup[g.id] || []).some(
            (c) => c.expiry_date && new Date(c.expiry_date) < now && c.status !== 'valid'
          );
          const hasMissingCerts = (certLookup[g.id] || []).some(
            (c) => c.status === 'expired' || c.status === 'rejected'
          );
          const siaExpired = g.sia_expiry && new Date(g.sia_expiry) < now;
          const guardSkills = g.skills || [];
          const requiredSkills = site.required_skills || [];
          const missingSkills = requiredSkills.filter((rs) => !guardSkills.includes(rs));
          const notTrained = missingSkills.length > 0 || hasMissingCerts;

          let status: 'assigned' | 'approved' | 'not_trained' | 'blocked' | 'expired_docs' | 'available';

          if (isBanned || assignment?.is_blocked) {
            status = 'blocked';
          } else if (siaExpired) {
            status = 'expired_docs';
          } else if (notTrained) {
            status = 'not_trained';
          } else if (assignment?.status === 'assigned' || shiftCount > 0) {
            status = 'assigned';
          } else if (isPreferred || assignment?.induction_status === 'complete') {
            status = 'approved';
          } else {
            status = 'available';
          }

          cells[site.id] = {
            status,
            induction_status: assignment?.induction_status || 'not_started',
            last_worked_at: assignment?.last_worked_at || lastShift || null,
            is_blocked: assignment?.is_blocked || isBanned,
            block_reason: assignment?.block_reason || (isBanned ? 'Site banned' : null),
            notes: assignment?.notes || null,
            shift_count: shiftCount,
            assignment_id: assignment?.id || null,
          };
        });

        return {
          guard_id: g.id,
          guard_name: `${g.first_name || ''} ${g.last_name || ''}`.trim(),
          guard_initials: `${(g.first_name || '')[0]}${(g.last_name || '')[0]}`.toUpperCase(),
          sia_status: g.sia_expiry && new Date(g.sia_expiry) < now ? 'expired' : g.sia_expiry && (new Date(g.sia_expiry).getTime() - now.getTime()) / (1000 * 60 * 60 * 24) <= 60 ? 'expiring' : 'valid',
          sia_expiry: g.sia_expiry,
          skills: g.skills,
          guard_status: g.status,
          cells,
        };
      });

      setColumns(colMap);
      setRows(rowData);
    } catch (e: any) {
      setError(e.message || 'Failed to load matrix');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!companyId) return;
    loadMatrix();
    const interval = setInterval(() => loadMatrix(), 30000);
    return () => clearInterval(interval);
  }, [companyId]);

  return { rows, columns, loading, error, refetch: loadMatrix };
}