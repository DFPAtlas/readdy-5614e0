
import { serve } from 'https://deno.land/std@0.192.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

function haversineDistance(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R = 6371000;
  const toRad = (d: number) => (d * Math.PI) / 180;
  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);
  const a = Math.sin(dLat / 2) ** 2 + Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

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
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 401,
      });
    }

    const { data: { user }, error: authError } = await supabase.auth.getUser(authHeader.replace('Bearer ', ''));
    if (authError || !user) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 401,
      });
    }

    let body: any = {};
    try { body = await req.json(); } catch { body = {}; }

    const {
      checkpoint_code,
      phone_latitude,
      phone_longitude,
      phone_gps_accuracy_meters,
      device_user_agent,
      mode,
      photo_url,
      comment,
      patrol_log_id,
      offline_sync_id,
      ip_address,
    } = body;

    if (!checkpoint_code) {
      return new Response(JSON.stringify({ error: 'checkpoint_code required' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400,
      });
    }

    const code = checkpoint_code.toUpperCase().trim();

    const { data: checkpoint } = await supabase
      .from('patrol_checkpoints')
      .select('*')
      .eq('checkpoint_code', code)
      .eq('is_active', true)
      .maybeSingle();

    if (!checkpoint) {
      return new Response(JSON.stringify({ error: 'Checkpoint not found or inactive' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 404,
      });
    }

    const { data: userProfile } = await supabase
      .from('users')
      .select('id, role')
      .eq('id', user.id)
      .maybeSingle();

    if (!userProfile) {
      return new Response(JSON.stringify({ error: 'User profile not found' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 403,
      });
    }

    const isAdmin = ['super_admin', 'company_admin', 'operations_manager'].includes(userProfile.role);
    const companyId = checkpoint.company_id;

    if (isAdmin && mode === 'activate') {
      const { data: adminProfile } = await supabase
        .from('users')
        .select('company_id')
        .eq('id', user.id)
        .maybeSingle();

      if (!adminProfile || adminProfile.company_id !== companyId) {
        return new Response(JSON.stringify({ error: 'Not authorised for this company' }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 403,
        });
      }

      if (!phone_latitude || !phone_longitude) {
        return new Response(JSON.stringify({ error: 'GPS coordinates required for activation' }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400,
        });
      }

      const { error: updateError } = await supabase
        .from('patrol_checkpoints')
        .update({
          approved_latitude: phone_latitude,
          approved_longitude: phone_longitude,
          approved_gps_accuracy_meters: phone_gps_accuracy_meters || null,
          approved_by: user.id,
          approved_at: new Date().toISOString(),
          gps_capture_status: 'approved',
          updated_at: new Date().toISOString(),
        })
        .eq('id', checkpoint.id)
        .eq('company_id', companyId);

      if (updateError) {
        return new Response(JSON.stringify({ error: updateError.message }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500,
        });
      }

      return new Response(JSON.stringify({
        success: true,
        mode: 'activate',
        message: 'GPS location approved for checkpoint',
        checkpoint: { id: checkpoint.id, name: checkpoint.name, code: checkpoint.checkpoint_code },
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200,
      });
    }

    const { data: guardData } = await supabase
      .from('guards')
      .select('id, company_id, user_id')
      .eq('user_id', user.id)
      .maybeSingle();

    if (!guardData) {
      return new Response(JSON.stringify({ error: 'Guard profile not found' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 403,
      });
    }

    const guardId = guardData.id;
    const userId = user.id;

    const { data: guardAssignment } = await supabase
      .from('guard_site_assignments')
      .select('id')
      .eq('guard_id', guardId)
      .eq('site_id', checkpoint.site_id)
      .maybeSingle();

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
      .in('status', ['active', 'scheduled'])
      .maybeSingle();

    const { data: activeAttendance } = await supabase
      .from('attendance_logs')
      .select('id')
      .eq('guard_id', guardId)
      .eq('site_id', checkpoint.site_id)
      .is('clock_out', null)
      .maybeSingle();

    if (!guardAssignment && !activeShift) {
      return new Response(JSON.stringify({
        error: 'You are not assigned to this site',
        scan_status: 'unassigned_site',
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 403,
      });
    }

    if (patrol_log_id) {
      const { data: patrolLog } = await supabase
        .from('patrol_logs')
        .select('id, status, guard_id')
        .eq('id', patrol_log_id)
        .maybeSingle();

      if (!patrolLog || patrolLog.status !== 'active') {
        return new Response(JSON.stringify({ error: 'No active patrol session found. Start a patrol first.' }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400,
        });
      }

      if (patrolLog.guard_id !== guardId) {
        return new Response(JSON.stringify({ error: 'This patrol session belongs to another guard.' }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 403,
        });
      }
    }

    if (patrol_log_id) {
      const { data: existingScan } = await supabase
        .from('patrol_scans')
        .select('id')
        .eq('patrol_log_id', patrol_log_id)
        .eq('checkpoint_id', checkpoint.id)
        .maybeSingle();

      if (existingScan) {
        return new Response(JSON.stringify({
          success: true,
          scan: existingScan,
          already_scanned: true,
          message: 'This checkpoint was already scanned in this patrol session.',
        }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200,
        });
      }
    }

    let gpsStatus = 'gps_unavailable';
    let gpsVerified = false;
    let distance: number | null = null;
    let finalScanStatus = 'valid';
    const approvedLat = checkpoint.approved_latitude || checkpoint.lat;
    const approvedLng = checkpoint.approved_longitude || checkpoint.lng;

    if (phone_latitude != null && phone_longitude != null) {
      if (phone_gps_accuracy_meters != null && phone_gps_accuracy_meters > 100) {
        gpsStatus = 'gps_low_accuracy';
      } else if (approvedLat != null && approvedLng != null) {
        distance = haversineDistance(phone_latitude, phone_longitude, approvedLat, approvedLng);
        const radius = checkpoint.expected_radius_meters || checkpoint.allowed_radius_meters || 25;

        if (distance <= radius) {
          gpsStatus = 'verified';
          gpsVerified = true;
        } else {
          gpsStatus = 'outside_radius';
          finalScanStatus = 'manual_review';
        }
      } else {
        gpsStatus = 'checkpoint_not_approved';
        finalScanStatus = 'manual_review';
      }
    } else {
      gpsStatus = 'gps_unavailable';
      finalScanStatus = 'manual_review';
    }

    if (checkpoint.requires_photo && !photo_url) {
      return new Response(JSON.stringify({
        error: 'Photo required for this checkpoint',
        requires_photo: true,
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400,
      });
    }

    if (checkpoint.requires_comment && !comment) {
      return new Response(JSON.stringify({
        error: 'Comment required for this checkpoint',
        requires_comment: true,
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400,
      });
    }

    if (offline_sync_id) {
      const { data: existing } = await supabase
        .from('patrol_scans')
        .select('id')
        .eq('offline_sync_id', offline_sync_id)
        .eq('company_id', companyId)
        .maybeSingle();

      if (existing) {
        return new Response(JSON.stringify({
          success: true, scan: existing, already_synced: true, message: 'Scan already synced',
        }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200,
        });
      }
    }

    const scanPayload: any = {
      company_id: companyId,
      site_id: checkpoint.site_id,
      checkpoint_id: checkpoint.id,
      checkpoint_code: code,
      guard_id: guardId,
      user_id: userId,
      shift_id: activeShift?.id || null,
      attendance_log_id: activeAttendance?.id || null,
      rota_id: activeShift?.id || null,
      patrol_log_id: patrol_log_id || null,
      scanned_at: new Date().toISOString(),
      phone_latitude: phone_latitude || null,
      phone_longitude: phone_longitude || null,
      phone_gps_accuracy_meters: phone_gps_accuracy_meters || null,
      gps_latitude: phone_latitude || null,
      gps_longitude: phone_longitude || null,
      gps_accuracy: phone_gps_accuracy_meters || null,
      approved_latitude: approvedLat || null,
      approved_longitude: approvedLng || null,
      distance_from_checkpoint: distance,
      gps_verified: gpsVerified,
      gps_status: gpsStatus,
      scan_status: finalScanStatus,
      status: finalScanStatus,
      device_user_agent: device_user_agent || null,
      device_info: device_user_agent || null,
      ip_address: ip_address || null,
      photo_url: photo_url || null,
      comment: comment || null,
      offline_sync_id: offline_sync_id || null,
      notes: comment || null,
      metadata: {},
    };

    const { data: scanData, error: scanError } = await supabase
      .from('patrol_scans')
      .insert(scanPayload)
      .select()
      .single();

    if (scanError) {
      return new Response(JSON.stringify({ error: scanError.message }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500,
      });
    }

    if (gpsStatus === 'outside_radius' || finalScanStatus === 'manual_review') {
      const { data: notifRecipients } = await supabase
        .from('users')
        .select('id')
        .eq('company_id', companyId)
        .in('role', ['company_admin', 'operations_manager'])
        .limit(10);

      if (notifRecipients && notifRecipients.length > 0) {
        const notifications = notifRecipients.map((r: any) => ({
          user_id: r.id,
          company_id: companyId,
          title: gpsStatus === 'outside_radius' ? 'Patrol scan outside GPS radius' : 'Patrol scan needs review',
          body: `${checkpoint.name} — ${Math.round(distance || 0)}m from approved location`,
          severity: 'high',
          type: 'patrol_qr',
          link: '/dashboard/patrol-monitoring',
        }));

        await supabase.from('notifications').insert(notifications);
      }
    }

    let responseMessage = 'Checkpoint scanned successfully';
    if (gpsStatus === 'outside_radius') responseMessage = 'Scanned outside approved radius — flagged for review';
    else if (gpsStatus === 'checkpoint_not_approved') responseMessage = 'Checkpoint GPS not yet activated — review required';
    else if (gpsStatus === 'gps_unavailable') responseMessage = 'Scanned without GPS — review required';
    else if (gpsStatus === 'gps_low_accuracy') responseMessage = 'GPS accuracy too low — review required';

    return new Response(JSON.stringify({
      success: true,
      mode: 'scan',
      scan: scanData,
      checkpoint: {
        id: checkpoint.id,
        name: checkpoint.name,
        code: checkpoint.checkpoint_code,
        site_id: checkpoint.site_id,
      },
      distance,
      gps_verified: gpsVerified,
      gps_status: gpsStatus,
      scan_status: finalScanStatus,
      message: responseMessage,
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200,
    });
  } catch (err: any) {
    return new Response(JSON.stringify({ error: err.message || 'Server error' }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500,
    });
  }
});
