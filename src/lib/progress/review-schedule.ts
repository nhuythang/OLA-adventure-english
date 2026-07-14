// Pure spaced-review scheduling (G5) — a Leitner-style "last-seen + accuracy"
// heuristic, no AI/knowledge-tracing (CLAUDE.md: no paid APIs, solo-maintainable).
// Replaces "any random word from a mastered theme" review picks with "the word
// that's actually due, weighted toward ones the child is still shaky on."
//
// Keys are the SAME composite item id remote.ts already writes to
// learning_attempts.item_id (`${themeId}-${itemId}`) — see storage.ts /
// remote.ts. Dates are local calendar days as "YYYY-MM-DD" (see streak.ts).
import type { Attempt } from "@/lib/types";

export interface ItemStat {
  /** Last calendar day this item was attempted. */
  lastSeen: string;
  /** Consecutive first-try-correct attempts; any miss resets it to 0. */
  correctStreak: number;
}

export type ItemStats = Record<string, ItemStat>;

// How many days must pass before an item at a given correctStreak is due
// again. Index = min(correctStreak, length - 1) — a "box" per Leitner system.
const DUE_INTERVAL_DAYS = [0, 1, 3, 7, 14] as const;

function dueIntervalDays(correctStreak: number): number {
  const box = Math.min(Math.max(correctStreak, 0), DUE_INTERVAL_DAYS.length - 1);
  return DUE_INTERVAL_DAYS[box]!;
}

// Whole calendar days between two "YYYY-MM-DD" strings (UTC midnight math,
// like streak.ts's dayBefore — avoids DST half-day drift).
function daysBetween(from: string, to: string): number {
  const parse = (iso: string) => {
    const [y, m, d] = iso.split("-").map(Number);
    return Date.UTC(y ?? 1970, (m ?? 1) - 1, d ?? 1);
  };
  return Math.round((parse(to) - parse(from)) / 86_400_000);
}

/** True when an item is due: never seen, or its box's interval has elapsed. */
export function isDue(stat: ItemStat | undefined, today: string): boolean {
  if (!stat) return true;
  return daysBetween(stat.lastSeen, today) >= dueIntervalDays(stat.correctStreak);
}

// A large FINITE sentinel (not Infinity — Infinity - Infinity is NaN, which
// would make a sort comparator undefined-behavior whenever two candidates are
// both never-seen, e.g. before any itemStats exist at all) safely above any
// realistic overdueDays*100 - correctStreak value.
const NEVER_SEEN_PRIORITY = 1_000_000;

// Sort key for ranking review candidates, highest first: never-seen items win
// outright; among seen items, more-overdue-and-weaker items rank above
// less-overdue-and-stronger ones. Not-due (fresh) items sort last.
export function reviewPriority(stat: ItemStat | undefined, today: string): number {
  if (!stat) return NEVER_SEEN_PRIORITY;
  const overdueDays = daysBetween(stat.lastSeen, today) - dueIntervalDays(stat.correctStreak);
  return overdueDays * 100 - stat.correctStreak;
}

// The composite key an Attempt maps to in ItemStats — matches remote.ts's
// `item_id: ${themeId}-${itemId}` convention exactly, so the same key reads
// back the same item whether it came from a live round or a Supabase re-load.
export function attemptKey(attempt: Attempt): string | null {
  return attempt.itemId ? `${attempt.themeId}-${attempt.itemId}` : null;
}

export interface ReviewEvent {
  /** Already-composite item key (see attemptKey). */
  key: string;
  firstTryCorrect: boolean;
  /** The calendar day this event happened. */
  date: string;
}

// Pure transition: fold already-keyed events into the running per-item
// stats, in order. A correct-first-try event extends the streak (deeper
// Leitner box, longer until due again); a miss resets it to 0 (due again
// tomorrow). Shared by applyAttempts (local rounds) and remote.ts's Supabase
// load (learning_attempts rows already carry the composite item_id).
export function applyEvents(stats: ItemStats, events: readonly ReviewEvent[]): ItemStats {
  let next = stats;
  for (const e of events) {
    const prev = next[e.key];
    const correctStreak = e.firstTryCorrect ? (prev?.correctStreak ?? 0) + 1 : 0;
    if (next === stats) next = { ...stats };
    next[e.key] = { lastSeen: e.date, correctStreak };
  }
  return next;
}

// Pure transition: fold a round's attempts into the running per-item stats.
export function applyAttempts(stats: ItemStats, attempts: readonly Attempt[], today: string): ItemStats {
  const events: ReviewEvent[] = [];
  for (const a of attempts) {
    const key = attemptKey(a);
    if (key) events.push({ key, firstTryCorrect: a.firstTryCorrect, date: today });
  }
  return applyEvents(stats, events);
}
