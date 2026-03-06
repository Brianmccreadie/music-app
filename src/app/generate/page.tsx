"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { getProfile } from "@/lib/user-profile";
import exercisesData from "@/data/exercises.json";
import type { Exercise } from "@/lib/exercises";
import ExercisePlayer from "@/components/ExercisePlayer";

const exercises = exercisesData as Exercise[];

interface GeneratedPlan {
  name: string;
  description: string;
  durationMinutes: number;
  exercises: {
    exerciseId: string;
    tempoOverride?: number;
    notes?: string;
  }[];
}

function findExercise(id: string): Exercise | undefined {
  return exercises.find((ex) => ex.id === id);
}

export default function GeneratePlanPage() {
  const [profile, setProfile] = useState(getProfile());
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState("");
  const [plan, setPlan] = useState<GeneratedPlan | null>(null);
  const [activeExerciseIndex, setActiveExerciseIndex] = useState(-1);
  const [feedback, setFeedback] = useState("");

  useEffect(() => {
    setProfile(getProfile());
  }, []);

  const handleGenerate = async (userFeedback?: string) => {
    setGenerating(true);
    setError("");
    setPlan(null);
    setActiveExerciseIndex(-1);

    try {
      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
      const res = await fetch(`${supabaseUrl}/functions/v1/generate-plan`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          voiceType: profile.voiceType,
          rangeLow: profile.rangeLow,
          rangeHigh: profile.rangeHigh,
          experienceLevel: profile.experienceLevel,
          goals: profile.goals,
          feedback: userFeedback,
          exerciseLibrary: exercises.map((ex) => ({
            id: ex.id,
            name: ex.name,
            pattern: ex.pattern,
            noteDuration: ex.noteDuration,
            description: ex.description,
            tags: ex.tags,
            difficulty: ex.difficulty,
            category: ex.category,
          })),
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Failed to generate plan");
        return;
      }

      setPlan(data);
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setGenerating(false);
    }
  };

  const handleRegenerate = () => {
    if (feedback.trim()) {
      handleGenerate(feedback.trim());
      setFeedback("");
    } else {
      handleGenerate();
    }
  };

  const activeExerciseConfig =
    plan && activeExerciseIndex >= 0
      ? plan.exercises[activeExerciseIndex]
      : null;
  const activeExercise = activeExerciseConfig
    ? findExercise(activeExerciseConfig.exerciseId)
    : null;

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <Link
        href="/plans"
        className="text-sm text-accent hover:text-accent-hover mb-6 inline-block"
      >
        &larr; Back to Core Training
      </Link>

      <h1 className="text-2xl font-bold text-foreground mb-2">
        Custom Routine Builder
      </h1>
      <p className="text-muted mb-6">
        Generate a personalized practice routine based on your profile and goals.
      </p>

      {/* Profile summary */}
      <div className="bg-white rounded-2xl border border-border p-4 shadow-sm mb-6">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-sm font-medium text-muted">Your Profile</h3>
          <Link
            href="/settings"
            className="text-xs text-accent hover:text-accent-hover"
          >
            Edit
          </Link>
        </div>
        {profile.onboardingComplete ? (
          <div className="grid grid-cols-2 gap-2 text-sm">
            <div>
              <span className="text-muted">Range:</span>{" "}
              <span className="text-foreground">
                {profile.rangeLow} — {profile.rangeHigh}
              </span>
            </div>
            <div>
              <span className="text-muted">Level:</span>{" "}
              <span className="text-foreground">{profile.experienceLevel}</span>
            </div>
            {profile.voiceType && (
              <div>
                <span className="text-muted">Voice:</span>{" "}
                <span className="text-foreground">{profile.voiceType}</span>
              </div>
            )}
            {profile.goals.length > 0 && (
              <div className="col-span-2">
                <span className="text-muted">Goals:</span>{" "}
                <span className="text-foreground">
                  {profile.goals.join(", ")}
                </span>
              </div>
            )}
          </div>
        ) : (
          <div className="text-sm text-muted">
            <Link href="/onboarding" className="text-accent hover:underline">
              Complete onboarding
            </Link>{" "}
            to get personalized routines.
          </div>
        )}
      </div>

      {!plan && (
        <button
          onClick={() => handleGenerate()}
          disabled={generating}
          className="w-full py-4 bg-accent text-white rounded-xl font-semibold text-lg hover:bg-accent-hover transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {generating ? (
            <span className="flex items-center justify-center gap-2">
              <svg className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
              Generating your routine...
            </span>
          ) : (
            "Generate Custom Routine"
          )}
        </button>
      )}

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4 mt-4">
          <div className="text-sm text-red-600">{error}</div>
        </div>
      )}

      {plan && (
        <div>
          <div className="bg-white rounded-2xl border border-border p-6 shadow-sm mb-6">
            <h2 className="text-xl font-bold text-foreground mb-1">
              {plan.name}
            </h2>
            <p className="text-muted text-sm mb-2">{plan.description}</p>
            <div className="text-xs text-muted">
              {plan.exercises.length} exercises &middot; ~{plan.durationMinutes}{" "}
              min
            </div>
          </div>

          <div className="mb-6">
            <h3 className="text-lg font-bold text-foreground mb-3">
              Exercises
            </h3>
            <div className="space-y-2">
              {plan.exercises.map((pe, index) => {
                const ex = findExercise(pe.exerciseId);
                if (!ex) return null;
                const isActive = index === activeExerciseIndex;
                const isCompleted = index < activeExerciseIndex;

                return (
                  <button
                    key={index}
                    onClick={() => setActiveExerciseIndex(index)}
                    className={`w-full text-left p-4 rounded-xl border-2 transition-all ${
                      isActive
                        ? "border-accent bg-accent-light"
                        : isCompleted
                          ? "border-emerald-200 bg-emerald-50"
                          : "border-border hover:border-accent/20"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                          isActive
                            ? "bg-accent text-white"
                            : isCompleted
                              ? "bg-emerald-600 text-white"
                              : "bg-border text-muted"
                        }`}
                      >
                        {isCompleted ? "\u2713" : index + 1}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="font-medium text-foreground text-sm">
                          {ex.name}
                        </div>
                        {pe.notes && (
                          <div className="text-xs text-muted mt-0.5 truncate">
                            {pe.notes}
                          </div>
                        )}
                      </div>
                      {pe.tempoOverride && (
                        <span className="text-xs text-muted">
                          {pe.tempoOverride} BPM
                        </span>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {activeExerciseIndex === -1 ? (
            <button
              onClick={() => setActiveExerciseIndex(0)}
              className="w-full py-4 bg-accent text-white rounded-xl font-semibold text-lg hover:bg-accent-hover transition-colors"
            >
              Start Routine
            </button>
          ) : activeExercise ? (
            <div>
              {activeExerciseConfig?.notes && (
                <div className="bg-accent-light border border-accent/20 rounded-xl p-4 mb-4">
                  <div className="text-xs font-medium text-accent mb-1">
                    Coach Tip
                  </div>
                  <div className="text-sm text-foreground/80">
                    {activeExerciseConfig.notes}
                  </div>
                </div>
              )}
              <ExercisePlayer
                key={`generated-${activeExerciseIndex}`}
                exercise={activeExercise}
                startNote={profile.rangeLow}
                endNote={profile.rangeHigh}
              />
              <div className="flex gap-3 mt-4">
                <button
                  onClick={() =>
                    setActiveExerciseIndex(
                      Math.max(0, activeExerciseIndex - 1)
                    )
                  }
                  disabled={activeExerciseIndex === 0}
                  className="flex-1 py-3 border border-border rounded-lg text-muted hover:text-foreground disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                >
                  Previous
                </button>
                {activeExerciseIndex < plan.exercises.length - 1 ? (
                  <button
                    onClick={() =>
                      setActiveExerciseIndex(activeExerciseIndex + 1)
                    }
                    className="flex-1 py-3 bg-accent text-white rounded-lg font-semibold hover:bg-accent-hover transition-colors"
                  >
                    Next Exercise
                  </button>
                ) : (
                  <button
                    onClick={() => setActiveExerciseIndex(-1)}
                    className="flex-1 py-3 bg-emerald-600 text-white rounded-lg font-semibold hover:bg-emerald-700 transition-colors"
                  >
                    Finish
                  </button>
                )}
              </div>
            </div>
          ) : null}

          <div className="mt-8 border-t border-border pt-6">
            <h3 className="text-sm font-medium text-muted mb-2">
              Want a different routine?
            </h3>
            <div className="flex gap-2 mb-3 flex-wrap">
              {[
                "Too easy",
                "Too hard",
                "More agility work",
                "More warm-ups",
                "Shorter routine",
              ].map((suggestion) => (
                <button
                  key={suggestion}
                  onClick={() => setFeedback(suggestion)}
                  className={`px-3 py-1 rounded-full text-xs transition-colors ${
                    feedback === suggestion
                      ? "bg-accent text-white"
                      : "bg-white border border-border text-muted hover:text-foreground"
                  }`}
                >
                  {suggestion}
                </button>
              ))}
            </div>
            <div className="flex gap-2">
              <input
                type="text"
                value={feedback}
                onChange={(e) => setFeedback(e.target.value)}
                placeholder="Or type specific feedback..."
                className="flex-1 px-4 py-2 bg-white border border-border rounded-lg text-sm text-foreground placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-accent"
              />
              <button
                onClick={handleRegenerate}
                disabled={generating}
                className="px-4 py-2 bg-accent text-white rounded-lg text-sm font-semibold hover:bg-accent-hover transition-colors disabled:opacity-50"
              >
                {generating ? "..." : "Regenerate"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
