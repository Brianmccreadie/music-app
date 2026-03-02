"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import plansData from "@/data/plans.json";
import type { Plan } from "@/lib/plans";
import { PLAN_CATEGORIES } from "@/lib/plans";
import { DIFFICULTY_LABELS } from "@/lib/exercises";
import PlanCard from "@/components/PlanCard";

const plans = plansData as Plan[];

export default function PlansPage() {
  const [selectedCategory, setSelectedCategory] = useState<string>("All");
  const [selectedDifficulty, setSelectedDifficulty] = useState<number>(0);

  const filtered = useMemo(() => {
    return plans.filter((plan) => {
      if (selectedCategory !== "All" && plan.category !== selectedCategory)
        return false;
      if (selectedDifficulty > 0 && plan.difficulty !== selectedDifficulty)
        return false;
      return true;
    });
  }, [selectedCategory, selectedDifficulty]);

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="mb-8">
        <Link
          href="/"
          className="text-sm text-accent hover:text-accent-hover mb-2 inline-block"
        >
          &larr; Home
        </Link>
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">
              Practice Plans
            </h1>
            <p className="text-muted mt-1">
              Curated exercise sequences for focused practice sessions.
            </p>
          </div>
          <Link
            href="/generate"
            className="px-4 py-2 bg-accent text-white rounded-full text-sm font-semibold hover:bg-accent-hover transition-colors"
          >
            Build Plan
          </Link>
        </div>
      </div>

      {/* Filters */}
      <div className="mb-6 space-y-3">
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
          {PLAN_CATEGORIES.map((cat) => (
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
      </div>

      {filtered.length === 0 ? (
        <div className="text-center py-12 text-muted">
          No plans match your filters.
        </div>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2">
          {filtered.map((plan) => (
            <PlanCard key={plan.id} plan={plan} />
          ))}
        </div>
      )}
    </div>
  );
}
