"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import exercisesData from "@/data/exercises.json";
import type { Exercise } from "@/lib/exercises";
import { TRACKS, TRACK_CATEGORIES } from "@/lib/tracks";
import { getFavorites, getRoutineFavorites } from "@/lib/favorites";
import { getRoutines } from "@/lib/routines";
import type { Routine } from "@/lib/routines";
import ExerciseCard from "@/components/ExerciseCard";

const exercises = exercisesData as Exercise[];

function getExercisesByIds(ids: string[]) {
  return ids
    .map((id) => exercises.find((ex) => ex.id === id))
    .filter(Boolean) as Exercise[];
}

export default function HomePage() {
  const [favoriteIds, setFavoriteIds] = useState<string[]>([]);
  const [favoriteRoutines, setFavoriteRoutines] = useState<Routine[]>([]);

  useEffect(() => {
    setFavoriteIds(getFavorites());
    const routineFavIds = getRoutineFavorites();
    const allRoutines = getRoutines();
    setFavoriteRoutines(
      routineFavIds
        .map((id) => allRoutines.find((r) => r.id === id))
        .filter(Boolean) as Routine[]
    );
  }, []);

  const favoriteExercises = getExercisesByIds(favoriteIds);
  const hasFavorites = favoriteExercises.length > 0 || favoriteRoutines.length > 0;

  return (
    <div className="min-h-screen">
      {/* Hero */}
      <div className="bg-hero-bg text-hero-fg">
        <div className="max-w-6xl mx-auto px-4 py-20 lg:py-28">
          <div className="max-w-3xl">
            <p className="text-accent font-semibold text-sm uppercase tracking-widest mb-4">
              Vocal Training Studio
            </p>
            <h1 className="text-5xl lg:text-6xl font-bold tracking-tight mb-6 leading-[1.1]">
              Train your voice.
              <br />
              One rep at a time.
            </h1>
            <p className="text-lg text-white/60 max-w-xl mb-10 leading-relaxed">
              Professional vocal exercises with real piano accompaniment, personalized
              routines, and custom practice plans. Built for singers who take
              their craft seriously.
            </p>
            <div className="flex flex-wrap gap-4">
              <Link
                href="/routines/new"
                className="px-8 py-3.5 bg-accent text-white rounded-full font-semibold hover:bg-accent-hover transition-colors text-base"
              >
                Start Training
              </Link>
              <Link
                href="/exercises"
                className="px-8 py-3.5 border border-white/20 text-white rounded-full font-medium hover:bg-white/10 transition-colors text-base"
              >
                Browse Exercises
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Stats bar */}
      <div className="bg-white border-b border-border">
        <div className="max-w-6xl mx-auto px-4 py-8">
          <div className="grid grid-cols-3 gap-8">
            <div className="text-center">
              <div className="text-3xl font-bold text-accent">
                {exercises.length}+
              </div>
              <div className="text-sm text-muted mt-1">Vocal Exercises</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-accent">
                {TRACKS.length}
              </div>
              <div className="text-sm text-muted mt-1">Training Tracks</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-accent">Custom</div>
              <div className="text-sm text-muted mt-1">Built Plans</div>
            </div>
          </div>
        </div>
      </div>

      {/* How it works */}
      <div className="max-w-6xl mx-auto px-4 py-16">
        <div className="text-center mb-12">
          <p className="text-accent font-semibold text-sm uppercase tracking-widest mb-2">How it works</p>
          <h2 className="text-3xl lg:text-4xl font-bold text-foreground">
            Your complete vocal training system
          </h2>
        </div>
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          <div className="bg-white rounded-2xl border border-border p-8 hover:shadow-lg transition-shadow">
            <div className="w-12 h-12 bg-accent-light rounded-xl flex items-center justify-center mb-5">
              <svg className="w-6 h-6 text-accent" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            </div>
            <h3 className="text-lg font-bold text-foreground mb-2">Set Your Profile</h3>
            <p className="text-muted text-sm leading-relaxed">
              Tell us your voice type, range, and goals. We&apos;ll customize everything to match your unique voice.
            </p>
          </div>
          <div className="bg-white rounded-2xl border border-border p-8 hover:shadow-lg transition-shadow">
            <div className="w-12 h-12 bg-accent-light rounded-xl flex items-center justify-center mb-5">
              <svg className="w-6 h-6 text-accent" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3" />
              </svg>
            </div>
            <h3 className="text-lg font-bold text-foreground mb-2">Pick Your Exercises</h3>
            <p className="text-muted text-sm leading-relaxed">
              Browse {exercises.length}+ exercises across {TRACKS.length} training tracks, or let us build a custom plan for you.
            </p>
          </div>
          <div className="bg-white rounded-2xl border border-border p-8 hover:shadow-lg transition-shadow">
            <div className="w-12 h-12 bg-accent-light rounded-xl flex items-center justify-center mb-5">
              <svg className="w-6 h-6 text-accent" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h3 className="text-lg font-bold text-foreground mb-2">Train &amp; Improve</h3>
            <p className="text-muted text-sm leading-relaxed">
              Practice with real piano accompaniment. Track your progress, adjust tempo, and build consistent habits.
            </p>
          </div>
        </div>
      </div>

      {/* Favorites section */}
      {hasFavorites && (
        <div className="max-w-6xl mx-auto px-4 pb-12">
          <div className="bg-white rounded-2xl border border-border p-8">
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
                  Your Favorites
                </h2>
              </div>
              <Link
                href="/exercises"
                className="text-sm text-accent hover:text-accent-hover font-semibold"
              >
                Browse all &rarr;
              </Link>
            </div>

            {/* Favorite routines */}
            {favoriteRoutines.length > 0 && (
              <div className={favoriteExercises.length > 0 ? "mb-6" : ""}>
                <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                  {favoriteRoutines.map((routine) => (
                    <Link
                      key={routine.id}
                      href={`/routines/${routine.id}`}
                      className="group block bg-gradient-to-br from-accent/5 to-accent/10 rounded-xl border border-accent/20 p-4 hover:shadow-md hover:border-accent/40 transition-all"
                    >
                      <div className="flex items-center gap-2 mb-1.5">
                        <span className="text-xs font-semibold text-accent uppercase tracking-wide">
                          Routine
                        </span>
                      </div>
                      <h3 className="font-bold text-foreground text-sm group-hover:text-accent transition-colors truncate">
                        {routine.name}
                      </h3>
                      <p className="text-xs text-muted mt-1">
                        {routine.exercises.length} exercises
                      </p>
                    </Link>
                  ))}
                </div>
              </div>
            )}

            {/* Favorite exercises */}
            {favoriteExercises.length > 0 && (
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                {favoriteExercises.map((ex) => (
                  <ExerciseCard key={ex.id} exercise={ex} />
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Training Tracks by Category */}
      {TRACK_CATEGORIES.map((category) => {
        const categoryTracks = TRACKS.filter((t) => t.category === category);
        return (
          <div key={category} className="max-w-6xl mx-auto px-4 pb-16">
            <div className="mb-8">
              <p className="text-accent font-semibold text-sm uppercase tracking-widest mb-2">{category}</p>
              <h2 className="text-3xl font-bold text-foreground">
                {category === "Foundations"
                  ? "Essential skills every singer needs"
                  : "Focused technique development"}
              </h2>
              <p className="text-muted mt-2">
                {category === "Foundations"
                  ? "Build your vocal foundation with these core training tracks."
                  : "Isolate and develop specific vocal techniques and skills."}
              </p>
            </div>

            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {categoryTracks.map((track) => {
                const trackExercises = getExercisesByIds(track.exerciseIds);
                return (
                  <Link
                    key={track.id}
                    href={`/exercises?track=${track.id}`}
                    className="group block bg-white rounded-2xl overflow-hidden border border-border hover:shadow-lg hover:border-accent/30 transition-all"
                  >
                    <div
                      className={`bg-gradient-to-br ${track.gradient} p-6 pb-4`}
                    >
                      <h3 className="text-lg font-bold text-white mb-1">
                        {track.name}
                      </h3>
                      <p className="text-sm text-white/70">{track.subtitle}</p>
                    </div>
                    <div className="p-5">
                      <p className="text-sm text-muted line-clamp-2 mb-4">
                        {track.description}
                      </p>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-accent font-semibold">
                          {trackExercises.length} exercises
                        </span>
                        <span className="text-sm text-muted group-hover:text-accent transition-colors font-medium">
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

      {/* CTA Section */}
      <div className="bg-hero-bg text-white">
        <div className="max-w-6xl mx-auto px-4 py-16 text-center">
          <h2 className="text-3xl lg:text-4xl font-bold mb-4">
            Ready to start training?
          </h2>
          <p className="text-white/60 max-w-lg mx-auto mb-8 text-lg">
            Set up your profile and get a personalized practice plan in minutes.
          </p>
          <div className="flex justify-center gap-4">
            <Link
              href="/onboarding"
              className="px-8 py-3.5 bg-accent text-white rounded-full font-semibold hover:bg-accent-hover transition-colors"
            >
              Set Up Profile
            </Link>
            <Link
              href="/generate"
              className="px-8 py-3.5 border border-white/20 text-white rounded-full font-medium hover:bg-white/10 transition-colors"
            >
              Build a Plan
            </Link>
          </div>
        </div>
      </div>

      {/* Popular Exercises */}
      <div className="max-w-6xl mx-auto px-4 py-16">
        <div className="flex items-center justify-between mb-8">
          <div>
            <p className="text-accent font-semibold text-sm uppercase tracking-widest mb-2">Get Started</p>
            <h2 className="text-3xl font-bold text-foreground">
              Popular Exercises
            </h2>
          </div>
          <Link
            href="/exercises"
            className="text-sm text-accent hover:text-accent-hover font-semibold"
          >
            View all &rarr;
          </Link>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {exercises.slice(0, 6).map((ex) => (
            <ExerciseCard key={ex.id} exercise={ex} />
          ))}
        </div>
      </div>
    </div>
  );
}
