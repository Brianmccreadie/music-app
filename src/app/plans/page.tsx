"use client";

import Link from "next/link";
import plansData from "@/data/plans.json";
import type { Plan } from "@/lib/plans";
import { PLAN_CATEGORIES } from "@/lib/plans";
import { DIFFICULTY_LABELS } from "@/lib/exercises";

const plans = plansData as Plan[];

const CATEGORY_INFO: Record<
  string,
  { label: string; title: string; subtitle: string }
> = {
  "Warm-Ups": {
    label: "Warm-Ups",
    title: "Start every session right",
    subtitle:
      "Essential warm-up routines to prepare your voice safely before any practice or performance.",
  },
  Technique: {
    label: "Technique",
    title: "Build your vocal technique",
    subtitle:
      "Targeted sequences for range, agility, breath control, and power.",
  },
  "Genre-Specific": {
    label: "Genre-Specific",
    title: "Train for your style",
    subtitle:
      "Tailored warm-ups and exercises for pop, classical, musical theater, and R&B.",
  },
  Progressive: {
    label: "Progressive",
    title: "Structured learning paths",
    subtitle:
      "Step-by-step programs designed to build your skills over time.",
  },
};

const PLAN_GRADIENTS: Record<string, string> = {
  "quick-warmup": "from-amber-500 to-orange-600",
  "full-warmup": "from-sky-500 to-blue-600",
  "performance-day": "from-rose-500 to-pink-600",
  "range-high": "from-purple-600 to-indigo-700",
  "range-low": "from-emerald-600 to-teal-700",
  "agility-runs": "from-fuchsia-500 to-purple-600",
  "breath-control": "from-cyan-500 to-blue-600",
  "belt-training": "from-red-600 to-orange-700",
  "pop-contemporary": "from-pink-500 to-rose-600",
  "classical-mt": "from-violet-600 to-purple-700",
  "rnb-riffs": "from-orange-500 to-red-600",
  "beginners-first-week": "from-emerald-500 to-green-600",
};

const PLAN_SUBTITLES: Record<string, string> = {
  "quick-warmup": "Ready in 5 minutes",
  "full-warmup": "The complete warm-up",
  "performance-day": "Gentle & voice-preserving",
  "range-high": "Push your upper limits",
  "range-low": "Develop chest resonance",
  "agility-runs": "Speed & precision",
  "breath-control": "Master your airflow",
  "belt-training": "Power without strain",
  "pop-contemporary": "Modern vocal style",
  "classical-mt": "Legato & technique",
  "rnb-riffs": "Riffs, runs & soul",
  "beginners-first-week": "Your first steps",
};

export default function PlansPage() {
  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <div className="mb-12">
        <Link
          href="/"
          className="text-sm text-accent hover:text-accent-hover mb-2 inline-block"
        >
          &larr; Home
        </Link>
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">
              Core Training
            </h1>
            <p className="text-muted mt-1">
              Curated exercise sequences with coaching notes for focused
              practice sessions.
            </p>
          </div>
          <Link
            href="/generate"
            className="hidden sm:inline-flex px-5 py-2.5 bg-accent text-white rounded-full text-sm font-semibold hover:bg-accent-hover transition-colors"
          >
            + Create Custom Routine
          </Link>
        </div>
        {/* Mobile CTA */}
        <Link
          href="/generate"
          className="sm:hidden mt-4 inline-flex px-5 py-2.5 bg-accent text-white rounded-full text-sm font-semibold hover:bg-accent-hover transition-colors"
        >
          + Create Custom Routine
        </Link>
      </div>

      {PLAN_CATEGORIES.map((category) => {
        const categoryPlans = plans.filter((p) => p.category === category);
        if (categoryPlans.length === 0) return null;
        const info = CATEGORY_INFO[category];

        return (
          <div key={category} className="mb-16">
            {/* Section header */}
            <div className="mb-8">
              <p className="text-accent font-semibold text-sm uppercase tracking-widest mb-2">
                {info?.label ?? category}
              </p>
              <h2 className="text-2xl lg:text-3xl font-bold text-foreground">
                {info?.title ?? category}
              </h2>
              <p className="text-muted mt-2">{info?.subtitle}</p>
            </div>

            {/* Cards grid */}
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {categoryPlans.map((plan) => {
                const gradient =
                  PLAN_GRADIENTS[plan.id] || "from-gray-500 to-gray-700";
                const subtitle = PLAN_SUBTITLES[plan.id] || "";

                return (
                  <Link
                    key={plan.id}
                    href={`/plans/${plan.id}`}
                    className="group block bg-white rounded-2xl overflow-hidden border border-border hover:shadow-lg hover:border-accent/30 transition-all"
                  >
                    {/* Colored header */}
                    <div className={`bg-gradient-to-br ${gradient} p-6 pb-4`}>
                      <h3 className="text-lg font-bold text-white mb-1">
                        {plan.name}
                      </h3>
                      {subtitle && (
                        <p className="text-sm text-white/70">{subtitle}</p>
                      )}
                    </div>

                    {/* Body */}
                    <div className="p-5">
                      <p className="text-sm text-muted line-clamp-2 mb-4">
                        {plan.description}
                      </p>

                      {/* Meta row */}
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-3">
                          <span className="text-sm text-accent font-semibold">
                            {plan.exercises.length} exercises
                          </span>
                          <span className="text-xs text-muted flex items-center gap-1">
                            <svg
                              className="w-3.5 h-3.5"
                              fill="none"
                              viewBox="0 0 24 24"
                              stroke="currentColor"
                              strokeWidth={2}
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                              />
                            </svg>
                            ~{plan.durationMinutes} min
                          </span>
                        </div>
                        <span
                          className={`text-xs px-2 py-0.5 rounded-full ${
                            DIFFICULTY_COLORS[plan.difficulty] ||
                            DIFFICULTY_COLORS[1]
                          }`}
                        >
                          {DIFFICULTY_LABELS[plan.difficulty]}
                        </span>
                      </div>

                      {/* Footer link */}
                      <div className="flex items-center justify-end">
                        <span className="text-sm text-muted group-hover:text-accent transition-colors font-medium">
                          View program &rarr;
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
    </div>
  );
}

const DIFFICULTY_COLORS: Record<number, string> = {
  1: "bg-emerald-100 text-emerald-700",
  2: "bg-blue-100 text-blue-700",
  3: "bg-yellow-100 text-yellow-700",
  4: "bg-orange-100 text-orange-700",
  5: "bg-red-100 text-red-700",
};
