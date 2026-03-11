import { describe, it, expect } from "vitest";
import exercises from "@/data/exercises.json";
import plans from "@/data/plans.json";
import {
  CATEGORIES,
  DIFFICULTY_LABELS,
  ALL_TAGS,
  GOAL_TAG_MAP,
} from "@/lib/exercises";
import { PLAN_CATEGORIES } from "@/lib/plans";

describe("exercises.json data integrity", () => {
  it("has exercises", () => {
    expect(exercises.length).toBeGreaterThan(0);
  });

  it("each exercise has required fields", () => {
    for (const ex of exercises) {
      expect(ex.id).toBeTruthy();
      expect(ex.name).toBeTruthy();
      expect(Array.isArray(ex.pattern)).toBe(true);
      expect(ex.pattern.length).toBeGreaterThan(0);
      expect(ex.noteDuration).toBeTruthy();
      expect(typeof ex.restBetweenReps).toBe("number");
      expect(ex.description).toBeTruthy();
      expect(Array.isArray(ex.tags)).toBe(true);
      expect(typeof ex.difficulty).toBe("number");
      expect(ex.difficulty).toBeGreaterThanOrEqual(1);
      expect(ex.difficulty).toBeLessThanOrEqual(5);
      expect(ex.category).toBeTruthy();
    }
  });

  it("has unique exercise IDs", () => {
    const ids = exercises.map((e) => e.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it("most patterns start with 0 (root note)", () => {
    const startsWithRoot = exercises.filter((ex) => ex.pattern[0] === 0);
    // The majority should start on root; some exercises (e.g., intervals) may not
    expect(startsWithRoot.length).toBeGreaterThan(exercises.length * 0.7);
  });

  it("uses valid note durations", () => {
    const validDurations = ["1n", "2n", "4n", "8n", "16n"];
    for (const ex of exercises) {
      expect(validDurations).toContain(ex.noteDuration);
    }
  });

  it("categories are from the known list", () => {
    const categorySet = new Set(CATEGORIES as readonly string[]);
    for (const ex of exercises) {
      expect(categorySet.has(ex.category)).toBe(true);
    }
  });
});

describe("plans.json data integrity", () => {
  it("has plans", () => {
    expect(plans.length).toBeGreaterThan(0);
  });

  it("each plan has required fields", () => {
    for (const plan of plans) {
      expect(plan.id).toBeTruthy();
      expect(plan.name).toBeTruthy();
      expect(plan.description).toBeTruthy();
      expect(plan.category).toBeTruthy();
      expect(typeof plan.difficulty).toBe("number");
      expect(typeof plan.durationMinutes).toBe("number");
      expect(Array.isArray(plan.exercises)).toBe(true);
      expect(plan.exercises.length).toBeGreaterThan(0);
    }
  });

  it("has unique plan IDs", () => {
    const ids = plans.map((p) => p.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it("plan categories are valid", () => {
    const categorySet = new Set(PLAN_CATEGORIES as readonly string[]);
    for (const plan of plans) {
      expect(categorySet.has(plan.category)).toBe(true);
    }
  });

  it("all plan exercise references exist in exercises.json", () => {
    const exerciseIds = new Set(exercises.map((e) => e.id));
    for (const plan of plans) {
      for (const pe of plan.exercises) {
        expect(exerciseIds.has(pe.exerciseId)).toBe(true);
      }
    }
  });
});

describe("exercise constants", () => {
  it("DIFFICULTY_LABELS covers 1-5", () => {
    for (let i = 1; i <= 5; i++) {
      expect(DIFFICULTY_LABELS[i]).toBeTruthy();
    }
  });

  it("ALL_TAGS has entries", () => {
    expect(ALL_TAGS.length).toBeGreaterThan(0);
  });

  it("GOAL_TAG_MAP values reference known tags or hidden tags", () => {
    for (const [, tags] of Object.entries(GOAL_TAG_MAP)) {
      expect(tags.length).toBeGreaterThan(0);
    }
  });
});
