import { describe, it, expect } from "vitest";
import { shuffle, buildChoices, type Rng } from "@/lib/engine/choices";

// A deterministic RNG cycling through fixed values for repeatable assertions.
function seq(values: number[]): Rng {
  let i = 0;
  return () => values[i++ % values.length] as number;
}

describe("shuffle", () => {
  it("preserves all elements without mutating the input", () => {
    const input = [1, 2, 3, 4, 5];
    const out = shuffle(input);
    expect(out.slice().sort()).toEqual(input);
    expect(input).toEqual([1, 2, 3, 4, 5]);
  });

  it("is deterministic under a fixed RNG", () => {
    const a = shuffle([1, 2, 3, 4], seq([0.1, 0.9, 0.3]));
    const b = shuffle([1, 2, 3, 4], seq([0.1, 0.9, 0.3]));
    expect(a).toEqual(b);
  });
});

describe("buildChoices", () => {
  it("always includes the correct answer", () => {
    const out = buildChoices("sunny", ["rainy", "windy", "cloudy"], 3);
    expect(out).toContain("sunny");
  });

  it("returns exactly `count` options", () => {
    expect(buildChoices("sunny", ["rainy", "windy", "cloudy"], 2)).toHaveLength(2);
    expect(buildChoices("sunny", ["rainy", "windy", "cloudy"], 4)).toHaveLength(4);
  });

  it("does not fix the correct answer's position across questions", () => {
    const pool = ["rainy", "windy", "cloudy", "snowy"];
    const positions = new Set<number>();
    for (let i = 0; i < 40; i++) {
      positions.add(buildChoices("sunny", pool, 3).indexOf("sunny"));
    }
    // Over many draws the answer should land in more than one slot.
    expect(positions.size).toBeGreaterThan(1);
  });

  it("never returns duplicates", () => {
    const out = buildChoices("sunny", ["rainy", "windy", "cloudy"], 4);
    expect(new Set(out).size).toBe(out.length);
  });
});
