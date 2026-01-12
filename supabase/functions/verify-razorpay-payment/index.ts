import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { createHmac } from "https://deno.land/std@0.177.0/node/crypto.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature, bookingId } = await req.json();

    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      throw new Error("Missing payment verification parameters");
    }

    const razorpayKeySecret = Deno.env.get("RAZORPAY_KEY_SECRET");
    if (!razorpayKeySecret) {
      throw new Error("Razorpay credentials not configured");
    }

    // Verify signature
    const message = `${razorpay_order_id}|${razorpay_payment_id}`;
    const expectedSignature = createHmac("sha256", razorpayKeySecret)
      .update(message)
      .digest("hex");

    if (expectedSignature !== razorpay_signature) {
      throw new Error("Invalid payment signature");
    }

    // Update booking payment status if bookingId provided
    if (bookingId) {
      const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
      const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
      const supabase = createClient(supabaseUrl, supabaseServiceKey);

      await supabase
        .from("bookings")
        .update({ 
          payment_status: "paid",
          notes: `Payment ID: ${razorpay_payment_id}`
        })
        .eq("id", bookingId);
    }

    return new Response(
      JSON.stringify({ 
        verified: true, 
        paymentId: razorpay_payment_id,
        message: "Payment verified successfully" 
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      }
    );
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : "Verification failed";
    console.error("Error:", error);
    return new Response(
      JSON.stringify({ verified: false, error: errorMessage }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 400,
      }
    );
  }
});
