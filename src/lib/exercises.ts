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
  "vibrato",
  "runs",
] as const;

// Goal tags map goals (user-facing) to exercise tags (data-facing)
export const GOAL_TAG_MAP: Record<string, string[]> = {
  "Expand range": ["range", "head voice", "chest voice", "mix voice"],
  "Improve agility": ["agility", "staccato", "runs"],
  "Warm-up routine": ["warm-up", "beginner"],
  "Audition prep": ["technique", "range", "agility", "runs"],
  "Breath control": ["breath", "legato"],
  "Tone quality": ["technique", "legato", "intonation"],
  "Pitch accuracy": ["intonation"],
  "Build confidence": ["beginner", "warm-up"],
  "Develop mix voice": ["mix voice", "technique", "range"],
  "Develop vibrato": ["vibrato", "breath", "technique"],
  "Develop head voice": ["head voice", "range"],
  "Master runs & riffs": ["runs", "agility"],
};
