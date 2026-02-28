"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import exercisesData from "@/data/exercises.json";
import type { Exercise } from "@/lib/exercises";
import { CATEGORIES, DIFFICULTY_LABELS } from "@/lib/exercises";
import ExerciseCard from "@/components/ExerciseCard";

const exercises = exercisesData as Exercise[];

export default function ExercisesPage() {
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("All");
  const [selectedDifficulty, setSelectedDifficulty] = useState<number>(0);

  const filtered = useMemo(() => {
    return exercises.filter((ex) => {
      if (
        selectedCategory !== "All" &&
        ex.category !== selectedCategory
      )
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
  }, [search, selectedCategory, selectedDifficulty]);

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="mb-8">
        <Link
          href="/"
          className="text-sm text-indigo-600 hover:text-indigo-700 mb-2 inline-block"
        >
          &larr; Back to Home
        </Link>
        <h1 className="text-3xl font-bold text-gray-900">Exercise Library</h1>
        <p className="text-gray-500 mt-1">
          Browse {exercises.length} vocal exercises. Tap any exercise to start
          practicing.
        </p>
      </div>

      {/* Filters */}
      <div className="mb-6 space-y-3">
        <input
          type="text"
          placeholder="Search exercises..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
        />
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setSelectedCategory("All")}
            className={`px-3 py-1 rounded-full text-sm transition-colors ${
              selectedCategory === "All"
                ? "bg-indigo-600 text-white"
                : "bg-gray-100 text-gray-600 hover:bg-gray-200"
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
                  ? "bg-indigo-600 text-white"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setSelectedDifficulty(0)}
            className={`px-3 py-1 rounded-full text-sm transition-colors ${
              selectedDifficulty === 0
                ? "bg-indigo-600 text-white"
                : "bg-gray-100 text-gray-600 hover:bg-gray-200"
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
                  ? "bg-indigo-600 text-white"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}
            >
              {DIFFICULTY_LABELS[d]}
            </button>
          ))}
        </div>
      </div>

      {/* Results */}
      {filtered.length === 0 ? (
        <div className="text-center py-12 text-gray-400">
          No exercises match your filters. Try broadening your search.
        </div>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2">
          {filtered.map((ex) => (
            <ExerciseCard key={ex.id} exercise={ex} />
          ))}
        </div>
      )}
    </div>
  );
}
