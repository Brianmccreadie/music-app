import { describe, it, expect } from "vitest";
import {
  getFavorites,
  isFavorite,
  toggleFavorite,
  getRoutineFavorites,
  isRoutineFavorite,
  toggleRoutineFavorite,
} from "@/lib/favorites";

describe("exercise favorites", () => {
  it("starts empty", () => {
    expect(getFavorites()).toEqual([]);
  });

  it("toggleFavorite adds and returns true", () => {
    const result = toggleFavorite("five-note-scale");
    expect(result).toBe(true);
    expect(isFavorite("five-note-scale")).toBe(true);
  });

  it("toggleFavorite removes and returns false", () => {
    toggleFavorite("five-note-scale"); // add
    const result = toggleFavorite("five-note-scale"); // remove
    expect(result).toBe(false);
    expect(isFavorite("five-note-scale")).toBe(false);
  });

  it("manages multiple favorites", () => {
    toggleFavorite("a");
    toggleFavorite("b");
    toggleFavorite("c");
    expect(getFavorites()).toEqual(["a", "b", "c"]);
    toggleFavorite("b");
    expect(getFavorites()).toEqual(["a", "c"]);
  });
});

describe("routine favorites", () => {
  it("starts empty", () => {
    expect(getRoutineFavorites()).toEqual([]);
  });

  it("toggleRoutineFavorite adds and removes", () => {
    expect(toggleRoutineFavorite("routine-1")).toBe(true);
    expect(isRoutineFavorite("routine-1")).toBe(true);
    expect(toggleRoutineFavorite("routine-1")).toBe(false);
    expect(isRoutineFavorite("routine-1")).toBe(false);
  });
});
