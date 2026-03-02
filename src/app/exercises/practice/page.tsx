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

  useEffect(() => {
    const profile = getProfile();
    if (profile.onboardingComplete) {
      setStartNote(profile.rangeLow);
      setEndNote(profile.rangeHigh);
    }
  }, []);

  // Reset to first exercise when track changes
  useEffect(() => {
    setCurrentIndex(0);
  }, [trackId]);

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

  const trackExercises = track.exerciseIds
    .map((id) => exercises.find((ex) => ex.id === id))
    .filter(Boolean) as Exercise[];

  const currentExercise = trackExercises[currentIndex];
  const demoInfo = currentExercise ? demos[currentExercise.id] : null;

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
    <div className="max-w-lg mx-auto px-4 py-6 pb-32">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <Link
          href={`/exercises?track=${track.id}`}
          className="text-sm text-accent hover:text-accent-hover"
        >
          &larr; {track.name}
        </Link>
        <span className="text-xs text-muted">
          {currentIndex + 1} of {trackExercises.length}
        </span>
      </div>

      {/* Exercise nav strip */}
      <div className="mb-6 -mx-4 px-4">
        <div className="flex gap-1.5 overflow-x-auto pb-2 scrollbar-hide">
          {trackExercises.map((ex, i) => (
            <button
              key={ex.id}
              type="button"
              onClick={() => setCurrentIndex(i)}
              className={`flex-shrink-0 px-3 py-1.5 rounded-full text-xs font-medium transition-colors whitespace-nowrap ${
                i === currentIndex
                  ? "bg-accent text-white"
                  : i < currentIndex
                    ? "bg-accent/10 text-accent border border-accent/20"
                    : "bg-white border border-border text-muted hover:text-foreground"
              }`}
            >
              {i + 1}. {ex.name.length > 20 ? ex.name.slice(0, 20) + "…" : ex.name}
            </button>
          ))}
        </div>
      </div>

      {/* Current exercise content */}
      <div key={currentExercise.id}>
        {demoInfo && (
          <div className="mb-6">
            <ExerciseDemo exercise={currentExercise} demoInfo={demoInfo} />
          </div>
        )}

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

      {/* Fixed bottom navigation */}
      <div className="fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-sm border-t border-border px-4 py-3 z-50">
        <div className="max-w-lg mx-auto flex items-center justify-between gap-3">
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
