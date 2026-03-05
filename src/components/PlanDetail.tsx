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
          Plan not found
        </h1>
        <Link href="/plans" className="text-accent hover:underline">
          Back to plans
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

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <Link
        href="/plans"
        className="text-sm text-accent hover:text-accent-hover mb-6 inline-block"
      >
        &larr; Back to Plans
      </Link>

      {/* Plan header */}
      <div className="bg-white rounded-2xl border border-border p-6 mb-6 shadow-sm">
        <div className="flex items-start justify-between mb-2">
          <h1 className="text-2xl font-bold text-foreground">{plan.name}</h1>
          <span className="text-xs px-2 py-1 bg-accent/10 text-accent rounded-full">
            {DIFFICULTY_LABELS[plan.difficulty]}
          </span>
        </div>
        <p className="text-muted mb-3">{plan.description}</p>
        <div className="flex gap-4 text-sm text-muted">
          <span>{plan.category}</span>
          <span>{plan.exercises.length} exercises</span>
          <span>~{plan.durationMinutes} min</span>
        </div>
      </div>

      {/* Exercise list */}
      <div className="mb-6">
        <h2 className="text-lg font-bold text-foreground mb-3">Exercises</h2>
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

      {/* Player */}
      {activeExerciseIndex === -1 ? (
        <button
          onClick={() => setActiveExerciseIndex(0)}
          className="w-full py-4 bg-accent text-white rounded-xl font-semibold text-lg hover:bg-accent-hover transition-colors"
        >
          Start Plan
        </button>
      ) : playerExercise ? (
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
            key={`${plan.id}-${activeExerciseIndex}`}
            exercise={playerExercise}
            startNote={rangeLow}
            endNote={rangeHigh}
          />
          <div className="flex gap-3 mt-4">
            <button
              onClick={() =>
                setActiveExerciseIndex(Math.max(0, activeExerciseIndex - 1))
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
                Finish Plan
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
  );
}
