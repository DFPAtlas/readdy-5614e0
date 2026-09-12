import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const TEMPLATES: Record<string, { subject: string; html: (vars: Record<string, string>) => string }> = {
  trial_started: {
    subject: "Your GuardianHub trial has started",
    html: (v) => `<p>Hi ${v.company_name},</p><p>Your ${v.plan_name} trial is now active. You have <strong>15 days</strong> to explore all features.</p><p><a href="${v.dashboard_url}">Go to your dashboard</a></p>`,
  },
  trial_ending: {
    subject: "Your GuardianHub trial ends soon",
    html: (v) => `<p>Hi ${v.company_name},</p><p>Your ${v.plan_name} trial ends in <strong>${v.days_left} days</strong>. Add a payment method to continue uninterrupted.</p><p><a href="${v.billing_url}">Manage billing</a></p>`,
  },
  subscription_activated: {
    subject: "Your GuardianHub subscription is active",
    html: (v) => `<p>Hi ${v.company_name},</p><p>Your ${v.plan_name} subscription is now active. Your next billing date is ${v.next_billing}.</p><p><a href="${v.dashboard_url}">Go to your dashboard</a></p>`,
  },
  plan_changed: {
    subject: "Your GuardianHub plan has changed",
    html: (v) => `<p>Hi ${v.company_name},</p><p>Your plan has changed from <strong>${v.old_plan}</strong> to <strong>${v.new_plan}</strong>.</p><p><a href="${v.billing_url}">View billing details</a></p>`,
  },
  payment_succeeded: {
    subject: "Payment received - GuardianHub",
    html: (v) => `<p>Hi ${v.company_name},</p><p>Your payment of <strong>${v.amount}</strong> for ${v.plan_name} was successful.</p><p><a href="${v.invoice_url || v.billing_url}">View invoice</a></p>`,
  },
  payment_failed: {
    subject: "Payment failed - Action required",
    html: (v) => `<p>Hi ${v.company_name},</p><p>Your payment of <strong>${v.amount}</strong> for ${v.plan_name} has failed.</p><p>Please update your payment method to avoid service interruption.</p><p><a href="${v.billing_url}">Update payment method</a></p>`,
  },
  grace_period_started: {
    subject: "Your subscription is in grace period",
    html: (v) => `<p>Hi ${v.company_name},</p><p>Your ${v.plan_name} subscription is now in a grace period. Some premium features may be restricted.</p><p><a href="${v.billing_url}">Resolve billing</a></p>`,
  },
  grace_period_ending: {
    subject: "Grace period ending - GuardianHub",
    html: (v) => `<p>Hi ${v.company_name},</p><p>Your grace period ends in <strong>${v.days_left} days</strong>. Please resolve your payment to retain access.</p><p><a href="${v.billing_url}">Resolve billing</a></p>`,
  },
  cancellation_scheduled: {
    subject: "Your GuardianHub subscription will be cancelled",
    html: (v) => `<p>Hi ${v.company_name},</p><p>Your ${v.plan_name} subscription will be cancelled on ${v.cancel_date}. You will retain access until then.</p><p><a href="${v.billing_url}">Manage subscription</a></p>`,
  },
  cancellation_completed: {
    subject: "Your GuardianHub subscription has ended",
    html: (v) => `<p>Hi ${v.company_name},</p><p>Your ${v.plan_name} subscription has been cancelled. Thank you for using GuardianHub.</p>`,
  },
  invoice_available: {
    subject: "New invoice available - GuardianHub",
    html: (v) => `<p>Hi ${v.company_name},</p><p>A new invoice for <strong>${v.amount}</strong> is available for your ${v.plan_name} subscription.</p><p><a href="${v.invoice_url}">View invoice</a></p>`,
  },
  refund_issued: {
    subject: "Refund issued - GuardianHub",
    html: (v) => `<p>Hi ${v.company_name},</p><p>A refund of <strong>${v.amount}</strong> has been issued to your payment method.</p>`,
  },
  dispute_opened: {
    subject: "Dispute notification - GuardianHub",
    html: (v) => `<p>Hi ${v.company_name},</p><p>A dispute has been opened for a charge of <strong>${v.amount}</strong>. Our team will review this.</p>`,
  },
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
    const resendKey = Deno.env.get("RESEND_API_KEY");
    const resendDomain = Deno.env.get("RESEND_FROM_DOMAIN");
    const canonicalUrl = Deno.env.get("CANONICAL_APP_URL") || "https://guardianhub.app";

    if (!supabaseUrl || !supabaseServiceKey) {
      return new Response(JSON.stringify({ error: "Server configuration error" }), {
        status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const admin = createClient(supabaseUrl, supabaseServiceKey);

    const body = await req.json();
    const { template_key, company_id, recipient_email, recipient_name, variables } = body || {};

    if (!template_key || !company_id || !recipient_email) {
      return new Response(JSON.stringify({ error: "Missing required fields: template_key, company_id, recipient_email" }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const template = TEMPLATES[template_key];
    if (!template) {
      return new Response(JSON.stringify({ error: `Unknown template: ${template_key}` }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const dedupKey = `billing_${template_key}_${company_id}_${new Date().toISOString().slice(0, 10)}`;

    const { data: existingJob } = await admin
      .from("notification_jobs")
      .select("id, status")
      .eq("deduplication_key", dedupKey)
      .maybeSingle();

    if (existingJob && existingJob.status === "sent") {
      return new Response(JSON.stringify({ sent: false, reason: "deduplicated", job_id: existingJob.id }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const vars = variables || {};
    vars.company_name = vars.company_name || "Valued Customer";
    vars.dashboard_url = vars.dashboard_url || `${canonicalUrl}/dashboard`;
    vars.billing_url = vars.billing_url || `${canonicalUrl}/dashboard/settings?tab=billing`;

    const htmlContent = template.html(vars);
    const subject = template.subject;

    const { data: job, error: jobError } = await admin
      .from("notification_jobs")
      .insert({
        company_id,
        recipient_email,
        recipient_name: recipient_name || null,
        template_key,
        variables: vars,
        priority: template_key.includes("failed") || template_key.includes("dispute") ? "critical" : "normal",
        deduplication_key: dedupKey,
        status: "pending",
        attempt_count: 0,
      })
      .select("id")
      .maybeSingle();

    if (jobError || !job) {
      return new Response(JSON.stringify({ error: "Failed to create notification job" }), {
        status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (resendKey && resendDomain) {
      try {
        const resendResponse = await fetch("https://api.resend.com/emails", {
          method: "POST",
          headers: {
            "Authorization": `Bearer ${resendKey}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            from: `GuardianHub <noreply@${resendDomain}>`,
            to: recipient_email,
            subject,
            html: htmlContent,
          }),
        });

        const resendData = await resendResponse.json();

        if (resendResponse.ok) {
          await admin.from("notification_jobs")
            .update({ status: "sent", sent_at: new Date().toISOString(), attempt_count: 1 })
            .eq("id", job.id);

          await admin.from("notification_deliveries").insert({
            notification_id: job.id,
            channel: "email",
            status: "sent",
            sent_at: new Date().toISOString(),
          });

          return new Response(JSON.stringify({ sent: true, job_id: job.id }), {
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          });
        } else {
          await admin.from("notification_jobs")
            .update({ status: "failed", error: JSON.stringify(resendData), attempt_count: 1, last_attempt_at: new Date().toISOString() })
            .eq("id", job.id);

          await admin.from("notification_deliveries").insert({
            notification_id: job.id,
            channel: "email",
            status: "failed",
            error: JSON.stringify(resendData),
          });

          return new Response(JSON.stringify({ sent: false, reason: "delivery_failed", job_id: job.id }), {
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          });
        }
      } catch (emailErr: any) {
        await admin.from("notification_jobs")
          .update({ status: "failed", error: emailErr.message, attempt_count: 1, last_attempt_at: new Date().toISOString() })
          .eq("id", job.id);
      }
    }

    return new Response(JSON.stringify({ sent: false, reason: "email_not_configured", job_id: job.id }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err: any) {
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
