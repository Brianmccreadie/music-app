"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  VOICE_TYPES,
  EXPERIENCE_LEVELS,
  GOAL_OPTIONS,
  VOICE_RANGE_PRESETS,
  saveProfileToDB,
  getProfile,
} from "@/lib/user-profile";
import { PIANO_NOTES } from "@/lib/music-utils";
import PlayNoteButton from "@/components/PlayNoteButton";

const LOW_NOTES = PIANO_NOTES.filter((n) => {
  const octave = parseInt(n.slice(-1));
  return octave >= 2 && octave <= 4;
});
const HIGH_NOTES = PIANO_NOTES.filter((n) => {
  const octave = parseInt(n.slice(-1));
  return octave >= 3 && octave <= 6;
});

export default function OnboardingPage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [voiceType, setVoiceType] = useState("");
  const [rangeLow, setRangeLow] = useState("C3");
  const [rangeHigh, setRangeHigh] = useState("A4");
  const [goals, setGoals] = useState<string[]>([]);
  const [experienceLevel, setExperienceLevel] = useState("");

  useEffect(() => {
    const profile = getProfile();
    if (profile.onboardingComplete) {
      router.push("/");
    }
  }, [router]);

  const handleVoiceSelect = (vt: string) => {
    setVoiceType(vt);
    const preset = VOICE_RANGE_PRESETS[vt];
    if (preset) {
      setRangeLow(preset.low);
      setRangeHigh(preset.high);
    }
  };

  const toggleGoal = (goal: string) => {
    setGoals((prev) =>
      prev.includes(goal) ? prev.filter((g) => g !== goal) : [...prev, goal]
    );
  };

  const handleComplete = async () => {
    await saveProfileToDB({
      voiceType,
      rangeLow,
      rangeHigh,
      goals,
      experienceLevel,
      onboardingComplete: true,
    });
    router.push("/");
  };

  return (
    <div className="max-w-lg mx-auto px-4 py-12">
      {/* Progress */}
      <div className="flex gap-2 mb-8">
        {[1, 2, 3, 4].map((s) => (
          <div
            key={s}
            className={`h-1 flex-1 rounded-full transition-colors ${
              s <= step ? "bg-accent" : "bg-border"
            }`}
          />
        ))}
      </div>

      {step === 1 && (
        <div>
          <h1 className="text-2xl font-bold text-foreground mb-2">
            What&apos;s your voice type?
          </h1>
          <p className="text-muted mb-6">
            This sets a starting range. Skip if unsure.
          </p>
          <div className="grid grid-cols-2 gap-3 mb-6">
            {VOICE_TYPES.map((vt) => (
              <button
                key={vt}
                onClick={() => handleVoiceSelect(vt)}
                className={`p-4 rounded-xl border-2 text-left transition-all ${
                  voiceType === vt
                    ? "border-accent bg-accent-light"
                    : "border-border hover:border-accent/30"
                }`}
              >
                <div className="font-medium text-foreground">{vt}</div>
                <div className="text-xs text-muted mt-1">
                  {VOICE_RANGE_PRESETS[vt]?.low} — {VOICE_RANGE_PRESETS[vt]?.high}
                </div>
              </button>
            ))}
          </div>
          <div className="flex gap-3">
            <button
              onClick={() => setStep(2)}
              className="flex-1 py-3 text-muted hover:text-foreground"
            >
              Skip
            </button>
            <button
              onClick={() => setStep(2)}
              className="flex-1 py-3 bg-accent text-white rounded-full font-semibold hover:bg-accent-hover transition-colors"
            >
              Next
            </button>
          </div>
        </div>
      )}

      {step === 2 && (
        <div>
          <h1 className="text-2xl font-bold text-foreground mb-2">
            Set your vocal range
          </h1>
          <p className="text-muted mb-6">
            Your lowest and highest comfortable notes.
            {voiceType && " Pre-filled from your voice type."}
          </p>
          <p className="text-xs text-accent/70 mb-4">
            Tap the speaker icon to hear each note and check if you can match it.
          </p>
          <div className="grid grid-cols-2 gap-4 mb-8">
            <div>
              <label className="text-sm font-medium text-muted mb-2 block">
                Lowest Note
              </label>
              <div className="flex gap-2">
                <select
                  value={rangeLow}
                  onChange={(e) => setRangeLow(e.target.value)}
                  className="flex-1 min-w-0 px-4 py-3 bg-white border border-border rounded-lg text-lg text-foreground focus:outline-none focus:ring-2 focus:ring-accent"
                >
                  {LOW_NOTES.map((note) => (
                    <option key={note} value={note}>
                      {note}
                    </option>
                  ))}
                </select>
                <PlayNoteButton note={rangeLow} className="flex-shrink-0 !h-[50px] !w-[50px]" />
              </div>
            </div>
            <div>
              <label className="text-sm font-medium text-muted mb-2 block">
                Highest Note
              </label>
              <div className="flex gap-2">
                <select
                  value={rangeHigh}
                  onChange={(e) => setRangeHigh(e.target.value)}
                  className="flex-1 min-w-0 px-4 py-3 bg-white border border-border rounded-lg text-lg text-foreground focus:outline-none focus:ring-2 focus:ring-accent"
                >
                  {HIGH_NOTES.map((note) => (
                    <option key={note} value={note}>
                      {note}
                    </option>
                  ))}
                </select>
                <PlayNoteButton note={rangeHigh} className="flex-shrink-0 !h-[50px] !w-[50px]" />
              </div>
            </div>
          </div>
          <div className="bg-white rounded-xl p-4 mb-6 text-center border border-border shadow-sm">
            <div className="text-sm text-muted">Your range</div>
            <div className="text-2xl font-bold text-accent">
              {rangeLow} — {rangeHigh}
            </div>
          </div>
          <div className="flex gap-3">
            <button
              onClick={() => setStep(1)}
              className="flex-1 py-3 text-muted hover:text-foreground"
            >
              Back
            </button>
            <button
              onClick={() => setStep(3)}
              className="flex-1 py-3 bg-accent text-white rounded-full font-semibold hover:bg-accent-hover transition-colors"
            >
              Next
            </button>
          </div>
        </div>
      )}

      {step === 3 && (
        <div>
          <h1 className="text-2xl font-bold text-foreground mb-2">
            What are your goals?
          </h1>
          <p className="text-muted mb-6">Select all that apply.</p>
          <div className="grid grid-cols-2 gap-3 mb-6">
            {GOAL_OPTIONS.map((goal) => (
              <button
                key={goal}
                onClick={() => toggleGoal(goal)}
                className={`p-3 rounded-xl border-2 text-sm text-left transition-all ${
                  goals.includes(goal)
                    ? "border-accent bg-accent-light text-accent"
                    : "border-border text-muted hover:border-accent/30"
                }`}
              >
                {goal}
              </button>
            ))}
          </div>
          <div className="flex gap-3">
            <button
              onClick={() => setStep(2)}
              className="flex-1 py-3 text-muted hover:text-foreground"
            >
              Back
            </button>
            <button
              onClick={() => setStep(4)}
              className="flex-1 py-3 bg-accent text-white rounded-full font-semibold hover:bg-accent-hover transition-colors"
            >
              Next
            </button>
          </div>
        </div>
      )}

      {step === 4 && (
        <div>
          <h1 className="text-2xl font-bold text-foreground mb-2">
            Experience level?
          </h1>
          <p className="text-muted mb-6">
            Helps us match exercise difficulty to your skill.
          </p>
          <div className="space-y-3 mb-8">
            {EXPERIENCE_LEVELS.map((level) => (
              <button
                key={level}
                onClick={() => setExperienceLevel(level)}
                className={`w-full p-4 rounded-xl border-2 text-left transition-all ${
                  experienceLevel === level
                    ? "border-accent bg-accent-light"
                    : "border-border hover:border-accent/30"
                }`}
              >
                <div className="font-medium text-foreground">{level}</div>
                <div className="text-xs text-muted mt-1">
                  {level === "Beginner" && "New to vocal exercises or singing lessons"}
                  {level === "Intermediate" && "Some training, comfortable with basic exercises"}
                  {level === "Advanced" && "Extensive training, looking for challenging material"}
                </div>
              </button>
            ))}
          </div>
          <div className="flex gap-3">
            <button
              onClick={() => setStep(3)}
              className="flex-1 py-3 text-muted hover:text-foreground"
            >
              Back
            </button>
            <button
              onClick={handleComplete}
              disabled={!experienceLevel}
              className="flex-1 py-3 bg-accent text-white rounded-full font-semibold hover:bg-accent-hover transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
            >
              Get Started
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
