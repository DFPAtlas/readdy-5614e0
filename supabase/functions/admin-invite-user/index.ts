import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });

  try {
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
      { auth: { autoRefreshToken: false, persistSession: false } }
    );

    let body: any;
    try { body = await req.json(); } catch {
      return new Response(JSON.stringify({ error: "Invalid JSON body" }), { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }
    const { email, first_name, last_name, role, company_id } = body;

    if (!email || !role) {
      return new Response(JSON.stringify({ error: 'Email and role are required' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const validRoles = ['super_admin', 'company_admin', 'operations_manager', 'guard', 'client'];
    if (!validRoles.includes(role)) {
      return new Response(JSON.stringify({ error: 'Invalid role' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const { data: existingUsers } = await supabaseAdmin.auth.admin.listUsers();
    const existingUser = existingUsers?.users?.find((u: any) => u.email === email);

    if (existingUser) {
      const { error: updateErr } = await supabaseAdmin
        .from('users')
        .update({ role, company_id: company_id || null, first_name, last_name })
        .eq('id', existingUser.id);

      if (updateErr) throw updateErr;

      return new Response(JSON.stringify({ success: true, message: 'User role updated', user_id: existingUser.id }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const { data: inviteData, error: inviteErr } = await supabaseAdmin.auth.admin.inviteUserByEmail(email, {
      data: { first_name, last_name, role, company_id },
    });

    if (inviteErr) throw inviteErr;

    const userId = inviteData?.user?.id;
    if (!userId) throw new Error('No user ID returned from invite');

    const { error: upsertErr } = await supabaseAdmin.from('users').upsert({
      id: userId,
      email,
      first_name: first_name || null,
      last_name: last_name || null,
      role,
      company_id: company_id || null,
      status: 'active',
    }, { onConflict: 'id' });

    if (upsertErr) throw upsertErr;

    return new Response(JSON.stringify({ success: true, message: 'Invitation sent', user_id: userId }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (err: any) {
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
