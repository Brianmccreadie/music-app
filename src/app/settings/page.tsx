"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  VOICE_TYPES,
  EXPERIENCE_LEVELS,
  GOAL_OPTIONS,
  getProfile,
  saveProfile,
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

export default function SettingsPage() {
  const [voiceType, setVoiceType] = useState("");
  const [rangeLow, setRangeLow] = useState("C3");
  const [rangeHigh, setRangeHigh] = useState("A4");
  const [goals, setGoals] = useState<string[]>([]);
  const [experienceLevel, setExperienceLevel] = useState("");
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    const profile = getProfile();
    setVoiceType(profile.voiceType);
    setRangeLow(profile.rangeLow);
    setRangeHigh(profile.rangeHigh);
    setGoals(profile.goals);
    setExperienceLevel(profile.experienceLevel);
  }, []);

  const toggleGoal = (goal: string) => {
    setGoals((prev) =>
      prev.includes(goal) ? prev.filter((g) => g !== goal) : [...prev, goal]
    );
  };

  const handleSave = () => {
    saveProfile({ voiceType, rangeLow, rangeHigh, goals, experienceLevel });
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div className="max-w-lg mx-auto px-4 py-8">
      <Link
        href="/"
        className="text-sm text-indigo-600 hover:text-indigo-700 mb-6 inline-block"
      >
        &larr; Back to Home
      </Link>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Settings</h1>

      {/* Voice Type */}
      <div className="mb-6">
        <label className="text-sm font-medium text-gray-700 mb-2 block">
          Voice Type
        </label>
        <select
          value={voiceType}
          onChange={(e) => setVoiceType(e.target.value)}
          className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
        >
          <option value="">Not set</option>
          {VOICE_TYPES.map((vt) => (
            <option key={vt} value={vt}>
              {vt}
            </option>
          ))}
        </select>
      </div>

      {/* Range */}
      <div className="mb-6">
        <label className="text-sm font-medium text-gray-700 mb-2 block">
          Vocal Range
        </label>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="text-xs text-gray-500 mb-1 block">
              Lowest Note
            </label>
            <select
              value={rangeLow}
              onChange={(e) => setRangeLow(e.target.value)}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              {LOW_NOTES.map((note) => (
                <option key={note} value={note}>
                  {note}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="text-xs text-gray-500 mb-1 block">
              Highest Note
            </label>
            <select
              value={rangeHigh}
              onChange={(e) => setRangeHigh(e.target.value)}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
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

      {/* Experience */}
      <div className="mb-6">
        <label className="text-sm font-medium text-gray-700 mb-2 block">
          Experience Level
        </label>
        <div className="flex gap-2">
          {EXPERIENCE_LEVELS.map((level) => (
            <button
              key={level}
              onClick={() => setExperienceLevel(level)}
              className={`flex-1 py-2 rounded-lg text-sm transition-colors ${
                experienceLevel === level
                  ? "bg-indigo-600 text-white"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}
            >
              {level}
            </button>
          ))}
        </div>
      </div>

      {/* Goals */}
      <div className="mb-8">
        <label className="text-sm font-medium text-gray-700 mb-2 block">
          Goals
        </label>
        <div className="grid grid-cols-2 gap-2">
          {GOAL_OPTIONS.map((goal) => (
            <button
              key={goal}
              onClick={() => toggleGoal(goal)}
              className={`p-2 rounded-lg border text-sm text-left transition-all ${
                goals.includes(goal)
                  ? "border-indigo-600 bg-indigo-50 text-indigo-700"
                  : "border-gray-200 text-gray-600 hover:border-gray-300"
              }`}
            >
              {goal}
            </button>
          ))}
        </div>
      </div>

      {/* Save */}
      <button
        onClick={handleSave}
        className="w-full py-3 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700 transition-colors"
      >
        {saved ? "Saved!" : "Save Settings"}
      </button>
    </div>
  );
}
