import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { user_id, company_id, permission_key } = await req.json();

    if (!user_id || !company_id || !permission_key) {
      return new Response(
        JSON.stringify({ error: 'Missing required fields' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    );

    const { data: perms, error } = await supabaseAdmin
      .from('role_permissions')
      .select('level,roles!inner(name)')
      .eq('company_id', company_id)
      .eq('permission_key', permission_key)
      .in(
        'role_id',
        (await supabaseAdmin
          .from('user_roles')
          .select('role_id')
          .eq('user_id', user_id)
          .eq('company_id', company_id)).data?.map((r: any) => r.role_id) || []
      );

    if (error) throw error;

    const hasOwner = perms?.some((p: any) => p.roles?.name === 'Account Owner');
    const hasAccess = perms?.some((p: any) => p.level !== 'no_access');

    const levelWeights: Record<string, number> = {
      no_access: 0, view: 1, create: 2, edit: 3, approve: 4, delete: 5, manage: 6,
    };
    let highest = 'no_access';
    (perms || []).forEach((p: any) => {
      if (levelWeights[p.level] > levelWeights[highest]) highest = p.level;
    });

    return new Response(
      JSON.stringify({
        has_permission: hasOwner || hasAccess,
        highest_level: highest,
        is_owner: hasOwner,
      }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (err: any) {
    return new Response(
      JSON.stringify({ error: err.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
