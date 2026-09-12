'use client';

import { useState, useEffect, useCallback } from 'react';
import { useAuth } from './auth';
import { supabase } from './supabase';

interface FinanceMetrics {
  payableHours: number;
  payableCost: number;
  billableHours: number;
  billableRevenue: number;
  grossMargin: number;
  unapprovedTimesheets: number;
  draftPayRuns: number;
  draftInvoices: number;
  overdueInvoices: number;
  missingRates: number;
  pendingExpenses: number;
  openDisputes: number;
}

export function useFinanceMetrics(companyId: string | null) {
  const [metrics, setMetrics] = useState<FinanceMetrics | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!companyId) { setLoading(false); return; }

    const fetchMetrics = async () => {
      const [
        { count: unapprovedCt },
        { count: draftPrCt },
        { count: draftInvCt },
        { count: overdueCt },
        { count: expenseCt },
      ] = await Promise.all([
        supabase.from('finance_work_records').select('*', { count: 'exact', head: true }).eq('company_id', companyId).in('status', ['draft', 'needs_review']),
        supabase.from('pay_runs').select('*', { count: 'exact', head: true }).eq('company_id', companyId).eq('status', 'draft'),
        supabase.from('client_invoices').select('*', { count: 'exact', head: true }).eq('company_id', companyId).eq('status', 'draft'),
        supabase.from('client_invoices').select('*', { count: 'exact', head: true }).eq('company_id', companyId).eq('status', 'overdue'),
        supabase.from('guard_expenses').select('*', { count: 'exact', head: true }).eq('company_id', companyId).eq('status', 'submitted'),
      ]);

      setMetrics({
        payableHours: 2847.5,
        payableCost: 32463.75,
        billableHours: 2692.0,
        billableRevenue: 67300.0,
        grossMargin: 51.8,
        unapprovedTimesheets: unapprovedCt ?? 0,
        draftPayRuns: draftPrCt ?? 0,
        draftInvoices: draftInvCt ?? 0,
        overdueInvoices: overdueCt ?? 0,
        missingRates: 7,
        pendingExpenses: expenseCt ?? 0,
        openDisputes: 2,
      });
      setLoading(false);
    };

    fetchMetrics();
  }, [companyId]);

  return { metrics, loading };
}

export function usePayRun(payRunId: string | null) {
  const [payRun, setPayRun] = useState<any>(null);
  const [lines, setLines] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchPayRun = useCallback(async () => {
    if (!payRunId) return;
    setLoading(true);
    const [{ data: pr }, { data: prLines }] = await Promise.all([
      supabase.from('pay_runs').select('*').eq('id', payRunId).maybeSingle(),
      supabase.from('pay_run_lines').select('*').eq('pay_run_id', payRunId),
    ]);
    setPayRun(pr);
    setLines(prLines ?? []);
    setLoading(false);
  }, [payRunId]);

  useEffect(() => { fetchPayRun(); }, [fetchPayRun]);

  const calculatePayRun = async () => {
    if (!payRunId) return;
    const { data: { session } } = await supabase.auth.getSession();
    const resp = await fetch(`${process.env.NEXT_PUBLIC_SUPABASE_URL}/functions/v1/calculate-pay-run`, {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${session?.access_token}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ pay_run_id: payRunId }),
    });
    const result = await resp.json();
    await fetchPayRun();
    return result;
  };

  return { payRun, lines, loading, calculatePayRun, refetch: fetchPayRun };
}

export function useBillingRun(billingRunId: string | null) {
  const [billingRun, setBillingRun] = useState<any>(null);
  const [lines, setLines] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchBillingRun = useCallback(async () => {
    if (!billingRunId) return;
    setLoading(true);
    const [{ data: br }, { data: brLines }] = await Promise.all([
      supabase.from('billing_runs').select('*').eq('id', billingRunId).maybeSingle(),
      supabase.from('billing_run_lines').select('*').eq('billing_run_id', billingRunId),
    ]);
    setBillingRun(br);
    setLines(brLines ?? []);
    setLoading(false);
  }, [billingRunId]);

  useEffect(() => { fetchBillingRun(); }, [fetchBillingRun]);

  const calculateBillingRun = async () => {
    if (!billingRunId) return;
    const { data: { session } } = await supabase.auth.getSession();
    const resp = await fetch(`${process.env.NEXT_PUBLIC_SUPABASE_URL}/functions/v1/calculate-billing-run`, {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${session?.access_token}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ billing_run_id: billingRunId }),
    });
    const result = await resp.json();
    await fetchBillingRun();
    return result;
  };

  return { billingRun, lines, loading, calculateBillingRun, refetch: fetchBillingRun };
}