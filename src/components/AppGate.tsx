"use client";

import { useAuth } from "@/lib/auth-context";
import { useSubscription } from "@/lib/subscription";
import { usePathname } from "next/navigation";
import Paywall from "@/components/Paywall";

/**
 * Gates app features behind authentication + active subscription (trial or paid).
 * Public pages (homepage, terms, privacy, etc.) are always accessible.
 * Gated pages show content behind a paywall overlay (grayed out, non-interactive).
 */

const PUBLIC_PATHS = [
  "/",
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
  if (PUBLIC_PATHS.includes(pathname) || PUBLIC_PATHS.some((p) => p !== "/" && pathname.startsWith(p))) {
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

  // No active subscription — show content behind paywall overlay
  if (!user || !isActive) {
    return (
      <>
        <div className="pointer-events-none select-none opacity-40" aria-hidden="true">
          {children}
        </div>
        <Paywall />
      </>
    );
  }

  // Active subscription — render the app
  return <>{children}</>;
}
