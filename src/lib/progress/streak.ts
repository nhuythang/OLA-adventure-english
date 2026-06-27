// Pure consecutive-day streak logic (task 23). A streak is a gentle habit nudge —
// it grows when the child plays on consecutive calendar days and quietly resets
// after a gap (no penalty, spec §6 / CLAUDE.md). Crossing a milestone earns one
// bonus sticker. Dates are local calendar days as "YYYY-MM-DD".

export const STREAK_MILESTONES = [3, 7, 14, 30];

export interface StreakState {
  /** Last calendar day the child played, or null if never. */
  lastActiveDate: string | null;
  /** Consecutive-day count, ≥ 0. */
  streak: number;
}

export interface StreakResult {
  state: StreakState;
  /** True when `today` is a new active day (vs. already counted today). */
  advanced: boolean;
  /** A milestone first reached on this advance, else null (→ bonus sticker). */
  reachedMilestone: number | null;
}

/** Today as a local "YYYY-MM-DD" (client-only — uses the device clock). */
export function todayISO(): string {
  const now = new Date();
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, "0");
  const d = String(now.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

/** The calendar day before `iso`. Pure (UTC math) so it's unit-testable. */
export function dayBefore(iso: string): string {
  const [y, m, d] = iso.split("-").map(Number);
  const dt = new Date(Date.UTC(y ?? 1970, (m ?? 1) - 1, d ?? 1));
  dt.setUTCDate(dt.getUTCDate() - 1);
  return dt.toISOString().slice(0, 10);
}

// Advance the streak for a day of activity. Same-day replays don't change it;
// a consecutive day increments it; any gap resets it to 1.
export function updateStreak(
  prev: StreakState,
  today: string,
  awardedMilestones: readonly number[],
): StreakResult {
  if (prev.lastActiveDate === today) {
    return { state: prev, advanced: false, reachedMilestone: null };
  }
  const streak = prev.lastActiveDate === dayBefore(today) ? prev.streak + 1 : 1;
  const reachedMilestone = STREAK_MILESTONES.find((m) => m === streak && !awardedMilestones.includes(m)) ?? null;
  return { state: { lastActiveDate: today, streak }, advanced: true, reachedMilestone };
}
