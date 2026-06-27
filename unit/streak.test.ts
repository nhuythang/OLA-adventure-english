import { describe, expect, it } from "vitest";

import { dayBefore, updateStreak, type StreakState } from "@/lib/progress/streak";

describe("dayBefore", () => {
  it("returns the previous calendar day", () => {
    expect(dayBefore("2026-06-27")).toBe("2026-06-26");
  });
  it("handles month and year boundaries", () => {
    expect(dayBefore("2026-03-01")).toBe("2026-02-28");
    expect(dayBefore("2026-01-01")).toBe("2025-12-31");
  });
});

const fresh: StreakState = { lastActiveDate: null, streak: 0 };

describe("updateStreak", () => {
  it("starts a streak at 1 on the first play", () => {
    const r = updateStreak(fresh, "2026-06-27", []);
    expect(r.advanced).toBe(true);
    expect(r.state).toEqual({ lastActiveDate: "2026-06-27", streak: 1 });
    expect(r.reachedMilestone).toBeNull();
  });

  it("does not change on a same-day replay", () => {
    const prev: StreakState = { lastActiveDate: "2026-06-27", streak: 2 };
    const r = updateStreak(prev, "2026-06-27", []);
    expect(r.advanced).toBe(false);
    expect(r.state).toBe(prev);
    expect(r.reachedMilestone).toBeNull();
  });

  it("increments on a consecutive day", () => {
    const r = updateStreak({ lastActiveDate: "2026-06-26", streak: 2 }, "2026-06-27", []);
    expect(r.state.streak).toBe(3);
  });

  it("resets to 1 after a gap (no penalty)", () => {
    const r = updateStreak({ lastActiveDate: "2026-06-20", streak: 5 }, "2026-06-27", []);
    expect(r.state.streak).toBe(1);
  });

  it("flags a milestone the first time it is reached", () => {
    const r = updateStreak({ lastActiveDate: "2026-06-26", streak: 2 }, "2026-06-27", []);
    expect(r.reachedMilestone).toBe(3);
  });

  it("does not re-flag an already-awarded milestone", () => {
    const r = updateStreak({ lastActiveDate: "2026-06-26", streak: 2 }, "2026-06-27", [3]);
    expect(r.state.streak).toBe(3);
    expect(r.reachedMilestone).toBeNull();
  });
});
