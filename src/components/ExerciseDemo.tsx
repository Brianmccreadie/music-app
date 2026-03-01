"use client";

import { useState } from "react";
import type { Exercise } from "@/lib/exercises";

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
  vowelOptions?: string[];
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
  const [showTips, setShowTips] = useState(false);
  const [expandedTip, setExpandedTip] = useState<keyof Tips | null>(null);

  const toggleTip = (key: keyof Tips) => {
    setExpandedTip(expandedTip === key ? null : key);
  };

  return (
    <div className="bg-card rounded-2xl border border-border p-5">
      <h3 className="text-sm font-bold text-accent uppercase tracking-wide mb-3">
        How to Do This Exercise
      </h3>

      {/* Main instruction */}
      <div className="bg-background rounded-xl p-4 mb-3">
        <div className="text-lg font-bold text-foreground mb-1">
          {demoInfo.vocalInstruction}
        </div>
        <div className="text-sm text-accent font-mono">
          {demoInfo.syllables}
        </div>
      </div>

      {/* Vowel options */}
      {demoInfo.vowelOptions && demoInfo.vowelOptions.length > 0 && (
        <div className="mb-3">
          <div className="text-xs font-semibold text-muted uppercase tracking-wide mb-1.5">
            Try it with
          </div>
          <div className="flex flex-wrap gap-1.5">
            {demoInfo.vowelOptions.map((option) => (
              <span
                key={option}
                className="px-2.5 py-1 rounded-full text-xs bg-accent/10 text-accent border border-accent/20"
              >
                {option}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Demo description */}
      <p className="text-sm text-muted mb-3">{demoInfo.demoDescription}</p>

      {/* Technique tip */}
      <div className="bg-background rounded-lg p-3 mb-4 border border-border">
        <div className="text-xs font-semibold text-accent uppercase tracking-wide mb-1">
          Technique Tip
        </div>
        <p className="text-sm text-foreground/80">{demoInfo.technique}</p>
      </div>

      {/* Vocal tips toggle */}
      {demoInfo.tips && (
        <>
          <button
            type="button"
            onClick={() => setShowTips(!showTips)}
            className={`w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl text-sm font-semibold transition-colors border ${
              showTips
                ? "bg-accent text-background border-accent"
                : "bg-card-hover text-foreground border-border hover:border-accent/50"
            }`}
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5.002 5.002 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
            </svg>
            {showTips ? "Hide Vocal Tips" : "Show Vocal Tips"}
            <svg
              className={`w-4 h-4 transition-transform ${showTips ? "rotate-180" : ""}`}
              fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
            </svg>
          </button>

          {showTips && (
            <div className="space-y-2 mt-4">
              {(Object.keys(TIP_LABELS) as (keyof Tips)[]).map((key) => {
                const tip = demoInfo.tips![key];
                if (!tip) return null;
                const { label, icon } = TIP_LABELS[key];
                const isOpen = expandedTip === key;
                return (
                  <div
                    key={key}
                    className="bg-background rounded-lg border border-border overflow-hidden"
                  >
                    <button
                      type="button"
                      onClick={() => toggleTip(key)}
                      className="w-full flex items-center gap-2 px-3 py-2 text-left hover:bg-card-hover transition-colors"
                    >
                      <span className="w-6 h-6 rounded-full bg-accent/20 text-accent text-xs font-bold flex items-center justify-center flex-shrink-0">
                        {icon}
                      </span>
                      <span className="text-sm font-medium text-foreground flex-1">
                        {label}
                      </span>
                      <svg
                        className={`w-4 h-4 text-muted transition-transform ${isOpen ? "rotate-180" : ""}`}
                        fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                      </svg>
                    </button>
                    {isOpen && (
                      <div className="px-3 pb-3 pt-0">
                        <p className="text-sm text-muted leading-relaxed pl-8">
                          {tip}
                        </p>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </>
      )}
    </div>
  );
}
