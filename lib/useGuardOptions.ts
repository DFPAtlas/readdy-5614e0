import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';

interface GuardOption {
  id: string;
  first_name: string | null;
  last_name: string | null;
}

export function useGuardOptions(companyId: string | null) {
  const [guards, setGuards] = useState<GuardOption[]>([]);

  useEffect(() => {
    if (!companyId) return;
    supabase
      .from('guards')
      .select('id, first_name, last_name')
      .eq('company_id', companyId)
      .order('first_name', { ascending: true })
      .then(({ data }) => {
        if (!data || data.length === 0) { setGuards([]); return; }
        setGuards(data.map((g: any) => ({
          id: g.id,
          first_name: g.first_name || 'Guard',
          last_name: g.last_name || '',
        })));
      });
  }, [companyId]);

  return { guards };
}