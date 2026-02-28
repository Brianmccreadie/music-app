"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  VOICE_TYPES,
  EXPERIENCE_LEVELS,
  GOAL_OPTIONS,
  VOICE_RANGE_PRESETS,
  saveProfile,
  getProfile,
} from "@/lib/user-profile";
import { PIANO_NOTES } from "@/lib/music-utils";

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

  // Check if already onboarded
  useEffect(() => {
    const profile = getProfile();
    if (profile.onboardingComplete) {
      router.push("/");
    }
  }, [router]);

  // Apply range preset when voice type is selected
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

  const handleComplete = () => {
    saveProfile({
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
      {/* Progress dots */}
      <div className="flex justify-center gap-2 mb-8">
        {[1, 2, 3, 4].map((s) => (
          <div
            key={s}
            className={`w-3 h-3 rounded-full transition-colors ${
              s === step
                ? "bg-indigo-600"
                : s < step
                  ? "bg-indigo-300"
                  : "bg-gray-200"
            }`}
          />
        ))}
      </div>

      {/* Step 1: Voice Type */}
      {step === 1 && (
        <div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            What&apos;s your voice type?
          </h1>
          <p className="text-gray-500 mb-6">
            This helps us set a starting range. You can skip if you&apos;re not
            sure.
          </p>
          <div className="grid grid-cols-2 gap-3 mb-6">
            {VOICE_TYPES.map((vt) => (
              <button
                key={vt}
                onClick={() => handleVoiceSelect(vt)}
                className={`p-4 rounded-xl border-2 text-left transition-all ${
                  voiceType === vt
                    ? "border-indigo-600 bg-indigo-50"
                    : "border-gray-200 hover:border-gray-300"
                }`}
              >
                <div className="font-medium text-gray-900">{vt}</div>
                <div className="text-xs text-gray-400 mt-1">
                  {VOICE_RANGE_PRESETS[vt]?.low} — {VOICE_RANGE_PRESETS[vt]?.high}
                </div>
              </button>
            ))}
          </div>
          <div className="flex gap-3">
            <button
              onClick={() => setStep(2)}
              className="flex-1 py-3 text-gray-500 hover:text-gray-700"
            >
              Skip
            </button>
            <button
              onClick={() => setStep(2)}
              className="flex-1 py-3 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700 transition-colors"
            >
              Next
            </button>
          </div>
        </div>
      )}

      {/* Step 2: Range */}
      {step === 2 && (
        <div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            Set your vocal range
          </h1>
          <p className="text-gray-500 mb-6">
            Select your lowest comfortable note and highest comfortable note.
            {voiceType && " We've pre-filled based on your voice type."}
          </p>
          <div className="grid grid-cols-2 gap-4 mb-8">
            <div>
              <label className="text-sm font-medium text-gray-700 mb-2 block">
                Lowest Note
              </label>
              <select
                value={rangeLow}
                onChange={(e) => setRangeLow(e.target.value)}
                className="w-full px-4 py-3 border border-gray-200 rounded-lg text-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                {LOW_NOTES.map((note) => (
                  <option key={note} value={note}>
                    {note}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700 mb-2 block">
                Highest Note
              </label>
              <select
                value={rangeHigh}
                onChange={(e) => setRangeHigh(e.target.value)}
                className="w-full px-4 py-3 border border-gray-200 rounded-lg text-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                {HIGH_NOTES.map((note) => (
                  <option key={note} value={note}>
                    {note}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <div className="bg-gray-50 rounded-xl p-4 mb-6 text-center">
            <div className="text-sm text-gray-500">Your range</div>
            <div className="text-2xl font-bold text-indigo-600">
              {rangeLow} → {rangeHigh}
            </div>
          </div>
          <div className="flex gap-3">
            <button
              onClick={() => setStep(1)}
              className="flex-1 py-3 text-gray-500 hover:text-gray-700"
            >
              Back
            </button>
            <button
              onClick={() => setStep(3)}
              className="flex-1 py-3 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700 transition-colors"
            >
              Next
            </button>
          </div>
        </div>
      )}

      {/* Step 3: Goals */}
      {step === 3 && (
        <div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            What are your goals?
          </h1>
          <p className="text-gray-500 mb-6">
            Select all that apply. This helps us recommend the right exercises
            and plans.
          </p>
          <div className="grid grid-cols-2 gap-3 mb-6">
            {GOAL_OPTIONS.map((goal) => (
              <button
                key={goal}
                onClick={() => toggleGoal(goal)}
                className={`p-3 rounded-xl border-2 text-sm text-left transition-all ${
                  goals.includes(goal)
                    ? "border-indigo-600 bg-indigo-50 text-indigo-700"
                    : "border-gray-200 text-gray-700 hover:border-gray-300"
                }`}
              >
                {goal}
              </button>
            ))}
          </div>
          <div className="flex gap-3">
            <button
              onClick={() => setStep(2)}
              className="flex-1 py-3 text-gray-500 hover:text-gray-700"
            >
              Back
            </button>
            <button
              onClick={() => setStep(4)}
              className="flex-1 py-3 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700 transition-colors"
            >
              Next
            </button>
          </div>
        </div>
      )}

      {/* Step 4: Experience */}
      {step === 4 && (
        <div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            Experience level?
          </h1>
          <p className="text-gray-500 mb-6">
            This helps us match exercise difficulty to your skill level.
          </p>
          <div className="space-y-3 mb-8">
            {EXPERIENCE_LEVELS.map((level) => (
              <button
                key={level}
                onClick={() => setExperienceLevel(level)}
                className={`w-full p-4 rounded-xl border-2 text-left transition-all ${
                  experienceLevel === level
                    ? "border-indigo-600 bg-indigo-50"
                    : "border-gray-200 hover:border-gray-300"
                }`}
              >
                <div className="font-medium text-gray-900">{level}</div>
                <div className="text-xs text-gray-400 mt-1">
                  {level === "Beginner" &&
                    "New to vocal exercises or singing lessons"}
                  {level === "Intermediate" &&
                    "Some training, comfortable with basic exercises"}
                  {level === "Advanced" &&
                    "Extensive training, looking for challenging material"}
                </div>
              </button>
            ))}
          </div>
          <div className="flex gap-3">
            <button
              onClick={() => setStep(3)}
              className="flex-1 py-3 text-gray-500 hover:text-gray-700"
            >
              Back
            </button>
            <button
              onClick={handleComplete}
              disabled={!experienceLevel}
              className="flex-1 py-3 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed"
            >
              Get Started
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
