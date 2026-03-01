"use client";

import { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import exercisesData from "@/data/exercises.json";
import type { Exercise } from "@/lib/exercises";
import { CATEGORIES, DIFFICULTY_LABELS, GOAL_TAG_MAP } from "@/lib/exercises";
import { createRoutine } from "@/lib/routines";
import { getProfile, GOAL_OPTIONS, VOICE_TYPES, VOICE_RANGE_PRESETS, EXPERIENCE_LEVELS } from "@/lib/user-profile";
import { PIANO_NOTES } from "@/lib/music-utils";
import ExerciseCard from "@/components/ExerciseCard";

const exercises = exercisesData as Exercise[];

const LOW_NOTES = PIANO_NOTES.filter((n) => {
  const octave = parseInt(n.slice(-1));
  return octave >= 2 && octave <= 4;
});
const HIGH_NOTES = PIANO_NOTES.filter((n) => {
  const octave = parseInt(n.slice(-1));
  return octave >= 3 && octave <= 6;
});

type Mode = "choose" | "intake" | "manual";

function recommendExercises(
  goals: string[],
  experience: string
): { exerciseId: string; notes?: string }[] {
  // Score exercises based on goals
  const scored = exercises.map((ex) => {
    let score = 0;
    for (const goal of goals) {
      const tags = GOAL_TAG_MAP[goal] || [];
      for (const tag of tags) {
        if (ex.tags.includes(tag)) score += 2;
      }
    }

    // Difficulty match
    const diffTarget =
      experience === "Beginner" ? 1 : experience === "Intermediate" ? 2 : 3;
    if (ex.difficulty <= diffTarget + 1) score += 1;
    if (ex.difficulty === diffTarget) score += 2;

    // Warm-ups always get a boost
    if (ex.category === "Warm-Ups") score += 1;

    return { exercise: ex, score };
  });

  scored.sort((a, b) => b.score - a.score);

  // Take top 6-8 exercises, starting with a warm-up
  const warmUp = scored.find((s) => s.exercise.category === "Warm-Ups");
  const rest = scored
    .filter((s) => s !== warmUp && s.score > 0)
    .slice(0, warmUp ? 6 : 7);

  const result = warmUp ? [warmUp, ...rest] : rest;

  return result.map((r) => ({ exerciseId: r.exercise.id }));
}

export default function NewRoutinePage() {
  const router = useRouter();
  const [mode, setMode] = useState<Mode>("choose");

  // Intake state
  const [voiceType, setVoiceType] = useState("");
  const [rangeLow, setRangeLow] = useState("C3");
  const [rangeHigh, setRangeHigh] = useState("A4");
  const [goals, setGoals] = useState<string[]>([]);
  const [experience, setExperience] = useState("");
  const [intakeStep, setIntakeStep] = useState(1);

  // Routine state (shared between modes)
  const [routineName, setRoutineName] = useState("");
  const [routineDesc, setRoutineDesc] = useState("");
  const [selectedExercises, setSelectedExercises] = useState<
    { exerciseId: string; notes?: string }[]
  >([]);

  // Manual mode search
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");

  // Load profile defaults
  useEffect(() => {
    const profile = getProfile();
    if (profile.onboardingComplete) {
      setRangeLow(profile.rangeLow);
      setRangeHigh(profile.rangeHigh);
      setVoiceType(profile.voiceType);
      setExperience(profile.experienceLevel);
      setGoals(profile.goals);
    }
  }, []);

  const handleVoiceSelect = (vt: string) => {
    setVoiceType(vt);
    const preset = VOICE_RANGE_PRESETS[vt];
    if (preset) {
      setRangeLow(preset.low);
      setRangeHigh(preset.high);
    }
  };

  const toggleGoal = (goal: string) => {
    setGoals((prev) =>
      prev.includes(goal) ? prev.filter((g) => g !== goal) : [...prev, goal]
    );
  };

  const handleIntakeComplete = () => {
    const recommended = recommendExercises(goals, experience);
    setSelectedExercises(recommended);
    setRoutineName(
      goals.length > 0
        ? `${goals[0]} Routine`
        : `${experience || "Custom"} Routine`
    );
    setMode("manual"); // Go to editor
  };

  const toggleExercise = (exerciseId: string) => {
    setSelectedExercises((prev) => {
      const exists = prev.find((e) => e.exerciseId === exerciseId);
      if (exists) return prev.filter((e) => e.exerciseId !== exerciseId);
      return [...prev, { exerciseId }];
    });
  };

  const moveExercise = (index: number, direction: "up" | "down") => {
    setSelectedExercises((prev) => {
      const newList = [...prev];
      const target = direction === "up" ? index - 1 : index + 1;
      if (target < 0 || target >= newList.length) return prev;
      [newList[index], newList[target]] = [newList[target], newList[index]];
      return newList;
    });
  };

  const removeExercise = (index: number) => {
    setSelectedExercises((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSave = () => {
    if (!routineName.trim() || selectedExercises.length === 0) return;
    createRoutine({
      name: routineName.trim(),
      description: routineDesc.trim(),
      exercises: selectedExercises,
      rangeLow,
      rangeHigh,
    });
    router.push("/routines");
  };

  const filteredExercises = useMemo(() => {
    return exercises.filter((ex) => {
      if (selectedCategory !== "All" && ex.category !== selectedCategory)
        return false;
      if (search) {
        const q = search.toLowerCase();
        return (
          ex.name.toLowerCase().includes(q) ||
          ex.tags.some((t) => t.includes(q))
        );
      }
      return true;
    });
  }, [search, selectedCategory]);

  // --- Choose mode ---
  if (mode === "choose") {
    return (
      <div className="max-w-lg mx-auto px-4 py-12">
        <Link
          href="/routines"
          className="text-sm text-accent hover:text-accent-hover mb-6 inline-block"
        >
          &larr; Back to Routines
        </Link>
        <h1 className="text-2xl font-bold text-foreground mb-2">
          Create New Routine
        </h1>
        <p className="text-muted mb-8">How would you like to start?</p>

        <div className="space-y-4">
          <button
            onClick={() => setMode("intake")}
            className="w-full text-left bg-card rounded-xl border border-border hover:border-accent/50 transition-all p-6"
          >
            <div className="font-bold text-foreground text-lg mb-1">
              Guided Setup
            </div>
            <p className="text-sm text-muted">
              Answer a few questions about your voice and goals. We&apos;ll
              recommend exercises, and you can customize from there.
            </p>
          </button>

          <button
            onClick={() => setMode("manual")}
            className="w-full text-left bg-card rounded-xl border border-border hover:border-accent/50 transition-all p-6"
          >
            <div className="font-bold text-foreground text-lg mb-1">
              Build Manually
            </div>
            <p className="text-sm text-muted">
              Skip the questions and pick exercises yourself from the full
              library. Arrange them in any order you want.
            </p>
          </button>
        </div>
      </div>
    );
  }

  // --- Intake mode ---
  if (mode === "intake") {
    return (
      <div className="max-w-lg mx-auto px-4 py-12">
        <button
          onClick={() =>
            intakeStep > 1 ? setIntakeStep(intakeStep - 1) : setMode("choose")
          }
          className="text-sm text-accent hover:text-accent-hover mb-6 inline-block"
        >
          &larr; Back
        </button>

        {/* Progress */}
        <div className="flex gap-2 mb-8">
          {[1, 2, 3, 4].map((s) => (
            <div
              key={s}
              className={`h-1 flex-1 rounded-full transition-colors ${
                s <= intakeStep ? "bg-accent" : "bg-border"
              }`}
            />
          ))}
        </div>

        {/* Step 1: Voice Type */}
        {intakeStep === 1 && (
          <div>
            <h2 className="text-2xl font-bold text-foreground mb-2">
              What&apos;s your voice type?
            </h2>
            <p className="text-muted mb-6">
              This sets your range. Skip if unsure.
            </p>
            <div className="grid grid-cols-2 gap-3 mb-6">
              {VOICE_TYPES.map((vt) => (
                <button
                  key={vt}
                  onClick={() => handleVoiceSelect(vt)}
                  className={`p-4 rounded-xl border-2 text-left transition-all ${
                    voiceType === vt
                      ? "border-accent bg-accent/10"
                      : "border-border hover:border-accent/30"
                  }`}
                >
                  <div className="font-medium text-foreground">{vt}</div>
                  <div className="text-xs text-muted mt-1">
                    {VOICE_RANGE_PRESETS[vt]?.low} — {VOICE_RANGE_PRESETS[vt]?.high}
                  </div>
                </button>
              ))}
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => setIntakeStep(2)}
                className="flex-1 py-3 text-muted hover:text-foreground"
              >
                Skip
              </button>
              <button
                onClick={() => setIntakeStep(2)}
                className="flex-1 py-3 bg-accent text-background rounded-lg font-semibold hover:bg-accent-hover transition-colors"
              >
                Next
              </button>
            </div>
          </div>
        )}

        {/* Step 2: Range */}
        {intakeStep === 2 && (
          <div>
            <h2 className="text-2xl font-bold text-foreground mb-2">
              Set your range
            </h2>
            <p className="text-muted mb-6">
              Your lowest and highest comfortable notes.
            </p>
            <div className="grid grid-cols-2 gap-4 mb-6">
              <div>
                <label className="text-sm font-medium text-muted mb-2 block">
                  Low Note
                </label>
                <select
                  value={rangeLow}
                  onChange={(e) => setRangeLow(e.target.value)}
                  className="w-full px-4 py-3 bg-card border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-accent"
                >
                  {LOW_NOTES.map((note) => (
                    <option key={note} value={note}>
                      {note}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-sm font-medium text-muted mb-2 block">
                  High Note
                </label>
                <select
                  value={rangeHigh}
                  onChange={(e) => setRangeHigh(e.target.value)}
                  className="w-full px-4 py-3 bg-card border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-accent"
                >
                  {HIGH_NOTES.map((note) => (
                    <option key={note} value={note}>
                      {note}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <div className="bg-card rounded-xl p-4 mb-6 text-center border border-border">
              <div className="text-sm text-muted">Your range</div>
              <div className="text-2xl font-bold text-accent">
                {rangeLow} — {rangeHigh}
              </div>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => setIntakeStep(1)}
                className="flex-1 py-3 text-muted hover:text-foreground"
              >
                Back
              </button>
              <button
                onClick={() => setIntakeStep(3)}
                className="flex-1 py-3 bg-accent text-background rounded-lg font-semibold hover:bg-accent-hover transition-colors"
              >
                Next
              </button>
            </div>
          </div>
        )}

        {/* Step 3: Goals */}
        {intakeStep === 3 && (
          <div>
            <h2 className="text-2xl font-bold text-foreground mb-2">
              What are your goals?
            </h2>
            <p className="text-muted mb-6">Select all that apply.</p>
            <div className="grid grid-cols-2 gap-3 mb-6">
              {GOAL_OPTIONS.map((goal) => (
                <button
                  key={goal}
                  onClick={() => toggleGoal(goal)}
                  className={`p-3 rounded-xl border-2 text-sm text-left transition-all ${
                    goals.includes(goal)
                      ? "border-accent bg-accent/10 text-accent"
                      : "border-border text-muted hover:border-accent/30"
                  }`}
                >
                  {goal}
                </button>
              ))}
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => setIntakeStep(2)}
                className="flex-1 py-3 text-muted hover:text-foreground"
              >
                Back
              </button>
              <button
                onClick={() => setIntakeStep(4)}
                className="flex-1 py-3 bg-accent text-background rounded-lg font-semibold hover:bg-accent-hover transition-colors"
              >
                Next
              </button>
            </div>
          </div>
        )}

        {/* Step 4: Experience */}
        {intakeStep === 4 && (
          <div>
            <h2 className="text-2xl font-bold text-foreground mb-2">
              Experience level?
            </h2>
            <p className="text-muted mb-6">
              We&apos;ll match exercises to your skill.
            </p>
            <div className="space-y-3 mb-8">
              {EXPERIENCE_LEVELS.map((level) => (
                <button
                  key={level}
                  onClick={() => setExperience(level)}
                  className={`w-full p-4 rounded-xl border-2 text-left transition-all ${
                    experience === level
                      ? "border-accent bg-accent/10"
                      : "border-border hover:border-accent/30"
                  }`}
                >
                  <div className="font-medium text-foreground">{level}</div>
                  <div className="text-xs text-muted mt-1">
                    {level === "Beginner" && "New to vocal exercises"}
                    {level === "Intermediate" && "Some training experience"}
                    {level === "Advanced" && "Extensive vocal training"}
                  </div>
                </button>
              ))}
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => setIntakeStep(3)}
                className="flex-1 py-3 text-muted hover:text-foreground"
              >
                Back
              </button>
              <button
                onClick={handleIntakeComplete}
                disabled={!experience}
                className="flex-1 py-3 bg-accent text-background rounded-lg font-semibold hover:bg-accent-hover transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
              >
                Build My Routine
              </button>
            </div>
          </div>
        )}
      </div>
    );
  }

  // --- Manual / Editor mode ---
  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <button
        onClick={() => {
          if (selectedExercises.length === 0) setMode("choose");
          else if (
            confirm("Go back? Your selected exercises will be kept.")
          )
            setMode("choose");
        }}
        className="text-sm text-accent hover:text-accent-hover mb-6 inline-block"
      >
        &larr; Back
      </button>

      <div className="grid gap-8 lg:grid-cols-5">
        {/* Left: routine builder */}
        <div className="lg:col-span-2">
          <div className="sticky top-20">
            <h2 className="text-xl font-bold text-foreground mb-4">
              Your Routine
            </h2>

            <div className="space-y-3 mb-4">
              <input
                type="text"
                placeholder="Routine name..."
                value={routineName}
                onChange={(e) => setRoutineName(e.target.value)}
                className="w-full px-4 py-2.5 bg-card border border-border rounded-lg text-foreground placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-accent"
              />
              <textarea
                placeholder="Description (optional)"
                value={routineDesc}
                onChange={(e) => setRoutineDesc(e.target.value)}
                rows={2}
                className="w-full px-4 py-2 bg-card border border-border rounded-lg text-foreground placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-accent text-sm resize-none"
              />

              {/* Range */}
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-xs text-muted mb-1 block">
                    Range Low
                  </label>
                  <select
                    value={rangeLow}
                    onChange={(e) => setRangeLow(e.target.value)}
                    className="w-full px-2 py-1.5 bg-card border border-border rounded-lg text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-accent"
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
                    value={rangeHigh}
                    onChange={(e) => setRangeHigh(e.target.value)}
                    className="w-full px-2 py-1.5 bg-card border border-border rounded-lg text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-accent"
                  >
                    {HIGH_NOTES.map((n) => (
                      <option key={n} value={n}>
                        {n}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* Exercise order */}
            {selectedExercises.length === 0 ? (
              <div className="bg-card border border-border border-dashed rounded-xl p-8 text-center">
                <p className="text-muted text-sm">
                  Add exercises from the library on the right.
                </p>
              </div>
            ) : (
              <div className="space-y-2 mb-4">
                {selectedExercises.map((se, index) => {
                  const ex = exercises.find((e) => e.id === se.exerciseId);
                  if (!ex) return null;
                  return (
                    <div
                      key={`${se.exerciseId}-${index}`}
                      className="bg-card border border-border rounded-lg p-3 flex items-center gap-2"
                    >
                      <div className="flex flex-col gap-0.5">
                        <button
                          onClick={() => moveExercise(index, "up")}
                          disabled={index === 0}
                          className="text-muted hover:text-accent disabled:opacity-20 text-xs"
                        >
                          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M5 15l7-7 7 7" />
                          </svg>
                        </button>
                        <button
                          onClick={() => moveExercise(index, "down")}
                          disabled={index === selectedExercises.length - 1}
                          className="text-muted hover:text-accent disabled:opacity-20 text-xs"
                        >
                          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                          </svg>
                        </button>
                      </div>
                      <span className="w-5 h-5 rounded-full bg-accent/20 text-accent text-[10px] font-bold flex items-center justify-center flex-shrink-0">
                        {index + 1}
                      </span>
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-medium text-foreground truncate">
                          {ex.name}
                        </div>
                        <div className="text-[10px] text-muted">
                          {ex.category}
                        </div>
                      </div>
                      <button
                        onClick={() => removeExercise(index)}
                        className="text-muted hover:text-red-400 p-1"
                      >
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    </div>
                  );
                })}
              </div>
            )}

            <button
              onClick={handleSave}
              disabled={!routineName.trim() || selectedExercises.length === 0}
              className="w-full py-3 bg-accent text-background rounded-lg font-semibold hover:bg-accent-hover transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
            >
              Save Routine ({selectedExercises.length} exercises)
            </button>
          </div>
        </div>

        {/* Right: exercise browser */}
        <div className="lg:col-span-3">
          <h2 className="text-xl font-bold text-foreground mb-4">
            Exercise Library
          </h2>

          <div className="space-y-3 mb-4">
            <input
              type="text"
              placeholder="Search exercises..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full px-4 py-2 bg-card border border-border rounded-lg text-foreground placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-accent text-sm"
            />
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => setSelectedCategory("All")}
                className={`px-3 py-1 rounded-full text-xs transition-colors ${
                  selectedCategory === "All"
                    ? "bg-accent text-background"
                    : "bg-card border border-border text-muted"
                }`}
              >
                All
              </button>
              {CATEGORIES.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-3 py-1 rounded-full text-xs transition-colors ${
                    selectedCategory === cat
                      ? "bg-accent text-background"
                      : "bg-card border border-border text-muted"
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          <div className="grid gap-2 sm:grid-cols-2">
            {filteredExercises.map((ex) => {
              const isSelected = selectedExercises.some(
                (s) => s.exerciseId === ex.id
              );
              return (
                <ExerciseCard
                  key={ex.id}
                  exercise={ex}
                  onClick={() => toggleExercise(ex.id)}
                  selected={isSelected}
                />
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
