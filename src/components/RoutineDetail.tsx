"use client";

import { use, useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import exercisesData from "@/data/exercises.json";
import demoData from "@/data/exercise-demos.json";
import type { Exercise } from "@/lib/exercises";
import { CATEGORIES } from "@/lib/exercises";
import {
  getRoutine,
  updateRoutine,
  addExerciseToRoutine,
  removeExerciseFromRoutine,
} from "@/lib/routines";
import type { Routine, RoutineExercise } from "@/lib/routines";
import { PIANO_NOTES } from "@/lib/music-utils";
import ExercisePlayer from "@/components/ExercisePlayer";
import ExerciseDemo from "@/components/ExerciseDemo";

const allExercises = exercisesData as Exercise[];
const demos = demoData as Record<
  string,
  {
    vocalInstruction: string;
    syllables: string;
    technique: string;
    demoDescription: string;
    demoRootNote: string;
    vowelOptions?: string[];
    tips?: {
      vowelShape: string;
      breathSupport: string;
      mouthAndJaw: string;
      posture: string;
      commonMistakes: string;
    };
  }
>;

const LOW_NOTES = PIANO_NOTES.filter((n) => {
  const octave = parseInt(n.slice(-1));
  return octave >= 2 && octave <= 4;
});
const HIGH_NOTES = PIANO_NOTES.filter((n) => {
  const octave = parseInt(n.slice(-1));
  return octave >= 3 && octave <= 6;
});

function findExercise(id: string): Exercise | undefined {
  return allExercises.find((ex) => ex.id === id);
}

export default function RoutineDetail({ id }: { id: string }) {
  const router = useRouter();
  const [routine, setRoutine] = useState<Routine | null>(null);
  const [activeExerciseIndex, setActiveExerciseIndex] = useState(-1);
  const [showAddExercise, setShowAddExercise] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [addSearch, setAddSearch] = useState("");
  const [addCategory, setAddCategory] = useState("All");
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    const r = getRoutine(id);
    setRoutine(r || null);
    setLoaded(true);
  }, [id]);

  const autoSave = (updates: Partial<Omit<Routine, "id" | "createdAt">>) => {
    const updated = updateRoutine(id, updates);
    if (updated) setRoutine(updated);
  };

  const handleRemoveExercise = (index: number) => {
    const updated = removeExerciseFromRoutine(id, index);
    if (updated) {
      setRoutine(updated);
      if (activeExerciseIndex === index) setActiveExerciseIndex(-1);
      else if (activeExerciseIndex > index)
        setActiveExerciseIndex(activeExerciseIndex - 1);
    }
  };

  const handleAddExercise = (exerciseId: string) => {
    const updated = addExerciseToRoutine(id, { exerciseId });
    if (updated) setRoutine(updated);
  };

  const handleMoveExercise = (index: number, direction: "up" | "down") => {
    if (!routine) return;
    const newList = [...routine.exercises];
    const target = direction === "up" ? index - 1 : index + 1;
    if (target < 0 || target >= newList.length) return;
    [newList[index], newList[target]] = [newList[target], newList[index]];
    autoSave({ exercises: newList });
  };

  const filteredAdd = useMemo(() => {
    return allExercises.filter((ex) => {
      if (addCategory !== "All" && ex.category !== addCategory) return false;
      if (addSearch) {
        const q = addSearch.toLowerCase();
        return (
          ex.name.toLowerCase().includes(q) ||
          ex.tags.some((t) => t.includes(q))
        );
      }
      return true;
    });
  }, [addSearch, addCategory]);

  if (!loaded) return null;

  if (!routine) {
    return (
      <div className="max-w-lg mx-auto px-4 py-8 text-center">
        <h1 className="text-2xl font-bold text-foreground mb-4">
          Routine not found
        </h1>
        <Link href="/routines" className="text-accent hover:underline">
          Back to routines
        </Link>
      </div>
    );
  }

  const activeExerciseConfig =
    activeExerciseIndex >= 0 ? routine.exercises[activeExerciseIndex] : null;
  const activeExercise = activeExerciseConfig
    ? findExercise(activeExerciseConfig.exerciseId)
    : null;
  const activeDemoInfo = activeExercise
    ? demos[activeExercise.id]
    : undefined;

  const isStarted = activeExerciseIndex >= 0;
  const progress = isStarted
    ? ((activeExerciseIndex + 1) / routine.exercises.length) * 100
    : 0;

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <Link
        href="/routines"
        className="text-sm text-accent hover:text-accent-hover mb-6 inline-block"
      >
        &larr; Back to My Routines
      </Link>

      <div className="flex flex-col lg:flex-row gap-8">
        {/* ── Left Panel: Routine Info & Exercise List ── */}
        <div className="lg:w-[420px] lg:flex-shrink-0">
          {/* Routine header */}
          <div className="bg-white rounded-2xl border border-border p-6 mb-6 shadow-sm">
            <div className="flex items-start justify-between mb-2">
              <h1 className="text-2xl font-bold text-foreground">
                {routine.name}
              </h1>
              <button
                onClick={() => setShowSettings(!showSettings)}
                className="text-muted hover:text-accent p-1 transition-colors"
                title="Settings"
              >
                <svg
                  className="w-5 h-5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.066 2.573c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.573 1.066c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.066-2.573c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
                  />
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                  />
                </svg>
              </button>
            </div>
            {routine.description && (
              <p className="text-muted text-sm mb-3">{routine.description}</p>
            )}
            <div className="flex gap-4 text-sm text-muted">
              <span className="flex items-center gap-1">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3" />
                </svg>
                {routine.exercises.length} exercises
              </span>
              <span className="flex items-center gap-1">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3" />
                </svg>
                Range: {routine.rangeLow} — {routine.rangeHigh}
              </span>
            </div>

            {/* Settings panel */}
            {showSettings && (
              <div className="mt-4 pt-4 border-t border-border space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs text-muted mb-1 block">
                      Range Low
                    </label>
                    <select
                      value={routine.rangeLow}
                      onChange={(e) => autoSave({ rangeLow: e.target.value })}
                      className="w-full px-2 py-1.5 bg-background border border-border rounded-lg text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-accent"
                    >
                      {LOW_NOTES.map((n) => (
                        <option key={n} value={n}>
                          {n}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="text-xs text-muted mb-1 block">
                      Range High
                    </label>
                    <select
                      value={routine.rangeHigh}
                      onChange={(e) => autoSave({ rangeHigh: e.target.value })}
                      className="w-full px-2 py-1.5 bg-background border border-border rounded-lg text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-accent"
                    >
                      {HIGH_NOTES.map((n) => (
                        <option key={n} value={n}>
                          {n}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
                <p className="text-xs text-muted">
                  Changes are saved automatically.
                </p>
              </div>
            )}

            {/* Progress bar */}
            {isStarted && (
              <div className="mt-4 pt-4 border-t border-border">
                <div className="flex justify-between text-xs text-muted mb-1.5">
                  <span>Progress</span>
                  <span>
                    {activeExerciseIndex + 1} of {routine.exercises.length}
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
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-lg font-bold text-foreground">Exercises</h2>
              <button
                onClick={() => setShowAddExercise(!showAddExercise)}
                className="text-sm text-accent hover:text-accent-hover font-medium"
              >
                {showAddExercise ? "Done adding" : "+ Add exercise"}
              </button>
            </div>

            {/* Add exercise panel */}
            {showAddExercise && (
              <div className="bg-white border border-border rounded-xl p-4 mb-4 shadow-sm">
                <input
                  type="text"
                  placeholder="Search exercises..."
                  value={addSearch}
                  onChange={(e) => setAddSearch(e.target.value)}
                  className="w-full px-3 py-2 bg-background border border-border rounded-lg text-sm text-foreground placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-accent mb-3"
                />
                <div className="flex flex-wrap gap-1.5 mb-3">
                  <button
                    onClick={() => setAddCategory("All")}
                    className={`px-2 py-0.5 rounded-full text-[10px] ${
                      addCategory === "All"
                        ? "bg-accent text-white"
                        : "bg-background text-muted"
                    }`}
                  >
                    All
                  </button>
                  {CATEGORIES.map((cat) => (
                    <button
                      key={cat}
                      onClick={() => setAddCategory(cat)}
                      className={`px-2 py-0.5 rounded-full text-[10px] ${
                        addCategory === cat
                          ? "bg-accent text-white"
                          : "bg-background text-muted"
                      }`}
                    >
                      {cat}
                    </button>
                  ))}
                </div>
                <div className="max-h-48 overflow-y-auto space-y-1">
                  {filteredAdd.map((ex) => (
                    <button
                      key={ex.id}
                      onClick={() => handleAddExercise(ex.id)}
                      className="w-full text-left px-3 py-2 rounded-lg hover:bg-card-hover text-sm transition-colors flex items-center justify-between"
                    >
                      <span className="text-foreground">{ex.name}</span>
                      <span className="text-accent text-xs">+ Add</span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            <div className="space-y-2">
              {routine.exercises.map((pe, index) => {
                const ex = findExercise(pe.exerciseId);
                if (!ex) return null;
                const isActive = index === activeExerciseIndex;

                return (
                  <div
                    key={`${pe.exerciseId}-${index}`}
                    className={`p-4 rounded-xl border-2 transition-all ${
                      isActive
                        ? "border-accent bg-accent-light shadow-sm"
                        : "border-border hover:border-accent/20"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className="flex flex-col gap-0.5">
                        <button
                          onClick={() => handleMoveExercise(index, "up")}
                          disabled={index === 0}
                          className="text-muted hover:text-accent disabled:opacity-20"
                        >
                          <svg
                            className="w-3 h-3"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                            strokeWidth={3}
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              d="M5 15l7-7 7 7"
                            />
                          </svg>
                        </button>
                        <button
                          onClick={() => handleMoveExercise(index, "down")}
                          disabled={index === routine.exercises.length - 1}
                          className="text-muted hover:text-accent disabled:opacity-20"
                        >
                          <svg
                            className="w-3 h-3"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                            strokeWidth={3}
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              d="M19 9l-7 7-7-7"
                            />
                          </svg>
                        </button>
                      </div>
                      <button
                        onClick={() =>
                          setActiveExerciseIndex(isActive ? -1 : index)
                        }
                        className="flex-1 text-left flex items-center gap-3"
                      >
                        <div
                          className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium flex-shrink-0 ${
                            isActive
                              ? "bg-accent text-white"
                              : "bg-border text-muted"
                          }`}
                        >
                          {index + 1}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="font-medium text-foreground text-sm">
                            {ex.name}
                          </div>
                          <div className="text-xs text-muted">
                            {ex.category}
                          </div>
                        </div>
                      </button>
                      <button
                        onClick={() => handleRemoveExercise(index)}
                        className="text-muted hover:text-red-500 p-1"
                        title="Remove"
                      >
                        <svg
                          className="w-4 h-4"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                          strokeWidth={2}
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M6 18L18 6M6 6l12 12"
                          />
                        </svg>
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Start button (mobile only) */}
          {!isStarted && routine.exercises.length > 0 && (
            <button
              onClick={() => setActiveExerciseIndex(0)}
              className="w-full py-4 bg-accent text-white rounded-xl font-semibold text-lg hover:bg-accent-hover transition-colors lg:hidden"
            >
              Start Practice
            </button>
          )}
        </div>

        {/* ── Right Panel: Player ── */}
        <div className="flex-1 min-w-0">
          <div className="lg:sticky lg:top-8">
            {!isStarted ? (
              routine.exercises.length > 0 ? (
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
                    Your routine has {routine.exercises.length} exercises.
                    Click an exercise on the left or start from the beginning.
                  </p>
                  <button
                    onClick={() => setActiveExerciseIndex(0)}
                    className="px-8 py-3 bg-accent text-white rounded-xl font-semibold text-lg hover:bg-accent-hover transition-colors"
                  >
                    Start Practice
                  </button>
                </div>
              ) : (
                <div className="bg-white rounded-2xl border border-border shadow-sm p-8 text-center">
                  <div className="w-16 h-16 bg-background rounded-full flex items-center justify-center mx-auto mb-4">
                    <svg className="w-8 h-8 text-muted" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                    </svg>
                  </div>
                  <h3 className="text-lg font-bold text-foreground mb-2">
                    Build your routine
                  </h3>
                  <p className="text-muted text-sm">
                    Add exercises using the &ldquo;+ Add exercise&rdquo; button
                    on the left to get started.
                  </p>
                </div>
              )
            ) : activeExercise ? (
              <div>
                {/* Current exercise header */}
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <span className="text-xs text-accent font-semibold uppercase tracking-wide">
                      Exercise {activeExerciseIndex + 1} of{" "}
                      {routine.exercises.length}
                    </span>
                    <h3 className="text-lg font-bold text-foreground">
                      {activeExercise.name}
                    </h3>
                  </div>
                </div>

                {/* Demo info */}
                {activeDemoInfo && (
                  <div className="mb-6">
                    <ExerciseDemo
                      exercise={activeExercise}
                      demoInfo={activeDemoInfo}
                    />
                  </div>
                )}

                {/* Player */}
                <ExercisePlayer
                  key={`routine-${id}-${activeExerciseIndex}`}
                  exercise={activeExercise}
                  startNote={routine.rangeLow}
                  endNote={routine.rangeHigh}
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
                    className="flex-1 py-3 border border-border rounded-lg text-muted hover:text-foreground hover:bg-card-hover disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                  >
                    Previous
                  </button>
                  {activeExerciseIndex < routine.exercises.length - 1 ? (
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
          </div>
        </div>
      </div>
    </div>
  );
}
