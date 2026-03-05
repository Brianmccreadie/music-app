import { supabase } from "@/lib/supabase";

const EXERCISE_KEY = "vocal-app-favorites";
const ROUTINE_KEY = "vocal-app-routine-favorites";

// ── Exercise favorites (localStorage) ──

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

// ── Routine favorites (localStorage) ──

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

// ── Supabase sync ──

export async function fetchFavoritesFromDB(): Promise<string[]> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return getFavorites();

  const { data } = await supabase
    .from("favorites")
    .select("exercise_id")
    .eq("user_id", user.id);

  const ids = (data ?? []).map((r) => r.exercise_id);
  localStorage.setItem(EXERCISE_KEY, JSON.stringify(ids));
  return ids;
}

export async function toggleFavoriteDB(exerciseId: string): Promise<boolean> {
  // Update localStorage immediately
  const isNowFavorite = toggleFavorite(exerciseId);

  const { data: { user } } = await supabase.auth.getUser();
  if (user) {
    if (isNowFavorite) {
      await supabase.from("favorites").insert({ user_id: user.id, exercise_id: exerciseId });
    } else {
      await supabase.from("favorites").delete().eq("user_id", user.id).eq("exercise_id", exerciseId);
    }
  }

  return isNowFavorite;
}

export async function fetchRoutineFavoritesFromDB(): Promise<string[]> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return getRoutineFavorites();

  const { data } = await supabase
    .from("routine_favorites")
    .select("routine_id")
    .eq("user_id", user.id);

  const ids = (data ?? []).map((r) => r.routine_id);
  localStorage.setItem(ROUTINE_KEY, JSON.stringify(ids));
  return ids;
}

export async function toggleRoutineFavoriteDB(routineId: string): Promise<boolean> {
  const isNowFavorite = toggleRoutineFavorite(routineId);

  const { data: { user } } = await supabase.auth.getUser();
  if (user) {
    if (isNowFavorite) {
      await supabase.from("routine_favorites").insert({ user_id: user.id, routine_id: routineId });
    } else {
      await supabase.from("routine_favorites").delete().eq("user_id", user.id).eq("routine_id", routineId);
    }
  }

  return isNowFavorite;
}
