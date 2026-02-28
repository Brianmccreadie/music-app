"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import type { Exercise } from "@/lib/exercises";
import {
  generateExerciseRoots,
  patternToNotes,
  noteDisplayName,
  noteShortName,
  chordNotesForRoot,
  PIANO_NOTES,
} from "@/lib/music-utils";

type PlayerState = "idle" | "loading" | "playing" | "paused";

const LOW_NOTES = PIANO_NOTES.filter((n) => {
  const octave = parseInt(n.slice(-1));
  return octave >= 2 && octave <= 4;
});
const HIGH_NOTES = PIANO_NOTES.filter((n) => {
  const octave = parseInt(n.slice(-1));
  return octave >= 3 && octave <= 6;
});

interface ExercisePlayerProps {
  exercise: Exercise;
  startNote?: string;
  endNote?: string;
  onRangeChange?: (low: string, high: string) => void;
}

export default function ExercisePlayer({
  exercise,
  startNote = "C3",
  endNote = "A4",
  onRangeChange,
}: ExercisePlayerProps) {
  const [localStartNote, setLocalStartNote] = useState(startNote);
  const [localEndNote, setLocalEndNote] = useState(endNote);
  const [showRangeAdjust, setShowRangeAdjust] = useState(false);
  const [playerState, setPlayerState] = useState<PlayerState>("idle");
  const [bpm, setBpmState] = useState(100);
  const [currentRootIndex, setCurrentRootIndex] = useState(-1);
  const [currentNoteIndex, setCurrentNoteIndex] = useState(-1);
  const [currentNoteName, setCurrentNoteName] = useState("");
  const [roots, setRoots] = useState<string[]>([]);
  const [audioLoaded, setAudioLoaded] = useState(false);
  const [showingChord, setShowingChord] = useState(false);

  // Refs for mutable state in callbacks
  const cancelRef = useRef<(() => void) | null>(null);
  const restTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const chordTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const rootIndexRef = useRef(0);
  const isPlayingRef = useRef(false);
  const bpmRef = useRef(bpm);
  const audioEngineRef = useRef<typeof import("@/lib/audio-engine") | null>(
    null
  );

  // Sync local range with props
  useEffect(() => {
    setLocalStartNote(startNote);
    setLocalEndNote(endNote);
  }, [startNote, endNote]);

  // Compute roots when exercise or range changes
  useEffect(() => {
    const newRoots = generateExerciseRoots(
      localStartNote,
      localEndNote,
      exercise.pattern
    );
    setRoots(newRoots);
  }, [exercise, localStartNote, localEndNote]);

  const handleLocalRangeChange = (low: string, high: string) => {
    setLocalStartNote(low);
    setLocalEndNote(high);
    onRangeChange?.(low, high);
  };

  // Lazy-load audio engine (Tone.js doesn't work server-side)
  const loadAudio = useCallback(async () => {
    if (audioEngineRef.current && audioLoaded) return;
    const engine = await import("@/lib/audio-engine");
    audioEngineRef.current = engine;
    await engine.ensureAudioContext();
    await engine.initAudio();
    setAudioLoaded(true);
  }, [audioLoaded]);

  // Play a single rep: chord first to orient the singer, then the pattern
  const playRep = useCallback(
    (rootNote: string, repIndex: number, onComplete: () => void) => {
      const engine = audioEngineRef.current;
      if (!engine) return;

      const notes = patternToNotes(rootNote, exercise.pattern);
      setCurrentRootIndex(repIndex);

      // Play the major chord for this root to orient the singer
      const chordNotes = chordNotesForRoot(rootNote);
      setShowingChord(true);
      setCurrentNoteName(rootNote);
      engine.playChord(chordNotes, "2n", bpmRef.current);

      // After the chord rings, play the exercise pattern
      const chordDurationMs =
        engine.durationToSeconds("2n", bpmRef.current) * 1000;
      chordTimerRef.current = setTimeout(() => {
        if (!isPlayingRef.current) return;
        setShowingChord(false);

        const cancel = engine.playSequence({
          notes,
          noteDuration: exercise.noteDuration,
          bpm: bpmRef.current,
          onNotePlay: (noteIndex, note) => {
            setCurrentNoteIndex(noteIndex);
            setCurrentNoteName(note);
          },
          onComplete,
        });

        cancelRef.current = cancel;
      }, chordDurationMs);
    },
    [exercise]
  );

  // Chain through all reps
  const playAllReps = useCallback(
    (startFromIndex: number = 0) => {
      const engine = audioEngineRef.current;
      if (!engine || roots.length === 0) return;

      isPlayingRef.current = true;
      rootIndexRef.current = startFromIndex;

      const playNext = () => {
        if (!isPlayingRef.current || rootIndexRef.current >= roots.length) {
          // Done
          engine.stopAll();
          setPlayerState("idle");
          setCurrentRootIndex(-1);
          setCurrentNoteIndex(-1);
          setCurrentNoteName("");
          isPlayingRef.current = false;
          return;
        }

        const rootNote = roots[rootIndexRef.current];

        playRep(rootNote, rootIndexRef.current, () => {
          rootIndexRef.current++;
          // Rest between reps
          restTimerRef.current = setTimeout(
            playNext,
            exercise.restBetweenReps * 1000
          );
        });
      };

      playNext();
    },
    [roots, playRep, exercise.restBetweenReps]
  );

  const handlePlay = async () => {
    setPlayerState("loading");
    try {
      await loadAudio();
      setPlayerState("playing");
      playAllReps(0);
    } catch (err) {
      console.error("Failed to load audio:", err);
      setPlayerState("idle");
    }
  };

  const handlePause = () => {
    // Cancel current sequence, chord timer, and rest timer
    if (cancelRef.current) {
      cancelRef.current();
      cancelRef.current = null;
    }
    if (chordTimerRef.current) {
      clearTimeout(chordTimerRef.current);
      chordTimerRef.current = null;
    }
    if (restTimerRef.current) {
      clearTimeout(restTimerRef.current);
      restTimerRef.current = null;
    }
    const engine = audioEngineRef.current;
    if (engine) engine.stopAll();
    isPlayingRef.current = false;
    setShowingChord(false);
    setPlayerState("paused");
  };

  const handleResume = () => {
    isPlayingRef.current = true;
    setPlayerState("playing");
    // Resume from current root
    playAllReps(rootIndexRef.current);
  };

  const handleStop = () => {
    if (cancelRef.current) {
      cancelRef.current();
      cancelRef.current = null;
    }
    if (chordTimerRef.current) {
      clearTimeout(chordTimerRef.current);
      chordTimerRef.current = null;
    }
    if (restTimerRef.current) {
      clearTimeout(restTimerRef.current);
      restTimerRef.current = null;
    }
    const engine = audioEngineRef.current;
    if (engine) engine.stopAll();
    isPlayingRef.current = false;
    setShowingChord(false);
    setPlayerState("idle");
    setCurrentRootIndex(-1);
    setCurrentNoteIndex(-1);
    setCurrentNoteName("");
    rootIndexRef.current = 0;
  };

  const handleBpmChange = (newBpm: number) => {
    setBpmState(newBpm);
    bpmRef.current = newBpm;
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      isPlayingRef.current = false;
      if (cancelRef.current) cancelRef.current();
      if (chordTimerRef.current) clearTimeout(chordTimerRef.current);
      if (restTimerRef.current) clearTimeout(restTimerRef.current);
      const engine = audioEngineRef.current;
      if (engine) engine.stopAll();
    };
  }, []);

  const totalReps = roots.length;
  const isAscending =
    currentRootIndex >= 0 && currentRootIndex < Math.ceil(totalReps / 2);
  const progress =
    totalReps > 0 && currentRootIndex >= 0
      ? ((currentRootIndex + 1) / totalReps) * 100
      : 0;

  return (
    <div className="bg-white rounded-2xl shadow-lg p-6 max-w-lg mx-auto">
      {/* Exercise info */}
      <div className="mb-6">
        <h2 className="text-xl font-bold text-gray-900">{exercise.name}</h2>
        <p className="text-sm text-gray-500 mt-1">{exercise.description}</p>
        <div className="flex gap-2 mt-2 flex-wrap">
          {exercise.tags.map((tag) => (
            <span
              key={tag}
              className="px-2 py-0.5 bg-indigo-100 text-indigo-700 text-xs rounded-full"
            >
              {tag}
            </span>
          ))}
        </div>
      </div>

      {/* Current note display */}
      <div className="text-center mb-6">
        <div className="bg-gray-50 rounded-xl p-6">
          {currentNoteName ? (
            <>
              {showingChord && (
                <div className="text-xs font-semibold text-amber-600 uppercase tracking-wide mb-1">
                  Chord — Listen
                </div>
              )}
              <div
                className={`text-5xl font-bold mb-1 ${showingChord ? "text-amber-500" : "text-indigo-600"}`}
              >
                {noteShortName(currentNoteName)}
              </div>
              <div className="text-sm text-gray-500">
                {showingChord
                  ? `${noteDisplayName(currentNoteName)} major`
                  : noteDisplayName(currentNoteName)}
              </div>
            </>
          ) : (
            <div className="text-3xl font-medium text-gray-300">
              {playerState === "loading" ? "Loading piano..." : "Ready"}
            </div>
          )}
        </div>
      </div>

      {/* Range & Progress */}
      <div className="mb-4">
        <div className="flex justify-between text-sm text-gray-600 mb-1">
          <button
            type="button"
            onClick={() => setShowRangeAdjust(!showRangeAdjust)}
            className="text-indigo-600 hover:text-indigo-700 font-medium flex items-center gap-1"
            disabled={playerState === "playing"}
          >
            Range: {localStartNote} → {localEndNote}
            <svg
              className={`w-3 h-3 transition-transform ${showRangeAdjust ? "rotate-180" : ""}`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 9l-7 7-7-7"
              />
            </svg>
          </button>
          <span>
            {currentRootIndex >= 0
              ? `${currentRootIndex + 1} / ${totalReps}`
              : `${totalReps} keys`}
          </span>
        </div>

        {/* Inline range adjuster */}
        {showRangeAdjust && playerState !== "playing" && (
          <div className="bg-gray-50 rounded-lg p-3 mb-2 border border-gray-200">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs text-gray-500 mb-1 block">
                  Low Note
                </label>
                <select
                  value={localStartNote}
                  onChange={(e) =>
                    handleLocalRangeChange(e.target.value, localEndNote)
                  }
                  className="w-full px-2 py-1.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  {LOW_NOTES.map((note) => (
                    <option key={note} value={note}>
                      {note}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-xs text-gray-500 mb-1 block">
                  High Note
                </label>
                <select
                  value={localEndNote}
                  onChange={(e) =>
                    handleLocalRangeChange(localStartNote, e.target.value)
                  }
                  className="w-full px-2 py-1.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  {HIGH_NOTES.map((note) => (
                    <option key={note} value={note}>
                      {note}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <p className="text-xs text-gray-400 mt-2">
              Adjust range for this exercise without changing your profile.
            </p>
          </div>
        )}

        <div className="w-full bg-gray-200 rounded-full h-2">
          <div
            className="bg-indigo-500 h-2 rounded-full transition-all duration-300"
            style={{ width: `${progress}%` }}
          />
        </div>
        {currentRootIndex >= 0 && (
          <div className="text-center text-xs text-gray-500 mt-1">
            {isAscending ? "↑ Ascending" : "↓ Descending"} — Root:{" "}
            {roots[currentRootIndex]}
          </div>
        )}
      </div>

      {/* Controls */}
      <div className="flex items-center justify-center gap-3 mb-6">
        {playerState === "idle" && (
          <button
            onClick={handlePlay}
            className="bg-indigo-600 hover:bg-indigo-700 text-white rounded-full w-14 h-14 flex items-center justify-center transition-colors"
            aria-label="Play"
          >
            <svg
              className="w-6 h-6 ml-0.5"
              fill="currentColor"
              viewBox="0 0 24 24"
            >
              <path d="M8 5v14l11-7z" />
            </svg>
          </button>
        )}
        {playerState === "loading" && (
          <button
            disabled
            className="bg-gray-400 text-white rounded-full w-14 h-14 flex items-center justify-center"
          >
            <svg
              className="w-6 h-6 animate-spin"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              />
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
              />
            </svg>
          </button>
        )}
        {playerState === "playing" && (
          <>
            <button
              onClick={handlePause}
              className="bg-amber-500 hover:bg-amber-600 text-white rounded-full w-14 h-14 flex items-center justify-center transition-colors"
              aria-label="Pause"
            >
              <svg
                className="w-6 h-6"
                fill="currentColor"
                viewBox="0 0 24 24"
              >
                <path d="M6 4h4v16H6zm8 0h4v16h-4z" />
              </svg>
            </button>
            <button
              onClick={handleStop}
              className="bg-red-500 hover:bg-red-600 text-white rounded-full w-12 h-12 flex items-center justify-center transition-colors"
              aria-label="Stop"
            >
              <svg
                className="w-5 h-5"
                fill="currentColor"
                viewBox="0 0 24 24"
              >
                <path d="M6 6h12v12H6z" />
              </svg>
            </button>
          </>
        )}
        {playerState === "paused" && (
          <>
            <button
              onClick={handleResume}
              className="bg-indigo-600 hover:bg-indigo-700 text-white rounded-full w-14 h-14 flex items-center justify-center transition-colors"
              aria-label="Resume"
            >
              <svg
                className="w-6 h-6 ml-0.5"
                fill="currentColor"
                viewBox="0 0 24 24"
              >
                <path d="M8 5v14l11-7z" />
              </svg>
            </button>
            <button
              onClick={handleStop}
              className="bg-red-500 hover:bg-red-600 text-white rounded-full w-12 h-12 flex items-center justify-center transition-colors"
              aria-label="Stop"
            >
              <svg
                className="w-5 h-5"
                fill="currentColor"
                viewBox="0 0 24 24"
              >
                <path d="M6 6h12v12H6z" />
              </svg>
            </button>
          </>
        )}
      </div>

      {/* Tempo control */}
      <div className="border-t pt-4">
        <div className="flex items-center justify-between mb-2">
          <label className="text-sm font-medium text-gray-700">Tempo</label>
          <span className="text-sm font-mono text-gray-600">{bpm} BPM</span>
        </div>
        <input
          type="range"
          min={40}
          max={200}
          value={bpm}
          onChange={(e) => handleBpmChange(Number(e.target.value))}
          className="w-full accent-indigo-600"
        />
        <div className="flex justify-between text-xs text-gray-400">
          <span>Slow (40)</span>
          <span>Fast (200)</span>
        </div>
      </div>

      {/* Pattern preview */}
      <div className="mt-4 border-t pt-4">
        <div className="text-xs text-gray-500 mb-1">Pattern (semitones)</div>
        <div className="flex gap-1 flex-wrap">
          {exercise.pattern.map((interval, i) => (
            <span
              key={i}
              className={`w-8 h-8 rounded flex items-center justify-center text-xs font-mono ${
                i === currentNoteIndex && playerState === "playing"
                  ? "bg-indigo-600 text-white"
                  : "bg-gray-100 text-gray-600"
              }`}
            >
              {interval}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}
