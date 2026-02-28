import * as Tone from "tone";

const SALAMANDER_BASE_URL = "https://tonejs.github.io/audio/salamander/";

// Sampled notes from the Salamander piano set — Tone.js interpolates the rest
const SAMPLED_NOTES: Record<string, string> = {
  A0: "A0.mp3",
  C1: "C1.mp3",
  "D#1": "Ds1.mp3",
  "F#1": "Fs1.mp3",
  A1: "A1.mp3",
  C2: "C2.mp3",
  "D#2": "Ds2.mp3",
  "F#2": "Fs2.mp3",
  A2: "A2.mp3",
  C3: "C3.mp3",
  "D#3": "Ds3.mp3",
  "F#3": "Fs3.mp3",
  A3: "A3.mp3",
  C4: "C4.mp3",
  "D#4": "Ds4.mp3",
  "F#4": "Fs4.mp3",
  A4: "A4.mp3",
  C5: "C5.mp3",
  "D#5": "Ds5.mp3",
  "F#5": "Fs5.mp3",
  A5: "A5.mp3",
  C6: "C6.mp3",
  "D#6": "Ds6.mp3",
  "F#6": "Fs6.mp3",
  A6: "A6.mp3",
  C7: "C7.mp3",
};

let sampler: Tone.Sampler | null = null;
let isLoaded = false;
let loadPromise: Promise<void> | null = null;

/**
 * Initialize the piano sampler with Salamander samples.
 * Returns a promise that resolves when samples are loaded.
 */
export function initAudio(): Promise<void> {
  if (loadPromise) return loadPromise;

  loadPromise = new Promise<void>((resolve, reject) => {
    sampler = new Tone.Sampler({
      urls: SAMPLED_NOTES,
      baseUrl: SALAMANDER_BASE_URL,
      release: 1,
      onload: () => {
        isLoaded = true;
        resolve();
      },
      onerror: (err) => {
        loadPromise = null;
        reject(err);
      },
    }).toDestination();
  });

  return loadPromise;
}

/**
 * Ensure the audio context is started (must be called from a user gesture).
 */
export async function ensureAudioContext(): Promise<void> {
  if (Tone.getContext().state !== "running") {
    await Tone.start();
  }
}

/**
 * Get the current loading state
 */
export function isAudioLoaded(): boolean {
  return isLoaded;
}

/**
 * Convert a note duration string (e.g. "4n") to seconds at a given BPM.
 */
export function durationToSeconds(duration: string, bpm: number): number {
  // Quarter note duration in seconds
  const quarterNote = 60 / bpm;
  switch (duration) {
    case "1n":
      return quarterNote * 4;
    case "2n":
      return quarterNote * 2;
    case "4n":
      return quarterNote;
    case "8n":
      return quarterNote / 2;
    case "16n":
      return quarterNote / 4;
    default:
      return quarterNote;
  }
}

/**
 * Play a single note on the piano sampler.
 */
export function playNote(note: string, duration: string, bpm: number): void {
  if (!sampler || !isLoaded) return;
  const durationSec = durationToSeconds(duration, bpm);
  sampler.triggerAttackRelease(note, durationSec);
}

export interface PlaySequenceOptions {
  notes: string[];
  noteDuration: string;
  bpm: number;
  onNotePlay?: (noteIndex: number, note: string) => void;
  onComplete?: () => void;
}

/**
 * Play a sequence of notes with simple setTimeout scheduling.
 * Returns a cancel function.
 */
export function playSequence({
  notes,
  noteDuration,
  bpm,
  onNotePlay,
  onComplete,
}: PlaySequenceOptions): () => void {
  if (!sampler || !isLoaded) {
    throw new Error("Audio not loaded. Call initAudio() first.");
  }

  let cancelled = false;
  const timers: ReturnType<typeof setTimeout>[] = [];
  const intervalMs = durationToSeconds(noteDuration, bpm) * 1000;

  notes.forEach((note, index) => {
    const timer = setTimeout(() => {
      if (cancelled) return;
      sampler!.triggerAttackRelease(note, durationToSeconds(noteDuration, bpm));
      onNotePlay?.(index, note);
    }, index * intervalMs);
    timers.push(timer);
  });

  // Schedule completion
  const completeTimer = setTimeout(() => {
    if (cancelled) return;
    onComplete?.();
  }, notes.length * intervalMs);
  timers.push(completeTimer);

  return () => {
    cancelled = true;
    timers.forEach((t) => clearTimeout(t));
  };
}

/**
 * Play a chord (multiple notes simultaneously) on the piano sampler.
 * Returns a promise that resolves after the chord duration.
 */
export function playChord(
  notes: string[],
  duration: string,
  bpm: number
): Promise<void> {
  if (!sampler || !isLoaded) return Promise.resolve();
  const durationSec = durationToSeconds(duration, bpm);
  notes.forEach((note) => {
    sampler!.triggerAttackRelease(note, durationSec);
  });
  return new Promise((resolve) => setTimeout(resolve, durationSec * 1000));
}

/**
 * Stop all currently playing notes
 */
export function stopAll(): void {
  if (sampler) {
    sampler.releaseAll();
  }
}
