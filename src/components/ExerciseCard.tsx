import Link from "next/link";
import type { Exercise } from "@/lib/exercises";
import { DIFFICULTY_LABELS } from "@/lib/exercises";
import ExercisePreviewButton from "./ExercisePreviewButton";

interface ExerciseCardProps {
  exercise: Exercise;
  href?: string;
  onClick?: () => void;
  selected?: boolean;
}

const DIFFICULTY_COLORS: Record<number, string> = {
  1: "bg-emerald-900/50 text-emerald-400",
  2: "bg-blue-900/50 text-blue-400",
  3: "bg-yellow-900/50 text-yellow-400",
  4: "bg-orange-900/50 text-orange-400",
  5: "bg-red-900/50 text-red-400",
};

export default function ExerciseCard({
  exercise,
  href,
  onClick,
  selected,
}: ExerciseCardProps) {
  const inner = (
    <>
      <div className="flex items-start justify-between mb-2">
        <h3 className="font-semibold text-foreground leading-tight text-sm">
          {exercise.name}
        </h3>
        <div className="flex items-center gap-1.5 ml-2 flex-shrink-0">
          <ExercisePreviewButton exercise={exercise} />
          <span
            className={`text-[10px] px-2 py-0.5 rounded-full whitespace-nowrap font-medium ${
              DIFFICULTY_COLORS[exercise.difficulty] || DIFFICULTY_COLORS[1]
            }`}
          >
            {DIFFICULTY_LABELS[exercise.difficulty]}
          </span>
        </div>
      </div>
      <p className="text-xs text-muted line-clamp-2 mb-3">
        {exercise.description}
      </p>
      <div className="flex items-center justify-between">
        <span className="text-[10px] text-muted">{exercise.category}</span>
        <div className="flex gap-1">
          {exercise.tags.slice(0, 3).map((tag) => (
            <span
              key={tag}
              className="text-[10px] px-1.5 py-0.5 rounded bg-accent/10 text-accent"
            >
              {tag}
            </span>
          ))}
        </div>
      </div>
    </>
  );

  if (onClick) {
    return (
      <button
        type="button"
        onClick={onClick}
        className={`block w-full text-left rounded-xl border transition-all p-4 ${
          selected
            ? "bg-accent/10 border-accent"
            : "bg-card border-border hover:bg-card-hover hover:border-accent/30"
        }`}
      >
        {inner}
      </button>
    );
  }

  return (
    <Link
      href={href || `/exercises/${exercise.id}`}
      className="block bg-card rounded-xl border border-border hover:bg-card-hover hover:border-accent/30 transition-all p-4"
    >
      {inner}
    </Link>
  );
}
