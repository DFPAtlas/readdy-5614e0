import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = { 'Access-Control-Allow-Origin': '*', 'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type' };

serve(async (req: Request) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });

  try {
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });

    const supabase = createClient(Deno.env.get('SUPABASE_URL') ?? '', Deno.env.get('SUPABASE_ANON_KEY') ?? '', { global: { headers: { Authorization: authHeader } } });
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });

    const { billing_run_id } = await req.json();
    if (!billing_run_id) return new Response(JSON.stringify({ error: 'billing_run_id required' }), { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });

    const { data: billingRun, error: brError } = await supabase.from('billing_runs').select('*').eq('id', billing_run_id).maybeSingle();
    if (brError || !billingRun) return new Response(JSON.stringify({ error: 'Billing run not found' }), { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });

    if (billingRun.status !== 'draft') return new Response(JSON.stringify({ error: 'Only draft billing runs can be calculated' }), { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });

    const { data: workRecords, error: wrError } = await supabase.from('finance_work_records').select('*').eq('company_id', billingRun.company_id).eq('client_id', billingRun.client_id).eq('status', 'approved').is('billing_run_id', null).gte('work_date', billingRun.period_start).lte('work_date', billingRun.period_end);

    if (wrError) return new Response(JSON.stringify({ error: wrError.message }), { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });

    let netTotal = 0;
    let vatTotal = 0;
    const defaultVat = 20.00;

    for (const wr of (workRecords ?? [])) {
      const { data: rateCard } = await supabase.from('client_charge_rates').select('*').eq('id', wr.charge_rate_id).maybeSingle();

      if (!rateCard) {
        await supabase.from('finance_work_records').update({ status: 'needs_review', notes: 'Missing charge rate' }).eq('id', wr.id);
        continue;
      }

      const netAmount = parseFloat((Number(wr.billable_hours) * Number(rateCard.amount)).toFixed(4));
      const vatRate = Number(rateCard.vat_rate ?? defaultVat);
      const vatAmount = parseFloat((netAmount * vatRate / 100).toFixed(4));
      const totalAmount = parseFloat((netAmount + vatAmount).toFixed(4));

      const trace = { hours: Number(wr.billable_hours), rate: Number(rateCard.amount), rate_id: rateCard.id, version: rateCard.version, vat_rate: vatRate, formula: 'hours * rate, vat applied' };

      await supabase.from('billing_run_lines').insert({
        company_id: billingRun.company_id,
        billing_run_id: billingRun.id,
        client_id: wr.client_id,
        site_id: wr.site_id,
        work_record_id: wr.id,
        rate_card_id: rateCard.id,
        rate_version: rateCard.version,
        service_date: wr.work_date,
        description: rateCard.name,
        quantity: Number(wr.billable_hours),
        unit_rate: Number(rateCard.amount),
        net_amount: netAmount,
        vat_rate: vatRate,
        vat_amount: vatAmount,
        total_amount: totalAmount,
        calculation_trace: trace,
      });

      netTotal += netAmount;
      vatTotal += vatAmount;

      await supabase.from('finance_work_records').update({ status: 'included_in_billing_run', billing_run_id: billingRun.id }).eq('id', wr.id);
    }

    const grossTotal = parseFloat((netTotal + vatTotal).toFixed(4));

    await supabase.from('billing_runs').update({
      net_total: parseFloat(netTotal.toFixed(4)),
      vat_total: parseFloat(vatTotal.toFixed(4)),
      gross_total: grossTotal,
      status: 'needs_review',
    }).eq('id', billingRun.id);

    await supabase.from('finance_audit_log').insert({
      company_id: billingRun.company_id,
      actor_id: user.id,
      action: 'billing_run_calculated',
      resource_type: 'billing_run',
      resource_id: billingRun.id,
      new_values: { net_total: parseFloat(netTotal.toFixed(4)), gross_total: grossTotal },
    });

    return new Response(JSON.stringify({ success: true, net_total: parseFloat(netTotal.toFixed(4)), vat_total: parseFloat(vatTotal.toFixed(4)), gross_total: grossTotal }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });

  } catch (err: any) {
    return new Response(JSON.stringify({ error: err.message }), { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
  }
});
