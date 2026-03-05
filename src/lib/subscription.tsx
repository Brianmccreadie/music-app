"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
} from "react";
import { useAuth } from "@/lib/auth-context";
import { supabase } from "@/lib/supabase";

export type SubscriptionTier = "free" | "trial" | "premium";

export interface SubscriptionState {
  tier: SubscriptionTier;
  trialEndsAt: string | null;
  isActive: boolean; // true if trial or premium
  loading: boolean;
  refresh: () => Promise<void>;
}

const SubscriptionContext = createContext<SubscriptionState | undefined>(
  undefined
);

const LOCAL_KEY = "vocal-reps-subscription";

interface StoredSubscription {
  tier: SubscriptionTier;
  trialEndsAt: string | null;
}

function getLocalSubscription(): StoredSubscription {
  if (typeof window === "undefined")
    return { tier: "free", trialEndsAt: null };
  try {
    const raw = localStorage.getItem(LOCAL_KEY);
    if (raw) return JSON.parse(raw);
  } catch {
    // ignore
  }
  return { tier: "free", trialEndsAt: null };
}

function setLocalSubscription(sub: StoredSubscription) {
  if (typeof window === "undefined") return;
  localStorage.setItem(LOCAL_KEY, JSON.stringify(sub));
}

function isTrialExpired(trialEndsAt: string | null): boolean {
  if (!trialEndsAt) return true;
  return new Date(trialEndsAt) < new Date();
}

export function SubscriptionProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user } = useAuth();
  const [tier, setTier] = useState<SubscriptionTier>("free");
  const [trialEndsAt, setTrialEndsAt] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchSubscription = useCallback(async () => {
    if (!user) {
      const local = getLocalSubscription();
      setTier(local.tier === "trial" && isTrialExpired(local.trialEndsAt) ? "free" : local.tier);
      setTrialEndsAt(local.trialEndsAt);
      setLoading(false);
      return;
    }

    try {
      const { data } = await supabase
        .from("subscriptions")
        .select("*")
        .eq("user_id", user.id)
        .single();

      if (data) {
        let currentTier: SubscriptionTier = data.tier;
        if (currentTier === "trial" && isTrialExpired(data.trial_ends_at)) {
          currentTier = "free";
        }
        setTier(currentTier);
        setTrialEndsAt(data.trial_ends_at);
        setLocalSubscription({
          tier: currentTier,
          trialEndsAt: data.trial_ends_at,
        });
      } else {
        setTier("free");
        setTrialEndsAt(null);
      }
    } catch {
      // Fall back to local
      const local = getLocalSubscription();
      setTier(local.tier);
      setTrialEndsAt(local.trialEndsAt);
    }

    setLoading(false);
  }, [user]);

  useEffect(() => {
    fetchSubscription();
  }, [fetchSubscription]);

  const isActive = tier === "premium" || (tier === "trial" && !isTrialExpired(trialEndsAt));

  return (
    <SubscriptionContext.Provider
      value={{ tier, trialEndsAt, isActive, loading, refresh: fetchSubscription }}
    >
      {children}
    </SubscriptionContext.Provider>
  );
}

export function useSubscription() {
  const context = useContext(SubscriptionContext);
  if (!context)
    throw new Error("useSubscription must be used within SubscriptionProvider");
  return context;
}

// Start a 7-day free trial
export async function startFreeTrial(userId: string): Promise<boolean> {
  const trialEndsAt = new Date();
  trialEndsAt.setDate(trialEndsAt.getDate() + 7);
  const trialEndsAtStr = trialEndsAt.toISOString();

  const { error } = await supabase.from("subscriptions").upsert({
    user_id: userId,
    tier: "trial",
    trial_ends_at: trialEndsAtStr,
    updated_at: new Date().toISOString(),
  });

  if (!error) {
    setLocalSubscription({ tier: "trial", trialEndsAt: trialEndsAtStr });
    return true;
  }
  return false;
}
