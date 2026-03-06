"use client";

import { useState } from "react";
import { useAuth } from "@/lib/auth-context";
import Link from "next/link";

export default function SubscribePage() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [billingCycle, setBillingCycle] = useState<"monthly" | "yearly">(
    "monthly"
  );

  const handleCheckout = async () => {
    if (!user) return;
    setLoading(true);

    try {
      // Call Supabase Edge Function to create Stripe checkout session
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_SUPABASE_URL}/functions/v1/create-checkout`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY}`,
          },
          body: JSON.stringify({
            userId: user.id,
            email: user.email,
            priceType: billingCycle,
            returnUrl: window.location.origin + "/subscribe/success",
          }),
        }
      );

      const data = await response.json();

      if (data.url) {
        window.location.href = data.url;
      } else {
        alert(
          "Stripe checkout is not configured yet. See setup instructions below."
        );
      }
    } catch {
      alert(
        "Stripe checkout is not configured yet. Please set up the Edge Function."
      );
    }

    setLoading(false);
  };

  return (
    <div className="max-w-lg mx-auto px-4 py-16">
      <div className="text-center mb-8">
        <div className="w-14 h-14 bg-accent rounded-2xl flex items-center justify-center mx-auto mb-4">
          <svg
            className="w-8 h-8 text-white"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={1.5}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3"
            />
          </svg>
        </div>
        <h1 className="text-2xl font-bold text-foreground">
          Upgrade to Vocal Reps Pro
        </h1>
        <p className="text-muted text-sm mt-1">
          Start with a 3-day free trial. Cancel anytime.
        </p>
      </div>

      {!user ? (
        <div className="bg-white rounded-2xl border border-border p-8 text-center">
          <p className="text-muted mb-4">
            Sign in to subscribe to Vocal Reps Pro.
          </p>
          <Link
            href="/login"
            className="inline-block px-6 py-3 bg-accent text-white rounded-full font-semibold hover:bg-accent-hover transition-colors"
          >
            Sign In
          </Link>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-border p-8">
          {/* Billing toggle */}
          <div className="flex items-center justify-center gap-4 mb-8">
            <button
              onClick={() => setBillingCycle("monthly")}
              className={`px-5 py-2 rounded-full text-sm font-semibold transition-colors ${
                billingCycle === "monthly"
                  ? "bg-accent text-white"
                  : "bg-background text-muted hover:text-foreground"
              }`}
            >
              Monthly
            </button>
            <button
              onClick={() => setBillingCycle("yearly")}
              className={`px-5 py-2 rounded-full text-sm font-semibold transition-colors ${
                billingCycle === "yearly"
                  ? "bg-accent text-white"
                  : "bg-background text-muted hover:text-foreground"
              }`}
            >
              Yearly
              <span className="ml-1 text-xs opacity-75">Save 25%</span>
            </button>
          </div>

          {/* Price display */}
          <div className="text-center mb-8">
            <div className="text-5xl font-bold text-foreground">
              {billingCycle === "monthly" ? "$9.99" : "$89.99"}
            </div>
            <div className="text-muted text-sm mt-1">
              {billingCycle === "monthly"
                ? "per month"
                : "per year ($7.50/month)"}
            </div>
          </div>

          {/* Features */}
          <ul className="space-y-3 mb-8">
            {[
              "50+ vocal exercises with piano",
              "15 training tracks",
              "Custom practice plans",
              "Unlimited custom routines",
              "Progress tracking & streaks",
            ].map((item) => (
              <li key={item} className="flex items-center gap-3 text-sm">
                <svg
                  className="w-4 h-4 text-accent flex-shrink-0"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={3}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M5 13l4 4L19 7"
                  />
                </svg>
                <span className="text-foreground">{item}</span>
              </li>
            ))}
          </ul>

          <button
            onClick={handleCheckout}
            disabled={loading}
            className="w-full py-3.5 bg-accent text-white rounded-full font-semibold hover:bg-accent-hover transition-colors disabled:opacity-50 text-lg"
          >
            {loading ? "Redirecting to checkout..." : "Start 3-Day Free Trial"}
          </button>

          <p className="text-xs text-muted text-center mt-3">
            No charge during your 3-day trial. Then {billingCycle === "monthly" ? "$9.99/month" : "$89.99/year"}.
          </p>
          <p className="text-[10px] text-muted text-center mt-3 leading-relaxed">
            Secure payment powered by Stripe. Subscription automatically renews
            unless cancelled. Cancel anytime from your account settings. By
            subscribing you agree to our{" "}
            <Link href="/terms" className="text-accent">Terms of Service</Link> and{" "}
            <Link href="/privacy" className="text-accent">Privacy Policy</Link>.
          </p>
        </div>
      )}

      <div className="mt-4 text-center">
        <Link href="/" className="text-sm text-muted hover:text-foreground">
          &larr; Back to app
        </Link>
      </div>
    </div>
  );
}
