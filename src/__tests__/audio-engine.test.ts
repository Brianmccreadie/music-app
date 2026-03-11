import { describe, it, expect, vi } from "vitest";
import { durationToSeconds } from "@/lib/audio-engine";

// We test only the pure function durationToSeconds here.
// The rest of audio-engine depends on Tone.js which needs browser audio context.

describe("durationToSeconds", () => {
  it("converts quarter note at 120 BPM", () => {
    // 60/120 = 0.5s
    expect(durationToSeconds("4n", 120)).toBe(0.5);
  });

  it("converts whole note at 60 BPM", () => {
    // 60/60 * 4 = 4s
    expect(durationToSeconds("1n", 60)).toBe(4);
  });

  it("converts half note at 120 BPM", () => {
    // 60/120 * 2 = 1s
    expect(durationToSeconds("2n", 120)).toBe(1);
  });

  it("converts eighth note at 120 BPM", () => {
    // 60/120 / 2 = 0.25s
    expect(durationToSeconds("8n", 120)).toBe(0.25);
  });

  it("converts sixteenth note at 120 BPM", () => {
    // 60/120 / 4 = 0.125s
    expect(durationToSeconds("16n", 120)).toBe(0.125);
  });

  it("defaults to quarter note for unknown durations", () => {
    expect(durationToSeconds("unknown", 120)).toBe(0.5);
  });

  it("handles slow tempos", () => {
    // 60/40 = 1.5s per quarter
    expect(durationToSeconds("4n", 40)).toBe(1.5);
  });

  it("handles fast tempos", () => {
    // 60/200 = 0.3s per quarter
    expect(durationToSeconds("4n", 200)).toBeCloseTo(0.3);
  });
});
