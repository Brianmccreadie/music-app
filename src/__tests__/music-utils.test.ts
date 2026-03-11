import { describe, it, expect } from "vitest";
import {
  parseNote,
  midiToNote,
  noteDisplayName,
  noteShortName,
  transposeNote,
  semitonesBetween,
  generateExerciseRoots,
  patternToNotes,
  chordNotesForRoot,
  getSmartRange,
  PIANO_NOTES,
} from "@/lib/music-utils";

describe("parseNote", () => {
  it("parses C4 correctly", () => {
    const result = parseNote("C4");
    expect(result).toEqual({ name: "C", octave: 4, midi: 60 });
  });

  it("parses A0 (lowest piano note)", () => {
    const result = parseNote("A0");
    expect(result).toEqual({ name: "A", octave: 0, midi: 21 });
  });

  it("parses sharps", () => {
    const result = parseNote("F#4");
    expect(result).toEqual({ name: "F#", octave: 4, midi: 66 });
  });

  it("throws for invalid notes", () => {
    expect(() => parseNote("X4")).toThrow("Invalid note");
    expect(() => parseNote("")).toThrow("Invalid note");
    expect(() => parseNote("Cb3")).toThrow("Invalid note");
  });
});

describe("midiToNote", () => {
  it("converts middle C", () => {
    expect(midiToNote(60)).toBe("C4");
  });

  it("converts A4 (concert pitch)", () => {
    expect(midiToNote(69)).toBe("A4");
  });

  it("round-trips with parseNote", () => {
    const notes = ["C3", "D#5", "G#2", "B6"];
    for (const note of notes) {
      expect(midiToNote(parseNote(note).midi)).toBe(note);
    }
  });
});

describe("noteDisplayName", () => {
  it("returns plain name for naturals", () => {
    expect(noteDisplayName("C4")).toBe("C4");
    expect(noteDisplayName("A3")).toBe("A3");
  });

  it("returns sharp/flat for accidentals", () => {
    expect(noteDisplayName("C#4")).toBe("C#4 / Db4");
    expect(noteDisplayName("A#3")).toBe("A#3 / Bb3");
  });
});

describe("noteShortName", () => {
  it("returns just the note name without octave", () => {
    expect(noteShortName("C4")).toBe("C");
    expect(noteShortName("F#5")).toBe("F#");
  });
});

describe("transposeNote", () => {
  it("transposes up", () => {
    expect(transposeNote("C4", 7)).toBe("G4");
  });

  it("transposes down", () => {
    expect(transposeNote("C4", -12)).toBe("C3");
  });

  it("transposes by 0", () => {
    expect(transposeNote("E3", 0)).toBe("E3");
  });
});

describe("semitonesBetween", () => {
  it("calculates octave", () => {
    expect(semitonesBetween("C3", "C4")).toBe(12);
  });

  it("calculates perfect fifth", () => {
    expect(semitonesBetween("C4", "G4")).toBe(7);
  });

  it("handles negative intervals", () => {
    expect(semitonesBetween("G4", "C4")).toBe(-7);
  });
});

describe("generateExerciseRoots", () => {
  it("generates ascending and descending roots", () => {
    // Simple 5-note pattern: max offset = 4
    const roots = generateExerciseRoots("C3", "E3", [0, 1, 2, 3, 4]);
    // C3 to E3 = 4 semitones. maxRoot = E3 midi - 4 = C3 midi
    // So ascending: [C3], descending: [] (only one root)
    expect(roots).toEqual(["C3"]);
  });

  it("generates multiple roots with wider range", () => {
    // Pattern max offset = 2, range C3 to E3 (4 semitones)
    // maxRoot = E3 - 2 = D3, so ascending: C3, C#3, D3
    const roots = generateExerciseRoots("C3", "E3", [0, 1, 2]);
    expect(roots.length).toBe(5); // 3 up + 2 down
    expect(roots[0]).toBe("C3");
    expect(roots[2]).toBe("D3");
    // Descending mirrors without repeat of top
    expect(roots[3]).toBe("C#3");
    expect(roots[4]).toBe("C3");
  });

  it("returns empty when range is too small for pattern", () => {
    const roots = generateExerciseRoots("C3", "C3", [0, 1, 2]);
    expect(roots).toEqual([]);
  });
});

describe("patternToNotes", () => {
  it("converts major triad pattern", () => {
    expect(patternToNotes("C4", [0, 4, 7])).toEqual(["C4", "E4", "G4"]);
  });

  it("converts chromatic pattern", () => {
    expect(patternToNotes("C4", [0, 1, 2, 3])).toEqual([
      "C4", "C#4", "D4", "D#4",
    ]);
  });
});

describe("chordNotesForRoot", () => {
  it("returns major triad for C4", () => {
    expect(chordNotesForRoot("C4")).toEqual(["C4", "E4", "G4"]);
  });

  it("returns major triad for A3", () => {
    expect(chordNotesForRoot("A3")).toEqual(["A3", "C#4", "E4"]);
  });
});

describe("getSmartRange", () => {
  const userLow = "C3";  // midi 48
  const userHigh = "C5"; // midi 72 -> span = 24

  it("returns full range by default", () => {
    const result = getSmartRange(userLow, userHigh, [], "Scales");
    expect(result).toEqual({ low: userLow, high: userHigh });
  });

  it("returns upper range for head voice", () => {
    const result = getSmartRange(userLow, userHigh, ["head voice"], "Scales");
    // smartLow = 48 + 24 * 0.6 = 62.4 -> 62 = D4
    expect(parseNote(result.low).midi).toBeGreaterThan(parseNote(userLow).midi);
    expect(result.high).toBe(userHigh);
  });

  it("returns lower range for chest voice", () => {
    const result = getSmartRange(userLow, userHigh, ["chest voice"], "Scales");
    expect(result.low).toBe(userLow);
    expect(parseNote(result.high).midi).toBeLessThan(parseNote(userHigh).midi);
  });

  it("returns middle range for mix voice", () => {
    const result = getSmartRange(userLow, userHigh, ["mix voice"], "Scales");
    expect(parseNote(result.low).midi).toBeGreaterThan(parseNote(userLow).midi);
    expect(parseNote(result.high).midi).toBeLessThan(parseNote(userHigh).midi);
  });

  it("returns comfortable range for cool-down", () => {
    const result = getSmartRange(userLow, userHigh, [], "Cool-Down");
    expect(parseNote(result.low).midi).toBeGreaterThan(parseNote(userLow).midi);
    expect(parseNote(result.high).midi).toBeLessThan(parseNote(userHigh).midi);
  });

  it("returns full range when span is too small", () => {
    const result = getSmartRange("C4", "F4", ["head voice"], "Scales");
    // span = 5, less than 8
    expect(result).toEqual({ low: "C4", high: "F4" });
  });
});

describe("PIANO_NOTES", () => {
  it("starts at C2 and ends at C6", () => {
    expect(PIANO_NOTES[0]).toBe("C2");
    expect(PIANO_NOTES[PIANO_NOTES.length - 1]).toBe("C6");
  });

  it("has correct number of notes (4 octaves + 1)", () => {
    // C2 to B5 = 4 * 12 = 48, plus C6 = 49
    expect(PIANO_NOTES.length).toBe(49);
  });
});
