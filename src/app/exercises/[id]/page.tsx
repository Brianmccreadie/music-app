"use client";

import { use, useState, useEffect } from "react";
import Link from "next/link";
import exercisesData from "@/data/exercises.json";
import type { Exercise } from "@/lib/exercises";
import ExercisePlayer from "@/components/ExercisePlayer";
import { PIANO_NOTES } from "@/lib/music-utils";
import { getProfile } from "@/lib/user-profile";

const exercises = exercisesData as Exercise[];

const LOW_NOTES = PIANO_NOTES.filter((n) => {
  const octave = parseInt(n.slice(-1));
  return octave >= 2 && octave <= 4;
});
const HIGH_NOTES = PIANO_NOTES.filter((n) => {
  const octave = parseInt(n.slice(-1));
  return octave >= 3 && octave <= 6;
});

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

  return (
    <div className="max-w-lg mx-auto px-4 py-8">
      <Link
        href="/exercises"
        className="text-sm text-indigo-600 hover:text-indigo-700 mb-6 inline-block"
      >
        &larr; Back to Library
      </Link>

      {/* Range selector */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 mb-6">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-medium text-gray-700">
            Your Vocal Range
          </h3>
          <Link
            href="/settings"
            className="text-xs text-indigo-600 hover:text-indigo-700"
          >
            Edit in Settings
          </Link>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="text-xs text-gray-500 mb-1 block">
              Lowest Note
            </label>
            <select
              value={startNote}
              onChange={(e) => setStartNote(e.target.value)}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              {LOW_NOTES.map((note) => (
                <option key={note} value={note}>
                  {note}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="text-xs text-gray-500 mb-1 block">
              Highest Note
            </label>
            <select
              value={endNote}
              onChange={(e) => setEndNote(e.target.value)}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              {HIGH_NOTES.map((note) => (
                <option key={note} value={note}>
                  {note}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Player */}
      <ExercisePlayer
        exercise={exercise}
        startNote={startNote}
        endNote={endNote}
      />
    </div>
  );
}
