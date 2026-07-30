const APP_ORIGIN = Deno.env.get("APP_ORIGIN") || "https://isizuo.app";
const corsHeaders = {
  "Access-Control-Allow-Origin": APP_ORIGIN,
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  if (req.method !== "POST") {
    return new Response(
      JSON.stringify({ error: "Method not allowed" }),
      { status: 405, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }

  try {
    const { email, code } = await req.json();

    if (!email || !code) {
      return new Response(
        JSON.stringify({ error: "Email and code required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
    const anonKey = Deno.env.get("SUPABASE_ANON_KEY");
    const authSalt = Deno.env.get("AUTH_SALT");

    if (!supabaseUrl || !serviceRoleKey || !anonKey || !authSalt) {
      console.error("[verify-otp] Missing required env vars");
      return new Response(
        JSON.stringify({ error: "Server configuration error" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const { createClient } = await import("https://esm.sh/@supabase/supabase-js@2.49.0");
    const supabase = createClient(supabaseUrl, serviceRoleKey);

    const fiveMinAgo = new Date(Date.now() - 5 * 60 * 1000).toISOString();
    const { count } = await supabase
      .from("otp_codes")
      .select("*", { count: "exact", head: true })
      .eq("email", email)
      .gte("created_at", fiveMinAgo);

    if (count && count >= 10) {
      return new Response(
        JSON.stringify({ error: "Too many failed attempts. Please request a new code." }),
        { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    await supabase
      .from("otp_codes")
      .delete()
      .eq("email", email)
      .lt("expires_at", new Date().toISOString());

    const { data: otpRecord, error: otpError } = await supabase
      .from("otp_codes")
      .select("*")
      .eq("email", email)
      .eq("code", code.trim())
      .eq("used", false)
      .gt("expires_at", new Date().toISOString())
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (otpError) {
      console.error("[verify-otp] DB query error:", otpError.message, otpError.code, otpError.details);
      return new Response(
        JSON.stringify({ error: "Invalid or expired code", detail: otpError.message }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (!otpRecord) {
      const { data: debugRows } = await supabase
        .from("otp_codes")
        .select("id, email, code, expires_at, used")
        .eq("email", email)
        .order("created_at", { ascending: false })
        .limit(5);
      console.error("[verify-otp] No match found. All rows for email:", JSON.stringify(debugRows));
      console.error("[verify-otp] Incoming code:", JSON.stringify(code), "trimmed:", JSON.stringify(code.trim()));
      return new Response(
        JSON.stringify({ error: "Invalid or expired code" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    await supabase
      .from("otp_codes")
      .update({ used: true })
      .eq("id", otpRecord.id)
      .eq("used", false);

    const raw = email + "-" + authSalt;
    const encoded = btoa(raw).replace(/[^a-zA-Z0-9]/g, "");
    const password = `Iz${encoded}!1`;

    const { error: createError } = await supabase.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
    });
    if (createError && !createError.message?.includes("already")) {
      console.error("[verify-otp] Create user error:", createError);
      return new Response(
        JSON.stringify({ error: "Failed to create account" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const supabaseAnon = createClient(supabaseUrl, anonKey);

    const { data: sessionData, error: sessionError } = await supabaseAnon.auth.signInWithPassword({
      email,
      password,
    });

    if (sessionError || !sessionData.session) {
      console.error("[verify-otp] Session error:", sessionError);
      return new Response(
        JSON.stringify({ error: "Failed to create session" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log(`[verify-otp] Verified ${email}, session created`);

    return new Response(
      JSON.stringify({
        session: sessionData.session,
        user: sessionData.user,
      }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("[verify-otp] error:", error);
    return new Response(
      JSON.stringify({ error: "Internal server error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
export {};
