import Link from "next/link";
import exercisesData from "@/data/exercises.json";
import type { Exercise } from "@/lib/exercises";
import { TRACKS } from "@/lib/tracks";

const exercises = exercisesData as Exercise[];

function getExercisesByIds(ids: string[]) {
  return ids
    .map((id) => exercises.find((ex) => ex.id === id))
    .filter(Boolean) as Exercise[];
}

export default function HomePage() {
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

      {/* Training Tracks */}
      <div className="max-w-6xl mx-auto px-4 pb-16">
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-foreground">
            Training Tracks
          </h2>
          <p className="text-sm text-muted mt-1">
            Goal-focused collections to guide your practice
          </p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {TRACKS.map((track) => {
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

        {/* Popular Exercises */}
        <div className="mt-16">
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
              <Link
                key={ex.id}
                href={`/exercises/${ex.id}`}
                className="bg-card rounded-xl border border-border hover:bg-card-hover hover:border-accent/30 transition-all p-4"
              >
                <h3 className="font-semibold text-foreground text-sm mb-1 leading-tight">
                  {ex.name}
                </h3>
                <p className="text-xs text-muted line-clamp-2 mb-2">
                  {ex.description}
                </p>
                <span className="text-[10px] text-accent">{ex.category}</span>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
