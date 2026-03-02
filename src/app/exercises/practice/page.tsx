"use client";

import { useState, useEffect, useCallback, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import exercisesData from "@/data/exercises.json";
import demoData from "@/data/exercise-demos.json";
import type { Exercise } from "@/lib/exercises";
import { TRACKS } from "@/lib/tracks";
import ExercisePlayer from "@/components/ExercisePlayer";
import ExerciseDemo from "@/components/ExerciseDemo";
import { getProfile } from "@/lib/user-profile";
import { getSmartRange } from "@/lib/music-utils";

const exercises = exercisesData as Exercise[];
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

export default function PracticeModePage() {
  return (
    <Suspense>
      <PracticeModeContent />
    </Suspense>
  );
}

function PracticeModeContent() {
  const searchParams = useSearchParams();
  const trackId = searchParams.get("track");
  const track = trackId ? TRACKS.find((t) => t.id === trackId) : null;

  const [currentIndex, setCurrentIndex] = useState(0);
  const [startNote, setStartNote] = useState("C3");
  const [endNote, setEndNote] = useState("A4");

  const trackExercises = track
    ? (track.exerciseIds
        .map((id) => exercises.find((ex) => ex.id === id))
        .filter(Boolean) as Exercise[])
    : [];

  const currentExercise = trackExercises[currentIndex] ?? null;
  const demoInfo = currentExercise ? demos[currentExercise.id] : null;

  // Reset to first exercise when track changes
  useEffect(() => {
    setCurrentIndex(0);
  }, [trackId]);

  // Apply smart range per exercise
  useEffect(() => {
    const profile = getProfile();
    if (!profile.onboardingComplete) return;
    if (currentExercise) {
      const smart = getSmartRange(
        profile.rangeLow,
        profile.rangeHigh,
        currentExercise.tags,
        currentExercise.category
      );
      setStartNote(smart.low);
      setEndNote(smart.high);
    } else {
      setStartNote(profile.rangeLow);
      setEndNote(profile.rangeHigh);
    }
  }, [currentExercise]);

  if (!track) {
    return (
      <div className="max-w-lg mx-auto px-4 py-8 text-center">
        <h1 className="text-2xl font-bold text-foreground mb-4">
          No track selected
        </h1>
        <Link href="/" className="text-accent hover:underline">
          Browse practice tracks
        </Link>
      </div>
    );
  }

  const goToPrev = useCallback(() => {
    setCurrentIndex((i) => Math.max(0, i - 1));
  }, []);

  const goToNext = useCallback(() => {
    setCurrentIndex((i) => Math.min(trackExercises.length - 1, i + 1));
  }, [trackExercises.length]);

  if (!currentExercise) {
    return (
      <div className="max-w-lg mx-auto px-4 py-8 text-center">
        <h1 className="text-2xl font-bold text-foreground mb-4">
          No exercises in this track
        </h1>
        <Link href="/" className="text-accent hover:underline">
          Browse practice tracks
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-6 pb-32">
      {/* Back link */}
      <Link
        href={`/exercises?track=${track.id}`}
        className="text-sm text-accent hover:text-accent-hover inline-block mb-4"
      >
        &larr; Back to {track.name}
      </Link>

      {/* Track title & description */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-foreground">{track.name}</h1>
        <p className="text-sm text-muted mt-1">{track.subtitle}</p>
        <p className="text-sm text-muted/70 mt-1">{track.description}</p>
      </div>

      {/* Exercise nav with arrows */}
      <div className="mb-6">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={goToPrev}
            disabled={currentIndex === 0}
            className={`flex-shrink-0 w-8 h-8 rounded-full border flex items-center justify-center transition-colors ${
              currentIndex === 0
                ? "border-border text-muted/30 cursor-not-allowed"
                : "border-accent/30 text-accent hover:bg-accent-light"
            }`}
            aria-label="Previous exercise"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
            </svg>
          </button>

          <div className="flex-1 bg-white border border-border rounded-xl px-4 py-2.5 min-w-0">
            <div className="flex items-center justify-between">
              <div className="min-w-0">
                <div className="text-xs text-muted">
                  Exercise {currentIndex + 1} of {trackExercises.length}
                </div>
                <div className="text-sm font-semibold text-foreground truncate">
                  {currentExercise.name}
                </div>
              </div>
              {/* Dot indicators */}
              <div className="flex gap-1 ml-3 flex-shrink-0">
                {trackExercises.map((_, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => setCurrentIndex(i)}
                    className={`w-2 h-2 rounded-full transition-colors ${
                      i === currentIndex
                        ? "bg-accent"
                        : i < currentIndex
                          ? "bg-accent/30"
                          : "bg-border"
                    }`}
                    aria-label={`Go to exercise ${i + 1}`}
                  />
                ))}
              </div>
            </div>
          </div>

          <button
            type="button"
            onClick={goToNext}
            disabled={currentIndex === trackExercises.length - 1}
            className={`flex-shrink-0 w-8 h-8 rounded-full border flex items-center justify-center transition-colors ${
              currentIndex === trackExercises.length - 1
                ? "border-border text-muted/30 cursor-not-allowed"
                : "border-accent/30 text-accent hover:bg-accent-light"
            }`}
            aria-label="Next exercise"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>
      </div>

      {/* Side-by-side layout: Info + Player */}
      <div key={currentExercise.id} className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left: Exercise info (how to do, technique tips, vocal tips) */}
        <div>
          {demoInfo ? (
            <ExerciseDemo exercise={currentExercise} demoInfo={demoInfo} />
          ) : (
            <div className="bg-white rounded-2xl border border-border p-5 shadow-sm">
              <h3 className="text-sm font-bold text-accent uppercase tracking-wide mb-3">
                Exercise Info
              </h3>
              <p className="text-sm text-muted">{currentExercise.description}</p>
              {currentExercise.goodFor && (
                <div className="bg-background rounded-lg p-3 mt-4 border border-border">
                  <div className="text-xs font-semibold text-accent uppercase tracking-wide mb-1">
                    What It&apos;s Good For
                  </div>
                  <p className="text-sm text-foreground/80">{currentExercise.goodFor}</p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Right: Exercise player */}
        <div>
          <ExercisePlayer
            key={currentExercise.id}
            exercise={currentExercise}
            startNote={startNote}
            endNote={endNote}
            onRangeChange={(low, high) => {
              setStartNote(low);
              setEndNote(high);
            }}
          />
        </div>
      </div>

      {/* Fixed bottom navigation */}
      <div className="fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-sm border-t border-border px-4 py-3 z-50">
        <div className="max-w-6xl mx-auto flex items-center justify-between gap-3">
          <button
            type="button"
            onClick={goToPrev}
            disabled={currentIndex === 0}
            className={`flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-sm font-medium transition-colors ${
              currentIndex === 0
                ? "text-muted/40 cursor-not-allowed"
                : "text-accent hover:bg-accent-light"
            }`}
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
            </svg>
            Prev
          </button>

          <div className="text-center flex-1 min-w-0">
            <div className="text-xs text-muted truncate">
              {currentIndex < trackExercises.length - 1
                ? `Next: ${trackExercises[currentIndex + 1].name}`
                : "Last exercise"}
            </div>
          </div>

          <button
            type="button"
            onClick={goToNext}
            disabled={currentIndex === trackExercises.length - 1}
            className={`flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-sm font-medium transition-colors ${
              currentIndex === trackExercises.length - 1
                ? "text-muted/40 cursor-not-allowed"
                : "bg-accent text-white hover:bg-accent-hover"
            }`}
          >
            Next
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}
