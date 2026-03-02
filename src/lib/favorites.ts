const EXERCISE_KEY = "vocal-app-favorites";
const ROUTINE_KEY = "vocal-app-routine-favorites";

// ── Exercise favorites ──

export function getFavorites(): string[] {
  if (typeof window === "undefined") return [];
  try {
    const stored = localStorage.getItem(EXERCISE_KEY);
    if (stored) return JSON.parse(stored);
  } catch {
    // ignore parse errors
  }
  return [];
}

export function isFavorite(exerciseId: string): boolean {
  return getFavorites().includes(exerciseId);
}

export function toggleFavorite(exerciseId: string): boolean {
  const favorites = getFavorites();
  const index = favorites.indexOf(exerciseId);
  if (index >= 0) {
    favorites.splice(index, 1);
  } else {
    favorites.push(exerciseId);
  }
  localStorage.setItem(EXERCISE_KEY, JSON.stringify(favorites));
  return index < 0;
}

// ── Routine favorites ──

export function getRoutineFavorites(): string[] {
  if (typeof window === "undefined") return [];
  try {
    const stored = localStorage.getItem(ROUTINE_KEY);
    if (stored) return JSON.parse(stored);
  } catch {
    // ignore parse errors
  }
  return [];
}

export function isRoutineFavorite(routineId: string): boolean {
  return getRoutineFavorites().includes(routineId);
}

export function toggleRoutineFavorite(routineId: string): boolean {
  const favorites = getRoutineFavorites();
  const index = favorites.indexOf(routineId);
  if (index >= 0) {
    favorites.splice(index, 1);
  } else {
    favorites.push(routineId);
  }
  localStorage.setItem(ROUTINE_KEY, JSON.stringify(favorites));
  return index < 0;
}
