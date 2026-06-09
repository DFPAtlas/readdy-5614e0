import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.38.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const DEMO_COMPANIES = [
  { name: 'SecureOps UK Ltd', contact_email: 'admin@secureops.uk', phone: '+44 20 7946 0958', address: '123 Security Lane, London, EC2A 4NE', plan: 'titan', status: 'active', onboarding: 'complete', stripe_customer: 'cus_demo_001' },
  { name: 'Atlas Guard Services', contact_email: 'ops@atlasguard.co.uk', phone: '+44 161 496 0343', address: '45 Deansgate, Manchester, M3 2BR', plan: 'command', status: 'active', onboarding: 'complete', stripe_customer: 'cus_demo_002' },
  { name: 'Sentinel Protection Group', contact_email: 'info@sentinelgroup.co.uk', phone: '+44 113 496 0343', address: '12 Wellington Street, Leeds, LS1 4AP', plan: 'sentinel', status: 'active', onboarding: 'complete', stripe_customer: 'cus_demo_003' },
  { name: 'Vanguard Security Solutions', contact_email: 'contact@vanguardsec.com', phone: '+44 121 496 0343', address: '88 Broad Street, Birmingham, B15 1AU', plan: 'titan', status: 'active', onboarding: 'complete', stripe_customer: 'cus_demo_004' },
  { name: 'Phoenix Protective Services', contact_email: 'team@phoenixprotect.co.uk', phone: '+44 131 496 0343', address: '22 Castle Street, Edinburgh, EH2 3DN', plan: 'command', status: 'suspended', onboarding: 'complete', stripe_customer: 'cus_demo_005', suspended_at: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString() },
  { name: 'Shield Guard Management', contact_email: 'hello@shieldguard.uk', phone: '+44 141 496 0343', address: '56 Renfield Street, Glasgow, G2 1NF', plan: 'sentinel', status: 'pending_setup', onboarding: 'incomplete', stripe_customer: null },
  { name: 'NorthStar Security', contact_email: 'admin@northstarsec.com', phone: '+44 2920 123 456', address: '77 Queen Street, Cardiff, CF10 2AH', plan: 'titan', status: 'active', onboarding: 'complete', stripe_customer: 'cus_demo_006' },
  { name: 'IronGate Protective', contact_email: 'info@irongate.uk', phone: '+44 117 496 0343', address: '34 Park Street, Bristol, BS1 5JG', plan: 'sentinel', status: 'cancelled', onboarding: 'complete', stripe_customer: 'cus_demo_007', cancelled_at: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString() },
  { name: 'Defence Force Ltd', contact_email: 'ops@defenceforce.co.uk', phone: '+44 20 7946 0959', address: '99 Victoria Street, London, SW1H 0HW', plan: 'command', status: 'active', onboarding: 'complete', stripe_customer: 'cus_demo_008' },
  { name: 'Titan Security Group', contact_email: 'team@titansg.com', phone: '+44 20 7946 0960', address: '77 Fenchurch Street, London, EC3M 4BS', plan: 'titan', status: 'active', onboarding: 'complete', stripe_customer: 'cus_demo_009' },
];

const DEMO_SITES = [
  'Canary Wharf Tower', 'Heathrow Terminal 5', 'Harrods Knightsbridge', 'Manchester Arena', 'Old Trafford Stadium',
  'Edinburgh Castle', 'Birmingham New Street', 'Cardiff Millennium Stadium', 'Bristol Royal Infirmary', 'London Eye',
  'The Shard', 'Wembley Stadium', 'O2 Arena', 'Buckingham Palace', 'Tate Modern',
  'Westfield London', 'St Paul\'s Cathedral', 'Tower of London', 'Royal Albert Hall', 'Hyde Park',
];

const DEMO_FIRST_NAMES = ['James', 'Sarah', 'Michael', 'Emma', 'David', 'Lisa', 'Robert', 'Jennifer', 'William', 'Amanda', 'Thomas', 'Rachel', 'Christopher', 'Rebecca', 'Daniel'];
const DEMO_LAST_NAMES = ['Smith', 'Johnson', 'Williams', 'Brown', 'Jones', 'Garcia', 'Miller', 'Davis', 'Rodriguez', 'Martinez', 'Hernandez', 'Lopez', 'Gonzalez', 'Wilson', 'Anderson'];
const DEMO_ROLES = ['company_admin', 'operations_manager', 'guard', 'guard', 'guard'];

function generateUsers(companyId: string, count: number) {
  const users = [];
  for (let i = 0; i < count; i++) {
    const firstName = DEMO_FIRST_NAMES[Math.floor(Math.random() * DEMO_FIRST_NAMES.length)];
    const lastName = DEMO_LAST_NAMES[Math.floor(Math.random() * DEMO_LAST_NAMES.length)];
    const role = DEMO_ROLES[i % DEMO_ROLES.length];
    users.push({
      id: crypto.randomUUID(),
      company_id: companyId,
      role,
      first_name: firstName,
      last_name: lastName,
      email: `${firstName.toLowerCase()}.${lastName.toLowerCase()}${i}@${firstName.toLowerCase()}demo.com`,
      phone: `+44 7${Math.floor(Math.random() * 10)}${Math.floor(Math.random() * 1000000000).toString().padStart(9, '0')}`,
      status: 'active',
    });
  }
  return users;
}

function generateSites(companyId: string, count: number) {
  const sites = [];
  const shuffled = [...DEMO_SITES].sort(() => 0.5 - Math.random());
  for (let i = 0; i < Math.min(count, shuffled.length); i++) {
    sites.push({
      id: crypto.randomUUID(),
      company_id: companyId,
      site_name: shuffled[i],
      address: `${Math.floor(Math.random() * 200)} Sample Road, London, ${['EC1A', 'SW1A', 'E1', 'N1', 'W1'][Math.floor(Math.random() * 5)]} ${Math.floor(Math.random() * 9)}${String.fromCharCode(65 + Math.floor(Math.random() * 26))}`,
      risk_level: ['low', 'medium', 'high'][Math.floor(Math.random() * 3)],
      status: 'active',
    });
  }
  return sites;
}

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
    .select('role, company_id')
    .eq('id', user.id)
    .maybeSingle();

  if (!profile || profile.role !== 'super_admin') return null;
  return { userId: user.id, profile };
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const secret = Deno.env.get('ADMIN_SETUP_SECRET');
    let bodySecret: string | undefined;
    try {
      const parsed = await req.json();
      bodySecret = parsed.secret;
    } catch { /* no body */ }

    if (!secret || bodySecret !== secret) {
      return new Response(
        JSON.stringify({ error: 'Invalid or missing setup secret' }),
        { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const admin = await verifySuperAdmin(req);
    if (!admin) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized. Only authenticated super_admin can seed data.' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
      { auth: { autoRefreshToken: false, persistSession: false } }
    );

    const seeded = { companies: 0, users: 0, sites: 0, notes: 0, logs: 0, modulesEnabled: 0 };

    for (const company of DEMO_COMPANIES) {
      const companyId = crypto.randomUUID();
      const { error: companyError } = await supabaseAdmin.from('companies').insert({
        id: companyId,
        name: company.name,
        contact_email: company.contact_email,
        phone: company.phone,
        address: company.address,
        account_status: company.status,
        onboarding_status: company.onboarding,
        plan_name: company.plan.charAt(0).toUpperCase() + company.plan.slice(1),
        subscription_plan: company.plan,
        subscription_status: company.status === 'active' ? 'active' : (company.status === 'cancelled' ? 'canceled' : null),
        stripe_customer_id: company.stripe_customer,
        trial_ends_at: company.status === 'active' ? null : new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(),
        suspended_at: company.suspended_at || null,
        cancelled_at: company.cancelled_at || null,
        archived_at: null,
      });
      if (!companyError) {
        seeded.companies++;

        const siteCount = Math.floor(Math.random() * 4) + 2;
        const sites = generateSites(companyId, siteCount);
        if (sites.length > 0) {
          const { error: sitesError } = await supabaseAdmin.from('sites').insert(sites);
          if (!sitesError) seeded.sites += sites.length;
        }

        const userCount = Math.floor(Math.random() * 6) + 3;
        const users = generateUsers(companyId, userCount);
        if (users.length > 0) {
          const { error: usersError } = await supabaseAdmin.from('users').insert(users);
          if (!usersError) seeded.users += users.length;
        }
      }
    }

    const { data: seededCompanies } = await supabaseAdmin.from('companies').select('id, name').order('created_at', { ascending: false }).limit(5);
    const { data: superAdmin } = await supabaseAdmin.from('users').select('id').eq('role', 'super_admin').limit(1).single();

    if (seededCompanies && superAdmin) {
      const noteTemplates = [
        { note: 'Initial onboarding call completed. Client excited to get started.', category: 'onboarding' },
        { note: 'Stripe payment method verified. Subscription active.', category: 'billing' },
        { note: 'Requested additional guard training module. Quoted separately.', category: 'sales' },
        { note: 'Support ticket #1423 resolved: mobile app login issue.', category: 'support' },
        { note: 'API integration discussion scheduled for next week.', category: 'technical' },
      ];

      for (const company of seededCompanies) {
        const notes = noteTemplates.map((t, i) => ({
          company_id: company.id,
          note: t.note,
          category: t.category,
          created_by: superAdmin.id,
          created_at: new Date(Date.now() - i * 24 * 60 * 60 * 1000).toISOString(),
        }));
        const { error: notesError } = await supabaseAdmin.from('admin_notes').insert(notes);
        if (!notesError) seeded.notes += notes.length;
      }
    }

    if (superAdmin) {
      const activityLogs = [
        { action: 'client_created', description: 'New client onboarded: SecureOps UK Ltd', metadata: { plan: 'titan' } },
        { action: 'client_status_change', description: 'Phoenix Protective Services suspended for non-payment', metadata: { previous: 'active', new: 'suspended' } },
        { action: 'plan_changed', description: 'Atlas Guard upgraded from Sentinel to Command', metadata: { previous: 'sentinel', new: 'command' } },
        { action: 'admin_note_added', description: 'Billing note added for Vanguard Security', metadata: { category: 'billing' } },
        { action: 'client_created', description: 'New client onboarded: Titan Security Group', metadata: { plan: 'titan' } },
        { action: 'client_status_change', description: 'IronGate Protective account cancelled at client request', metadata: { previous: 'active', new: 'cancelled' } },
      ];

      const { data: allCompanies } = await supabaseAdmin.from('companies').select('id, name');
      const logs = activityLogs.map((log, i) => ({
        action: log.action,
        description: log.description,
        company_id: allCompanies?.[i % (allCompanies?.length || 1)]?.id || null,
        performed_by: superAdmin.id,
        metadata: log.metadata,
        created_at: new Date(Date.now() - i * 12 * 60 * 60 * 1000).toISOString(),
      }));

      const { error: logsError } = await supabaseAdmin.from('admin_activity_log').insert(logs);
      if (!logsError) seeded.logs += logs.length;
    }

    const { data: allModules } = await supabaseAdmin.from('modules').select('id');
    const { data: allCompanies } = await supabaseAdmin.from('companies').select('id');
    if (allModules && allCompanies) {
      const enabledModules = [];
      for (const company of allCompanies) {
        for (const mod of allModules) {
          enabledModules.push({ company_id: company.id, module_id: mod.id, enabled: true });
        }
      }
      if (enabledModules.length > 0) {
        const { error: modError } = await supabaseAdmin.from('company_enabled_modules').upsert(enabledModules, { onConflict: 'company_id, module_id' });
        if (!modError) seeded.modulesEnabled += enabledModules.length;
      }
    }

    return new Response(
      JSON.stringify({ success: true, message: 'Demo data seeded successfully', seeded }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (err: any) {
    return new Response(
      JSON.stringify({ error: err.message || 'Internal server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
