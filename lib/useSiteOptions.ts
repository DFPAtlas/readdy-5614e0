import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';

interface SiteOption {
  id: string;
  name: string;
}

export function useSiteOptions(companyId: string | null) {
  const [sites, setSites] = useState<SiteOption[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!companyId) return;
    setLoading(true);
    supabase
      .from('sites')
      .select('id, site_name')
      .eq('company_id', companyId)
      .order('site_name')
      .then(({ data }) => {
        setSites((data || []).map(s => ({ id: s.id, name: s.site_name })));
        setLoading(false);
      });
  }, [companyId]);

  return { sites, loading };
}