import Link from "next/link";
import type { Plan } from "@/lib/plans";
import { DIFFICULTY_LABELS } from "@/lib/exercises";
import exercisesData from "@/data/exercises.json";
import type { Exercise } from "@/lib/exercises";

const exercises = exercisesData as Exercise[];

function getExerciseName(id: string): string {
  const ex = exercises.find((e) => e.id === id);
  return ex ? ex.name : id;
}

interface PlanCardProps {
  plan: Plan;
}

const DIFFICULTY_COLORS: Record<number, string> = {
  1: "bg-emerald-100 text-emerald-700",
  2: "bg-blue-100 text-blue-700",
  3: "bg-yellow-100 text-yellow-700",
  4: "bg-orange-100 text-orange-700",
  5: "bg-red-100 text-red-700",
};

const STEP_DOT_COLORS: Record<number, string> = {
  1: "bg-emerald-400",
  2: "bg-blue-400",
  3: "bg-yellow-400",
  4: "bg-orange-400",
  5: "bg-red-400",
};

export default function PlanCard({ plan }: PlanCardProps) {
  const maxVisible = 4;
  const visibleExercises = plan.exercises.slice(0, maxVisible);
  const remaining = plan.exercises.length - maxVisible;
  const dotColor = STEP_DOT_COLORS[plan.difficulty] || STEP_DOT_COLORS[1];

  return (
    <Link
      href={`/plans/${plan.id}`}
      className="block bg-white rounded-2xl border border-border hover:shadow-md hover:border-accent/30 transition-all p-5 group"
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-1">
        <h3 className="font-semibold text-foreground leading-tight">
          {plan.name}
        </h3>
        <span
          className={`text-xs px-2 py-0.5 rounded-full whitespace-nowrap ml-2 ${
            DIFFICULTY_COLORS[plan.difficulty] || DIFFICULTY_COLORS[1]
          }`}
        >
          {DIFFICULTY_LABELS[plan.difficulty]}
        </span>
      </div>
      <p className="text-sm text-muted line-clamp-2 mb-3">
        {plan.description}
      </p>

      {/* Exercise sequence preview */}
      <div className="bg-background rounded-xl px-3 py-2.5 mb-3">
        <div className="relative">
          {visibleExercises.map((pe, i) => (
            <div key={i} className="flex items-center gap-2.5 relative">
              {/* Connector line */}
              {i < visibleExercises.length - 1 && (
                <div
                  className="absolute left-[7px] top-[18px] w-[2px] h-[calc(100%)] bg-border"
                  aria-hidden="true"
                />
              )}
              {/* Step dot */}
              <div
                className={`relative z-10 w-[16px] h-[16px] rounded-full flex items-center justify-center flex-shrink-0 ${dotColor}`}
              >
                <span className="text-[9px] font-bold text-white leading-none">
                  {i + 1}
                </span>
              </div>
              {/* Exercise name */}
              <span className="text-xs text-foreground/80 truncate py-1.5">
                {getExerciseName(pe.exerciseId)}
              </span>
            </div>
          ))}
          {remaining > 0 && (
            <div className="flex items-center gap-2.5">
              <div className="w-[16px] flex justify-center flex-shrink-0">
                <span className="text-[10px] text-muted font-medium">...</span>
              </div>
              <span className="text-[11px] text-muted py-1">
                +{remaining} more
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between text-xs text-muted">
        <span>{plan.category}</span>
        <span className="flex items-center gap-1.5">
          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          ~{plan.durationMinutes} min
        </span>
      </div>
    </Link>
  );
}
