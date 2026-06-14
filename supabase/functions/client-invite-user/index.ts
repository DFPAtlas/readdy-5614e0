import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.38.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

function generateTempPassword() {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%';
  let pw = '';
  for (let i = 0; i < 12; i++) {
    pw += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return pw;
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
      { auth: { autoRefreshToken: false, persistSession: false } }
    );

    const authHeader = req.headers.get('authorization');
    if (!authHeader) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }

    const token = authHeader.replace('Bearer ', '');
    const { data: { user: caller }, error: authError } = await supabaseAdmin.auth.getUser(token);
    if (authError || !caller) {
      return new Response(JSON.stringify({ error: 'Invalid token' }), { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }

    const { data: callerProfile } = await supabaseAdmin
      .from('users')
      .select('company_id, role')
      .eq('id', caller.id)
      .maybeSingle();

    if (!callerProfile || callerProfile.role !== 'client') {
      return new Response(JSON.stringify({ error: 'Only client portal users can manage team members' }), { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }

    const { data: callerClientUser } = await supabaseAdmin
      .from('client_users')
      .select('client_id, role')
      .eq('user_id', caller.id)
      .maybeSingle();

    if (!callerClientUser?.client_id) {
      return new Response(JSON.stringify({ error: 'Client not found' }), { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }

    const clientId = callerClientUser.client_id;
    const companyId = callerProfile.company_id;
    const callerRole = callerClientUser.role;

    let body: any;
    try { body = await req.json(); } catch {
      return new Response(JSON.stringify({ error: "Invalid JSON body" }), { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }
    const { action = 'invite', email, firstName, lastName, role, clientUserId } = body;

    if (action === 'remove') {
      if (!clientUserId) {
        return new Response(JSON.stringify({ error: 'Missing clientUserId' }), { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
      }

      if (callerRole !== 'admin') {
        return new Response(JSON.stringify({ error: 'Only admin users can remove team members' }), { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
      }

      const { data: target } = await supabaseAdmin
        .from('client_users')
        .select('client_id, user_id')
        .eq('id', clientUserId)
        .maybeSingle();

      if (!target || target.client_id !== clientId) {
        return new Response(JSON.stringify({ error: 'Not authorized to remove this user' }), { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
      }

      if (target.user_id === caller.id) {
        return new Response(JSON.stringify({ error: 'You cannot remove yourself' }), { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
      }

      const { error } = await supabaseAdmin.from('client_users').delete().eq('id', clientUserId);
      if (error) {
        return new Response(JSON.stringify({ error: error.message }), { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
      }

      return new Response(JSON.stringify({ success: true }), { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }

    if (callerRole !== 'admin') {
      return new Response(JSON.stringify({ error: 'Only admin users can invite team members' }), { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }

    if (!email || !firstName || !lastName || !role) {
      return new Response(JSON.stringify({ error: 'Missing required fields: email, firstName, lastName, role' }), { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }

    const { data: existingProfile } = await supabaseAdmin
      .from('users')
      .select('id, email')
      .eq('email', email)
      .eq('company_id', companyId)
      .maybeSingle();

    let userId: string;
    let isExisting = false;

    if (existingProfile) {
      userId = existingProfile.id;
      isExisting = true;

      const { data: existingLink } = await supabaseAdmin
        .from('client_users')
        .select('id')
        .eq('user_id', userId)
        .eq('client_id', clientId)
        .maybeSingle();

      if (existingLink) {
        return new Response(JSON.stringify({ error: 'This user is already a member of your client portal' }), { status: 409, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
      }
    } else {
      const tempPassword = generateTempPassword();
      const { data: authData, error: createError } = await supabaseAdmin.auth.admin.createUser({
        email,
        password: tempPassword,
        email_confirm: true,
        user_metadata: { first_name: firstName, last_name: lastName },
      });

      if (createError) {
        if (createError.message?.toLowerCase().includes('already') || createError.code === 'email_exists') {
          return new Response(
            JSON.stringify({ error: 'This email is already registered in the system. Please contact your security provider to link this account.' }),
            { status: 409, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }
        return new Response(JSON.stringify({ error: createError.message || 'Failed to create user account' }), { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
      }

      if (!authData.user) {
        return new Response(JSON.stringify({ error: 'Failed to create user account' }), { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
      }

      userId = authData.user.id;

      const { error: profileError } = await supabaseAdmin.from('users').insert({
        id: userId,
        company_id: companyId,
        role: 'client',
        first_name: firstName,
        last_name: lastName,
        email,
        status: 'active',
      });

      if (profileError) {
        await supabaseAdmin.auth.admin.deleteUser(userId);
        return new Response(JSON.stringify({ error: profileError.message || 'Failed to create user profile' }), { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
      }
    }

    const { error: linkError } = await supabaseAdmin.from('client_users').insert({
      company_id: companyId,
      client_id: clientId,
      user_id: userId,
      role,
    });

    if (linkError) {
      return new Response(JSON.stringify({ error: linkError.message || 'Failed to link user to client portal' }), { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }

    return new Response(
      JSON.stringify({ success: true, userId, isExisting }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (err: any) {
    return new Response(
      JSON.stringify({ error: err.message || 'Internal server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
