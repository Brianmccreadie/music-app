import { describe, it, expect, vi } from "vitest";

vi.mock("@/lib/supabase", () => ({
  supabase: {
    auth: { getUser: vi.fn().mockResolvedValue({ data: { user: null } }) },
    from: vi.fn().mockReturnValue({
      insert: vi.fn().mockReturnValue({ select: vi.fn().mockReturnValue({ single: vi.fn() }) }),
      update: vi.fn().mockReturnValue({ eq: vi.fn().mockReturnValue({ eq: vi.fn() }) }),
      delete: vi.fn().mockReturnValue({ eq: vi.fn().mockReturnValue({ eq: vi.fn() }) }),
      select: vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({
          order: vi.fn().mockResolvedValue({ data: null }),
        }),
      }),
    }),
  },
}));

import {
  getRoutines,
  getRoutine,
  createRoutine,
  updateRoutine,
  deleteRoutine,
  addExerciseToRoutine,
  removeExerciseFromRoutine,
  reorderExercises,
} from "@/lib/routines";

const routineData = {
  name: "Morning Warm-Up",
  description: "Quick warm-up routine",
  exercises: [{ exerciseId: "five-note-scale" }],
  rangeLow: "C3",
  rangeHigh: "C5",
};

describe("createRoutine", () => {
  it("creates with ID and timestamps", () => {
    const routine = createRoutine(routineData);
    expect(routine.id).toMatch(/^routine-/);
    expect(routine.name).toBe("Morning Warm-Up");
    expect(routine.createdAt).toBeGreaterThan(0);
    expect(routine.updatedAt).toBeGreaterThan(0);
  });

  it("persists to localStorage", () => {
    createRoutine(routineData);
    expect(getRoutines().length).toBeGreaterThan(0);
  });
});

describe("getRoutine", () => {
  it("finds by ID", () => {
    const created = createRoutine(routineData);
    const found = getRoutine(created.id);
    expect(found).toBeDefined();
    expect(found!.name).toBe("Morning Warm-Up");
  });

  it("returns undefined for missing ID", () => {
    expect(getRoutine("nonexistent")).toBeUndefined();
  });
});

describe("updateRoutine", () => {
  it("updates fields and timestamp", () => {
    const created = createRoutine(routineData);
    const updated = updateRoutine(created.id, { name: "Evening Routine" });
    expect(updated).toBeDefined();
    expect(updated!.name).toBe("Evening Routine");
    expect(updated!.updatedAt).toBeGreaterThanOrEqual(created.updatedAt);
  });

  it("returns undefined for missing ID", () => {
    expect(updateRoutine("nonexistent", { name: "x" })).toBeUndefined();
  });
});

describe("deleteRoutine", () => {
  it("removes the routine", () => {
    const created = createRoutine(routineData);
    deleteRoutine(created.id);
    expect(getRoutine(created.id)).toBeUndefined();
  });
});

describe("exercise management", () => {
  it("addExerciseToRoutine appends exercise", () => {
    const routine = createRoutine(routineData);
    const updated = addExerciseToRoutine(routine.id, {
      exerciseId: "major-triad",
      tempoOverride: 90,
    });
    expect(updated!.exercises.length).toBe(2);
    expect(updated!.exercises[1].exerciseId).toBe("major-triad");
  });

  it("removeExerciseFromRoutine removes by index", () => {
    const routine = createRoutine({
      ...routineData,
      exercises: [
        { exerciseId: "a" },
        { exerciseId: "b" },
        { exerciseId: "c" },
      ],
    });
    const updated = removeExerciseFromRoutine(routine.id, 1);
    expect(updated!.exercises.map((e) => e.exerciseId)).toEqual(["a", "c"]);
  });

  it("reorderExercises replaces exercise list", () => {
    const routine = createRoutine(routineData);
    const newOrder = [
      { exerciseId: "z" },
      { exerciseId: "y" },
    ];
    const updated = reorderExercises(routine.id, newOrder);
    expect(updated!.exercises).toEqual(newOrder);
  });
});
