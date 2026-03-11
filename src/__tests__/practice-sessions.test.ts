import { describe, it, expect, vi, beforeEach } from "vitest";

// We need to mock supabase before importing the module
vi.mock("@/lib/supabase", () => ({
  supabase: {
    auth: { getUser: vi.fn().mockResolvedValue({ data: { user: null } }) },
    from: vi.fn().mockReturnValue({
      insert: vi.fn(),
      select: vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({
          order: vi.fn().mockReturnValue({
            limit: vi.fn().mockResolvedValue({ data: null }),
          }),
        }),
      }),
    }),
  },
}));

import {
  recordSession,
  getRecentSessions,
  getTodaySessions,
  getTotalPracticeMinutes,
  getStreak,
} from "@/lib/practice-sessions";

const sampleData = {
  exerciseId: "five-note-scale",
  durationSeconds: 120,
  bpm: 100,
  rangeLow: "C3",
  rangeHigh: "C5",
};

describe("recordSession", () => {
  it("creates a session with ID and timestamp", () => {
    const session = recordSession(sampleData);
    expect(session.id).toMatch(/^session-/);
    expect(session.completedAt).toBeGreaterThan(0);
    expect(session.exerciseId).toBe("five-note-scale");
    expect(session.durationSeconds).toBe(120);
  });

  it("persists to localStorage", () => {
    recordSession(sampleData);
    const stored = localStorage.getItem("vocal-app-sessions");
    expect(stored).toBeTruthy();
    const parsed = JSON.parse(stored!);
    expect(parsed.length).toBeGreaterThan(0);
  });
});

describe("getRecentSessions", () => {
  it("returns sessions sorted by most recent first", () => {
    recordSession(sampleData);
    recordSession({ ...sampleData, exerciseId: "major-triad" });
    const recent = getRecentSessions();
    expect(recent.length).toBe(2);
    expect(recent[0].completedAt).toBeGreaterThanOrEqual(recent[1].completedAt);
  });

  it("respects limit parameter", () => {
    for (let i = 0; i < 5; i++) recordSession(sampleData);
    expect(getRecentSessions(3).length).toBe(3);
  });
});

describe("getTodaySessions", () => {
  it("returns sessions from today", () => {
    recordSession(sampleData);
    const today = getTodaySessions();
    expect(today.length).toBeGreaterThan(0);
  });
});

describe("getTotalPracticeMinutes", () => {
  it("sums duration across sessions", () => {
    recordSession({ ...sampleData, durationSeconds: 60 });
    recordSession({ ...sampleData, durationSeconds: 120 });
    expect(getTotalPracticeMinutes()).toBe(3); // 180s = 3min
  });
});

describe("getStreak", () => {
  it("returns 0 with no sessions", () => {
    expect(getStreak()).toBe(0);
  });

  it("returns 1 for today only", () => {
    recordSession(sampleData);
    expect(getStreak()).toBe(1);
  });

  it("counts consecutive days", () => {
    const now = Date.now();
    const dayMs = 86400000;

    // Manually set sessions for today, yesterday, and day before
    const sessions = [
      { ...sampleData, id: "s1", completedAt: now },
      { ...sampleData, id: "s2", completedAt: now - dayMs },
      { ...sampleData, id: "s3", completedAt: now - 2 * dayMs },
    ];
    localStorage.setItem("vocal-app-sessions", JSON.stringify(sessions));

    expect(getStreak()).toBe(3);
  });

  it("breaks streak on missed day", () => {
    const now = Date.now();
    const dayMs = 86400000;

    const sessions = [
      { ...sampleData, id: "s1", completedAt: now },
      // Skip yesterday
      { ...sampleData, id: "s2", completedAt: now - 2 * dayMs },
    ];
    localStorage.setItem("vocal-app-sessions", JSON.stringify(sessions));

    expect(getStreak()).toBe(1);
  });
});
