"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import type { Exercise } from "@/lib/exercises";
import { getFavorites } from "@/lib/favorites";

interface FavoritesTrackProps {
  exercises: Exercise[];
}

export default function FavoritesTrack({ exercises }: FavoritesTrackProps) {
  const [favoriteIds, setFavoriteIds] = useState<string[]>([]);

  useEffect(() => {
    setFavoriteIds(getFavorites());

    // Listen for storage changes (e.g., if user favorites from another tab)
    const handleStorage = (e: StorageEvent) => {
      if (e.key === "vocal-app-favorites") {
        setFavoriteIds(getFavorites());
      }
    };
    window.addEventListener("storage", handleStorage);
    return () => window.removeEventListener("storage", handleStorage);
  }, []);

  const favoriteExercises = favoriteIds
    .map((id) => exercises.find((ex) => ex.id === id))
    .filter(Boolean) as Exercise[];

  if (favoriteExercises.length === 0) return null;

  return (
    <div className="mb-12">
      <div className="mb-6">
        <div className="flex items-center gap-2">
          <svg
            className="w-5 h-5 text-red-400"
            fill="currentColor"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={1}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
            />
          </svg>
          <h2 className="text-2xl font-bold text-foreground">Your Favorites</h2>
        </div>
        <p className="text-sm text-muted mt-1">
          Your personally curated exercises — quick access to what works for you
        </p>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {favoriteExercises.map((ex) => (
          <Link
            key={ex.id}
            href={`/exercises/${ex.id}`}
            className="bg-white rounded-2xl border border-red-200 hover:shadow-md hover:border-red-300 transition-all p-4"
          >
            <div className="flex items-start justify-between mb-1">
              <h3 className="font-semibold text-foreground text-sm leading-tight">
                {ex.name}
              </h3>
              <svg
                className="w-3.5 h-3.5 text-red-400 flex-shrink-0 ml-2 mt-0.5"
                fill="currentColor"
                viewBox="0 0 24 24"
              >
                <path d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
              </svg>
            </div>
            <p className="text-xs text-muted line-clamp-2 mb-2">
              {ex.description}
            </p>
            <span className="text-[10px] text-accent">{ex.category}</span>
          </Link>
        ))}
      </div>
    </div>
  );
}
