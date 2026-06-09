import { useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/lib/auth';

export function useIncidentReports(incidentId: string | null) {
  const { companyId } = useAuth();
  const [reports, setReports] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchReports = async () => {
    if (!incidentId || !companyId) return;
    setLoading(true);
    const { data } = await supabase
      .from('reports')
      .select('id, title, file_url, generated_at, generated_by')
      .eq('company_id', companyId)
      .eq('reference_id', incidentId)
      .eq('report_type', 'incident')
      .order('generated_at', { ascending: false });
    setReports(data || []);
    setLoading(false);
  };

  return { reports, loading, fetchReports };
}