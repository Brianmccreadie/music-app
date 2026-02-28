export interface PlanExercise {
  exerciseId: string;
  tempoOverride?: number;
  notes?: string;
}

export interface Plan {
  id: string;
  name: string;
  description: string;
  category: string;
  difficulty: number;
  durationMinutes: number;
  exercises: PlanExercise[];
}

export const PLAN_CATEGORIES = [
  "Warm-Ups",
  "Technique",
  "Genre-Specific",
  "Progressive",
] as const;
