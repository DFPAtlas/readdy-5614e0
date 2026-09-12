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

    const { pay_run_id } = await req.json();
    if (!pay_run_id) return new Response(JSON.stringify({ error: 'pay_run_id required' }), { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });

    const { data: payRun, error: prError } = await supabase.from('pay_runs').select('*').eq('id', pay_run_id).maybeSingle();
    if (prError || !payRun) return new Response(JSON.stringify({ error: 'Pay run not found' }), { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });

    if (payRun.status !== 'draft') return new Response(JSON.stringify({ error: 'Only draft pay runs can be calculated' }), { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });

    const { data: workRecords, error: wrError } = await supabase.from('finance_work_records').select('*').eq('company_id', payRun.company_id).eq('status', 'approved').is('pay_run_id', null).gte('work_date', payRun.period_start).lte('work_date', payRun.period_end);

    if (wrError) return new Response(JSON.stringify({ error: wrError.message }), { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });

    let totalGross = 0;
    let guardCount = new Set<string>();

    for (const wr of (workRecords ?? [])) {
      guardCount.add(wr.guard_id);

      const { data: rateCard } = await supabase.from('guard_pay_rates').select('*').eq('id', wr.pay_rate_id).maybeSingle();

      if (!rateCard) {
        await supabase.from('finance_work_records').update({ status: 'needs_review', notes: 'Missing pay rate' }).eq('id', wr.id);
        continue;
      }

      const grossAmount = parseFloat((Number(wr.payable_hours) * Number(rateCard.amount)).toFixed(4));
      const trace = { hours: Number(wr.payable_hours), rate: Number(rateCard.amount), rate_id: rateCard.id, version: rateCard.version, formula: 'hours * rate' };

      await supabase.from('pay_run_lines').insert({
        company_id: payRun.company_id,
        pay_run_id: payRun.id,
        guard_id: wr.guard_id,
        work_record_id: wr.id,
        rate_card_id: rateCard.id,
        rate_version: rateCard.version,
        rate_category: rateCard.rate_type,
        quantity: Number(wr.payable_hours),
        unit_rate: Number(rateCard.amount),
        gross_amount: grossAmount,
        calculation_trace: trace,
      });

      totalGross += grossAmount;

      await supabase.from('finance_work_records').update({ status: 'included_in_pay_run', pay_run_id: payRun.id }).eq('id', wr.id);
    }

    await supabase.from('pay_runs').update({
      guard_count: guardCount.size,
      gross_pay_total: parseFloat(totalGross.toFixed(4)),
      net_total: parseFloat(totalGross.toFixed(4)),
      status: 'needs_review',
    }).eq('id', payRun.id);

    await supabase.from('finance_audit_log').insert({
      company_id: payRun.company_id,
      actor_id: user.id,
      action: 'pay_run_calculated',
      resource_type: 'pay_run',
      resource_id: payRun.id,
      new_values: { guard_count: guardCount.size, gross_pay_total: parseFloat(totalGross.toFixed(4)) },
    });

    return new Response(JSON.stringify({ success: true, guard_count: guardCount.size, gross_pay_total: parseFloat(totalGross.toFixed(4)) }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });

  } catch (err: any) {
    return new Response(JSON.stringify({ error: err.message }), { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
  }
});
