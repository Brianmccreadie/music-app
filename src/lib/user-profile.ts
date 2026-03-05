import { supabase } from "@/lib/supabase";

export interface UserProfile {
  displayName: string;
  rangeLow: string;
  rangeHigh: string;
  voiceType: string;
  experienceLevel: string;
  goals: string[];
  onboardingComplete: boolean;
}

export const VOICE_TYPES = [
  "Soprano",
  "Mezzo-Soprano",
  "Alto",
  "Tenor",
  "Baritone",
  "Bass",
] as const;

export const EXPERIENCE_LEVELS = [
  "Beginner",
  "Intermediate",
  "Advanced",
] as const;

export const GOAL_OPTIONS = [
  "Expand range",
  "Improve agility",
  "Warm-up routine",
  "Audition prep",
  "Breath control",
  "Tone quality",
  "Pitch accuracy",
  "Build confidence",
  "Develop mix voice",
  "Develop vibrato",
  "Develop head voice",
  "Master runs & riffs",
] as const;

// Default range presets per voice type
export const VOICE_RANGE_PRESETS: Record<string, { low: string; high: string }> = {
  Soprano: { low: "C4", high: "C6" },
  "Mezzo-Soprano": { low: "A3", high: "A5" },
  Alto: { low: "F3", high: "F5" },
  Tenor: { low: "C3", high: "C5" },
  Baritone: { low: "A2", high: "A4" },
  Bass: { low: "E2", high: "E4" },
};

const STORAGE_KEY = "vocal-app-profile";

const DEFAULT_PROFILE: UserProfile = {
  displayName: "",
  rangeLow: "C3",
  rangeHigh: "A4",
  voiceType: "",
  experienceLevel: "",
  goals: [],
  onboardingComplete: false,
};

// ── Local storage (synchronous, used for immediate reads) ──

export function getProfile(): UserProfile {
  if (typeof window === "undefined") return DEFAULT_PROFILE;
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) return { ...DEFAULT_PROFILE, ...JSON.parse(stored) };
  } catch {
    // ignore parse errors
  }
  return DEFAULT_PROFILE;
}

export function saveProfile(profile: Partial<UserProfile>): UserProfile {
  const current = getProfile();
  const updated = { ...current, ...profile };
  localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  return updated;
}

export function clearProfile(): void {
  localStorage.removeItem(STORAGE_KEY);
}

// ── Supabase sync (async, called when user is authenticated) ──

export async function fetchProfileFromDB(): Promise<UserProfile | null> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  const { data } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();

  if (!data) return null;

  const profile: UserProfile = {
    displayName: data.display_name ?? "",
    voiceType: data.voice_type ?? "",
    rangeLow: data.range_low ?? "C3",
    rangeHigh: data.range_high ?? "A4",
    experienceLevel: data.experience_level ?? "",
    goals: data.goals ?? [],
    onboardingComplete: data.onboarding_complete ?? false,
  };

  // Keep localStorage in sync for fast reads
  localStorage.setItem(STORAGE_KEY, JSON.stringify(profile));
  return profile;
}

export async function saveProfileToDB(profile: Partial<UserProfile>): Promise<UserProfile> {
  // Always save locally first for speed
  const updated = saveProfile(profile);

  const { data: { user } } = await supabase.auth.getUser();
  if (user) {
    await supabase.from("profiles").upsert({
      id: user.id,
      display_name: updated.displayName || null,
      voice_type: updated.voiceType || null,
      range_low: updated.rangeLow,
      range_high: updated.rangeHigh,
      experience_level: updated.experienceLevel || null,
      goals: updated.goals,
      onboarding_complete: updated.onboardingComplete,
      updated_at: new Date().toISOString(),
    });
  }

  return updated;
}
