export interface Exercise {
  id: string;
  name: string;
  pattern: number[];
  noteDuration: string;
  restBetweenReps: number;
  description: string;
  tags: string[];
  difficulty: number;
  category: string;
}

export const CATEGORIES = [
  "Warm-Ups",
  "Scales",
  "Arpeggios",
  "Intervals",
  "Agility",
  "Range Extension",
  "Breath Control",
  "Technique",
] as const;

export type Category = (typeof CATEGORIES)[number];

export const DIFFICULTY_LABELS: Record<number, string> = {
  1: "Beginner",
  2: "Easy",
  3: "Intermediate",
  4: "Advanced",
  5: "Expert",
};

export const ALL_TAGS = [
  "warm-up",
  "intonation",
  "beginner",
  "intermediate",
  "advanced",
  "agility",
  "breath",
  "range",
  "technique",
  "staccato",
  "legato",
  "chest voice",
  "head voice",
  "mix voice",
] as const;
