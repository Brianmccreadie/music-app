"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  VOICE_TYPES,
  EXPERIENCE_LEVELS,
  GOAL_OPTIONS,
  getProfile,
  saveProfileToDB,
} from "@/lib/user-profile";
import { PIANO_NOTES } from "@/lib/music-utils";
import PlayNoteButton from "@/components/PlayNoteButton";
import { useAuth } from "@/lib/auth-context";
import { useSubscription, cancelTrial, cancelStripeSubscription } from "@/lib/subscription";
import { supabase } from "@/lib/supabase";
import { isNativeApp } from "@/lib/platform";
import { restorePurchases } from "@/lib/iap";

const LOW_NOTES = PIANO_NOTES.filter((n) => {
  const octave = parseInt(n.slice(-1));
  return octave >= 2 && octave <= 4;
});
const HIGH_NOTES = PIANO_NOTES.filter((n) => {
  const octave = parseInt(n.slice(-1));
  return octave >= 3 && octave <= 6;
});

export default function SettingsPage() {
  const router = useRouter();
  const { user, signOut } = useAuth();
  const { tier, trialEndsAt, isActive, refresh } = useSubscription();
  const [voiceType, setVoiceType] = useState("");
  const [rangeLow, setRangeLow] = useState("C3");
  const [rangeHigh, setRangeHigh] = useState("A4");
  const [goals, setGoals] = useState<string[]>([]);
  const [experienceLevel, setExperienceLevel] = useState("");
  const [saved, setSaved] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleteConfirmText, setDeleteConfirmText] = useState("");
  const [deleting, setDeleting] = useState(false);
  const [restoring, setRestoring] = useState(false);
  const [restoreMessage, setRestoreMessage] = useState("");
  const [cancelling, setCancelling] = useState(false);
  const [showCancelConfirm, setShowCancelConfirm] = useState(false);

  useEffect(() => {
    const profile = getProfile();
    setVoiceType(profile.voiceType);
    setRangeLow(profile.rangeLow);
    setRangeHigh(profile.rangeHigh);
    setGoals(profile.goals);
    setExperienceLevel(profile.experienceLevel);
  }, []);

  const toggleGoal = (goal: string) => {
    setGoals((prev) =>
      prev.includes(goal) ? prev.filter((g) => g !== goal) : [...prev, goal]
    );
  };

  const handleSave = async () => {
    await saveProfileToDB({
      voiceType,
      rangeLow,
      rangeHigh,
      goals,
      experienceLevel,
      onboardingComplete: true,
    });
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const handleDeleteAccount = async () => {
    if (deleteConfirmText !== "DELETE") return;
    setDeleting(true);

    try {
      if (user) {
        // Delete user data from Supabase tables
        await Promise.all([
          supabase.from("subscriptions").delete().eq("user_id", user.id),
          supabase.from("profiles").delete().eq("user_id", user.id),
          supabase.from("favorites").delete().eq("user_id", user.id),
          supabase.from("routines").delete().eq("user_id", user.id),
          supabase.from("practice_sessions").delete().eq("user_id", user.id),
        ]);
      }

      // Clear local storage
      localStorage.clear();

      // Sign out
      await signOut();
      router.push("/");
    } catch {
      alert("Failed to delete account. Please contact support.");
    }

    setDeleting(false);
  };

  const handleRestorePurchases = async () => {
    if (!user) return;
    setRestoring(true);
    setRestoreMessage("");
    const restored = await restorePurchases(user.id);
    if (restored) {
      setRestoreMessage("Purchases restored successfully!");
      await refresh();
    } else {
      setRestoreMessage("No previous purchases found.");
    }
    setRestoring(false);
  };

  const handleCancelTrial = async () => {
    if (!user) return;
    setCancelling(true);
    const ok = await cancelTrial(user.id);
    if (ok) {
      await refresh();
    } else {
      alert("Failed to cancel trial. Please try again.");
    }
    setCancelling(false);
    setShowCancelConfirm(false);
  };

  const handleCancelSubscription = async () => {
    if (!user) return;
    setCancelling(true);
    const ok = await cancelStripeSubscription(user.id);
    if (ok) {
      await refresh();
    } else {
      alert("Failed to cancel subscription. Please contact support.");
    }
    setCancelling(false);
    setShowCancelConfirm(false);
  };

  const native = isNativeApp();

  const trialDaysLeft = trialEndsAt
    ? Math.max(0, Math.ceil((new Date(trialEndsAt).getTime() - Date.now()) / (1000 * 60 * 60 * 24)))
    : 0;

  return (
    <div className="max-w-lg mx-auto px-4 py-8">
      <Link
        href="/"
        className="text-sm text-accent hover:text-accent-hover mb-6 inline-block"
      >
        &larr; Home
      </Link>
      <h1 className="text-2xl font-bold text-foreground mb-6">Settings</h1>

      {/* Subscription Status */}
      {user && (
        <div className="bg-white rounded-2xl border border-border p-4 shadow-sm mb-6">
          <h3 className="text-sm font-medium text-muted mb-2">Subscription</h3>
          <div className="flex items-center justify-between">
            <div>
              {tier === "premium" && (
                <span className="text-sm font-semibold text-accent">Pro — Active</span>
              )}
              {tier === "trial" && isActive && (
                <span className="text-sm font-semibold text-accent">
                  Free Trial — {trialDaysLeft} day{trialDaysLeft !== 1 ? "s" : ""} remaining
                </span>
              )}
              {!isActive && (
                <span className="text-sm text-muted">No active subscription</span>
              )}
            </div>
            {!isActive && (
              <Link href="/subscribe" className="text-sm text-accent font-semibold hover:text-accent-hover">
                Subscribe
              </Link>
            )}
          </div>

          {/* Upgrade from trial */}
          {tier === "trial" && isActive && (
            <div className="mt-3 pt-3 border-t border-border">
              <Link
                href="/subscribe"
                className="inline-block px-4 py-2 bg-accent text-white rounded-full text-sm font-semibold hover:bg-accent-hover transition-colors"
              >
                Upgrade to Pro
              </Link>
              <p className="text-xs text-muted mt-1">
                Subscribe now to keep access after your trial ends.
              </p>
            </div>
          )}

          {/* Cancel trial */}
          {tier === "trial" && isActive && (
            <div className="mt-3 pt-3 border-t border-border">
              {!showCancelConfirm ? (
                <button
                  onClick={() => setShowCancelConfirm(true)}
                  className="text-sm text-red-600 font-medium hover:text-red-700"
                >
                  Cancel Trial
                </button>
              ) : (
                <div className="bg-red-50 rounded-lg p-3">
                  <p className="text-sm text-red-600 mb-2">
                    Are you sure? You will lose access immediately.
                  </p>
                  <div className="flex gap-2">
                    <button
                      onClick={handleCancelTrial}
                      disabled={cancelling}
                      className="px-4 py-1.5 bg-red-600 text-white rounded-lg text-sm font-semibold hover:bg-red-700 disabled:opacity-50"
                    >
                      {cancelling ? "Cancelling..." : "Yes, Cancel"}
                    </button>
                    <button
                      onClick={() => setShowCancelConfirm(false)}
                      className="px-4 py-1.5 border border-border rounded-lg text-sm text-muted hover:text-foreground"
                    >
                      Keep Trial
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Cancel paid subscription */}
          {tier === "premium" && (
            <div className="mt-3 pt-3 border-t border-border">
              {!showCancelConfirm ? (
                <button
                  onClick={() => setShowCancelConfirm(true)}
                  className="text-sm text-red-600 font-medium hover:text-red-700"
                >
                  Cancel Subscription
                </button>
              ) : (
                <div className="bg-red-50 rounded-lg p-3">
                  <p className="text-sm text-red-600 mb-2">
                    Are you sure you want to cancel your Pro subscription? You will lose access to all premium features.
                  </p>
                  <div className="flex gap-2">
                    <button
                      onClick={handleCancelSubscription}
                      disabled={cancelling}
                      className="px-4 py-1.5 bg-red-600 text-white rounded-lg text-sm font-semibold hover:bg-red-700 disabled:opacity-50"
                    >
                      {cancelling ? "Cancelling..." : "Yes, Cancel"}
                    </button>
                    <button
                      onClick={() => setShowCancelConfirm(false)}
                      className="px-4 py-1.5 border border-border rounded-lg text-sm text-muted hover:text-foreground"
                    >
                      Keep Subscription
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {native && (
            <div className="mt-3 pt-3 border-t border-border">
              <button
                onClick={handleRestorePurchases}
                disabled={restoring}
                className="text-sm text-accent font-medium hover:text-accent-hover disabled:opacity-50"
              >
                {restoring ? "Restoring..." : "Restore Purchases"}
              </button>
              {restoreMessage && (
                <p className="text-xs text-muted mt-1">{restoreMessage}</p>
              )}
            </div>
          )}
        </div>
      )}

      {/* Voice Type */}
      <div className="mb-6">
        <label className="text-sm font-medium text-muted mb-2 block">
          Voice Type
        </label>
        <select
          value={voiceType}
          onChange={(e) => setVoiceType(e.target.value)}
          className="w-full px-4 py-2 bg-white border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-accent"
        >
          <option value="">Not set</option>
          {VOICE_TYPES.map((vt) => (
            <option key={vt} value={vt}>
              {vt}
            </option>
          ))}
        </select>
      </div>

      {/* Range */}
      <div className="mb-6">
        <label className="text-sm font-medium text-muted mb-2 block">
          Vocal Range
        </label>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="text-xs text-muted mb-1 block">
              Lowest Note
            </label>
            <div className="flex gap-2">
              <select
                value={rangeLow}
                onChange={(e) => setRangeLow(e.target.value)}
                className="flex-1 min-w-0 px-3 py-2 bg-white border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-accent"
              >
                {LOW_NOTES.map((note) => (
                  <option key={note} value={note}>
                    {note}
                  </option>
                ))}
              </select>
              <PlayNoteButton note={rangeLow} />
            </div>
          </div>
          <div>
            <label className="text-xs text-muted mb-1 block">
              Highest Note
            </label>
            <div className="flex gap-2">
              <select
                value={rangeHigh}
                onChange={(e) => setRangeHigh(e.target.value)}
                className="flex-1 min-w-0 px-3 py-2 bg-white border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-accent"
              >
                {HIGH_NOTES.map((note) => (
                  <option key={note} value={note}>
                    {note}
                  </option>
                ))}
              </select>
              <PlayNoteButton note={rangeHigh} />
            </div>
          </div>
        </div>
      </div>

      {/* Experience */}
      <div className="mb-6">
        <label className="text-sm font-medium text-muted mb-2 block">
          Experience Level
        </label>
        <div className="flex gap-2">
          {EXPERIENCE_LEVELS.map((level) => (
            <button
              key={level}
              onClick={() => setExperienceLevel(level)}
              className={`flex-1 py-2 rounded-lg text-sm transition-colors ${
                experienceLevel === level
                  ? "bg-accent text-white"
                  : "bg-white border border-border text-muted hover:text-foreground"
              }`}
            >
              {level}
            </button>
          ))}
        </div>
      </div>

      {/* Goals */}
      <div className="mb-8">
        <label className="text-sm font-medium text-muted mb-2 block">
          Goals
        </label>
        <div className="grid grid-cols-2 gap-2">
          {GOAL_OPTIONS.map((goal) => (
            <button
              key={goal}
              onClick={() => toggleGoal(goal)}
              className={`p-2 rounded-lg border text-sm text-left transition-all ${
                goals.includes(goal)
                  ? "border-accent bg-accent-light text-accent"
                  : "border-border text-muted hover:border-accent/30"
              }`}
            >
              {goal}
            </button>
          ))}
        </div>
      </div>

      {/* Save */}
      <button
        onClick={handleSave}
        className="w-full py-3 bg-accent text-white rounded-full font-semibold hover:bg-accent-hover transition-colors"
      >
        {saved ? "Saved!" : "Save Settings"}
      </button>

      {/* Account Danger Zone */}
      {user && (
        <div className="mt-12 border-t border-border pt-8">
          <h2 className="text-lg font-bold text-foreground mb-4">Account</h2>

          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-white rounded-xl border border-border">
              <div>
                <div className="text-sm font-medium text-foreground">{user.email}</div>
                <div className="text-xs text-muted">Signed in</div>
              </div>
              <button
                onClick={() => signOut()}
                className="text-sm text-red-600 font-medium hover:text-red-700"
              >
                Sign Out
              </button>
            </div>

            <div className="bg-red-50 rounded-xl border border-red-200 p-4">
              <h3 className="text-sm font-bold text-red-600 mb-1">Delete Account</h3>
              <p className="text-xs text-red-500 mb-3">
                This will permanently delete your account, subscription, and all data.
                This action cannot be undone.
              </p>
              {!showDeleteConfirm ? (
                <button
                  onClick={() => setShowDeleteConfirm(true)}
                  className="px-4 py-2 bg-red-600 text-white rounded-lg text-sm font-semibold hover:bg-red-700 transition-colors"
                >
                  Delete My Account
                </button>
              ) : (
                <div className="space-y-3">
                  <p className="text-xs text-red-600 font-medium">
                    Type DELETE to confirm:
                  </p>
                  <input
                    type="text"
                    value={deleteConfirmText}
                    onChange={(e) => setDeleteConfirmText(e.target.value)}
                    className="w-full px-3 py-2 border border-red-300 rounded-lg text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-red-400"
                    placeholder="DELETE"
                  />
                  <div className="flex gap-2">
                    <button
                      onClick={handleDeleteAccount}
                      disabled={deleteConfirmText !== "DELETE" || deleting}
                      className="flex-1 py-2 bg-red-600 text-white rounded-lg text-sm font-semibold hover:bg-red-700 transition-colors disabled:opacity-50"
                    >
                      {deleting ? "Deleting..." : "Confirm Delete"}
                    </button>
                    <button
                      onClick={() => { setShowDeleteConfirm(false); setDeleteConfirmText(""); }}
                      className="flex-1 py-2 border border-border rounded-lg text-sm text-muted hover:text-foreground transition-colors"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
