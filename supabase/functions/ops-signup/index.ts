import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.38.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { email, password, firstName, lastName, companyName, phone, companySize, type = 'ops' } = await req.json();

    if (!email || !password || !firstName || !lastName || !companyName) {
      return new Response(
        JSON.stringify({ error: 'Missing required fields' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
      { auth: { autoRefreshToken: false, persistSession: false } }
    );

    // Create auth user
    const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: { first_name: firstName, last_name: lastName },
    });

    if (authError || !authData.user) {
      return new Response(
        JSON.stringify({ error: authError?.message || 'Failed to create user', code: 'AUTH_ERROR' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const userId = authData.user.id;

    // Hard block: super_admin can NEVER be created through public signup
    const userRole = type === 'ops' ? 'company_admin' : 'client';
    if (userRole === 'super_admin') {
      await supabaseAdmin.auth.admin.deleteUser(userId);
      return new Response(
        JSON.stringify({ error: 'Invalid role', code: 'INVALID_ROLE' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Create a brand new company for this signup — every company gets its own isolated account
    const trialEndDate = new Date();
    trialEndDate.setDate(trialEndDate.getDate() + 14);

    const { data: companyData, error: companyError } = await supabaseAdmin
      .from('companies')
      .insert({
        name: companyName,
        contact_email: email,
        phone: phone || null,
        company_size: companySize || null,
        account_status: 'trial',
        trial_ends_at: trialEndDate.toISOString(),
        onboarding_status: 'pending_setup',
      })
      .select()
      .single();

    if (companyError || !companyData) {
      await supabaseAdmin.auth.admin.deleteUser(userId);
      return new Response(
        JSON.stringify({ error: companyError?.message || 'Failed to create company', code: 'COMPANY_ERROR' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const companyId = companyData.id;

    // Create user profile with company_id — this is the tenant isolation key
    const { error: userError } = await supabaseAdmin.from('users').insert({
      id: userId,
      company_id: companyId,
      role: userRole,
      first_name: firstName,
      last_name: lastName,
      email,
      phone: phone || null,
      status: 'active',
    });

    if (userError) {
      await supabaseAdmin.auth.admin.deleteUser(userId);
      await supabaseAdmin.from('companies').delete().eq('id', companyId);
      return new Response(
        JSON.stringify({ error: userError.message || 'Failed to create user profile', code: userError.code || 'PROFILE_ERROR' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // For client signup, also create client and client_users records
    if (type === 'client') {
      const { data: clientData, error: clientError } = await supabaseAdmin
        .from('clients')
        .insert({
          company_id: companyId,
          name: companyName,
          contact_email: email,
          phone: phone || null,
          status: 'active',
        })
        .select()
        .single();

      if (clientError || !clientData) {
        return new Response(
          JSON.stringify({ error: clientError?.message || 'Failed to create client record', code: 'CLIENT_ERROR' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      const { error: clientUserError } = await supabaseAdmin.from('client_users').insert({
        user_id: userId,
        client_id: clientData.id,
        company_id: companyId,
        role: 'admin',
      });

      if (clientUserError) {
        return new Response(
          JSON.stringify({ error: clientUserError.message || 'Failed to create client user', code: 'CLIENT_USER_ERROR' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
    }

    return new Response(
      JSON.stringify({ success: true, userId, companyId }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (err: any) {
    return new Response(
      JSON.stringify({ error: err.message || 'Internal server error', code: 'INTERNAL_ERROR' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
