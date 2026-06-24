import { describe, it, expect } from "vitest";
import { firstTryAccuracy, meetsMastery, MASTERY_THRESHOLD } from "@/lib/engine/scoring";
import type { Attempt } from "@/lib/types";

function attempt(firstTryCorrect: boolean): Attempt {
  return { skill: "listen", themeId: "weather", firstTryCorrect, hintsUsed: firstTryCorrect ? 0 : 1 };
}

describe("firstTryAccuracy", () => {
  it("counts only first-try-correct taps", () => {
    // 3 of 4 correct on the first try → 0.75, regardless of later retries.
    const attempts = [attempt(true), attempt(false), attempt(true), attempt(true)];
    expect(firstTryAccuracy(attempts)).toBeCloseTo(0.75);
  });

  it("is 0 for no attempts", () => {
    expect(firstTryAccuracy([])).toBe(0);
  });

  it("treats a 2nd-choice success as not correct (no guess-spam credit)", () => {
    // A child who missed every first tap but eventually completed every round
    // still scores 0 — completion is not mastery.
    const attempts = [attempt(false), attempt(false), attempt(false)];
    expect(firstTryAccuracy(attempts)).toBe(0);
  });
});

describe("meetsMastery", () => {
  it("passes at the ≈80% threshold (4 of 5)", () => {
    const attempts = [attempt(true), attempt(true), attempt(true), attempt(true), attempt(false)];
    expect(firstTryAccuracy(attempts)).toBeCloseTo(0.8);
    expect(meetsMastery(attempts)).toBe(true);
  });

  it("fails below threshold (3 of 5)", () => {
    const attempts = [attempt(true), attempt(true), attempt(true), attempt(false), attempt(false)];
    expect(meetsMastery(attempts)).toBe(false);
  });

  it("is false for no attempts", () => {
    expect(meetsMastery([])).toBe(false);
  });

  it("uses 0.8 as the default threshold", () => {
    expect(MASTERY_THRESHOLD).toBe(0.8);
  });
});
