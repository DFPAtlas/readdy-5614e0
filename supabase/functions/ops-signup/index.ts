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
    let body: any;
    try { body = await req.json(); } catch {
      return new Response(JSON.stringify({ error: "Invalid JSON body" }), { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }
    const { email, password, firstName, lastName, companyName, phone, companySize, type = 'ops' } = body;

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

    const userRole = type === 'ops' ? 'company_admin' : 'client';
    if (userRole === 'super_admin') {
      await supabaseAdmin.auth.admin.deleteUser(userId);
      return new Response(
        JSON.stringify({ error: 'Invalid role', code: 'INVALID_ROLE' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

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
        subscription_status: 'trialing',
        subscription_plan: null,
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

    const DEFAULT_ROLES = [
      { name: 'Account Owner', description: 'Full access to all features and company management', is_system: true, is_default: false },
      { name: 'Superuser', description: 'Full access to all features except billing', is_system: true, is_default: false },
      { name: 'Area Manager', description: 'Manage multiple sites, rotas, staff and incidents', is_system: true, is_default: true },
      { name: 'Site Manager', description: 'Manage a single site, rotas, and incidents', is_system: true, is_default: false },
      { name: 'Control Room Staff', description: 'Monitor operations, incidents, and check calls', is_system: true, is_default: false },
      { name: 'Security Officer', description: 'View patrols, incidents, and SOPs for assigned site', is_system: true, is_default: false },
      { name: 'Client Viewer', description: 'View reports, incidents and client portal data only', is_system: true, is_default: false },
    ];

    const DEFAULT_PERMISSIONS: Record<string, Record<string, string>> = {
      'Account Owner': {
        dashboard: 'manage', staff: 'manage', sites: 'manage', rotas: 'manage',
        shift_patterns: 'manage', book_on_off: 'manage', occurrence_book: 'manage',
        incidents: 'manage', patrols: 'manage', check_calls: 'manage',
        risk_assessments: 'manage', sop_documents: 'manage', assignment_instructions: 'manage',
        client_portal: 'manage', reports: 'manage', ai_tools: 'manage',
        billing: 'manage', settings: 'manage', roles: 'manage',
      },
      'Superuser': {
        dashboard: 'manage', staff: 'manage', sites: 'manage', rotas: 'manage',
        shift_patterns: 'manage', book_on_off: 'manage', occurrence_book: 'manage',
        incidents: 'manage', patrols: 'manage', check_calls: 'manage',
        risk_assessments: 'manage', sop_documents: 'manage', assignment_instructions: 'manage',
        client_portal: 'manage', reports: 'manage', ai_tools: 'manage',
        billing: 'view', settings: 'manage', roles: 'manage',
      },
      'Area Manager': {
        dashboard: 'manage', staff: 'manage', sites: 'edit', rotas: 'manage',
        shift_patterns: 'edit', book_on_off: 'view', occurrence_book: 'edit',
        incidents: 'edit', patrols: 'view', check_calls: 'view',
        risk_assessments: 'edit', sop_documents: 'edit', assignment_instructions: 'edit',
        client_portal: 'view', reports: 'view', ai_tools: 'view',
        billing: 'no_access', settings: 'view', roles: 'no_access',
      },
      'Site Manager': {
        dashboard: 'view', staff: 'view', sites: 'view', rotas: 'manage',
        shift_patterns: 'view', book_on_off: 'view', occurrence_book: 'edit',
        incidents: 'edit', patrols: 'view', check_calls: 'view',
        risk_assessments: 'view', sop_documents: 'view', assignment_instructions: 'view',
        client_portal: 'no_access', reports: 'view', ai_tools: 'no_access',
        billing: 'no_access', settings: 'no_access', roles: 'no_access',
      },
      'Control Room Staff': {
        dashboard: 'manage', staff: 'view', sites: 'view', rotas: 'view',
        shift_patterns: 'no_access', book_on_off: 'manage', occurrence_book: 'edit',
        incidents: 'edit', patrols: 'view', check_calls: 'manage',
        risk_assessments: 'no_access', sop_documents: 'view', assignment_instructions: 'no_access',
        client_portal: 'no_access', reports: 'view', ai_tools: 'no_access',
        billing: 'no_access', settings: 'no_access', roles: 'no_access',
      },
      'Security Officer': {
        dashboard: 'view', staff: 'no_access', sites: 'view', rotas: 'view',
        shift_patterns: 'no_access', book_on_off: 'create', occurrence_book: 'create',
        incidents: 'create', patrols: 'create', check_calls: 'view',
        risk_assessments: 'no_access', sop_documents: 'view', assignment_instructions: 'view',
        client_portal: 'no_access', reports: 'no_access', ai_tools: 'no_access',
        billing: 'no_access', settings: 'no_access', roles: 'no_access',
      },
      'Client Viewer': {
        dashboard: 'view', staff: 'no_access', sites: 'view', rotas: 'no_access',
        shift_patterns: 'no_access', book_on_off: 'no_access', occurrence_book: 'no_access',
        incidents: 'view', patrols: 'view', check_calls: 'no_access',
        risk_assessments: 'view', sop_documents: 'view', assignment_instructions: 'no_access',
        client_portal: 'view', reports: 'view', ai_tools: 'no_access',
        billing: 'no_access', settings: 'no_access', roles: 'no_access',
      },
    };

    const { data: createdRoles } = await supabaseAdmin.from('roles').insert(
      DEFAULT_ROLES.map(d => ({ ...d, company_id: companyId }))
    ).select('*');

    let accountOwnerRoleId: string | null = null;
    if (createdRoles) {
      const rpInserts: any[] = [];
      for (const role of createdRoles) {
        const perms = DEFAULT_PERMISSIONS[role.name];
        if (perms) {
          for (const [key, level] of Object.entries(perms)) {
            rpInserts.push({ role_id: role.id, company_id: companyId, permission_key: key, level });
          }
        }
        if (role.name === 'Account Owner') accountOwnerRoleId = role.id;
      }
      if (rpInserts.length > 0) {
        await supabaseAdmin.from('role_permissions').insert(rpInserts);
      }
    }

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

    if (accountOwnerRoleId) {
      await supabaseAdmin.from('user_roles').insert({
        user_id: userId,
        role_id: accountOwnerRoleId,
        company_id: companyId,
        is_primary: true,
      });
    }

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

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    EdgeRuntime.waitUntil(
      fetch(`${supabaseUrl}/functions/v1/send-welcome-email`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${supabaseServiceKey}`,
        },
        body: JSON.stringify({ user_id: userId }),
      }).catch(() => {})
    );

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
