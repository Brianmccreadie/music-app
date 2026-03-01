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

export function toggleFavorite(exerciseId: string): string[] {
  const favorites = getFavorites();
  const index = favorites.indexOf(exerciseId);
  if (index === -1) {
    favorites.push(exerciseId);
  } else {
    favorites.splice(index, 1);
  }
  localStorage.setItem(STORAGE_KEY, JSON.stringify(favorites));
  return favorites;
}

export function isFavorite(exerciseId: string): boolean {
  return getFavorites().includes(exerciseId);
}
