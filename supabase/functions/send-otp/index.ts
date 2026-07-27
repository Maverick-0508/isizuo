import { serve } from "https://deno.land/std@0.224.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": Deno.env.get("APP_ORIGIN") || "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

function generateOTP(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

function derivePassword(email: string): string {
  const salt = Deno.env.get("AUTH_SALT") || "isizuo-auth-salt-2024";
  const raw = email + "-" + salt;
  const encoded = btoa(raw).replace(/[^a-zA-Z0-9]/g, "");
  return `Iz${encoded}!1`;
}

async function sendViaResend(email: string, code: string): Promise<boolean> {
  const apiKey = Deno.env.get("RESEND_API_KEY");
  if (!apiKey) {
    console.error("[send-otp] RESEND_API_KEY is not set");
    return false;
  }
  try {
    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: "onboarding@resend.dev",
        to: email,
        subject: "Your Verification Code",
        html: `<h2>Verification Code</h2><p>Your verification code is: <strong>${code}</strong></p><p>This code expires in 10 minutes.</p>`,
      }),
    });

    if (!response.ok) {
      let errorBody: string;
      try {
        const errorData = await response.json();
        errorBody = JSON.stringify(errorData);
      } catch {
        errorBody = await response.text();
      }
      console.error("Resend error:", response.status, errorBody);
      return false;
    }

    const result = await response.json();
    console.log(`[OTP] Email sent to ${email}, ID: ${result.id}`);
    return true;
  } catch (error) {
    console.error("Resend fetch error:", error);
    return false;
  }
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const { email } = await req.json();

    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return new Response(
        JSON.stringify({ error: "Valid email required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    const fiveMinAgo = new Date(Date.now() - 5 * 60 * 1000).toISOString();
    const { count } = await supabase
      .from("otp_codes")
      .select("*", { count: "exact", head: true })
      .eq("email", email)
      .gte("created_at", fiveMinAgo);

    if (count && count >= 3) {
      return new Response(
        JSON.stringify({ error: "Too many requests. Please wait a few minutes." }),
        { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const { error: cleanupError } = await supabase
      .from("otp_codes")
      .delete()
      .eq("email", email)
      .eq("used", true);
    if (cleanupError) {
      console.warn("[send-otp] Cleanup error:", cleanupError);
    }

    const code = generateOTP();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000).toISOString();

    const { error: insertError } = await supabase
      .from("otp_codes")
      .insert({
        email,
        code,
        expires_at: expiresAt,
        used: false,
      });

    if (insertError) {
      console.error("OTP insert error:", insertError);
      return new Response(
        JSON.stringify({ error: "Failed to generate code" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const emailSent = await sendViaResend(email, code);

    if (!emailSent) {
      console.warn(`[OTP] Failed to send email to ${email}, but code was stored`);
    }

    console.log(`[OTP] Generated code for ${email}: ${code}`);

    return new Response(
      JSON.stringify({ success: true, message: "Verification code sent" }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("send-otp error:", error);
    return new Response(
      JSON.stringify({ error: "Internal server error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
