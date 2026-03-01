"use client";

import { useState, useRef, useCallback } from "react";
import type { Exercise } from "@/lib/exercises";
import { patternToNotes, noteShortName, chordNotesForRoot } from "@/lib/music-utils";

interface Tips {
  vowelShape: string;
  breathSupport: string;
  mouthAndJaw: string;
  posture: string;
  commonMistakes: string;
}

interface DemoInfo {
  vocalInstruction: string;
  syllables: string;
  technique: string;
  demoDescription: string;
  demoRootNote: string;
  tips?: Tips;
}

interface ExerciseDemoProps {
  exercise: Exercise;
  demoInfo: DemoInfo;
}

const TIP_LABELS: Record<keyof Tips, { label: string; icon: string }> = {
  vowelShape: { label: "Vowel & Mouth Shape", icon: "O" },
  breathSupport: { label: "Breath Support", icon: "~" },
  mouthAndJaw: { label: "Mouth & Jaw", icon: "U" },
  posture: { label: "Posture & Body", icon: "|" },
  commonMistakes: { label: "Common Mistakes", icon: "!" },
};

export default function ExerciseDemo({ exercise, demoInfo }: ExerciseDemoProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentNoteIndex, setCurrentNoteIndex] = useState(-1);
  const [isExpanded, setIsExpanded] = useState(false);
  const [expandedTip, setExpandedTip] = useState<keyof Tips | null>(null);
  const [isVocalPlaying, setIsVocalPlaying] = useState(false);
  const [isVocalLoading, setIsVocalLoading] = useState(false);
  const cancelRef = useRef<(() => void) | null>(null);
  const chordTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const audioEngineRef = useRef<typeof import("@/lib/audio-engine") | null>(
    null
  );
  const vocalAudioRef = useRef<HTMLAudioElement | null>(null);
  const vocalBlobUrlRef = useRef<string | null>(null);

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

  const handlePlayVocal = useCallback(async () => {
    // If already playing, stop
    if (isVocalPlaying && vocalAudioRef.current) {
      vocalAudioRef.current.pause();
      vocalAudioRef.current.currentTime = 0;
      setIsVocalPlaying(false);
      return;
    }

    // If we already have the audio cached, just play it
    if (vocalBlobUrlRef.current) {
      const audio = new Audio(vocalBlobUrlRef.current);
      vocalAudioRef.current = audio;
      audio.onended = () => setIsVocalPlaying(false);
      setIsVocalPlaying(true);
      audio.play();
      return;
    }

    // Fetch from API
    setIsVocalLoading(true);
    try {
      const res = await fetch("/api/vocal-demo", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ exerciseId: exercise.id }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        console.error("Vocal demo error:", data.error || res.statusText);
        setIsVocalLoading(false);
        return;
      }

      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      vocalBlobUrlRef.current = url;

      const audio = new Audio(url);
      vocalAudioRef.current = audio;
      audio.onended = () => setIsVocalPlaying(false);
      setIsVocalPlaying(true);
      setIsVocalLoading(false);
      audio.play();
    } catch (err) {
      console.error("Failed to load vocal demo:", err);
      setIsVocalLoading(false);
    }
  }, [isVocalPlaying, exercise.id]);

  const toggleTip = (key: keyof Tips) => {
    setExpandedTip(expandedTip === key ? null : key);
  };

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

      {/* Technique tip (always visible) */}
      {isExpanded && (
        <div className="bg-white/50 rounded-lg p-3 mb-4 border border-amber-200">
          <div className="text-xs font-semibold text-amber-900 uppercase tracking-wide mb-1">
            Technique Tip
          </div>
          <p className="text-sm text-amber-800">{demoInfo.technique}</p>
        </div>
      )}

      {/* Detailed vocal tips (expandable accordion) */}
      {isExpanded && demoInfo.tips && (
        <div className="space-y-2 mb-4">
          <div className="text-xs font-semibold text-amber-900 uppercase tracking-wide">
            Vocal Tips
          </div>
          {(Object.keys(TIP_LABELS) as (keyof Tips)[]).map((key) => {
            const tip = demoInfo.tips![key];
            if (!tip) return null;
            const { label, icon } = TIP_LABELS[key];
            const isOpen = expandedTip === key;
            return (
              <div
                key={key}
                className="bg-white/60 rounded-lg border border-amber-200 overflow-hidden"
              >
                <button
                  type="button"
                  onClick={() => toggleTip(key)}
                  className="w-full flex items-center gap-2 px-3 py-2 text-left hover:bg-amber-50 transition-colors"
                >
                  <span className="w-6 h-6 rounded-full bg-amber-200 text-amber-800 text-xs font-bold flex items-center justify-center flex-shrink-0">
                    {icon}
                  </span>
                  <span className="text-sm font-medium text-amber-900 flex-1">
                    {label}
                  </span>
                  <svg
                    className={`w-4 h-4 text-amber-600 transition-transform ${isOpen ? "rotate-180" : ""}`}
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={2}
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
                {isOpen && (
                  <div className="px-3 pb-3 pt-0">
                    <p className="text-sm text-amber-800 leading-relaxed pl-8">
                      {tip}
                    </p>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Demo audio buttons */}
      <div className="flex flex-wrap items-center gap-2">
        {/* Piano demo */}
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
              Stop Piano
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
              Hear Piano Demo
            </>
          )}
        </button>

        {/* Vocal demo */}
        <button
          type="button"
          onClick={handlePlayVocal}
          disabled={isVocalLoading}
          className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-colors ${
            isVocalPlaying
              ? "bg-purple-600 text-white hover:bg-purple-700"
              : isVocalLoading
                ? "bg-purple-300 text-white cursor-wait"
                : "bg-purple-500 text-white hover:bg-purple-600"
          }`}
        >
          {isVocalLoading ? (
            <>
              <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
              Loading...
            </>
          ) : isVocalPlaying ? (
            <>
              <svg
                className="w-4 h-4"
                fill="currentColor"
                viewBox="0 0 24 24"
              >
                <path d="M6 6h12v12H6z" />
              </svg>
              Stop Voice
            </>
          ) : (
            <>
              <svg
                className="w-4 h-4"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
              </svg>
              Hear Voice Demo
            </>
          )}
        </button>

        {/* Mini note display during piano demo playback */}
        {isPlaying && (
          <div className="flex gap-1 flex-wrap">
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
        Piano demo plays at C4, 90 BPM. Voice demo uses AI to demonstrate the vocal sound.
      </p>
    </div>
  );
}
