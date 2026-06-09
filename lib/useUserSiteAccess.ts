import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';

export interface SiteAccessRecord {
  id: string;
  user_id: string;
  company_id: string;
  site_id: string | null;
  access_type: 'all' | 'selected' | 'region' | 'own';
  region: string | null;
}

export function useUserSiteAccess(companyId: string | null, userId: string | null) {
  const [access, setAccess] = useState<SiteAccessRecord[]>([]);
  const [sites, setSites] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!companyId) return;
    supabase.from('sites').select('id,site_name,region').eq('company_id', companyId).order('site_name').then(({ data }) => {
      if (data) setSites(data);
    });
  }, [companyId]);

  const load = async () => {
    if (!companyId || !userId) return;
    setLoading(true);
    const { data } = await supabase.from('user_site_access').select('*').eq('company_id', companyId).eq('user_id', userId);
    setAccess(data || []);
    setLoading(false);
  };

  const updateAccess = async (updates: { access_type: 'all' | 'selected' | 'region' | 'own'; site_ids?: string[]; region?: string | null }) => {
    if (!companyId || !userId) return;
    await supabase.from('user_site_access').delete().eq('user_id', userId).eq('company_id', companyId);

    if (updates.access_type === 'all' || updates.access_type === 'own') {
      await supabase.from('user_site_access').insert({
        user_id: userId, company_id: companyId, access_type: updates.access_type, site_id: null, region: null,
      });
    } else if (updates.access_type === 'region') {
      await supabase.from('user_site_access').insert({
        user_id: userId, company_id: companyId, access_type: 'region', site_id: null, region: updates.region || null,
      });
    } else if (updates.access_type === 'selected') {
      const inserts = (updates.site_ids || []).map(siteId => ({
        user_id: userId, company_id: companyId, access_type: 'selected' as const, site_id: siteId, region: null,
      }));
      if (inserts.length > 0) await supabase.from('user_site_access').insert(inserts);
    }

    await load();
  };

  useEffect(() => { load(); }, [companyId, userId]);

  return { access, sites, loading, updateAccess };
}