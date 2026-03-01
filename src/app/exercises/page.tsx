"use client";

import { useState, useMemo, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import exercisesData from "@/data/exercises.json";
import type { Exercise } from "@/lib/exercises";
import { CATEGORIES, DIFFICULTY_LABELS } from "@/lib/exercises";
import { TRACKS } from "@/lib/tracks";
import ExerciseCard from "@/components/ExerciseCard";

const exercises = exercisesData as Exercise[];

export default function ExercisesPage() {
  return (
    <Suspense>
      <ExercisesContent />
    </Suspense>
  );
}

function ExercisesContent() {
  const searchParams = useSearchParams();
  const trackId = searchParams.get("track");
  const activeTrack = trackId ? TRACKS.find((t) => t.id === trackId) : null;

  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("All");
  const [selectedDifficulty, setSelectedDifficulty] = useState<number>(0);
  const [sortBy, setSortBy] = useState<"default" | "difficulty" | "name">(
    "default"
  );

  const filtered = useMemo(() => {
    let list = activeTrack
      ? activeTrack.exerciseIds
          .map((id) => exercises.find((ex) => ex.id === id))
          .filter(Boolean) as Exercise[]
      : exercises;

    list = list.filter((ex) => {
      if (selectedCategory !== "All" && ex.category !== selectedCategory)
        return false;
      if (selectedDifficulty > 0 && ex.difficulty !== selectedDifficulty)
        return false;
      if (search) {
        const q = search.toLowerCase();
        return (
          ex.name.toLowerCase().includes(q) ||
          ex.description.toLowerCase().includes(q) ||
          ex.tags.some((t) => t.includes(q))
        );
      }
      return true;
    });

    if (sortBy === "difficulty") {
      list = [...list].sort((a, b) => a.difficulty - b.difficulty);
    } else if (sortBy === "name") {
      list = [...list].sort((a, b) => a.name.localeCompare(b.name));
    }

    return list;
  }, [search, selectedCategory, selectedDifficulty, sortBy, activeTrack]);

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <div className="mb-8">
        <Link
          href="/"
          className="text-sm text-accent hover:text-accent-hover mb-2 inline-block"
        >
          &larr; Home
        </Link>

        {activeTrack ? (
          <div className="mb-4">
            <div className="flex items-center gap-3 mb-2">
              <h1 className="text-3xl font-bold text-foreground">
                {activeTrack.name}
              </h1>
              <Link
                href="/exercises"
                className="text-xs text-muted hover:text-accent px-2 py-1 rounded border border-border"
              >
                Clear track
              </Link>
            </div>
            <p className="text-muted">{activeTrack.description}</p>
          </div>
        ) : (
          <>
            <h1 className="text-3xl font-bold text-foreground">
              Exercise Library
            </h1>
            <p className="text-muted mt-1">
              Browse {exercises.length} vocal exercises. Tap any exercise to
              start practicing.
            </p>
          </>
        )}
      </div>

      {/* Filters */}
      <div className="mb-6 space-y-3">
        <div className="flex gap-3">
          <input
            type="text"
            placeholder="Search exercises..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="flex-1 px-4 py-2 bg-card border border-border rounded-lg text-foreground placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent"
          />
          <select
            value={selectedDifficulty}
            onChange={(e) => setSelectedDifficulty(Number(e.target.value))}
            className="px-3 py-2 bg-card border border-border rounded-lg text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-accent"
          >
            <option value={0}>Any Difficulty</option>
            {[1, 2, 3, 4].map((d) => (
              <option key={d} value={d}>
                {DIFFICULTY_LABELS[d]}
              </option>
            ))}
          </select>
          <select
            value={sortBy}
            onChange={(e) =>
              setSortBy(e.target.value as "default" | "difficulty" | "name")
            }
            className="px-3 py-2 bg-card border border-border rounded-lg text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-accent"
          >
            <option value="default">Default order</option>
            <option value="difficulty">By difficulty</option>
            <option value="name">By name</option>
          </select>
        </div>

        {/* Category filters */}
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setSelectedCategory("All")}
            className={`px-3 py-1 rounded-full text-sm transition-colors ${
              selectedCategory === "All"
                ? "bg-accent text-background"
                : "bg-card border border-border text-muted hover:text-foreground"
            }`}
          >
            All
          </button>
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1 rounded-full text-sm transition-colors ${
                selectedCategory === cat
                  ? "bg-accent text-background"
                  : "bg-card border border-border text-muted hover:text-foreground"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Results */}
      {filtered.length === 0 ? (
        <div className="text-center py-16 text-muted">
          No exercises match your filters. Try broadening your search.
        </div>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((ex) => (
            <ExerciseCard key={ex.id} exercise={ex} />
          ))}
        </div>
      )}
    </div>
  );
}
