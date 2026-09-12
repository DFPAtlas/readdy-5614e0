'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';

interface SuperAdminACSStats {
  companiesUsingACS: number;
  avgReadinessScore: number;
  companiesBelow65: number;
  criticalFindingsCount: number;
  expiringDocs30Days: number;
}

interface SuperAdminACSOverviewProps {
  loading?: boolean;
  error?: string | null;
}

export default function SuperAdminACSOverview({ loading: externalLoading, error: externalError }: SuperAdminACSOverviewProps) {
  const [stats, setStats] = useState<SuperAdminACSStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    async function fetchStats() {
      try {
        setLoading(true);
        const now = new Date();
        const thirtyDays = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000).toISOString();

        const [auditRunsRes, findingsRes, evidenceRes, policiesRes] = await Promise.all([
          supabase.from('acs_audit_runs').select('id, company_id, overall_score, status, created_at').order('created_at', { ascending: false }),
          supabase.from('acs_audit_findings').select('id, company_id, severity, status'),
          supabase.from('acs_evidence').select('id, company_id, expiry_date'),
          supabase.from('acs_policies').select('id, company_id, review_date'),
        ]);

        if (cancelled) return;

        const runs = auditRunsRes.data || [];
        const findings = findingsRes.data || [];
        const evidence = evidenceRes.data || [];
        const policies = policiesRes.data || [];

        const companySet = new Set<string>();
        runs.forEach(r => companySet.add(r.company_id));
        findings.forEach(f => companySet.add(f.company_id));
        evidence.forEach(e => companySet.add(e.company_id));

        const latestByCompany = new Map<string, number>();
        runs.forEach(r => {
          const existing = latestByCompany.get(r.company_id);
          if (existing === undefined || (r.overall_score ?? 0) > existing) {
            latestByCompany.set(r.company_id, r.overall_score ?? 0);
          }
        });

        const scores = Array.from(latestByCompany.values());
        const avgScore = scores.length > 0 ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length) : 0;
        const below65 = scores.filter(s => s < 65).length;

        const criticalFindings = findings.filter(f => f.severity === 'critical' && f.status === 'open').length;

        const expiringEvidence = evidence.filter(e => {
          return e.expiry_date && e.expiry_date >= now.toISOString() && e.expiry_date <= thirtyDays;
        }).length;
        const expiringPolicies = policies.filter(p => {
          return p.review_date && p.review_date >= now.toISOString() && p.review_date <= thirtyDays;
        }).length;

        if (!cancelled) {
          setStats({
            companiesUsingACS: companySet.size,
            avgReadinessScore: avgScore,
            companiesBelow65: below65,
            criticalFindingsCount: criticalFindings,
            expiringDocs30Days: expiringEvidence + expiringPolicies,
          });
          setError(null);
        }
      } catch (err: any) {
        if (!cancelled) setError(err.message || 'Failed to load ACS overview');
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    fetchStats();
    return () => { cancelled = true; };
  }, []);

  const isLoading = externalLoading || loading;
  const displayError = externalError || error;

  if (isLoading) {
    return (
      <div className="bg-[#0f172a]/70 backdrop-blur-sm border border-white/10 rounded-xl p-5 animate-pulse">
        <div className="flex items-center gap-2 mb-4">
          <div className="h-5 w-5 bg-white/5 rounded"></div>
          <div className="h-4 w-40 bg-white/5 rounded"></div>
        </div>
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="h-16 bg-white/5 rounded-lg"></div>
          ))}
        </div>
      </div>
    );
  }

  if (displayError) {
    return (
      <div className="bg-[#0f172a]/70 backdrop-blur-sm border border-red-500/20 rounded-xl p-5">
        <div className="flex items-center gap-2 mb-3">
          <div className="w-5 h-5 flex items-center justify-center text-red-400">
            <i className="ri-error-warning-line"></i>
          </div>
          <h3 className="text-sm font-semibold text-white">ACS Overview</h3>
        </div>
        <p className="text-xs text-red-400">{displayError}</p>
      </div>
    );
  }

  if (!stats) return null;

  return (
    <div className="bg-[#0f172a]/70 backdrop-blur-sm border border-white/10 rounded-xl p-5">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className="w-5 h-5 flex items-center justify-center text-amber-400">
            <i className="ri-shield-star-line"></i>
          </div>
          <h3 className="text-sm font-semibold text-white">ACS Compliance Overview</h3>
        </div>
        <Link
          href="/dashboard/acs-compliance"
          className="text-[10px] text-gray-500 hover:text-gray-300 transition-colors cursor-pointer whitespace-nowrap"
        >
          View ACS Centre →
        </Link>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-5 gap-2">
        <div className="bg-white/5 rounded-lg p-3 text-center">
          <p className="text-lg font-bold text-white">{stats.companiesUsingACS}</p>
          <p className="text-[10px] text-gray-400">Active Companies</p>
        </div>
        <div className="bg-white/5 rounded-lg p-3 text-center">
          <p className={`text-lg font-bold ${stats.avgReadinessScore >= 85 ? 'text-emerald-400' : stats.avgReadinessScore >= 60 ? 'text-amber-400' : 'text-red-400'}`}>
            {stats.avgReadinessScore}%
          </p>
          <p className="text-[10px] text-gray-400">Avg Readiness</p>
        </div>
        <div className="bg-white/5 rounded-lg p-3 text-center">
          <p className={`text-lg font-bold ${stats.companiesBelow65 > 0 ? 'text-red-400' : 'text-emerald-400'}`}>
            {stats.companiesBelow65}
          </p>
          <p className="text-[10px] text-gray-400">Below 65%</p>
        </div>
        <div className="bg-white/5 rounded-lg p-3 text-center">
          <p className={`text-lg font-bold ${stats.criticalFindingsCount > 0 ? 'text-red-400' : 'text-emerald-400'}`}>
            {stats.criticalFindingsCount}
          </p>
          <p className="text-[10px] text-gray-400">Critical Findings</p>
        </div>
        <div className="bg-white/5 rounded-lg p-3 text-center">
          <p className={`text-lg font-bold ${stats.expiringDocs30Days > 0 ? 'text-amber-400' : 'text-emerald-400'}`}>
            {stats.expiringDocs30Days}
          </p>
          <p className="text-[10px] text-gray-400">Expiring (30d)</p>
        </div>
      </div>
    </div>
  );
}