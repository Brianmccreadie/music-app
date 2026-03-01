"use client";

import { use, useState, useEffect } from "react";
import Link from "next/link";
import exercisesData from "@/data/exercises.json";
import demoData from "@/data/exercise-demos.json";
import type { Exercise } from "@/lib/exercises";
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

  // Load saved range from profile
  useEffect(() => {
    const profile = getProfile();
    if (profile.onboardingComplete) {
      setStartNote(profile.rangeLow);
      setEndNote(profile.rangeHigh);
    }
  }, []);

  if (!exercise) {
    return (
      <div className="max-w-lg mx-auto px-4 py-8 text-center">
        <h1 className="text-2xl font-bold text-gray-900 mb-4">
          Exercise not found
        </h1>
        <Link href="/exercises" className="text-indigo-600 hover:underline">
          Back to library
        </Link>
      </div>
    );
  }

  const demoInfo = demos[exercise.id];

  return (
    <div className="max-w-lg mx-auto px-4 py-8">
      <Link
        href="/exercises"
        className="text-sm text-indigo-600 hover:text-indigo-700 mb-6 inline-block"
      >
        &larr; Back to Library
      </Link>

      {/* Exercise demo — separate from the player */}
      {demoInfo && (
        <div className="mb-6">
          <ExerciseDemo exercise={exercise} demoInfo={demoInfo} />
        </div>
      )}

      {/* Player with built-in range adjustment */}
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
