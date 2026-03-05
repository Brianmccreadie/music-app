"use client";

import { useState } from "react";
import { useAuth } from "@/lib/auth-context";
import { useSubscription, startFreeTrial } from "@/lib/subscription";
import { isNativeApp } from "@/lib/platform";
import { purchaseProduct, IAP_PRODUCTS } from "@/lib/iap";
import Link from "next/link";

interface PaywallProps {
  feature?: string;
  onClose?: () => void;
}

export default function Paywall({ feature, onClose }: PaywallProps) {
  const { user } = useAuth();
  const { refresh } = useSubscription();
  const [starting, setStarting] = useState(false);
  const [error, setError] = useState("");
  const native = isNativeApp();

  const handleStartTrial = async () => {
    if (!user) return;
    setStarting(true);
    setError("");
    const ok = await startFreeTrial(user.id);
    if (ok) {
      await refresh();
      onClose?.();
    } else {
      setError("Something went wrong. Please try again.");
    }
    setStarting(false);
  };

  const handleSubscribe = async () => {
    if (!user) return;
    if (native) {
      setStarting(true);
      setError("");
      const success = await purchaseProduct(IAP_PRODUCTS.monthly, user.id);
      if (success) {
        await refresh();
        onClose?.();
      } else {
        setError("Purchase failed or was cancelled. Please try again.");
      }
      setStarting(false);
    } else {
      window.location.href = "/subscribe";
    }
  };

  return (
    <div className="fixed inset-0 z-[90] bg-black/60 flex items-end sm:items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-md w-full overflow-hidden animate-[slideUp_0.3s_ease-out]">
        {/* Header */}
        <div className="bg-gradient-to-br from-hero-bg to-accent p-8 text-center">
          <div className="w-14 h-14 bg-white/20 rounded-2xl flex items-center justify-center mx-auto mb-4 backdrop-blur-sm">
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
          <h2 className="text-2xl font-bold text-white mb-1">
            Unlock Vocal Reps Pro
          </h2>
          <p className="text-white/70 text-sm">
            {feature
              ? `${feature} is a Pro feature`
              : "Get unlimited access to all features"}
          </p>
        </div>

        {/* Features */}
        <div className="p-6">
          <ul className="space-y-3 mb-6">
            {[
              "Unlimited custom routines",
              "Custom plan generation",
              "Full exercise library access",
              "Progress tracking & streaks",
              "Priority support",
            ].map((item) => (
              <li key={item} className="flex items-center gap-3 text-sm">
                <div className="w-5 h-5 bg-accent-light rounded-full flex items-center justify-center flex-shrink-0">
                  <svg
                    className="w-3 h-3 text-accent"
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
                </div>
                <span className="text-foreground">{item}</span>
              </li>
            ))}
          </ul>

          {error && (
            <div className="bg-red-50 text-red-600 text-sm p-3 rounded-lg mb-4">
              {error}
            </div>
          )}

          {!user ? (
            <div className="space-y-3">
              <Link
                href="/login"
                className="block w-full py-3.5 bg-accent text-white rounded-full font-semibold text-center hover:bg-accent-hover transition-colors"
              >
                Sign Up to Start Free Trial
              </Link>
              <p className="text-xs text-muted text-center">
                Create an account to get 7 days free
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              <button
                onClick={handleStartTrial}
                disabled={starting}
                className="w-full py-3.5 bg-accent text-white rounded-full font-semibold hover:bg-accent-hover transition-colors disabled:opacity-50"
              >
                {starting ? "Starting..." : "Start 7-Day Free Trial"}
              </button>

              <button
                onClick={handleSubscribe}
                className="w-full py-3.5 bg-hero-bg text-white rounded-full font-semibold hover:bg-hero-bg/90 transition-colors"
              >
                Subscribe — $9.99/month
              </button>

              {/* App Store compliance disclaimer */}
              <p className="text-[10px] text-muted text-center leading-relaxed">
                {native ? (
                  <>
                    Payment will be charged to your Apple ID account at confirmation of purchase.
                    Subscription automatically renews unless cancelled at least 24 hours before the
                    end of the current period. Manage subscriptions in your device Settings.{" "}
                    <Link href="/terms" className="text-accent">Terms</Link> &{" "}
                    <Link href="/privacy" className="text-accent">Privacy</Link>
                  </>
                ) : (
                  <>
                    Secure payment via Stripe. Cancel anytime from account settings.
                    Subscription auto-renews. See our{" "}
                    <Link href="/terms" className="text-accent">Terms</Link> &{" "}
                    <Link href="/privacy" className="text-accent">Privacy Policy</Link>.
                  </>
                )}
              </p>
            </div>
          )}

          {onClose && (
            <button
              onClick={onClose}
              className="w-full mt-3 py-2.5 text-sm text-muted hover:text-foreground transition-colors"
            >
              Maybe later
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
