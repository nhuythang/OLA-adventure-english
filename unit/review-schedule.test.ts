import { describe, expect, it } from "vitest";

import { applyAttempts, attemptKey, isDue, reviewPriority, type ItemStats } from "@/lib/progress/review-schedule";
import type { Attempt } from "@/lib/types";

const attempt = (overrides: Partial<Attempt> = {}): Attempt => ({
  skill: "listen",
  themeId: "weather",
  firstTryCorrect: true,
  hintsUsed: 0,
  itemId: "sunny",
  ...overrides,
});

describe("attemptKey", () => {
  it("namespaces by theme, matching remote.ts's item_id convention", () => {
    expect(attemptKey(attempt({ themeId: "weather", itemId: "sunny" }))).toBe("weather-sunny");
  });

  it("is null when the attempt carries no itemId (older/untracked call sites)", () => {
    expect(attemptKey(attempt({ itemId: undefined }))).toBeNull();
  });
});

describe("applyAttempts", () => {
  it("records a first-seen item with a correctStreak of 1 on a first-try-correct attempt", () => {
    const stats = applyAttempts({}, [attempt({ firstTryCorrect: true })], "2026-07-12");
    expect(stats["weather-sunny"]).toEqual({ lastSeen: "2026-07-12", correctStreak: 1 });
  });

  it("extends the streak on a repeated correct attempt", () => {
    const first = applyAttempts({}, [attempt()], "2026-07-01");
    const second = applyAttempts(first, [attempt()], "2026-07-05");
    expect(second["weather-sunny"]!.correctStreak).toBe(2);
    expect(second["weather-sunny"]!.lastSeen).toBe("2026-07-05");
  });

  it("resets the streak to 0 on a miss (not first-try-correct)", () => {
    const first = applyAttempts({}, [attempt({ firstTryCorrect: true })], "2026-07-01");
    const second = applyAttempts(first, [attempt({ firstTryCorrect: false })], "2026-07-02");
    expect(second["weather-sunny"]).toEqual({ lastSeen: "2026-07-02", correctStreak: 0 });
  });

  it("ignores attempts with no itemId and leaves other stats untouched", () => {
    const stats = applyAttempts({}, [attempt({ itemId: undefined })], "2026-07-01");
    expect(stats).toEqual({});
  });

  it("does not mutate the input stats object (pure)", () => {
    const stats: ItemStats = { "weather-sunny": { lastSeen: "2026-06-01", correctStreak: 1 } };
    const next = applyAttempts(stats, [attempt()], "2026-07-01");
    expect(stats["weather-sunny"]).toEqual({ lastSeen: "2026-06-01", correctStreak: 1 });
    expect(next).not.toBe(stats);
  });

  it("folds multiple attempts in one round, last one winning per item", () => {
    const stats = applyAttempts(
      {},
      [attempt({ itemId: "sunny", firstTryCorrect: true }), attempt({ itemId: "sunny", firstTryCorrect: false })],
      "2026-07-01",
    );
    expect(stats["weather-sunny"]!.correctStreak).toBe(0);
  });
});

describe("isDue", () => {
  it("a never-seen item is always due", () => {
    expect(isDue(undefined, "2026-07-12")).toBe(true);
  });

  it("a freshly-seen item (correctStreak 0) is due again the same day it was missed", () => {
    expect(isDue({ lastSeen: "2026-07-12", correctStreak: 0 }, "2026-07-12")).toBe(true);
  });

  it("a 1-correct-streak item isn't due until a day has passed", () => {
    const stat = { lastSeen: "2026-07-12", correctStreak: 1 };
    expect(isDue(stat, "2026-07-12")).toBe(false);
    expect(isDue(stat, "2026-07-13")).toBe(true);
  });

  it("a well-known (correctStreak 4+) item isn't due until 14 days pass", () => {
    const stat = { lastSeen: "2026-07-01", correctStreak: 5 };
    expect(isDue(stat, "2026-07-14")).toBe(false);
    expect(isDue(stat, "2026-07-15")).toBe(true);
  });
});

describe("reviewPriority", () => {
  it("ranks never-seen items above any seen item", () => {
    const seen = reviewPriority({ lastSeen: "2026-01-01", correctStreak: 0 }, "2026-07-12");
    expect(reviewPriority(undefined, "2026-07-12")).toBeGreaterThan(seen);
  });

  it("ranks a more-overdue item above a less-overdue one", () => {
    const veryOverdue = reviewPriority({ lastSeen: "2026-06-01", correctStreak: 0 }, "2026-07-12");
    const justOverdue = reviewPriority({ lastSeen: "2026-07-11", correctStreak: 0 }, "2026-07-12");
    expect(veryOverdue).toBeGreaterThan(justOverdue);
  });

  it("among equally-overdue items, ranks the weaker (lower correctStreak) one higher", () => {
    const weak = reviewPriority({ lastSeen: "2026-07-01", correctStreak: 0 }, "2026-07-12");
    const strong = reviewPriority({ lastSeen: "2026-06-28", correctStreak: 3 }, "2026-07-12");
    // Both are ~11 days past their due interval (0-box vs 3-box), so overdue-ness
    // is close; the weaker item's lower correctStreak should still edge it ahead.
    expect(weak).toBeGreaterThan(strong);
  });

  it("a not-yet-due item ranks lowest", () => {
    const fresh = reviewPriority({ lastSeen: "2026-07-12", correctStreak: 2 }, "2026-07-12");
    const due = reviewPriority({ lastSeen: "2026-06-01", correctStreak: 0 }, "2026-07-12");
    expect(due).toBeGreaterThan(fresh);
  });
});
