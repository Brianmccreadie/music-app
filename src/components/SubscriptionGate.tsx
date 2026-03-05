"use client";

import { useState } from "react";
import { useSubscription } from "@/lib/subscription";
import Paywall from "@/components/Paywall";

interface SubscriptionGateProps {
  feature?: string;
  children: React.ReactNode;
  /** If true, show content but with limited access instead of blocking entirely */
  soft?: boolean;
}

/**
 * Wraps premium content. If user has no active subscription, shows the paywall.
 * Use `soft` mode to show limited content with an upgrade prompt instead of full block.
 */
export default function SubscriptionGate({
  feature,
  children,
  soft,
}: SubscriptionGateProps) {
  const { isActive, loading } = useSubscription();
  const [showPaywall, setShowPaywall] = useState(false);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="w-8 h-8 border-2 border-accent border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (isActive) {
    return <>{children}</>;
  }

  if (soft) {
    return (
      <>
        {children}
        {showPaywall && (
          <Paywall feature={feature} onClose={() => setShowPaywall(false)} />
        )}
      </>
    );
  }

  return (
    <>
      <div className="max-w-lg mx-auto px-4 py-20 text-center">
        <div className="w-16 h-16 bg-accent-light rounded-full flex items-center justify-center mx-auto mb-6">
          <svg
            className="w-8 h-8 text-accent"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
            />
          </svg>
        </div>
        <h2 className="text-2xl font-bold text-foreground mb-2">
          {feature || "This feature"} requires Pro
        </h2>
        <p className="text-muted mb-6">
          Upgrade to Vocal Reps Pro to unlock this and all other premium
          features.
        </p>
        <button
          onClick={() => setShowPaywall(true)}
          className="px-8 py-3.5 bg-accent text-white rounded-full font-semibold hover:bg-accent-hover transition-colors"
        >
          Unlock Pro
        </button>
      </div>
      {showPaywall && (
        <Paywall feature={feature} onClose={() => setShowPaywall(false)} />
      )}
    </>
  );
}
