import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.38.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

async function verifySuperAdmin(req: Request) {
  const authHeader = req.headers.get('authorization');
  if (!authHeader) return null;

  const token = authHeader.replace('Bearer ', '');
  const supabaseVerify = createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_ANON_KEY')!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  );

  const { data: { user }, error } = await supabaseVerify.auth.getUser(token);
  if (error || !user) return null;

  const supabaseAdmin = createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  );

  const { data: profile } = await supabaseAdmin
    .from('users')
    .select('role')
    .eq('id', user.id)
    .maybeSingle();

  if (!profile || profile.role !== 'super_admin') return null;
  return { userId: user.id };
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    let body: any = {};
    try { body = await req.json(); } catch { /* no body */ }
    const secret = Deno.env.get('ADMIN_SETUP_SECRET');

    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
      { auth: { autoRefreshToken: false, persistSession: false } }
    );

    const { data: existingSuperAdmins } = await supabaseAdmin
      .from('users')
      .select('id')
      .eq('role', 'super_admin')
      .limit(1);

    const isFirstSetup = !existingSuperAdmins || existingSuperAdmins.length === 0;

    // Secret required for additional admins, optional for first setup
    if (!isFirstSetup && (!secret || body.secret !== secret)) {
      return new Response(
        JSON.stringify({ error: 'Invalid or missing setup secret' }),
        { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (!isFirstSetup) {
      const admin = await verifySuperAdmin(req);
      if (!admin) {
        return new Response(
          JSON.stringify({ error: 'A super admin already exists. Only an existing authenticated super_admin can create more.' }),
          { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
    }

    const { email, password, first_name, last_name } = body;
    if (!email || !password || password.length < 12) {
      return new Response(
        JSON.stringify({ error: 'Email and password (min 12 chars) required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const { data: existingUsers } = await supabaseAdmin.auth.admin.listUsers();
    const existingUser = existingUsers?.users?.find((u: any) => u.email === email);

    let userId: string;

    if (existingUser) {
      userId = existingUser.id;
      await supabaseAdmin.auth.admin.updateUserById(userId, { password });
    } else {
      const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
        email,
        password,
        email_confirm: true,
        user_metadata: { first_name: first_name || 'Admin', last_name: last_name || 'Admin' },
      });

      if (authError || !authData.user) {
        return new Response(
          JSON.stringify({ error: authError?.message || 'Failed to create auth user' }),
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      userId = authData.user.id;
    }

    const { data: existingCompany } = await supabaseAdmin
      .from('companies')
      .select('id')
      .eq('name', 'Guardian Hub Platform')
      .maybeSingle();

    let companyId: string;

    if (existingCompany) {
      companyId = existingCompany.id;
    } else {
      const { data: companyData, error: companyError } = await supabaseAdmin
        .from('companies')
        .insert({
          name: 'Guardian Hub Platform',
          contact_email: email,
          phone: '+44 20 7946 0958',
          address: 'London, UK',
          account_status: 'active',
          onboarding_status: 'complete',
          plan_name: 'Enterprise',
          subscription_plan: 'titan',
          subscription_status: 'active',
        })
        .select()
        .single();

      if (companyError || !companyData) {
        return new Response(
          JSON.stringify({ error: companyError?.message || 'Failed to create company' }),
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      companyId = companyData.id;
    }

    const { data: existingProfile } = await supabaseAdmin
      .from('users')
      .select('id')
      .eq('id', userId)
      .maybeSingle();

    if (existingProfile) {
      await supabaseAdmin.from('users').update({
        role: 'super_admin',
        company_id: companyId,
        first_name: first_name || 'Admin',
        last_name: last_name || 'Admin',
        email,
        status: 'active',
      }).eq('id', userId);
    } else {
      const { error: profileError } = await supabaseAdmin.from('users').insert({
        id: userId,
        company_id: companyId,
        role: 'super_admin',
        first_name: first_name || 'Admin',
        last_name: last_name || 'Admin',
        email,
        status: 'active',
      });

      if (profileError) {
        return new Response(
          JSON.stringify({ error: profileError.message || 'Failed to create profile' }),
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
    }

    return new Response(
      JSON.stringify({
        success: true,
        message: 'Super admin account created successfully.',
      }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (err: any) {
    return new Response(
      JSON.stringify({ error: err.message || 'Internal server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
