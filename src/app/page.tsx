import Link from "next/link";
import exercisesData from "@/data/exercises.json";
import type { Exercise } from "@/lib/exercises";
import { CATEGORIES } from "@/lib/exercises";
import ExerciseCard from "@/components/ExerciseCard";

const exercises = exercisesData as Exercise[];

export default function HomePage() {
  // Show a few featured exercises
  const featured = exercises.slice(0, 4);
  // Count by category
  const categoryCounts = CATEGORIES.map((cat) => ({
    name: cat,
    count: exercises.filter((ex) => ex.category === cat).length,
  })).filter((c) => c.count > 0);

  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      {/* Hero */}
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold text-gray-900 mb-3">
          Warm up. Build range. Sing better.
        </h1>
        <p className="text-lg text-gray-500 max-w-2xl mx-auto">
          A vocal exercise player with real piano sound. Pick an exercise, set
          your range, and the piano plays each pattern ascending through your
          range — just like practicing with a vocal coach.
        </p>
        <div className="flex gap-3 justify-center mt-6">
          <Link
            href="/exercises"
            className="px-6 py-3 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700 transition-colors"
          >
            Browse Exercises
          </Link>
          <Link
            href="/plans"
            className="px-6 py-3 border border-indigo-600 text-indigo-600 rounded-lg font-medium hover:bg-indigo-50 transition-colors"
          >
            Practice Plans
          </Link>
        </div>
      </div>

      {/* Categories */}
      <div className="mb-12">
        <h2 className="text-xl font-bold text-gray-900 mb-4">Categories</h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {categoryCounts.map((cat) => (
            <Link
              key={cat.name}
              href={`/exercises`}
              className="bg-white rounded-xl p-4 border border-gray-100 hover:border-indigo-200 hover:shadow-sm transition-all text-center"
            >
              <div className="font-semibold text-gray-900">{cat.name}</div>
              <div className="text-sm text-gray-400">
                {cat.count} exercise{cat.count !== 1 ? "s" : ""}
              </div>
            </Link>
          ))}
        </div>
      </div>

      {/* Featured */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-gray-900">
            Popular Exercises
          </h2>
          <Link
            href="/exercises"
            className="text-sm text-indigo-600 hover:text-indigo-700"
          >
            View all &rarr;
          </Link>
        </div>
        <div className="grid gap-3 sm:grid-cols-2">
          {featured.map((ex) => (
            <ExerciseCard key={ex.id} exercise={ex} />
          ))}
        </div>
      </div>
    </div>
  );
}
