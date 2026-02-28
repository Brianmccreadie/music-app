"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import type { Exercise } from "@/lib/exercises";
import {
  generateExerciseRoots,
  patternToNotes,
  noteDisplayName,
  noteShortName,
} from "@/lib/music-utils";

type PlayerState = "idle" | "loading" | "playing" | "paused";

interface ExercisePlayerProps {
  exercise: Exercise;
  startNote?: string;
  endNote?: string;
}

export default function ExercisePlayer({
  exercise,
  startNote = "C3",
  endNote = "A4",
}: ExercisePlayerProps) {
  const [playerState, setPlayerState] = useState<PlayerState>("idle");
  const [bpm, setBpmState] = useState(100);
  const [currentRootIndex, setCurrentRootIndex] = useState(-1);
  const [currentNoteIndex, setCurrentNoteIndex] = useState(-1);
  const [currentNoteName, setCurrentNoteName] = useState("");
  const [roots, setRoots] = useState<string[]>([]);
  const [audioLoaded, setAudioLoaded] = useState(false);

  // Refs to hold mutable state accessible in callbacks
  const cancelRef = useRef<(() => void) | null>(null);
  const rootIndexRef = useRef(0);
  const isPlayingRef = useRef(false);
  const bpmRef = useRef(bpm);
  const audioEngineRef = useRef<typeof import("@/lib/audio-engine") | null>(
    null
  );

  // Compute roots when exercise or range changes
  useEffect(() => {
    const newRoots = generateExerciseRoots(
      startNote,
      endNote,
      exercise.pattern
    );
    setRoots(newRoots);
  }, [exercise, startNote, endNote]);

  // Lazy-load audio engine (Tone.js doesn't work server-side)
  const loadAudio = useCallback(async () => {
    if (audioEngineRef.current && audioLoaded) return;
    const engine = await import("@/lib/audio-engine");
    audioEngineRef.current = engine;
    await engine.ensureAudioContext();
    await engine.initAudio();
    setAudioLoaded(true);
  }, [audioLoaded]);

  // Play a single rep (one root note's pattern) then call onComplete
  const playRep = useCallback(
    (rootNote: string, repIndex: number, onComplete: () => void) => {
      const engine = audioEngineRef.current;
      if (!engine) return;

      const notes = patternToNotes(rootNote, exercise.pattern);
      setCurrentRootIndex(repIndex);

      const cancel = engine.schedulePattern({
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
      engine.startTransport();
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
        if (
          !isPlayingRef.current ||
          rootIndexRef.current >= roots.length
        ) {
          // Done
          engine.stopTransport();
          setPlayerState("idle");
          setCurrentRootIndex(-1);
          setCurrentNoteIndex(-1);
          setCurrentNoteName("");
          isPlayingRef.current = false;
          return;
        }

        const rootNote = roots[rootIndexRef.current];
        engine.stopTransport();

        playRep(rootNote, rootIndexRef.current, () => {
          rootIndexRef.current++;
          // Rest between reps
          setTimeout(playNext, exercise.restBetweenReps * 1000);
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
    } catch {
      setPlayerState("idle");
    }
  };

  const handlePause = () => {
    const engine = audioEngineRef.current;
    if (engine) {
      engine.pauseTransport();
    }
    isPlayingRef.current = false;
    setPlayerState("paused");
  };

  const handleResume = () => {
    const engine = audioEngineRef.current;
    if (engine) {
      isPlayingRef.current = true;
      setPlayerState("playing");
      // Resume from current position
      playAllReps(rootIndexRef.current);
    }
  };

  const handleStop = () => {
    const engine = audioEngineRef.current;
    if (engine) {
      engine.stopTransport();
    }
    if (cancelRef.current) {
      cancelRef.current();
      cancelRef.current = null;
    }
    isPlayingRef.current = false;
    setPlayerState("idle");
    setCurrentRootIndex(-1);
    setCurrentNoteIndex(-1);
    setCurrentNoteName("");
    rootIndexRef.current = 0;
  };

  const handleBpmChange = (newBpm: number) => {
    setBpmState(newBpm);
    bpmRef.current = newBpm;
    const engine = audioEngineRef.current;
    if (engine) {
      engine.setBpm(newBpm);
    }
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      isPlayingRef.current = false;
      const engine = audioEngineRef.current;
      if (engine) {
        engine.stopTransport();
      }
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
              <div className="text-5xl font-bold text-indigo-600 mb-1">
                {noteShortName(currentNoteName)}
              </div>
              <div className="text-sm text-gray-500">
                {noteDisplayName(currentNoteName)}
              </div>
            </>
          ) : (
            <div className="text-3xl font-medium text-gray-300">
              {playerState === "loading" ? "Loading piano..." : "Ready"}
            </div>
          )}
        </div>
      </div>

      {/* Progress info */}
      <div className="mb-4">
        <div className="flex justify-between text-sm text-gray-600 mb-1">
          <span>
            Range: {startNote} → {endNote}
          </span>
          <span>
            {currentRootIndex >= 0
              ? `${currentRootIndex + 1} / ${totalReps}`
              : `${totalReps} keys`}
          </span>
        </div>
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
            <svg className="w-6 h-6 ml-0.5" fill="currentColor" viewBox="0 0 24 24">
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
              <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                <path d="M6 4h4v16H6zm8 0h4v16h-4z" />
              </svg>
            </button>
            <button
              onClick={handleStop}
              className="bg-red-500 hover:bg-red-600 text-white rounded-full w-12 h-12 flex items-center justify-center transition-colors"
              aria-label="Stop"
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
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
              <svg className="w-6 h-6 ml-0.5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M8 5v14l11-7z" />
              </svg>
            </button>
            <button
              onClick={handleStop}
              className="bg-red-500 hover:bg-red-600 text-white rounded-full w-12 h-12 flex items-center justify-center transition-colors"
              aria-label="Stop"
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
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
