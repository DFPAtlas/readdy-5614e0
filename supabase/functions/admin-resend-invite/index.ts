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
    const { email } = body;

    if (!email) {
      return new Response(JSON.stringify({ error: 'Email is required' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const { data: { users: authUsers }, error: listErr } = await supabaseAdmin.auth.admin.listUsers();
    if (listErr) throw listErr;

    const existingUser = authUsers?.find((u: any) => u.email === email);

    if (!existingUser) {
      const { data: inviteData, error: inviteErr } = await supabaseAdmin.auth.admin.inviteUserByEmail(email);
      if (inviteErr) throw inviteErr;

      return new Response(JSON.stringify({ success: true, message: 'Invitation sent' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    if (existingUser.email_confirmed_at) {
      return new Response(JSON.stringify({ error: 'User has already accepted the invitation. Send a password reset instead.' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const { data: publicUser } = await supabaseAdmin
      .from('users')
      .select('first_name, last_name, role, company_id, status')
      .eq('id', existingUser.id)
      .maybeSingle();

    const { error: deleteErr } = await supabaseAdmin.auth.admin.deleteUser(existingUser.id);
    if (deleteErr) throw deleteErr;

    await supabaseAdmin.from('users').delete().eq('id', existingUser.id);

    const { data: inviteData, error: inviteErr } = await supabaseAdmin.auth.admin.inviteUserByEmail(email, {
      data: {
        first_name: publicUser?.first_name || null,
        last_name: publicUser?.last_name || null,
        role: publicUser?.role || 'company_admin',
        company_id: publicUser?.company_id || null,
      },
    });

    if (inviteErr) throw inviteErr;

    const newUserId = inviteData?.user?.id;
    if (newUserId) {
      await supabaseAdmin.from('users').upsert({
        id: newUserId,
        email,
        first_name: publicUser?.first_name || null,
        last_name: publicUser?.last_name || null,
        role: publicUser?.role || 'company_admin',
        company_id: publicUser?.company_id || null,
        status: publicUser?.status || 'active',
      }, { onConflict: 'id' });
    }

    return new Response(JSON.stringify({ success: true, message: 'Invitation resent' }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (err: any) {
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
