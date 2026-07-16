import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const AFRICASTALKING_API_KEY = Deno.env.get("AFRICASTALKING_API_KEY");
const AFRICASTALKING_USERNAME = Deno.env.get("AFRICASTALKING_USERNAME") || "sandbox";
const AFRICASTALKING_URL = "https://api.africastalking.com/version1/messaging";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const { phone, message } = await req.json();

    if (!phone || !message) {
      return new Response(
        JSON.stringify({ error: "phone and message are required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (!AFRICASTALKING_API_KEY) {
      console.error("[send-sms] AFRICASTALKING_API_KEY is not set");
      return new Response(
        JSON.stringify({ error: "SMS service not configured" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const payload = {
      username: AFRICASTALKING_USERNAME,
      to: phone,
      message,
    };

    const response = await fetch(AFRICASTALKING_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        apiKey: AFRICASTALKING_API_KEY,
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
