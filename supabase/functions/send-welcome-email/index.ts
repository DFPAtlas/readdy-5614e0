import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";

const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY")!;
const FROM_EMAIL = Deno.env.get("FROM_EMAIL") || "onboarding@resend.dev";
const SITE_URL = Deno.env.get("SITE_URL") || "";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

function buildWelcomeHtml(firstName: string, companyName: string, role: string, baseUrl: string): string {
  const isGuard = role === "guard";
  const isClient = role === "client";
  const dashboardUrl = isGuard ? `${baseUrl}/guard` : isClient ? `${baseUrl}/client` : `${baseUrl}/dashboard`;
  const safeFirstName = firstName.replace(/</g, "&lt;").replace(/>/g, "&gt;");
  const safeCompany = companyName.replace(/</g, "&lt;").replace(/>/g, "&gt;");

  const roleLabel = isGuard ? "security guard" : isClient ? "client" : "operations manager";

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Welcome to GuardianHub</title>
  <style>
    @media only screen and (max-width:600px){
      .container{width:100%!important;padding:12px!important}
      .title{font-size:18px!important}
      .btn{padding:12px 24px!important;font-size:14px!important}
    }
  </style>
</head>
<body style="margin:0;padding:0;background-color:#f4f6f8;font-family:'Segoe UI',Roboto,Helvetica,Arial,sans-serif;-webkit-font-smoothing:antialiased;">
  <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%">
    <tr>
      <td align="center" class="container" style="padding:24px 16px;">
        <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="600" style="max-width:600px;width:100%;background:#ffffff;border-radius:12px;overflow:hidden;box-shadow:0 2px 8px rgba(0,0,0,0.06);">
          <tr><td style="height:6px;background:#3b82f6;font-size:0;line-height:0;">&nbsp;</td></tr>
          <tr>
            <td style="padding:32px 32px 8px;">
              <p style="margin:0;font-size:20px;font-weight:700;color:#111827;letter-spacing:-0.2px;">GuardianHub</p>
            </td>
          </tr>
          <tr>
            <td style="padding:8px 32px 4px;">
              <h2 class="title" style="margin:0;font-size:22px;font-weight:700;color:#111827;line-height:1.3;">Welcome to GuardianHub, ${safeFirstName}!</h2>
            </td>
          </tr>
          <tr>
            <td style="padding:8px 32px 24px;">
              <p style="margin:0;font-size:15px;color:#374151;line-height:1.7;">
                Your ${safeCompany} account has been created. You are now registered as a <strong>${roleLabel}</strong> on the GuardianHub platform.
              </p>
            </td>
          </tr>
          <tr>
            <td style="padding:0 32px 20px;">
              <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%" style="background:#f0f7ff;border-radius:8px;border:1px solid #bfdbfe;">
                <tr>
                  <td style="padding:16px 20px;">
                    <p style="margin:0 0 6px;font-size:13px;font-weight:700;color:#1d4ed8;text-transform:uppercase;letter-spacing:0.5px;">Next Steps</p>
                    <p style="margin:0;font-size:14px;color:#1e40af;line-height:1.6;">
                      Head to your dashboard to complete your profile setup, explore your tools, and get started with GuardianHub.
                    </p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          <tr>
            <td style="padding:0 32px 32px;">
              <a href="${dashboardUrl}" class="btn" style="display:inline-block;background:#3b82f6;color:#ffffff;text-decoration:none;padding:14px 32px;border-radius:8px;font-size:15px;font-weight:600;box-shadow:0 2px 8px rgba(59,130,246,0.3);">Go to Your Dashboard</a>
            </td>
          </tr>
          <tr>
            <td style="padding:20px 32px;background:#f9fafb;border-top:1px solid #e5e7eb;">
              <p style="margin:0 0 6px;font-size:12px;color:#9ca3af;">
                GuardianHub &mdash; Security Operations Platform
              </p>
              <p style="margin:0;font-size:12px;color:#9ca3af;">
                If you did not create this account, please contact <a href="mailto:support@guardin-hub.uk" style="color:#3b82f6;text-decoration:none;">support@guardin-hub.uk</a>
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`.trim();
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
    const userId = body.user_id;

    if (!userId) {
      return new Response(JSON.stringify({ error: "user_id required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { data: user, error: userError } = await supabase
      .from("users")
      .select("id, email, first_name, last_name, role, company_id")
      .eq("id", userId)
      .maybeSingle();

    if (userError || !user) {
      return new Response(JSON.stringify({ error: "User not found" }), {
        status: 404,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (!user.email) {
      return new Response(JSON.stringify({ error: "User has no email" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { data: welcomeLog } = await supabase
      .from("email_assets")
      .select("id")
      .eq("asset_key", `welcome_sent_${userId}`)
      .maybeSingle();

    if (welcomeLog) {
      return new Response(JSON.stringify({ status: "duplicate", message: "Welcome email already sent for this user" }), {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { data: company } = await supabase
      .from("companies")
      .select("name")
      .eq("id", user.company_id)
      .maybeSingle();

    const companyName = company?.name || "GuardianHub";
    const firstName = user.first_name || user.email.split("@")[0];

    const html = buildWelcomeHtml(firstName, companyName, user.role, SITE_URL);

    const resendRes = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${RESEND_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: FROM_EMAIL,
        to: user.email,
        subject: `Welcome to GuardianHub, ${firstName}!`,
        html,
      }),
    });

    const resendData = await resendRes.json();

    if (!resendRes.ok) {
      await supabase.from("email_assets").insert({
        asset_key: `welcome_sent_${userId}`,
        asset_type: "welcome_email",
        asset_data: {
          user_id: userId,
          status: "failed",
          error: resendData.message || JSON.stringify(resendData),
          attempted_at: new Date().toISOString(),
        },
      });

      return new Response(JSON.stringify({ status: "failed", error: resendData.message || "Resend error" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    await supabase.from("email_assets").insert({
      asset_key: `welcome_sent_${userId}`,
      asset_type: "welcome_email",
      asset_data: {
        user_id: userId,
        status: "sent",
        resend_id: resendData.id,
        sent_to: user.email,
        sent_at: new Date().toISOString(),
      },
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
