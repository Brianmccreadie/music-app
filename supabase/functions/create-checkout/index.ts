// Supabase Edge Function: create-checkout
// Creates a Stripe Checkout session for web subscriptions
//
// Deploy with: supabase functions deploy create-checkout --no-verify-jwt
// Set secrets:
//   supabase secrets set STRIPE_SECRET_KEY=sk_...
//   supabase secrets set STRIPE_PRICE_MONTHLY=price_...
//   supabase secrets set STRIPE_PRICE_YEARLY=price_...

const STRIPE_API = "https://api.stripe.com/v1";

Deno.serve(async (req) => {
  // CORS
  if (req.method === "OPTIONS") {
    return new Response(null, {
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "POST, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type, Authorization",
      },
    });
  }

  try {
    const { userId, email, priceType, returnUrl } = await req.json();

    const stripeKey = Deno.env.get("STRIPE_SECRET_KEY");
    if (!stripeKey) {
      return new Response(
        JSON.stringify({ error: "Stripe not configured", url: null }),
        {
          status: 200,
          headers: {
            "Content-Type": "application/json",
            "Access-Control-Allow-Origin": "*",
          },
        }
      );
    }

    const priceId =
      priceType === "yearly"
        ? Deno.env.get("STRIPE_PRICE_YEARLY")
        : Deno.env.get("STRIPE_PRICE_MONTHLY");

    if (!priceId) {
      return new Response(
        JSON.stringify({ error: "Price ID not configured", url: null }),
        {
          status: 200,
          headers: {
            "Content-Type": "application/json",
            "Access-Control-Allow-Origin": "*",
          },
        }
      );
    }

    // Create Stripe Checkout Session
    const params = new URLSearchParams();
    params.append("mode", "subscription");
    params.append("payment_method_types[]", "card");
    params.append("line_items[0][price]", priceId);
    params.append("line_items[0][quantity]", "1");
    params.append("success_url", returnUrl || "https://vocalreps.com/subscribe/success");
    params.append("cancel_url", returnUrl?.replace("/success", "") || "https://vocalreps.com/subscribe");
    params.append("client_reference_id", userId);
    params.append("subscription_data[trial_period_days]", "7");
    if (email) {
      params.append("customer_email", email);
    }

    const response = await fetch(`${STRIPE_API}/checkout/sessions`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${stripeKey}`,
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: params.toString(),
    });

    const session = await response.json();

    if (session.error) {
      return new Response(
        JSON.stringify({ error: session.error.message, url: null }),
        {
          status: 400,
          headers: {
            "Content-Type": "application/json",
            "Access-Control-Allow-Origin": "*",
          },
        }
      );
    }

    return new Response(JSON.stringify({ url: session.url }), {
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
      },
    });
  } catch (error) {
    return new Response(
      JSON.stringify({ error: "Failed to create checkout session", url: null }),
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
