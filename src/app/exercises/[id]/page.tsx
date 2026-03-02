"use client";

import { use, useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import exercisesData from "@/data/exercises.json";
import demoData from "@/data/exercise-demos.json";
import type { Exercise } from "@/lib/exercises";
import { TRACKS } from "@/lib/tracks";
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
  return (
    <Suspense>
      <ExerciseDetailContent id={id} />
    </Suspense>
  );
}

function ExerciseDetailContent({ id }: { id: string }) {
  const searchParams = useSearchParams();
  const trackId = searchParams.get("track");
  const track = trackId ? TRACKS.find((t) => t.id === trackId) : null;

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

  // Track-aware navigation
  let prevExercise: Exercise | null = null;
  let nextExercise: Exercise | null = null;
  if (track) {
    const trackExercises = track.exerciseIds
      .map((eid) => exercises.find((ex) => ex.id === eid))
      .filter(Boolean) as Exercise[];
    const idx = trackExercises.findIndex((ex) => ex.id === id);
    if (idx > 0) prevExercise = trackExercises[idx - 1];
    if (idx < trackExercises.length - 1) nextExercise = trackExercises[idx + 1];
  }

  const demoInfo = demos[exercise.id];

  const handleToggleFavorite = () => {
    const nowFavorited = toggleFavorite(exercise.id);
    setFavorited(nowFavorited);
  };

  const backHref = track ? `/exercises?track=${track.id}` : "/exercises";
  const backLabel = track ? `${track.name}` : "Library";

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-6">
        <Link
          href={backHref}
          className="text-sm text-accent hover:text-accent-hover"
        >
          &larr; {backLabel}
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

      {/* Track prev/next navigation */}
      {track && (
        <div className="flex items-center justify-between mb-6 gap-2">
          {prevExercise ? (
            <Link
              href={`/exercises/${prevExercise.id}?track=${track.id}`}
              className="flex items-center gap-1 text-sm text-accent hover:text-accent-hover min-w-0"
            >
              <svg className="w-4 h-4 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
              </svg>
              <span className="truncate">{prevExercise.name}</span>
            </Link>
          ) : (
            <div />
          )}
          {nextExercise ? (
            <Link
              href={`/exercises/${nextExercise.id}?track=${track.id}`}
              className="flex items-center gap-1 text-sm text-accent hover:text-accent-hover min-w-0 text-right"
            >
              <span className="truncate">{nextExercise.name}</span>
              <svg className="w-4 h-4 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
              </svg>
            </Link>
          ) : (
            <div />
          )}
        </div>
      )}

      {/* Side-by-side layout: Info + Player */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left: Exercise info (how to do, technique tips, vocal tips) */}
        <div>
          {demoInfo ? (
            <ExerciseDemo exercise={exercise} demoInfo={demoInfo} />
          ) : (
            <div className="bg-white rounded-2xl border border-border p-5 shadow-sm">
              <h3 className="text-sm font-bold text-accent uppercase tracking-wide mb-3">
                Exercise Info
              </h3>
              <p className="text-sm text-muted">{exercise.description}</p>
              {exercise.goodFor && (
                <div className="bg-background rounded-lg p-3 mt-4 border border-border">
                  <div className="text-xs font-semibold text-accent uppercase tracking-wide mb-1">
                    What It&apos;s Good For
                  </div>
                  <p className="text-sm text-foreground/80">{exercise.goodFor}</p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Right: Exercise player */}
        <div>
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
      </div>

      {/* Found in practice tracks */}
      {(() => {
        const containingTracks = TRACKS.filter((t) =>
          t.exerciseIds.includes(exercise.id)
        );
        if (containingTracks.length === 0) return null;
        return (
          <div className="mt-6 bg-white rounded-2xl border border-border p-5 shadow-sm">
            <h3 className="text-sm font-bold text-accent uppercase tracking-wide mb-3">
              Found in Practice Tracks
            </h3>
            <div className="flex flex-wrap gap-2">
              {containingTracks.map((t) => (
                <Link
                  key={t.id}
                  href={`/exercises?track=${t.id}`}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm bg-background border border-border hover:border-accent/30 hover:bg-accent-light transition-colors text-foreground"
                >
                  <span
                    className={`w-2 h-2 rounded-full bg-gradient-to-r ${t.gradient}`}
                  />
                  {t.name}
                </Link>
              ))}
            </div>
          </div>
        );
      })()}
    </div>
  );
}
