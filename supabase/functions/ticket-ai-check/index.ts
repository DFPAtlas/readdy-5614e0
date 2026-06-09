import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
    if (!supabaseUrl || !serviceRoleKey) {
      return new Response(JSON.stringify({ error: 'Server config error' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey, {
      auth: { autoRefreshToken: false, persistSession: false },
    });

    const authHeader = req.headers.get('authorization');
    if (!authHeader) {
      return new Response(JSON.stringify({ error: 'Missing auth header' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const { data: { user }, error: userErr } = await supabaseAdmin.auth.getUser(authHeader.replace('Bearer ', ''));
    if (userErr || !user) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const { data: adminCheck } = await supabaseAdmin.rpc('is_super_admin', { check_user_id: user.id });
    if (!adminCheck) {
      return new Response(JSON.stringify({ error: 'Forbidden: super admin only' }), {
        status: 403,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const body = await req.json();
    const { ticketId, companyId, affectedUserId } = body;

    if (!ticketId || !companyId) {
      return new Response(JSON.stringify({ error: 'Missing ticketId or companyId' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Fetch safe account data
    const results: any = {};

    // Company info
    const { data: company } = await supabaseAdmin.from('companies').select('*').eq('id', companyId).maybeSingle();
    results.company = company ? { id: company.id, name: company.name, status: company.account_status || 'active', subscription_plan: company.subscription_plan || 'none' } : null;

    // Company users
    const { data: companyUsers } = await supabaseAdmin.from('users').select('id, first_name, last_name, email, role, status, created_at').eq('company_id', companyId);
    results.users = (companyUsers || []).map((u: any) => ({ id: u.id, name: `${u.first_name || ''} ${u.last_name || ''}`.trim(), email: u.email, role: u.role, status: u.status }));

    // Affected user if specified
    if (affectedUserId) {
      const { data: affected } = await supabaseAdmin.from('users').select('*').eq('id', affectedUserId).maybeSingle();
      results.affected_user = affected ? { id: affected.id, email: affected.email, role: affected.role, status: affected.status, company_id: affected.company_id } : null;

      // Check role assignment
      const { data: userRoles } = await supabaseAdmin.from('user_roles').select('*').eq('user_id', affectedUserId);
      results.affected_user_roles = userRoles || [];

      // Check site access
      const { data: siteAccess } = await supabaseAdmin.from('user_site_access').select('site_id, sites(site_name)').eq('user_id', affectedUserId);
      results.affected_user_site_access = (siteAccess || []).map((s: any) => ({ site_id: s.site_id, site_name: s.sites?.site_name }));
    }

    // Sites for company
    const { data: sites } = await supabaseAdmin.from('sites').select('id, site_name, address, status').eq('company_id', companyId);
    results.sites = (sites || []).map((s: any) => ({ id: s.id, name: s.site_name, status: s.status }));

    // Recent incidents
    const { data: incidents } = await supabaseAdmin.from('incidents').select('id, title, status, created_at').eq('company_id', companyId).order('created_at', { ascending: false }).limit(5);
    results.recent_incidents = (incidents || []).map((i: any) => ({ id: i.id, title: i.title, status: i.status }));

    // Billing check
    const { data: subscriptions } = await supabaseAdmin.from('billing_subscription_events').select('*').eq('company_id', companyId).order('created_at', { ascending: false }).limit(3);
    results.recent_billing_events = (subscriptions || []).map((s: any) => ({ type: s.event_type, status: s.status, created_at: s.created_at }));

    // AI analysis
    const openAiKey = Deno.env.get('OPENAI_API_KEY');
    let aiResult: any = {};

    if (openAiKey) {
      const prompt = `You are an AI support analyst for GuardianHub, a security guard management platform.

Analyze this account data and identify likely issues:

Company: ${JSON.stringify(results.company)}
Users: ${JSON.stringify(results.users)}
Sites: ${JSON.stringify(results.sites)}
Affected User: ${JSON.stringify(results.affected_user)}
User Roles: ${JSON.stringify(results.affected_user_roles)}
Site Access: ${JSON.stringify(results.affected_user_site_access)}
Recent Incidents: ${JSON.stringify(results.recent_incidents)}
Recent Billing: ${JSON.stringify(results.recent_billing_events)}

Return ONLY a JSON object with these exact keys:
- likely_cause: a clear description of the most probable root cause
- suggested_fix: specific steps to resolve
- risk_level: one of "low", "medium", "high", "critical"
- recommended_action: one specific safe repair action from: "relink_user", "restore_role", "resync_stripe", "recreate_profile", or "manual_review"

Be concise and factual.`;

      const aiResponse = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${openAiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'gpt-4o-mini',
          messages: [
            { role: 'system', content: 'You are a precise technical support analyst. Always respond with valid JSON only.' },
            { role: 'user', content: prompt },
          ],
          temperature: 0.2,
          max_tokens: 800,
        }),
      });

      if (aiResponse.ok) {
        const aiData = await aiResponse.json();
        const content = aiData.choices?.[0]?.message?.content || '{}';
        try {
          const cleaned = content.replace(/```json\n?|\n?```/g, '').trim();
          aiResult = JSON.parse(cleaned);
        } catch {
          aiResult = {
            likely_cause: 'Unable to parse AI response',
            suggested_fix: 'Please review account data manually',
            risk_level: 'medium',
            recommended_action: 'manual_review',
          };
        }
      }
    } else {
      // Fallback without OpenAI
      const affected = results.affected_user;
      const hasRole = results.affected_user_roles?.length > 0;
      const hasSiteAccess = results.affected_user_site_access?.length > 0;
      const companyMatch = affected && affected.company_id === companyId;

      if (affected && !companyMatch) {
        aiResult = {
          likely_cause: 'User account is linked to a different company than expected',
          suggested_fix: 'Re-link the user to the correct company and verify site permissions',
          risk_level: 'high',
          recommended_action: 'relink_user',
        };
      } else if (affected && !hasRole) {
        aiResult = {
          likely_cause: 'User exists but has no role assignments',
          suggested_fix: 'Restore the missing role assignment for this user',
          risk_level: 'high',
          recommended_action: 'restore_role',
        };
      } else if (affected && !hasSiteAccess && results.sites?.length > 0) {
        aiResult = {
          likely_cause: 'User has no site access permissions',
          suggested_fix: 'Grant site access or verify the user should have access to specific sites',
          risk_level: 'medium',
          recommended_action: 'manual_review',
        };
      } else {
        aiResult = {
          likely_cause: 'No obvious structural issue detected in safe data',
          suggested_fix: 'Investigate further or check application-level logs',
          risk_level: 'low',
          recommended_action: 'manual_review',
        };
      }
    }

    return new Response(JSON.stringify({
      ...aiResult,
      raw_data: results,
    }), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (err: any) {
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
