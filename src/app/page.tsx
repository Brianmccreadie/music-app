"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import exercisesData from "@/data/exercises.json";
import type { Exercise } from "@/lib/exercises";
import { TRACKS, TRACK_CATEGORIES } from "@/lib/tracks";
import { getFavorites } from "@/lib/favorites";
import ExerciseCard from "@/components/ExerciseCard";

const exercises = exercisesData as Exercise[];

function getExercisesByIds(ids: string[]) {
  return ids
    .map((id) => exercises.find((ex) => ex.id === id))
    .filter(Boolean) as Exercise[];
}

export default function HomePage() {
  const [favoriteIds, setFavoriteIds] = useState<string[]>([]);

  useEffect(() => {
    setFavoriteIds(getFavorites());
  }, []);

  const favoriteExercises = getExercisesByIds(favoriteIds);

  return (
    <div className="min-h-screen">
      {/* Hero */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-accent/5 via-transparent to-transparent" />
        <div className="max-w-6xl mx-auto px-4 py-16 relative">
          <div className="max-w-2xl">
            <h1 className="text-5xl font-bold text-foreground mb-4 tracking-tight">
              Train your voice.
              <br />
              <span className="text-accent">Like a pro.</span>
            </h1>
            <p className="text-lg text-muted max-w-xl mb-8">
              Professional vocal training with personalized routines, goal-based
              tracks, and real piano accompaniment. Pick a track, build a routine,
              and start singing.
            </p>
            <div className="flex gap-3">
              <Link
                href="/routines"
                className="px-6 py-3 bg-accent text-background rounded-lg font-semibold hover:bg-accent-hover transition-colors"
              >
                My Routines
              </Link>
              <Link
                href="/exercises"
                className="px-6 py-3 border border-border text-foreground rounded-lg font-medium hover:bg-card-hover transition-colors"
              >
                Browse Library
              </Link>
            </div>
          </div>

          {/* Quick stats */}
          <div className="flex gap-8 mt-12">
            <div>
              <div className="text-3xl font-bold text-accent">
                {exercises.length}
              </div>
              <div className="text-sm text-muted">Exercises</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-accent">
                {TRACKS.length}
              </div>
              <div className="text-sm text-muted">Training Tracks</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-accent">5</div>
              <div className="text-sm text-muted">Difficulty Levels</div>
            </div>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="max-w-6xl mx-auto px-4 pb-16">
        {/* Favorites section */}
        {favoriteExercises.length > 0 && (
          <div className="mb-12">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-2xl font-bold text-foreground flex items-center gap-2">
                  <svg
                    className="w-6 h-6 text-red-500 fill-red-500"
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
                  My Favorites
                </h2>
                <p className="text-sm text-muted mt-1">
                  Your saved exercises — quick access to what you love
                </p>
              </div>
              <Link
                href="/exercises"
                className="text-sm text-accent hover:text-accent-hover font-medium"
              >
                Browse all &rarr;
              </Link>
            </div>
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              {favoriteExercises.map((ex) => (
                <ExerciseCard key={ex.id} exercise={ex} />
              ))}
            </div>
          </div>
        )}

        {/* Training Tracks by Category */}
        {TRACK_CATEGORIES.map((category) => {
          const categoryTracks = TRACKS.filter((t) => t.category === category);
          return (
            <div key={category} className="mb-12">
              <div className="mb-6">
                <h2 className="text-2xl font-bold text-foreground">
                  {category}
                </h2>
                <p className="text-sm text-muted mt-1">
                  {category === "Foundations"
                    ? "Essential skills every singer needs — start here"
                    : "Isolate and develop specific vocal techniques"}
                </p>
              </div>

              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {categoryTracks.map((track) => {
                  const trackExercises = getExercisesByIds(track.exerciseIds);
                  return (
                    <Link
                      key={track.id}
                      href={`/exercises?track=${track.id}`}
                      className="group block rounded-2xl overflow-hidden border border-border hover:border-accent/30 transition-all"
                    >
                      <div
                        className={`bg-gradient-to-br ${track.gradient} p-6 pb-4`}
                      >
                        <h3 className="text-lg font-bold text-white mb-1">
                          {track.name}
                        </h3>
                        <p className="text-sm text-white/70">{track.subtitle}</p>
                      </div>
                      <div className="bg-card p-4">
                        <p className="text-xs text-muted line-clamp-2 mb-3">
                          {track.description}
                        </p>
                        <div className="flex items-center justify-between">
                          <span className="text-xs text-accent font-medium">
                            {trackExercises.length} exercises
                          </span>
                          <span className="text-xs text-muted group-hover:text-accent transition-colors">
                            View track &rarr;
                          </span>
                        </div>
                      </div>
                    </Link>
                  );
                })}
              </div>
            </div>
          );
        })}

        {/* Popular Exercises */}
        <div className="mt-4">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-2xl font-bold text-foreground">
                Popular Exercises
              </h2>
              <p className="text-sm text-muted mt-1">
                Jump right in with these essentials
              </p>
            </div>
            <Link
              href="/exercises"
              className="text-sm text-accent hover:text-accent-hover font-medium"
            >
              View all &rarr;
            </Link>
          </div>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {exercises.slice(0, 8).map((ex) => (
              <ExerciseCard key={ex.id} exercise={ex} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
