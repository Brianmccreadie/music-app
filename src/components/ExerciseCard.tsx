import Link from "next/link";
import type { Exercise } from "@/lib/exercises";
import { DIFFICULTY_LABELS } from "@/lib/exercises";

interface ExerciseCardProps {
  exercise: Exercise;
}

const DIFFICULTY_COLORS: Record<number, string> = {
  1: "bg-green-100 text-green-700",
  2: "bg-blue-100 text-blue-700",
  3: "bg-yellow-100 text-yellow-800",
  4: "bg-orange-100 text-orange-700",
  5: "bg-red-100 text-red-700",
};

export default function ExerciseCard({ exercise }: ExerciseCardProps) {
  return (
    <Link
      href={`/exercises/${exercise.id}`}
      className="block bg-white rounded-xl shadow-sm border border-gray-100 hover:shadow-md hover:border-indigo-200 transition-all p-4"
    >
      <div className="flex items-start justify-between mb-2">
        <h3 className="font-semibold text-gray-900 leading-tight">
          {exercise.name}
        </h3>
        <span
          className={`text-xs px-2 py-0.5 rounded-full whitespace-nowrap ml-2 ${
            DIFFICULTY_COLORS[exercise.difficulty] || DIFFICULTY_COLORS[1]
          }`}
        >
          {DIFFICULTY_LABELS[exercise.difficulty]}
        </span>
      </div>
      <p className="text-sm text-gray-500 line-clamp-2 mb-3">
        {exercise.description}
      </p>
      <div className="flex items-center justify-between">
        <span className="text-xs text-gray-400">{exercise.category}</span>
        <div className="flex gap-1">
          {exercise.pattern.slice(0, 7).map((interval, i) => (
            <span
              key={i}
              className="w-5 h-5 bg-gray-100 rounded text-[10px] flex items-center justify-center font-mono text-gray-500"
            >
              {interval}
            </span>
          ))}
          {exercise.pattern.length > 7 && (
            <span className="text-[10px] text-gray-400 flex items-center">
              +{exercise.pattern.length - 7}
            </span>
          )}
        </div>
      </div>
    </Link>
  );
}
