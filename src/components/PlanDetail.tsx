"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import plansData from "@/data/plans.json";
import exercisesData from "@/data/exercises.json";
import type { Plan } from "@/lib/plans";
import type { Exercise } from "@/lib/exercises";
import { DIFFICULTY_LABELS } from "@/lib/exercises";
import { getProfile } from "@/lib/user-profile";
import ExercisePlayer from "@/components/ExercisePlayer";

const plans = plansData as Plan[];
const exercises = exercisesData as Exercise[];

function findExercise(id: string): Exercise | undefined {
  return exercises.find((ex) => ex.id === id);
}

export default function PlanDetail({ id }: { id: string }) {
  const plan = plans.find((p) => p.id === id);

  const [activeExerciseIndex, setActiveExerciseIndex] = useState<number>(-1);
  const [rangeLow, setRangeLow] = useState("C3");
  const [rangeHigh, setRangeHigh] = useState("A4");

  useEffect(() => {
    const profile = getProfile();
    if (profile.onboardingComplete) {
      setRangeLow(profile.rangeLow);
      setRangeHigh(profile.rangeHigh);
    }
  }, []);

  if (!plan) {
    return (
      <div className="max-w-lg mx-auto px-4 py-8 text-center">
        <h1 className="text-2xl font-bold text-foreground mb-4">
          Program not found
        </h1>
        <Link href="/plans" className="text-accent hover:underline">
          Back to Core Training
        </Link>
      </div>
    );
  }

  const activeExerciseConfig =
    activeExerciseIndex >= 0 ? plan.exercises[activeExerciseIndex] : null;
  const activeExercise = activeExerciseConfig
    ? findExercise(activeExerciseConfig.exerciseId)
    : null;
  const playerExercise =
    activeExercise && activeExerciseConfig
      ? activeExerciseConfig.tempoOverride
        ? { ...activeExercise }
        : activeExercise
      : null;

  const isStarted = activeExerciseIndex >= 0;
  const progress = isStarted
    ? ((activeExerciseIndex + 1) / plan.exercises.length) * 100
    : 0;

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <Link
        href="/plans"
        className="text-sm text-accent hover:text-accent-hover mb-6 inline-block"
      >
        &larr; Back to Core Training
      </Link>

      <div className="flex flex-col lg:flex-row gap-8">
        {/* ── Left Panel: Plan Info & Exercise List ── */}
        <div className="lg:w-[420px] lg:flex-shrink-0">
          {/* Plan header */}
          <div className="bg-white rounded-2xl border border-border p-6 mb-6 shadow-sm">
            <div className="flex items-start justify-between mb-2">
              <h1 className="text-2xl font-bold text-foreground">
                {plan.name}
              </h1>
              <span className="text-xs px-2 py-1 bg-accent/10 text-accent rounded-full whitespace-nowrap ml-3">
                {DIFFICULTY_LABELS[plan.difficulty]}
              </span>
            </div>
            <p className="text-muted text-sm mb-4">{plan.description}</p>
            <div className="flex gap-4 text-sm text-muted">
              <span className="flex items-center gap-1">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                </svg>
                {plan.category}
              </span>
              <span className="flex items-center gap-1">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3" />
                </svg>
                {plan.exercises.length} exercises
              </span>
              <span className="flex items-center gap-1">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                ~{plan.durationMinutes} min
              </span>
            </div>

            {/* Progress bar */}
            {isStarted && (
              <div className="mt-4 pt-4 border-t border-border">
                <div className="flex justify-between text-xs text-muted mb-1.5">
                  <span>Progress</span>
                  <span>
                    {activeExerciseIndex + 1} of {plan.exercises.length}
                  </span>
                </div>
                <div className="h-2 bg-background rounded-full overflow-hidden">
                  <div
                    className="h-full bg-accent rounded-full transition-all duration-300"
                    style={{ width: `${progress}%` }}
                  />
                </div>
              </div>
            )}
          </div>

          {/* Exercise list */}
          <div className="mb-6">
            <h2 className="text-lg font-bold text-foreground mb-3">
              Exercises
            </h2>
            <div className="space-y-2">
              {plan.exercises.map((pe, index) => {
                const ex = findExercise(pe.exerciseId);
                if (!ex) return null;
                const isActive = index === activeExerciseIndex;
                const isCompleted = isStarted && index < activeExerciseIndex;

                return (
                  <button
                    key={index}
                    onClick={() => setActiveExerciseIndex(index)}
                    className={`w-full text-left p-4 rounded-xl border-2 transition-all ${
                      isActive
                        ? "border-accent bg-accent-light shadow-sm"
                        : isCompleted
                          ? "border-emerald-200 bg-emerald-50"
                          : "border-border hover:border-accent/20"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium flex-shrink-0 ${
                          isActive
                            ? "bg-accent text-white"
                            : isCompleted
                              ? "bg-emerald-600 text-white"
                              : "bg-border text-muted"
                        }`}
                      >
                        {isCompleted ? (
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                          </svg>
                        ) : (
                          index + 1
                        )}
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
                        <span className="text-xs text-muted flex-shrink-0">
                          {pe.tempoOverride} BPM
                        </span>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Start button (mobile only when player is hidden below) */}
          {!isStarted && (
            <button
              onClick={() => setActiveExerciseIndex(0)}
              className="w-full py-4 bg-accent text-white rounded-xl font-semibold text-lg hover:bg-accent-hover transition-colors lg:hidden"
            >
              Start Program
            </button>
          )}
        </div>

        {/* ── Right Panel: Player ── */}
        <div className="flex-1 min-w-0">
          <div className="lg:sticky lg:top-8">
            {/* Exercise navigation bar */}
            {isStarted && (
              <div className="bg-white rounded-xl border border-border p-3 mb-4 shadow-sm">
                <div className="flex items-center gap-1 overflow-x-auto pb-1">
                  {plan.exercises.map((pe, index) => {
                    const ex = findExercise(pe.exerciseId);
                    const isActive = index === activeExerciseIndex;
                    const isCompleted = index < activeExerciseIndex;
                    return (
                      <button
                        key={index}
                        onClick={() => setActiveExerciseIndex(index)}
                        className={`flex-shrink-0 w-9 h-9 rounded-full flex items-center justify-center text-xs font-medium transition-all ${
                          isActive
                            ? "bg-accent text-white shadow-md scale-110"
                            : isCompleted
                              ? "bg-emerald-100 text-emerald-700"
                              : "bg-background text-muted hover:bg-accent/10"
                        }`}
                        title={ex?.name}
                      >
                        {isCompleted ? (
                          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                          </svg>
                        ) : (
                          index + 1
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {!isStarted ? (
              <div className="bg-white rounded-2xl border border-border shadow-sm p-8 text-center">
                <div className="w-16 h-16 bg-accent-light rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-accent" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                    <path strokeLinecap="round" strokeLinejoin="round" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <h3 className="text-lg font-bold text-foreground mb-2">
                  Ready to practice?
                </h3>
                <p className="text-muted text-sm mb-6">
                  This program has {plan.exercises.length} exercises and takes
                  about {plan.durationMinutes} minutes. Click an exercise on the
                  left or start from the beginning.
                </p>
                <button
                  onClick={() => setActiveExerciseIndex(0)}
                  className="px-8 py-3 bg-accent text-white rounded-xl font-semibold text-lg hover:bg-accent-hover transition-colors"
                >
                  Start Program
                </button>
              </div>
            ) : playerExercise ? (
              <div>
                {/* Current exercise header */}
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <span className="text-xs text-accent font-semibold uppercase tracking-wide">
                      Exercise {activeExerciseIndex + 1} of{" "}
                      {plan.exercises.length}
                    </span>
                    <h3 className="text-lg font-bold text-foreground">
                      {playerExercise.name}
                    </h3>
                  </div>
                  {activeExerciseConfig?.tempoOverride && (
                    <span className="text-sm text-muted bg-background px-3 py-1 rounded-full">
                      {activeExerciseConfig.tempoOverride} BPM
                    </span>
                  )}
                </div>

                {/* Coach tip */}
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

                {/* Player */}
                <ExercisePlayer
                  key={`${plan.id}-${activeExerciseIndex}`}
                  exercise={playerExercise}
                  startNote={rangeLow}
                  endNote={rangeHigh}
                />

                {/* Navigation */}
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
                      Finish Program
                    </button>
                  )}
                </div>
              </div>
            ) : (
              <div className="text-center py-8 text-muted">
                Exercise not found. Try the next one.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
