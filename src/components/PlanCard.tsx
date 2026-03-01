import Link from "next/link";
import type { Plan } from "@/lib/plans";
import { DIFFICULTY_LABELS } from "@/lib/exercises";

interface PlanCardProps {
  plan: Plan;
}

const DIFFICULTY_COLORS: Record<number, string> = {
  1: "bg-emerald-900/50 text-emerald-400",
  2: "bg-blue-900/50 text-blue-400",
  3: "bg-yellow-900/50 text-yellow-400",
  4: "bg-orange-900/50 text-orange-400",
  5: "bg-red-900/50 text-red-400",
};

export default function PlanCard({ plan }: PlanCardProps) {
  return (
    <Link
      href={`/plans/${plan.id}`}
      className="block bg-card rounded-xl border border-border hover:bg-card-hover hover:border-accent/30 transition-all p-4"
    >
      <div className="flex items-start justify-between mb-2">
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
      <div className="flex items-center justify-between text-xs text-muted">
        <span>{plan.category}</span>
        <span>
          {plan.exercises.length} exercises &middot; ~{plan.durationMinutes} min
        </span>
      </div>
    </Link>
  );
}
