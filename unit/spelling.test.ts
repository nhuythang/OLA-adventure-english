import { describe, it, expect } from "vitest";
import { buildTiles, isComplete, isCorrect, spelled } from "@/lib/engine/spelling";

describe("buildTiles", () => {
  it("includes every letter after the first, plus distractors", () => {
    const tiles = buildTiles("sunny", 2, () => 0); // deterministic rng
    const letters = tiles.map((t) => t.letter).sort();
    // "sunny" → needed u,n,n,y (4) + 2 fillers = 6 tiles
    expect(tiles).toHaveLength(6);
    expect(letters).toEqual(expect.arrayContaining(["u", "n", "n", "y"]));
  });

  it("gives every tile a unique id even for duplicate letters", () => {
    const tiles = buildTiles("sunny", 0);
    expect(new Set(tiles.map((t) => t.id)).size).toBe(tiles.length);
    expect(tiles.filter((t) => t.letter === "n")).toHaveLength(2);
  });

  it("never adds a distractor that is already in the word", () => {
    const tiles = buildTiles("cold", 3, () => 0);
    const fillers = tiles.map((t) => t.letter).filter((l) => !"cold".includes(l));
    for (const f of fillers) expect("cold".includes(f)).toBe(false);
  });
});

describe("isComplete / spelled / isCorrect", () => {
  it("isComplete is true only when no slot is null", () => {
    expect(isComplete(["s", "u", null])).toBe(false);
    expect(isComplete(["s", "u", "n"])).toBe(true);
  });

  it("spelled joins the placed letters", () => {
    expect(spelled(["s", "u", "n"])).toBe("sun");
  });

  it("isCorrect matches the full word", () => {
    expect(isCorrect(["h", "o", "t"], "hot")).toBe(true);
    expect(isCorrect(["h", "o", "t"], "hat")).toBe(false);
    expect(isCorrect(["h", "o", null], "hot")).toBe(false);
  });
});
