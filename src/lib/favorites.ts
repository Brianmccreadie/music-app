const STORAGE_KEY = "vocal-app-favorites";

export function getFavorites(): string[] {
  if (typeof window === "undefined") return [];
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
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
  localStorage.setItem(STORAGE_KEY, JSON.stringify(favorites));
  return index < 0;
}
