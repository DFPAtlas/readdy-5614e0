import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";

const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY")!;
const FROM_EMAIL = Deno.env.get("FROM_EMAIL") || "onboarding@resend.dev";
const SITE_URL = Deno.env.get("SITE_URL") || "";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

function buildEmailHtml(notification: any, company: any, brandColor: string, baseUrl: string): string {
  const severity = notification.severity || "info";
  const severityColors: Record<string, string> = {
    critical: "#ef4444",
    warning: "#f59e0b",
    info: "#3b82f6",
  };
  const barColor = severityColors[severity] || brandColor;
  const viewUrl = notification.link ? `${baseUrl}${notification.link}` : `${baseUrl}/dashboard`;
  const settingsUrl = `${baseUrl}/dashboard/settings?tab=notifications`;
  const safeBody = (notification.body || "You have a new notification.").replace(/</g, "&lt;").replace(/>/g, "&gt;");

  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${notification.title.replace(/</g, "&lt;")}</title>
  <style>
    @media only screen and (max-width:600px){
      .container{width:100%!important;padding:12px!important}
      .title{font-size:16px!important}
      .btn{padding:10px 20px!important;font-size:13px!important}
    }
  </style>
</head>
<body style="margin:0;padding:0;background-color:#f4f6f8;font-family:'Segoe UI',Roboto,Helvetica,Arial,sans-serif;-webkit-font-smoothing:antialiased;">
  <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%">
    <tr>
      <td align="center" class="container" style="padding:24px 16px;">
        <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="600" style="max-width:600px;width:100%;background:#ffffff;border-radius:12px;overflow:hidden;box-shadow:0 2px 8px rgba(0,0,0,0.06);">
          <tr><td style="height:6px;background:${barColor};font-size:0;line-height:0;">&nbsp;</td></tr>
          <tr>
            <td style="padding:24px 24px 12px;">
              <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%">
                <tr>
                  <td>
                    <p style="margin:0;font-size:16px;font-weight:700;color:#111827;letter-spacing:-0.2px;">${company?.name ? company.name.replace(/</g, "&lt;") : "GuardianHub"}</p>
                  </td>
                  <td align="right">
                    <p style="margin:0;font-size:11px;color:#9ca3af;text-transform:uppercase;letter-spacing:0.5px;">Alert</p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          <tr>
            <td style="padding:0 24px 8px;">
              <h2 class="title" style="margin:0;font-size:18px;font-weight:600;color:${barColor};line-height:1.4;">${notification.title.replace(/</g, "&lt;")}</h2>
            </td>
          </tr>
          <tr>
            <td style="padding:0 24px 20px;">
              <p style="margin:0;font-size:15px;color:#374151;line-height:1.6;">${safeBody}</p>
            </td>
          </tr>
          <tr>
            <td style="padding:0 24px 24px;">
              <a href="${viewUrl}" class="btn" style="display:inline-block;background:${brandColor};color:#ffffff;text-decoration:none;padding:12px 28px;border-radius:8px;font-size:14px;font-weight:600;box-shadow:0 2px 6px rgba(0,0,0,0.12);">View in GuardianHub</a>
            </td>
          </tr>
          <tr>
            <td style="padding:0 24px 16px;">
              <p style="margin:0;font-size:12px;color:#9ca3af;">
                ${notification.type.replace(/_/g, " ").replace(/\b\w/g, (c: string) => c.toUpperCase())} &middot; ${severity.charAt(0).toUpperCase() + severity.slice(1)} severity
              </p>
            </td>
          </tr>
          <tr>
            <td style="padding:16px 24px;background:#f9fafb;border-top:1px solid #e5e7eb;">
              <p style="margin:0 0 8px;font-size:12px;color:#9ca3af;">
                ${company?.name ? company.name.replace(/</g, "&lt;") : "GuardianHub"} Security Operations
              </p>
              <p style="margin:0;font-size:12px;color:#9ca3af;">
                <a href="${settingsUrl}" style="color:${brandColor};text-decoration:none;font-weight:500;">Manage notification preferences</a>
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `.trim();
}

function isQuietHours(now: Date, start: string | null, end: string | null): boolean {
  if (!start || !end) return false;
  const nowMinutes = now.getHours() * 60 + now.getMinutes();
  const [sh, sm] = start.split(":").map(Number);
  const [eh, em] = end.split(":").map(Number);
  const startMinutes = sh * 60 + sm;
  const endMinutes = eh * 60 + em;

  if (startMinutes < endMinutes) {
    return nowMinutes >= startMinutes && nowMinutes < endMinutes;
  }
  return nowMinutes >= startMinutes || nowMinutes < endMinutes;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 204, headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    );

    let body: any;
    try { body = await req.json(); } catch {
      return new Response(JSON.stringify({ error: "Invalid JSON body" }), { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }
    const notificationId = body.notification_id;

    if (!notificationId) {
      return new Response(JSON.stringify({ error: "notification_id required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { data: notification, error: notifError } = await supabase
      .from("notifications")
      .select("*")
      .eq("id", notificationId)
      .single();

    if (notifError || !notification) {
      return new Response(JSON.stringify({ error: "Notification not found" }), {
        status: 404,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { data: user, error: userError } = await supabase
      .from("users")
      .select("id, email, first_name, last_name, company_id")
      .eq("id", notification.user_id)
      .maybeSingle();

    if (userError || !user) {
      return new Response(JSON.stringify({ error: "User not found" }), {
        status: 404,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { data: prefs } = await supabase
      .from("notification_preferences")
      .select("*")
      .eq("user_id", user.id)
      .maybeSingle();

    const emailEnabled = prefs?.email_enabled ?? true;
    const typePrefs = prefs?.type_preferences || {};
    const typePref = typePrefs[notification.type] || { in_app: true, email: false, push: false, sms: false };
    const quietStart = prefs?.quiet_hours_start || "22:00";
    const quietEnd = prefs?.quiet_hours_end || "07:00";

    let suppressReason: string | null = null;

    if (!emailEnabled) {
      suppressReason = "email_disabled";
    } else if (!typePref.email) {
      suppressReason = "type_disabled";
    } else if (notification.severity !== "critical" && isQuietHours(new Date(), quietStart, quietEnd)) {
      suppressReason = "quiet_hours";
    }

    if (suppressReason) {
      await supabase.from("notification_deliveries").insert({
        notification_id: notificationId,
        channel: "email",
        status: "suppressed",
        error: suppressReason,
      });
      return new Response(JSON.stringify({ status: "suppressed", reason: suppressReason }), {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { data: company } = await supabase
      .from("companies")
      .select("name, brand_color, logo_url")
      .eq("id", user.company_id)
      .maybeSingle();

    const brandColor = company?.brand_color || "#3b82f6";

    const toEmail = prefs?.email_address || user.email;
    if (!toEmail) {
      await supabase.from("notification_deliveries").insert({
        notification_id: notificationId,
        channel: "email",
        status: "failed",
        error: "no_email_address",
      });
      return new Response(JSON.stringify({ error: "No email address" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const html = buildEmailHtml(notification, company, brandColor, SITE_URL);

    const resendRes = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${RESEND_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: FROM_EMAIL,
        to: toEmail,
        subject: notification.title,
        html,
      }),
    });

    const resendData = await resendRes.json();

    if (!resendRes.ok) {
      await supabase.from("notification_deliveries").insert({
        notification_id: notificationId,
        channel: "email",
        status: "failed",
        error: resendData.message || JSON.stringify(resendData),
      });
      return new Response(JSON.stringify({ error: "Resend failed", detail: resendData }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    await supabase.from("notification_deliveries").insert({
      notification_id: notificationId,
      channel: "email",
      status: "sent",
    });

    return new Response(JSON.stringify({ status: "sent", resend_id: resendData.id }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err: any) {
    return new Response(JSON.stringify({ error: err.message || "Internal error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
