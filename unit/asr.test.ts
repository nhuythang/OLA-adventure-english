import { describe, it, expect } from "vitest";
import { normalize, similarity, looseMatch, isAsrAvailable } from "@/lib/asr";

describe("normalize", () => {
  it("lowercases, strips punctuation and collapses whitespace", () => {
    // Punctuation becomes a space (preserves word boundaries), then collapses.
    expect(normalize("  It's  SUNNY! ")).toBe("it s sunny");
  });
});

describe("looseMatch", () => {
  it("accepts an exact word", () => {
    expect(looseMatch("sunny", "sunny")).toBe(true);
  });

  it("accepts the target inside a spoken phrase", () => {
    expect(looseMatch("it's sunny today", "sunny")).toBe(true);
  });

  it("accepts a near-miss from an accented speaker", () => {
    // "sunny" heard as "sunnee" / "funny" — should still pass generously.
    expect(looseMatch("sunnee", "sunny")).toBe(true);
  });

  it("is case- and punctuation-insensitive", () => {
    expect(looseMatch("Sunny!", "sunny")).toBe(true);
  });

  it("rejects a clearly different word", () => {
    expect(looseMatch("elephant", "sunny")).toBe(false);
  });

  it("rejects empty input", () => {
    expect(looseMatch("", "sunny")).toBe(false);
  });
});

describe("similarity", () => {
  it("is 1 for identical strings and 0 for empty", () => {
    expect(similarity("rainy", "rainy")).toBe(1);
    expect(similarity("", "rainy")).toBe(0);
  });
});

describe("isAsrAvailable", () => {
  it("is false in a non-browser (node) environment", () => {
    expect(isAsrAvailable()).toBe(false);
  });
});
