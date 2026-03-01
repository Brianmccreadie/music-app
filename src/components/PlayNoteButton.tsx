"use client";

import { useState, useRef, useCallback } from "react";

interface PlayNoteButtonProps {
  note: string;
  className?: string;
}

export default function PlayNoteButton({
  note,
  className = "",
}: PlayNoteButtonProps) {
  const [loading, setLoading] = useState(false);
  const [playing, setPlaying] = useState(false);
  const audioEngineRef = useRef<typeof import("@/lib/audio-engine") | null>(
    null
  );
  const loadedRef = useRef(false);

  const handlePlay = useCallback(async () => {
    if (playing) return;

    try {
      setLoading(true);

      if (!audioEngineRef.current || !loadedRef.current) {
        const engine = await import("@/lib/audio-engine");
        audioEngineRef.current = engine;
        await engine.ensureAudioContext();
        await engine.initAudio();
        loadedRef.current = true;
      }

      setLoading(false);
      setPlaying(true);

      audioEngineRef.current.playNote(note, "2n", 80);

      setTimeout(() => {
        setPlaying(false);
      }, 1500);
    } catch (err) {
      console.error("Failed to play note:", err);
      setLoading(false);
      setPlaying(false);
    }
  }, [note, playing]);

  return (
    <button
      type="button"
      onClick={handlePlay}
      disabled={loading}
      className={`inline-flex items-center justify-center w-10 h-10 rounded-lg border border-border hover:border-accent/50 hover:bg-accent/10 transition-all disabled:opacity-50 ${
        playing ? "bg-accent/20 border-accent" : "bg-card"
      } ${className}`}
      aria-label={`Play ${note}`}
      title={`Play ${note}`}
    >
      {loading ? (
        <svg
          className="w-4 h-4 animate-spin text-muted"
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
      ) : playing ? (
        <svg className="w-4 h-4 text-accent" fill="currentColor" viewBox="0 0 24 24">
          <path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z" />
        </svg>
      ) : (
        <svg className="w-4 h-4 text-muted" fill="currentColor" viewBox="0 0 24 24">
          <path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02z" />
        </svg>
      )}
    </button>
  );
}
