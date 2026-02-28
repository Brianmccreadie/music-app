"use client";

import { useState, useRef, useCallback } from "react";
import type { Exercise } from "@/lib/exercises";
import { patternToNotes, noteShortName, chordNotesForRoot } from "@/lib/music-utils";

interface DemoInfo {
  vocalInstruction: string;
  syllables: string;
  technique: string;
  demoDescription: string;
  demoRootNote: string;
}

interface ExerciseDemoProps {
  exercise: Exercise;
  demoInfo: DemoInfo;
}

export default function ExerciseDemo({ exercise, demoInfo }: ExerciseDemoProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentNoteIndex, setCurrentNoteIndex] = useState(-1);
  const [isExpanded, setIsExpanded] = useState(false);
  const cancelRef = useRef<(() => void) | null>(null);
  const chordTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const audioEngineRef = useRef<typeof import("@/lib/audio-engine") | null>(
    null
  );

  const demoNotes = patternToNotes(demoInfo.demoRootNote, exercise.pattern);

  const handlePlayDemo = useCallback(async () => {
    if (isPlaying) {
      // Stop
      if (cancelRef.current) {
        cancelRef.current();
        cancelRef.current = null;
      }
      if (chordTimerRef.current) {
        clearTimeout(chordTimerRef.current);
        chordTimerRef.current = null;
      }
      const engine = audioEngineRef.current;
      if (engine) engine.stopAll();
      setIsPlaying(false);
      setCurrentNoteIndex(-1);
      return;
    }

    setIsPlaying(true);

    try {
      // Lazy load audio
      if (!audioEngineRef.current) {
        const engine = await import("@/lib/audio-engine");
        audioEngineRef.current = engine;
        await engine.ensureAudioContext();
        await engine.initAudio();
      }

      const engine = audioEngineRef.current;
      const demoBpm = 90;

      // Play the chord first
      const chordNotes = chordNotesForRoot(demoInfo.demoRootNote);
      engine.playChord(chordNotes, "2n", demoBpm);

      const chordMs = engine.durationToSeconds("2n", demoBpm) * 1000;
      chordTimerRef.current = setTimeout(() => {
        // Then play the pattern
        const cancel = engine.playSequence({
          notes: demoNotes,
          noteDuration: exercise.noteDuration,
          bpm: demoBpm,
          onNotePlay: (noteIndex) => {
            setCurrentNoteIndex(noteIndex);
          },
          onComplete: () => {
            setIsPlaying(false);
            setCurrentNoteIndex(-1);
          },
        });
        cancelRef.current = cancel;
      }, chordMs);
    } catch (err) {
      console.error("Failed to play demo:", err);
      setIsPlaying(false);
      setCurrentNoteIndex(-1);
    }
  }, [isPlaying, demoNotes, exercise.noteDuration, demoInfo.demoRootNote]);

  return (
    <div className="bg-gradient-to-br from-amber-50 to-orange-50 rounded-2xl shadow-sm border border-amber-200 p-5">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-bold text-amber-900 uppercase tracking-wide">
          How to Do This Exercise
        </h3>
        <button
          type="button"
          onClick={() => setIsExpanded(!isExpanded)}
          className="text-xs text-amber-700 hover:text-amber-800 font-medium"
        >
          {isExpanded ? "Less" : "More"} detail
        </button>
      </div>

      {/* Main instruction */}
      <div className="bg-white/70 rounded-xl p-4 mb-3">
        <div className="text-lg font-bold text-amber-800 mb-1">
          {demoInfo.vocalInstruction}
        </div>
        <div className="text-sm text-amber-700 font-mono">
          {demoInfo.syllables}
        </div>
      </div>

      {/* Demo description */}
      <p className="text-sm text-amber-800 mb-4">{demoInfo.demoDescription}</p>

      {/* Technique tips (expandable) */}
      {isExpanded && (
        <div className="bg-white/50 rounded-lg p-3 mb-4 border border-amber-200">
          <div className="text-xs font-semibold text-amber-900 uppercase tracking-wide mb-1">
            Technique Tip
          </div>
          <p className="text-sm text-amber-800">{demoInfo.technique}</p>
        </div>
      )}

      {/* Demo audio player */}
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={handlePlayDemo}
          className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-colors ${
            isPlaying
              ? "bg-amber-600 text-white hover:bg-amber-700"
              : "bg-amber-500 text-white hover:bg-amber-600"
          }`}
        >
          {isPlaying ? (
            <>
              <svg
                className="w-4 h-4"
                fill="currentColor"
                viewBox="0 0 24 24"
              >
                <path d="M6 6h12v12H6z" />
              </svg>
              Stop Demo
            </>
          ) : (
            <>
              <svg
                className="w-4 h-4"
                fill="currentColor"
                viewBox="0 0 24 24"
              >
                <path d="M8 5v14l11-7z" />
              </svg>
              Hear Demo
            </>
          )}
        </button>

        {/* Mini note display during demo playback */}
        {isPlaying && (
          <div className="flex gap-1">
            {demoNotes.map((note, i) => (
              <span
                key={i}
                className={`w-7 h-7 rounded flex items-center justify-center text-xs font-mono transition-colors ${
                  i === currentNoteIndex
                    ? "bg-amber-500 text-white"
                    : "bg-amber-100 text-amber-600"
                }`}
              >
                {noteShortName(note)}
              </span>
            ))}
          </div>
        )}
      </div>

      <p className="text-xs text-amber-600 mt-3">
        Demo plays once at C4, tempo 90 BPM — just to show you the pattern and sound.
      </p>
    </div>
  );
}
