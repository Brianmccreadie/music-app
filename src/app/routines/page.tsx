"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { getRoutines, deleteRoutine } from "@/lib/routines";
import type { Routine } from "@/lib/routines";
import { isRoutineFavorite, toggleRoutineFavorite } from "@/lib/favorites";

export default function RoutinesPage() {
  const [routines, setRoutines] = useState<Routine[]>([]);
  const [loaded, setLoaded] = useState(false);
  const [, setFavTick] = useState(0);

  useEffect(() => {
    setRoutines(getRoutines());
    setLoaded(true);
  }, []);

  const handleDelete = (id: string) => {
    deleteRoutine(id);
    setRoutines(getRoutines());
  };

  const handleToggleFavorite = (id: string) => {
    toggleRoutineFavorite(id);
    setFavTick((t) => t + 1);
  };

  if (!loaded) return null;

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Custom Routines</h1>
          <p className="text-muted mt-1">
            Build personalized practice routines and train consistently.
          </p>
        </div>
        <Link
          href="/routines/new"
          className="px-5 py-2.5 bg-accent text-white rounded-full font-semibold hover:bg-accent-hover transition-colors text-sm"
        >
          + New Routine
        </Link>
      </div>

      {routines.length === 0 ? (
        <div className="text-center py-20">
          <div className="text-5xl mb-4 text-muted">~</div>
          <h2 className="text-xl font-bold text-foreground mb-2">
            No routines yet
          </h2>
          <p className="text-muted mb-6 max-w-md mx-auto">
            Create your first routine. Answer a few questions for a personalized
            recommendation, or build one manually from the exercise library.
          </p>
          <Link
            href="/routines/new"
            className="inline-block px-6 py-3 bg-accent text-white rounded-full font-semibold hover:bg-accent-hover transition-colors"
          >
            Create Your First Routine
          </Link>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          {routines.map((routine) => (
            <div
              key={routine.id}
              className="bg-white rounded-2xl border border-border p-5 hover:shadow-md hover:border-accent/30 transition-all"
            >
              <div className="flex items-start justify-between mb-2">
                <Link
                  href={`/routines/detail?id=${routine.id}`}
                  className="font-bold text-foreground text-lg hover:text-accent transition-colors"
                >
                  {routine.name}
                </Link>
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => handleToggleFavorite(routine.id)}
                    className="p-1 transition-colors"
                    title={isRoutineFavorite(routine.id) ? "Remove from favorites" : "Add to favorites"}
                  >
                    <svg
                      className={`w-4 h-4 ${isRoutineFavorite(routine.id) ? "text-red-500 fill-red-500" : "text-muted hover:text-red-400"}`}
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth={2}
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                    </svg>
                  </button>
                  <button
                    onClick={() => handleDelete(routine.id)}
                    className="text-muted hover:text-red-500 text-xs p-1 transition-colors"
                    title="Delete routine"
                  >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </div>
              </div>
              {routine.description && (
                <p className="text-sm text-muted line-clamp-2 mb-3">
                  {routine.description}
                </p>
              )}
              <div className="flex items-center justify-between text-xs text-muted">
                <span>{routine.exercises.length} exercises</span>
                <span>
                  Range: {routine.rangeLow} — {routine.rangeHigh}
                </span>
              </div>
              <Link
                href={`/routines/detail?id=${routine.id}`}
                className="mt-3 block w-full text-center py-2 rounded-full bg-accent-light text-accent text-sm font-medium hover:bg-accent/20 transition-colors"
              >
                Practice
              </Link>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
