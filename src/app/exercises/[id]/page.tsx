"use client";

import { use, useState, useEffect } from "react";
import Link from "next/link";
import exercisesData from "@/data/exercises.json";
import demoData from "@/data/exercise-demos.json";
import type { Exercise } from "@/lib/exercises";
import ExercisePlayer from "@/components/ExercisePlayer";
import ExerciseDemo from "@/components/ExerciseDemo";
import { getProfile } from "@/lib/user-profile";
import { isFavorite, toggleFavorite } from "@/lib/favorites";

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

export default function ExerciseDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const exercise = exercises.find((ex) => ex.id === id);

  const [startNote, setStartNote] = useState("C3");
  const [endNote, setEndNote] = useState("A4");
  const [favorited, setFavorited] = useState(false);

  useEffect(() => {
    const profile = getProfile();
    if (profile.onboardingComplete) {
      setStartNote(profile.rangeLow);
      setEndNote(profile.rangeHigh);
    }
    if (exercise) {
      setFavorited(isFavorite(exercise.id));
    }
  }, [exercise]);

  if (!exercise) {
    return (
      <div className="max-w-lg mx-auto px-4 py-8 text-center">
        <h1 className="text-2xl font-bold text-foreground mb-4">
          Exercise not found
        </h1>
        <Link href="/exercises" className="text-accent hover:underline">
          Back to library
        </Link>
      </div>
    );
  }

  const demoInfo = demos[exercise.id];

  const handleToggleFavorite = () => {
    const nowFavorited = toggleFavorite(exercise.id);
    setFavorited(nowFavorited);
  };

  return (
    <div className="max-w-lg mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-6">
        <Link
          href="/exercises"
          className="text-sm text-accent hover:text-accent-hover"
        >
          &larr; Back to Library
        </Link>
        <button
          type="button"
          onClick={handleToggleFavorite}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-border hover:bg-accent-light transition-colors"
          title={favorited ? "Remove from favorites" : "Add to favorites"}
        >
          <svg
            className={`w-5 h-5 transition-colors ${
              favorited ? "text-red-500 fill-red-500" : "text-muted"
            }`}
            fill={favorited ? "currentColor" : "none"}
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
            />
          </svg>
          <span className="text-sm text-muted">
            {favorited ? "Saved" : "Save"}
          </span>
        </button>
      </div>

      {demoInfo && (
        <div className="mb-6">
          <ExerciseDemo exercise={exercise} demoInfo={demoInfo} />
        </div>
      )}

      <ExercisePlayer
        exercise={exercise}
        startNote={startNote}
        endNote={endNote}
        onRangeChange={(low, high) => {
          setStartNote(low);
          setEndNote(high);
        }}
      />
    </div>
  );
}
