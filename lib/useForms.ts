import { useCallback, useEffect, useState } from 'react';
import { supabase } from './supabase';

export interface FormSubmission {
  id: string;
  form_type: string;
  submission_data: Record<string, any>;
  site_id?: string | null;
  guard_id?: string | null;
  created_at: string;
}

export function useForms(companyId: string | null) {
  const [submissions, setSubmissions] = useState<FormSubmission[]>([]);
  const [loading, setLoading] = useState(false);

  const load = useCallback(async () => {
    if (!companyId) return;
    setLoading(true);
    const { data } = await supabase
      .from('form_submissions')
      .select('*')
      .eq('company_id', companyId)
      .order('created_at', { ascending: false })
      .limit(100);
    setSubmissions(data || []);
    setLoading(false);
  }, [companyId]);

  useEffect(() => { load(); }, [load]);

  const submit = useCallback(
    async (formType: string, formData: Record<string, any>, siteId?: string | null, guardId?: string | null) => {
      if (!companyId) return { error: 'No company' };
      const { error } = await supabase.from('form_submissions').insert({
        company_id: companyId,
        form_type: formType,
        submission_data: formData,
        site_id: siteId || null,
        guard_id: guardId || null,
      });
      if (!error) load();
      return { error };
    },
    [companyId, load]
  );

  const countByType = (type: string) => submissions.filter((s) => s.form_type === type).length;

  return { submissions, loading, submit, countByType, refresh: load };
}