"use client";

import { useAuth } from "@/lib/auth-context";
import { useSubscription } from "@/lib/subscription";
import { usePathname } from "next/navigation";
import Paywall from "@/components/Paywall";

/**
 * Gates the entire app behind authentication + active subscription (trial or paid).
 * Allows through: login, subscribe, terms, privacy, contact, and the marketing homepage.
 */

const PUBLIC_PATHS = [
  "/login",
  "/subscribe",
  "/subscribe/success",
  "/terms",
  "/privacy",
  "/contact",
  "/onboarding",
];

export default function AppGate({ children }: { children: React.ReactNode }) {
  const { user, loading: authLoading } = useAuth();
  const { isActive, loading: subLoading } = useSubscription();
  const pathname = usePathname();

  // Always allow public pages
  if (PUBLIC_PATHS.some((p) => pathname.startsWith(p))) {
    return <>{children}</>;
  }

  // Marketing homepage for unauthenticated web users — let through (page.tsx handles it)
  if (!authLoading && !user && pathname === "/") {
    return <>{children}</>;
  }

  // Still loading auth or subscription — show spinner
  if (authLoading || subLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="w-8 h-8 border-2 border-accent border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  // Not logged in — redirect-style: show the paywall which has a sign-up CTA
  if (!user) {
    return <Paywall />;
  }

  // Logged in but no active subscription — show paywall
  if (!isActive) {
    return <Paywall />;
  }

  // Active subscription — render the app
  return <>{children}</>;
}
