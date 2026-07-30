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
    const { phone, message } = await req.json();

    if (!phone || !message) {
      return new Response(
        JSON.stringify({ error: "phone and message are required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const africastalkingApiKey = Deno.env.get("AFRICASTALKING_API_KEY");
    const africastalkingUsername = Deno.env.get("AFRICASTALKING_USERNAME") || "sandbox";

    if (!africastalkingApiKey) {
      console.error("[send-sms] AFRICASTALKING_API_KEY is not set");
      return new Response(
        JSON.stringify({ error: "SMS service not configured" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const payload = {
      username: africastalkingUsername,
      to: phone,
      message,
    };

    const response = await fetch("https://api.africastalking.com/version1/messaging", {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        apiKey: africastalkingApiKey,
        Accept: "application/json",
      },
      body: new URLSearchParams(payload).toString(),
    });

    const data = await response.json();

    if (data.SMSMessageData && data.SMSMessageData.Recipients) {
      const recipients = data.SMSMessageData.Recipients;
      const failed = recipients.filter((r: any) => r.status !== "Success");

      if (failed.length === recipients.length) {
        console.error("[send-sms] All recipients failed:", failed);
        return new Response(
          JSON.stringify({ error: "SMS delivery failed", details: failed }),
          { status: 502, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
    }

    console.log(`[send-sms] Sent to ${phone}: ${message.substring(0, 50)}...`);

    return new Response(
      JSON.stringify({ success: true, data }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("[send-sms] Error:", error);
    return new Response(
      JSON.stringify({ error: "Internal server error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
export {};
