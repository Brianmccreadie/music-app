// Note names in chromatic order
const NOTE_NAMES = [
  "C",
  "C#",
  "D",
  "D#",
  "E",
  "F",
  "F#",
  "G",
  "G#",
  "A",
  "A#",
  "B",
] as const;

// Flat equivalents for display
const FLAT_NAMES: Record<string, string> = {
  "C#": "Db",
  "D#": "Eb",
  "F#": "Gb",
  "G#": "Ab",
  "A#": "Bb",
};

export type NoteName = (typeof NOTE_NAMES)[number];

/**
 * Parse a note string like "C3" or "F#4" into { name, octave, midi }
 */
export function parseNote(note: string): {
  name: string;
  octave: number;
  midi: number;
} {
  const match = note.match(/^([A-G]#?)(\d+)$/);
  if (!match) throw new Error(`Invalid note: ${note}`);
  const name = match[1];
  const octave = parseInt(match[2]);
  const noteIndex = NOTE_NAMES.indexOf(name as NoteName);
  if (noteIndex === -1) throw new Error(`Invalid note name: ${name}`);
  // MIDI: C4 = 60
  const midi = (octave + 1) * 12 + noteIndex;
  return { name, octave, midi };
}

/**
 * Convert a MIDI number back to a note string like "C3"
 */
export function midiToNote(midi: number): string {
  const noteIndex = midi % 12;
  const octave = Math.floor(midi / 12) - 1;
  return `${NOTE_NAMES[noteIndex]}${octave}`;
}

/**
 * Get display-friendly note name (e.g., "C#3" → "C#3/Db3")
 */
export function noteDisplayName(note: string): string {
  const { name, octave } = parseNote(note);
  if (FLAT_NAMES[name]) {
    return `${name}${octave} / ${FLAT_NAMES[name]}${octave}`;
  }
  return `${name}${octave}`;
}

/**
 * Get short display name (just the note, no octave)
 */
export function noteShortName(note: string): string {
  const { name } = parseNote(note);
  return name;
}

/**
 * Transpose a note by a number of semitones
 */
export function transposeNote(note: string, semitones: number): string {
  const { midi } = parseNote(note);
  return midiToNote(midi + semitones);
}

/**
 * Get number of semitones between two notes
 */
export function semitonesBetween(noteA: string, noteB: string): number {
  return parseNote(noteB).midi - parseNote(noteA).midi;
}

/**
 * Generate all root notes for an exercise given a range.
 * The root note ascends from startNote up to the highest note where
 * the full pattern still fits within the range, then descends back.
 */
export function generateExerciseRoots(
  startNote: string,
  endNote: string,
  pattern: number[]
): string[] {
  const startMidi = parseNote(startNote).midi;
  const endMidi = parseNote(endNote).midi;
  const maxPatternOffset = Math.max(...pattern);

  // Ascending: root goes from startNote up to the highest root
  // where root + maxPatternOffset <= endMidi
  const maxRoot = endMidi - maxPatternOffset;
  const ascending: string[] = [];
  for (let root = startMidi; root <= maxRoot; root++) {
    ascending.push(midiToNote(root));
  }

  // Descending: go back down (excluding the top note to avoid repeat)
  const descending = ascending.slice(0, -1).reverse();

  return [...ascending, ...descending];
}

/**
 * Given a pattern and root note, return the actual note names
 */
export function patternToNotes(
  rootNote: string,
  pattern: number[]
): string[] {
  const rootMidi = parseNote(rootNote).midi;
  return pattern.map((offset) => midiToNote(rootMidi + offset));
}

/**
 * Generate chord notes (major triad) for a given root note.
 * Returns [root, major third, fifth] — e.g., "C4" → ["C4", "E4", "G4"]
 */
export function chordNotesForRoot(rootNote: string): string[] {
  const rootMidi = parseNote(rootNote).midi;
  return [
    midiToNote(rootMidi),       // root
    midiToNote(rootMidi + 4),   // major third
    midiToNote(rootMidi + 7),   // perfect fifth
  ];
}

/**
 * Common note values for the range selector
 */
export const PIANO_NOTES: string[] = [];
// Generate notes from C2 to C6
for (let octave = 2; octave <= 6; octave++) {
  for (const name of NOTE_NAMES) {
    PIANO_NOTES.push(`${name}${octave}`);
    if (name === "C" && octave === 6) break; // Stop at C6
  }
}
