"use client";

import { useState, useMemo, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import exercisesData from "@/data/exercises.json";
import type { Exercise } from "@/lib/exercises";
import { CATEGORIES, DIFFICULTY_LABELS, ALL_TAGS } from "@/lib/exercises";
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
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [sortBy, setSortBy] = useState<"default" | "difficulty" | "name">(
    "default"
  );

  const toggleTag = (tag: string) => {
    setSelectedTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    );
  };

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
      if (
        selectedTags.length > 0 &&
        !selectedTags.some((tag) => ex.tags.includes(tag))
      )
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
  }, [search, selectedCategory, selectedDifficulty, selectedTags, sortBy, activeTrack]);

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
            className="flex-1 px-4 py-2.5 bg-white border border-border rounded-full text-foreground placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent"
          />
          <select
            value={sortBy}
            onChange={(e) =>
              setSortBy(e.target.value as "default" | "difficulty" | "name")
            }
            className="px-3 py-2.5 bg-white border border-border rounded-full text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-accent"
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
                ? "bg-accent text-white"
                : "bg-white border border-border text-muted hover:text-foreground"
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
                  ? "bg-accent text-white"
                  : "bg-white border border-border text-muted hover:text-foreground"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Difficulty filters */}
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setSelectedDifficulty(0)}
            className={`px-3 py-1 rounded-full text-sm transition-colors ${
              selectedDifficulty === 0
                ? "bg-accent text-white"
                : "bg-white border border-border text-muted hover:text-foreground"
            }`}
          >
            Any Difficulty
          </button>
          {[1, 2, 3, 4, 5].map((d) => (
            <button
              key={d}
              onClick={() => setSelectedDifficulty(d)}
              className={`px-3 py-1 rounded-full text-sm transition-colors ${
                selectedDifficulty === d
                  ? "bg-accent text-white"
                  : "bg-white border border-border text-muted hover:text-foreground"
              }`}
            >
              {DIFFICULTY_LABELS[d]}
            </button>
          ))}
        </div>

        {/* Tag filters */}
        <div className="flex flex-wrap gap-2">
          {ALL_TAGS.filter((tag) => !["beginner", "intermediate", "advanced"].includes(tag)).map((tag) => (
            <button
              key={tag}
              onClick={() => toggleTag(tag)}
              className={`px-2.5 py-1 rounded-full text-xs transition-colors ${
                selectedTags.includes(tag)
                  ? "bg-accent-light text-accent border border-accent/30"
                  : "bg-white border border-border text-muted hover:text-foreground"
              }`}
            >
              {tag}
            </button>
          ))}
          {selectedTags.length > 0 && (
            <button
              onClick={() => setSelectedTags([])}
              className="px-2.5 py-1 rounded-full text-xs text-red-500 hover:text-red-600"
            >
              Clear tags
            </button>
          )}
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
