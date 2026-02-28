import * as Tone from "tone";

const SALAMANDER_BASE_URL = "https://tonejs.github.io/audio/salamander/";

// Sampled notes from the Salamander piano set — Tone.js interpolates the rest
const SAMPLED_NOTES: Record<string, string> = {
  A0: "A0v8.mp3",
  C1: "C1v8.mp3",
  "D#1": "Ds1v8.mp3",
  "F#1": "Fs1v8.mp3",
  A1: "A1v8.mp3",
  C2: "C2v8.mp3",
  "D#2": "Ds2v8.mp3",
  "F#2": "Fs2v8.mp3",
  A2: "A2v8.mp3",
  C3: "C3v8.mp3",
  "D#3": "Ds3v8.mp3",
  "F#3": "Fs3v8.mp3",
  A3: "A3v8.mp3",
  C4: "C4v8.mp3",
  "D#4": "Ds4v8.mp3",
  "F#4": "Fs4v8.mp3",
  A4: "A4v8.mp3",
  C5: "C5v8.mp3",
  "D#5": "Ds5v8.mp3",
  "F#5": "Fs5v8.mp3",
  A5: "A5v8.mp3",
  C6: "C6v8.mp3",
  "D#6": "Ds6v8.mp3",
  "F#6": "Fs6v8.mp3",
  A6: "A6v8.mp3",
  C7: "C7v8.mp3",
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

export interface PlayPatternOptions {
  notes: string[];
  noteDuration: string;
  bpm: number;
  onNotePlay?: (noteIndex: number, note: string) => void;
  onComplete?: () => void;
}

/**
 * Schedule a pattern of notes to play using the Tone.js Transport.
 * Returns a cancel function.
 */
export function schedulePattern({
  notes,
  noteDuration,
  bpm,
  onNotePlay,
  onComplete,
}: PlayPatternOptions): () => void {
  if (!sampler || !isLoaded) {
    throw new Error("Audio not loaded. Call initAudio() first.");
  }

  Tone.getTransport().bpm.value = bpm;

  const eventIds: number[] = [];

  notes.forEach((note, index) => {
    const eventId = Tone.getTransport().schedule((time) => {
      sampler!.triggerAttackRelease(note, noteDuration, time);
      // Use Tone.getDraw for UI updates synced to audio
      Tone.getDraw().schedule(() => {
        onNotePlay?.(index, note);
      }, time);
    }, index * Tone.Time(noteDuration).toSeconds());
    eventIds.push(eventId);
  });

  // Schedule completion callback
  const totalDuration = notes.length * Tone.Time(noteDuration).toSeconds();
  const completeId = Tone.getTransport().schedule(() => {
    Tone.getDraw().schedule(() => {
      onComplete?.();
    }, Tone.now());
  }, totalDuration);
  eventIds.push(completeId);

  return () => {
    eventIds.forEach((id) => Tone.getTransport().clear(id));
  };
}

/**
 * Start the Tone.js Transport
 */
export function startTransport(): void {
  Tone.getTransport().start();
}

/**
 * Pause the Tone.js Transport
 */
export function pauseTransport(): void {
  Tone.getTransport().pause();
}

/**
 * Stop and reset the Tone.js Transport
 */
export function stopTransport(): void {
  Tone.getTransport().stop();
  Tone.getTransport().cancel();
  Tone.getTransport().position = 0;
}

/**
 * Set BPM on the transport
 */
export function setBpm(bpm: number): void {
  Tone.getTransport().bpm.value = bpm;
}

/**
 * Get current transport state
 */
export function getTransportState(): string {
  return Tone.getTransport().state;
}
