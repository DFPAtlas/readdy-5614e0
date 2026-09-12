'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/lib/auth';

interface PolicyReview {
  id: string;
  title: string;
  policy_type: string | null;
  review_date: string;
  days_until: number;
}

export default function PolicyReviewPanel() {
  const { companyId } = useAuth();
  const [policies, setPolicies] = useState<PolicyReview[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!companyId) { setLoading(false); return; }
    const fetchPolicies = async () => {
      const { data } = await supabase
        .from('acs_policies')
        .select('id, title, policy_type, review_date, status')
        .eq('company_id', companyId)
        .eq('status', 'approved')
        .not('review_date', 'is', null)
        .order('review_date', { ascending: true });

      if (!data) { setPolicies([]); setLoading(false); return; }

      const now = new Date();
      const thirtyDays = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);

      const result: PolicyReview[] = data
        .filter((p) => new Date(p.review_date) <= thirtyDays)
        .map((p) => ({
          id: p.id,
          title: p.title,
          policy_type: p.policy_type,
          review_date: p.review_date,
          days_until: Math.ceil((new Date(p.review_date).getTime() - now.getTime()) / (1000 * 60 * 60 * 24)),
        }));

      setPolicies(result);
      setLoading(false);
    };
    fetchPolicies();
  }, [companyId]);

  if (loading) {
    return (
      <div className="bg-[#0f172a]/70 backdrop-blur-sm border border-white/10 rounded-xl p-5">
        <div className="animate-pulse space-y-3">
          <div className="h-5 w-40 bg-white/5 rounded"></div>
          <div className="h-8 w-full bg-white/5 rounded"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-[#0f172a]/70 backdrop-blur-sm border border-white/10 rounded-xl p-5">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-semibold text-white flex items-center gap-2">
          <div className="w-4 h-4 flex items-center justify-center"><i className="ri-file-shield-line text-blue-400"></i></div>
          Policies Due Review
        </h3>
        {policies.length > 0 && (
          <span className="text-xs px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-400 font-medium">{policies.length} policies</span>
        )}
      </div>

      {policies.length === 0 ? (
        <div className="flex items-center gap-2 p-3 bg-emerald-500/5 rounded-lg">
          <div className="w-4 h-4 flex items-center justify-center"><i className="ri-check-fill text-emerald-400"></i></div>
          <span className="text-xs text-emerald-400">No policies due for review in next 30 days.</span>
        </div>
      ) : (
        <div className="space-y-2">
          {policies.map((policy) => (
            <div key={policy.id} className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
              <div className="min-w-0 flex-1">
                <p className="text-xs font-medium text-white truncate">{policy.title}</p>
                {policy.policy_type && <p className="text-[11px] text-gray-500">{policy.policy_type}</p>}
              </div>
              <div className="flex flex-col items-end flex-shrink-0 ml-3">
                <span className={`text-xs font-bold ${policy.days_until < 0 ? 'text-red-400' : policy.days_until <= 7 ? 'text-amber-400' : 'text-blue-400'}`}>
                  {policy.days_until < 0 ? `${Math.abs(policy.days_until)}d overdue` : `${policy.days_until}d left`}
                </span>
                <span className="text-[10px] text-gray-500">{new Date(policy.review_date).toLocaleDateString('en-GB')}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}