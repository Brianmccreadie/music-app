const STORAGE_KEY = "vocal-trainer-favorites";

export function getFavorites(): string[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
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
  return index < 0; // returns true if now favorited
}
