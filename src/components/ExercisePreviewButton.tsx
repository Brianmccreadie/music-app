"use client";

import { useState, useRef, useCallback } from "react";
import type { Exercise } from "@/lib/exercises";
import { patternToNotes } from "@/lib/music-utils";

interface ExercisePreviewButtonProps {
  exercise: Exercise;
  className?: string;
}

export default function ExercisePreviewButton({
  exercise,
  className = "",
}: ExercisePreviewButtonProps) {
  const [playing, setPlaying] = useState(false);
  const cancelRef = useRef<(() => void) | null>(null);

  const handlePreview = useCallback(
    async (e: React.MouseEvent) => {
      e.preventDefault();
      e.stopPropagation();

      if (playing) {
        if (cancelRef.current) {
          cancelRef.current();
          cancelRef.current = null;
        }
        setPlaying(false);
        return;
      }

      try {
        setPlaying(true);
        const engine = await import("@/lib/audio-engine");
        await engine.ensureAudioContext();
        await engine.initAudio();

        const notes = patternToNotes("C4", exercise.pattern);
        const cancel = engine.playSequence({
          notes,
          noteDuration: exercise.noteDuration,
          bpm: 100,
          onComplete: () => {
            setPlaying(false);
            cancelRef.current = null;
          },
        });
        cancelRef.current = cancel;
      } catch {
        setPlaying(false);
      }
    },
    [exercise, playing]
  );

  return (
    <button
      type="button"
      onClick={handlePreview}
      className={`w-7 h-7 rounded-full flex items-center justify-center transition-colors ${
        playing
          ? "bg-accent text-background"
          : "bg-accent/10 text-accent hover:bg-accent/20"
      } ${className}`}
      title={playing ? "Stop preview" : "Preview exercise"}
    >
      {playing ? (
        <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 24 24">
          <path d="M6 6h12v12H6z" />
        </svg>
      ) : (
        <svg className="w-3 h-3 ml-0.5" fill="currentColor" viewBox="0 0 24 24">
          <path d="M8 5v14l11-7z" />
        </svg>
      )}
    </button>
  );
}
