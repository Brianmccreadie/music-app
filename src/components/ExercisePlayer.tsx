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
  const [chordPhase, setChordPhase] = useState<"previous" | "new" | null>(null);

  const cancelRef = useRef<(() => void) | null>(null);
  const restTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const chordTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const rootIndexRef = useRef(0);
  const isPlayingRef = useRef(false);
  const bpmRef = useRef(bpm);
  const audioEngineRef = useRef<typeof import("@/lib/audio-engine") | null>(
    null
  );

  useEffect(() => {
    setLocalStartNote(startNote);
    setLocalEndNote(endNote);
  }, [startNote, endNote]);

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

  const loadAudio = useCallback(async () => {
    if (audioEngineRef.current && audioLoaded) return;
    const engine = await import("@/lib/audio-engine");
    audioEngineRef.current = engine;
    await engine.ensureAudioContext();
    await engine.initAudio();
    setAudioLoaded(true);
  }, [audioLoaded]);

  const playRep = useCallback(
    (rootNote: string, repIndex: number, previousRoot: string | null, onComplete: () => void) => {
      const engine = audioEngineRef.current;
      if (!engine) return;

      const notes = patternToNotes(rootNote, exercise.pattern);
      setCurrentRootIndex(repIndex);

      const chordDuration = "4n";
      const chordDurationMs =
        engine.durationToSeconds(chordDuration, bpmRef.current) * 1000;

      const startExercise = () => {
        if (!isPlayingRef.current) return;
        setShowingChord(false);
        setChordPhase(null);

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
      };

      if (previousRoot) {
        // Two-chord transition: previous key chord -> new key chord
        const prevChordNotes = chordNotesForRoot(previousRoot);
        setShowingChord(true);
        setChordPhase("previous");
        setCurrentNoteName(previousRoot);
        engine.playChord(prevChordNotes, chordDuration, bpmRef.current);

        chordTimerRef.current = setTimeout(() => {
          if (!isPlayingRef.current) return;
          // Now play the new key chord
          const newChordNotes = chordNotesForRoot(rootNote);
          setChordPhase("new");
          setCurrentNoteName(rootNote);
          engine.playChord(newChordNotes, chordDuration, bpmRef.current);

          chordTimerRef.current = setTimeout(startExercise, chordDurationMs * 2);
        }, chordDurationMs);
      } else {
        // First rep — just play the new key chord
        const newChordNotes = chordNotesForRoot(rootNote);
        setShowingChord(true);
        setChordPhase("new");
        setCurrentNoteName(rootNote);
        engine.playChord(newChordNotes, chordDuration, bpmRef.current);

        chordTimerRef.current = setTimeout(startExercise, chordDurationMs);
      }
    },
    [exercise]
  );

  const playAllReps = useCallback(
    (startFromIndex: number = 0) => {
      const engine = audioEngineRef.current;
      if (!engine || roots.length === 0) return;

      isPlayingRef.current = true;
      rootIndexRef.current = startFromIndex;

      const playNext = () => {
        if (!isPlayingRef.current || rootIndexRef.current >= roots.length) {
          engine.stopAll();
          setPlayerState("idle");
          setCurrentRootIndex(-1);
          setCurrentNoteIndex(-1);
          setCurrentNoteName("");
          setChordPhase(null);
          isPlayingRef.current = false;
          return;
        }

        const rootNote = roots[rootIndexRef.current];
        const previousRoot =
          rootIndexRef.current > startFromIndex
            ? roots[rootIndexRef.current - 1]
            : null;
        playRep(rootNote, rootIndexRef.current, previousRoot, () => {
          rootIndexRef.current++;
          // Short breath before transition chords kick in
          const restMs = 400;
          restTimerRef.current = setTimeout(playNext, restMs);
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
    setChordPhase(null);
    setPlayerState("paused");
  };

  const handleResume = () => {
    isPlayingRef.current = true;
    setPlayerState("playing");
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
    setChordPhase(null);
    setPlayerState("idle");
    setCurrentRootIndex(-1);
    setCurrentNoteIndex(-1);
    setCurrentNoteName("");
    rootIndexRef.current = 0;
  };

  const jumpToScale = useCallback(
    async (index: number) => {
      // Stop current playback
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
      setChordPhase(null);

      // Load audio if needed, then start from the target index
      if (!audioEngineRef.current || !audioLoaded) {
        try {
          await loadAudio();
        } catch {
          return;
        }
      }
      setPlayerState("playing");
      playAllReps(index);
    },
    [audioLoaded, loadAudio, playAllReps]
  );

  const handleBpmChange = (newBpm: number) => {
    setBpmState(newBpm);
    bpmRef.current = newBpm;
  };

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
    <div className="bg-white rounded-2xl border border-border p-6 max-w-lg mx-auto shadow-sm">
      {/* Exercise info */}
      <div className="mb-6">
        <h2 className="text-xl font-bold text-foreground">{exercise.name}</h2>
        <p className="text-sm text-muted mt-1">{exercise.description}</p>
        <div className="flex gap-2 mt-2 flex-wrap">
          {exercise.tags.map((tag) => (
            <span
              key={tag}
              className="px-2 py-0.5 bg-accent/10 text-accent text-xs rounded-full"
            >
              {tag}
            </span>
          ))}
        </div>
      </div>

      {/* Current note display */}
      <div className="text-center mb-6">
        <div className="bg-background rounded-xl p-6">
          {currentNoteName ? (
            <>
              {showingChord && chordPhase === "previous" && (
                <div className="text-xs font-semibold text-amber-600 uppercase tracking-wide mb-1">
                  Resolve &mdash; {noteShortName(currentNoteName)} Major
                </div>
              )}
              {showingChord && chordPhase === "new" && (
                <div className="text-xs font-semibold text-accent uppercase tracking-wide mb-1">
                  New Key &mdash; Listen
                </div>
              )}
              <div
                className={`text-5xl font-bold mb-1 ${
                  showingChord && chordPhase === "previous"
                    ? "text-amber-600"
                    : showingChord && chordPhase === "new"
                      ? "text-accent"
                      : "text-accent"
                }`}
              >
                {noteShortName(currentNoteName)}
              </div>
              <div className="text-sm text-muted">
                {showingChord
                  ? `${noteDisplayName(currentNoteName)} major`
                  : noteDisplayName(currentNoteName)}
              </div>
            </>
          ) : (
            <div className="text-3xl font-medium text-muted/40">
              {playerState === "loading" ? "Loading piano..." : "Ready"}
            </div>
          )}
        </div>
      </div>

      {/* Range & Progress */}
      <div className="mb-4">
        <div className="flex justify-between text-sm text-muted mb-1">
          <button
            type="button"
            onClick={() => setShowRangeAdjust(!showRangeAdjust)}
            className="text-accent hover:text-accent-hover font-medium flex items-center gap-1"
            disabled={playerState === "playing"}
          >
            Range: {localStartNote} — {localEndNote}
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

        {showRangeAdjust && playerState !== "playing" && (
          <div className="bg-background rounded-lg p-3 mb-2 border border-border">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs text-muted mb-1 block">
                  Low Note
                </label>
                <select
                  value={localStartNote}
                  onChange={(e) =>
                    handleLocalRangeChange(e.target.value, localEndNote)
                  }
                  className="w-full px-2 py-1.5 bg-white border border-border rounded-lg text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-accent"
                >
                  {LOW_NOTES.map((note) => (
                    <option key={note} value={note}>
                      {note}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-xs text-muted mb-1 block">
                  High Note
                </label>
                <select
                  value={localEndNote}
                  onChange={(e) =>
                    handleLocalRangeChange(localStartNote, e.target.value)
                  }
                  className="w-full px-2 py-1.5 bg-white border border-border rounded-lg text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-accent"
                >
                  {HIGH_NOTES.map((note) => (
                    <option key={note} value={note}>
                      {note}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        )}

        {/* Interactive scale dots — ascending then descending */}
        <div className="space-y-1.5">
          {(() => {
            const midpoint = Math.ceil(totalReps / 2);
            const ascRoots = roots.slice(0, midpoint);
            const descRoots = roots.slice(midpoint);

            const renderDot = (root: string, i: number) => {
              const isCurrent = i === currentRootIndex;
              const isCompleted = currentRootIndex >= 0 && i < currentRootIndex;
              return (
                <button
                  key={i}
                  type="button"
                  onClick={() => jumpToScale(i)}
                  className={`group relative rounded-full font-mono transition-all flex items-center justify-center ${
                    isCurrent
                      ? "h-7 bg-accent text-white px-2.5 min-w-[2.25rem] text-xs font-bold shadow-sm"
                      : isCompleted
                        ? "h-6 bg-accent/15 text-accent px-1.5 min-w-[1.5rem] text-[10px] lg:hover:h-7 lg:hover:px-2.5 lg:hover:min-w-[2.25rem] lg:hover:text-xs lg:hover:bg-accent/25 lg:hover:font-semibold"
                        : "h-6 bg-border/50 text-muted/50 px-1.5 min-w-[1.5rem] text-[10px] lg:hover:h-7 lg:hover:px-2.5 lg:hover:min-w-[2.25rem] lg:hover:text-xs lg:hover:bg-border lg:hover:text-muted lg:hover:font-semibold"
                  }`}
                >
                  <span className={`${isCurrent ? "" : "lg:opacity-0 lg:group-hover:opacity-100"} transition-opacity`}>
                    {noteShortName(root)}
                  </span>
                </button>
              );
            };

            return (
              <>
                <div>
                  <div className="text-[10px] text-muted/60 uppercase tracking-wider font-medium mb-1">Ascending</div>
                  <div className="flex items-center gap-1 flex-wrap">
                    {ascRoots.map((root, i) => renderDot(root, i))}
                  </div>
                </div>
                {descRoots.length > 0 && (
                  <div>
                    <div className="text-[10px] text-muted/60 uppercase tracking-wider font-medium mb-1">Descending</div>
                    <div className="flex items-center gap-1 flex-wrap">
                      {descRoots.map((root, i) => renderDot(root, midpoint + i))}
                    </div>
                  </div>
                )}
              </>
            );
          })()}
        </div>
        {currentRootIndex >= 0 && (
          <div className="text-center text-xs text-muted mt-1">
            {isAscending ? "Ascending" : "Descending"} — Root:{" "}
            {roots[currentRootIndex]}
          </div>
        )}
      </div>

      {/* Controls */}
      <div className="flex items-center justify-center gap-3 mb-6">
        {/* Skip back */}
        {(playerState === "playing" || playerState === "paused") && (
          <button
            onClick={() => jumpToScale(Math.max(0, rootIndexRef.current - 1))}
            disabled={rootIndexRef.current <= 0}
            className={`rounded-full w-10 h-10 flex items-center justify-center transition-colors ${
              rootIndexRef.current <= 0
                ? "text-muted/30 cursor-not-allowed"
                : "text-accent hover:bg-accent-light"
            }`}
            aria-label="Skip back one scale"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12.066 11.2a1 1 0 000 1.6l5.334 4A1 1 0 0019 16V8a1 1 0 00-1.6-.8l-5.334 4zM4.066 11.2a1 1 0 000 1.6l5.334 4A1 1 0 0011 16V8a1 1 0 00-1.6-.8l-5.334 4z" />
            </svg>
          </button>
        )}

        {playerState === "idle" && (
          <button
            onClick={handlePlay}
            className="bg-accent hover:bg-accent-hover text-background rounded-full w-14 h-14 flex items-center justify-center transition-colors"
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
            className="bg-muted text-background rounded-full w-14 h-14 flex items-center justify-center"
          >
            <svg className="w-6 h-6 animate-spin" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
          </button>
        )}
        {playerState === "playing" && (
          <>
            <button
              onClick={handlePause}
              className="bg-amber-500 hover:bg-amber-600 text-white rounded-full w-14 h-14 flex items-center justify-center transition-colors shadow-md"
              aria-label="Pause"
            >
              <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                <path d="M6 4h4v16H6zm8 0h4v16h-4z" />
              </svg>
            </button>
            <button
              onClick={handleStop}
              className="text-muted hover:text-foreground hover:bg-background rounded-full w-12 h-12 flex items-center justify-center transition-colors"
              aria-label="Restart"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h5M20 20v-5h-5" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M7.05 9.1A7.002 7.002 0 0119.08 10M16.95 14.9A7.002 7.002 0 014.92 14" />
              </svg>
            </button>
          </>
        )}
        {playerState === "paused" && (
          <>
            <button
              onClick={handleResume}
              className="bg-accent hover:bg-accent-hover text-background rounded-full w-14 h-14 flex items-center justify-center transition-colors"
              aria-label="Resume"
            >
              <svg className="w-6 h-6 ml-0.5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M8 5v14l11-7z" />
              </svg>
            </button>
            <button
              onClick={handleStop}
              className="text-muted hover:text-foreground hover:bg-background rounded-full w-12 h-12 flex items-center justify-center transition-colors"
              aria-label="Restart"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h5M20 20v-5h-5" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M7.05 9.1A7.002 7.002 0 0119.08 10M16.95 14.9A7.002 7.002 0 014.92 14" />
              </svg>
            </button>
          </>
        )}

        {/* Skip forward */}
        {(playerState === "playing" || playerState === "paused") && (
          <button
            onClick={() => jumpToScale(Math.min(roots.length - 1, rootIndexRef.current + 1))}
            disabled={rootIndexRef.current >= roots.length - 1}
            className={`rounded-full w-10 h-10 flex items-center justify-center transition-colors ${
              rootIndexRef.current >= roots.length - 1
                ? "text-muted/30 cursor-not-allowed"
                : "text-accent hover:bg-accent-light"
            }`}
            aria-label="Skip forward one scale"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M11.933 12.8a1 1 0 000-1.6L6.6 7.2A1 1 0 005 8v8a1 1 0 001.6.8l5.333-4zM19.933 12.8a1 1 0 000-1.6l-5.333-4A1 1 0 0013 8v8a1 1 0 001.6.8l5.333-4z" />
            </svg>
          </button>
        )}
      </div>

      {/* Tempo control */}
      <div className="border-t border-border pt-4">
        <div className="flex items-center justify-between mb-2">
          <label className="text-sm font-medium text-muted">Tempo</label>
          <span className="text-sm font-mono text-foreground">{bpm} BPM</span>
        </div>
        <input
          type="range"
          min={40}
          max={200}
          value={bpm}
          onChange={(e) => handleBpmChange(Number(e.target.value))}
          className="w-full"
        />
        <div className="flex justify-between text-xs text-muted">
          <span>Slow (40)</span>
          <span>Fast (200)</span>
        </div>
      </div>

      {/* Pattern preview */}
      <div className="mt-4 border-t border-border pt-4">
        <div className="text-xs text-muted mb-1">Pattern (semitones)</div>
        <div className="flex gap-1 flex-wrap">
          {exercise.pattern.map((interval, i) => (
            <span
              key={i}
              className={`w-8 h-8 rounded flex items-center justify-center text-xs font-mono ${
                i === currentNoteIndex && playerState === "playing"
                  ? "bg-accent text-background"
                  : "bg-background text-muted"
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
