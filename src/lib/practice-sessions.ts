import { supabase } from "@/lib/supabase";

export interface PracticeSession {
  id: string;
  exerciseId: string;
  durationSeconds: number;
  bpm: number;
  rangeLow: string;
  rangeHigh: string;
  completedAt: number;
}

const STORAGE_KEY = "vocal-app-sessions";

function generateId(): string {
  return `session-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

// ── localStorage ──

function getSessions(): PracticeSession[] {
  if (typeof window === "undefined") return [];
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) return JSON.parse(stored);
  } catch {
    // ignore
  }
  return [];
}

function saveSessions(sessions: PracticeSession[]): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(sessions));
}

export function getRecentSessions(limit = 20): PracticeSession[] {
  return getSessions()
    .sort((a, b) => b.completedAt - a.completedAt)
    .slice(0, limit);
}

export function getTodaySessions(): PracticeSession[] {
  const startOfDay = new Date();
  startOfDay.setHours(0, 0, 0, 0);
  const ts = startOfDay.getTime();
  return getSessions().filter((s) => s.completedAt >= ts);
}

export function getTotalPracticeMinutes(): number {
  return Math.round(
    getSessions().reduce((sum, s) => sum + s.durationSeconds, 0) / 60
  );
}

export function getStreak(): number {
  const sessions = getSessions().sort((a, b) => b.completedAt - a.completedAt);
  if (sessions.length === 0) return 0;

  let streak = 0;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  let checkDate = today.getTime();

  const dayMs = 86400000;
  const sessionDays = new Set(
    sessions.map((s) => {
      const d = new Date(s.completedAt);
      d.setHours(0, 0, 0, 0);
      return d.getTime();
    })
  );

  while (sessionDays.has(checkDate)) {
    streak++;
    checkDate -= dayMs;
  }

  return streak;
}

// ── Record a session ──

export function recordSession(
  data: Omit<PracticeSession, "id" | "completedAt">
): PracticeSession {
  const session: PracticeSession = {
    ...data,
    id: generateId(),
    completedAt: Date.now(),
  };
  const sessions = getSessions();
  sessions.push(session);
  saveSessions(sessions);
  return session;
}

// ── Supabase sync ──

export async function recordSessionDB(
  data: Omit<PracticeSession, "id" | "completedAt">
): Promise<PracticeSession> {
  const session = recordSession(data);

  const { data: { user } } = await supabase.auth.getUser();
  if (user) {
    await supabase.from("practice_sessions").insert({
      user_id: user.id,
      exercise_id: session.exerciseId,
      duration_seconds: session.durationSeconds,
      bpm: session.bpm,
      range_low: session.rangeLow,
      range_high: session.rangeHigh,
      completed_at: new Date(session.completedAt).toISOString(),
    });
  }

  return session;
}

export async function fetchSessionsFromDB(): Promise<PracticeSession[]> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return getSessions();

  const { data } = await supabase
    .from("practice_sessions")
    .select("*")
    .eq("user_id", user.id)
    .order("completed_at", { ascending: false })
    .limit(200);

  if (!data) return getSessions();

  const sessions: PracticeSession[] = data.map((r) => ({
    id: r.id,
    exerciseId: r.exercise_id,
    durationSeconds: r.duration_seconds,
    bpm: r.bpm,
    rangeLow: r.range_low ?? "",
    rangeHigh: r.range_high ?? "",
    completedAt: new Date(r.completed_at).getTime(),
  }));

  saveSessions(sessions);
  return sessions;
}
