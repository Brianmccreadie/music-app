"use client";

import { use, useState, useEffect } from "react";
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

export default function PlanDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
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
        <h1 className="text-2xl font-bold text-gray-900 mb-4">
          Plan not found
        </h1>
        <Link href="/plans" className="text-indigo-600 hover:underline">
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

  // Apply tempo override if specified in the plan
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
        className="text-sm text-indigo-600 hover:text-indigo-700 mb-6 inline-block"
      >
        &larr; Back to Plans
      </Link>

      {/* Plan header */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-6">
        <div className="flex items-start justify-between mb-2">
          <h1 className="text-2xl font-bold text-gray-900">{plan.name}</h1>
          <span className="text-xs px-2 py-1 bg-indigo-100 text-indigo-700 rounded-full">
            {DIFFICULTY_LABELS[plan.difficulty]}
          </span>
        </div>
        <p className="text-gray-500 mb-3">{plan.description}</p>
        <div className="flex gap-4 text-sm text-gray-400">
          <span>{plan.category}</span>
          <span>{plan.exercises.length} exercises</span>
          <span>~{plan.durationMinutes} min</span>
        </div>
      </div>

      {/* Exercise list */}
      <div className="mb-6">
        <h2 className="text-lg font-bold text-gray-900 mb-3">Exercises</h2>
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
                    ? "border-indigo-600 bg-indigo-50"
                    : isCompleted
                      ? "border-green-200 bg-green-50"
                      : "border-gray-100 hover:border-gray-200"
                }`}
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                      isActive
                        ? "bg-indigo-600 text-white"
                        : isCompleted
                          ? "bg-green-500 text-white"
                          : "bg-gray-200 text-gray-600"
                    }`}
                  >
                    {isCompleted ? "✓" : index + 1}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-medium text-gray-900 text-sm">
                      {ex.name}
                    </div>
                    {pe.notes && (
                      <div className="text-xs text-gray-500 mt-0.5 truncate">
                        {pe.notes}
                      </div>
                    )}
                  </div>
                  {pe.tempoOverride && (
                    <span className="text-xs text-gray-400">
                      {pe.tempoOverride} BPM
                    </span>
                  )}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Start / Player */}
      {activeExerciseIndex === -1 ? (
        <button
          onClick={() => setActiveExerciseIndex(0)}
          className="w-full py-4 bg-indigo-600 text-white rounded-xl font-medium text-lg hover:bg-indigo-700 transition-colors"
        >
          Start Plan
        </button>
      ) : playerExercise ? (
        <div>
          {activeExerciseConfig?.notes && (
            <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 mb-4">
              <div className="text-xs font-medium text-amber-700 mb-1">
                Coach Tip
              </div>
              <div className="text-sm text-amber-800">
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
              className="flex-1 py-3 border border-gray-200 rounded-lg text-gray-600 hover:bg-gray-50 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
            >
              Previous
            </button>
            {activeExerciseIndex < plan.exercises.length - 1 ? (
              <button
                onClick={() =>
                  setActiveExerciseIndex(activeExerciseIndex + 1)
                }
                className="flex-1 py-3 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700 transition-colors"
              >
                Next Exercise
              </button>
            ) : (
              <button
                onClick={() => setActiveExerciseIndex(-1)}
                className="flex-1 py-3 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 transition-colors"
              >
                Finish Plan
              </button>
            )}
          </div>
        </div>
      ) : (
        <div className="text-center py-8 text-gray-400">
          Exercise not found. Try the next one.
        </div>
      )}
    </div>
  );
}
