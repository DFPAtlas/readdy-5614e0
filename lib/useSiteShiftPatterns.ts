import { supabase } from '@/lib/supabase';

export interface SiteShiftPattern {
  id: string;
  site_id: string;
  company_id: string | null;
  day_of_week: number;
  shift_type: string;
  start_time: string;
  end_time: string;
  guards_required: number;
  created_at: string;
}

export async function saveSiteShiftPatterns(
  siteId: string,
  patterns: Omit<SiteShiftPattern, 'id' | 'created_at' | 'site_id' | 'company_id'>[],
  companyId: string
) {
  const { error } = await supabase.from('site_shift_patterns').delete().eq('site_id', siteId);
  if (error) return { error };
  if (patterns.length === 0) return { error: null };
  const { error: insertErr } = await supabase.from('site_shift_patterns').insert(
    patterns.map(p => ({ ...p, site_id: siteId, company_id: companyId }))
  );
  return { error: insertErr };
}