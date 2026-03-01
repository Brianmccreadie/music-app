"use client";

import { useState, useRef, useCallback } from "react";
import type { Exercise } from "@/lib/exercises";
import { patternToNotes } from "@/lib/music-utils";

interface ExercisePreviewButtonProps {
  exercise: Exercise;
  rootNote?: string;
}

export default function ExercisePreviewButton({
  exercise,
  rootNote = "C4",
}: ExercisePreviewButtonProps) {
  const [state, setState] = useState<"idle" | "loading" | "playing">("idle");
  const cancelRef = useRef<(() => void) | null>(null);
  const audioRef = useRef<typeof import("@/lib/audio-engine") | null>(null);

  const stop = useCallback(() => {
    if (cancelRef.current) {
      cancelRef.current();
      cancelRef.current = null;
    }
    if (audioRef.current) audioRef.current.stopAll();
    setState("idle");
  }, []);

  const handleClick = useCallback(
    async (e: React.MouseEvent) => {
      e.preventDefault();
      e.stopPropagation();

      if (state === "playing") {
        stop();
        return;
      }

      setState("loading");
      try {
        if (!audioRef.current) {
          const engine = await import("@/lib/audio-engine");
          await engine.ensureAudioContext();
          await engine.initAudio();
          audioRef.current = engine;
        }

        const notes = patternToNotes(rootNote, exercise.pattern);
        setState("playing");

        cancelRef.current = audioRef.current.playSequence({
          notes,
          noteDuration: exercise.noteDuration,
          bpm: 100,
          onComplete: () => setState("idle"),
        });
      } catch {
        setState("idle");
      }
    },
    [exercise, rootNote, state, stop]
  );

  return (
    <button
      type="button"
      onClick={handleClick}
      className={`w-8 h-8 rounded-full flex items-center justify-center transition-colors flex-shrink-0 ${
        state === "playing"
          ? "bg-accent text-background"
          : "bg-accent/15 text-accent hover:bg-accent/30"
      }`}
      title={state === "playing" ? "Stop preview" : "Preview exercise"}
    >
      {state === "loading" ? (
        <svg className="w-3.5 h-3.5 animate-spin" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
        </svg>
      ) : state === "playing" ? (
        <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24">
          <path d="M6 6h12v12H6z" />
        </svg>
      ) : (
        <svg className="w-3.5 h-3.5 ml-0.5" fill="currentColor" viewBox="0 0 24 24">
          <path d="M8 5v14l11-7z" />
        </svg>
      )}
    </button>
  );
}
