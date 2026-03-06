import { supabase } from "@/lib/supabase";

export interface RoutineExercise {
  exerciseId: string;
  tempoOverride?: number;
  notes?: string;
}

export interface Routine {
  id: string;
  name: string;
  description: string;
  exercises: RoutineExercise[];
  rangeLow: string;
  rangeHigh: string;
  createdAt: number;
  updatedAt: number;
}

const STORAGE_KEY = "vocal-app-routines";

function generateId(): string {
  return `routine-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

// ── localStorage (synchronous) ──

export function getRoutines(): Routine[] {
  if (typeof window === "undefined") return [];
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) return JSON.parse(stored);
  } catch {
    // ignore
  }
  return [];
}

function saveRoutines(routines: Routine[]): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(routines));
}

export function getRoutine(id: string): Routine | undefined {
  return getRoutines().find((r) => r.id === id);
}

export function createRoutine(
  data: Omit<Routine, "id" | "createdAt" | "updatedAt">
): Routine {
  const routine: Routine = {
    ...data,
    id: generateId(),
    createdAt: Date.now(),
    updatedAt: Date.now(),
  };
  const routines = getRoutines();
  routines.push(routine);
  saveRoutines(routines);
  return routine;
}

export function updateRoutine(
  id: string,
  data: Partial<Omit<Routine, "id" | "createdAt">>
): Routine | undefined {
  const routines = getRoutines();
  const index = routines.findIndex((r) => r.id === id);
  if (index === -1) return undefined;
  routines[index] = { ...routines[index], ...data, updatedAt: Date.now() };
  saveRoutines(routines);
  return routines[index];
}

export function deleteRoutine(id: string): void {
  const routines = getRoutines().filter((r) => r.id !== id);
  saveRoutines(routines);
}

export function reorderExercises(
  routineId: string,
  exercises: RoutineExercise[]
): Routine | undefined {
  return updateRoutine(routineId, { exercises });
}

export function addExerciseToRoutine(
  routineId: string,
  exercise: RoutineExercise
): Routine | undefined {
  const routine = getRoutine(routineId);
  if (!routine) return undefined;
  return updateRoutine(routineId, {
    exercises: [...routine.exercises, exercise],
  });
}

export function removeExerciseFromRoutine(
  routineId: string,
  exerciseIndex: number
): Routine | undefined {
  const routine = getRoutine(routineId);
  if (!routine) return undefined;
  const exercises = routine.exercises.filter((_, i) => i !== exerciseIndex);
  return updateRoutine(routineId, { exercises });
}

// ── Supabase sync ──

export async function fetchRoutinesFromDB(): Promise<Routine[]> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return getRoutines();

  const { data } = await supabase
    .from("routines")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  if (!data) return getRoutines();

  const routines: Routine[] = data.map((r) => ({
    id: r.id,
    name: r.name,
    description: r.description ?? "",
    exercises: r.exercises ?? [],
    rangeLow: r.range_low ?? "C3",
    rangeHigh: r.range_high ?? "A4",
    createdAt: new Date(r.created_at).getTime(),
    updatedAt: new Date(r.updated_at).getTime(),
  }));

  saveRoutines(routines);
  return routines;
}

export async function createRoutineDB(
  data: Omit<Routine, "id" | "createdAt" | "updatedAt">
): Promise<Routine> {
  // Save locally first
  const routine = createRoutine(data);

  const { data: { user } } = await supabase.auth.getUser();
  if (user) {
    const { data: inserted } = await supabase
      .from("routines")
      .insert({
        user_id: user.id,
        name: routine.name,
        description: routine.description || null,
        exercises: routine.exercises,
        range_low: routine.rangeLow,
        range_high: routine.rangeHigh,
      })
      .select()
      .single();

    if (inserted) {
      // Update local ID to match the DB UUID
      const routines = getRoutines();
      const idx = routines.findIndex((r) => r.id === routine.id);
      if (idx !== -1) {
        routines[idx].id = inserted.id;
        saveRoutines(routines);
        routine.id = inserted.id;
      }
    }
  }

  return routine;
}

export async function updateRoutineDB(
  id: string,
  data: Partial<Omit<Routine, "id" | "createdAt">>
): Promise<Routine | undefined> {
  const updated = updateRoutine(id, data);

  const { data: { user } } = await supabase.auth.getUser();
  if (user && updated) {
    await supabase
      .from("routines")
      .update({
        name: updated.name,
        description: updated.description || null,
        exercises: updated.exercises,
        range_low: updated.rangeLow,
        range_high: updated.rangeHigh,
        updated_at: new Date().toISOString(),
      })
      .eq("id", id)
      .eq("user_id", user.id);
  }

  return updated;
}

export async function deleteRoutineDB(id: string): Promise<void> {
  deleteRoutine(id);

  const { data: { user } } = await supabase.auth.getUser();
  if (user) {
    await supabase.from("routines").delete().eq("id", id).eq("user_id", user.id);
  }
}

export async function addExerciseToRoutineDB(
  routineId: string,
  exercise: RoutineExercise
): Promise<Routine | undefined> {
  const updated = addExerciseToRoutine(routineId, exercise);
  if (updated) {
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      await supabase
        .from("routines")
        .update({ exercises: updated.exercises, updated_at: new Date().toISOString() })
        .eq("id", routineId)
        .eq("user_id", user.id);
    }
  }
  return updated;
}

export async function removeExerciseFromRoutineDB(
  routineId: string,
  exerciseIndex: number
): Promise<Routine | undefined> {
  const updated = removeExerciseFromRoutine(routineId, exerciseIndex);
  if (updated) {
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      await supabase
        .from("routines")
        .update({ exercises: updated.exercises, updated_at: new Date().toISOString() })
        .eq("id", routineId)
        .eq("user_id", user.id);
    }
  }
  return updated;
}
