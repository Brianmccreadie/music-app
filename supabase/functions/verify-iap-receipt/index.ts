// Supabase Edge Function: verify-iap-receipt
// Verifies Apple App Store receipts and syncs subscription status to Supabase.
// This enables cross-platform subscription sync (web <-> iOS).
//
// Deploy with: supabase functions deploy verify-iap-receipt --no-verify-jwt
//
// Required env vars:
//   SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY
//
// Apple receipt validation uses the App Store Server API (StoreKit 2).
// In production, set APPLE_BUNDLE_ID and configure App Store Server API credentials.

import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const APPLE_PRODUCTION_URL = "https://buy.itunes.apple.com/verifyReceipt";
const APPLE_SANDBOX_URL = "https://sandbox.itunes.apple.com/verifyReceipt";

interface ReceiptRequest {
  userId: string;
  receiptData: string;
  originalTransactionId?: string;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, {
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "POST, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type, Authorization",
      },
    });
  }

  const corsHeaders = {
    "Content-Type": "application/json",
    "Access-Control-Allow-Origin": "*",
  };

  try {
    const { userId, receiptData, originalTransactionId }: ReceiptRequest = await req.json();

    if (!userId || !receiptData) {
      return new Response(
        JSON.stringify({ error: "Missing userId or receiptData" }),
        { status: 400, headers: corsHeaders }
      );
    }

    // Verify receipt with Apple
    // Try production first, fall back to sandbox (Apple recommends this approach)
    let appleResponse = await verifyWithApple(receiptData, APPLE_PRODUCTION_URL);

    if (appleResponse.status === 21007) {
      // Receipt is from sandbox environment
      appleResponse = await verifyWithApple(receiptData, APPLE_SANDBOX_URL);
    }

    if (appleResponse.status !== 0) {
      return new Response(
        JSON.stringify({ error: "Invalid receipt", appleStatus: appleResponse.status }),
        { status: 400, headers: corsHeaders }
      );
    }

    // Extract latest subscription info from receipt
    const latestReceipt = appleResponse.latest_receipt_info;
    if (!latestReceipt || latestReceipt.length === 0) {
      return new Response(
        JSON.stringify({ error: "No subscription found in receipt" }),
        { status: 400, headers: corsHeaders }
      );
    }

    // Get the most recent transaction
    const latest = latestReceipt.sort(
      (a: { expires_date_ms: string }, b: { expires_date_ms: string }) =>
        parseInt(b.expires_date_ms) - parseInt(a.expires_date_ms)
    )[0];

    const expiresDate = new Date(parseInt(latest.expires_date_ms));
    const isExpired = expiresDate < new Date();

    // Update Supabase subscription
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const { error: upsertError } = await supabase.from("subscriptions").upsert({
      user_id: userId,
      tier: isExpired ? "none" : "premium",
      apple_original_transaction_id: latest.original_transaction_id || originalTransactionId,
      current_period_end: expiresDate.toISOString(),
      apple_product_id: latest.product_id,
      updated_at: new Date().toISOString(),
    });

    if (upsertError) {
      return new Response(
        JSON.stringify({ error: "Failed to update subscription" }),
        { status: 500, headers: corsHeaders }
      );
    }

    return new Response(
      JSON.stringify({
        valid: true,
        tier: isExpired ? "none" : "premium",
        expiresAt: expiresDate.toISOString(),
        productId: latest.product_id,
      }),
      { headers: corsHeaders }
    );
  } catch (error) {
    return new Response(
      JSON.stringify({ error: "Failed to verify receipt" }),
      { status: 500, headers: corsHeaders }
    );
  }
});

async function verifyWithApple(receiptData: string, url: string) {
  const response = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      "receipt-data": receiptData,
      // In production, add your app's shared secret:
      // "password": Deno.env.get("APPLE_SHARED_SECRET"),
      "exclude-old-transactions": true,
    }),
  });
  return response.json();
}
