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
