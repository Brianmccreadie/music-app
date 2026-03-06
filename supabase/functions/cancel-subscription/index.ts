// Supabase Edge Function: cancel-subscription
// Cancels a Stripe subscription for a user
//
// Deploy with: supabase functions deploy cancel-subscription --no-verify-jwt
// Requires secrets: STRIPE_SECRET_KEY, SUPABASE_SERVICE_ROLE_KEY

import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const STRIPE_API = "https://api.stripe.com/v1";

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

  const stripeKey = Deno.env.get("STRIPE_SECRET_KEY");
  const supabaseUrl = Deno.env.get("SUPABASE_URL");
  const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

  if (!stripeKey || !supabaseUrl || !serviceRoleKey) {
    return new Response(
      JSON.stringify({ success: false, error: "Not configured" }),
      {
        status: 500,
        headers: {
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*",
        },
      }
    );
  }

  try {
    const { userId } = await req.json();

    if (!userId) {
      return new Response(
        JSON.stringify({ success: false, error: "Missing userId" }),
        {
          status: 400,
          headers: {
            "Content-Type": "application/json",
            "Access-Control-Allow-Origin": "*",
          },
        }
      );
    }

    const supabase = createClient(supabaseUrl, serviceRoleKey);

    // Look up the user's Stripe subscription ID
    const { data: sub } = await supabase
      .from("subscriptions")
      .select("stripe_subscription_id")
      .eq("user_id", userId)
      .single();

    if (!sub?.stripe_subscription_id) {
      return new Response(
        JSON.stringify({ success: false, error: "No active Stripe subscription found" }),
        {
          status: 404,
          headers: {
            "Content-Type": "application/json",
            "Access-Control-Allow-Origin": "*",
          },
        }
      );
    }

    // Cancel the subscription in Stripe (at period end for graceful cancellation)
    const response = await fetch(
      `${STRIPE_API}/subscriptions/${sub.stripe_subscription_id}`,
      {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${stripeKey}`,
        },
      }
    );

    const result = await response.json();

    if (result.error) {
      return new Response(
        JSON.stringify({ success: false, error: result.error.message }),
        {
          status: 400,
          headers: {
            "Content-Type": "application/json",
            "Access-Control-Allow-Origin": "*",
          },
        }
      );
    }

    // Update the subscription in the database
    await supabase
      .from("subscriptions")
      .update({
        tier: "none",
        cancel_at_period_end: false,
        updated_at: new Date().toISOString(),
      })
      .eq("user_id", userId);

    return new Response(JSON.stringify({ success: true }), {
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
      },
    });
  } catch (error) {
    return new Response(
      JSON.stringify({ success: false, error: "Internal error" }),
      {
        status: 500,
        headers: {
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*",
        },
      }
    );
  }
});
