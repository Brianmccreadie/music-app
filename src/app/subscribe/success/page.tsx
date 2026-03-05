"use client";

import { useEffect } from "react";
import Link from "next/link";
import { useSubscription } from "@/lib/subscription";

export default function SubscribeSuccessPage() {
  const { refresh } = useSubscription();

  useEffect(() => {
    // Refresh subscription status after successful checkout
    refresh();
  }, [refresh]);

  return (
    <div className="max-w-lg mx-auto px-4 py-24 text-center">
      <div className="w-20 h-20 bg-accent-light rounded-full flex items-center justify-center mx-auto mb-6">
        <svg
          className="w-10 h-10 text-accent"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M5 13l4 4L19 7"
          />
        </svg>
      </div>
      <h1 className="text-3xl font-bold text-foreground mb-3">
        Welcome to Pro!
      </h1>
      <p className="text-muted text-lg mb-8">
        Your subscription is active. You now have full access to all Vocal Reps
        features.
      </p>
      <Link
        href="/"
        className="inline-block px-8 py-3.5 bg-accent text-white rounded-full font-semibold hover:bg-accent-hover transition-colors"
      >
        Start Training
      </Link>
    </div>
  );
}
