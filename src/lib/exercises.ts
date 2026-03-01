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
  "Cool-Down",
] as const;

export type Category = (typeof CATEGORIES)[number];

export const DIFFICULTY_LABELS: Record<number, string> = {
  1: "Beginner",
  2: "Easy",
  3: "Intermediate",
  4: "Advanced",
};

// Goal tags map goals (user-facing) to exercise tags (data-facing)
// Uses both displayed tags and hidden tags on exercises for matching
export const GOAL_TAG_MAP: Record<string, string[]> = {
  "Expand range": ["head voice", "chest voice", "mix voice", "range"],
  "Improve agility": ["staccato", "runs", "agility"],
  "Warm-up routine": ["sovt", "warm-up"],
  "Audition prep": ["runs", "onset", "phrasing", "range"],
  "Breath control": ["legato", "sovt", "breath"],
  "Tone quality": ["legato", "intonation", "phrasing", "sovt"],
  "Pitch accuracy": ["intonation"],
  "Build confidence": ["sovt", "onset", "warm-up"],
  "Develop mix voice": ["mix voice"],
  "Develop vibrato": ["vibrato"],
  "Develop head voice": ["head voice"],
  "Master runs & riffs": ["runs"],
};
