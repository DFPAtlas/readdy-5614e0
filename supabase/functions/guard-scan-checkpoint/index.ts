import { serve } from 'https://deno.land/std@0.192.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders, status: 204 });
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') || '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || '',
      { auth: { persistSession: false } }
    );

    const authHeader = req.headers.get('authorization');
    if (!authHeader) {
      return new Response(JSON.stringify({ error: 'Missing auth header' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 401,
      });
    }

    const { data: { user }, error: authError } = await supabase.auth.getUser(authHeader.replace('Bearer ', ''));
    if (authError || !user) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 401,
      });
    }

    let body: any = {};
    try { body = await req.json(); } catch { body = {}; }
    const { checkpoint_code, gps_latitude, gps_longitude, gps_accuracy, device_info } = body;

    if (!checkpoint_code) {
      return new Response(JSON.stringify({ error: 'checkpoint_code required' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      });
    }

    const { data: guardData } = await supabase
      .from('guards')
      .select('id, company_id, user_id')
      .eq('user_id', user.id)
      .maybeSingle();

    if (!guardData) {
      return new Response(JSON.stringify({ error: 'Guard profile not found' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 403,
      });
    }

    const guardId = guardData.id;
    const companyId = guardData.company_id;

    const { data: checkpoint } = await supabase
      .from('patrol_checkpoints')
      .select('*')
      .eq('checkpoint_code', checkpoint_code.toUpperCase().trim())
      .eq('is_active', true)
      .maybeSingle();

    if (!checkpoint) {
      return new Response(JSON.stringify({ error: 'Checkpoint not found or inactive' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 404,
      });
    }

    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);
    const todayEnd = new Date();
    todayEnd.setHours(23, 59, 59, 999);

    const { data: activeShift } = await supabase
      .from('shifts')
      .select('id')
      .eq('guard_id', guardId)
      .eq('site_id', checkpoint.site_id)
      .eq('company_id', companyId)
      .gte('start_time', todayStart.toISOString())
      .lte('start_time', todayEnd.toISOString())
      .eq('status', 'active')
      .maybeSingle();

    if (!activeShift) {
      return new Response(JSON.stringify({ error: 'You are not rostered to this site today' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 403,
      });
    }

    let distance = null;
    let status = 'completed';
    if (gps_latitude != null && gps_longitude != null && checkpoint.lat != null && checkpoint.lng != null) {
      const R = 6371000;
      const lat1 = (gps_latitude * Math.PI) / 180;
      const lat2 = (checkpoint.lat * Math.PI) / 180;
      const dLat = ((checkpoint.lat - gps_latitude) * Math.PI) / 180;
      const dLng = ((checkpoint.lng - gps_longitude) * Math.PI) / 180;
      const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
                Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLng / 2) * Math.sin(dLng / 2);
      const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
      distance = R * c;

      const radius = checkpoint.allowed_radius_meters || 50;
      if (distance > radius) {
        status = 'completed_outside_radius';
      }
    }

    const { data: scanData, error: scanError } = await supabase
      .from('patrol_scans')
      .insert({
        company_id: companyId,
        site_id: checkpoint.site_id,
        checkpoint_id: checkpoint.id,
        guard_id: guardId,
        rota_id: activeShift.id,
        scanned_at: new Date().toISOString(),
        gps_latitude: gps_latitude ?? null,
        gps_longitude: gps_longitude ?? null,
        gps_accuracy: gps_accuracy ?? null,
        distance_from_checkpoint: distance,
        status,
        device_info: device_info || null,
        notes: null,
      })
      .select()
      .single();

    if (scanError) {
      return new Response(JSON.stringify({ error: scanError.message }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      });
    }

    return new Response(JSON.stringify({
      success: true,
      scan: scanData,
      checkpoint: {
        name: checkpoint.name,
        site_id: checkpoint.site_id,
      },
      distance,
      status,
      within_radius: status === 'completed',
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    });
  } catch (err: any) {
    return new Response(JSON.stringify({ error: err.message || 'Server error' }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500,
    });
  }
});
